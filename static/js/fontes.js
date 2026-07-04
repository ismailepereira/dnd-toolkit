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
  const lista = Object.keys(ANTECEDENTES).map(nome => ({ nome, grupo: 'Livro do Jogador', dados: ANTECEDENTES[nome] }));
  Object.values(FONTES_AVENTURA).forEach(fonte => {
    Object.keys(fonte.antecedentes).forEach(nome => {
      lista.push({ nome, grupo: fonte.nome, dados: fonte.antecedentes[nome] });
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
