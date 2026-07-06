// =====================================================================
// M3 — Gerador de ambientes urbanos (ocupação de locais)
// Tabelas curadas por ambiente: quem/o que está lá dentro.
// Regra: ~90% dos resultados são normais (a cidade é uma cidade);
// os ~10% restantes puxam das variações raras (encontros).
// Os nomes em `monstros` devem existir em MONSTROS (monstros.js).
// =====================================================================

const AMBIENTES = [
  {
    id: 'casa', icone: '🏠', nome: 'Casa comum', dados: '1d4+1',
    perfis: [
      { peso: 4, texto: 'Uma família simples a jantar; olham desconfiados para estranhos.' },
      { peso: 3, texto: 'Um casal de artesãos a trabalhar em encomendas atrasadas.' },
      { peso: 2, texto: 'Uma viúva idosa com {n} gatos; sabe todos os mexericos da rua.' },
      { peso: 2, texto: 'Crianças sozinhas em casa; os pais foram ao mercado.' },
      { peso: 1, texto: 'Um lavrador doente de cama, cuidado por um vizinho.' },
    ],
    raros: [
      { peso: 2, texto: 'A família esconde um desertor no sótão — pagam pelo silêncio.' },
      { peso: 2, texto: 'Ratos gigantes roeram o porão; o dono oferece 5 po para os expulsar.', monstros: [{ nome: 'Rato Gigante', qtd: '1d4' }] },
      { peso: 1, texto: 'A casa está vazia… mas há sinais de luta e sangue fresco no chão.' },
    ],
  },
  {
    id: 'casarao', icone: '🏚️', nome: 'Casa grande / Casarão', dados: '2d4',
    perfis: [
      { peso: 4, texto: 'Um mercador próspero com a família e {n} criados; recebem visitas com chá.' },
      { peso: 3, texto: 'Três gerações da mesma família debaixo do mesmo teto — e a discutir herança.' },
      { peso: 2, texto: 'Um estudioso excêntrico rodeado de livros; paga por espécimes raros.' },
      { peso: 1, texto: 'A casa está em obras; carpinteiros e um encarregado stressado.' },
    ],
    raros: [
      { peso: 2, texto: 'Um cultista usa a cave para reuniões secretas.', monstros: [{ nome: 'Cultista', qtd: '1d4+1' }] },
      { peso: 2, texto: 'A armadura decorativa do salão... move-se à noite.', monstros: [{ nome: 'Armadura Animada', qtd: '1' }] },
      { peso: 1, texto: 'O "mercador" é um chefe de contrabando; guarda-costas vigiam as saídas.', monstros: [{ nome: 'Capanga (Thug)', qtd: '2' }] },
    ],
  },
  {
    id: 'taverna', icone: '🍺', nome: 'Taverna', dados: '3d6',
    perfis: [
      { peso: 4, texto: 'Fregueses habituais: lavradores, um par de guardas fora de serviço e o taberneiro tagarela.' },
      { peso: 3, texto: 'Noite animada: um bardo desafinado, {n} clientes e apostas de braço de ferro.' },
      { peso: 2, texto: 'Mercadores de passagem trocam notícias da estrada (rumores verdadeiros e falsos).' },
      { peso: 2, texto: 'Quase vazia: só o taberneiro, um bêbado a dormir e um viajante encapuzado ao canto.' },
      { peso: 1, texto: 'Festa privada de uma guilda; entrada só com convite.' },
    ],
    raros: [
      { peso: 2, texto: 'Uma rixa rebenta — e alguém puxa de aço a sério.', monstros: [{ nome: 'Capanga (Thug)', qtd: '1d4' }, { nome: 'Bandido', qtd: '2' }] },
      { peso: 2, texto: 'Batedores de uma quadrilha estudam os clientes para o próximo assalto.', monstros: [{ nome: 'Bandido Capitão', qtd: '1' }, { nome: 'Bandido', qtd: '1d4' }] },
      { peso: 1, texto: 'O "viajante encapuzado" é um diabrete disfarçado a recrutar almas.', monstros: [{ nome: 'Diabrete (Imp)', qtd: '1' }] },
    ],
  },
  {
    id: 'estabulo', icone: '🐴', nome: 'Estábulo', dados: '1d4',
    perfis: [
      { peso: 4, texto: 'O cavalariço e {n} ajudante(s) a escovar cavalos; cheiro forte a feno.' },
      { peso: 3, texto: 'Um ferrador de visita, a trocar ferraduras de uma mula teimosa.' },
      { peso: 2, texto: 'Vazio de gente: só animais inquietos — algo os assustou há pouco.' },
      { peso: 1, texto: 'Um nobre impaciente à espera do seu cavalo, aos gritos com o moço.' },
    ],
    raros: [
      { peso: 2, texto: 'Ladrões de cavalos em plena ação, a serrar o cadeado das baias.', monstros: [{ nome: 'Bandido', qtd: '1d4' }] },
      { peso: 2, texto: 'Estirges aninharam-se nas vigas e atacam os animais à noite.', monstros: [{ nome: 'Estirge (Stirge)', qtd: '1d4+1' }] },
      { peso: 1, texto: 'Um worg fugido de um bando goblin esconde-se na baia do fundo.', monstros: [{ nome: 'Worg', qtd: '1' }] },
    ],
  },
  {
    id: 'mansao', icone: '🏛️', nome: 'Mansão / Solar nobre', dados: '2d6',
    perfis: [
      { peso: 4, texto: 'A família aristocrata e {n} criados; o mordomo controla quem entra.' },
      { peso: 3, texto: 'Um jantar de gala: nobres, políticos locais e intriga em cada brinde.' },
      { peso: 2, texto: 'Só a criadagem: os senhores viajaram e a casa está "em limpezas".' },
      { peso: 1, texto: 'Um velho lorde solitário que paga bem por companhia e histórias.' },
    ],
    raros: [
      { peso: 2, texto: 'O anfitrião foi substituído: um mago mantém a família presa na adega.', monstros: [{ nome: 'Mago (Mage)', qtd: '1' }, { nome: 'Guarda', qtd: '2' }] },
      { peso: 2, texto: 'Uma sombra assombra a galeria de retratos desde a morte do patriarca.', monstros: [{ nome: 'Sombra (Shadow)', qtd: '1d4' }] },
      { peso: 1, texto: 'Assalto em curso: bandidos renderam os criados no salão.', monstros: [{ nome: 'Bandido Capitão', qtd: '1' }, { nome: 'Bandido', qtd: '1d4+1' }] },
    ],
  },
  {
    id: 'multidao', icone: '👥', nome: 'Multidão / Praça', dados: '4d10',
    perfis: [
      { peso: 4, texto: 'Dia normal de praça: {n} pessoas entre pregões, carroças e pombas.' },
      { peso: 3, texto: 'Um arauto lê um decreto; a multidão resmunga sobre impostos novos.' },
      { peso: 2, texto: 'Artistas de rua juntam uma roda de curiosos; carteiristas à espreita.' },
      { peso: 2, texto: 'Procissão religiosa atravessa a praça com incenso e cânticos.' },
      { peso: 1, texto: 'Execução pública anunciada para o meio-dia; clima tenso.' },
    ],
    raros: [
      { peso: 2, texto: 'Um carteirista rouba algo de um PJ — e a fuga vira perseguição.', monstros: [{ nome: 'Bandido', qtd: '1d4' }] },
      { peso: 2, texto: 'Um pregador fanático incita a multidão; os capangas dele "convencem" quem discorda.', monstros: [{ nome: 'Cultista', qtd: '1d4+1' }, { nome: 'Capanga (Thug)', qtd: '1' }] },
      { peso: 1, texto: 'Pânico! Um grifo em fuga do mercado de bestas aterra na praça.', monstros: [{ nome: 'Grifo (Griffon)', qtd: '1' }] },
    ],
  },
  {
    id: 'templo', icone: '⛪', nome: 'Templo', dados: '1d6+1',
    perfis: [
      { peso: 4, texto: 'Um sacerdote e {n} acólito(s) preparam o culto; fiéis rezam em silêncio.' },
      { peso: 3, texto: 'Casamento ou funeral em curso; o templo está cheio.' },
      { peso: 2, texto: 'Só um acólito sonolento a limpar castiçais; aceita doações.' },
      { peso: 1, texto: 'Peregrinos de longe pedem abrigo por uma noite.' },
    ],
    raros: [
      { peso: 2, texto: 'Cultistas infiltraram-se na ordem e profanam a cripta à noite.', monstros: [{ nome: 'Cultista', qtd: '1d4+1' }] },
      { peso: 2, texto: 'Algo despertou na cripta: mortos-vivos arranham a porta selada.', monstros: [{ nome: 'Esqueleto', qtd: '1d4' }, { nome: 'Zumbi', qtd: '2' }] },
      { peso: 1, texto: 'Um espectro do antigo sumo-sacerdote não deixa ninguém tocar no relicário.', monstros: [{ nome: 'Espectro (Specter)', qtd: '1' }] },
    ],
  },
  {
    id: 'mercado', icone: '🏪', nome: 'Mercado / Loja', dados: '2d8',
    perfis: [
      { peso: 4, texto: 'Comércio normal: lojistas a apregoar, {n} clientes a regatear.' },
      { peso: 3, texto: 'Chegou caravana nova: mercadoria exótica e preços inflacionados.' },
      { peso: 2, texto: 'Fiscal da coroa inspeciona balanças; vendedores nervosos.' },
      { peso: 1, texto: 'Um vendedor ambulante oferece "amuletos autênticos" (quinquilharia... ou não).' },
    ],
    raros: [
      { peso: 2, texto: 'Extorsão em curso: capangas cobram "proteção" a um lojista.', monstros: [{ nome: 'Capanga (Thug)', qtd: '2' }] },
      { peso: 2, texto: 'Goblins esgueiraram-se pela muralha e pilham as bancas ao anoitecer.', monstros: [{ nome: 'Goblin', qtd: '1d4+1' }] },
      { peso: 1, texto: 'Um lodo cinzento vive no esgoto sob a peixaria e dissolveu o alçapão.', monstros: [{ nome: 'Lodo Cinzento (Gray Ooze)', qtd: '1' }] },
    ],
  },
  {
    id: 'beco', icone: '🌃', nome: 'Beco / Ruela escura', dados: '1d4-1',
    perfis: [
      { peso: 4, texto: 'Vazio, fora {n} gato(s) e lixo; ecoam passos distantes.' },
      { peso: 3, texto: 'Um mendigo enrolado em trapos; por uma moeda, conta o que viu ontem à noite.' },
      { peso: 2, texto: 'Dois criados a fumar escondidos do patrão; sabem os horários da casa.' },
      { peso: 1, texto: 'Um casal em despedida romântica (e clandestina).' },
    ],
    raros: [
      { peso: 3, texto: 'Emboscada clássica: sombras destacam-se das paredes com facas.', monstros: [{ nome: 'Bandido', qtd: '1d4' }, { nome: 'Capanga (Thug)', qtd: '1' }] },
      { peso: 2, texto: 'Um carniçal caça nos becos desde que o cemitério foi violado.', monstros: [{ nome: 'Carniçal (Ghoul)', qtd: '1' }] },
      { peso: 1, texto: 'Ratos gigantes saem do esgoto em bando.', monstros: [{ nome: 'Rato Gigante', qtd: '1d4+1' }] },
    ],
  },
  {
    id: 'armazem', icone: '📦', nome: 'Armazém / Doca', dados: '1d6',
    perfis: [
      { peso: 4, texto: '{n} estivador(es) a carregar caixas sob os berros de um capataz.' },
      { peso: 3, texto: 'Um escriturário confere inventário à luz de lampião; falta-lhe uma caixa.' },
      { peso: 2, texto: 'Fechado e trancado; o vigia noturno dorme na guarita.' },
      { peso: 1, texto: 'Leilão discreto de mercadoria "caída do barco".' },
    ],
    raros: [
      { peso: 2, texto: 'Contrabandistas descarregam à socapa — e não gostam de testemunhas.', monstros: [{ nome: 'Bandido', qtd: '1d4+1' }, { nome: 'Bandido Capitão', qtd: '1' }] },
      { peso: 2, texto: 'Uma aranha gigante fez ninho entre as caixas do fundo.', monstros: [{ nome: 'Aranha Gigante', qtd: '1' }] },
      { peso: 1, texto: 'Uma caixa "esquecida" range… um cubo gelatinoso escapou do carregamento de um mago.', monstros: [{ nome: 'Cubo Gelatinoso', qtd: '1' }] },
    ],
  },
];

