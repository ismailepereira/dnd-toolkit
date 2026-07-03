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
  'Acólito': { pericias: ['Intuição', 'Religião'], idiomas: 2, ferramentas: [],
    equipamento: 'Símbolo sagrado, livro de preces, 5 varetas de incenso, vestimentas, roupas comuns, bolsa com 15 po',
    caracteristica: 'Abrigo dos Fiéis: você e seus aliados recebem cura e cuidados gratuitos em templos da sua fé' },
  'Criminoso': { pericias: ['Enganação', 'Furtividade'], idiomas: 0, ferramentas: ['Um tipo de jogo (dados/baralho)', 'Ferramentas de Ladrão'],
    equipamento: 'Pé de cabra, roupas comuns escuras com capuz, bolsa com 15 po',
    caracteristica: 'Contato Criminal: tem um contato confiável que serve de intermediário com a rede do submundo' },
  'Herói do Povo': { pericias: ['Adestrar Animais', 'Sobrevivência'], idiomas: 0, ferramentas: ['Um tipo de ferramenta de artesão', 'Veículos terrestres'],
    equipamento: 'Ferramentas de artesão, pá, panela de ferro, roupas comuns, bolsa com 10 po',
    caracteristica: 'Hospitalidade Rústica: o povo comum o acolhe, esconde e ajuda quando precisa' },
  'Nobre': { pericias: ['História', 'Persuasão'], idiomas: 1, ferramentas: ['Um tipo de jogo (dados/baralho)'],
    equipamento: 'Roupas finas, anel de sinete, pergaminho de linhagem, bolsa com 25 po',
    caracteristica: 'Posição de Privilégio: é bem tratado pela alta sociedade e tem acesso a audiências' },
  'Sábio': { pericias: ['Arcanismo', 'História'], idiomas: 2, ferramentas: [],
    equipamento: 'Frasco de tinta, pena, faca pequena, carta de um colega falecido, roupas comuns, bolsa com 10 po',
    caracteristica: 'Pesquisador: ao não saber algo, costuma saber onde e com quem obter a informação' },
  'Soldado': { pericias: ['Atletismo', 'Intimidação'], idiomas: 0, ferramentas: ['Um tipo de jogo (dados/baralho)', 'Veículos terrestres'],
    equipamento: 'Insígnia de patente, troféu de inimigo, jogo de dados ou baralho, roupas comuns, bolsa com 10 po',
    caracteristica: 'Patente Militar: soldados de sua antiga facção ainda reconhecem sua autoridade' },
  'Charlatão': { pericias: ['Enganação', 'Prestidigitação'], idiomas: 0, ferramentas: ['Kit de Disfarce', 'Ferramentas de Falsificador'],
    equipamento: 'Roupas finas, kit de disfarce, ferramentas de trapaça, bolsa com 15 po',
    caracteristica: 'Identidade Falsa: possui uma segunda identidade documentada e sabe forjar documentos' },
  'Artista': { pericias: ['Acrobacia', 'Atuação'], idiomas: 0, ferramentas: ['Kit de Disfarce', 'Um instrumento musical'],
    equipamento: 'Instrumento musical, prenda de um admirador, fantasia, bolsa com 15 po',
    caracteristica: 'Por Demanda Popular: sempre encontra onde se apresentar e ser acolhido em troca' },
  'Eremita': { pericias: ['Medicina', 'Religião'], idiomas: 1, ferramentas: ['Kit de Herbalismo'],
    equipamento: 'Estojo de pergaminhos com anotações, cobertor, roupas comuns, kit de herbalismo, 5 po',
    caracteristica: 'Descoberta: durante seu isolamento, descobriu uma verdade única e poderosa' },
  'Forasteiro': { pericias: ['Atletismo', 'Sobrevivência'], idiomas: 1, ferramentas: ['Um instrumento musical'],
    equipamento: 'Cajado, armadilha de caça, troféu de animal, roupas comuns, bolsa com 10 po',
    caracteristica: 'Andarilho: memória excepcional para geografia; sempre acha comida e água para o grupo' },
  'Marujo': { pericias: ['Atletismo', 'Percepção'], idiomas: 0, ferramentas: ['Ferramentas de Navegação', 'Veículos aquáticos'],
    equipamento: 'Cabo de corda resistente, amuleto da sorte, roupas comuns, bolsa com 10 po',
    caracteristica: 'Passagem de Navio: consegue transporte marítimo gratuito para si e seus aliados' },
  'Órfão': { pericias: ['Furtividade', 'Prestidigitação'], idiomas: 0, ferramentas: ['Kit de Disfarce', 'Ferramentas de Ladrão'],
    equipamento: 'Faca pequena, mapa da cidade natal, animalzinho de estimação, lembrança dos pais, roupas comuns, 10 po',
    caracteristica: 'Segredos da Cidade: conhece atalhos urbanos, viajando o dobro da velocidade entre locais da cidade' },
  'Artesão da Guilda': { pericias: ['Intuição', 'Persuasão'], idiomas: 1, ferramentas: ['Um tipo de ferramenta de artesão'],
    equipamento: 'Ferramentas de artesão, carta de recomendação da guilda, roupas de viajante, bolsa com 15 po',
    caracteristica: 'Membro de Guilda: a guilda oferece abrigo, apoio político e acesso a contatos do ofício' },
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

