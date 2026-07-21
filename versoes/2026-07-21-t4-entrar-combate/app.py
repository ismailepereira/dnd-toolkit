import json
import math
import os
import re
import secrets
import uuid
from datetime import datetime, timezone, timedelta
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Pasta de dados do modo local. Sobrepor com a env DATA_DIR permite que
# testes automatizados usem uma pasta descartável SEM tocar na data/ real.
DATA_DIR = os.environ.get('DATA_DIR') or os.path.join(BASE_DIR, 'data')
DATA_FILE = os.path.join(DATA_DIR, 'estado.json')

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'troque-esta-chave-em-producao')
# Fase 18.3: trava o tamanho de qualquer corpo de requisição (fichas/aventuras/
# lojas/etc. são só texto/JSON — 2 MB é generoso mesmo para o maior estado).
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024


@app.errorhandler(413)
def payload_grande(_erro):
    return jsonify({'erro': 'payload_grande', 'detalhe': 'Requisição maior que o limite permitido (2 MB).'}), 413


# ---------------------------------------------------------------
# Cache-busting dos estáticos: acrescenta ?v=<mtime> a TODO url_for('static').
# Assim, sempre que um CSS/JS muda (deploy novo), o browser busca a versão
# nova em vez de servir a cacheada — sem precisar de Ctrl+F5 nem tocar nos
# templates. Cada ficheiro é versionado pela própria data de modificação,
# então só o que mudou é rebaixado. Falha silenciosa se o ficheiro sumir.
# ---------------------------------------------------------------
_STATIC_V_CACHE = {}


@app.url_defaults
def _versionar_estaticos(endpoint, values):
    if endpoint != 'static' or not values.get('filename'):
        return
    nome = values['filename']
    v = _STATIC_V_CACHE.get(nome)
    if v is None:
        try:
            v = int(os.path.getmtime(os.path.join(app.static_folder, nome)))
        except OSError:
            v = 0
        # em produção o mtime não muda entre requisições; cacheia para não
        # tocar o disco a cada url_for. (Local, um restart pega o novo valor.)
        if not app.debug:
            _STATIC_V_CACHE[nome] = v
    if v:
        values['v'] = v

# Credenciais
USUARIOS = {
    os.environ.get('MESTRE_USER', 'Ismaile'): {
        'senha': os.environ.get('MESTRE_SENHA', '99129863'),
        'papel': 'mestre',
    },
    os.environ.get('JOGADOR_USER', 'jogador'): {
        'senha': os.environ.get('JOGADOR_SENHA', 'dnd2024'),
        'papel': 'jogador',
    },
}

ESTADO_PADRAO = {
    'fichas': [],
    'monstros_visiveis': [],
    'combate': {'combatentes': [], 'turno': 0, 'rodada': 1, 'log': [], 'mapa': None},  # Fase 14: mapa opcional
    'notas': [],       # notas/handouts do Mestre (com flag 'compartilhada' p/ jogadores)
    'encontros': [],   # encontros salvos do montador (lançáveis no combate)
    'itens_mestre': [],  # itens mágicos criados pelo Mestre (fora do acervo/loja do jogador)
    'loja_especial_campanha': False,  # Fase 9: libera a Loja Especial (itens mágicos) p/ toda a campanha
    'loja_especial_itens': [],  # Fase 9c: itens CURADOS pelo Mestre na Loja Especial [{nome, precoPO}]
    'npcs': [],  # Fase 11: NPCs persistentes da campanha (lojista/aliado/inimigo/neutro)
    'lojas': [],  # Fase 12: lojas geridas por NPC lojista (estoque/preços próprios)
    'aventura_ativa': None,  # K2: progresso da aventura em curso (snapshot da definição + nó atual)
    'tabuleiro': {'aberto': False, 'imagemUrl': None, 'tokens': {}, 'monstros': {}, 'travado': False, 'atualizadoEm': None},  # Fase 16.2–16.5: mapa + tokens (PJ/monstro, pos %, tam) + trava dos jogadores
}

# ---------------------------------------------------------------
# Firestore (persistência + tempo real). Fallback: arquivo JSON local.
# Credencial: env FIREBASE_KEY_JSON (produção) ou firebase-key.json (local).
# ---------------------------------------------------------------
db = None
# Modo local: USE_LOCAL_DB=1 no .env ignora o Firestore e usa data/estado.json.
# Serve para desenvolver/testar sem tocar na campanha real e sem precisar de deploy.
USE_LOCAL_DB = os.environ.get('USE_LOCAL_DB', '').lower() in ('1', 'true', 'sim', 'yes')
if USE_LOCAL_DB:
    print('[DB] Modo LOCAL ativo (USE_LOCAL_DB) — usando data/estado.json, Firestore ignorado.')
try:
    if USE_LOCAL_DB:
        raise RuntimeError('modo local forçado')
    import firebase_admin
    from firebase_admin import credentials, firestore

    _cred = None
    _key_json = os.environ.get('FIREBASE_KEY_JSON')
    # caminhos possíveis do arquivo: Secret File do Render e arquivo local
    _arquivos = [
        '/etc/secrets/firebase-key.json',                 # Render Secret File
        os.path.join(BASE_DIR, 'firebase-key.json'),      # local
    ]
    if _key_json:
        _cred = credentials.Certificate(json.loads(_key_json))
    else:
        for _f in _arquivos:
            if os.path.exists(_f):
                _cred = credentials.Certificate(_f)
                break

    if _cred:
        firebase_admin.initialize_app(_cred)
        db = firestore.client()
        print('[Firebase] Firestore conectado.')
    else:
        print('[Firebase] Sem credencial — usando arquivo local.')
except Exception as e:  # pragma: no cover
    if not USE_LOCAL_DB:
        print('[Firebase] Indisponível, usando arquivo local:', e)
    db = None

COLECAO_CAMPANHA = 'campanha'
# Fase 18.2: projeção pública (sem notasPrivadas/notas não-compartilhadas) que
# o RT do JOGADOR escuta — ver _estado_publico(). O Mestre continua a ler o
# doc completo (COLECAO_CAMPANHA) via RT; só ele tem acesso pelas Regras.
COLECAO_CAMPANHA_PUBLICA = 'campanha_publica'


def campanha_atual():
    """ID da mesa ativa (multi-campanha). Sanitizado; padrão 'principal'."""
    c = re.sub(r'[^a-zA-Z0-9_-]', '', str(session.get('campanha', 'principal')))
    return c or 'principal'


# ---------------------------------------------------------------
# FASE 10 — contas registadas (auto-registo) e campanhas com membros
# Persistência: Firestore (coleções 'usuarios' e 'campanhas_meta') com
# fallback local em data/usuarios.json e data/campanhas_meta.json.
# As contas fixas de env (Ismaile/jogador) continuam a funcionar (legado):
# o mestre legado é mestre em QUALQUER campanha.
# ---------------------------------------------------------------
USUARIOS_FILE = os.path.join(DATA_DIR, 'usuarios.json')
CAMPMETA_FILE = os.path.join(DATA_DIR, 'campanhas_meta.json')
COLECAO_USUARIOS = 'usuarios'
COLECAO_CAMPANHAS_META = 'campanhas_meta'


def _agora():
    return datetime.now(timezone.utc).isoformat()


def _carregar_docs(colecao, caminho):
    """dict id -> dados, do Firestore ou do ficheiro local."""
    if db is not None:
        return {snap.id: (snap.to_dict() or {}) for snap in db.collection(colecao).stream()}
    if not os.path.exists(caminho):
        return {}
    with open(caminho, 'r', encoding='utf-8-sig') as f:
        return json.load(f)


def _salvar_doc(colecao, caminho, doc_id, dados):
    if db is not None:
        db.collection(colecao).document(doc_id).set(dados)
        return
    todos = _carregar_docs(colecao, caminho)
    todos[doc_id] = dados
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(todos, f, ensure_ascii=False, indent=2)


def carregar_usuarios_reg():
    return _carregar_docs(COLECAO_USUARIOS, USUARIOS_FILE)


def salvar_usuario_reg(uid, dados):
    _salvar_doc(COLECAO_USUARIOS, USUARIOS_FILE, uid, dados)


def buscar_usuario_reg(nome):
    nome = (nome or '').strip().lower()
    for uid, u in carregar_usuarios_reg().items():
        if str(u.get('usuario', '')).lower() == nome:
            return uid, u
    return None, None


def carregar_campanhas_meta():
    return _carregar_docs(COLECAO_CAMPANHAS_META, CAMPMETA_FILE)


def salvar_campanha_meta(camp_id, meta):
    _salvar_doc(COLECAO_CAMPANHAS_META, CAMPMETA_FILE, camp_id, meta)


def campanha_paga_em_dia(meta):
    """Fase 23.3: a campanha aceita escritas? True se paga em dia (pagaAte no
    futuro), OU se é legada (sem meta, ex.: 'principal'), OU se o dono é o
    mestre legado (admin — nunca cobrado)."""
    if MODO_LIVRE:
        return True  # modo livre temporário: nenhuma campanha fica só-leitura
    if not meta:
        return True  # campanha legada sem metadados (mestre fixo de env)
    if str(meta.get('mestreUid', '')).startswith('legacy:'):
        return True  # campanha do mestre legado (admin) — fora da cobrança
    pa = meta.get('pagaAte')
    if not pa:
        return False
    try:
        return datetime.fromisoformat(pa) > datetime.now(timezone.utc)
    except ValueError:
        return False


def campanha_ativa_para_escrita(camp_id):
    return campanha_paga_em_dia(carregar_campanhas_meta().get(camp_id))


def campanha_cobravel(camp_id):
    """True se a campanha é um produto pago (tem meta e o dono NÃO é o mestre
    legado). As legadas/'principal' ficam fora dos limites de produto (23.4)."""
    if MODO_LIVRE:
        return False  # modo livre temporário: sem limite de fichas nem cobrança por campanha
    meta = carregar_campanhas_meta().get(camp_id)
    return bool(meta) and not str(meta.get('mestreUid', '')).startswith('legacy:')


# Antecedentes EXCLUSIVOS de campanha: os de módulo/campanha pré-pronta (ex.:
# "Recruta da Milícia (Ninho da Rainha Dragão)") só podem ser usados por UM PJ
# por campanha. O critério é o sufixo "(Módulo)" — nenhum antecedente do PHB
# tem parênteses no nome (Soldado, Acólito, etc.). Mesmo critério do cliente
# (fontes.js antecedenteExclusivo), sem o servidor precisar conhecer fontes.js.
_ANTECEDENTE_EXCLUSIVO_RE = re.compile(r'\(.+\)\s*$')


def _antecedentes_exclusivos_dup(fichas):
    """Conjunto de antecedentes exclusivos usados por MAIS DE UMA ficha na lista."""
    cont = {}
    for f in fichas:
        if not isinstance(f, dict):
            continue
        a = f.get('antecedente')
        if isinstance(a, str) and _ANTECEDENTE_EXCLUSIVO_RE.search(a):
            cont[a] = cont.get(a, 0) + 1
    return {a for a, n in cont.items() if n > 1}


# ---------------------------------------------------------------
# FASE 23.5 — ciclo de vida da campanha (verificação LAZY, sem cron):
# "só expirar" (nunca auto-debita — o dono renova à mão) + retenção de
# RETENCAO_DIAS: a campanha inativa é guardada 6 meses e depois APAGADA.
# ---------------------------------------------------------------
def _deletar_doc(colecao, caminho, doc_id):
    if db is not None:
        db.collection(colecao).document(doc_id).delete()
        return
    todos = _carregar_docs(colecao, caminho)
    if doc_id in todos:
        del todos[doc_id]
        os.makedirs(os.path.dirname(caminho), exist_ok=True)
        with open(caminho, 'w', encoding='utf-8') as f:
            json.dump(todos, f, ensure_ascii=False, indent=2)


def deletar_campanha(cid):
    """Apaga a campanha e TODO o seu estado (meta + estado privado + público).
    Destrutivo e irreversível — só chamado quando a retenção esgota. Nunca
    apaga a 'principal' (é a mesa legada do mestre fixo)."""
    if cid == 'principal':
        return False
    _deletar_doc(COLECAO_CAMPANHAS_META, CAMPMETA_FILE, cid)
    if db is not None:
        db.collection(COLECAO_CAMPANHA).document(cid).delete()
        db.collection(COLECAO_CAMPANHA_PUBLICA).document(cid).delete()
    else:
        p = os.path.join(DATA_DIR, f'estado_{cid}.json')
        if os.path.exists(p):
            os.remove(p)
    print(f'[23.5] campanha {cid} apagada (retenção de {RETENCAO_DIAS} dias esgotada)')
    return True


def dias_ate_apagar(meta):
    """Dias restantes até a exclusão de uma campanha inativa (ou None)."""
    ini = (meta or {}).get('inativaDesde')
    if not ini:
        return None
    try:
        base = datetime.fromisoformat(ini)
    except (ValueError, TypeError):
        return None
    restante = (base + timedelta(days=RETENCAO_DIAS)) - datetime.now(timezone.utc)
    return max(0, restante.days)


def ciclo_campanha(cid, meta):
    """Transições de ciclo de vida de UMA campanha paga (lazy). Marca
    `inativaDesde` no 1º acesso após vencer; apaga após RETENCAO_DIAS inativa;
    limpa `inativaDesde` se voltou a ficar em dia. Devolve a meta (talvez
    atualizada) ou None se foi apagada. Campanhas legadas passam intactas."""
    if not meta or str(meta.get('mestreUid', '')).startswith('legacy:'):
        return meta
    if campanha_paga_em_dia(meta):
        if meta.get('inativaDesde'):
            meta.pop('inativaDesde', None)
            salvar_campanha_meta(cid, meta)
        return meta
    ini = meta.get('inativaDesde')
    if not ini:
        # começa a contar a retenção a partir do vencimento (pagaAte), se houver
        meta['inativaDesde'] = meta.get('pagaAte') or _agora()
        salvar_campanha_meta(cid, meta)
        return meta
    if dias_ate_apagar(meta) == 0:
        deletar_campanha(cid)
        return None
    return meta


def varrer_ciclo_campanhas():
    """Passa o ciclo em TODAS as campanhas (chamado lazy quando alguém abre a
    lista de campanhas). Sem cron: qualquer acesso limpa as vencidas."""
    for cid, meta in list(carregar_campanhas_meta().items()):
        ciclo_campanha(cid, meta)


def eh_legado_mestre(uid):
    return isinstance(uid, str) and uid.startswith('legacy:') and session.get('papelGlobal') == 'mestre'


def papel_na_campanha(uid, camp_id):
    """'mestre' | 'jogador' | None. Mestre legado manda em qualquer campanha;
    campanhas sem metadados (ex.: 'principal') são legadas: só contas fixas entram."""
    if eh_legado_mestre(uid):
        return 'mestre'
    metas = carregar_campanhas_meta()
    meta = metas.get(camp_id)
    if not meta:
        # campanha legada (sem meta): contas fixas mantêm o papel global antigo
        if isinstance(uid, str) and uid.startswith('legacy:'):
            return session.get('papelGlobal')
        return None
    if meta.get('mestreUid') == uid:
        return 'mestre'
    if uid in (meta.get('membros') or {}):
        return 'jogador'
    return None


def gerar_codigo_convite(nome):
    base = re.sub(r'[^A-Za-z]', '', nome or '')[:6].upper() or 'MESA'
    return f"{base}-{secrets.token_hex(2).upper()}"