// Probabilidade de sair variação rara (encontro): ~10%
const AMBIENTES_CHANCE_RARO = 0.10;

// Rola fórmulas simples tipo '2d4', '1d6+1', '1d4-1' (mínimo 0)
function ambRolarFormula(formula, rng) {
  rng = rng || Math.random;
  const m = String(formula).trim().match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!m) return 0;
  const qtd = parseInt(m[1], 10), lados = parseInt(m[2], 10), extra = m[3] ? parseInt(m[3], 10) : 0;
  let total = extra;
  for (let i = 0; i < qtd; i++) total += Math.floor(rng() * lados) + 1;
  return Math.max(0, total);
}

// Escolha ponderada numa lista [{peso, ...}]
function ambEscolhaPonderada(lista, rng) {
  rng = rng || Math.random;
  const total = lista.reduce((s, e) => s + (e.peso || 1), 0);
  let sorteio = rng() * total;
  for (const e of lista) {
    sorteio -= (e.peso || 1);
    if (sorteio <= 0) return e;
  }
  return lista[lista.length - 1];
}

// Gera a ocupação de um ambiente. Retorna:
// { ambiente, icone, ocupantes, texto, raro, monstros: [{nome, qtd}] }
// `rng` é injetável para testes determinísticos.
function gerarOcupacao(ambienteId, rng) {
  rng = rng || Math.random;
  const amb = AMBIENTES.find(a => a.id === ambienteId);
  if (!amb) return null;
  const ocupantes = ambRolarFormula(amb.dados, rng);
  const raro = rng() < AMBIENTES_CHANCE_RARO && amb.raros.length > 0;
  const entrada = ambEscolhaPonderada(raro ? amb.raros : amb.perfis, rng);
  const monstros = (entrada.monstros || []).map(g => ({ nome: g.nome, qtd: ambRolarFormula(/d/.test(g.qtd) ? g.qtd : `0d1+${g.qtd}`, rng) || 1 }));
  return {
    ambiente: amb.nome,
    icone: amb.icone,
    ocupantes,
    texto: entrada.texto.replace('{n}', ocupantes),
    raro,
    monstros,
  };
}

// Export para o harness de testes em Node (no browser é ignorado)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AMBIENTES, AMBIENTES_CHANCE_RARO, ambRolarFormula, ambEscolhaPonderada, gerarOcupacao };
}