// Ouro inicial por classe (média da rolagem do PHB, em po) — para comprar equipamento na criação
const OURO_INICIAL = {
  'Bárbaro': 50, 'Bardo': 125, 'Clérigo': 125, 'Druida': 50, 'Guerreiro': 125,
  'Monge': 12, 'Paladino': 125, 'Patrulheiro': 125, 'Ladino': 100,
  'Feiticeiro': 75, 'Mago': 100, 'Bruxo': 100,
};

// =====================================================
// RESUMOS PARA A GALERIA DE CRIAÇÃO (passo Classe / passo Raça)
// simbolo: emoji grande no centro | resumo: o que a classe faz
// papel: função no grupo | melhoresRacas: combinações recomendadas
// =====================================================
const CLASSES_RESUMO = {
  'Bárbaro': {
    simbolo: '🪓', papel: 'Tanque / Dano corpo a corpo',
    resumo: 'Um combatente feroz movido pelo Furor: entra em fúria para causar dano brutal e resistir a golpes. Muitos PV (d12), dispensa armadura e vive na linha de frente.',
    melhoresRacas: ['Meio-Orc', 'Anão da Montanha', 'Humano'],
  },
  'Bardo': {
    simbolo: '🎶', papel: 'Suporte / Utilidade / Cara do grupo',
    resumo: 'Um conjurador carismático que inspira aliados com música e palavras. Versátil em perícias, cura, controle e enganação — bom em quase tudo.',
    melhoresRacas: ['Meio-Elfo', 'Tiefling', 'Halfling Pés-Leves'],
  },
  'Bruxo': {
    simbolo: '👁️', papel: 'Dano mágico constante',
    resumo: 'Fez um pacto com uma entidade poderosa em troca de magia. Poucos espaços de magia, mas recuperam em descanso curto; a Rajada Sobrenatural é o melhor truque de dano do jogo.',
    melhoresRacas: ['Tiefling', 'Meio-Elfo', 'Humano (Variante)'],
  },
  'Clérigo': {
    simbolo: '📿', papel: 'Curandeiro / Suporte / Versátil',
    resumo: 'Canal do poder de uma divindade: cura, protege e também luta bem. O Domínio Divino (subclasse no nível 1) define se será mais guerreiro ou mais conjurador.',
    melhoresRacas: ['Anão da Colina', 'Elfo da Floresta', 'Humano (Variante)'],
  },
  'Druida': {
    simbolo: '🌿', papel: 'Conjurador / Metamorfo / Suporte',
    resumo: 'Guardião da natureza que conjura magias elementais e se transforma em animais com a Forma Selvagem. Ótimo controle de campo e utilidade fora de combate.',
    melhoresRacas: ['Elfo da Floresta', 'Anão da Colina', 'Humano (Variante)'],
  },
  'Guerreiro': {
    simbolo: '⚔️', papel: 'Dano / Tanque / Simples de jogar',
    resumo: 'Mestre de armas e armaduras. Ataques extras, Surto de Ação e Retomar o Fôlego o tornam confiável em qualquer combate. Ideal para quem está começando.',
    melhoresRacas: ['Anão da Montanha', 'Meio-Orc', 'Humano (Variante)'],
  },
  'Ladino': {
    simbolo: '🗡️', papel: 'Dano preciso / Perícias / Furtividade',
    resumo: 'Especialista em furtividade e golpes certeiros: o Ataque Furtivo causa dano enorme quando tem vantagem. Rei das perícias — armadilhas, fechaduras e lábia.',
    melhoresRacas: ['Halfling Pés-Leves', 'Alto Elfo', 'Humano (Variante)'],
  },
  'Mago': {
    simbolo: '🔮', papel: 'Conjurador supremo / Controle',
    resumo: 'Estudioso da magia arcana com o maior grimório do jogo. Frágil (d6), mas resolve quase qualquer problema com a magia certa. Escolhe uma Escola de Magia no nível 2.',
    melhoresRacas: ['Gnomo da Floresta', 'Alto Elfo', 'Humano (Variante)'],
  },
  'Monge': {
    simbolo: '🥋', papel: 'Dano rápido / Mobilidade',
    resumo: 'Artista marcial que canaliza o Ki: vários ataques desarmados, deslocamento altíssimo e o temido Golpe Atordoante. Dispensa armas e armadura.',
    melhoresRacas: ['Elfo da Floresta', 'Humano (Variante)', 'Halfling Pés-Leves'],
  },
  'Paladino': {
    simbolo: '🛡️', papel: 'Tanque / Dano explosivo / Suporte',
    resumo: 'Guerreiro sagrado unido por um juramento. A Punição Divina gasta magia para causar dano radiante enorme; auras protegem todo o grupo. Cura pelas mãos.',
    melhoresRacas: ['Meio-Elfo', 'Draconato', 'Humano (Variante)'],
  },
  'Patrulheiro': {
    simbolo: '🏹', papel: 'Dano à distância / Explorador',
    resumo: 'Caçador da fronteira: rastreia, explora e elimina inimigos com arco ou duas armas. Meio-conjurador com magias de natureza a partir do nível 2.',
    melhoresRacas: ['Elfo da Floresta', 'Humano (Variante)', 'Halfling Robusto'],
  },
  'Feiticeiro': {
    simbolo: '🔥', papel: 'Dano mágico / Metamagia',
    resumo: 'A magia corre no seu sangue. Menos magias que o Mago, mas a Metamagia deixa moldá-las: duplicar, acelerar ou estender feitiços como ninguém.',
    melhoresRacas: ['Meio-Elfo', 'Draconato', 'Tiefling'],
  },
};

