import json
import os
import re
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash

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


def login_obrigatorio(papeis=None):
    def decorador(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if 'usuario' not in session:
                return redirect(url_for('login'))
            if papeis and session.get('papel') not in papeis:
                return redirect(url_for('index'))
            return fn(*args, **kwargs)
        return wrapper
    return decorador


@app.route('/')
def index():
    if 'usuario' not in session:
        return redirect(url_for('login'))
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
            session['usuario'] = usuario
            session['papel'] = dados['papel']
            return redirect(url_for('index'))
        erro = 'Usuário ou senha inválidos.'
    return render_template('login.html', erro=erro)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/mestre')
@login_obrigatorio(papeis=['mestre'])
def mestre():
    return render_template('mestre.html', usuario=session['usuario'], campanha=campanha_atual(),
                           use_local=(db is None))


@app.route('/jogador')
@login_obrigatorio(papeis=['mestre', 'jogador'])
def jogador():
    return render_template('jogador.html', usuario=session['usuario'], campanha=campanha_atual(),
                           use_local=(db is None))


@app.route('/campanha', methods=['POST'])
@login_obrigatorio(papeis=['mestre'])
def trocar_campanha():
    c = re.sub(r'[^a-zA-Z0-9_-]', '', request.form.get('campanha', '').strip())
    session['campanha'] = c or 'principal'
    return redirect(url_for('mestre'))


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


if __name__ == '__main__':
    porta = int(os.environ.get('PORT', 5300))
    app.run(host='0.0.0.0', port=porta, debug=os.environ.get('FLASK_DEBUG') == '1')
