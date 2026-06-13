// =====================================================
// DADOS DE REGRAS - D&D 5e (Livro do Jogador / SRD) em PT-BR
// Usado pelo Criador de Personagem (preview ao vivo + regras + gerador)
// =====================================================

// ----- Atributos -----
const ATRIBUTOS = [
  { chave: 'for', nome: 'Força' },
  { chave: 'des', nome: 'Destreza' },
  { chave: 'con', nome: 'Constituição' },
  { chave: 'int', nome: 'Inteligência' },
  { chave: 'sab', nome: 'Sabedoria' },
  { chave: 'car', nome: 'Carisma' },
];

const mod = v => Math.floor((v - 10) / 2);
const fmtMod = v => (mod(v) >= 0 ? '+' : '') + mod(v);

// ----- Perícias (18) e atributo associado -----
const PERICIAS = {
  'Acrobacia': 'des',
  'Adestrar Animais': 'sab',
  'Arcanismo': 'int',
  'Atletismo': 'for',
  'Atuação': 'car',
  'Enganação': 'car',
  'Furtividade': 'des',
  'História': 'int',
  'Intimidação': 'car',
  'Intuição': 'sab',
  'Investigação': 'int',
  'Medicina': 'sab',
  'Natureza': 'int',
  'Percepção': 'sab',
  'Persuasão': 'car',
  'Prestidigitação': 'des',
  'Religião': 'int',
  'Sobrevivência': 'sab',
};

// ----- Salvaguardas: chave de atributo por nome em PT -----
const SALVA_CHAVE = {
  'Força': 'for', 'Destreza': 'des', 'Constituição': 'con',
  'Inteligência': 'int', 'Sabedoria': 'sab', 'Carisma': 'car',
};