// Ordem de prioridade dos atributos por classe (quick build do PHB).
// Usada p/ distribuir o arranjo padrão/rolagens do melhor p/ o pior atributo.
const ATRIBUTOS_PRIORIDADE = {
  'Bárbaro':     ['for', 'con', 'des', 'sab', 'car', 'int'],
  'Bardo':       ['car', 'des', 'con', 'sab', 'int', 'for'],
  'Bruxo':       ['car', 'con', 'des', 'sab', 'int', 'for'],
  'Clérigo':     ['sab', 'con', 'for', 'des', 'car', 'int'],
  'Druida':      ['sab', 'con', 'des', 'int', 'car', 'for'],
  'Feiticeiro':  ['car', 'con', 'des', 'sab', 'int', 'for'],
  'Guerreiro':   ['for', 'con', 'des', 'sab', 'car', 'int'],
  'Ladino':      ['des', 'con', 'int', 'sab', 'car', 'for'],
  'Mago':        ['int', 'con', 'des', 'sab', 'car', 'for'],
  'Monge':       ['des', 'sab', 'con', 'for', 'int', 'car'],
  'Paladino':    ['for', 'car', 'con', 'sab', 'des', 'int'],
  'Patrulheiro': ['des', 'sab', 'con', 'for', 'int', 'car'],
};