# ---------------------------------------------------------------
# FASE 10.9 — ASSINATURA (manual): 3 dias grátis no registo; depois o
# acesso bloqueia até o admin (mestre legado) confirmar o pagamento no
# painel /admin/assinaturas. Sem gateway: o utilizador paga por Pix e
# envia o comprovante pelo contato configurado; a confirmação é manual.
# ---------------------------------------------------------------
TRIAL_DIAS = int(os.environ.get('TRIAL_DIAS', '3'))
ASSINATURA_PRECO = os.environ.get('ASSINATURA_PRECO', 'R$ 5,00/mês')
PIX_CHAVE = os.environ.get('PIX_CHAVE', '(chave Pix por configurar — env PIX_CHAVE)')
CONTATO_PAGAMENTO = os.environ.get('CONTATO_PAGAMENTO', '(contato por configurar — env CONTATO_PAGAMENTO)')

# FASE 23.2: preço dos créditos + gateway Pix AbacatePay (opcional; sem chave,
# a compra cai no Pix MANUAL). O Ismaile cria a conta e põe a chave no env —
# o Claude nunca vê/insere a credencial. Chave de dev (abc_dev_...) usa o
# sandbox e permite simular pagamento sem dinheiro real.
CREDITO_CENTAVOS = int(os.environ.get('CREDITO_CENTAVOS', '25'))     # 1 crédito = R$ 0,25
COMPRA_MIN_CREDITOS = int(os.environ.get('COMPRA_MIN_CREDITOS', '8'))  # mínimo R$ 2,00
ABACATEPAY_API_KEY = os.environ.get('ABACATEPAY_API_KEY', '').strip()
ABACATEPAY_WEBHOOK_SECRET = os.environ.get('ABACATEPAY_WEBHOOK_SECRET', '').strip()

# FASE 23.3: a campanha é o produto. Criar/renovar debita CAMPANHA_CREDITOS do
# dono e estende pagaAte por CAMPANHA_DIAS. Sem pagamento em dia, a campanha
# fica inativa (só-leitura). O mestre legado (admin) não é cobrado.
CAMPANHA_CREDITOS = int(os.environ.get('CAMPANHA_CREDITOS', '20'))  # R$ 5,00/mês
CAMPANHA_DIAS = int(os.environ.get('CAMPANHA_DIAS', '30'))
MAX_FICHAS_PJ = int(os.environ.get('MAX_FICHAS_PJ', '6'))  # Fase 23.4: 6 PJs por campanha paga
RETENCAO_DIAS = int(os.environ.get('RETENCAO_DIAS', '180'))  # Fase 23.5: 6 meses inativa → apaga
# Fase 23.7: bônus de boas-vindas — cada conta nova nasce com crédito suficiente
# para 1 aventura + 6 fichas, ou seja, 1 campanha completa (= CAMPANHA_CREDITOS).
CREDITO_INICIAL = int(os.environ.get('CREDITO_INICIAL', '20'))
# Fase 23.7: migração jogador-grátis. A cobrança é POR CAMPANHA (créditos, 23.3),
# então a assinatura plana de conta (Fase 10.9) nasce DESLIGADA. Só volta a
# trancar a app inteira se EXIGIR_ASSINATURA_PLANA=1 (rollback de emergência).
EXIGIR_ASSINATURA_PLANA = os.environ.get('EXIGIR_ASSINATURA_PLANA', '0') == '1'

# ---------------------------------------------------------------
# MODO LIVRE (TEMPORÁRIO — pedido do Ismaile em 2026-07-19): desliga TODA a
# limitação de jogo e a cobrança de créditos até segunda ordem. Com a chave
# ligada: campanhas nunca ficam inativas/só-leitura nem são apagadas por
# retenção, o limite de fichas por campanha não se aplica, e criar/renovar
# campanha é grátis (nenhum crédito é debitado; os saldos ficam intactos).
# PARA REATIVAR a cobrança: defina MODO_LIVRE=0 no ambiente (Render) — ou
# troque o padrão abaixo para '0' e faça deploy. Nada foi removido: todo o
# código de créditos/limites continua no lugar, só desviado por esta chave.
# ---------------------------------------------------------------
MODO_LIVRE = os.environ.get('MODO_LIVRE', '1') == '1'

_abacate = None


def _abacate_client():
    """Cliente AbacatePay (lazy). Devolve None se não houver chave configurada
    — nesse caso a compra usa o Pix manual (degradação suave)."""
    global _abacate
    if not ABACATEPAY_API_KEY:
        return None
    if _abacate is None:
        try:
            from abacatepay import AbacatePay
            _abacate = AbacatePay(ABACATEPAY_API_KEY)
        except Exception as e:  # pragma: no cover
            print('[AbacatePay] falha ao iniciar o cliente:', e)
            return None
    return _abacate


def carregar_usuario_reg(uid):
    """Um único utilizador (leitura barata por request, sem stream da coleção toda)."""
    if not uid or uid.startswith('legacy:'):
        return None
    if db is not None:
        snap = db.collection(COLECAO_USUARIOS).document(uid).get()
        return snap.to_dict() if snap.exists else None
    return carregar_usuarios_reg().get(uid)


def validar_cpf(cpf):
    """Valida os dígitos verificadores do CPF (rejeita sequências repetidas)."""
    cpf = re.sub(r'\D', '', cpf or '')
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return None
    for i in (9, 10):
        soma = sum(int(cpf[j]) * ((i + 1) - j) for j in range(i))
        dv = (soma * 10) % 11 % 10
        if dv != int(cpf[i]):
            return None
    return cpf


def assinatura_valida(u):
    """True se o utilizador registado pode usar a app (trial ou pagamento em dia)."""
    if not u or u.get('bloqueado'):
        return False
    agora = datetime.now(timezone.utc)
    for campo in ('pagaAte', 'trialAte'):
        v = u.get(campo)
        if v:
            try:
                if datetime.fromisoformat(v) > agora:
                    return True
            except ValueError:
                pass
    return False


def status_assinatura(u):
    if u.get('bloqueado'):
        return 'bloqueada'
    agora = datetime.now(timezone.utc)
    def _futuro(campo):
        v = u.get(campo)
        try:
            return bool(v) and datetime.fromisoformat(v) > agora
        except ValueError:
            return False
    if _futuro('pagaAte'):
        return 'ativa'
    if _futuro('trialAte'):
        return 'trial'
    if u.get('pagamentoInfo'):
        return 'aguardando'
    return 'expirada'


# ---------------------------------------------------------------
# FASE 23.1 — Carteira de créditos (moeda do produto: 1 crédito = R$ 0,25).
# Aditivo e retrocompatível: contas sem o campo têm saldo 0. O ledger guarda
# cada lançamento para o painel de admin e o histórico do utilizador.
# ---------------------------------------------------------------
def saldo_creditos(u):
    return int((u or {}).get('creditos') or 0)


def lancar_creditos(uid, delta, motivo, por='sistema'):
    """Credita/debita créditos de uma conta registada e regista no ledger.
    Nunca deixa o saldo negativo. Devolve (ok, saldo_final)."""
    u = carregar_usuario_reg(uid)
    if not u:
        return False, 0
    atual = saldo_creditos(u)
    novo = atual + int(delta)
    if novo < 0:
        return False, atual
    u['creditos'] = novo
    log = u.get('creditos_log') or []
    log.insert(0, {'delta': int(delta), 'motivo': str(motivo)[:120], 'por': por, 'em': _agora(), 'saldo': novo})
    u['creditos_log'] = log[:200]  # mantém os 200 lançamentos mais recentes
    salvar_usuario_reg(uid, u)
    return True, novo


# ----- FASE 23.2: compras de crédito (uma por cobrança Pix, keyed pelo id) -----
COLECAO_COMPRAS = 'compras'
COMPRAS_FILE = os.path.join(DATA_DIR, 'compras.json')


def _carregar_compra(pix_id):
    if not pix_id:
        return None
    if db is not None:
        snap = db.collection(COLECAO_COMPRAS).document(pix_id).get()
        return snap.to_dict() if snap.exists else None
    return _carregar_docs(COLECAO_COMPRAS, COMPRAS_FILE).get(pix_id)


def _salvar_compra(pix_id, dados):
    _salvar_doc(COLECAO_COMPRAS, COMPRAS_FILE, pix_id, dados)


def _extrair_pix_id(corpo):
    """Acha o id da cobrança no corpo do webhook (defensivo: a AbacatePay
    aninha os dados em 'data'; tentamos os caminhos conhecidos)."""
    d = (corpo or {}).get('data') or corpo or {}
    for cam in (d.get('pixQrCode'), d.get('billing'), d):
        if isinstance(cam, dict) and cam.get('id'):
            return cam['id']
    return None


def _confirmar_compra_se_paga(pix_id):
    """Idempotente e SEGURO: só credita se a AbacatePay confirmar PAID pelo
    check() (nunca confia só no corpo do webhook) e se ainda não foi creditado.
    Devolve o status atual."""
    compra = _carregar_compra(pix_id)
    if not compra:
        return 'desconhecida'
    if compra.get('creditadoEm'):
        return 'PAID'  # já creditado — não credita de novo
    st = compra.get('status', 'PENDING')
    cli = _abacate_client()
    if cli:
        try:
            st = cli.pixQrCode.check(pix_id).status
        except Exception as e:  # pragma: no cover
            print('[AbacatePay] check falhou:', e)
    compra['status'] = st
    if st == 'PAID':
        lancar_creditos(compra['uid'], int(compra['creditos']),
                        f"compra de {compra['creditos']} créditos (Pix)", por='pagamento')
        compra['creditadoEm'] = _agora()
    _salvar_compra(pix_id, compra)
    return st


def _mais_dias(base_iso, dias):
    """agora (ou a data futura existente, o que for maior) + N dias, em ISO."""
    agora = datetime.now(timezone.utc)
    base = agora
    if base_iso:
        try:
            existente = datetime.fromisoformat(base_iso)
            if existente > agora:
                base = existente
        except ValueError:
            pass
    from datetime import timedelta
    return (base + timedelta(days=dias)).isoformat()


def _data_file():
    c = campanha_atual()
    nome = 'estado.json' if c == 'principal' else f'estado_{c}.json'
    return os.path.join(DATA_DIR, nome)


def senha_confere(armazenada, fornecida):
    """Aceita senha em texto puro (padrão) ou hash do Werkzeug (produção)."""
    if isinstance(armazenada, str) and armazenada.startswith(('pbkdf2:', 'scrypt:')):
        return check_password_hash(armazenada, fornecida)
    return armazenada == fornecida


def carregar_estado():
    if db is not None:
        ref = db.collection(COLECAO_CAMPANHA).document(campanha_atual())
        snap = ref.get()
        if snap.exists:
            estado = snap.to_dict() or {}
        else:
            ref.set(ESTADO_PADRAO)
            db.collection(COLECAO_CAMPANHA_PUBLICA).document(campanha_atual()).set(ESTADO_PADRAO)
            estado = dict(ESTADO_PADRAO)
        for chave, valor in ESTADO_PADRAO.items():
            estado.setdefault(chave, valor)
        return estado
    # fallback: arquivo local
    caminho = _data_file()
    if not os.path.exists(caminho):
        salvar_estado(ESTADO_PADRAO)
    with open(caminho, 'r', encoding='utf-8-sig') as f:  # tolera BOM de editores Windows
        estado = json.load(f)
    for chave, valor in ESTADO_PADRAO.items():
        estado.setdefault(chave, valor)
    return estado


def _estado_publico(estado):
    """Fase 18.2: projeção do estado SEM os campos confidenciais do Mestre.
    O tempo real (Firestore) é lido DIRETO pelo cliente via SDK — não passa
    pelas rotas Flask, então o filtro que essas rotas já fazem (ver
    /api/npcs e /api/aventura_ativa) nunca chegava a proteger o RT: um
    jogador com o DevTools aberto lia `notasPrivadas` de NPCs e as notas
    do Mestre não compartilhadas direto do snapshot do Firestore. Esta
    função gera a cópia gravada em `campanha_publica/<id>` (ver
    salvar_estado) — é ISSO que `firebase-rt.js`/`jogador.js` escutam."""
    publico = dict(estado)
    publico['notas'] = [n for n in (estado.get('notas') or []) if isinstance(n, dict) and n.get('compartilhada')]
    publico['npcs'] = [{k: v for k, v in n.items() if k != 'notasPrivadas'}
                        for n in (estado.get('npcs') or []) if isinstance(n, dict)]
    return publico


def salvar_estado(estado):
    if db is not None:
        db.collection(COLECAO_CAMPANHA).document(campanha_atual()).set(estado)
        db.collection(COLECAO_CAMPANHA_PUBLICA).document(campanha_atual()).set(_estado_publico(estado))
        return
    caminho = _data_file()
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(estado, f, ensure_ascii=False, indent=2)