// =====================================================
// RAÇAS (PHB) - chaveadas pela string exata do <select>
// asi: bônus fixos | escolhaAtributos: nº de +1 à escolha do jogador
// =====================================================
const RACAS_DETALHE = {
  'Anão da Colina': {
    asi: { con: 2, sab: 1 }, deslocamento: 25, tamanho: 'Médio', visaoNoEscuro: 18,
    idiomas: ['Comum', 'Anão'],
    tracos: ['Resistência Anã: vantagem em salvaguardas e resistência a dano de veneno', 'Treinamento em Combate Anão: proficiência com machados e martelos', 'Conhecimento de Pedras', 'Tenacidade Anã: +1 PV por nível'],
    pvExtraPorNivel: 1,
  },
  'Anão da Montanha': {
    asi: { con: 2, for: 2 }, deslocamento: 25, tamanho: 'Médio', visaoNoEscuro: 18,
    idiomas: ['Comum', 'Anão'],
    tracos: ['Resistência Anã: vantagem/resistência a veneno', 'Treinamento em Combate Anão', 'Conhecimento de Pedras', 'Treinamento com Armadura Anã: proficiência com armadura leve e média'],
  },
  'Alto Elfo': {
    asi: { des: 2, int: 1 }, deslocamento: 30, tamanho: 'Médio', visaoNoEscuro: 18,
    idiomas: ['Comum', 'Élfico', '+1 à escolha'],
    tracos: ['Ancestralidade Feérica: vantagem contra enfeitiçar, imune a sono mágico', 'Sentidos Aguçados: proficiência em Percepção', 'Transe (medita 4h)', 'Treinamento com Armas Élficas (espadas longa/curta, arcos)'],
    truqueExtra: { lista: 'mago' },
  },
  'Elfo da Floresta': {
    asi: { des: 2, sab: 1 }, deslocamento: 35, tamanho: 'Médio', visaoNoEscuro: 18,
    idiomas: ['Comum', 'Élfico'],
    tracos: ['Ancestralidade Feérica', 'Sentidos Aguçados: proficiência em Percepção', 'Transe', 'Pés Ligeiros: deslocamento 35', 'Máscara da Natureza: esconde-se em fenômenos naturais'],
  },
  'Drow (Elfo Negro)': {
    asi: { des: 2, car: 1 }, deslocamento: 30, tamanho: 'Médio', visaoNoEscuro: 36,
    idiomas: ['Comum', 'Élfico'],
    tracos: ['Ancestralidade Feérica', 'Sentidos Aguçados: proficiência em Percepção', 'Transe', 'Visão no Escuro Superior (36m)', 'Sensibilidade à Luz Solar: desvantagem sob luz solar', 'Magia Drow: Luzes Dançantes (nv3 Fogo das Fadas, nv5 Escuridão)'],
    truqueExtra: { nome: 'Luzes Dançantes' },
  },
  'Halfling Pés-Leves': {
    asi: { des: 2, car: 1 }, deslocamento: 25, tamanho: 'Pequeno', visaoNoEscuro: 0,
    idiomas: ['Comum', 'Halfling'],
    tracos: ['Sortudo: re-rola 1 natural em d20', 'Bravura: vantagem contra amedrontar', 'Agilidade Halfling: move-se por espaço de criaturas maiores', 'Furtividade Natural: esconde-se atrás de criaturas maiores'],
  },
  'Halfling Robusto': {
    asi: { des: 2, con: 1 }, deslocamento: 25, tamanho: 'Pequeno', visaoNoEscuro: 0,
    idiomas: ['Comum', 'Halfling'],
    tracos: ['Sortudo', 'Bravura', 'Agilidade Halfling', 'Resiliência Halfling: vantagem/resistência a veneno'],
  },
  'Humano': {
    asi: { for: 1, des: 1, con: 1, int: 1, sab: 1, car: 1 }, deslocamento: 30, tamanho: 'Médio', visaoNoEscuro: 0,
    idiomas: ['Comum', '+1 à escolha'],
    tracos: ['Versátil: +1 em todos os atributos'],
  },
  'Humano (Variante)': {
    asi: {}, escolhaAtributos: 2, deslocamento: 30, tamanho: 'Médio', visaoNoEscuro: 0,
    idiomas: ['Comum', '+1 à escolha'],
    tracos: ['+1 em dois atributos à escolha', '1 perícia à escolha', '1 talento (feat) à escolha'],
    periciaExtra: 1,
  },
  'Draconato': {
    asi: { for: 2, car: 1 }, deslocamento: 30, tamanho: 'Médio', visaoNoEscuro: 0,
    idiomas: ['Comum', 'Dracônico'],
    tracos: ['Ancestralidade Dracônica (escolha o tipo de dragão)', 'Arma de Sopro (2d6, escala com nível)', 'Resistência ao tipo de dano dracônico'],
  },
  'Gnomo da Floresta': {
    asi: { int: 2, des: 1 }, deslocamento: 25, tamanho: 'Pequeno', visaoNoEscuro: 18,
    idiomas: ['Comum', 'Gnômico'],
    tracos: ['Astúcia Gnômica: vantagem em salvaguardas INT/SAB/CAR contra magia', 'Ilusão Menor (truque)', 'Falar com Pequenos Animais'],
    truqueExtra: { nome: 'Ilusão Menor' },
  },
  'Gnomo das Rochas': {
    asi: { int: 2, con: 1 }, deslocamento: 25, tamanho: 'Pequeno', visaoNoEscuro: 18,
    idiomas: ['Comum', 'Gnômico'],
    tracos: ['Astúcia Gnômica', 'Conhecimento de Artífice', 'Reparar (Tinker): cria pequenos dispositivos'],
  },
  'Meio-Elfo': {
    asi: { car: 2 }, escolhaAtributos: 2, deslocamento: 30, tamanho: 'Médio', visaoNoEscuro: 18,
    idiomas: ['Comum', 'Élfico', '+1 à escolha'],
    tracos: ['Ancestralidade Feérica', 'Versatilidade em Perícias: proficiência em 2 perícias à escolha', '+2 Carisma e +1 em dois atributos à escolha'],
    periciaExtra: 2,
  },
  'Meio-Orc': {
    asi: { for: 2, con: 1 }, deslocamento: 30, tamanho: 'Médio', visaoNoEscuro: 18,
    idiomas: ['Comum', 'Orc'],
    tracos: ['Ameaçador: proficiência em Intimidação', 'Resistência Implacável: cai a 1 PV em vez de 0 (1/descanso longo)', 'Ataques Selvagens: dado extra de dano em crítico corpo a corpo'],
    periciaFixa: ['Intimidação'],
  },
  'Tiefling': {
    asi: { car: 2, int: 1 }, deslocamento: 30, tamanho: 'Médio', visaoNoEscuro: 18,
    idiomas: ['Comum', 'Infernal'],
    tracos: ['Resistência Infernal: resistência a dano de fogo', 'Legado Infernal: Taumaturgia (nv3 Repreensão Infernal, nv5 Escuridão)'],
    truqueExtra: { nome: 'Taumaturgia' },
  },
};