// Melhor conjunto de valores dentro das regras (compra de pontos, 27 pts do PHB):
// dois 15 nos atributos-chave da classe + 14 de apoio. Distribuído via ATRIBUTOS_PRIORIDADE.
const ARRANJO_OTIMO = [15, 15, 14, 10, 8, 8];

const RACAS_RESUMO = {
  'Anão da Colina':    { simbolo: '⚒️', resumo: 'Resistente e sábio: +1 PV por nível o torna incrivelmente durável. Ideal para Clérigos e Druidas.' },
  'Anão da Montanha':  { simbolo: '⛏️', resumo: 'O anão combatente: força e constituição altas, e proficiência com armaduras leve e média mesmo em classes que não a teriam.' },
  'Alto Elfo':         { simbolo: '✨', resumo: 'Elegante e arcano: ganha um truque de Mago de graça. Ótimo para Magos e Ladinos que querem um toque de magia.' },
  'Elfo da Floresta':  { simbolo: '🍃', resumo: 'Rápido (deslocamento 35) e perceptivo. Esconde-se na natureza. Perfeito para Patrulheiros, Druidas, Clérigos e Monges.' },
  'Drow (Elfo Negro)': { simbolo: '🌑', resumo: 'Visão no escuro superior (36m) e magias inatas, mas sofre sob luz solar. Combina com Bruxos e Bardos.' },
  'Halfling Pés-Leves':{ simbolo: '🍀', resumo: 'Sortudo (rerrola 1 no d20) e furtivo — esconde-se atrás de aliados. Excelente para Ladinos e Bardos.' },
  'Halfling Robusto':  { simbolo: '🍺', resumo: 'Sortudo e resistente a veneno. Pequeno mas difícil de derrubar. Bom para Patrulheiros e Clérigos.' },
  'Humano':            { simbolo: '🧑', resumo: '+1 em TODOS os atributos. Simples e sólido em qualquer classe — nunca é uma escolha errada.' },
  'Humano (Variante)': { simbolo: '🎯', resumo: 'Troca os bônus gerais por +1 em dois atributos à escolha, 1 perícia e 1 TALENTO no nível 1 — a raça mais flexível do jogo.' },
  'Draconato':         { simbolo: '🐉', resumo: 'Sangue de dragão: arma de sopro (2d6) e resistência a um tipo de dano. Forte e carismático — ótimo Paladino ou Feiticeiro.' },
  'Gnomo da Floresta': { simbolo: '🍄', resumo: 'Inteligente e astuto: vantagem contra magias mentais e o truque Ilusão Menor. Feito para Magos.' },
  'Gnomo das Rochas':  { simbolo: '⚙️', resumo: 'Inventor curioso: cria pequenos dispositivos e resiste a magias mentais. Combina com Magos e Artífices de alma.' },
  'Meio-Elfo':         { simbolo: '🌓', resumo: '+2 Carisma, +1 em DOIS atributos à escolha e 2 perícias livres. A melhor raça para Bardos, Bruxos, Feiticeiros e Paladinos.' },
  'Meio-Orc':          { simbolo: '💪', resumo: 'Fica de pé com 1 PV quando cairia a 0, e críticos devastadores. Nasceu para ser Bárbaro ou Guerreiro.' },
  'Tiefling':          { simbolo: '😈', resumo: 'Herança infernal: resistência a fogo e magias inatas (Taumaturgia, Repreensão Infernal). Bruxos e Feiticeiros por natureza.' },
};

// Nomes para o gerador aleatório
const NOMES_ALEATORIOS = [
  'Thorin', 'Lyra', 'Gareth', 'Sariel', 'Borin', 'Vex', 'Aelar', 'Mira',
  'Drogan', 'Elowen', 'Kael', 'Nyssa', 'Ragnar', 'Tahlia', 'Fenn', 'Isolde',
  'Bromm', 'Seraphina', 'Oryn', 'Wrenna', 'Dax', 'Liora', 'Garrick', 'Yvanna',
];
