import json
import os
import re
import secrets
import uuid
from datetime import datetime, timezone
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
    'tabuleiro': {'aberto': False, 'imagemUrl': None, 'atualizadoEm': None},  # Fase 16.2: mapa/imagem aberto aos jogadores
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


def salvar_estado(estado):
    if db is not None:
        db.collection(COLECAO_CAMPANHA).document(campanha_atual()).set(estado)
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
            # Fase 10.9: contas registadas precisam de trial/assinatura em dia
            # (contas legadas de env não passam por aqui — uid 'legacy:*')
            uid = session.get('uid', '')
            if exigir_assinatura and uid and not uid.startswith('legacy:'):
                u = carregar_usuario_reg(uid)
                if not assinatura_valida(u):
                    if request.path.startswith('/api/'):
                        return jsonify({'erro': 'assinatura', 'detalhe': 'trial/assinatura expirada'}), 402
                    return redirect(url_for('pagina_assinatura'))
            return fn(*args, **kwargs)
        return wrapper
    return decorador


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
            })
            session.clear()
            session['usuario'] = usuario
            session['nomeExibicao'] = nome
            session['uid'] = uid
            session['papelGlobal'] = 'jogador'
            session['papel'] = 'jogador'
            return redirect(url_for('pagina_campanhas'))
    return render_template('registro.html', erro=erro, trial_dias=TRIAL_DIAS, preco=ASSINATURA_PRECO)


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
            salvar_usuario_reg(alvo, u)
    usuarios = []
    for uid_u, u in sorted(carregar_usuarios_reg().items(), key=lambda kv: kv[1].get('criadoEm', ''), reverse=True):
        usuarios.append({
            'uid': uid_u, 'usuario': u.get('usuario'), 'nome': u.get('nomeCompleto') or u.get('nomeExibicao'),
            'email': u.get('email', ''), 'cpf': u.get('cpf', ''), 'whatsapp': u.get('whatsapp', ''),
            'criadoEm': (u.get('criadoEm') or '')[:10], 'status': status_assinatura(u),
            'trialAte': (u.get('trialAte') or '')[:10], 'pagaAte': (u.get('pagaAte') or '')[:10],
            'pagamentoInfo': u.get('pagamentoInfo'),
        })
    return render_template('admin_assinaturas.html', usuarios=usuarios, msg=msg,
                           preco=ASSINATURA_PRECO, trial_dias=TRIAL_DIAS)


# ----- Minhas Campanhas (contas registadas; o mestre legado também pode usar) -----
@app.route('/campanhas')
@login_obrigatorio()
def pagina_campanhas():
    uid = session.get('uid', '')
    metas = carregar_campanhas_meta()
    minhas = []
    for cid, m in metas.items():
        papel = 'mestre' if (m.get('mestreUid') == uid or eh_legado_mestre(uid)) else ('jogador' if uid in (m.get('membros') or {}) else None)
        if papel:
            minhas.append({'id': cid, 'nome': m.get('nome', cid), 'papel': papel,
                           'codigo': m.get('codigoConvite') if papel == 'mestre' else None,
                           'ativa': cid == campanha_atual()})
    minhas.sort(key=lambda c: c['nome'].lower())
    return render_template('campanhas.html', campanhas=minhas, erro=request.args.get('erro'),
                           usuario=session.get('nomeExibicao') or session.get('usuario'),
                           legado_mestre=eh_legado_mestre(uid))


@app.route('/campanha/nova', methods=['POST'])
@login_obrigatorio()
def campanha_nova():
    uid = session.get('uid', '')
    nome = request.form.get('nome', '').strip()[:48]
    if not nome:
        return redirect(url_for('pagina_campanhas', erro='Dê um nome à campanha.'))
    cid = 'camp_' + uuid.uuid4().hex[:10]
    salvar_campanha_meta(cid, {
        'nome': nome,
        'mestreUid': uid,
        'membros': {},
        'codigoConvite': gerar_codigo_convite(nome),
        'ativa': True,
        'criadaEm': _agora(),
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
    session['campanha'] = cid
    session['papel'] = papel
    return redirect(url_for('index'))


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
    - `xp` é sempre preservado do valor gravado (B2: XP só via Mestre);
    - `donoUid` não pode ser reatribuído (evita roubo/troca de dono);
    - revivência (morto->vivo) fica com o Mestre; morrer (vivo->morto) é livre.
    NOTA: `ouro` continua editável na ficha própria porque a loja base do Modo
    de Jogo debita no cliente — travá-lo aqui quebraria a compra. O fix
    definitivo é validar a loja base no servidor (como as lojas de NPC)."""
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
        f['donoUid'] = antiga.get('donoUid')
        f['xp'] = antiga.get('xp', 0)
        if antiga.get('status') == 'morto':
            f['status'] = 'morto'
        saida.append(f)
    # fichas gravadas que o cliente omitiu: preserva as de OUTROS donos
    # (apagar a própria continua a funcionar — some do payload e não é readicionada)
    for fid, antiga in por_id.items():
        if fid not in vistos and antiga.get('donoUid') not in (None, meu_uid):
            saida.append(antiga)
    return saida


@app.route('/api/fichas', methods=['PUT'])
@login_obrigatorio()
def api_put_fichas():
    estado = carregar_estado()
    recebidas = request.get_json(force=True)
    if not isinstance(recebidas, list):
        return jsonify({'ok': False, 'erro': 'esperava uma lista de fichas'}), 400
    if session.get('papel') == 'mestre':
        estado['fichas'] = [f for f in recebidas if isinstance(f, dict)]
    else:
        estado['fichas'] = _sanitizar_fichas_jogador(recebidas, estado.get('fichas', []), uid_sessao())
    salvar_estado(estado)
    return jsonify({'ok': True})


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
    if not tab.get('imagemUrl'):
        tab['aberto'] = False  # sem imagem não há o que abrir
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