// =====================================================
// ANTECEDENTES (Backgrounds) - concede 2 perícias + característica
// =====================================================
const ANTECEDENTES = {
  'Acólito': { pericias: ['Intuição', 'Religião'], caracteristica: 'Abrigo dos Fiéis: recebe cuidados em templos da sua fé', idiomas: 2 },
  'Criminoso': { pericias: ['Enganação', 'Furtividade'], caracteristica: 'Contato Criminal: rede confiável de informantes' },
  'Herói do Povo': { pericias: ['Adestrar Animais', 'Sobrevivência'], caracteristica: 'Hospitalidade Rústica: o povo comum o esconde e ajuda' },
  'Nobre': { pericias: ['História', 'Persuasão'], caracteristica: 'Posição de Privilégio: bem tratado pela alta sociedade', idiomas: 1 },
  'Sábio': { pericias: ['Arcanismo', 'História'], caracteristica: 'Pesquisador: sabe onde encontrar informações', idiomas: 2 },
  'Soldado': { pericias: ['Atletismo', 'Intimidação'], caracteristica: 'Patente Militar: respeito de soldados de sua antiga facção' },
  'Charlatão': { pericias: ['Enganação', 'Prestidigitação'], caracteristica: 'Identidade Falsa: possui uma segunda identidade' },
  'Artista': { pericias: ['Acrobacia', 'Atuação'], caracteristica: 'Por Demanda Popular: sempre encontra lugar para se apresentar' },
  'Eremita': { pericias: ['Medicina', 'Religião'], caracteristica: 'Descoberta: conhece uma verdade única e poderosa', idiomas: 1 },
  'Forasteiro': { pericias: ['Atletismo', 'Sobrevivência'], caracteristica: 'Andarilho: memória excelente para mapas e geografia', idiomas: 1 },
  'Marujo': { pericias: ['Atletismo', 'Percepção'], caracteristica: 'Passagem de Navio: consegue transporte marítimo gratuito' },
  'Órfão': { pericias: ['Furtividade', 'Prestidigitação'], caracteristica: 'Segredos da Cidade: conhece atalhos e passagens urbanas' },
  'Artesão da Guilda': { pericias: ['Intuição', 'Persuasão'], caracteristica: 'Membro de Guilda: apoio e abrigo da guilda de ofício', idiomas: 1 },
};

// =====================================================
// ESTILOS DE LUTA (Guerreiro, Paladino, Patrulheiro)
// =====================================================
const ESTILOS_LUTA = {
  'Arquearia': '+2 nas jogadas de ataque com armas à distância',
  'Defesa': '+1 na CA enquanto usar armadura',
  'Duelo': '+2 de dano com arma de uma mão (sem outra arma)',
  'Combate com Armas Grandes': 'rerrola 1 e 2 no dano de armas de duas mãos',
  'Proteção': 'use reação e escudo para impor desvantagem a ataque contra aliado próximo',
  'Combate com Duas Armas': 'adiciona o modificador de atributo ao dano do ataque bônus',
};
const CLASSES_COM_ESTILO = ['Guerreiro', 'Paladino', 'Patrulheiro'];

// =====================================================
// ARMADURAS (cálculo de CA)
// tipo: 'leve' (CA base + DES), 'media' (base + DES máx 2), 'pesada' (base fixa)
// =====================================================
const ARMADURAS = {
  'Sem armadura': { base: 10, tipo: 'leve' },
  'Armadura de Couro': { base: 11, tipo: 'leve' },
  'Couro Batido': { base: 12, tipo: 'leve' },
  'Gibão de Peles': { base: 12, tipo: 'media' },
  'Camisão de Malha': { base: 13, tipo: 'media' },
  'Brunea (Cota de Escamas)': { base: 14, tipo: 'media' },
  'Peitoral': { base: 14, tipo: 'media' },
  'Meia Armadura': { base: 15, tipo: 'media' },
  'Cota de Malha': { base: 16, tipo: 'pesada' },
  'Cota de Bandas': { base: 17, tipo: 'pesada' },
  'Cota de Placas': { base: 18, tipo: 'pesada' },
};

