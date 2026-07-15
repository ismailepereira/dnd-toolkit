// =====================================================
// FONTES / MÓDULOS DE AVENTURA — registro extensível
// -----------------------------------------------------
// Cada "fonte" representa um módulo/aventura publicado e pode trazer
// antecedentes extras (mesmo formato de ANTECEDENTES, em dados5e.js) com
// ganchos e ligações específicos daquela campanha.
//
// Para adicionar um novo módulo no futuro, basta criar uma nova entrada
// aqui com uma chave única, `nome` (exibido na UI) e `antecedentes` (mesmo
// shape usado em ANTECEDENTES: pericias/idiomas/ferramentas/equipamento/
// caracteristica/tracosPersonalidade/ideais/ligacoes/defeitos). Nada mais
// precisa mudar: o criador de personagem já lista qualquer fonte cadastrada
// aqui, agrupada pelo nome do módulo.
// =====================================================
const FONTES_AVENTURA = {
  ninho_rainha_dragao: {
    nome: 'Ninho da Rainha Dragão',
    antecedentes: {
      'Recruta da Milícia (Ninho da Rainha Dragão)': {
        pericias: ['Atletismo', 'Percepção'], idiomas: 0, ferramentas: ['Veículos terrestres'],
        equipamento: 'Insígnia da milícia local, uniforme surrado, lança, roupas comuns, bolsa com 10 po',
        caracteristica: 'Milícia de Fronteira: você serviu na milícia de uma vila ameaçada por incursões de um culto dracônico; ainda é reconhecido por outras milícias aliadas, que oferecem abrigo e um cavalo emprestado quando podem.',
        tracosPersonalidade: [
          'Já vi minha vila em chamas; não hesito mais diante do perigo.',
          'Organizo qualquer grupo em posições de defesa, mesmo sem que me peçam.',
          'Confio nos vizinhos mais do que em qualquer autoridade distante.',
          'Durmo com uma arma ao alcance desde a última incursão à minha vila.',
        ],
        ideais: [
          'Proteção. Ninguém mais vai queimar o que resta da minha gente. (Bom)',
          'Vigilância. O culto pode voltar a qualquer momento; nunca baixo a guarda. (Legal)',
          'Vingança. Vou encontrar quem liderou o ataque à minha vila. (Mau)',
          'Reconstrução. Depois da destruição, o que importa é erguer de novo. (Neutro)',
        ],
        ligacoes: [
          'Minha vila foi atacada por cultistas de dragão; ainda ajudo os sobreviventes a reconstruir.',
          'Um membro da milícia desapareceu durante o ataque; não descansarei até descobrir o que houve.',
          'Guardo uma escama de dragão encontrada nas ruínas — prova de que a ameaça é real.',
          'Devo minha vida a um forasteiro que ajudou a defender minha vila naquela noite.',
        ],
        defeitos: [
          'Vejo cultistas dracônicos em qualquer estranho suspeito, às vezes sem razão.',
          'Corro para o perigo antes de pensar, como fiz na noite do ataque.',
          'Guardo culpa por não ter salvado todos que podia naquela noite.',
          'Não confio em ninguém ligado a comércio de tesouros ou relíquias dracônicas.',
        ],
      },
      'Sobrevivente de Greenest (Ninho da Rainha Dragão)': {
        pericias: ['Sobrevivência', 'Medicina'], idiomas: 0, ferramentas: ['Kit de herbalismo'],
        equipamento: 'Cobertor chamuscado do incêndio, cantil, uma relíquia de família salva das chamas, roupas comuns, bolsa com 10 po',
        caracteristica: 'Fugitivo do Fogo: você escapou do ataque a Greenest e sabe se mover, esconder e cuidar de feridos em meio ao caos; refugiados e sobreviventes de outras vilas reconhecem em você um dos seus e compartilham abrigo e notícias.',
        tracosPersonalidade: [
          'Conto onde estão as saídas de qualquer lugar em que entro.',
          'Divido minha comida com quem tem menos, mesmo passando fome.',
          'Falo baixo e ando rápido; aprendi que barulho atrai o perigo.',
          'Guardo objetos inúteis porque me lembram de quem perdi.',
        ],
        ideais: [
          'Sobrevivência. Manter os vivos vivos é a única causa que importa. (Neutro)',
          'Compaixão. Ninguém deveria enfrentar o fogo sozinho. (Bom)',
          'Testemunho. O mundo precisa saber o que o culto fez em Greenest. (Legal)',
          'Endurecimento. O fraco morre; eu me tornei o que precisava ser. (Mau)',
        ],
        ligacoes: [
          'Procuro parentes que se perderam de mim na noite do ataque a Greenest.',
          'Devo a vida a um desconhecido que me tirou de um prédio em chamas.',
          'Jurei proteger uma criança órfã que resgatei do incêndio.',
          'Guardo a chave de uma casa em Greenest que talvez não exista mais.',
        ],
        defeitos: [
          'Congelo por um instante sempre que sinto cheiro de fumaça.',
          'Fujo do confronto direto — meu instinto é sempre me esconder.',
          'Culpo-me por ter sobrevivido quando tantos não sobreviveram.',
          'Desconfio de qualquer promessa de segurança; já vi como elas acabam.',
        ],
      },
      'Desertor do Culto (Ninho da Rainha Dragão)': {
        pericias: ['Enganação', 'Religião'], idiomas: 1, ferramentas: ['Kit de disfarce'],
        equipamento: 'Manto de cultista escondido no fundo da mochila, símbolo dracônico lascado, faca ritual, roupas comuns, bolsa com 10 po',
        caracteristica: 'De Dentro para Fora: você já pertenceu ao Culto do Dragão e conhece seus sinais, senhas, hierarquia e ritos; consegue reconhecer membros disfarçados e, com cuidado, se passar por um deles — mas vive com um preço na sua cabeça.',
        tracosPersonalidade: [
          'Reparo em símbolos e senhas que ninguém mais percebe.',
          'Meço cada palavra, por hábito de quem viveu entre traidores.',
          'Tento provar a mim mesmo, todo dia, que mudei de lado de verdade.',
          'Faço piadas ácidas sobre fé e fanatismo para esconder o passado.',
        ],
        ideais: [
          'Redenção. Vou desfazer o mal que ajudei a construir. (Bom)',
          'Conhecimento. Sei como o culto pensa — e vou usar isso contra ele. (Legal)',
          'Liberdade. Ninguém mais vai mandar na minha fé ou no meu destino. (Caótico)',
          'Sobrevivência. Mudei de lado porque o vento mudou; posso mudar de novo. (Neutro)',
        ],
        ligacoes: [
          'Um antigo companheiro de culto jurou me caçar por ter desertado.',
          'Roubei do culto um objeto que eles farão de tudo para recuperar.',
          'Quero salvar alguém que ainda está preso na hierarquia do culto.',
          'Carrego a culpa por um ritual do qual participei e não pude impedir.',
        ],
        defeitos: [
          'Meu passado no culto pode destruir a confiança do grupo se vier à tona.',
          'Ainda sinto atração pelo poder que o culto prometia.',
          'Minto por reflexo, mesmo quando a verdade seria mais simples.',
          'Entro em pânico diante de qualquer dragão — sei do que são capazes.',
        ],
      },
      'Guarda de Caravana (Ninho da Rainha Dragão)': {
        pericias: ['Percepção', 'Adestrar Animais'], idiomas: 1, ferramentas: ['Veículos terrestres'],
        equipamento: 'Chicote de condutor, mapa das rotas da Costa da Espada, ração de viagem, roupas de viajante, bolsa com 10 po',
        caracteristica: 'Conhecedor das Estradas: anos escoltando caravanas pela Costa da Espada lhe deram olho para emboscadas e amigos em cada posto de troca; mercadores e condutores confiam em você e oferecem carona, mantimentos e informações sobre as estradas.',
        tracosPersonalidade: [
          'Conheço uma boa história (e um bom atalho) para cada trecho de estrada.',
          'Trato os animais de carga melhor do que trato a maioria das pessoas.',
          'Estou sempre de olho no horizonte, esperando encrenca.',
          'Negocio o preço de tudo, por esporte.',
        ],
        ideais: [
          'Lealdade. Quem paga pela minha proteção recebe a minha proteção. (Legal)',
          'Liberdade. A estrada aberta é a única vida que quero. (Caótico)',
          'Comunidade. As rotas ligam as pessoas; protegê-las é proteger a todos. (Bom)',
          'Lucro. Toda viagem tem que valer a pena no fim. (Neutro)',
        ],
        ligacoes: [
          'O culto atacou uma caravana que eu deveria proteger; carrego essa dívida.',
          'Um mercador que salvei me deve um favor que ainda não cobrei.',
          'Conheço a rota que o culto usa para escoar o tesouro saqueado.',
          'Prometi levar uma encomenda a um destino que agora está em perigo.',
        ],
        defeitos: [
          'Coloco a carga e o contrato acima da segurança das pessoas.',
          'Não sei ficar parado; a vida sedentária me sufoca.',
          'Confio demais em velhos conhecidos de estrada, mesmo os duvidosos.',
          'Guardo rancor de quem já me passou a perna num negócio.',
        ],
      },
      'Órfão das Cinzas (Ninho da Rainha Dragão)': {
        pericias: ['Furtividade', 'Intuição'], idiomas: 0, ferramentas: ['Ferramentas de Ladrão'],
        equipamento: 'Escama de dragão que caiu na noite em que perdeu tudo, estilingue, roupas surradas, bolsa com 10 po',
        caracteristica: 'Filho da Destruição: um ataque dracônico tirou de você lar e família ainda cedo, e você cresceu se virando sozinho nas ruínas e becos; batedores, ladrões e crianças de rua o reconhecem como um dos seus e passam informação do submundo.',
        tracosPersonalidade: [
          'Nunca fico de costas para uma porta.',
          'Escondo comida e moedas em vários lugares, por precaução.',
          'Testo as pessoas com pequenas mentiras antes de confiar.',
          'Falo pouco do meu passado, mas ele transparece nos meus olhos.',
        ],
        ideais: [
          'Vingança. Um dia vou fazer os dragões e seus cultos pagarem. (Mau)',
          'Justiça. Nenhuma criança deveria passar pelo que eu passei. (Bom)',
          'Independência. Só conto comigo mesmo; foi o que me manteve vivo. (Caótico)',
          'Superação. Vou provar que sou mais do que aquilo que me tiraram. (Neutro)',
        ],
        ligacoes: [
          'Guardo a escama do dragão que destruiu minha vida — e sei reconhecê-lo.',
          'Um velho batedor me criou nas ruas; faria qualquer coisa por ele.',
          'Procuro um irmão que talvez tenha sobrevivido ao ataque.',
          'Devo minha sobrevivência a uma gangue que agora cobra a conta.',
        ],
        defeitos: [
          'Roubo por impulso, mesmo quando não preciso.',
          'Minha sede de vingança me cega para o perigo.',
          'Tenho dificuldade de confiar até em quem já provou lealdade.',
          'Fujo de laços afetivos com medo de perdê-los de novo.',
        ],
      },
    },
  },
  mina_perdida_phandelver: {
    nome: 'Mina Perdida de Phandelver',
    antecedentes: {
      'Herdeiro de Phandalin (Mina Perdida de Phandelver)': {
        pericias: ['História', 'Investigação'], idiomas: 1, ferramentas: ['Ferramentas de Cartógrafo'],
        equipamento: 'Escritura de terreno em Phandalin, bússola simples, mapa desenhado à mão, roupas de viajante, bolsa com 10 po',
        caracteristica: 'Raízes em Phandalin: sua família tem uma antiga ligação com a pequena cidade de mineração de Phandalin (terreno, dívida ou promessa); moradores locais o tratam com um crédito de confiança que ainda precisa ser conquistado.',
        tracosPersonalidade: [
          'Carrego comigo um mapa de família que talvez leve a uma mina esquecida.',
          'Falo sobre Phandalin com um orgulho que a cidade talvez não mereça ainda.',
          'Anoto tudo que vejo — rotas, nomes, boatos — por hábito de família.',
          'Confio fácil em quem também vem do interior, mais do que em nobres da capital.',
        ],
        ideais: [
          'Herança. Vou honrar (ou redimir) o nome da minha família em Phandalin. (Legal)',
          'Oportunidade. Uma cidade de fronteira é onde fortunas são feitas. (Neutro)',
          'Comunidade. Phandalin merece prosperar em paz, livre de bandidos e monstros. (Bom)',
          'Ambição. A mina perdida da minha família será minha, custe o que custar. (Qualquer)',
        ],
        ligacoes: [
          'Busco a mina que pertencia à minha família antes de ser perdida ou abandonada.',
          'Uma dívida antiga liga minha família a mercadores ou mineradores de Phandalin.',
          'Prometi a um parente mais velho que voltaria a Phandalin para reivindicar o que é meu.',
          'Um mapa incompleto, guardado por gerações, é minha única pista sobre a mina perdida.',
        ],
        defeitos: [
          'Confio demais em mapas e boatos antigos, mesmo quando parecem armadilhas.',
          'Minha ganância pela mina perdida pode me colocar (e ao grupo) em perigo.',
          'Tenho rixas antigas de família com outros mercadores da região.',
          'Subestimo os perigos da fronteira por nunca ter vivido de fato lá.',
        ],
      },
    },
  },
};

