// =====================================================================
// AVENTURAS PRONTAS (modelos importáveis para a biblioteca do Mestre)
// ---------------------------------------------------------------------
// Cada entrada usa o formato do livro-jogo (K2, ver aventura.js) e é
// COPIADA para a biblioteca pessoal ao importar — o Mestre pode adaptar
// tudo sem afetar o modelo. Os monstros dos encontros referenciam nomes
// EXATOS do bestiário (monstros.js); os números são calibrados para
// 4-5 PJs de nível 1-2 (ajuste à sua mesa!).
//
// "Ninho da Rainha Dragão" cobre o arco de abertura do módulo
// (a vila de Greenest em chamas + a trilha até o acampamento do culto),
// estruturado como grafo: hub central, becos, caminhos mortais e mais
// de uma rota até a vitória.
// =====================================================================

const AVENTURAS_PRONTAS = [
  {
    id: 'modelo_ninho_rainha_dragao',
    titulo: 'Ninho da Rainha Dragão — Greenest em Chamas',
    limites: { jogadoresMax: 5, nivelMin: 1, nivelMax: 3 },
    noInicial: 'n_chegada',
    nos: [
      {
        id: 'n_chegada', titulo: 'Greenest em chamas', tipo: 'narracao',
        narracao: 'O crepúsculo revela uma coluna de fumo no horizonte: Greenest está a arder. Sombras aladas cruzam o céu — um DRAGÃO AZUL adulto sobrevoa a fortaleza no centro da vila, e bandos de saqueadores encapuzados arrastam sacos de pilhagem pelas ruas. Gritos ecoam entre as casas. O que vocês fazem?',
        notasMestre: 'Cena de abertura: deixe o pânico falar. O dragão (Lennithon) NÃO deve ser enfrentado agora — ele é cenário. Se os PJs hesitarem, mostre a família Swift a correr (saída da família).',
        encontro: [], saidas: [
          { para: 'n_familia', rotulo: 'Ajudar a família cercada na rua', aviso: '' },
          { para: 'n_fortaleza', rotulo: 'Correr direto para a fortaleza', aviso: '' },
          { para: 'n_rua', rotulo: 'Enfrentar os saqueadores nas ruas', aviso: 'mortal' },
          { para: 'n_esconder', rotulo: 'Esconder-se e esperar o amanhecer', aviso: 'beco' },
        ],
      },
      {
        id: 'n_familia', titulo: 'A família Swift', tipo: 'encontro',
        narracao: 'Uma mulher com uma lança partida (Linan Swift) protege o marido ferido e três crianças contra um bando de kobolds que fareja sangue. "Ajudem-nos! A fortaleza ainda está aberta!"',
        notasMestre: 'Vitória fácil pensada para apresentar o combate. Se os PJs escoltarem a família, Linan vira aliada recorrente e o Governador começa com atitude amigável (vantagem em interações sociais na fortaleza).',
        encontro: [{ nome: 'Kobold', qtd: 4 }],
        saidas: [
          { para: 'n_fortaleza', rotulo: 'Escoltar a família até a fortaleza', aviso: '' },
          { para: 'n_rua', rotulo: 'Deixá-los seguir sozinhos e varrer as ruas', aviso: 'mortal' },
        ],
      },
      {
        id: 'n_rua', titulo: 'As ruas tomadas', tipo: 'encontro',
        narracao: 'Cada esquina é uma emboscada: cultistas de manto negro e mercenários saqueiam em grupos. Sem o abrigo das muralhas, vocês são caça — e são muitos deles.',
        notasMestre: 'Encontro PESADO de propósito: as ruas à noite são o caminho errado. Permita fuga para a fortaleza a qualquer momento (perseguição, não punição). Se insistirem em ficar lutando, o próximo bando chega em 1d4 rodadas — aí sim vale o caminho da morte.',
        encontro: [{ nome: 'Cultista', qtd: 4 }, { nome: 'Capanga (Thug)', qtd: 2 }],
        saidas: [
          { para: 'n_fortaleza', rotulo: 'Recuar para a fortaleza', aviso: '' },
          { para: 'n_morte_ruas', rotulo: 'Lutar até o fim contra a horda', aviso: 'mortal' },
        ],
      },
      {
        id: 'n_esconder', titulo: 'A noite dos covardes', tipo: 'final', resultado: 'neutro',
        narracao: 'Vocês esperam o amanhecer num porão. Greenest sobrevive — mas saqueada até os ossos, com prisioneiros levados e ninguém para contar o que o culto planeia. Os heróis desta história foram outros.',
        notasMestre: 'Beco intencional: mostre o custo da inação e ofereça recomeçar do nó inicial se a mesa quiser.',
        encontro: [], saidas: [],
      },
      {
        id: 'n_morte_ruas', titulo: 'Tragados pela horda', tipo: 'final', resultado: 'derrota',
        narracao: 'Coragem não é o mesmo que estratégia. Cercados de todos os lados, um a um vocês caem sob as cimitarras do culto. A última coisa que veem é o dragão azul a pousar sobre a fortaleza.',
        notasMestre: 'Se preferir, em vez de TPK os PJs acordam como PRISIONEIROS no acampamento do culto — gancho alternativo para continuar a campanha.',
        encontro: [], saidas: [],
      },
      {
        id: 'n_fortaleza', titulo: 'A fortaleza do Governador', tipo: 'social',
        narracao: 'As portas fecham-se atrás de vocês. O Governador Tarbaw Nighthill, ferido no braço, avalia-os com alívio: "Precisamos de gente capaz. O templo de Chauntea está cercado com o meu povo lá dentro, a muralha sul está a ceder... e aquele maldito dragão não nos larga. Escolham onde podem ajudar."',
        notasMestre: 'HUB central do episódio — os PJs podem voltar aqui entre missões (as saídas se cruzam). O sacerdote Eadyan Falconmoon implora pela missão do templo. Recompensa prometida: 250 po pelo grupo ao amanhecer.',
        encontro: [], saidas: [
          { para: 'n_muralha', rotulo: 'Defender a brecha na muralha sul', aviso: '' },
          { para: 'n_templo', rotulo: 'Resgatar o povo no templo de Chauntea', aviso: '' },
          { para: 'n_dragao', rotulo: 'Subir à torre e enfrentar o dragão', aviso: 'mortal' },
          { para: 'n_descanso', rotulo: 'Tratar feridas e descansar (a noite avança)', aviso: '' },
        ],
      },
      {
        id: 'n_muralha', titulo: 'A brecha na muralha sul', tipo: 'encontro',
        narracao: 'Um trecho da velha muralha ruiu e os saqueadores usam-no como porta. Os defensores exaustos cedem terreno quando vocês chegam — uma onda de kobolds e cultistas vem aí.',
        notasMestre: 'Combate em corredor: a brecha só deixa passar 2 inimigos por vez (recompense posicionamento). Vencer aqui garante a fortaleza e impressiona Nighthill.',
        encontro: [{ nome: 'Kobold', qtd: 6 }, { nome: 'Cultista', qtd: 2 }],
        saidas: [
          { para: 'n_fortaleza', rotulo: 'Voltar ao Governador para nova missão', aviso: '' },
          { para: 'n_duelo', rotulo: 'Segurar o posto até o amanhecer', aviso: '' },
        ],
      },
      {
        id: 'n_templo', titulo: 'O templo de Chauntea', tipo: 'assalto',
        narracao: 'O templo está cercado: um grupo tenta arrombar a porta principal com um aríete enquanto outro patrulha. Lá dentro, dezenas de aldeões rezam. Há uma porta dos fundos coberta de hera — e as patrulhas têm um intervalo.',
        notasMestre: 'Deixe o grupo PLANEAR: esgueirar pela porta dos fundos (Furtividade CD 12 em grupo) evita metade do encontro; atacar o aríete chama a patrulha inteira. Escoltar os aldeões pela rota das sombras até a fortaleza é a vitória aqui.',
        encontro: [{ nome: 'Cultista', qtd: 3 }, { nome: 'Kobold', qtd: 4 }],
        saidas: [
          { para: 'n_fortaleza', rotulo: 'Escoltar os aldeões de volta à fortaleza', aviso: '' },
          { para: 'n_duelo', rotulo: 'Perseguir os cultistas em retirada', aviso: '' },
        ],
      },
      {
        id: 'n_dragao', titulo: 'O dragão na torre', tipo: 'encontro',
        narracao: 'Do alto da torre, o dragão azul despeja relâmpagos sobre os defensores. Mas há algo estranho: ele evita mergulhar, ruge mais do que ataca... como se estivesse ali contra a vontade.',
        notasMestre: 'Lennithon NÃO quer esta luta. Use o Dragão Vermelho Filhote como stand-in de stats reduzidos OU conduza sem rolagens: a cada rodada de dano/bravata, teste moral — com ~25% dos PV perdidos (ou 3 rodadas de resistência), ele abandona o ataque. Enfrentá-lo "até o fim" deve matar: deixe isso claro pelos avisos.',
        encontro: [{ nome: 'Dragão Vermelho Filhote (Wyrmling)', qtd: 1 }],
        saidas: [
          { para: 'n_fortaleza', rotulo: 'Afugentado! Voltar ao Governador', aviso: '' },
          { para: 'n_morte_dragao', rotulo: 'Persegui-lo em campo aberto', aviso: 'mortal' },
        ],
      },
      {
        id: 'n_morte_dragao', titulo: 'A fúria de Lennithon', tipo: 'final', resultado: 'derrota',
        narracao: 'Em campo aberto, sem muralhas nem torres, um dragão adulto não tem rival ao nível de vocês. O relâmpago ilumina a planície uma última vez.',
        notasMestre: 'Morte anunciada por dois avisos. Alternativa: o dragão os deixa inconscientes e parte — humilhados, mas vivos, de volta à fortaleza.',
        encontro: [], saidas: [],
      },
      {
        id: 'n_descanso', titulo: 'Um fôlego entre ataques', tipo: 'descanso',
        narracao: 'Uma hora de trégua: bandagens, orações e o pão que os aldeões dividem com quem os defende. Lá fora, os ataques do culto começam a rarear — algo está a mudar.',
        notasMestre: 'Descanso curto (não longo!). Use para roleplay com Nighthill, Linan e Falconmoon e para plantar a pergunta: "porquê Greenest? o que eles vieram BUSCAR?"',
        encontro: [], saidas: [
          { para: 'n_fortaleza', rotulo: 'Voltar ao posto', aviso: '' },
          { para: 'n_duelo', rotulo: 'Aguardar o amanhecer', aviso: '' },
        ],
      },
      {
        id: 'n_duelo', titulo: 'O desafio do meio-dragão', tipo: 'social',
        narracao: 'Ao romper da aurora, os saqueadores recuam — menos um. Um guerreiro meio-dragão de escamas azuis (Langdedrosa Cyanwrath) avança com prisioneiros: a família Swift ajoelhada à sua frente. "Mandem o vosso campeão! Se ele lutar comigo, um contra um, os prisioneiros vivem."',
        notasMestre: 'Momento assinatura do módulo. O duelo é praticamente IMPERDÍVEL para um PJ de nível 1 — e tudo bem: Cyanwrath deixa o campeão caído (0 PV, estável) e cumpre a palavra. Recusar tem custo moral (ele executa um prisioneiro adulto antes de partir).',
        encontro: [], saidas: [
          { para: 'n_duelo_luta', rotulo: 'Aceitar o duelo (um campeão apenas)', aviso: 'mortal' },
          { para: 'n_amanhecer', rotulo: 'Recusar o desafio', aviso: '' },
        ],
      },
      {
        id: 'n_duelo_luta', titulo: 'Duelo ao amanhecer', tipo: 'encontro',
        narracao: 'O círculo abre-se. Cyanwrath saúda o campeão com a espada — e ataca como uma tempestade. Ele luta com honra brutal: sem ajuda externa, sem fugas.',
        notasMestre: 'Use o Veterano como stand-in de Cyanwrath (adicione Sopro de Relâmpago: linha 9m, DES CD 12, 2d6 elétrico, recarga 5-6). Se o campeão cair, Cyanwrath poupa-o e liberta os prisioneiros. Se (improvável) vencer, o culto parte na mesma — e ele jurará vingança para o resto da campanha.',
        encontro: [{ nome: 'Veterano', qtd: 1 }],
        saidas: [{ para: 'n_amanhecer', rotulo: 'O culto parte com o despojo', aviso: '' }],
      },
      {
        id: 'n_amanhecer', titulo: 'O rasto do culto', tipo: 'narracao',
        narracao: 'O sol nasce sobre uma Greenest ferida mas de pé. Nighthill paga o prometido e aponta a coluna de poeira ao sul: "Eles levaram prisioneiros e o tesouro da vila. Descubram para onde vão e porquê — e eu dobro a recompensa." Um monge ferido, Nesim Waladra, implora que encontrem o seu mestre Leosin, que se infiltrou entre os cultistas.',
        notasMestre: 'Ponte para o resto do módulo. Se a mesa quiser encerrar aqui como "one-shot da defesa de Greenest", use a saída de reconstrução como final digno.',
        encontro: [], saidas: [
          { para: 'n_trilha', rotulo: 'Seguir a trilha dos saqueadores', aviso: '' },
          { para: 'n_reconstrucao', rotulo: 'Ficar e ajudar a reconstruir Greenest', aviso: '' },
        ],
      },
      {
        id: 'n_reconstrucao', titulo: 'Greenest resiste', tipo: 'final', resultado: 'neutro',
        narracao: 'Vocês ficam. As muralhas erguem-se de novo, os campos são replantados e o nome de vocês entra nas canções da vila. Mas ao sul, o Culto do Dragão continua a marchar — e um dia, a sombra de asas azuis voltará.',
        notasMestre: 'Final honroso para one-shot. A campanha completa continua pela trilha.',
        encontro: [], saidas: [],
      },
      {
        id: 'n_trilha', titulo: 'Retardatários na trilha', tipo: 'encontro',
        narracao: 'Meio dia de marcha revela restos de acampamento e, num desfiladeiro, um grupo de retardatários do culto a assar caça roubada. Eles ainda não vos viram — e podem saber o caminho exato do acampamento.',
        notasMestre: 'Emboscada REVERSA: os PJs têm a vantagem. Um cultista capturado revela a localização do acampamento e a senha do turno ("A glória da Rainha!") — isso destrava a infiltração tranquila no próximo nó.',
        encontro: [{ nome: 'Cultista', qtd: 3 }, { nome: 'Bandido', qtd: 2 }],
        saidas: [{ para: 'n_acampamento', rotulo: 'Avançar até o acampamento do culto', aviso: '' }],
      },
      {
        id: 'n_acampamento', titulo: 'O acampamento do culto', tipo: 'assalto',
        narracao: 'Num planalto entre penhascos, centenas de tendas: caçadores, mercenários, kobolds — e no centro, as tendas dos líderes. Prisioneiros de Greenest carregam fardos. Entrar à força é suicídio; mas com os mantos certos e a senha, vocês são só mais dois rostos na multidão.',
        notasMestre: 'Clímax de infiltração. Com a senha da trilha, a entrada é automática; sem ela, exija disfarces + Enganação (CD 12). Lá dentro: localizar o monge Leosin amarrado ao poste, criar uma distração (fogo nas tendas de feno?) e sair antes do alarme. Combate aberto aqui = captura, não TPK.',
        encontro: [{ nome: 'Cultista', qtd: 4 }, { nome: 'Veterano', qtd: 1 }],
        saidas: [
          { para: 'n_final_vitoria', rotulo: 'Infiltrar, resgatar Leosin e escapar', aviso: '' },
          { para: 'n_final_captura', rotulo: 'Atacar o acampamento de frente', aviso: 'mortal' },
        ],
      },
      {
        id: 'n_final_captura', titulo: 'Nas correntes do culto', tipo: 'final', resultado: 'derrota',
        narracao: 'Cem lâminas contra meia dúzia. Desarmados e acorrentados aos postes, vocês agora marcham COM o tesouro do culto — para onde quer que a Rainha Dragão o esteja a chamar.',
        notasMestre: 'Derrota jogável: numa continuação, os PJs podem fugir do cativeiro — o próprio módulo prevê isso.',
        encontro: [], saidas: [],
      },
      {
        id: 'n_final_vitoria', titulo: 'A fuga com Leosin', tipo: 'final', resultado: 'vitoria',
        narracao: 'Com o monge meio-elfo apoiado nos vossos ombros e o alarme a soar longe demais para importar, vocês alcançam Greenest ao anoitecer. Leosin sorri entre feridas: "O que eu vi naquele acampamento... isto é muito maior que uma pilhagem. Eles estão a juntar um TESOURO para despertar algo. Precisamos de falar sobre a Rainha dos Dragões." — Fim do arco de abertura.',
        notasMestre: 'Vitória do arco! Recompensas: 250+250 po de Nighthill, gratidão de Leosin (contato em Baldur\'s Gate) e o gancho para os próximos episódios do módulo.',
        encontro: [], saidas: [],
      },
    ],
  },
];

// Export para o harness de testes em Node (no browser é ignorado)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AVENTURAS_PRONTAS };
}
