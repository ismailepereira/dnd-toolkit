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

# ----- T2: finalizar turno (proximo_turno) com permissão -----
# monta um combate: jogador tem a ficha f3 (legada, sem dono → editável por ele);
# a vez começa nela; um monstro em seguida.
estado_atual = mestre.get('/api/combate').get_json()
combate_teste = {
    'combatentes': [
        {'id': 'c1', 'tipo': 'pc', 'fichaId': 'f3', 'nome': 'Legada', 'iniciativa': 20, 'hpAtual': 10, 'hpMax': 10, 'ca': 12},
        {'id': 'c2', 'tipo': 'monstro', 'nome': 'Goblin', 'iniciativa': 5, 'hpAtual': 7, 'hpMax': 7, 'ca': 15},
    ], 'turno': 0, 'rodada': 1, 'log': [], 'ativo': True,
}
mestre.put('/api/combate', json=combate_teste)

# na vez da ficha do jogador (turno 0 = c1/f3): ele finaliza → passa para o Goblin
r = jogador.post('/api/combate/acao', json={'acao': 'proximo_turno'})
t('jogador finaliza a PRÓPRIA vez (200)', r.status_code == 200, str(r.status_code))
cb = mestre.get('/api/combate').get_json()
t('turno avançou para o próximo combatente', cb.get('turno') == 1, str(cb.get('turno')))

# agora é a vez do Goblin (não é PJ do jogador) → jogador NÃO pode finalizar
r = jogador.post('/api/combate/acao', json={'acao': 'proximo_turno'})
t('jogador NÃO finaliza a vez de outro (403 nao_e_sua_vez)', r.status_code == 403 and r.get_json().get('erro') == 'nao_e_sua_vez', str(r.status_code))

# o Mestre pode finalizar qualquer turno → volta o ciclo e incrementa a rodada
r = mestre.post('/api/combate/acao', json={'acao': 'proximo_turno'})
cb = mestre.get('/api/combate').get_json()
t('Mestre finaliza qualquer vez; vira a rodada', r.status_code == 200 and cb.get('turno') == 0 and cb.get('rodada') == 2, f"turno={cb.get('turno')} rodada={cb.get('rodada')}")

# ----- T4: entrar no combate (rolar a própria iniciativa) -----
# começa um combate só com o Goblin; o jogador entra com a ficha f3 (legada, dele)
mestre.put('/api/combate', json={
    'combatentes': [{'id': 'g1', 'tipo': 'monstro', 'nome': 'Goblin', 'iniciativa': 12, 'hpAtual': 7, 'hpMax': 7, 'ca': 15}],
    'turno': 0, 'rodada': 1, 'log': [], 'ativo': True,
})
r = jogador.post('/api/combate/acao', json={'acao': 'entrar_combate', 'fichaId': 'f3'})
t('jogador entra no combate rolando iniciativa (200)', r.status_code == 200 and 1 <= r.get_json().get('iniciativa', 0) <= 40, str(r.status_code))
cb = mestre.get('/api/combate').get_json()
pjs = [c for c in cb['combatentes'] if c.get('fichaId') == 'f3']
t('o PJ do jogador entrou na lista de combatentes', len(pjs) == 1, str(len(cb['combatentes'])))
t('combatentes ficam ordenados por iniciativa (desc)',
  all(cb['combatentes'][i]['iniciativa'] >= cb['combatentes'][i + 1]['iniciativa'] for i in range(len(cb['combatentes']) - 1)), str([c['iniciativa'] for c in cb['combatentes']]))

# rerrolar não duplica (continua 1 PJ), só troca a iniciativa
r = jogador.post('/api/combate/acao', json={'acao': 'entrar_combate', 'fichaId': 'f3'})
cb = mestre.get('/api/combate').get_json()
t('rerrolar não duplica o combatente', len([c for c in cb['combatentes'] if c.get('fichaId') == 'f3']) == 1, str(len(cb['combatentes'])))

# jogador NÃO pode pôr a ficha de OUTRO dono (f2)
r = jogador.post('/api/combate/acao', json={'acao': 'entrar_combate', 'fichaId': 'f2'})
t('jogador NÃO entra com ficha de outro dono (403)', r.status_code == 403, str(r.status_code))

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
