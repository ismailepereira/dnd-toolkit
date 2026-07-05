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
DATA_FILE = os.path.join(BASE_DIR, 'data', 'estado.json')

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
    'combate': {'combatentes': [], 'turno': 0, 'rodada': 1, 'log': []},
    'notas': [],       # notas/handouts do Mestre (com flag 'compartilhada' p/ jogadores)
    'encontros': [],   # encontros salvos do montador (lançáveis no combate)
    'itens_mestre': [],  # itens mágicos criados pelo Mestre (fora do acervo/loja do jogador)
    'loja_especial_campanha': False,  # Fase 9: libera a Loja Especial (itens mágicos) p/ toda a campanha
    'loja_especial_itens': [],  # Fase 9c: itens CURADOS pelo Mestre na Loja Especial [{nome, precoPO}]
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
USUARIOS_FILE = os.path.join(BASE_DIR, 'data', 'usuarios.json')
CAMPMETA_FILE = os.path.join(BASE_DIR, 'data', 'campanhas_meta.json')
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
    return os.path.join(BASE_DIR, 'data', nome)


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


@app.route('/api/fichas', methods=['PUT'])
@login_obrigatorio()
def api_put_fichas():
    estado = carregar_estado()
    estado['fichas'] = request.get_json(force=True) or []
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