def login_obrigatorio(papeis=None, exigir_assinatura=True):
    def decorador(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if 'usuario' not in session:
                return redirect(url_for('login'))
            if papeis and session.get('papel') not in papeis:
                return redirect(url_for('index'))
            # Contas legadas de env não passam por aqui (uid 'legacy:*').
            uid = session.get('uid', '')
            if uid and not uid.startswith('legacy:'):
                u = carregar_usuario_reg(uid)
                # Bloqueio manual do admin: trava sempre, em qualquer modelo.
                if u and u.get('bloqueado'):
                    if request.path.startswith('/api/'):
                        return jsonify({'erro': 'bloqueado', 'detalhe': 'conta bloqueada'}), 403
                    return redirect(url_for('pagina_assinatura'))
                # Fase 23.7: jogador é grátis — a cobrança é por campanha (créditos).
                # A assinatura plana da Fase 10.9 fica desligada por padrão; só
                # tranca a app se EXIGIR_ASSINATURA_PLANA=1 (rollback).
                if (EXIGIR_ASSINATURA_PLANA and exigir_assinatura
                        and not assinatura_valida(u)):
                    if request.path.startswith('/api/'):
                        return jsonify({'erro': 'assinatura', 'detalhe': 'trial/assinatura expirada'}), 402
                    return redirect(url_for('pagina_assinatura'))
            # Fase 23.3: campanha sem pagamento em dia é só-leitura. Bloqueia as
            # escritas de estado (mutações em /api/*), menos as de crédito
            # (o dono precisa comprar créditos para renovar). Mestre legado passa.
            if (request.method in ('POST', 'PUT', 'PATCH', 'DELETE')
                    and request.path.startswith('/api/')
                    and not request.path.startswith('/api/creditos')
                    and not eh_legado_mestre(uid)
                    and not campanha_ativa_para_escrita(campanha_atual())):
                return jsonify({'erro': 'campanha_inativa',
                                'detalhe': 'campanha sem pagamento em dia (só-leitura); renove com 20 créditos'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorador


# ----- FASE 17.3: PWA (instalável + offline básico) -----
# O Service Worker precisa ser servido da RAIZ para controlar todo o app (o
# escopo padrão é a pasta do próprio ficheiro). Servimos static/sw.js em /sw.js
# com o header Service-Worker-Allowed. O manifest vai com o MIME correto.
# Ambos são públicos (o SW/manifest são buscados antes de qualquer login).
@app.route('/sw.js')
def service_worker():
    resp = app.send_static_file('sw.js')
    resp.headers['Content-Type'] = 'application/javascript'
    resp.headers['Service-Worker-Allowed'] = '/'
    resp.headers['Cache-Control'] = 'no-cache'
    return resp


@app.route('/manifest.webmanifest')
def web_manifest():
    resp = app.send_static_file('manifest.webmanifest')
    resp.headers['Content-Type'] = 'application/manifest+json'
    return resp


@app.route('/')
def index():
    if 'usuario' not in session:
        return redirect(url_for('login'))
    # contas registadas precisam de uma campanha ativa válida (senão: Minhas Campanhas)
    uid = session.get('uid', '')
    if uid and not uid.startswith('legacy:'):
        papel = papel_na_campanha(uid, campanha_atual())
        if not papel:
            return redirect(url_for('pagina_campanhas'))
        session['papel'] = papel
    if session.get('papel') == 'mestre':
        return redirect(url_for('mestre'))
    return redirect(url_for('jogador'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    erro = None
    if request.method == 'POST':
        usuario = request.form.get('usuario', '').strip()
        senha = request.form.get('senha', '')
        dados = USUARIOS.get(usuario)
        if dados and senha_confere(dados['senha'], senha):
            # contas fixas (legado): comportamento idêntico ao de sempre
            session['usuario'] = usuario
            session['papel'] = dados['papel']
            session['papelGlobal'] = dados['papel']
            session['uid'] = f'legacy:{usuario}'
            return redirect(url_for('index'))
        uid, u = buscar_usuario_reg(usuario)
        if u and senha_confere(u.get('senhaHash', ''), senha):
            session['usuario'] = u.get('usuario')
            session['nomeExibicao'] = u.get('nomeExibicao') or u.get('usuario')
            session['uid'] = uid
            session['papelGlobal'] = u.get('papelGlobal', 'jogador')
            session['papel'] = 'jogador'
            session.pop('campanha', None)  # escolhe a campanha ativa na tela seguinte
            return redirect(url_for('pagina_campanhas'))
        erro = 'Usuário ou senha inválidos.'
    return render_template('login.html', erro=erro)


@app.route('/registro', methods=['GET', 'POST'])
def registro():
    erro = None
    if request.method == 'POST':
        usuario = request.form.get('usuario', '').strip()
        senha = request.form.get('senha', '')
        nome = request.form.get('nome', '').strip() or usuario
        nome_completo = request.form.get('nomeCompleto', '').strip()
        email = request.form.get('email', '').strip().lower()
        cpf = validar_cpf(request.form.get('cpf', ''))
        whatsapp = re.sub(r'\D', '', request.form.get('whatsapp', ''))
        todos = carregar_usuarios_reg()
        if not re.fullmatch(r'[A-Za-z0-9_.-]{3,24}', usuario):
            erro = 'Usuário inválido: 3–24 caracteres, só letras/números/._-'
        elif len(senha) < 6:
            erro = 'A senha precisa de pelo menos 6 caracteres.'
        elif not nome_completo or len(nome_completo) < 5:
            erro = 'Informe seu nome completo.'
        elif not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email):
            erro = 'E-mail inválido.'
        elif not cpf:
            erro = 'CPF inválido — confira os dígitos.'
        elif usuario in USUARIOS or buscar_usuario_reg(usuario)[0]:
            erro = 'Esse usuário já existe.'
        elif any(u.get('email') == email for u in todos.values()):
            erro = 'Já existe uma conta com esse e-mail.'
        elif any(u.get('cpf') == cpf for u in todos.values()):
            erro = 'Já existe uma conta com esse CPF.'
        else:
            uid = 'u_' + uuid.uuid4().hex[:12]
            salvar_usuario_reg(uid, {
                'usuario': usuario,
                'nomeExibicao': nome,
                'nomeCompleto': nome_completo,
                'email': email,
                'cpf': cpf,
                'whatsapp': whatsapp,
                'senhaHash': generate_password_hash(senha),
                'papelGlobal': 'jogador',
                'criadoEm': _agora(),
                # Fase 10.9: acesso grátis de TRIAL_DIAS; depois bloqueia até
                # o admin confirmar o pagamento manualmente
                'trialAte': _mais_dias(None, TRIAL_DIAS),
                'pagaAte': None,
                'bloqueado': False,
                'pagamentoInfo': None,
                # Fase 23.7: bônus de boas-vindas — crédito para 1 campanha
                # completa (1 aventura + 6 fichas). Já gravado com o ledger.
                'creditos': CREDITO_INICIAL,
                'creditos_log': ([{'delta': CREDITO_INICIAL, 'saldo': CREDITO_INICIAL,
                                   'motivo': 'bonus de boas-vindas (1 aventura + 6 fichas)',
                                   'por': 'sistema', 'em': _agora()}] if CREDITO_INICIAL else []),
            })
            session.clear()
            session['usuario'] = usuario
            session['nomeExibicao'] = nome
            session['uid'] = uid
            session['papelGlobal'] = 'jogador'
            session['papel'] = 'jogador'
            return redirect(url_for('pagina_campanhas'))
    return render_template('registro.html', erro=erro, trial_dias=TRIAL_DIAS, preco=ASSINATURA_PRECO,
                           credito_inicial=CREDITO_INICIAL)


# ----- FASE 10.9: página de assinatura (trial expirado / pagamento manual) -----
@app.route('/assinatura', methods=['GET', 'POST'])
@login_obrigatorio(exigir_assinatura=False)
def pagina_assinatura():
    uid = session.get('uid', '')
    if uid.startswith('legacy:'):
        return redirect(url_for('index'))  # contas fixas não têm assinatura
    u = carregar_usuario_reg(uid)
    if not u:
        session.clear()
        return redirect(url_for('login'))
    msg = None
    if request.method == 'POST':
        # "Já paguei": guarda a informação para o admin conferir manualmente
        texto = request.form.get('info', '').strip()[:400]
        u['pagamentoInfo'] = {'texto': texto or '(sem detalhes)', 'em': _agora()}
        salvar_usuario_reg(uid, u)
        msg = 'Pagamento informado! O acesso libera assim que a confirmação manual for feita.'
    return render_template('assinatura.html',
                           usuario=session.get('nomeExibicao') or session.get('usuario'),
                           status=status_assinatura(u), trial_ate=u.get('trialAte'),
                           paga_ate=u.get('pagaAte'), pagamento_info=u.get('pagamentoInfo'),
                           preco=ASSINATURA_PRECO, pix=PIX_CHAVE, contato=CONTATO_PAGAMENTO,
                           trial_dias=TRIAL_DIAS, msg=msg)


# ----- FASE 23.1: saldo e histórico de créditos do próprio utilizador -----
@app.route('/api/creditos', methods=['GET'])
@login_obrigatorio(exigir_assinatura=False)
def api_creditos():
    uid = session.get('uid', '')
    if not uid or uid.startswith('legacy:'):
        return jsonify({'saldo': None, 'legado': True, 'historico': []})
    u = carregar_usuario_reg(uid) or {}
    return jsonify({'saldo': saldo_creditos(u), 'historico': (u.get('creditos_log') or [])[:50]})


# ----- FASE 23.2: comprar créditos (Pix via AbacatePay, com fallback manual) -----
@app.route('/creditos')
@login_obrigatorio(exigir_assinatura=False)
def pagina_creditos():
    uid = session.get('uid', '')
    if not uid or uid.startswith('legacy:'):
        return redirect(url_for('index'))
    u = carregar_usuario_reg(uid) or {}
    return render_template('creditos.html',
                           usuario=session.get('nomeExibicao') or session.get('usuario'),
                           saldo=saldo_creditos(u), automatico=bool(_abacate_client()),
                           credito_centavos=CREDITO_CENTAVOS, min_creditos=COMPRA_MIN_CREDITOS,
                           pix_chave=PIX_CHAVE, contato=CONTATO_PAGAMENTO)


@app.route('/api/creditos/comprar', methods=['POST'])
@login_obrigatorio(exigir_assinatura=False)
def api_comprar_creditos():
    uid = session.get('uid', '')
    if not uid or uid.startswith('legacy:'):
        return jsonify({'ok': False, 'erro': 'conta_legada'}), 400
    data = request.get_json(force=True) or {}
    try:
        creditos = int(data.get('creditos'))
    except (TypeError, ValueError):
        return jsonify({'ok': False, 'erro': 'quantidade_invalida'}), 400
    if creditos < COMPRA_MIN_CREDITOS:
        return jsonify({'ok': False, 'erro': 'minimo', 'min': COMPRA_MIN_CREDITOS}), 400
    if creditos > 100000:
        return jsonify({'ok': False, 'erro': 'quantidade_invalida'}), 400
    valor_cent = creditos * CREDITO_CENTAVOS
    cli = _abacate_client()
    if not cli:  # sem gateway: instrui o Pix manual (admin confirma → credita)
        return jsonify({'ok': True, 'automatico': False, 'manual': True,
                        'creditos': creditos, 'valorReais': valor_cent / 100})
    try:
        pix = cli.pixQrCode.create(amount=valor_cent, expires_in=3600,
                                   description=f"{creditos} creditos - D&D Toolkit")
    except Exception as e:  # pragma: no cover
        print('[AbacatePay] create falhou:', e)
        return jsonify({'ok': False, 'erro': 'gateway', 'detalhe': str(e)[:160]}), 502
    _salvar_compra(pix.id, {'uid': uid, 'creditos': creditos, 'valorCentavos': valor_cent,
                            'status': pix.status, 'devMode': pix.dev_mode,
                            'criadoEm': _agora(), 'creditadoEm': None})
    return jsonify({'ok': True, 'automatico': True, 'id': pix.id, 'brcode': pix.brcode,
                    'brcodeBase64': pix.brcode_base64, 'creditos': creditos,
                    'valorReais': valor_cent / 100, 'devMode': pix.dev_mode, 'expiraEm': pix.expires_at})


@app.route('/api/creditos/status')
@login_obrigatorio(exigir_assinatura=False)
def api_creditos_status():
    uid = session.get('uid', '')
    pix_id = request.args.get('id', '')
    compra = _carregar_compra(pix_id)
    if not compra or compra.get('uid') != uid:
        return jsonify({'ok': False, 'erro': 'nao_encontrada'}), 404
    st = _confirmar_compra_se_paga(pix_id)  # credita se a AbacatePay confirmar (idempotente)
    u = carregar_usuario_reg(uid) or {}
    return jsonify({'ok': True, 'status': st, 'saldo': saldo_creditos(u)})


@app.route('/api/creditos/simular', methods=['POST'])
@login_obrigatorio(exigir_assinatura=False)
def api_creditos_simular():
    """Só no modo de teste (chave de dev): simula o pagamento p/ validar o
    fluxo ponta a ponta sem dinheiro real. Em produção a AbacatePay rejeita."""
    uid = session.get('uid', '')
    pix_id = (request.get_json(force=True) or {}).get('id', '')
    compra = _carregar_compra(pix_id)
    if not compra or compra.get('uid') != uid:
        return jsonify({'ok': False, 'erro': 'nao_encontrada'}), 404
    cli = _abacate_client()
    if not cli:
        return jsonify({'ok': False, 'erro': 'sem_gateway'}), 400
    try:
        cli.pixQrCode.simulate(pix_id)
    except Exception as e:
        return jsonify({'ok': False, 'erro': 'simulacao', 'detalhe': str(e)[:160]}), 502
    st = _confirmar_compra_se_paga(pix_id)
    u = carregar_usuario_reg(uid) or {}
    return jsonify({'ok': True, 'status': st, 'saldo': saldo_creditos(u)})


@app.route('/api/pagamento/abacatepay/webhook', methods=['POST'])
def webhook_abacatepay():
    # Segredo no query string (método documentado da AbacatePay). Sem segredo
    # configurado ou divergente → 401. A confirmação real é feita por check().
    if not ABACATEPAY_WEBHOOK_SECRET or request.args.get('webhookSecret') != ABACATEPAY_WEBHOOK_SECRET:
        return jsonify({'ok': False}), 401
    pix_id = _extrair_pix_id(request.get_json(silent=True) or {})
    if pix_id:
        _confirmar_compra_se_paga(pix_id)
    return jsonify({'ok': True})  # sempre 200 para a AbacatePay não reenfileirar


# ----- FASE 23.9: dashboard de admin (gráficos de vendas, produtos, usuários) -----
def _dashboard_dados(dias=30):
    """Agrega métricas de negócio para o dashboard do admin (só mestre legado).
    Tudo vem dos dados já existentes: compras (Pix creditado), campanhas e os
    ledgers de créditos dos utilizadores. Não inventa números."""
    usuarios = carregar_usuarios_reg()
    metas = carregar_campanhas_meta()
    compras = _carregar_docs(COLECAO_COMPRAS, COMPRAS_FILE)

    # --- campanhas (produto pago; ignora as legadas do mestre fixo) ---
    camp_total = camp_ativas = camp_inativas = 0
    for m in metas.values():
        if str(m.get('mestreUid', '')).startswith('legacy:'):
            continue
        camp_total += 1
        if campanha_paga_em_dia(m):
            camp_ativas += 1
        else:
            camp_inativas += 1

    # --- vendas de crédito (compras via gateway, já creditadas) ---
    fat_cent = cred_vendidos = n_vendas = 0
    por_dia = {}       # 'YYYY-MM-DD' -> centavos
    por_pacote = {}    # nº de créditos -> {'qtd', 'cent'}
    for c in compras.values():
        if not c.get('creditadoEm'):
            continue
        cent = int(c.get('valorCentavos') or 0)
        cr = int(c.get('creditos') or 0)
        fat_cent += cent
        cred_vendidos += cr
        n_vendas += 1
        dia = (c.get('creditadoEm') or c.get('criadoEm') or '')[:10]
        por_dia[dia] = por_dia.get(dia, 0) + cent
        p = por_pacote.setdefault(cr, {'qtd': 0, 'cent': 0})
        p['qtd'] += 1
        p['cent'] += cent

    # --- série diária dos últimos N dias (inclui zeros) ---
    hoje = datetime.now(timezone.utc).date()
    serie, maxv = [], 1
    for i in range(dias - 1, -1, -1):
        d = hoje - timedelta(days=i)
        cent = por_dia.get(d.isoformat(), 0)
        maxv = max(maxv, cent)
        serie.append({'dia': d.strftime('%d/%m'), 'iso': d.isoformat(), 'cent': cent})
    for s in serie:
        s['pct'] = round(100 * s['cent'] / maxv) if maxv else 0
        s['reais'] = s['cent'] / 100

    # --- pacotes mais vendidos (ranking por faturamento) ---
    maxpac = max([p['cent'] for p in por_pacote.values()] or [1])
    pacotes = [{'creditos': k, 'qtd': v['qtd'], 'reais': v['cent'] / 100,
                'pct': round(100 * v['cent'] / maxpac) if maxpac else 0}
               for k, v in sorted(por_pacote.items(), key=lambda kv: kv[1]['cent'], reverse=True)]

    # --- uso de créditos (dos ledgers): comprados vs gastos em campanhas ---
    usados_criar = usados_renovar = comprados = ajuste_admin = 0
    for u in usuarios.values():
        for l in (u.get('creditos_log') or []):
            mot = (l.get('motivo') or '').lower()
            d = int(l.get('delta') or 0)
            if d < 0 and 'criar campanha' in mot:
                usados_criar += -d
            elif d < 0 and 'renovar' in mot:
                usados_renovar += -d
            elif d > 0 and 'compra' in mot:
                comprados += d
            elif d > 0:
                ajuste_admin += d
    circulacao = sum(saldo_creditos(u) for u in usuarios.values())

    # --- utilizadores por status de assinatura ---
    status_cont = {}
    for u in usuarios.values():
        st = status_assinatura(u)
        status_cont[st] = status_cont.get(st, 0) + 1

    return {
        'kpi': {
            'faturamento': fat_cent / 100, 'creditos_vendidos': cred_vendidos,
            'vendas': n_vendas, 'ticket': (fat_cent / n_vendas / 100) if n_vendas else 0,
            'usuarios': len(usuarios), 'circulacao': circulacao,
            'camp_total': camp_total, 'camp_ativas': camp_ativas, 'camp_inativas': camp_inativas,
        },
        'serie': serie, 'dias': dias, 'pacotes': pacotes,
        'uso': {'criar': usados_criar, 'renovar': usados_renovar,
                'comprados': comprados, 'ajuste': ajuste_admin},
        'status': status_cont,
    }


@app.route('/admin')
@app.route('/admin/dashboard')
@login_obrigatorio(exigir_assinatura=False)
def admin_dashboard():
    if not eh_legado_mestre(session.get('uid', '')):
        return redirect(url_for('index'))
    varrer_ciclo_campanhas()  # mantém os números coerentes ao abrir o painel
    return render_template('admin_dashboard.html', d=_dashboard_dados(),
                           preco=ASSINATURA_PRECO, credito_centavos=CREDITO_CENTAVOS)


# ----- FASE 10.9: painel de administração de assinaturas (SÓ o mestre legado) -----
@app.route('/admin/assinaturas', methods=['GET', 'POST'])
@login_obrigatorio(exigir_assinatura=False)
def admin_assinaturas():
    if not eh_legado_mestre(session.get('uid', '')):
        return redirect(url_for('index'))
    msg = None
    if request.method == 'POST':
        alvo = request.form.get('uid', '')
        acao = request.form.get('acao', '')
        # Fase 23.6: ações sobre CAMPANHAS (não têm 'uid' de utilizador)
        if acao in ('camp_renovar', 'camp_apagar'):
            cid = re.sub(r'[^a-zA-Z0-9_-]', '', request.form.get('cid', ''))
            meta = carregar_campanhas_meta().get(cid)
            if not meta:
                msg = 'Campanha não encontrada.'
            elif acao == 'camp_renovar':
                # renovação de cortesia do admin: NÃO debita créditos de ninguém
                meta['pagaAte'] = _mais_dias(meta.get('pagaAte'), CAMPANHA_DIAS)
                meta.pop('inativaDesde', None)
                salvar_campanha_meta(cid, meta)
                msg = f"🔄 Campanha \"{meta.get('nome', cid)}\" renovada até {meta['pagaAte'][:10]} (cortesia, sem débito)."
            elif acao == 'camp_apagar':
                nome = meta.get('nome', cid)
                msg = (f"🗑️ Campanha \"{nome}\" apagada." if deletar_campanha(cid)
                       else 'Essa campanha não pode ser apagada.')
        # Fase 23.6: ações sobre COMPRAS de crédito (Pix)
        elif acao in ('compra_reconferir', 'compra_creditar'):
            pid = request.form.get('pixId', '')
            compra = _carregar_compra(pid)
            if not compra:
                msg = 'Compra não encontrada.'
            elif compra.get('creditadoEm'):
                msg = 'Essa compra já foi creditada.'
            elif acao == 'compra_reconferir':
                st = _confirmar_compra_se_paga(pid)
                msg = (f"💳 Compra confirmada e creditada (status {st})." if st == 'PAID'
                       else f"Ainda não paga (status {st}).")
            elif acao == 'compra_creditar':  # crédito forçado do admin (Pix conferido à mão)
                ok, novo = lancar_creditos(compra['uid'], int(compra['creditos']),
                                           'compra de créditos (Pix confirmado pelo admin)', por='admin')
                if ok:
                    compra['status'] = 'PAID_MANUAL'
                    compra['creditadoEm'] = _agora()
                    _salvar_compra(pid, compra)
                    dono = carregar_usuario_reg(compra['uid']) or {}
                    msg = f"💳 {compra['creditos']} créditos creditados a {dono.get('usuario', compra['uid'])} (saldo {novo})."
                else:
                    msg = 'Falha ao creditar (conta não encontrada?).'
        else:
          u = carregar_usuario_reg(alvo)
          if u:
            if acao == 'aprovar30':
                u['pagaAte'] = _mais_dias(u.get('pagaAte'), 30)
                u['pagamentoInfo'] = None
                u['bloqueado'] = False
                msg = f"✅ {u.get('usuario')}: +30 dias (até {u['pagaAte'][:10]})."
            elif acao == 'trial3':
                u['trialAte'] = _mais_dias(u.get('trialAte'), TRIAL_DIAS)
                u['bloqueado'] = False
                msg = f"🎁 {u.get('usuario')}: +{TRIAL_DIAS} dias de teste."
            elif acao == 'bloquear':
                u['bloqueado'] = True
                msg = f"⛔ {u.get('usuario')} bloqueado."
            elif acao == 'desbloquear':
                u['bloqueado'] = False
                msg = f"🔓 {u.get('usuario')} desbloqueado."
            elif acao == 'creditos':  # Fase 23.1: ajuste manual de créditos
                try:
                    delta = int(request.form.get('delta', '0'))
                except ValueError:
                    delta = 0
                if delta:
                    ok, novo = lancar_creditos(alvo, delta, request.form.get('motivo') or 'ajuste manual do admin', por='admin')
                    u = carregar_usuario_reg(alvo) or u  # recarrega p/ o save final não desfazer o lançamento
                    msg = (f"💳 {u.get('usuario')}: {'+' if delta > 0 else ''}{delta} créditos (saldo {novo})."
                           if ok else f"Saldo insuficiente para debitar {abs(delta)}.")
                else:
                    msg = 'Informe um número de créditos (positivo credita, negativo debita).'
            salvar_usuario_reg(alvo, u)
    usuarios_reg = carregar_usuarios_reg()
    usuarios = []
    for uid_u, u in sorted(usuarios_reg.items(), key=lambda kv: kv[1].get('criadoEm', ''), reverse=True):
        usuarios.append({
            'uid': uid_u, 'usuario': u.get('usuario'), 'nome': u.get('nomeCompleto') or u.get('nomeExibicao'),
            'email': u.get('email', ''), 'cpf': u.get('cpf', ''), 'whatsapp': u.get('whatsapp', ''),
            'criadoEm': (u.get('criadoEm') or '')[:10], 'status': status_assinatura(u),
            'trialAte': (u.get('trialAte') or '')[:10], 'pagaAte': (u.get('pagaAte') or '')[:10],
            'pagamentoInfo': u.get('pagamentoInfo'),
            'creditos': saldo_creditos(u),
        })

    # Fase 23.6: campanhas (todas), compras de crédito e receita
    def _nome_dono(du):
        if str(du).startswith('legacy:'):
            return '(mestre legado)'
        return (usuarios_reg.get(du) or {}).get('usuario') or du or '—'
    campanhas = []
    for cid, m in carregar_campanhas_meta().items():
        paga = campanha_paga_em_dia(m)
        legada = str(m.get('mestreUid', '')).startswith('legacy:')
        campanhas.append({
            'id': cid, 'nome': m.get('nome', cid), 'dono': _nome_dono(m.get('mestreUid', '')),
            'legada': legada, 'ativa': paga, 'membros': len(m.get('membros') or {}),
            'pagaAte': (m.get('pagaAte') or '')[:10],
            'inativaDesde': (m.get('inativaDesde') or '')[:10],
            'apagaEm': (None if (paga or legada) else dias_ate_apagar(m)),
        })
    campanhas.sort(key=lambda c: (c['ativa'], c['nome'].lower()))

    compras_pendentes, receita_creditos, receita_centavos, vendas = [], 0, 0, 0
    for pid, c in _carregar_docs(COLECAO_COMPRAS, COMPRAS_FILE).items():
        if c.get('creditadoEm'):
            receita_creditos += int(c.get('creditos') or 0)
            receita_centavos += int(c.get('valorCentavos') or 0)
            vendas += 1
        else:
            compras_pendentes.append({
                'id': pid, 'usuario': _nome_dono(c.get('uid', '')),
                'creditos': int(c.get('creditos') or 0),
                'valorReais': int(c.get('valorCentavos') or 0) / 100,
                'status': c.get('status', '?'), 'devMode': c.get('devMode'),
                'criadoEm': (c.get('criadoEm') or '')[:16].replace('T', ' '),
            })
    compras_pendentes.sort(key=lambda x: x['criadoEm'], reverse=True)
    creditos_circulacao = sum(saldo_creditos(u) for u in usuarios_reg.values())
    receita = {'vendas': vendas, 'creditos': receita_creditos, 'reais': receita_centavos / 100,
               'circulacao': creditos_circulacao}

    return render_template('admin_assinaturas.html', usuarios=usuarios, msg=msg,
                           preco=ASSINATURA_PRECO, trial_dias=TRIAL_DIAS,
                           campanhas=campanhas, compras_pendentes=compras_pendentes, receita=receita)


# ----- Minhas Campanhas (contas registadas; o mestre legado também pode usar) -----
@app.route('/campanhas')
@login_obrigatorio()
def pagina_campanhas():
    uid = session.get('uid', '')
    varrer_ciclo_campanhas()  # Fase 23.5: limpa vencidas (marca inativas / apaga expiradas)
    metas = carregar_campanhas_meta()
    minhas = []
    for cid, m in metas.items():
        papel = 'mestre' if (m.get('mestreUid') == uid or eh_legado_mestre(uid)) else ('jogador' if uid in (m.get('membros') or {}) else None)
        if papel:
            paga = campanha_paga_em_dia(m)
            minhas.append({'id': cid, 'nome': m.get('nome', cid), 'papel': papel,
                           'codigo': m.get('codigoConvite') if papel == 'mestre' else None,
                           'ativa': cid == campanha_atual(),
                           'paga': paga,
                           'cobravel': not str(m.get('mestreUid', '')).startswith('legacy:'),
                           'pagaAte': (m.get('pagaAte') or '')[:10],
                           'apagaEm': (None if paga else dias_ate_apagar(m))})
    minhas.sort(key=lambda c: c['nome'].lower())
    creditos = None if (not uid or uid.startswith('legacy:')) else saldo_creditos(carregar_usuario_reg(uid))
    return render_template('campanhas.html', campanhas=minhas, erro=request.args.get('erro'),
                           usuario=session.get('nomeExibicao') or session.get('usuario'),
                           legado_mestre=eh_legado_mestre(uid), creditos=creditos,
                           custo_campanha=CAMPANHA_CREDITOS, modo_livre=MODO_LIVRE)


@app.route('/campanha/nova', methods=['POST'])
@login_obrigatorio()
def campanha_nova():
    uid = session.get('uid', '')
    nome = request.form.get('nome', '').strip()[:48]
    if not nome:
        return redirect(url_for('pagina_campanhas', erro='Dê um nome à campanha.'))
    # Fase 23.3: criar uma campanha custa CAMPANHA_CREDITOS (o mestre legado é
    # isento; no MODO LIVRE temporário ninguém é cobrado).
    cobrar = not uid.startswith('legacy:') and not MODO_LIVRE
    if cobrar:
        if saldo_creditos(carregar_usuario_reg(uid)) < CAMPANHA_CREDITOS:
            return redirect(url_for('pagina_campanhas',
                                    erro=f'Criar uma campanha custa {CAMPANHA_CREDITOS} créditos (R$ 5,00/mês). '
                                         'Compre créditos e tente de novo.'))
    cid = 'camp_' + uuid.uuid4().hex[:10]
    if cobrar:
        ok, _ = lancar_creditos(uid, -CAMPANHA_CREDITOS, f'criar campanha "{nome}"', por='sistema')
        if not ok:
            return redirect(url_for('pagina_campanhas', erro='Saldo de créditos insuficiente.'))
    salvar_campanha_meta(cid, {
        'nome': nome,
        'mestreUid': uid,
        'membros': {},
        'codigoConvite': gerar_codigo_convite(nome),
        'ativa': True,
        'criadaEm': _agora(),
        'pagaAte': _mais_dias(None, CAMPANHA_DIAS),
    })
    session['campanha'] = cid
    session['papel'] = 'mestre'
    return redirect(url_for('index'))


@app.route('/campanha/entrar', methods=['POST'])
@login_obrigatorio()
def campanha_entrar():
    uid = session.get('uid', '')
    codigo = request.form.get('codigo', '').strip().upper()
    for cid, m in carregar_campanhas_meta().items():
        if str(m.get('codigoConvite', '')).upper() == codigo and codigo:
            if m.get('mestreUid') != uid and uid not in (m.get('membros') or {}):
                m.setdefault('membros', {})[uid] = 'jogador'
                salvar_campanha_meta(cid, m)
            session['campanha'] = cid
            session['papel'] = papel_na_campanha(uid, cid) or 'jogador'
            return redirect(url_for('index'))
    return redirect(url_for('pagina_campanhas', erro='Código de convite não encontrado.'))


@app.route('/campanha/ativa', methods=['POST'])
@login_obrigatorio()
def campanha_ativa():
    uid = session.get('uid', '')
    cid = re.sub(r'[^a-zA-Z0-9_-]', '', request.form.get('id', ''))
    papel = papel_na_campanha(uid, cid)
    if not papel:
        return redirect(url_for('pagina_campanhas', erro='Você não é membro dessa campanha.'))
    # Fase 23.5: passa o ciclo antes de entrar (pode apagar se a retenção esgotou)
    meta = carregar_campanhas_meta().get(cid)
    if meta is not None and ciclo_campanha(cid, meta) is None:
        return redirect(url_for('pagina_campanhas', erro='Campanha apagada por inatividade (retenção esgotada).'))
    session['campanha'] = cid
    session['papel'] = papel
    return redirect(url_for('index'))


@app.route('/campanha/renovar', methods=['POST'])
@login_obrigatorio()
def campanha_renovar():
    """Fase 23.3: o dono paga mais um mês (debita CAMPANHA_CREDITOS e estende
    pagaAte por CAMPANHA_DIAS, empilhando sobre o vencimento futuro se houver).
    Reativa a campanha (limpa inativaDesde)."""
    uid = session.get('uid', '')
    cid = re.sub(r'[^a-zA-Z0-9_-]', '', request.form.get('id', ''))
    metas = carregar_campanhas_meta()
    meta = metas.get(cid)
    if not meta:
        return redirect(url_for('pagina_campanhas', erro='Campanha não encontrada.'))
    if meta.get('mestreUid') != uid and not eh_legado_mestre(uid):
        return redirect(url_for('pagina_campanhas', erro='Só o Mestre da campanha pode renová-la.'))
    if not str(meta.get('mestreUid', '')).startswith('legacy:') and not MODO_LIVRE:
        if saldo_creditos(carregar_usuario_reg(uid)) < CAMPANHA_CREDITOS:
            return redirect(url_for('pagina_campanhas',
                                    erro=f'Renovar custa {CAMPANHA_CREDITOS} créditos. Compre créditos e tente de novo.'))
        ok, _ = lancar_creditos(uid, -CAMPANHA_CREDITOS, f'renovar campanha "{meta.get("nome", cid)}"', por='sistema')
        if not ok:
            return redirect(url_for('pagina_campanhas', erro='Saldo de créditos insuficiente.'))
    meta['pagaAte'] = _mais_dias(meta.get('pagaAte'), CAMPANHA_DIAS)
    meta.pop('inativaDesde', None)
    salvar_campanha_meta(cid, meta)
    return redirect(url_for('pagina_campanhas', erro=f'✅ Campanha renovada até {meta["pagaAte"][:10]}.'))


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/mestre')
@login_obrigatorio(papeis=['mestre'])
def mestre():
    return render_template('mestre.html', usuario=session['usuario'], campanha=campanha_atual(),
                           use_local=(db is None), uid=session.get('uid', ''))


@app.route('/jogador')
@login_obrigatorio(papeis=['mestre', 'jogador'])
def jogador():
    return render_template('jogador.html', usuario=session['usuario'], campanha=campanha_atual(),
                           use_local=(db is None), uid=session.get('uid', ''),
                           eh_mestre=(session.get('papel') == 'mestre'))


@app.route('/campanha', methods=['POST'])
@login_obrigatorio(papeis=['mestre'])
def trocar_campanha():
    c = re.sub(r'[^a-zA-Z0-9_-]', '', request.form.get('campanha', '').strip()) or 'principal'
    uid = session.get('uid', '')
    # contas registadas só trocam para campanhas de que são membros/mestre
    # (o formulário livre do cabeçalho é um recurso legado do mestre fixo)
    if uid and not uid.startswith('legacy:'):
        papel = papel_na_campanha(uid, c)
        if not papel:
            return redirect(url_for('pagina_campanhas', erro='Você não é membro dessa campanha.'))
        session['papel'] = papel
    session['campanha'] = c
    return redirect(url_for('index'))


# ===== API =====

@app.route('/api/fichas', methods=['GET'])
@login_obrigatorio()
def api_get_fichas():
    return jsonify(carregar_estado()['fichas'])


def _sanitizar_fichas_jogador(recebidas, armazenadas, meu_uid):
    """Antes desta trava, um jogador podia reescrever TODAS as fichas da mesa
    (ouro/XP de qualquer um) só chamando PUT /api/fichas — a regra B2 e a
    posse eram apenas do lado do cliente. Agora o servidor decide:
    - o jogador só altera fichas PRÓPRIAS (donoUid dele, ou legadas sem dono);
      fichas de outros são preservadas do estado gravado, ignorando o payload;
    - `xp` e `ouro` são sempre preservados do valor gravado (B2: XP só via
      Mestre; ouro só via Mestre ou pelos endpoints validados
      /api/loja_base/comprar|vender e /api/lojas/comprar|vender — Fase 18.1);
    - `donoUid` não pode ser reatribuído (evita roubo/troca de dono);
    - revivência (morto->vivo) fica com o Mestre; morrer (vivo->morto) é livre."""
    por_id = {f.get('id'): f for f in armazenadas if isinstance(f, dict) and f.get('id')}
    vistos = set()
    saida = []
    for f in recebidas:
        if not isinstance(f, dict):
            continue
        fid = f.get('id')
        vistos.add(fid)
        antiga = por_id.get(fid)
        if antiga is None:
            # ficha nova: sempre criada em nome do próprio jogador
            f['donoUid'] = meu_uid
            saida.append(f)
            continue
        if antiga.get('donoUid') not in (None, meu_uid):
            # ficha de OUTRO jogador: descarta o payload, mantém a gravada
            saida.append(antiga)
            continue
        # ficha própria (ou legada sem dono): preserva os campos protegidos
        # (esta função só roda para o papel jogador — ver api_put_fichas)
        f['donoUid'] = antiga.get('donoUid')
        f['xp'] = antiga.get('xp', 0)
        f['ouro'] = antiga.get('ouro', 0)
        if antiga.get('status') == 'morto':
            f['status'] = 'morto'
        saida.append(f)
    # fichas gravadas que o cliente omitiu: preserva as de OUTROS donos
    # (apagar a própria continua a funcionar — some do payload e não é readicionada)
    for fid, antiga in por_id.items():
        if fid not in vistos and antiga.get('donoUid') not in (None, meu_uid):
            saida.append(antiga)
    return saida


# ---------------------------------------------------------------
# Normalização de ficha no servidor (schema versão 2)
# O cliente é quem monta a ficha, mas o servidor deixou de aceitar qualquer
# blob: campos conhecidos são coagidos a tipos/limites sãos (LENIENTE — nunca
# rejeita a ficha, só conserta o campo), todo save ganha `schemaVersion` e um
# carimbo `atualizadoEm` que só muda quando o CONTEÚDO muda (é a base da trava
# otimista do PATCH /api/fichas/<id>).
# ---------------------------------------------------------------
FICHA_SCHEMA_VERSAO = 2

_FICHA_TEXTOS = {  # campo -> tamanho máximo
    'nome': 80, 'raca': 60, 'classe': 40, 'subclasse': 80, 'antecedente': 80,
    'divindade': 80, 'patrono': 80, 'estilo': 60, 'armadura': 60, 'status': 20,
    'historia': 20000, 'anotacoes': 20000, 'inventario': 20000, 'magias': 20000,
    'miniaturaUrl': 2000, 'concentrando': 200,
}
_FICHA_LISTAS_STR = ['pericias', 'truques', 'magias1', 'itens', 'preparadas', 'sintonizados', 'kitAplicado', 'condicoes']
_FICHA_DICTS_STR = {'personalidade': 2000, 'itemMemoria': 2000, 'equipado': 200}


def _int_saneado(v, minimo, maximo, padrao):
    """Coage a int dentro de [minimo, maximo]; bool/lixo viram o padrão."""
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        return padrao
    try:
        return max(minimo, min(maximo, int(v)))
    except (ValueError, OverflowError):
        return padrao


def _normalizar_ficha(f):
    """Coage os campos conhecidos da ficha a tipos/limites sãos, em lugar.
    Leniente por desenho: campo ausente segue ausente, campo inválido é
    consertado (nunca derruba a gravação inteira). Campos desconhecidos
    passam intactos — o schema evolui no cliente primeiro."""
    for campo, tam in _FICHA_TEXTOS.items():
        if campo in f and f[campo] is not None:
            f[campo] = str(f[campo])[:tam] if isinstance(f[campo], (str, int, float)) else ''
    if 'nivel' in f:
        f['nivel'] = _int_saneado(f.get('nivel'), 1, 20, 1)
    for campo in ('hpMax', 'hpAtual', 'pvTemp', 'ca', 'xp', 'ouro'):
        if campo in f:
            teto = 10_000_000 if campo in ('xp', 'ouro') else 999
            f[campo] = _int_saneado(f.get(campo), 0, teto, 0)
    if 'iniciativa' in f:
        f['iniciativa'] = _int_saneado(f.get('iniciativa'), -10, 30, 0)
    if isinstance(f.get('atributos'), dict):
        f['atributos'] = {k: _int_saneado(f['atributos'].get(k), 1, 30, 10)
                          for k in ('for', 'des', 'con', 'int', 'sab', 'car')}
    for campo in _FICHA_LISTAS_STR:
        if campo in f:
            lista = f[campo] if isinstance(f[campo], list) else []
            f[campo] = [str(x)[:200] for x in lista if isinstance(x, (str, int, float))][:300]
    for campo, tam in _FICHA_DICTS_STR.items():
        if campo in f and isinstance(f[campo], dict):
            f[campo] = {k: (str(v)[:tam] if isinstance(v, (str, int, float)) else v)
                        for k, v in f[campo].items()}
    f['schemaVersion'] = FICHA_SCHEMA_VERSAO
    return f


def _conteudo_ficha(f):
    """Assinatura estável do conteúdo (ignora os carimbos) p/ decidir se um
    save realmente mudou algo — e portanto se `atualizadoEm` avança."""
    visivel = {k: v for k, v in f.items() if k not in ('atualizadoEm', 'schemaVersion')}
    return json.dumps(visivel, sort_keys=True, ensure_ascii=False, default=str)


def _carimbar_ficha(nova, antiga):
    """`atualizadoEm` só avança quando o conteúdo muda — saves repetidos (ou o
    PUT em lista do Mestre passando por fichas intocadas) preservam o carimbo,
    senão toda gravação alheia geraria conflito falso na trava otimista."""
    if antiga is not None and _conteudo_ficha(nova) == _conteudo_ficha(antiga) and antiga.get('atualizadoEm'):
        nova['atualizadoEm'] = antiga.get('atualizadoEm')
    else:
        nova['atualizadoEm'] = _agora()
    return nova


@app.route('/api/fichas', methods=['PUT'])
@login_obrigatorio()
def api_put_fichas():
    estado = carregar_estado()
    recebidas = request.get_json(force=True)
    if not isinstance(recebidas, list):
        return jsonify({'ok': False, 'erro': 'esperava uma lista de fichas'}), 400
    if session.get('papel') == 'mestre':
        novas = [f for f in recebidas if isinstance(f, dict)]
    else:
        novas = _sanitizar_fichas_jogador(recebidas, estado.get('fichas', []), uid_sessao())
    # Fase 23.4: campanha paga tem no máx. MAX_FICHAS_PJ fichas de PJ. Só barra
    # quando o total AUMENTA acima do teto (edições e remoções seguem livres,
    # mesmo em dados legados que já passassem do limite).
    if campanha_cobravel(campanha_atual()) and len(novas) > MAX_FICHAS_PJ and len(novas) > len(estado.get('fichas', [])):
        return jsonify({'ok': False, 'erro': 'limite_fichas',
                        'detalhe': f'esta campanha permite no máximo {MAX_FICHAS_PJ} fichas de personagem'}), 403
    # Antecedentes EXCLUSIVOS de campanha (módulos pré-prontos): um por campanha.
    # O nome traz o módulo entre parênteses — nenhum antecedente do PHB tem. Só
    # barra quando a submissão INTRODUZ um novo conflito (não trava dados legados).
    novos_dups = _antecedentes_exclusivos_dup(novas) - _antecedentes_exclusivos_dup(estado.get('fichas', []))
    if novos_dups:
        alvo = sorted(novos_dups)[0]
        return jsonify({'ok': False, 'erro': 'antecedente_em_uso',
                        'detalhe': f'o antecedente "{alvo}" já está em uso por outro personagem desta campanha'}), 403
    # schema v2: normaliza cada ficha e carimba atualizadoEm (só quando mudou)
    antigas_por_id = {f.get('id'): f for f in estado.get('fichas', []) if isinstance(f, dict)}
    for f in novas:
        _normalizar_ficha(f)
        _carimbar_ficha(f, antigas_por_id.get(f.get('id')))
    estado['fichas'] = novas
    salvar_estado(estado)
    return jsonify({'ok': True})


@app.route('/api/fichas/<fid>', methods=['PATCH'])
@login_obrigatorio()
def api_patch_ficha(fid):
    """Grava UMA ficha (em vez da lista inteira) com trava otimista.

    Antes, todo save era PUT da lista completa: dois saves quase simultâneos
    (Mestre + jogador, ou dois aparelhos) faziam o último sobrescrever o outro
    em silêncio. O Modo de Jogo agora usa este endpoint: só toca na própria
    ficha, e se `baseAtualizadoEm` (o carimbo que o cliente viu por último)
    não bater com o gravado, devolve 409 com a versão atual em vez de
    atropelar — o cliente recarrega e o usuário refaz a ação em cima do dado
    certo. As proteções por papel são as MESMAS do PUT (posse, xp/ouro/morte
    só via Mestre, antecedente exclusivo)."""
    estado = carregar_estado()
    fichas = estado.get('fichas', [])
    idx = next((i for i, f in enumerate(fichas) if isinstance(f, dict) and f.get('id') == fid), None)
    if idx is None:
        return jsonify({'ok': False, 'erro': 'ficha_nao_encontrada'}), 404
    antiga = fichas[idx]

    corpo = request.get_json(force=True)
    if not isinstance(corpo, dict):
        return jsonify({'ok': False, 'erro': 'esperava um objeto JSON'}), 400
    nova = corpo.get('ficha') if isinstance(corpo.get('ficha'), dict) else corpo
    nova = dict(nova)
    nova['id'] = fid

    # trava otimista: cliente manda o carimbo que conhecia; divergiu → 409
    base = corpo.get('baseAtualizadoEm')
    if base is not None and antiga.get('atualizadoEm') and base != antiga.get('atualizadoEm'):
        return jsonify({'ok': False, 'erro': 'conflito',
                        'detalhe': 'a ficha foi alterada por outra sessão desde a sua última leitura',
                        'ficha': antiga}), 409

    if session.get('papel') != 'mestre':
        if antiga.get('donoUid') not in (None, uid_sessao()):
            return jsonify({'ok': False, 'erro': 'sem_permissao',
                            'detalhe': 'esta ficha pertence a outro jogador'}), 403
        # mesmos campos protegidos do PUT (B2)
        nova['donoUid'] = antiga.get('donoUid')
        nova['xp'] = antiga.get('xp', 0)
        nova['ouro'] = antiga.get('ouro', 0)
        if antiga.get('status') == 'morto':
            nova['status'] = 'morto'

    tentativa = fichas[:idx] + [nova] + fichas[idx + 1:]
    novos_dups = _antecedentes_exclusivos_dup(tentativa) - _antecedentes_exclusivos_dup(fichas)
    if novos_dups:
        alvo = sorted(novos_dups)[0]
        return jsonify({'ok': False, 'erro': 'antecedente_em_uso',
                        'detalhe': f'o antecedente "{alvo}" já está em uso por outro personagem desta campanha'}), 403

    _normalizar_ficha(nova)
    _carimbar_ficha(nova, antiga)
    estado['fichas'] = tentativa
    salvar_estado(estado)
    return jsonify({'ok': True, 'ficha': nova})


@app.route('/api/monstros_visiveis', methods=['GET'])
@login_obrigatorio()
def api_get_monstros_visiveis():
    return jsonify(carregar_estado()['monstros_visiveis'])


@app.route('/api/monstros_visiveis', methods=['PUT'])
@login_obrigatorio(papeis=['mestre'])
def api_put_monstros_visiveis():
    estado = carregar_estado()
    estado['monstros_visiveis'] = request.get_json(force=True) or []
    salvar_estado(estado)
    return jsonify({'ok': True})


@app.route('/api/combate', methods=['GET'])
@login_obrigatorio()
def api_get_combate():
    return jsonify(carregar_estado()['combate'])


@app.route('/api/combate', methods=['PUT'])
@login_obrigatorio(papeis=['mestre'])
def api_put_combate():
    estado = carregar_estado()
    estado['combate'] = request.get_json(force=True) or ESTADO_PADRAO['combate']
    salvar_estado(estado)
    return jsonify({'ok': True})


@app.route('/api/combate/acao', methods=['POST'])
@login_obrigatorio()
def api_combate_acao():
    estado = carregar_estado()
    data = request.get_json(force=True) or {}
    usuario = session.get('nomeExibicao') or session.get('usuario') or 'Jogador'
    acao = data.get('acao')
    
    combate = estado.setdefault('combate', {'combatentes': [], 'turno': 0, 'rodada': 1, 'log': []})
    combatentes = combate.setdefault('combatentes', [])
    
    if acao == 'defesa_log':
        msg = data.get('msg', '')
        if msg:
            combate.setdefault('log', []).insert(0, f"R{combate.get('rodada', 1)} · {msg}")
            combate['log'] = combate['log'][:40]
            salvar_estado(estado)
        return jsonify({'ok': True})

    # T2: finalizar o turno atual e passar a vez. O jogador só finaliza a
    # PRÓPRIA vez (o combatente da vez é um PJ da ficha dele); o Mestre pode
    # sempre. A ordem/turno do combate é a fonte ÚNICA — não há 2º contador.
    if acao == 'proximo_turno':
        if not combatentes:
            return jsonify({'ok': False, 'erro': 'sem_combate'}), 400
        n = len(combatentes)
        idx = combate.get('turno', 0) % n
        atual = combatentes[idx]
        if session.get('papel') != 'mestre':
            dono_ok = False
            if atual.get('tipo') == 'pc' and atual.get('fichaId'):
                f = next((x for x in estado.get('fichas', []) if x.get('id') == atual.get('fichaId')), None)
                dono_ok = bool(f and f.get('donoUid') in (None, uid_sessao()))
            if not dono_ok:
                return jsonify({'ok': False, 'erro': 'nao_e_sua_vez',
                                'detalhe': 'só quem está na vez pode finalizar o turno'}), 403
        nome_atual = atual.get('nome', '?')
        combate['turno'] = combate.get('turno', 0) + 1
        virou_rodada = False
        if combate['turno'] >= n:
            combate['turno'] = 0
            combate['rodada'] = combate.get('rodada', 1) + 1
            virou_rodada = True
            for c in combatentes:
                if c.get('chefe'):
                    c['lendAtual'] = c.get('lendMax', 3)
        prox = combatentes[combate['turno'] % n]
        log = combate.setdefault('log', [])
        if virou_rodada:
            log.insert(0, f"R{combate['rodada']} · — Rodada {combate['rodada']} —")
        log.insert(0, f"R{combate.get('rodada', 1)} · ✔️ {nome_atual} finalizou o turno. Agora: {prox.get('nome', '?')}.")
        combate['log'] = log[:40]
        salvar_estado(estado)
        return jsonify({'ok': True, 'turno': combate['turno'], 'rodada': combate.get('rodada', 1), 'proximo': prox.get('nome')})

    alvo_id = data.get('alvoId')
    alvo = next((c for c in combatentes if c['id'] == alvo_id), None)
    if not alvo:
        return jsonify({'erro': 'Alvo não encontrado no combate.'}), 404
        
    if acao == 'ataque':
        total = data.get('totalAtaque', 0)
        d20 = data.get('d20', 10)
        critico = data.get('critico', False)
        erro_auto = data.get('erroAuto', False)
        nome_acao = data.get('nomeAcao', 'Ataque')
        dado_fisico = data.get('dadoFisico', False)
        
        is_crit = (d20 == 20) or critico
        is_miss = (d20 == 1) or erro_auto
        acertou = is_crit or (not is_miss and total >= alvo.get('ca', 10))
        
        fisico_lbl = ' (dado físico)' if dado_fisico else ''
        res_lbl = 'ACERTOU!'
        if is_crit:
            res_lbl = 'ACERTO CRÍTICO!'
        elif is_miss:
            res_lbl = 'ERROU (1 natural)!'
        elif not acertou:
            res_lbl = 'ERROU'
            
        msg = f"{usuario} -> {alvo['nome']} ({nome_acao}){fisico_lbl}: {res_lbl} ({total} vs CA {alvo.get('ca', 10)})"
        combate.setdefault('log', []).insert(0, f"R{combate.get('rodada', 1)} · {msg}")
        combate['log'] = combate['log'][:40]
        salvar_estado(estado)
        return jsonify({'ok': True, 'acertou': acertou, 'critico': is_crit, 'ca': alvo.get('ca', 10)})
        
    elif acao == 'dano':
        bruto = int(data.get('bruto', 0))
        tipo = (data.get('tipoDano') or '').strip().lower()
        nome_acao = data.get('nomeAcao', 'Dano')
        dado_fisico = data.get('dadoFisico', False)
        
        mult = 1.0
        if tipo:
            if tipo in [t.lower() for t in alvo.get('imune', [])]:
                mult = 0.0
            elif tipo in [t.lower() for t in alvo.get('resist', [])]:
                mult = 0.5
            elif tipo in [t.lower() for t in alvo.get('vuln', [])]:
                mult = 2.0
                
        dano_real = int(bruto * mult)
        alvo['hpAtual'] = max(0, alvo['hpAtual'] - dano_real)
        
        # Se for PC, sincroniza o HP na ficha persistida correspondente
        if alvo.get('tipo') == 'pc' and alvo.get('fichaId'):
            for f in estado.setdefault('fichas', []):
                if f['id'] == alvo['fichaId']:
                    f['hpAtual'] = alvo['hpAtual']
                    break
                    
        fisico_lbl = ' (dado físico)' if dado_fisico else ''
        lbl_mult = " (IMUNE)" if mult == 0 else " (resistência ½)" if mult == 0.5 else " (VULNERÁVEL ×2)" if mult == 2 else ""
        msg = f"{usuario} -> {alvo['nome']} ({nome_acao}){fisico_lbl}: causa {dano_real} de dano {tipo or ''}{lbl_mult}. PV {alvo['hpAtual']}/{alvo['hpMax']}"
        if alvo['hpAtual'] == 0:
            msg += " 💀 caiu!"
            
        combate.setdefault('log', []).insert(0, f"R{combate.get('rodada', 1)} · {msg}")
        combate['log'] = combate['log'][:40]
        salvar_estado(estado)
        return jsonify({'ok': True, 'danoReal': dano_real, 'hpRestante': alvo['hpAtual'], 'mult': mult})
        
    return jsonify({'erro': 'Ação inválida.'}), 400


# ---------------------------------------------------------------
# U2 — Geração com IA (Anthropic / Claude). A chave fica no SERVIDOR
# (env ANTHROPIC_API_KEY), nunca no cliente. Gated por assinatura ativa
# (login_obrigatorio) + quota diária por utilizador para controlar custo.
# Degrada de forma suave se a chave/SDK não estiverem presentes.
# ---------------------------------------------------------------
IA_USO_FILE = os.path.join(DATA_DIR, 'ia_uso.json')
COLECAO_IA_USO = 'ia_uso'
# Modelo configurável; padrão Haiku (barato, ótimo para textos curtos de mesa).
# Troque para 'claude-opus-4-8' se quiser respostas mais ricas (mais caro).
IA_MODELO = os.environ.get('IA_MODELO', 'claude-haiku-4-5')
IA_QUOTA_DIARIA = int(os.environ.get('IA_QUOTA_DIARIA', '20') or 20)

_ANTHROPIC_CLIENT = None


def _anthropic_client():
    """Cliente Anthropic (lazy). Retorna None se não houver chave ou SDK."""
    global _ANTHROPIC_CLIENT
    if _ANTHROPIC_CLIENT is not None:
        return _ANTHROPIC_CLIENT
    if not os.environ.get('ANTHROPIC_API_KEY'):
        return None
    try:
        import anthropic
        _ANTHROPIC_CLIENT = anthropic.Anthropic()
    except Exception as e:  # pragma: no cover — SDK ausente/versão incompatível
        print('[IA] SDK Anthropic indisponível:', e)
        return None
    return _ANTHROPIC_CLIENT


def _ia_quota_hoje(uid):
    hoje = datetime.now(timezone.utc).date().isoformat()
    r = (_carregar_docs(COLECAO_IA_USO, IA_USO_FILE).get(uid)) or {}
    usos = r.get('usos', 0) if r.get('data') == hoje else 0
    return hoje, usos


def _ia_registar_uso(uid, hoje, usos):
    _salvar_doc(COLECAO_IA_USO, IA_USO_FILE, uid, {'data': hoje, 'usos': usos + 1})


# Prompts (system) por tipo — o contexto específico vem do cliente.
_IA_PROMPTS = {
    'historia': (
        'Você é um mestre de RPG D&D 5e. Escreva uma HISTÓRIA PRÉVIA (background) '
        'envolvente em português do Brasil para o personagem abaixo, em 2 a 4 '
        'parágrafos, coerente com raça, classe e antecedente. Foque em narrativa; '
        'não invente regras nem números. Responda só com a história, sem títulos.'),
    'npc': (
        'Você é um mestre de RPG D&D 5e. Crie um NPC memorável em português do '
        'Brasil a partir das pistas abaixo: um parágrafo de aparência e '
        'personalidade, um de motivação ou segredo, e uma fala típica. '
        'Responda só com o NPC.'),
    'gancho': (
        'Você é um mestre de RPG D&D 5e. Gere 3 ganchos de aventura curtos em '
        'português do Brasil a partir do contexto abaixo, cada um em uma frase. '
        'Responda só com a lista.'),
    'ambiente': (
        'Você é um mestre de RPG D&D 5e. Descreva de forma sensorial e breve '
        '(um parágrafo) o ambiente ou local abaixo, em português do Brasil, '
        'pronto para ler em voz alta na mesa. Responda só com a descrição.'),
}


@app.route('/api/ia/status', methods=['GET'])
@login_obrigatorio()
def api_ia_status():
    """O cliente usa isto para mostrar/esconder os botões de IA."""
    uid = session.get('uid') or session.get('usuario') or 'anon'
    _, usos = _ia_quota_hoje(uid)
    return jsonify({
        'disponivel': _anthropic_client() is not None,
        'restantes': max(0, IA_QUOTA_DIARIA - usos),
        'quota': IA_QUOTA_DIARIA,
    })


@app.route('/api/ia/gerar', methods=['POST'])
@login_obrigatorio()
def api_ia_gerar():
    data = request.get_json(force=True) or {}
    tipo = (data.get('tipo') or '').strip().lower()
    contexto = (data.get('contexto') or '').strip()
    if tipo not in _IA_PROMPTS:
        return jsonify({'erro': 'tipo_invalido'}), 400
    if not contexto:
        return jsonify({'erro': 'sem_contexto', 'detalhe': 'Envie algum contexto para a IA.'}), 400
    contexto = contexto[:4000]  # trava de tamanho de entrada

    cliente = _anthropic_client()
    if cliente is None:
        return jsonify({'erro': 'ia_indisponivel',
                        'detalhe': 'IA não configurada no servidor (falta ANTHROPIC_API_KEY).'}), 503

    # Quota diária por utilizador (uid; contas legadas usam o próprio nome).
    uid = session.get('uid') or session.get('usuario') or 'anon'
    hoje, usos = _ia_quota_hoje(uid)
    if usos >= IA_QUOTA_DIARIA:
        return jsonify({'erro': 'quota',
                        'detalhe': f'Limite diário de {IA_QUOTA_DIARIA} gerações atingido.'}), 429

    try:
        resp = cliente.messages.create(
            model=IA_MODELO,
            max_tokens=1024,
            system=_IA_PROMPTS[tipo],
            messages=[{'role': 'user', 'content': contexto}],
        )
        texto = ''.join(
            b.text for b in resp.content if getattr(b, 'type', '') == 'text'
        ).strip()
    except Exception as e:  # pragma: no cover — rede/rate limit/etc.
        print('[IA] Falha na geração:', e)
        return jsonify({'erro': 'falha_ia', 'detalhe': 'A IA não respondeu. Tente novamente.'}), 502

    if not texto:
        return jsonify({'erro': 'vazio', 'detalhe': 'A IA não retornou texto.'}), 502

    _ia_registar_uso(uid, hoje, usos)
    return jsonify({'ok': True, 'texto': texto, 'restantes': max(0, IA_QUOTA_DIARIA - usos - 1)})


@app.route('/api/notas', methods=['GET'])
@login_obrigatorio()
def api_get_notas():
    notas = carregar_estado().get('notas', [])
    # jogador só recebe as notas/handouts compartilhadas
    if session.get('papel') != 'mestre':
        notas = [n for n in notas if n.get('compartilhada')]
    return jsonify(notas)


@app.route('/api/notas', methods=['PUT'])
@login_obrigatorio(papeis=['mestre'])
def api_put_notas():
    estado = carregar_estado()
    estado['notas'] = request.get_json(force=True) or []
    salvar_estado(estado)
    return jsonify({'ok': True})


@app.route('/api/encontros', methods=['GET'])
@login_obrigatorio(papeis=['mestre'])
def api_get_encontros():
    return jsonify(carregar_estado().get('encontros', []))


@app.route('/api/encontros', methods=['PUT'])
@login_obrigatorio(papeis=['mestre'])
def api_put_encontros():
    estado = carregar_estado()
    estado['encontros'] = request.get_json(force=True) or []
    salvar_estado(estado)
    return jsonify({'ok': True})


@app.route('/api/itens_mestre', methods=['GET'])
@login_obrigatorio()
def api_get_itens_mestre():
    # visível para mestre e jogadores (assim a sintonização/inventário reconhece
    # o item depois que o Mestre o envia a uma ficha), mas só o Mestre cria/edita.
    return jsonify(carregar_estado().get('itens_mestre', []))


@app.route('/api/itens_mestre', methods=['PUT'])
@login_obrigatorio(papeis=['mestre'])
def api_put_itens_mestre():
    estado = carregar_estado()
    estado['itens_mestre'] = request.get_json(force=True) or []
    salvar_estado(estado)
    return jsonify({'ok': True})


@app.route('/api/loja_especial', methods=['GET'])
@login_obrigatorio()
def api_get_loja_especial():
    return jsonify({'liberada': bool(carregar_estado().get('loja_especial_campanha', False))})


@app.route('/api/loja_especial', methods=['PUT'])
@login_obrigatorio(papeis=['mestre'])
def api_put_loja_especial():
    estado = carregar_estado()
    estado['loja_especial_campanha'] = bool((request.get_json(force=True) or {}).get('liberada'))
    salvar_estado(estado)
    return jsonify({'ok': True})


@app.route('/api/loja_especial_itens', methods=['GET'])
@login_obrigatorio()
def api_get_loja_especial_itens():
    # curadoria do Mestre: só o que ele adicionou aparece na Loja Especial do jogador
    return jsonify(carregar_estado().get('loja_especial_itens', []))


@app.route('/api/loja_especial_itens', methods=['PUT'])
@login_obrigatorio(papeis=['mestre'])
def api_put_loja_especial_itens():
    estado = carregar_estado()
    estado['loja_especial_itens'] = request.get_json(force=True) or []
    salvar_estado(estado)
    return jsonify({'ok': True})


# ----- FASE 11: NPCs persistentes da campanha -----
@app.route('/api/npcs', methods=['GET'])
@login_obrigatorio()
def api_get_npcs():
    npcs = carregar_estado().get('npcs', [])
    # jogador só recebe os visíveis, e nunca as notas privadas do Mestre
    # (mesmo padrão de /api/notas: o filtro é no servidor, não no cliente)
    if session.get('papel') != 'mestre':
        npcs = [{k: v for k, v in n.items() if k != 'notasPrivadas'}
                for n in npcs if n.get('visivelParaJogadores')]
    return jsonify(npcs)


@app.route('/api/npcs', methods=['PUT'])
@login_obrigatorio(papeis=['mestre'])
def api_put_npcs():
    estado = carregar_estado()
    estado['npcs'] = request.get_json(force=True) or []
    salvar_estado(estado)
    return jsonify({'ok': True})


# ----- M4: banco PESSOAL de NPCs, partilhado entre utilizadores -----
# Cada utilizador tem um banco fora de qualquer campanha (segue-o entre
# mesas). O Mestre da campanha ativa pode ver o banco dos MEMBROS dela e
# copiar NPCs para a campanha ("trazer para a mesa").
BANCONPC_FILE = os.path.join(DATA_DIR, 'bancos_npc.json')
COLECAO_BANCO_NPC = 'bancos_npc'
BANCONPC_MAX = 100  # limite defensivo por utilizador


def uid_sessao():
    return session.get('uid') or f"legacy:{session.get('usuario', '')}"


def carregar_banco_npc(uid):
    if db is not None:
        snap = db.collection(COLECAO_BANCO_NPC).document(uid).get()
        return (snap.to_dict() or {}).get('npcs', []) if snap.exists else []
    return (_carregar_docs(COLECAO_BANCO_NPC, BANCONPC_FILE).get(uid) or {}).get('npcs', [])


def salvar_banco_npc(uid, npcs):
    _salvar_doc(COLECAO_BANCO_NPC, BANCONPC_FILE, uid, {'npcs': npcs, 'atualizadoEm': _agora()})


@app.route('/api/banco_npc', methods=['GET'])
@login_obrigatorio()
def api_get_banco_npc():
    return jsonify(carregar_banco_npc(uid_sessao()))


@app.route('/api/banco_npc', methods=['PUT'])
@login_obrigatorio()
def api_put_banco_npc():
    lista = request.get_json(force=True)
    if not isinstance(lista, list):
        return jsonify({'ok': False, 'erro': 'esperava uma lista de NPCs'}), 400
    lista = [n for n in lista if isinstance(n, dict)][:BANCONPC_MAX]
    salvar_banco_npc(uid_sessao(), lista)
    return jsonify({'ok': True, 'total': len(lista)})


@app.route('/api/banco_npc/<uid_alvo>', methods=['GET'])
@login_obrigatorio(papeis=['mestre'])
def api_get_banco_npc_membro(uid_alvo):
    # o Mestre só vê bancos de quem participa da campanha ATIVA (o servidor
    # valida a membresia — mesmo princípio do filtro de /api/npcs)
    cid = campanha_atual()
    meta = carregar_campanhas_meta().get(cid)
    if not meta:
        return jsonify({'ok': False, 'erro': 'campanha legada não tem membros geridos'}), 400
    permitidos = set((meta.get('membros') or {}).keys()) | {meta.get('mestreUid')}
    if uid_alvo not in permitidos:
        return jsonify({'ok': False, 'erro': 'esse utilizador não é membro desta campanha'}), 403
    return jsonify(carregar_banco_npc(uid_alvo))


# ----- FASE 12: lojas geridas por NPC lojista -----
# Estoque/preços próprios por loja; compra e venda são VALIDADAS no servidor
# (mesmo princípio do /api/combate/acao da Fase C1): o cliente só pede, o
# servidor confere estoque, preço e ouro, e persiste tudo numa transação só.
def _loja_por_id(estado, loja_id):
    return next((l for l in estado.get('lojas', []) if l.get('id') == loja_id), None)


def _ficha_por_id(estado, ficha_id):
    return next((f for f in estado.get('fichas', []) if f.get('id') == ficha_id), None)


def _pode_usar_ficha(ficha):
    """Jogador só compra/vende com ficha PRÓPRIA; o Mestre com qualquer uma."""
    if session.get('papel') == 'mestre':
        return True
    dono = ficha.get('donoUid')
    return not dono or dono == uid_sessao()  # fichas legadas sem dono: liberadas


@app.route('/api/lojas', methods=['GET'])
@login_obrigatorio()
def api_get_lojas():
    estado = carregar_estado()
    lojas = estado.get('lojas', [])
    if session.get('papel') != 'mestre':
        # jogador só vê lojas de NPCs visíveis (mesmo filtro de /api/npcs)
        visiveis = {n.get('id') for n in estado.get('npcs', []) if n.get('visivelParaJogadores')}
        lojas = [l for l in lojas if l.get('npcId') in visiveis]
    return jsonify(lojas)


@app.route('/api/lojas', methods=['PUT'])
@login_obrigatorio(papeis=['mestre'])
def api_put_lojas():
    lista = request.get_json(force=True)
    if not isinstance(lista, list):
        return jsonify({'ok': False, 'erro': 'esperava uma lista de lojas'}), 400
    estado = carregar_estado()
    estado['lojas'] = [l for l in lista if isinstance(l, dict)]
    salvar_estado(estado)
    return jsonify({'ok': True})


@app.route('/api/lojas/comprar', methods=['POST'])
@login_obrigatorio()
def api_loja_comprar():
    data = request.get_json(force=True) or {}
    qtd = max(1, int(data.get('qtd', 1) or 1))
    estado = carregar_estado()
    loja = _loja_por_id(estado, data.get('lojaId'))
    if not loja:
        return jsonify({'erro': 'Loja não encontrada.'}), 404
    ficha = _ficha_por_id(estado, data.get('fichaId'))
    if not ficha:
        return jsonify({'erro': 'Ficha não encontrada.'}), 404
    if not _pode_usar_ficha(ficha):
        return jsonify({'erro': 'Essa ficha não é sua.'}), 403
    entrada = next((e for e in loja.get('estoque', []) if e.get('nome') == data.get('itemNome')), None)
    if not entrada:
        return jsonify({'erro': 'O lojista não vende esse item.'}), 404
    disponivel = int(entrada.get('qtd', -1))
    if disponivel == 0:
        return jsonify({'erro': 'Esgotado! O lojista não tem mais esse item.'}), 400
    if 0 < disponivel < qtd:
        return jsonify({'erro': f'O lojista só tem {disponivel} unidade(s).'}), 400
    preco_total = max(0, int(entrada.get('precoPO', 0))) * qtd
    ouro = int(ficha.get('ouro', 0) or 0)
    if ouro < preco_total:
        return jsonify({'erro': f'Ouro insuficiente: custa {preco_total} po e a ficha tem {ouro} po.'}), 400
    ficha['ouro'] = ouro - preco_total
    ficha.setdefault('itens', []).extend([entrada['nome']] * qtd)
    if disponivel > 0:
        entrada['qtd'] = disponivel - qtd
    salvar_estado(estado)
    return jsonify({'ok': True, 'ouroRestante': ficha['ouro'], 'qtdRestante': entrada.get('qtd', -1),
                    'total': preco_total})


@app.route('/api/lojas/vender', methods=['POST'])
@login_obrigatorio()
def api_loja_vender():
    data = request.get_json(force=True) or {}
    estado = carregar_estado()
    loja = _loja_por_id(estado, data.get('lojaId'))
    if not loja:
        return jsonify({'erro': 'Loja não encontrada.'}), 404
    compra = loja.get('compraDoJogador') or {}
    if not compra.get('aceita'):
        return jsonify({'erro': 'Este lojista não compra dos aventureiros.'}), 400
    ficha = _ficha_por_id(estado, data.get('fichaId'))
    if not ficha:
        return jsonify({'erro': 'Ficha não encontrada.'}), 404
    if not _pode_usar_ficha(ficha):
        return jsonify({'erro': 'Essa ficha não é sua.'}), 403
    nome = data.get('itemNome')
    itens = ficha.get('itens', [])
    if nome not in itens:
        return jsonify({'erro': 'A ficha não tem esse item.'}), 400
    # o lojista só compra o que conhece: o item precisa existir no estoque
    # (é de lá que vem o preço de referência — o cliente nunca dita valores)
    entrada = next((e for e in loja.get('estoque', []) if e.get('nome') == nome), None)
    if not entrada:
        return jsonify({'erro': 'O lojista não se interessa por esse item.'}), 400
    mult = float(compra.get('multiplicador', 0.5) or 0.5)
    valor = max(0, int(int(entrada.get('precoPO', 0)) * mult))
    itens.remove(nome)
    ficha['itens'] = itens
    ficha['ouro'] = int(ficha.get('ouro', 0) or 0) + valor
    if int(entrada.get('qtd', -1)) >= 0:
        entrada['qtd'] = int(entrada['qtd']) + 1
    salvar_estado(estado)
    return jsonify({'ok': True, 'valor': valor, 'ouroRestante': ficha['ouro']})


# ----- Fase 18.1: Loja Básica/Especial do Modo de Jogo, validada no servidor -----
# Espelho em Python do catálogo de `static/js/equipamento.js` (CATALOGO) — só o
# preço em PO é necessário aqui para validar. Ao adicionar item novo na loja do
# cliente, replicar o preço aqui também (ou a compra passa a ser recusada).
LOJA_BASICA_PRECOS = {
    'Adaga': 2, 'Azagaia': 0.5, 'Bastão': 0.2, 'Clava': 0.1, 'Clava Grande': 0.2,
    'Foice Curta': 1, 'Lança': 1, 'Maça': 5, 'Machadinha': 5, 'Martelo Leve': 2,
    'Arco Curto': 25, 'Besta Leve': 25, 'Dardo': 0.05, 'Funda': 0.1,
    'Alabarda': 20, 'Chicote': 2, 'Cimitarra': 25, 'Espada Curta': 10, 'Espada Grande': 50,
    'Espada Longa': 15, 'Glaive': 20, 'Lança de Cavalaria': 10, 'Lança Longa (Pique)': 5,
    'Maça Estrela': 15, 'Machado de Batalha': 10, 'Machado Grande': 30, 'Malho': 10,
    'Mangual': 10, 'Martelo de Guerra': 15, 'Picareta de Guerra': 5, 'Rapieira': 25, 'Tridente': 5,
    'Arco Longo': 50, 'Besta de Mão': 75, 'Besta Pesada': 50, 'Zarabatana': 10, 'Rede': 1,
    'Flechas (20)': 1, 'Virotes (20)': 1, 'Pedras de Funda (20)': 0.04, 'Agulhas (50)': 1,
    'Armadura Acolchoada': 5, 'Armadura de Couro': 10, 'Couro Batido': 45, 'Gibão de Peles': 10,
    'Camisão de Malha': 50, 'Brunea (Cota de Escamas)': 50, 'Peitoral': 400, 'Meia Armadura': 750,
    'Cota de Malha': 75, 'Cota de Bandas': 200, 'Cota de Placas': 1500, 'Escudo': 10,
    'Foco Arcano (varinha)': 10, 'Foco Arcano (cajado)': 5, 'Foco Arcano (orbe)': 20,
    'Foco Druídico (galho de visco)': 1, 'Símbolo Sagrado (amuleto)': 5, 'Símbolo Sagrado (emblema)': 5,
    'Bolsa de Componentes': 25, 'Grimório': 50, 'Livro de Conhecimento': 25, 'Tinta e Pena': 10,
    'Pergaminhos (10)': 1, 'Vestes de Mago': 1, 'Vestes Sacerdotais': 5,
    'Mochila': 2, 'Saco de Dormir': 1, 'Corda de Cânhamo (15m)': 1, 'Corda de Seda (15m)': 10,
    'Tocha': 0.01, 'Tochas (10)': 0.1, 'Lanterna Coberta': 5, 'Óleo (frasco)': 0.1,
    'Isqueiro (pederneira)': 0.5, 'Rações (1 dia)': 0.5, 'Rações (10 dias)': 5, 'Cantil': 0.2,
    'Kit de Cura': 5, 'Kit de Escalada': 25, 'Ferramentas de Ladrão': 25, 'Kit de Herbalismo': 5,
    'Pé de Cabra': 2, 'Martelo': 1, 'Pitons (10)': 0.5, 'Grappling Hook (arpéu)': 2,
    'Espelho de Aço': 5, 'Água Benta (frasco)': 25, 'Antitoxina (frasco)': 50, 'Velas (5)': 0.05,
    'Giz (10)': 0.1, 'Sino': 1, 'Balde': 0.05, 'Tenda (2 pessoas)': 2, 'Algemas': 2,
    'Corrente (3m)': 5, 'Bálsamo de Cura (pote c/ 3 usos)': 60,
    'Poção de Cura (2d4+2)': 50, 'Poção de Cura Maior (4d4+4)': 150,
    'Frasco de Fogo Alquímico (1d4 fogo)': 50, 'Frasco de Ácido (2d6 ácido)': 25,
    # extras que só existem em ITENS_PADRAO (montarias/instrumentos/nomes legados)
    'Espadão': 50, 'Kit de Suprimentos de Cura': 5, 'Lanterna (Capuz)': 5,
    'Ração de Viagem (1 dia)': 0.5, 'Poção de Cura': 50, 'Bestas Virotes (20)': 1,
    'Kit de Disfarce': 25, 'Suprimentos de Curandeiro': 5, 'Ferramentas de Falsificador': 15,
    'Cavalo de Montaria': 75, 'Pônei': 30, 'Mula': 8, 'Carroça': 35, 'Barco a Remo': 50,
    'Sela': 10, 'Alforje (par)': 4, 'Alaúde': 30, 'Lira': 30, 'Viola': 30, 'Flauta': 2,
    'Corneta': 5, 'Gaita de Foles': 30, 'Tambor': 6, 'Sinos (Instrumento)': 35,
}
# pacotes de munição: nome do item comprado -> (nome que entra em ficha.municao, unidades por pacote)
LOJA_BASICA_MUNICAO = {
    'Flechas (20)': ('Flechas', 20),
    'Virotes (20)': ('Virotes', 20),
    'Pedras de Funda (20)': ('Pedras de Funda', 20),
    'Agulhas (50)': ('Agulhas', 50),
}


def _preco_loja_jogo(estado, ficha, nome):
    """Preço validado no servidor: Loja Básica (catálogo fixo) ou Loja Especial
    (itens curados pelo Mestre em `loja_especial_itens`, só se liberada para
    esta ficha/campanha) — nunca confia no preço que o cliente mandar."""
    if nome in LOJA_BASICA_PRECOS:
        return LOJA_BASICA_PRECOS[nome]
    liberada = bool(estado.get('loja_especial_campanha')) or bool(ficha.get('lojaEspecialLiberada'))
    if liberada:
        entrada = next((e for e in estado.get('loja_especial_itens', []) if e.get('nome') == nome), None)
        if entrada:
            return max(0, float(entrada.get('precoPO', 0) or 0))
    return None


@app.route('/api/loja_base/comprar', methods=['POST'])
@login_obrigatorio()
def api_loja_base_comprar():
    data = request.get_json(force=True) or {}
    nome = data.get('itemNome')
    estado = carregar_estado()
    ficha = _ficha_por_id(estado, data.get('fichaId'))
    if not ficha:
        return jsonify({'erro': 'Ficha não encontrada.'}), 404
    if not _pode_usar_ficha(ficha):
        return jsonify({'erro': 'Essa ficha não é sua.'}), 403
    preco = _preco_loja_jogo(estado, ficha, nome)
    if preco is None:
        return jsonify({'erro': 'Item não encontrado na loja.'}), 404
    ouro = float(ficha.get('ouro', 0) or 0)
    if ouro < preco:
        return jsonify({'erro': f'Ouro insuficiente: custa {preco} po e a ficha tem {ouro} po.'}), 400
    ficha['ouro'] = round(ouro - preco, 2)
    pack = LOJA_BASICA_MUNICAO.get(nome)
    municao = ficha.get('municao') or {'nome': '', 'qtd': 0}
    if pack and (not municao.get('nome') or municao.get('nome') == pack[0]):
        municao['nome'] = pack[0]
        municao['qtd'] = int(municao.get('qtd', 0) or 0) + pack[1]
        ficha['municao'] = municao
    else:
        ficha.setdefault('itens', []).append(nome)
    salvar_estado(estado)
    return jsonify({'ok': True, 'ouroRestante': ficha['ouro'], 'itens': ficha.get('itens', []),
                    'municao': ficha.get('municao')})


@app.route('/api/loja_base/vender', methods=['POST'])
@login_obrigatorio()
def api_loja_base_vender():
    data = request.get_json(force=True) or {}
    nome = data.get('itemNome')
    estado = carregar_estado()
    ficha = _ficha_por_id(estado, data.get('fichaId'))
    if not ficha:
        return jsonify({'erro': 'Ficha não encontrada.'}), 404
    if not _pode_usar_ficha(ficha):
        return jsonify({'erro': 'Essa ficha não é sua.'}), 403
    itens = ficha.get('itens', [])
    if nome not in itens:
        return jsonify({'erro': 'A ficha não tem esse item.'}), 400
    preco = _preco_loja_jogo(estado, ficha, nome)
    if preco is None:
        return jsonify({'erro': 'Esse item não pode ser vendido aqui.'}), 400
    valor = math.floor(preco / 2 * 100) / 100
    itens.remove(nome)
    ficha['itens'] = itens
    equipado = ficha.get('equipado') or {}
    for slot in ('maoPrincipal', 'maoSecundaria', 'armadura', 'foco'):
        if equipado.get(slot) == nome and nome not in itens:
            equipado[slot] = ''
    ficha['equipado'] = equipado
    ficha['ouro'] = round(float(ficha.get('ouro', 0) or 0) + valor, 2)
    salvar_estado(estado)
    return jsonify({'ok': True, 'valor': valor, 'ouroRestante': ficha['ouro'], 'itens': itens, 'equipado': equipado})


# ----- K2 (livro-jogo): biblioteca PESSOAL de aventuras + aventura ativa -----
# A DEFINIÇÃO da aventura (grafo de nós/escolhas) vive na biblioteca do autor
# (aventuras/<uid>, fora da campanha — mesmo padrão do banco de NPCs M4).
# O PROGRESSO vive no estado da campanha ('aventura_ativa'): ao iniciar, a
# definição é COPIADA (snapshot) para a mesa — editar a biblioteca depois não
# muda uma aventura já em curso, e a mesma aventura pode rodar em N mesas.
AVENTURAS_FILE = os.path.join(DATA_DIR, 'aventuras.json')
COLECAO_AVENTURAS = 'aventuras'
AVENTURAS_MAX = 50


def carregar_aventuras(uid):
    if db is not None:
        snap = db.collection(COLECAO_AVENTURAS).document(uid).get()
        return (snap.to_dict() or {}).get('aventuras', []) if snap.exists else []
    return (_carregar_docs(COLECAO_AVENTURAS, AVENTURAS_FILE).get(uid) or {}).get('aventuras', [])


def salvar_aventuras(uid, aventuras):
    _salvar_doc(COLECAO_AVENTURAS, AVENTURAS_FILE, uid, {'aventuras': aventuras, 'atualizadoEm': _agora()})


@app.route('/api/aventuras', methods=['GET'])
@login_obrigatorio()
def api_get_aventuras():
    return jsonify(carregar_aventuras(uid_sessao()))


@app.route('/api/aventuras', methods=['PUT'])
@login_obrigatorio()
def api_put_aventuras():
    lista = request.get_json(force=True)
    if not isinstance(lista, list):
        return jsonify({'ok': False, 'erro': 'esperava uma lista de aventuras'}), 400
    lista = [a for a in lista if isinstance(a, dict)][:AVENTURAS_MAX]
    salvar_aventuras(uid_sessao(), lista)
    return jsonify({'ok': True, 'total': len(lista)})


# P3 (livro-jogo): PARTILHA — o Mestre lê a biblioteca de aventuras de um
# MEMBRO da campanha ativa para importar (copiar) uma. Mesmo princípio de
# validação de membresia do /api/banco_npc/<uid>: só-Mestre e só de quem
# participa desta campanha.
@app.route('/api/aventuras/<uid_alvo>', methods=['GET'])
@login_obrigatorio(papeis=['mestre'])
def api_get_aventuras_membro(uid_alvo):
    cid = campanha_atual()
    meta = carregar_campanhas_meta().get(cid)
    if not meta:
        return jsonify({'ok': False, 'erro': 'campanha legada não tem membros geridos'}), 400
    permitidos = set((meta.get('membros') or {}).keys()) | {meta.get('mestreUid')}
    if uid_alvo not in permitidos:
        return jsonify({'ok': False, 'erro': 'esse utilizador não é membro desta campanha'}), 403
    return jsonify(carregar_aventuras(uid_alvo))


def _no_da_aventura(definicao, no_id):
    return next((n for n in (definicao or {}).get('nos', []) if n.get('id') == no_id), None)


@app.route('/api/aventura_ativa', methods=['GET'])
@login_obrigatorio()
def api_get_aventura_ativa():
    ativa = carregar_estado().get('aventura_ativa')
    if session.get('papel') != 'mestre':
        # P1: o jogador vê a narração PÚBLICA do nó atual (nunca as
        # notasMestre) e, quando o Mestre abre a votação, as escolhas e
        # os votos da mesa — o filtro é no servidor, como em /api/npcs
        if not ativa:
            return jsonify(None)
        definicao = ativa.get('definicao') or {}
        no = _no_da_aventura(definicao, ativa.get('noAtual'))
        publico = {
            'titulo': definicao.get('titulo', 'Aventura'), 'emCurso': True,
            'no': {'titulo': no.get('titulo', ''), 'tipo': no.get('tipo', 'narracao'),
                   'narracao': no.get('narracao', '')} if no else None,
            'escolhasAbertas': bool(ativa.get('escolhasAbertas')),
        }
        if publico['escolhasAbertas'] and no:
            publico['saidas'] = [{'para': s.get('para'), 'rotulo': s.get('rotulo', ''),
                                  'aviso': s.get('aviso', '')} for s in (no.get('saidas') or [])]
            votos = ativa.get('votos') or {}
            publico['votos'] = [{'nome': v.get('nome', '?'), 'para': v.get('para')} for v in votos.values()]
            meu = votos.get(uid_sessao())
            publico['meuVoto'] = meu.get('para') if meu else None
        return jsonify(publico)
    return jsonify(ativa)


@app.route('/api/aventura_ativa/votar', methods=['POST'])
@login_obrigatorio()
def api_aventura_votar():
    """Jogador vota numa escolha do nó atual (só com a votação aberta)."""
    data = request.get_json(force=True) or {}
    estado = carregar_estado()
    ativa = estado.get('aventura_ativa')
    if not ativa or not ativa.get('escolhasAbertas'):
        return jsonify({'ok': False, 'erro': 'a votação não está aberta'}), 400
    no = _no_da_aventura(ativa.get('definicao'), ativa.get('noAtual'))
    destino = data.get('para')
    if not no or not any(s.get('para') == destino for s in (no.get('saidas') or [])):
        return jsonify({'ok': False, 'erro': 'essa escolha não existe no nó atual'}), 400
    nome = session.get('nomeExibicao') or session.get('usuario') or 'Jogador'
    ativa.setdefault('votos', {})[uid_sessao()] = {'para': destino, 'nome': nome}
    salvar_estado(estado)
    return jsonify({'ok': True, 'totalVotos': len(ativa['votos'])})


@app.route('/api/aventura_ativa', methods=['POST'])
@login_obrigatorio(papeis=['mestre'])
def api_post_aventura_ativa():
    """Inicia (snapshot da definição), atualiza o progresso ou encerra."""
    data = request.get_json(force=True) or {}
    estado = carregar_estado()
    if data.get('encerrar'):
        estado['aventura_ativa'] = None
        salvar_estado(estado)
        return jsonify({'ok': True})
    if 'definicao' in data:  # iniciar aventura (snapshot completo)
        definicao = data['definicao']
        if not isinstance(definicao, dict) or not definicao.get('nos'):
            return jsonify({'ok': False, 'erro': 'definição inválida (sem nós)'}), 400
        no_inicial = definicao.get('noInicial') or (definicao['nos'][0].get('id') if definicao['nos'] else None)
        if not any(n.get('id') == no_inicial for n in definicao['nos']):
            return jsonify({'ok': False, 'erro': 'nó inicial não existe na aventura'}), 400
        estado['aventura_ativa'] = {
            'definicao': definicao,
            'noAtual': no_inicial,
            'historico': [no_inicial],
            'nosCompletados': {},
            'iniciadaEm': _agora(),
        }
        salvar_estado(estado)
        return jsonify({'ok': True, 'noAtual': no_inicial})
    # atualizar progresso (avançar de nó / completar nó / abrir votação)
    ativa = estado.get('aventura_ativa')
    if not ativa:
        return jsonify({'ok': False, 'erro': 'não há aventura em curso'}), 400
    if 'noAtual' in data:
        destino = data['noAtual']
        if not any(n.get('id') == destino for n in (ativa.get('definicao') or {}).get('nos', [])):
            return jsonify({'ok': False, 'erro': 'nó de destino não existe'}), 400
        ativa['noAtual'] = destino
        ativa.setdefault('historico', []).append(destino)
        # avançar fecha a votação e limpa os votos do nó anterior
        ativa['escolhasAbertas'] = False
        ativa['votos'] = {}
    if 'completarNo' in data:
        ativa.setdefault('nosCompletados', {})[data['completarNo']] = {'vencido': True, 'em': _agora()}
    if 'abrirEscolhas' in data:  # P1: True abre a votação (zera votos), False fecha
        ativa['escolhasAbertas'] = bool(data['abrirEscolhas'])
        if ativa['escolhasAbertas']:
            ativa['votos'] = {}
    salvar_estado(estado)
    return jsonify({'ok': True, 'noAtual': ativa['noAtual']})


# ----- FASE 16.2: Tabuleiro-imagem — abrir/fechar o mapa aos jogadores -----
# O estado vive no doc da campanha ('tabuleiro'), então flui aos jogadores pelo
# tempo real (firebase-rt.js) junto com o resto do estado. O render ao vivo dos
# tokens sobre a imagem é a Fase 16.3; aqui só guardamos aberto/imagemUrl.
@app.route('/api/tabuleiro', methods=['GET'])
@login_obrigatorio()
def api_get_tabuleiro():
    tab = carregar_estado().get('tabuleiro') or {'aberto': False, 'imagemUrl': None}
    return jsonify(tab)


@app.route('/api/tabuleiro', methods=['POST'])
@login_obrigatorio(papeis=['mestre'])
def api_post_tabuleiro():
    data = request.get_json(force=True) or {}
    estado = carregar_estado()
    tab = dict(estado.get('tabuleiro') or {})
    if 'aberto' in data:
        tab['aberto'] = bool(data['aberto'])
    if 'imagemUrl' in data:
        url = data['imagemUrl']
        tab['imagemUrl'] = str(url) if url else None
    if 'travado' in data:  # Fase 16.5: trava o movimento dos jogadores
        tab['travado'] = bool(data['travado'])
    if not tab.get('imagemUrl'):
        tab['aberto'] = False  # sem imagem não há o que abrir
    tab['atualizadoEm'] = _agora()
    estado['tabuleiro'] = tab
    salvar_estado(estado)
    return jsonify({'ok': True, 'tabuleiro': tab})


# Fase 16.3/16.5: mover (x,y em %) e/ou redimensionar (tam) o token de um PJ.
# Qualquer membro chama, mas: o Mestre mexe em qualquer token; o jogador só na
# ficha PRÓPRIA (_pode_usar_ficha) e SÓ SE o mapa não estiver travado; e o
# tamanho (tam) só o Mestre altera. Devolve o tabuleiro para render imediato.
@app.route('/api/tabuleiro/token', methods=['POST'])
@login_obrigatorio()
def api_post_tabuleiro_token():
    data = request.get_json(force=True) or {}
    fid = data.get('id')
    estado = carregar_estado()
    ficha = _ficha_por_id(estado, fid)
    if not ficha:
        return jsonify({'ok': False, 'erro': 'ficha não encontrada'}), 404
    if not _pode_usar_ficha(ficha):
        return jsonify({'ok': False, 'erro': 'sem permissão para mover este token'}), 403
    eh_mestre = session.get('papel') == 'mestre'
    tab = dict(estado.get('tabuleiro') or {})
    tokens = dict(tab.get('tokens') or {})
    entry = dict(tokens.get(fid) or {})
    mexeu = False
    if data.get('x') is not None and data.get('y') is not None:  # mover
        if not eh_mestre and tab.get('travado'):
            return jsonify({'ok': False, 'erro': 'o mapa está travado pelo Mestre'}), 403
        try:
            entry['x'] = round(max(0.0, min(100.0, float(data['x']))), 2)
            entry['y'] = round(max(0.0, min(100.0, float(data['y']))), 2)
        except (TypeError, ValueError):
            return jsonify({'ok': False, 'erro': 'coordenadas inválidas'}), 400
        mexeu = True
    if 'tam' in data and eh_mestre:  # redimensionar: só o Mestre
        try:
            entry['tam'] = round(max(0.3, min(3.0, float(data['tam']))), 2)
        except (TypeError, ValueError):
            return jsonify({'ok': False, 'erro': 'tamanho inválido'}), 400
        mexeu = True
    if not mexeu:
        return jsonify({'ok': False, 'erro': 'nada a atualizar'}), 400
    tokens[fid] = entry
    tab['tokens'] = tokens
    tab['atualizadoEm'] = _agora()
    estado['tabuleiro'] = tab
    salvar_estado(estado)
    return jsonify({'ok': True, 'tabuleiro': tab})


# Fase 16.4: tokens de MONSTRO no tabuleiro — só o Mestre adiciona/move/remove.
# Um POST faz uma das três coisas: adicionar (sem id → cria instância), mover
# (id + x,y) ou remover (id + remover:true). Sem imagem, o cliente usa o ícone
# da categoria como fallback.
@app.route('/api/tabuleiro/monstro', methods=['POST'])
@login_obrigatorio(papeis=['mestre'])
def api_post_tabuleiro_monstro():
    data = request.get_json(force=True) or {}
    estado = carregar_estado()
    tab = dict(estado.get('tabuleiro') or {})
    monstros = dict(tab.get('monstros') or {})
    mid = data.get('id')
    if data.get('remover'):
        if mid:
            monstros.pop(str(mid), None)
    elif mid:  # editar instância existente (mover e/ou redimensionar)
        m = dict(monstros.get(str(mid)) or {})
        if not m:
            return jsonify({'ok': False, 'erro': 'monstro não está no mapa'}), 404
        if data.get('x') is not None and data.get('y') is not None:
            try:
                m['x'] = round(max(0.0, min(100.0, float(data['x']))), 2)
                m['y'] = round(max(0.0, min(100.0, float(data['y']))), 2)
            except (TypeError, ValueError):
                return jsonify({'ok': False, 'erro': 'coordenadas inválidas'}), 400
        if 'tam' in data:  # Fase 16.5: redimensionar
            try:
                m['tam'] = round(max(0.3, min(3.0, float(data['tam']))), 2)
            except (TypeError, ValueError):
                return jsonify({'ok': False, 'erro': 'tamanho inválido'}), 400
        monstros[str(mid)] = m
    else:  # adicionar nova instância
        nome = str(data.get('nome') or 'Monstro')[:60]
        novo_id = 'm_' + uuid.uuid4().hex[:8]
        idx = len(monstros)
        monstros[novo_id] = {
            'nome': nome,
            'categoria': str(data.get('categoria') or '')[:40],
            'imagemUrl': (str(data['imagemUrl']) if data.get('imagemUrl') else None),
            'x': round(8 + (idx * 11) % 84, 2),
            'y': 14.0,
        }
    tab['monstros'] = monstros
    tab['atualizadoEm'] = _agora()
    estado['tabuleiro'] = tab
    salvar_estado(estado)
    return jsonify({'ok': True, 'tabuleiro': tab})


# ----- FASE 10.8: token do Firebase Auth para o tempo real seguro -----
# O cliente (firebase-rt.js) troca a sessão Flask por um token personalizado
# do Firebase Auth; as Regras do Firestore (firestore.rules) validam a
# membresia por campanha. Sem Firestore ativo (modo local), avisa e o cliente
# simplesmente não usa tempo real (o polling de fallback continua).
@app.route('/api/firebase_token')
@login_obrigatorio()
def api_firebase_token():
    if db is None:
        return jsonify({'disponivel': False})
    try:
        from firebase_admin import auth as fb_auth
        uid = session.get('uid') or f"legacy:{session.get('usuario', '')}"
        claims = {}
        if uid.startswith('legacy:'):
            claims['legado'] = True
            if session.get('papelGlobal') == 'mestre':
                claims['legadoMestre'] = True
        token = fb_auth.create_custom_token(uid, claims or None)
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        return jsonify({'disponivel': True, 'token': token})
    except Exception as e:  # pragma: no cover — ex.: service account sem permissão de assinar
        print('[Firebase] Falha ao emitir token de Auth:', e)
        return jsonify({'disponivel': False, 'erro': 'token indisponível'})


# ----- FASE 10: informações da campanha ativa (aba Membros do Mestre) -----
@app.route('/api/campanha_info', methods=['GET'])
@login_obrigatorio()
def api_campanha_info():
    cid = campanha_atual()
    meta = carregar_campanhas_meta().get(cid)
    if not meta:
        return jsonify({'id': cid, 'nome': cid, 'legado': True, 'membros': []})
    usuarios = carregar_usuarios_reg()
    eh_mestre = session.get('papel') == 'mestre'
    membros = []
    for muid, mpapel in (meta.get('membros') or {}).items():
        u = usuarios.get(muid, {})
        membros.append({'uid': muid, 'nome': u.get('nomeExibicao') or u.get('usuario') or muid, 'papel': mpapel})
    mestre_u = usuarios.get(meta.get('mestreUid'), {})
    return jsonify({
        'id': cid, 'nome': meta.get('nome', cid), 'legado': False,
        'mestre': mestre_u.get('nomeExibicao') or mestre_u.get('usuario') or meta.get('mestreUid'),
        'codigoConvite': meta.get('codigoConvite') if eh_mestre else None,
        'membros': membros,
    })


@app.route('/api/campanha_remover_membro', methods=['POST'])
@login_obrigatorio(papeis=['mestre'])
def api_campanha_remover_membro():
    cid = campanha_atual()
    metas = carregar_campanhas_meta()
    meta = metas.get(cid)
    if not meta:
        return jsonify({'ok': False, 'erro': 'campanha legada não tem membros geridos'}), 400
    alvo = (request.get_json(force=True) or {}).get('uid', '')
    if alvo in (meta.get('membros') or {}):
        del meta['membros'][alvo]
        salvar_campanha_meta(cid, meta)
    return jsonify({'ok': True})


if __name__ == '__main__':
    porta = int(os.environ.get('PORT', 5300))
    app.run(host='0.0.0.0', port=porta, debug=os.environ.get('FLASK_DEBUG') == '1')
