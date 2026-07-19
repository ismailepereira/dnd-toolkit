#!/usr/bin/env python3
"""Testes do servidor de fichas (schema v2 + PATCH com trava otimista).

Roda com:  python3 tests/test-servidor.py
Usa o test_client do Flask com DATA_DIR descartável — nunca toca na data/ real.
"""
import os
import sys
import tempfile

# ambiente ANTES de importar o app (USUARIOS e DATA_DIR são lidos no import)
_tmp = tempfile.mkdtemp(prefix='dnd-teste-')
os.environ['DATA_DIR'] = _tmp
os.environ['SECRET_KEY'] = 'apenas-teste'
os.environ['MESTRE_USER'] = 'mestre-teste'
os.environ['MESTRE_SENHA'] = 'senha-teste-123'
os.environ['JOGADOR_USER'] = 'jogador-teste'
os.environ['JOGADOR_SENHA'] = 'senha-teste-456'

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from app import app  # noqa: E402
import app as servidor  # noqa: E402  (acesso às funções de cobrança p/ testar o MODO LIVRE)

falhas = []
total = 0


def t(nome, cond, extra=''):
    global total
    total += 1
    print(('✅' if cond else '❌') + ' ' + nome + (f' — {extra}' if extra and not cond else ''))
    if not cond:
        falhas.append(nome)


def logar(cli, usuario, senha):
    r = cli.post('/login', data={'usuario': usuario, 'senha': senha}, follow_redirects=False)
    assert r.status_code in (301, 302), f'login falhou: {r.status_code}'


mestre = app.test_client()
logar(mestre, 'mestre-teste', 'senha-teste-123')

# ----- PUT normaliza + carimba (schema v2) -----
ficha_suja = {
    'id': 'f1', 'nome': 'X' * 500, 'classe': 'Bruxo', 'raca': 'Tiefling',
    'nivel': 999, 'hpMax': 24, 'hpAtual': 24, 'ca': 13, 'xp': -50,
    'atributos': {'for': 99, 'des': 14, 'con': 14, 'int': 0, 'sab': True, 'car': 16},
    'pericias': ['Arcanismo', 123, None, 'Enganação'],
    'divindade': 'Shar', 'patrono': 'Asmodeus',
}
r = mestre.put('/api/fichas', json=[ficha_suja])
t('PUT aceita a ficha (normaliza em vez de rejeitar)', r.status_code == 200, str(r.status_code))

f = mestre.get('/api/fichas').get_json()[0]
t('nível clampado a 20', f['nivel'] == 20, str(f.get('nivel')))
t('nome cortado no limite (80)', len(f['nome']) == 80, str(len(f.get('nome', ''))))
t('atributo alto clampado a 30', f['atributos']['for'] == 30, str(f['atributos']))
t('atributo 0 clampado a 1', f['atributos']['int'] == 1, str(f['atributos']))
t('bool em atributo vira padrão 10', f['atributos']['sab'] == 10, str(f['atributos']))
t('xp negativo vira 0', f['xp'] == 0, str(f.get('xp')))
t('lixo removido de listas de strings', f['pericias'] == ['Arcanismo', '123', 'Enganação'], str(f.get('pericias')))
t('schemaVersion carimbado', f.get('schemaVersion') == 2, str(f.get('schemaVersion')))
t('atualizadoEm carimbado', bool(f.get('atualizadoEm')), str(f.get('atualizadoEm')))
carimbo1 = f['atualizadoEm']

# ----- PUT sem mudança de conteúdo NÃO avança o carimbo -----
r = mestre.put('/api/fichas', json=[f])
f2 = mestre.get('/api/fichas').get_json()[0]
t('salvar sem mudar nada preserva atualizadoEm', f2['atualizadoEm'] == carimbo1,
  f"{f2.get('atualizadoEm')} != {carimbo1}")

# ----- PATCH altera uma ficha só -----
f2['hpAtual'] = 10
r = mestre.patch('/api/fichas/f1', json={'ficha': f2, 'baseAtualizadoEm': carimbo1})
t('PATCH com carimbo certo grava', r.status_code == 200, str(r.status_code))
d = r.get_json()
t('PATCH devolve a ficha gravada', d.get('ficha', {}).get('hpAtual') == 10, str(d))
carimbo2 = d['ficha']['atualizadoEm']
t('conteúdo mudou → atualizadoEm avança', carimbo2 != carimbo1, carimbo2)

# ----- trava otimista: carimbo velho → 409 -----
f2['hpAtual'] = 5
r = mestre.patch('/api/fichas/f1', json={'ficha': f2, 'baseAtualizadoEm': carimbo1})
t('PATCH com carimbo velho leva 409 (conflito)', r.status_code == 409, str(r.status_code))
t('409 devolve a versão atual da ficha', r.get_json().get('ficha', {}).get('hpAtual') == 10, str(r.get_json()))

# ----- PATCH em ficha inexistente → 404 -----
r = mestre.patch('/api/fichas/nao-existe', json={'ficha': {'nome': 'x'}})
t('PATCH em id inexistente leva 404', r.status_code == 404, str(r.status_code))

# ----- papel jogador: posse e campos protegidos -----
# mestre grava uma ficha de OUTRO dono e uma legada (sem dono)
fichas_agora = mestre.get('/api/fichas').get_json()
fichas_agora.append({'id': 'f2', 'nome': 'De Outro', 'donoUid': 'u_outra_pessoa', 'nivel': 3, 'xp': 500, 'ouro': 77})
fichas_agora.append({'id': 'f3', 'nome': 'Legada', 'nivel': 2, 'xp': 100, 'ouro': 20})
mestre.put('/api/fichas', json=fichas_agora)

jogador = app.test_client()
logar(jogador, 'jogador-teste', 'senha-teste-456')

r = jogador.patch('/api/fichas/f2', json={'ficha': {'id': 'f2', 'nome': 'Roubada'}})
t('jogador NÃO edita ficha de outro dono (403)', r.status_code == 403, str(r.status_code))

r = jogador.patch('/api/fichas/f3', json={'ficha': {'id': 'f3', 'nome': 'Legada Editada', 'nivel': 2, 'xp': 99999, 'ouro': 99999}})
t('jogador edita ficha legada (sem dono)', r.status_code == 200, str(r.status_code))
d = r.get_json().get('ficha', {})
t('xp do jogador é preservado do servidor (B2)', d.get('xp') == 100, str(d.get('xp')))
t('ouro do jogador é preservado do servidor (B2)', d.get('ouro') == 20, str(d.get('ouro')))
t('nome novo do jogador entrou', d.get('nome') == 'Legada Editada', str(d.get('nome')))

# ----- MODO LIVRE (temporário): limitação e cobrança desligadas -----
t('MODO_LIVRE está LIGADO por padrão (pedido de 2026-07-19)', servidor.MODO_LIVRE is True)
with app.test_request_context('/'):
    vencida = {'mestreUid': 'u_pagante', 'pagaAte': '2000-01-01T00:00:00+00:00'}
    t('campanha vencida NÃO fica só-leitura no modo livre', servidor.campanha_paga_em_dia(vencida) is True)
    t('nenhuma campanha é "cobrável" no modo livre (sem limite de fichas)',
      servidor.campanha_cobravel('camp_qualquer') is False)
    t('ciclo de vida não marca inativa nem apaga no modo livre',
      servidor.ciclo_campanha('camp_x', dict(vencida)) is not None)

print()
print(f'❌ {len(falhas)} falha(s) de {total}' if falhas else f'✅ {total} testes do servidor passaram')
sys.exit(1 if falhas else 0)