// ----- API pública: usada pelo criador (e pela ficha) para listar/consultar -----

// Lista achatada de todos os antecedentes disponíveis (PHB + módulos),
// cada item com { nome, grupo, dados }. `grupo` é usado para agrupar no <select>.
function antecedentesDisponiveis() {
  const lista = Object.keys(ANTECEDENTES).map(nome => ({ nome, grupo: 'Livro do Jogador', dados: ANTECEDENTES[nome], exclusivo: false }));
  Object.values(FONTES_AVENTURA).forEach(fonte => {
    Object.keys(fonte.antecedentes).forEach(nome => {
      // Antecedentes de módulo/campanha são EXCLUSIVOS: só um PJ por campanha
      // pode usar cada um (a campanha é pré-pronta). Ver antecedenteExclusivo.
      lista.push({ nome, grupo: fonte.nome, dados: fonte.antecedentes[nome], exclusivo: true });
    });
  });
  return lista;
}

// Busca os dados de um antecedente pelo nome, em ANTECEDENTES ou em qualquer fonte cadastrada.
function antecedenteDados(nome) {
  if (ANTECEDENTES[nome]) return ANTECEDENTES[nome];
  for (const fonte of Object.values(FONTES_AVENTURA)) {
    if (fonte.antecedentes[nome]) return fonte.antecedentes[nome];
  }
  return null;
}

// Um antecedente é EXCLUSIVO (único por campanha) se vem de um módulo/campanha
// (FONTES_AVENTURA), não do Livro do Jogador. O servidor usa o mesmo critério
// pelo sufixo "(Módulo)" no nome (nenhum antecedente do PHB tem parênteses).
function antecedenteExclusivo(nome) {
  if (!nome || ANTECEDENTES[nome]) return false;
  for (const fonte of Object.values(FONTES_AVENTURA)) {
    if (fonte.antecedentes[nome]) return true;
  }
  return false;
}

// Export para o harness de testes em Node (no browser é ignorado)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FONTES_AVENTURA, antecedentesDisponiveis, antecedenteDados, antecedenteExclusivo };
}