// =====================================================
// CONJURAÇÃO - atributo-chave e contadores no nível 1
// prepara: magias preparadas = mod + nível (Clérigo, Druida, Mago, Paladino)
// conhece: magias conhecidas fixas (Bardo, Feiticeiro, Bruxo, Patrulheiro)
// =====================================================
const CONJURACAO = {
  'Mago':        { atributo: 'int', truques: 3, modo: 'prepara' },
  'Clérigo':     { atributo: 'sab', truques: 3, modo: 'prepara' },
  'Druida':      { atributo: 'sab', truques: 2, modo: 'prepara' },
  'Bardo':       { atributo: 'car', truques: 2, conhece: 4 },
  'Feiticeiro':  { atributo: 'car', truques: 4, conhece: 2 },
  'Bruxo':       { atributo: 'car', truques: 2, conhece: 2 },
  'Paladino':    { atributo: 'car', truques: 0, modo: 'prepara', desdeNivel: 2 },
  'Patrulheiro': { atributo: 'sab', truques: 0, conhece: 2, desdeNivel: 2 },
};

// =====================================================
// MAGIAS por classe (truques + 1º círculo) - PT-BR
// Conjunto curado e jogável; expansível com mais magias depois.
// =====================================================
const MAGIAS = {
  'Mago': {
    truques: ['Raio de Gelo', 'Mãos Flamejantes (1º)', 'Luz', 'Mão Mágica', 'Prestidigitação', 'Toque Chocante', 'Rajada de Fogo'],
    nivel1: ['Mísseis Mágicos', 'Escudo Arcano', 'Sono', 'Detectar Magia', 'Armadura do Mago', 'Enfeitiçar Pessoa', 'Compreender Idiomas', 'Salto'],
  },
  'Clérigo': {
    truques: ['Chama Sagrada', 'Orientação', 'Luz', 'Resistência', 'Taumaturgia'],
    nivel1: ['Curar Ferimentos', 'Escudo da Fé', 'Bênção', 'Comando', 'Detectar o Mal e o Bem', 'Palavra Curativa', 'Perdição'],
  },
  'Druida': {
    truques: ['Aríete Espinhento (Shillelagh)', 'Orientação', 'Produzir Chamas', 'Resistência', 'Florescer'],
    nivel1: ['Curar Ferimentos', 'Dardo Flamejante (Faerie Fire)', 'Falar com Animais', 'Emaranhar', 'Cura por Toque', 'Nevoeiro'],
  },
  'Bardo': {
    truques: ['Zombaria Viciosa', 'Luz', 'Mão Mágica', 'Prestidigitação', 'Mensagem'],
    nivel1: ['Curar Ferimentos', 'Enfeitiçar Pessoa', 'Sono', 'Comando Heroico', 'Dissonância Sussurrada', 'Palavra Curativa', 'Detectar Magia'],
  },
  'Feiticeiro': {
    truques: ['Raio de Gelo', 'Rajada de Fogo', 'Luz', 'Prestidigitação', 'Toque Chocante', 'Mão Mágica'],
    nivel1: ['Mísseis Mágicos', 'Escudo Arcano', 'Enfeitiçar Pessoa', 'Mãos Flamejantes', 'Sono', 'Armadura do Mago'],
  },
  'Bruxo': {
    truques: ['Rajada Sobrenatural', 'Zombaria Viciosa', 'Toque Chocante', 'Prestidigitação', 'Luz'],
    nivel1: ['Maldição Profana (Hex)', 'Seta Encantada', 'Repreensão Infernal', 'Enfeitiçar Pessoa', 'Proteção contra o Mal e o Bem'],
  },
  'Patrulheiro': {
    truques: [],
    nivel1: ['Marca do Caçador (Hunter\'s Mark)', 'Curar Ferimentos', 'Dardo Flamejante (Faerie Fire)', 'Salto', 'Passos Longos', 'Detectar Veneno e Doença'],
  },
  'Paladino': {
    truques: [],
    nivel1: ['Curar Ferimentos', 'Escudo da Fé', 'Bênção', 'Comando', 'Golpe Furioso (Searing Smite)', 'Detectar o Mal e o Bem'],
  },
};

