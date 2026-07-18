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
// Cada um também traz tabelas sugeridas de personalidade (traços, ideais,
// ligações, defeitos): o jogador pode escolher da lista OU escrever à mão.
// =====================================================
const ANTECEDENTES = {
  'Acólito': { pericias: ['Intuição', 'Religião'], idiomas: 2, ferramentas: [],
    equipamento: 'Símbolo sagrado, livro de preces, 5 varetas de incenso, vestimentas, roupas comuns, bolsa com 15 po',
    caracteristica: 'Abrigo dos Fiéis: você e seus aliados recebem cura e cuidados gratuitos em templos da sua fé',
    tracosPersonalidade: [
      'Vejo sinais e presságios em tudo; a vontade divina guia cada um dos meus passos.',
      'Cito escrituras e parábolas quase sem perceber, mesmo fora de hora.',
      'Trato todos com uma calma serena, mesmo quem não merece.',
      'Sou ingênuo(a) e confio demais na bondade alheia.',
    ],
    ideais: [
      'Fé. Confio que minha divindade guia minhas ações. (Legal)',
      'Caridade. Sempre tento ajudar quem precisa, custe o que custar. (Bom)',
      'Tradição. As práticas antigas do meu templo devem ser preservadas. (Legal)',
      'Livre-arbítrio. Cada um deve encontrar sua própria fé. (Caótico)',
    ],
    ligacoes: [
      'Devo tudo ao sacerdote que me criou quando eu era órfão(ã).',
      'Um relicário sagrado foi roubado do meu templo; vou recuperá-lo.',
      'Minha fé foi posta à prova quando minha vila foi destruída; busco entender por quê.',
      'Protejo um segredo antigo confiado a mim pelo templo.',
    ],
    defeitos: [
      'Julgo os outros com dureza e a mim mesmo(a) ainda mais.',
      'Uma seita rival do meu templo despertaria minha fúria à primeira vista.',
      'Guardo desconfiança secreta da própria hierarquia da minha fé.',
      'Daria quase tudo para provar que minha fé é a única verdadeira.',
    ] },
  'Criminoso': { pericias: ['Enganação', 'Furtividade'], idiomas: 0, ferramentas: ['Um tipo de jogo (dados/baralho)', 'Ferramentas de Ladrão'],
    equipamento: 'Pé de cabra, roupas comuns escuras com capuz, bolsa com 15 po',
    caracteristica: 'Contato Criminal: tem um contato confiável que serve de intermediário com a rede do submundo',
    tracosPersonalidade: [
      'Sempre tenho um plano de fuga traçado para qualquer sala em que entro.',
      'Falo a língua dos submundos e testo isso com estranhos por hábito.',
      'Confio pouco, e quando confio, é calculado.',
      'Uso o humor para desarmar situações tensas — e desviar suspeitas.',
    ],
    ideais: [
      'Liberdade. Ninguém deveria estar acorrentado à opressão. (Caótico)',
      'Honra entre ladrões. Meu código pessoal vale mais que a lei. (Neutro)',
      'Ganância. Estou nessa pelo dinheiro, sem desculpas. (Mau)',
      'Redenção. Há uma chance de eu deixar essa vida para trás. (Bom)',
    ],
    ligacoes: [
      'Devo um grande favor a um antigo comparsa que me tirou da cadeia.',
      'Minha antiga gangue me quer morto(a) por uma traição que cometi.',
      'Escondo o produto do meu último grande golpe em algum lugar seguro.',
      'Um contato do submundo sabe demais sobre o meu passado.',
    ],
    defeitos: [
      'Não resisto a uma pechincha fácil, mesmo sabendo que é armadilha.',
      'Meu temperamento me mete em brigas que eu poderia evitar.',
      'Confio demais em velhos hábitos de trapaça, mesmo com aliados.',
      'Se descobrirem quem eu realmente fui, perco tudo o que construí.',
    ] },
  'Herói do Povo': { pericias: ['Adestrar Animais', 'Sobrevivência'], idiomas: 0, ferramentas: ['Um tipo de ferramenta de artesão', 'Veículos terrestres'],
    equipamento: 'Ferramentas de artesão, pá, panela de ferro, roupas comuns, bolsa com 10 po',
    caracteristica: 'Hospitalidade Rústica: o povo comum o acolhe, esconde e ajuda quando precisa',
    tracosPersonalidade: [
      'Julgo as pessoas pelas ações, nunca pela origem ou riqueza.',
      'Trabalho incansavelmente, e espero o mesmo de quem está ao meu lado.',
      'Sou humilde a ponto de recusar elogios que mereço.',
      'Confio demais nas pessoas comuns, mesmo quando não deveria.',
    ],
    ideais: [
      'Igualdade. Ninguém nasce melhor que ninguém. (Bom)',
      'Comunidade. É nosso dever cuidar uns dos outros. (Legal)',
      'Independência. Ninguém deve se curvar a nobres ou tiranos. (Caótico)',
      'Destino. Algo maior me trouxe até aqui, e eu vou cumpri-lo. (Neutro)',
    ],
    ligacoes: [
      'Trabalho para proteger minha vila natal das ameaças do mundo.',
      'Um nobre local arruinou a vida da minha família; um dia vou enfrentá-lo.',
      'Devo minha vida a um estranho que me salvou quando eu era criança.',
      'Minhas ferramentas de trabalho pertenceram ao meu pai; são tudo que restou dele.',
    ],
    defeitos: [
      'Desconfio profundamente de nobres, autoridades e quem se acha superior.',
      'Não sei recusar um pedido de ajuda, mesmo perigoso.',
      'Guardo rancor de quem já me tratou com desprezo.',
      'Sou fácil de manipular apelando à minha lealdade ao povo comum.',
    ] },
  'Nobre': { pericias: ['História', 'Persuasão'], idiomas: 1, ferramentas: ['Um tipo de jogo (dados/baralho)'],
    equipamento: 'Roupas finas, anel de sinete, pergaminho de linhagem, bolsa com 25 po',
    caracteristica: 'Posição de Privilégio: é bem tratado pela alta sociedade e tem acesso a audiências',
    tracosPersonalidade: [
      'Meu sangue é minha maior credencial, e faço questão de lembrar os outros disso.',
      'Trato os subalternos com uma cortesia estudada e distante.',
      'Nunca demonstro fraqueza ou dúvida em público.',
      'Aprecio a boa companhia e a boa mesa, mesmo em campo de batalha.',
    ],
    ideais: [
      'Nobreza obriga. Meu privilégio vem com responsabilidade. (Bom)',
      'Poder. Um dia comandarei tanto quanto puder alcançar. (Mau)',
      'Família. O nome da minha linhagem vem antes de tudo. (Legal)',
      'Nobreza é reputação. O que os outros pensam de mim é o que importa. (Neutro)',
    ],
    ligacoes: [
      'Restaurar a honra do meu nome de família é minha missão de vida.',
      'Estou apaixonado(a) por alguém abaixo da minha posição social — um escândalo.',
      'Um rival da corte trama contra mim; preciso descobrir o que ele sabe.',
      'Devo lealdade a um mentor que arriscou tudo por mim.',
    ],
    defeitos: [
      'Meu senso de superioridade me cega para meus próprios erros.',
      'Um vício caro ameaça consumir minha fortuna e reputação.',
      'Não suporto ser contrariado(a), especialmente por quem considero inferior.',
      'Farei quase qualquer coisa para não perder meu status.',
    ] },
  'Sábio': { pericias: ['Arcanismo', 'História'], idiomas: 2, ferramentas: [],
    equipamento: 'Frasco de tinta, pena, faca pequena, carta de um colega falecido, roupas comuns, bolsa com 10 po',
    caracteristica: 'Pesquisador: ao não saber algo, costuma saber onde e com quem obter a informação',
    tracosPersonalidade: [
      'Uso três citações eruditas quando uma frase simples bastaria.',
      'Sou fascinado(a) por qualquer mistério, mesmo os que não me dizem respeito.',
      'Costumo esquecer coisas do cotidiano enquanto penso em teorias.',
      'Prefiro resolver problemas com pesquisa, não com espada.',
    ],
    ideais: [
      'Conhecimento. O saber deve ser buscado, custe o que custar. (Neutro)',
      'Verdade. Não importa quão dolorosa, a verdade deve vir à tona. (Bom)',
      'Autoaperfeiçoamento. Estudo para me tornar mais forte e sábio(a). (Qualquer)',
      'Poder pelo saber. Conhecimento é a chave para controlar o mundo. (Mau)',
    ],
    ligacoes: [
      'Busco um livro perdido que pode conter a resposta que dediquei minha vida a encontrar.',
      'Um mentor foi silenciado por saber demais; continuo o trabalho dele.',
      'Minha pesquisa acidentalmente despertou algo que não deveria ter sido perturbado.',
      'Escrevo cartas constantes para um colega distante que compartilha meu campo de estudo.',
    ],
    defeitos: [
      'Ignoro perigo óbvio quando estou perto de uma descoberta.',
      'Sou arrogante sobre meu próprio intelecto e desdenho quem sabe menos.',
      'Guardo uma teoria herética que poderia arruinar minha reputação acadêmica.',
      'Confio demais em fontes escritas, mesmo quando a experiência prática diz o contrário.',
    ] },
  'Soldado': { pericias: ['Atletismo', 'Intimidação'], idiomas: 0, ferramentas: ['Um tipo de jogo (dados/baralho)', 'Veículos terrestres'],
    equipamento: 'Insígnia de patente, troféu de inimigo, jogo de dados ou baralho, roupas comuns, bolsa com 10 po',
    caracteristica: 'Patente Militar: soldados de sua antiga facção ainda reconhecem sua autoridade',
    tracosPersonalidade: [
      'Ainda marcho e organizo o acampamento como se estivesse na tropa.',
      'Sou direto(a) e sem rodeios — economizo palavras como economizava rações.',
      'Faço piadas sombrias sobre a morte; é como lido com o trauma.',
      'Vejo tudo como uma questão tática, até discussões triviais.',
    ],
    ideais: [
      'Lealdade. Meus companheiros de armas vêm antes de tudo. (Legal)',
      'Grande Responsabilidade. Aqueles com poder devem proteger os fracos. (Bom)',
      'Sobrevivência. As batalhas me ensinaram a olhar por mim mesmo(a). (Neutro)',
      'Vingança. Vou fazer quem me traiu na guerra pagar. (Mau)',
    ],
    ligacoes: [
      'Ainda tenho pesadelos com a batalha em que perdi quase todo o meu pelotão.',
      'Um antigo comandante me traiu; um dia vou confrontá-lo.',
      'Escrevo para a família de um companheiro que morreu me protegendo.',
      'Guardo o distintivo de um amigo caído até poder devolvê-lo à família dele.',
    ],
    defeitos: [
      'Tenho dificuldade em obedecer ordens que considero erradas — ou o oposto, obedeço até demais.',
      'Bebida e jogos de azar consomem meu soldo sempre que posso.',
      'Explodo em fúria quando lembro da guerra.',
      'Confio cegamente em hierarquias militares, mesmo corruptas.',
    ] },
  'Charlatão': { pericias: ['Enganação', 'Prestidigitação'], idiomas: 0, ferramentas: ['Kit de Disfarce', 'Ferramentas de Falsificador'],
    equipamento: 'Roupas finas, kit de disfarce, ferramentas de trapaça, bolsa com 15 po',
    caracteristica: 'Identidade Falsa: possui uma segunda identidade documentada e sabe forjar documentos',
    tracosPersonalidade: [
      'Falo com tanta convicção que até eu quase acredito nas minhas próprias mentiras.',
      'Tenho um apelido, história ou identidade pronta para qualquer situação.',
      'Avalio o valor de qualquer objeto ou pessoa em segundos.',
      'Sorrio para todos, mesmo para quem estou prestes a enganar.',
    ],
    ideais: [
      'Independência. Ninguém decide meu destino além de mim. (Caótico)',
      'Justiça poética. Só engano quem merece ser enganado. (Neutro)',
      'Ganância. O golpe certo paga por um ano de trabalho honesto. (Mau)',
      'Amizade. Meus parceiros de trapaça são a única família que confio. (Bom)',
    ],
    ligacoes: [
      'Fugi de uma cidade deixando uma dívida enorme e um nome falso queimado.',
      'Um golpe deu terrivelmente errado e feriu alguém inocente; carrego essa culpa.',
      'Procuro a pessoa que me ensinou tudo o que sei — e que sumiu com meu dinheiro.',
      'Tenho uma identidade falsa tão bem construída que às vezes esqueço quem realmente sou.',
    ],
    defeitos: [
      'Não resisto a uma boa oportunidade de trapacear, mesmo entre amigos.',
      'Uma antiga vítima jurou vingança e pode aparecer a qualquer momento.',
      'Minto por hábito, mesmo quando a verdade seria mais fácil.',
      'Gasto tudo que ganho tentando parecer mais rico(a) do que sou.',
    ] },
  'Artista': { pericias: ['Acrobacia', 'Atuação'], idiomas: 0, ferramentas: ['Kit de Disfarce', 'Um instrumento musical'],
    equipamento: 'Instrumento musical, prenda de um admirador, fantasia, bolsa com 15 po',
    caracteristica: 'Por Demanda Popular: sempre encontra onde se apresentar e ser acolhido em troca',
    tracosPersonalidade: [
      'Minha plateia vem sempre em primeiro lugar — até em perigo.',
      'Coleciono elogios e histórias como outros coletam moedas.',
      'Vejo drama e potencial de espetáculo em qualquer situação.',
      'Nunca recuso um desafio de talento, mesmo quando não deveria aceitar.',
    ],
    ideais: [
      'Beleza. A arte deve inspirar e emocionar acima de tudo. (Bom)',
      'Fama. Serei lembrado(a) muito depois de partir. (Qualquer)',
      'Verdade Emocional. A arte revela verdades que palavras comuns escondem. (Caótico)',
      'Patrocínio. Sirvo a quem paga minhas contas, sem julgamento. (Neutro)',
    ],
    ligacoes: [
      'Um mecenas antigo investiu tudo em minha carreira; não posso decepcioná-lo.',
      'Fui expulso(a) de uma companhia de artistas por um escândalo que não foi só culpa minha.',
      'Escrevo uma obra-prima inspirada em alguém que perdi.',
      'Um rival artístico jurou me superar ou me arruinar — o que vier primeiro.',
    ],
    defeitos: [
      'Minha vaidade é fácil de manipular com elogios.',
      'Não resisto a um caso amoroso complicado.',
      'Gasto além do que ganho para manter as aparências.',
      'Um escândalo do meu passado pode destruir minha reputação a qualquer momento.',
    ] },
  'Eremita': { pericias: ['Medicina', 'Religião'], idiomas: 1, ferramentas: ['Kit de Herbalismo'],
    equipamento: 'Estojo de pergaminhos com anotações, cobertor, roupas comuns, kit de herbalismo, 5 po',
    caracteristica: 'Descoberta: durante seu isolamento, descobriu uma verdade única e poderosa',
    tracosPersonalidade: [
      'Falo pouco, e quando falo, escolho cada palavra com cuidado.',
      'Vivi tanto tempo sozinho(a) que ainda esqueço convenções sociais básicas.',
      'Encontro significado espiritual em coisas pequenas que os outros ignoram.',
      'Sou desconfortavelmente honesto(a), sem perceber o efeito que isso causa.',
    ],
    ideais: [
      'Contemplação. As respostas mais importantes vêm do silêncio. (Neutro)',
      'Compaixão Solitária. Ajudo o mundo à distância, sem me expor a ele. (Bom)',
      'Isolamento Autoimposto. O mundo lá fora só traz corrupção. (Legal)',
      'Descoberta Perigosa. O que aprendi sozinho(a) pode mudar tudo — para o bem ou para o mal. (Qualquer)',
    ],
    ligacoes: [
      'Descobri algo em meu isolamento que o mundo precisa saber — ou talvez não devesse.',
      'Fugi da sociedade após uma tragédia que ainda não superei.',
      'Um antigo mestre me deixou sozinho(a) com um propósito que ainda tento entender.',
      'Protejo o local sagrado onde vivi isolado(a) por tantos anos.',
    ],
    defeitos: [
      'Tenho dificuldade genuína em confiar em grupos grandes de pessoas.',
      'Minha visão de mundo, moldada no isolamento, às vezes está simplesmente errada.',
      'Prefiro resolver tudo sozinho(a), mesmo quando pedir ajuda seria mais sábio.',
      'Um segredo do meu isolamento pode atrair perigo para quem está perto de mim.',
    ] },
  'Forasteiro': { pericias: ['Atletismo', 'Sobrevivência'], idiomas: 1, ferramentas: ['Um instrumento musical'],
    equipamento: 'Cajado, armadilha de caça, troféu de animal, roupas comuns, bolsa com 10 po',
    caracteristica: 'Andarilho: memória excepcional para geografia; sempre acha comida e água para o grupo',
    tracosPersonalidade: [
      'Sinto-me sufocado(a) dentro de paredes e telhados por tempo demais.',
      'Leio rastros, clima e terreno como os outros leem um livro.',
      'Sou desconfiado(a) de estranhos até provarem que são de confiança.',
      'Encontro conforto em fogueiras, estrelas e silêncio, não em multidões.',
    ],
    ideais: [
      'Mudança. A vida é uma jornada constante, nunca um destino fixo. (Caótico)',
      'Grandeza. Um dia serei lembrado(a) como o(a) maior de todos os viajantes. (Qualquer)',
      'Natureza. O mundo selvagem deve ser respeitado, não conquistado. (Neutro)',
      'Honra. Minha palavra empenhada vale mais que ouro. (Legal)',
    ],
    ligacoes: [
      'Busco o lugar de onde vim, mesmo sem saber ao certo onde fica.',
      'Uma tribo ou comunidade errante ainda me chama de um dos seus.',
      'Guardo um talismã de família que me lembra de casa, onde quer que ela seja.',
      'Uma antiga promessa a um companheiro de estrada ainda não foi cumprida.',
    ],
    defeitos: [
      'Não confio em cidades grandes e nas regras de quem vive nelas.',
      'Tenho dificuldade em ficar parado(a) por muito tempo, mesmo quando é necessário.',
      'Guardo rancor de quem me expulsou de onde eu pertencia.',
      'Prefiro resolver conflitos sozinho(a), na base da sobrevivência, não da diplomacia.',
    ] },
  'Marujo': { pericias: ['Atletismo', 'Percepção'], idiomas: 0, ferramentas: ['Ferramentas de Navegação', 'Veículos aquáticos'],
    equipamento: 'Cabo de corda resistente, amuleto da sorte, roupas comuns, bolsa com 10 po',
    caracteristica: 'Passagem de Navio: consegue transporte marítimo gratuito para si e seus aliados',
    tracosPersonalidade: [
      'Meço qualquer situação como se fosse o convés de um navio em tempestade.',
      'Meu vocabulário é cheio de gírias de porto que confundem quem nunca navegou.',
      'Bebo, aposto e conto histórias como se cada porto fosse o último.',
      'Confio no instinto do mar mais do que em mapas ou conselhos.',
    ],
    ideais: [
      'Liberdade. O mar não pertence a ninguém, e eu também não. (Caótico)',
      'Lealdade de Tripulação. Meus companheiros de convés são minha família. (Bom)',
      'Fortuna. Um bom golpe de sorte pode mudar tudo num só porto. (Neutro)',
      'Ambição. Um dia terei meu próprio navio. (Qualquer)',
    ],
    ligacoes: [
      'Perdi meu navio e tripulação numa tempestade — ou numa traição — e ainda carrego essa dor.',
      'Devo minha vida ao capitão que me recolheu quando eu não tinha nada.',
      'Uma dívida de jogo em um porto distante ainda pode me alcançar.',
      'Busco um tesouro afundado de que só eu conheço a localização exata.',
    ],
    defeitos: [
      'Aposto mais do que deveria, sempre achando que a próxima rodada vira o jogo.',
      'Bebo demais quando estou em terra firme por muito tempo.',
      'Um antigo capitão ou rival de mar jurou me afundar — literalmente.',
      'Tenho dificuldade com autoridade que nunca pisou num convés.',
    ] },
  'Órfão': { pericias: ['Furtividade', 'Prestidigitação'], idiomas: 0, ferramentas: ['Kit de Disfarce', 'Ferramentas de Ladrão'],
    equipamento: 'Faca pequena, mapa da cidade natal, animalzinho de estimação, lembrança dos pais, roupas comuns, 10 po',
    caracteristica: 'Segredos da Cidade: conhece atalhos urbanos, viajando o dobro da velocidade entre locais da cidade',
    tracosPersonalidade: [
      'Aprendi a passar despercebido(a); é um hábito difícil de largar.',
      'Guardo pequenas coisas — moedas, botões, fitas — por medo de precisar delas depois.',
      'Confio rápido em quem me trata com gentileza, talvez rápido demais.',
      'Sei negociar, mendigar e sumir antes que alguém perceba.',
    ],
    ideais: [
      'Sobrevivência. Faço o que for preciso para ver o amanhecer. (Neutro)',
      'Comunidade. As ruas me criaram; devo isso a quem ainda vive nelas. (Bom)',
      'Ambição. Vou sair da pobreza nem que seja para sempre. (Qualquer)',
      'Desconfiança. O mundo já me abandonou uma vez; não deixo que aconteça de novo. (Caótico)',
    ],
    ligacoes: [
      'Uma rede de outros órfãos ainda me considera parte da família que escolhemos.',
      'Busco a verdade sobre o que aconteceu com meus pais.',
      'Guardo o único objeto que restou da minha família biológica.',
      'Alguém das ruas me ajudou a sobreviver; um dia vou retribuir.',
    ],
    defeitos: [
      'Tenho o hábito de pegar o que preciso primeiro, perguntar depois.',
      'Tenho dificuldade genuína em confiar em figuras de autoridade.',
      'Escondo minha origem humilde por vergonha, mesmo quando não precisaria.',
      'Meu medo de ser abandonado(a) de novo me faz agarrar demais quem eu amo.',
    ] },
  'Artesão da Guilda': { pericias: ['Intuição', 'Persuasão'], idiomas: 1, ferramentas: ['Um tipo de ferramenta de artesão'],
    equipamento: 'Ferramentas de artesão, carta de recomendação da guilda, roupas de viajante, bolsa com 15 po',
    caracteristica: 'Membro de Guilda: a guilda oferece abrigo, apoio político e acesso a contatos do ofício',
    tracosPersonalidade: [
      'Avalio a qualidade de qualquer objeto instintivamente, por hábito profissional.',
      'Sou orgulhoso(a) do meu ofício e falo dele à menor oportunidade.',
      'Negocio tudo, até favores pessoais, como se fosse um contrato de guilda.',
      'Trato colegas de outras guildas com uma rivalidade cordial, mas real.',
    ],
    ideais: [
      'Comunidade. A guilda é mais forte que qualquer membro sozinho. (Legal)',
      'Ganância Honesta. Mereço lucrar do meu próprio trabalho e talento. (Neutro)',
      'Excelência. Meu ofício deve ser o melhor que existe, sem atalhos. (Bom)',
      'Ambição. Um dia comandarei a guilda inteira. (Qualquer)',
    ],
    ligacoes: [
      'Devo minha posição na guilda a um mestre que investiu tempo em mim.',
      'Um rival de guilda sabotou meu trabalho uma vez; ainda não esqueci.',
      'Uma peça-mestra que criei foi roubada, e quero recuperá-la.',
      'Sustento parentes distantes com o que ganho no meu ofício.',
    ],
    defeitos: [
      'Coloco o nome da guilda acima de amizades pessoais, às vezes por engano.',
      'Tenho orgulho ferido fácil quando questionam minha competência.',
      'Aceito trabalhos que sei que são antiéticos, desde que bem pagos.',
      'Guardo ressentimento de colegas de guilda que subiram mais rápido que eu.',
    ] },
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

// (equipamento inicial e ouro por classe agora vivem em equipamento.js:
//  KIT_INICIAL e OURO_ROLAGEM - rolagem oficial do PHB, unica por ficha)
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

// =====================================================
// FÉ & PACTO — Divindades e Patronos Sobrenaturais
// Toda ficha pode devotar-se a uma divindade OU declarar-se atéia.
// Clérigos e Paladinos PRECISAM de uma divindade (canalizam o poder dela).
// Bruxos PRECISAM de um patrono (a entidade do pacto), além da subclasse
// que define o TIPO de patrono (O Corruptor / O Arquifada / O Grande Antigo).
// =====================================================
const SEM_DIVINDADE = 'Ateu (sem divindade)';

// Agrupadas por tema (panteão de Faerûn, PHB). titulo aparece no <select>;
// dominio/alinhamento/simbolo alimentam o painel de informação e a ficha.
const DIVINDADES = {
  'Vida e Luz': {
    'Lathander':  { titulo: 'Senhor da Manhã', dominio: 'Vida, Luz', alinhamento: 'Neutro e Bom', simbolo: 'Estrada do nascer do sol', resumo: 'Deus do amanhecer, do renascimento e dos novos começos. Padroeiro de quem recomeça.' },
    'Chauntea':   { titulo: 'A Grande Mãe', dominio: 'Vida', alinhamento: 'Neutra e Boa', simbolo: 'Rosa florescendo sobre trigo', resumo: 'Deusa da agricultura e da colheita. Venerada em cada campo e celeiro.' },
    'Ilmater':    { titulo: 'O Deus que Chora', dominio: 'Vida', alinhamento: 'Leal e Bom', simbolo: 'Mãos atadas nos pulsos', resumo: 'Deus do martírio e da resistência ao sofrimento. Acolhe os que carregam a dor dos outros.' },
    'Sune':       { titulo: 'Senhora dos Cabelos de Fogo', dominio: 'Vida, Luz', alinhamento: 'Caótica e Boa', simbolo: 'Rosto de mulher ruiva', resumo: 'Deusa do amor e da beleza. Seus fiéis buscam e protegem tudo que é belo.' },
    'Selûne':     { titulo: 'Nossa Senhora da Prata', dominio: 'Conhecimento, Vida', alinhamento: 'Caótica e Boa', simbolo: 'Olhos rodeados por sete estrelas', resumo: 'Deusa da lua, das marés e dos viajantes noturnos. Eterna inimiga de Shar.' },
  },
  'Guerra e Proteção': {
    'Tempus':     { titulo: 'Senhor das Batalhas', dominio: 'Guerra', alinhamento: 'Neutro', simbolo: 'Espada flamejante erguida', resumo: 'Deus da guerra em si — não de causas. Honra a coragem, despreza a covardia.' },
    'Torm':       { titulo: 'A Mão Certa', dominio: 'Guerra', alinhamento: 'Leal e Bom', simbolo: 'Manopla direita erguida', resumo: 'Deus do dever e da lealdade. Padroeiro dos paladinos que servem sem hesitar.' },
    'Tyr':        { titulo: 'O Deus Mutilado', dominio: 'Guerra', alinhamento: 'Leal e Bom', simbolo: 'Balança sobre martelo de guerra', resumo: 'Deus da justiça. Perdeu a mão cumprindo a própria lei — e cobra o mesmo rigor.' },
    'Helm':       { titulo: 'O Vigilante', dominio: 'Vida, Luz', alinhamento: 'Leal e Neutro', simbolo: 'Olho aberto sobre manopla', resumo: 'Deus da proteção e dos guardiões. Nunca dorme, nunca abandona o posto.' },
  },
  'Conhecimento e Magia': {
    'Mystra':     { titulo: 'A Senhora dos Mistérios', dominio: 'Conhecimento', alinhamento: 'Neutra e Boa', simbolo: 'Círculo de sete estrelas', resumo: 'Deusa da magia e guardiã da Teia de magia. Todo conjurador lhe deve algo.' },
    'Oghma':      { titulo: 'O Aglutinador', dominio: 'Conhecimento', alinhamento: 'Neutro', simbolo: 'Pergaminho em branco', resumo: 'Deus do conhecimento, dos bardos e da inspiração. Uma ideia vale mais que ouro.' },
    'Azuth':      { titulo: 'O Altíssimo', dominio: 'Conhecimento', alinhamento: 'Leal e Neutro', simbolo: 'Mão esquerda apontando para cima', resumo: 'Deus dos magos e do estudo arcano disciplinado. Servo e amigo de Mystra.' },
    'Gond':       { titulo: 'O Maravilhoso', dominio: 'Conhecimento', alinhamento: 'Neutro', simbolo: 'Engrenagem dentada com quatro raios', resumo: 'Deus dos artífices e das invenções. O progresso é a sua oração.' },
  },
  'Natureza e Tempestades': {
    'Silvanus':   { titulo: 'Pai Carvalho', dominio: 'Natureza', alinhamento: 'Neutro', simbolo: 'Folha de carvalho', resumo: 'Deus da natureza selvagem. Venerado por druidas nas florestas profundas.' },
    'Mielikki':   { titulo: 'Nossa Senhora da Floresta', dominio: 'Natureza', alinhamento: 'Neutra e Boa', simbolo: 'Unicórnio', resumo: 'Deusa das florestas e dos patrulheiros. Protege quem protege a mata.' },
    'Eldath':     { titulo: 'Deusa das Águas Serenas', dominio: 'Natureza, Vida', alinhamento: 'Neutra e Boa', simbolo: 'Cascata sobre lago tranquilo', resumo: 'Deusa da paz, das nascentes e dos refúgios. Sua fé rejeita a violência.' },
    'Talos':      { titulo: 'O Destruidor', dominio: 'Tempestade', alinhamento: 'Caótico e Mau', simbolo: 'Três raios saindo de um ponto', resumo: 'Deus das tempestades e da destruição. Cultuado por medo, não por amor.' },
    'Umberlee':   { titulo: 'A Rainha das Profundezas', dominio: 'Tempestade', alinhamento: 'Caótica e Má', simbolo: 'Onda do mar encrespada', resumo: 'Deusa cruel do mar. Marujos lhe pagam tributo para não afundar.' },
  },
  'Fortuna, Sombras e Morte': {
    'Tymora':     { titulo: 'Senhora Sorte', dominio: 'Engano', alinhamento: 'Caótica e Boa', simbolo: 'Moeda sem face', resumo: 'Deusa da boa sorte. Padroeira de aventureiros e de quem ousa arriscar.' },
    'Beshaba':    { titulo: 'A Donzela do Infortúnio', dominio: 'Engano', alinhamento: 'Caótica e Má', simbolo: 'Chifres negros de cervo', resumo: 'Deusa do azar. Invocada em sussurros, para que não repare em você.' },
    'Mask':       { titulo: 'Senhor das Sombras', dominio: 'Engano', alinhamento: 'Caótico e Neutro', simbolo: 'Máscara negra de veludo', resumo: 'Deus dos ladrões e da trapaça. Todo segredo tem o seu preço.' },
    'Shar':       { titulo: 'Senhora da Noite', dominio: 'Morte, Engano', alinhamento: 'Neutra e Má', simbolo: 'Disco negro com borda púrpura', resumo: 'Deusa da escuridão e da perda. Irmã gêmea e inimiga de Selûne.' },
    'Kelemvor':   { titulo: 'Senhor dos Mortos', dominio: 'Morte', alinhamento: 'Leal e Neutro', simbolo: 'Braço esquelético segurando balança', resumo: 'Juiz dos mortos — justo, não cruel. Seus fiéis caçam mortos-vivos.' },
    'Bane':       { titulo: 'A Mão Negra', dominio: 'Guerra', alinhamento: 'Leal e Mau', simbolo: 'Mão direita negra com polegar e dedos juntos', resumo: 'Deus da tirania e do medo. A ordem pela força, o mundo de joelhos.' },
  },
  'Panteões Ancestrais (raciais)': {
    'Moradin':    { titulo: 'Forjador de Almas', dominio: 'Conhecimento', alinhamento: 'Leal e Bom', simbolo: 'Martelo e bigorna', resumo: 'Pai dos anões. A forja, o clã e a honra acima de tudo.' },
    'Corellon Larethian': { titulo: 'Primeiro dos Seldarine', dominio: 'Luz', alinhamento: 'Caótico e Bom', simbolo: 'Lua crescente', resumo: 'Pai dos elfos, deus da arte e da magia. Eterno inimigo de Lolth.' },
    'Garl Glittergold': { titulo: 'O Protetor Risonho', dominio: 'Engano', alinhamento: 'Leal e Bom', simbolo: 'Pepita de ouro', resumo: 'Pai dos gnomos, deus do humor e da astúcia. Ri por último — e sempre.' },
    'Yondalla':   { titulo: 'A Protetora', dominio: 'Vida', alinhamento: 'Leal e Boa', simbolo: 'Escudo com cornucópia', resumo: 'Mãe dos halflings. Lar, fartura e família em segurança.' },
    'Gruumsh':    { titulo: 'O de Um Olho Só', dominio: 'Guerra, Tempestade', alinhamento: 'Caótico e Mau', simbolo: 'Olho que não pisca', resumo: 'Deus dos orcs, da conquista e da fúria. Perdeu um olho para Corellon.' },
    'Lolth':      { titulo: 'Rainha das Aranhas', dominio: 'Engano', alinhamento: 'Caótica e Má', simbolo: 'Aranha', resumo: 'Deusa dos drow. Teias, intriga e sacrifício — a fé que devora os seus.' },
    'Bahamut':    { titulo: 'O Dragão de Platina', dominio: 'Vida, Guerra', alinhamento: 'Leal e Bom', simbolo: 'Cabeça de dragão de perfil', resumo: 'Deus dos dragões bons e da justiça. Reverenciado por muitos draconatos.' },
    'Tiamat':     { titulo: 'A Rainha Dragão de Cinco Cabeças', dominio: 'Engano', alinhamento: 'Leal e Má', simbolo: 'Dragão de cinco cabeças', resumo: 'Deusa dos dragões cromáticos, da ganância e da vingança.' },
  },
};

// Busca os dados de uma divindade pelo nome (em qualquer grupo); null se não achar.
function divindadeDados(nome) {
  if (!nome || nome === SEM_DIVINDADE) return null;
  for (const g in DIVINDADES) if (DIVINDADES[g][nome]) return { grupo: g, ...DIVINDADES[g][nome] };
  return null;
}
// Lista achatada de todos os nomes de divindades (p/ gerador aleatório).
function listaDivindades() {
  const out = [];
  for (const g in DIVINDADES) out.push(...Object.keys(DIVINDADES[g]));
  return out;
}

// Entidades de pacto por TIPO de patrono — as chaves espelham os nomes das
// subclasses de Bruxo em SUBCLASSES['Bruxo'] (compendio.js).
const PATRONOS_PACTO = {
  'O Corruptor (Fiend)': {
    dica: 'Demônios, diabos e outros ínferos: poder em troca de corrupção.',
    entidades: {
      'Asmodeus':   { titulo: 'Senhor dos Nove Infernos', resumo: 'O arquidiabo supremo. Contratos perfeitos, letra miúda fatal.' },
      'Zariel':     { titulo: 'Arquiduquesa de Avernus', resumo: 'Anja caída que comanda a linha de frente dos Infernos.' },
      'Mefistófeles': { titulo: 'Arquiduque de Cania', resumo: 'Mestre do fogo infernal (hellfire) e das barganhas arcanas.' },
      'Dispater':   { titulo: 'Senhor da Cidade de Ferro', resumo: 'Paranoico e meticuloso; paga bem por segredos.' },
      'Demogorgon': { titulo: 'Príncipe dos Demônios', resumo: 'Duas cabeças, loucura dupla. O pacto que ninguém assina são.' },
      'Orcus':      { titulo: 'Príncipe Demônio da Morte-Viva', resumo: 'Senhor dos mortos-vivos; sua varinha apaga a vida.' },
      "Graz'zt":    { titulo: 'O Príncipe Sombrio', resumo: 'Demônio da sedução e da intriga. Cobra em favores — sempre.' },
      'Baphomet':   { titulo: 'O Príncipe das Bestas', resumo: 'Senhor dos minotauros e da fúria selvagem nos labirintos.' },
    },
  },
  'O Arquifada (Archfey)': {
    dica: 'Senhores feéricos: caprichosos, belos e perigosos como o inverno.',
    entidades: {
      'Titânia':    { titulo: 'Rainha da Corte de Verão', resumo: 'Radiante e orgulhosa; seus favores florescem e queimam.' },
      'Oberon':     { titulo: 'O Senhor Verde', resumo: 'Caçador feérico dos ermos; força selvagem e antiga.' },
      'Rainha do Ar e da Escuridão': { titulo: 'Soberana da Corte Sombria', resumo: 'A face gélida das fadas: beleza, mentira e noite eterna.' },
      'Príncipe do Gelo': { titulo: 'Herdeiro do Inverno', resumo: 'Melancólico e vingativo; pactos selados na neve.' },
      'Hyrsam':     { titulo: 'Príncipe dos Sátiros', resumo: 'Música, vinho e caos — a diversão que sai cara.' },
    },
  },
  'O Grande Antigo (Great Old One)': {
    dica: 'Entidades incompreensíveis de além das estrelas ou de eras esquecidas.',
    entidades: {
      'Ghaunadaur': { titulo: 'Aquele que Espreita', resumo: 'Deus-lodo dos limos e horrores rastejantes das profundezas.' },
      'Tharizdun':  { titulo: 'O Deus Acorrentado', resumo: 'Criador do Abismo, preso fora da realidade. Sonha — e sussurra.' },
      'Dendar':     { titulo: 'A Serpente da Noite', resumo: 'Devora pesadelos e espera o fim do mundo para eclodir.' },
      'Zargon':     { titulo: 'O Retornado', resumo: 'Horror de um éon anterior, impossível de destruir de verdade.' },
      'Grande Mãe': { titulo: 'Progenitora dos Beholders', resumo: 'Sonhadora cega cujos filhos são tiranos oculares.' },
    },
  },
};

// Nomes para o gerador aleatório
const NOMES_ALEATORIOS = [
  'Thorin', 'Lyra', 'Gareth', 'Sariel', 'Borin', 'Vex', 'Aelar', 'Mira',
  'Drogan', 'Elowen', 'Kael', 'Nyssa', 'Ragnar', 'Tahlia', 'Fenn', 'Isolde',
  'Bromm', 'Seraphina', 'Oryn', 'Wrenna', 'Dax', 'Liora', 'Garrick', 'Yvanna',
];
