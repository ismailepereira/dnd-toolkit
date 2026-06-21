import json
import os
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, session, url_for

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

DOC_CAMPANHA = ('campanha', 'principal')  # coleção, documento


def carregar_estado():
    if db is not None:
        ref = db.collection(DOC_CAMPANHA[0]).document(DOC_CAMPANHA[1])
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
    if not os.path.exists(DATA_FILE):
        salvar_estado(ESTADO_PADRAO)
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        estado = json.load(f)
    for chave, valor in ESTADO_PADRAO.items():
        estado.setdefault(chave, valor)
    return estado


def salvar_estado(estado):
    if db is not None:
        db.collection(DOC_CAMPANHA[0]).document(DOC_CAMPANHA[1]).set(estado)
        return
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
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
        if dados and dados['senha'] == senha:
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
    return render_template('mestre.html', usuario=session['usuario'])


@app.route('/jogador')
@login_obrigatorio(papeis=['mestre', 'jogador'])
def jogador():
    return render_template('jogador.html', usuario=session['usuario'])


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


if __name__ == '__main__':
    porta = int(os.environ.get('PORT', 5300))
    app.run(host='0.0.0.0', port=porta, debug=os.environ.get('FLASK_DEBUG') == '1')