// =====================================================
// PERÍCIAS por classe: quantas escolher e de qual lista
// =====================================================
const PERICIAS_CLASSE = {
  'Bárbaro':     { qtd: 2, opcoes: ['Adestrar Animais', 'Atletismo', 'Intimidação', 'Natureza', 'Percepção', 'Sobrevivência'] },
  'Bardo':       { qtd: 3, opcoes: Object.keys(PERICIAS) },
  'Clérigo':     { qtd: 2, opcoes: ['História', 'Intuição', 'Medicina', 'Persuasão', 'Religião'] },
  'Druida':      { qtd: 2, opcoes: ['Arcanismo', 'Adestrar Animais', 'Intuição', 'Medicina', 'Natureza', 'Percepção', 'Religião', 'Sobrevivência'] },
  'Guerreiro':   { qtd: 2, opcoes: ['Acrobacia', 'Adestrar Animais', 'Atletismo', 'História', 'Intuição', 'Intimidação', 'Percepção', 'Sobrevivência'] },
  'Monge':       { qtd: 2, opcoes: ['Acrobacia', 'Atletismo', 'História', 'Intuição', 'Religião', 'Furtividade'] },
  'Paladino':    { qtd: 2, opcoes: ['Atletismo', 'Intuição', 'Intimidação', 'Medicina', 'Persuasão', 'Religião'] },
  'Patrulheiro': { qtd: 3, opcoes: ['Adestrar Animais', 'Atletismo', 'Intuição', 'Investigação', 'Natureza', 'Percepção', 'Furtividade', 'Sobrevivência'] },
  'Ladino':      { qtd: 4, opcoes: ['Acrobacia', 'Atletismo', 'Enganação', 'Intuição', 'Intimidação', 'Investigação', 'Percepção', 'Atuação', 'Persuasão', 'Prestidigitação', 'Furtividade'] },
  'Feiticeiro':  { qtd: 2, opcoes: ['Arcanismo', 'Enganação', 'Intuição', 'Intimidação', 'Persuasão', 'Religião'] },
  'Mago':        { qtd: 2, opcoes: ['Arcanismo', 'História', 'Intuição', 'Investigação', 'Medicina', 'Religião'] },
  'Bruxo':       { qtd: 2, opcoes: ['Arcanismo', 'Enganação', 'História', 'Intimidação', 'Investigação', 'Natureza', 'Religião'] },
};

// Mapa nome da classe (PT) -> chave do objeto CLASSES (classes.js)
const CLASSE_NOME_PARA_CHAVE = {
  'Guerreiro': 'guerreiro', 'Mago': 'mago', 'Ladino': 'ladino', 'Clérigo': 'clerigo',
  'Bardo': 'bardo', 'Bárbaro': 'barbaro', 'Druida': 'druida', 'Monge': 'monge',
  'Paladino': 'paladino', 'Patrulheiro': 'patrulheiro', 'Feiticeiro': 'feiticeiro', 'Bruxo': 'bruxo',
};

// Equipamento inicial sugerido por classe (para o gerador automático)
const EQUIPAMENTO_CLASSE = {
  'Guerreiro':   { armadura: 'Cota de Malha', armas: ['Espada Longa', 'Escudo'], ouro: 0 },
  'Bárbaro':     { armadura: 'Sem armadura', armas: ['Machado Grande', 'Machadinha'], ouro: 0 },
  'Paladino':    { armadura: 'Cota de Malha', armas: ['Espada Longa', 'Escudo'], ouro: 0 },
  'Patrulheiro': { armadura: 'Couro Batido', armas: ['Arco Longo', 'Espada Curta'], ouro: 0 },
  'Mago':        { armadura: 'Sem armadura', armas: ['Bastão'], ouro: 0 },
  'Feiticeiro':  { armadura: 'Sem armadura', armas: ['Besta Leve'], ouro: 0 },
  'Bruxo':       { armadura: 'Armadura de Couro', armas: ['Espada Curta'], ouro: 0 },
  'Clérigo':     { armadura: 'Camisão de Malha', armas: ['Maça', 'Escudo'], ouro: 0 },
  'Druida':      { armadura: 'Armadura de Couro', armas: ['Bastão'], ouro: 0 },
  'Bardo':       { armadura: 'Armadura de Couro', armas: ['Rapieira'], ouro: 0 },
  'Monge':       { armadura: 'Sem armadura', armas: ['Bastão'], ouro: 0 },
  'Ladino':      { armadura: 'Couro Batido', armas: ['Rapieira', 'Arco Curto'], ouro: 0 },
};

// Nomes para o gerador aleatório
const NOMES_ALEATORIOS = [
  'Thorin', 'Lyra', 'Gareth', 'Sariel', 'Borin', 'Vex', 'Aelar', 'Mira',
  'Drogan', 'Elowen', 'Kael', 'Nyssa', 'Ragnar', 'Tahlia', 'Fenn', 'Isolde',
  'Bromm', 'Seraphina', 'Oryn', 'Wrenna', 'Dax', 'Liora', 'Garrick', 'Yvanna',
];
