// =====================================================================
// AVENTURAS PRONTAS (modelos importáveis para a biblioteca do Mestre)
// ---------------------------------------------------------------------
// Cada entrada usa o formato do livro-jogo (K2, ver aventura.js) e é
// COPIADA para a biblioteca pessoal ao importar — o Mestre pode adaptar
// tudo sem afetar o modelo. Os monstros dos encontros referenciam nomes
// EXATOS do bestiário (monstros.js — o Culto do Dragão tem categoria
// própria); os números são calibrados para 4-5 PJs de nível 1-4
// (ajuste à sua mesa!).
//
// "Ninho da Rainha Dragão" cobre o arco de abertura do módulo:
// Episódio 1 (Greenest em Chamas) + Episódio 2 (a trilha e o
// acampamento) + Episódio 3 (o Chocadouro do dragão), estruturado
// como grafo: hub central, becos, caminhos mortais, revanche e mais
// de uma rota até a vitória.
// =====================================================================

const AVENTURAS_PRONTAS = [
  {
    id: 'modelo_ninho_rainha_dragao',
    titulo: 'Ninho da Rainha Dragão — Greenest em Chamas',
    limites: { jogadoresMax: 5, nivelMin: 1, nivelMax: 4 },
    noInicial: 'n_chegada',
    nos: [
      // ============ EPISÓDIO 1 — GREENEST EM CHAMAS ============
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
        npcs: [{ nome: 'Linan Swift', tipo: 'aliado', descricao: 'Mulher determinada de lança partida; protege a família na noite do ataque.', notasPrivadas: 'Se escoltada em segurança, vira aliada recorrente e dá +1 atitude do Governador.' }],
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
        narracao: 'Cada esquina é uma emboscada: cultistas de manto negro lideram grupos de saque, e entre eles destacam-se guerreiros de máscara dracônica — as "Garras do Dragão", a elite fanática do culto. Sem o abrigo das muralhas, vocês são caça.',
        notasMestre: 'Encontro PESADO de propósito: as ruas à noite são o caminho errado. Permita fuga para a fortaleza a qualquer momento (perseguição, não punição). Se insistirem em ficar lutando, o próximo bando chega em 1d4 rodadas — aí sim vale o caminho da morte.',
        encontro: [{ nome: 'Cultista', qtd: 4 }, { nome: 'Garra do Dragão (Dragonclaw)', qtd: 1 }],
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
        npcs: [
          { nome: 'Governador Tarbaw Nighthill', tipo: 'aliado', descricao: 'Líder de Greenest, ferido no braço mas firme; coordena a defesa da fortaleza.', notasPrivadas: 'Paga 250 po pelo grupo ao amanhecer; dobra a recompensa se seguirem a trilha do culto.' },
          { nome: 'Eadyan Falconmoon', tipo: 'aliado', descricao: 'Sacerdote de Chauntea; implora ajuda para o povo cercado no templo.', notasPrivadas: 'Gancho da missão do templo; cura os PJs de graça se salvarem os fiéis.' },
        ],
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
        narracao: 'O templo está cercado: um grupo tenta arrombar a porta principal com um aríete enquanto outro patrulha com um réptil de coleira — um draco farejador. Lá dentro, dezenas de aldeões rezam. Há uma porta dos fundos coberta de hera — e as patrulhas têm um intervalo.',
        notasMestre: 'Deixe o grupo PLANEAR: esgueirar pela porta dos fundos (Furtividade CD 12 em grupo) evita metade do encontro; atacar o aríete chama a patrulha inteira (some o draco de emboscada ao combate). Escoltar os aldeões pela rota das sombras até a fortaleza é a vitória aqui.',
        encontro: [{ nome: 'Cultista', qtd: 3 }, { nome: 'Kobold', qtd: 4 }, { nome: 'Draco de Emboscada (Ambush Drake)', qtd: 1 }],
        saidas: [
          { para: 'n_fortaleza', rotulo: 'Escoltar os aldeões de volta à fortaleza', aviso: '' },
          { para: 'n_duelo', rotulo: 'Perseguir os cultistas em retirada', aviso: '' },
        ],
      },
      {
        id: 'n_dragao', titulo: 'O dragão na torre', tipo: 'encontro',
        narracao: 'Do alto da torre, Lennithon despeja relâmpagos sobre os defensores. Mas há algo estranho: ele evita mergulhar, ruge mais do que ataca... como se estivesse ali contra a vontade.',
        notasMestre: 'Lennithon (agora no bestiário, CR 16) NÃO quer esta luta — leia o aviso no bloco dele. Conduza por MORAL, não por PV: cada rodada em que os PJs causem dano ou organizem os arqueiros da muralha, marque 1 ponto; com 3 pontos (ou ~25% dos PV perdidos), ele abandona Greenest. Enfrentá-lo "até o fim" em campo aberto deve matar: os avisos estão aí para isso.',
        encontro: [{ nome: 'Lennithon, Dragão Azul Adulto', qtd: 1 }],
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
        npcs: [{ nome: 'Langdedrosa Cyanwrath', tipo: 'inimigo', descricao: 'Guerreiro meio-dragão de escamas azuis; exige um duelo de honra, um contra um.', notasPrivadas: 'Cumpre a palavra: poupa o campeão caído e liberta os prisioneiros. Guarde o rancor para a revanche no Chocadouro. Bloco de combate no bestiário.' }],
        narracao: 'Ao romper da aurora, os saqueadores recuam — menos um. Um guerreiro meio-dragão de escamas azuis, Langdedrosa Cyanwrath, avança com prisioneiros: a família Swift ajoelhada à sua frente. "Mandem o vosso campeão! Se ele lutar comigo, um contra um, os prisioneiros vivem."',
        notasMestre: 'Momento assinatura do módulo. O duelo é praticamente IMPERDÍVEL para um PJ de nível 1 — e tudo bem: Cyanwrath (bloco próprio no bestiário) deixa o campeão caído (0 PV, estável) e cumpre a palavra. Recusar tem custo moral (ele executa um prisioneiro adulto antes de partir). Guarde o rancor do campeão: a revanche vem no Chocadouro.',
        encontro: [], saidas: [
          { para: 'n_duelo_luta', rotulo: 'Aceitar o duelo (um campeão apenas)', aviso: 'mortal' },
          { para: 'n_amanhecer', rotulo: 'Recusar o desafio', aviso: '' },
        ],
      },
      {
        id: 'n_duelo_luta', titulo: 'Duelo ao amanhecer', tipo: 'encontro',
        narracao: 'O círculo abre-se. Cyanwrath saúda o campeão com a espada grande — e ataca como uma tempestade, o sopro elétrico a crepitar entre os dentes. Ele luta com honra brutal: sem ajuda externa, sem fugas.',
        notasMestre: 'Use o bloco "Langdedrosa Cyanwrath (Meio-Dragão)" do bestiário. Regra de ouro do traço dele: se o campeão cair, Cyanwrath poupa-o e liberta os prisioneiros. Se (improvável) o campeão vencer, o culto parte na mesma — e a revanche do Chocadouro vira caçada pessoal do irmão de armas dele.',
        encontro: [{ nome: 'Langdedrosa Cyanwrath (Meio-Dragão)', qtd: 1 }],
        saidas: [{ para: 'n_amanhecer', rotulo: 'O culto parte com o despojo', aviso: '' }],
      },
      // ============ EPISÓDIO 2 — A TRILHA E O ACAMPAMENTO ============
      {
        id: 'n_amanhecer', titulo: 'O rasto do culto', tipo: 'narracao',
        npcs: [{ nome: 'Nesim Waladra', tipo: 'aliado', descricao: 'Monge ferido; implora que encontrem o seu mestre Leosin, infiltrado no culto.', notasPrivadas: 'Fica em Greenest; é o elo que garante que Leosin confie nos PJs mais tarde.' }],
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
        notasMestre: 'Clímax de infiltração. Com a senha da trilha, a entrada é automática; sem ela, exija disfarces + Enganação (CD 12). Lá dentro: localizar o monge Leosin amarrado ao poste, criar uma distração (fogo nas tendas de feno?) e sair antes do alarme. Combate aberto aqui = captura, não TPK. O encontro abaixo é a patrulha que os interceta na FUGA.',
        encontro: [{ nome: 'Cultista', qtd: 4 }, { nome: 'Garra do Dragão (Dragonclaw)', qtd: 1 }],
        saidas: [
          { para: 'n_fuga_leosin', rotulo: 'Infiltrar, resgatar Leosin e escapar', aviso: '' },
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
        id: 'n_fuga_leosin', titulo: 'A fuga com Leosin', tipo: 'narracao',
        npcs: [{ nome: 'Leosin Erlanthar', tipo: 'aliado', descricao: 'Monge meio-elfo que se infiltrou no culto; ferido, mas cheio de informação vital.', notasPrivadas: 'Paga 150 po, dá o contato em Baldur\'s Gate e revela os ovos do chocadouro. Peça-chave da campanha completa.' }],
        narracao: 'Com o monge meio-elfo apoiado nos vossos ombros, vocês alcançam Greenest ao anoitecer. Leosin sorri entre feridas: "O que eu vi... isto é muito maior que pilhagem. Eles juntam um tesouro para a Rainha dos Dragões — e nas cavernas atrás do acampamento há OVOS. Se eclodirem, cada vila daqui a Baldur\'s Gate arderá." Ele paga 150 po e pede: voltem lá.',
        notasMestre: 'Encruzilhada do arco: encerrar como one-shot (final digno) ou mergulhar no Episódio 3 (o Chocadouro). Se voltarem, o acampamento estará quase abandonado — o grosso do culto marchou para norte; só a guarnição de Mondath ficou nas cavernas.',
        encontro: [], saidas: [
          { para: 'n_final_arco1', rotulo: 'Missão cumprida — encerrar o arco', aviso: '' },
          { para: 'n_retorno', rotulo: 'Voltar ao acampamento atrás dos ovos', aviso: '' },
        ],
      },
      {
        id: 'n_final_arco1', titulo: 'Heróis de Greenest', tipo: 'final', resultado: 'vitoria',
        narracao: 'Greenest celebra os seus defensores: 500 po de Nighthill, a gratidão de Leosin (um contato valioso em Baldur\'s Gate) e camas quentes pela primeira vez em dias. Ao sul, as cavernas do culto guardam os seus segredos... por enquanto. — Fim do arco de abertura.',
        notasMestre: 'Vitória "curta" do arco. Se a mesa mudar de ideias, a campanha completa recomeça pelo retorno ao acampamento.',
        encontro: [], saidas: [],
      },
      // ============ EPISÓDIO 3 — O CHOCADOURO ============
      {
        id: 'n_retorno', titulo: 'O acampamento abandonado', tipo: 'encontro',
        narracao: 'Dois dias depois, o planalto é um cemitério de fogueiras frias: o culto marchou para norte. Restam caçadores que vasculham as sobras — e, no penhasco ao fundo, a boca de caverna que Leosin descreveu, ainda vigiada. Dracos de emboscada farejam o vento quando vocês se aproximam.',
        notasMestre: 'Reconhecimento: os caçadores restantes são neutros (podem até vender informação por 10 po: "os ovos estão no fundo, com a sacerdotisa de púrpura"). Os dracos atacam se os PJs cruzarem a linha das estacas.',
        encontro: [{ nome: 'Draco de Emboscada (Ambush Drake)', qtd: 3 }],
        saidas: [
          { para: 'n_caverna', rotulo: 'Entrar na caverna pela boca principal', aviso: '' },
          { para: 'n_fenda', rotulo: 'Procurar a fenda estreita no penhasco (rota furtiva)', aviso: '' },
        ],
      },
      {
        id: 'n_fenda', titulo: 'A fenda no penhasco', tipo: 'assalto',
        narracao: 'Meia hora de escalada revela uma fenda por onde escorre ar quente com cheiro de enxofre e palha podre. Lá dentro, o som abafado de tambores kobold. A passagem é apertada — um de cada vez, sem armaduras pesadas à frente.',
        notasMestre: 'Rota furtiva: Atletismo CD 10 para escalar + Furtividade CD 12 em grupo. Sucesso = saltam a guarda da entrada e caem direto no salão dos fungos (vantagem no primeiro turno do próximo encontro). Falha = deslizam com barulho e a guarda da caverna chega em 2 rodadas (use o encontro do nó da caverna).',
        encontro: [], saidas: [
          { para: 'n_salao', rotulo: 'Descer pela fenda até o salão interior', aviso: '' },
          { para: 'n_caverna', rotulo: 'Desistir da escalada e ir pela entrada', aviso: '' },
        ],
      },
      {
        id: 'n_caverna', titulo: 'A guarda da caverna', tipo: 'encontro',
        narracao: 'A boca da caverna é um funil de estacas e fogueiras. Kobolds espreitam das sombras — e ao primeiro grito, alçapões de rede e pedras soltas despencam do teto. Este lugar foi FEITO para custar sangue a intrusos.',
        notasMestre: 'Armadilhas de kobold: rede suspensa (DES CD 12, contido), fosso raso (2d6 concussão) e o alarme de sinos. Cada armadilha evitada com Percepção/Investigação CD 12 vira vantagem tática. É o caminho barulhento: o salão seguinte já estará em alerta.',
        encontro: [{ nome: 'Kobold', qtd: 8 }, { nome: 'Cultista', qtd: 2 }],
        saidas: [{ para: 'n_salao', rotulo: 'Avançar para o salão dos fungos', aviso: '' }],
      },
      {
        id: 'n_salao', titulo: 'O salão dos fungos', tipo: 'encontro',
        narracao: 'Uma gruta ampla coberta de fungos luminescentes violeta. Entre as colunas de pedra, dois répteis robustos de coleira levantam a cabeça — guardas dracos, criados pelo culto de ovos como os que vocês procuram. Atrás deles, dois corredores: tambores à esquerda, silêncio à direita.',
        notasMestre: 'Os dracos lutam até a morte (são cães de guerra leais). O corredor dos tambores leva ao covil dos kobolds (evitável); o silencioso leva à câmara dos ovos. Fungos: quem cair neles fica com marcas luminosas (desvantagem em Furtividade na próxima cena).',
        encontro: [{ nome: 'Guarda Draco (Guard Drake)', qtd: 2 }],
        saidas: [
          { para: 'n_ovos', rotulo: 'Seguir o corredor silencioso (câmara dos ovos)', aviso: '' },
          { para: 'n_mondath', rotulo: 'Seguir os tambores até o santuário', aviso: '' },
        ],
      },
      {
        id: 'n_ovos', titulo: 'A câmara dos ovos', tipo: 'social',
        narracao: 'Calor de estufa. Três ovos de dragão do tamanho de barris repousam num ninho de areia aquecida, veiados de azul elétrico. O zumbido baixo que emitem parece... vivo. O que vocês fazem com eles é uma decisão que vai segui-los pela campanha inteira.',
        notasMestre: 'A GRANDE decisão moral do episódio — não há resposta certa: destruir (rápido, mas o som atrai o santuário — próximo encontro com alarme), levar (cada ovo pesa 25 kg; valem 500 po cada a colecionadores... ou consciência pesada), ou deixar (Leosin desaprova, mas há quem diga que dragões não escolhem nascer do mal). Cyanwrath chega ao fim da decisão — a revanche é inevitável.',
        encontro: [], saidas: [
          { para: 'n_mondath', rotulo: 'Decidir sobre os ovos e avançar ao santuário', aviso: '' },
          { para: 'n_revanche', rotulo: 'Cyanwrath bloqueia a saída — a revanche', aviso: 'mortal' },
        ],
      },
      {
        id: 'n_mondath', titulo: 'O santuário de Mondath', tipo: 'encontro',
        npcs: [{ nome: 'Frulam Mondath', tipo: 'inimigo', descricao: 'Sacerdotisa de manto púrpura que comandou o ataque a Greenest; serve a Rainha Dragão.', notasPrivadas: 'Os registos dela (drop garantido) apontam Castelo Naerytar — gancho do próximo arco. Bloco de combate no bestiário.' }],
        narracao: 'Um santuário talhado na rocha, iluminado por círios negros: cinco cabeças de dragão pintadas na parede em leque. Frulam Mondath, a sacerdotisa de manto púrpura que comandou o ataque a Greenest, ergue a alabarda: "Os intrusos de Greenest. A Rainha agradece os sacrifícios que se entregam sozinhos."',
        notasMestre: 'Mondath luta atrás das suas Garras do Dragão e usa Comando/Arma Espiritual. Os REGISTOS dela (drop garantido do loot) revelam o destino do tesouro: a Estrada do Comércio, rumo ao Castelo Naerytar — o gancho do próximo arco do módulo.',
        encontro: [{ nome: 'Frulam Mondath (Sacerdotisa do Culto)', qtd: 1 }, { nome: 'Garra do Dragão (Dragonclaw)', qtd: 2 }],
        saidas: [
          { para: 'n_revanche', rotulo: 'Cyanwrath surge das sombras — a revanche', aviso: 'mortal' },
          { para: 'n_final_chocadouro', rotulo: 'Escapar com os registos antes que ele chegue', aviso: '' },
        ],
      },
      {
        id: 'n_revanche', titulo: 'A revanche de Cyanwrath', tipo: 'encontro',
        narracao: 'O meio-dragão azul emerge da escuridão da caverna, e desta vez não há círculo de honra nem prisioneiros a poupar. "Vocês outra vez", ele rosna, quase satisfeito. "Que a Rainha assista." Se um dos vossos caiu perante ele em Greenest, é a esse que os olhos de Cyanwrath procuram primeiro.',
        notasMestre: 'AGORA é luta de verdade (grupo inteiro vs. Cyanwrath, ~nível 3-4 recomendado). Ele foca o campeão do duelo de Greenest (rancor de honra). Sem truque de poupar desta vez — mas se a mesa estiver a colapsar, os gritos dos kobolds em fuga dão a deixa para uma retirada dramática pela fenda.',
        encontro: [{ nome: 'Langdedrosa Cyanwrath (Meio-Dragão)', qtd: 1 }],
        saidas: [
          { para: 'n_final_chocadouro', rotulo: 'Vencê-lo e sair das cavernas', aviso: '' },
          { para: 'n_morte_revanche', rotulo: 'Lutar até o último suspiro (sem retirada)', aviso: 'mortal' },
        ],
      },
      {
        id: 'n_morte_revanche', titulo: 'O preço do rancor', tipo: 'final', resultado: 'derrota',
        narracao: 'Cyanwrath é melhor do que era em Greenest — e desta vez ninguém decreta o fim do duelo. As cavernas do chocadouro ficam com os vossos nomes gravados apenas na memória dos kobolds que assistiram.',
        notasMestre: 'Só se a mesa recusar TODAS as saídas. Alternativa clemente: Cyanwrath, por respeito ao campeão, deixa os corpos à entrada da caverna — onde Leosin os encontra (ganchos de ressurreição/nova leva de PJs).',
        encontro: [], saidas: [],
      },
      {
        id: 'n_final_chocadouro', titulo: 'O Chocadouro cai', tipo: 'final', resultado: 'vitoria',
        narracao: 'Vocês emergem das cavernas com os registos do culto, a decisão sobre os ovos às costas e o planalto em silêncio atrás de vocês. Em Greenest, Leosin espalha os documentos sobre a mesa: "Castelo Naerytar... então é para lá que o tesouro marcha. Descansem, heróis. A estrada para o norte é longa — e a Rainha dos Dragões já sabe os vossos nomes." — Fim do arco de Greenest; a campanha continua na Estrada do Comércio.',
        notasMestre: 'Vitória completa do arco (Episódios 1-3). Recompensas: 500 po de Nighthill + 150 po de Leosin + loot de Mondath/Cyanwrath (gere pela Fase 13!) + o valor dos ovos, se levados. XP sugerido: nível 4 para todos ao fechar o arco.',
        encontro: [], saidas: [],
      },
    ],
  },
  {
    id: 'modelo_phandelver_emboscada',
    titulo: 'Mina Perdida de Phandelver — Emboscada Goblin',
    limites: { jogadoresMax: 5, nivelMin: 1, nivelMax: 2 },
    noInicial: 'p_estrada',
    nos: [
      // ============ CAPÍTULO 1 — FLECHAS GOBLIN ============
      {
        id: 'p_estrada', titulo: 'A Trilha de Triboar', tipo: 'narracao',
        npcs: [
          { nome: 'Gundren Rockseeker', tipo: 'aliado', descricao: 'Anão barbudo e entusiasmado que contratou o grupo para escoltar mantimentos até Phandalin; partiu à frente a cavalo com um guarda-costas.', notasPrivadas: 'JÁ FOI CAPTURADO pelos goblins Cragmaw quando a aventura começa. Carrega o mapa da Caverna do Eco das Ondas (a Mina Perdida) — por isso o Aranha Negra o quer vivo. Levado ao Castelo Cragmaw, não está nesta caverna.' },
        ],
        narracao: 'Há dois dias vocês seguem a Trilha de Triboar puxando uma carroça de mantimentos para Phandalin — trabalho pago pelo anão Gundren Rockseeker, que cavalgou à frente com um veterano chamado Sildar. A floresta aperta os dois lados do caminho quando os cavalos da carroça relincham e empacam: à frente, atravessados na trilha, dois cavalos mortos crivados de flechas de pena negra. O mato dos flancos está silencioso demais.',
        notasMestre: 'Abertura clássica do módulo. Os cavalos são os de Gundren e Sildar — foram emboscados aqui. Quatro goblins espreitam nos arbustos (dois de cada lado). Quem examinar os cavalos sem cuidado leva a emboscada em cheio; quem desconfiar do silêncio tem chance de virar a mesa. Calibrado para 4-5 PJs de nível 1.',
        encontro: [], saidas: [
          { para: 'p_emboscada', rotulo: 'Ir direto examinar os cavalos mortos', aviso: '' },
          { para: 'p_emboscada_cauteloso', rotulo: 'Avançar com cautela, vasculhando o mato', aviso: '' },
        ],
      },
      {
        id: 'p_emboscada_cauteloso', titulo: 'O silêncio antes da flecha', tipo: 'narracao',
        narracao: 'Vocês param antes da linha dos cavalos e leem o terreno. Rastros frescos afundam a lama em direção a dois tufos de arbusto — e, entre as folhas, o brilho fosco de olhos amarelos que os encaram de volta.',
        notasMestre: 'Recompense a cautela: peça Sabedoria (Percepção) CD 12. Quem passar age com VANTAGEM na primeira rodada e nega a surpresa dos goblins. Depois, siga para o combate.',
        encontro: [], saidas: [
          { para: 'p_emboscada', rotulo: 'Atacar os arbustos antes que eles atirem', aviso: '' },
        ],
      },
      {
        id: 'p_emboscada', titulo: 'Flechas na trilha', tipo: 'encontro',
        narracao: 'Setas rasgam o ar dos dois lados! Quatro goblins de pele cinzenta saltam do mato com cimitarras e arcos curtos, guinchando numa língua estridente. São rápidos, covardes e mortais em número.',
        notasMestre: 'Primeiro combate da campanha — deixe os PJs sentirem o perigo real de nível 1 sem chacina. Goblins usam Retirada Ágil (Bônus: Desengajar/Esconder) e disparam do mato; se dois caírem, os demais tentam FUGIR pela trilha noroeste. Deixe um escapar de propósito: ele leva ao esconderijo. Nada de prisioneiros mortos aqui — Gundren e Sildar já foram arrastados antes de vocês chegarem.',
        encontro: [{ nome: 'Goblin', qtd: 4 }],
        saidas: [
          { para: 'p_apos', rotulo: 'Vasculhar a cena depois da luta', aviso: '' },
        ],
      },
      {
        id: 'p_apos', titulo: 'O rasto para noroeste', tipo: 'narracao',
        npcs: [
          { nome: 'Sildar Hallwinter', tipo: 'aliado', descricao: 'Guerreiro veterano de bigode grisalho, membro da Aliança dos Lordes; escoltava Gundren e foi capturado com ele.', notasPrivadas: 'Está PRISIONEIRO no esconderijo goblin (Yeemik o mantém refém). Resgatado, paga 50 po por PJ para chegar a Phandalin, procura o amigo desaparecido Iarno Albrek e conta que Gundren foi levado ao Castelo Cragmaw pelo "Aranha Negra".' },
        ],
        narracao: 'Entre os corpos e a bagagem revirada, vocês reconhecem os selos de Gundren nas cargas: era a carroça dele. Uma trilha larga de pegadas com pés pequenos afunda a folhagem rumo a noroeste, para dentro da mata — e, no chão, o rasto de dois corpos ARRASTADOS. Gundren e Sildar não estão entre os mortos: foram levados vivos.',
        notasMestre: 'Sabedoria (Sobrevivência) CD 10 confirma a trilha até o Esconderijo Cragmaw (a caverna dos goblins), a ~8 km. Aqui é a bifurcação do capítulo: seguir o rasto (resgate) ou entregar a carroça em Phandalin e voltar depois. A carroça e os mantimentos são a missão paga; Gundren (e o mapa da Mina) é o coração da campanha.',
        encontro: [], saidas: [
          { para: 'p_trilha_caverna', rotulo: 'Seguir o rasto até o esconderijo goblin', aviso: '' },
          { para: 'p_phandalin_cedo', rotulo: 'Levar a carroça a Phandalin primeiro', aviso: 'beco' },
        ],
      },
      {
        id: 'p_phandalin_cedo', titulo: 'Phandalin sem os anões', tipo: 'final', resultado: 'neutro',
        narracao: 'Vocês entregam os mantimentos em Phandalin e recebem o pagamento — mas Gundren e Sildar continuam nas mãos dos goblins, e com Gundren se foi o mapa da lendária Mina de Phandelver. A vila tem os seus próprios problemas (uma gangue de mantos vermelhos aterroriza os comerciantes), e ninguém sabe dizer quando, ou se, os anões voltarão.',
        notasMestre: 'Beco intencional, não game over: mostre o custo de abandonar o resgate. Ofereça retomar do nó "O rasto para noroeste" se a mesa quiser ir atrás dos prisioneiros — a trilha ainda estará fresca por um dia.',
        encontro: [], saidas: [],
      },
      {
        id: 'p_trilha_caverna', titulo: 'O Esconderijo Cragmaw', tipo: 'social',
        narracao: 'A trilha termina numa encosta onde um riacho raso escorre da boca de uma caverna, escondida atrás de espinheiros densos. Ossos roídos e trapos sujam a margem. Do escuro lá dentro vêm o pingar d\'água e, mais fundo, o rosnar abafado de algo grande e faminto. Dois vultos goblin cochilam de sentinela perto da entrada.',
        notasMestre: 'A entrada do Esconderijo Cragmaw. Duas rotas: subir pelo riacho (à direita) leva ao canil dos lobos; a passagem principal sobe por uma ponte natural vigiada por goblins que controlam uma represa (armadilha de inundação). Furtividade em grupo CD 12 passa pelas sentinelas adormecidas sem alarme.',
        encontro: [], saidas: [
          { para: 'p_lobos', rotulo: 'Subir pelo riacho até o rosnar (canil)', aviso: '' },
          { para: 'p_ponte', rotulo: 'Escalar a passagem principal (ponte vigiada)', aviso: '' },
        ],
      },
      {
        id: 'p_lobos', titulo: 'O canil dos lobos', tipo: 'encontro',
        narracao: 'Uma câmara lateral fede a pelo molhado e carne podre. Três lobos esquálidos estão presos por correntes curtas a estacas na parede — famintos, arreganhando os dentes. As correntes são compridas o bastante para alcançar quem passar descuidado pelo centro da gruta.',
        notasMestre: 'Os lobos são de Klarg, o chefe. NÃO precisam virar combate: Sabedoria (Adestrar Animais) CD 15 os acalma, ou dá para contorná-los pelas bordas (Furtividade CD 12). Quem os soltar pode VIRÁ-LOS contra os goblins (drama excelente). Se lutarem, use os três; um deles ("Rasga", o favorito de Klarg) pode estar solto ao lado do chefe mais adiante — nesse caso, remova 1 lobo do covil final.',
        encontro: [{ nome: 'Lobo', qtd: 3 }],
        saidas: [
          { para: 'p_ponte', rotulo: 'Seguir para a ponte por dentro da caverna', aviso: '' },
          { para: 'p_covil_klarg', rotulo: 'Avançar direto ao covil do chefe', aviso: '' },
        ],
      },
      {
        id: 'p_ponte', titulo: 'A ponte da represa', tipo: 'encontro',
        narracao: 'Uma fenda profunda corta a caverna, atravessada por uma ponte natural de pedra escorregadia. No alto, dois goblins vigiam ao lado de um tosco dique de troncos e entulho que segura as águas do riacho. Ao verem vocês, um deles agarra a corda que solta a represa, rindo com escárnio.',
        notasMestre: 'Armadilha assinatura do esconderijo: se um goblin puxar a corda, o dique arrebenta e uma onda desce a passagem — Destreza CD 12 ou é arrastado 6 m e cai prostrado (concussão leve, 1d6). Derrubar o goblin da corda antes (ataque à distância / iniciativa alta) evita tudo. Vencer aqui abre o coração do esconderijo: à esquerda o poleiro de Yeemik com o refém; à frente o covil de Klarg.',
        encontro: [{ nome: 'Goblin', qtd: 2 }],
        saidas: [
          { para: 'p_yeemik', rotulo: 'Ir ao poleiro de onde vem uma voz negociando', aviso: '' },
          { para: 'p_covil_klarg', rotulo: 'Seguir os tambores até o covil do chefe', aviso: '' },
        ],
      },
      {
        id: 'p_yeemik', titulo: 'A proposta de Yeemik', tipo: 'social',
        npcs: [
          { nome: 'Yeemik', tipo: 'inimigo', descricao: 'Vice-líder goblin, astuto e ambicioso; quer o lugar de Klarg e usa o refém como moeda de troca.', notasPrivadas: 'Bloco: use o Goblin Mestre (Goblin Boss) do bestiário. Se os PJs matarem Klarg, ele ENTREGA Sildar — mas trai à primeira oportunidade se puder. Cumpre o trato só enquanto for vantajoso.' },
          { nome: 'Sildar Hallwinter', tipo: 'aliado', descricao: 'O guerreiro veterano, espancado e amarrado à beira do poleiro, mas vivo e lúcido.', notasPrivadas: 'Refém de Yeemik. Se cair no fosso durante um combate, sofre queda; proteja-o. Resgatado, torna-se aliado e guia até Phandalin.' },
        ],
        narracao: 'Num poleiro sobre um fosso, um goblin de olhar esperto — Yeemik — segura uma adaga na garganta de um homem grisalho e amarrado: Sildar Hallwinter. "Parem aí!", grasna em comum arranhado. "Vocês querem o velho? Eu quero o trono. Matem Klarg, o chefe grandão lá no fundo, e o velho é de vocês. Cheguem mais perto sem trato, e ele voa fosso abaixo."',
        notasMestre: 'A grande cena de escolha do esconderijo. Três saídas: aceitar o trato (ir atrás de Klarg e voltar), atacar Yeemik (arriscado — ele pode empurrar Sildar), ou dobrá-lo na conversa (Carisma — Persuasão/Intimidação CD 13 solta Sildar sem sangue). Yeemik é covarde: se a luta virar contra ele, foge para os túneis.',
        encontro: [], saidas: [
          { para: 'p_covil_klarg', rotulo: 'Aceitar o trato: eliminar Klarg', aviso: '' },
          { para: 'p_yeemik_luta', rotulo: 'Atacar Yeemik para salvar o refém', aviso: 'mortal' },
          { para: 'p_resgate', rotulo: 'Negociar/intimidar para libertar Sildar', aviso: '' },
        ],
      },
      {
        id: 'p_yeemik_luta', titulo: 'Reféns e adagas', tipo: 'encontro',
        narracao: 'A adaga de Yeemik lampeja em direção ao pescoço de Sildar no instante em que a luta começa — mas o velho guerreiro se joga de lado, e os goblins do poleiro sacam suas cimitarras guinchando. Todo o combate acontece à beira do fosso.',
        notasMestre: 'Combate com refém em risco: no início do turno de Yeemik, se ninguém o estiver ameaçando de perto, ele tenta EMPURRAR Sildar no fosso (Força vs. Atletismo/Acrobacia de Sildar +2; queda de 3 m = 1d6). Recompense quem "marcar" Yeemik com corpo a corpo. Yeemik = Goblin Mestre; os dois goblins são apoio. Se ele cair, os outros se rendem ou fogem.',
        encontro: [{ nome: 'Goblin Mestre (Goblin Boss)', qtd: 1 }, { nome: 'Goblin', qtd: 2 }],
        saidas: [
          { para: 'p_resgate', rotulo: 'Soltar Sildar das cordas', aviso: '' },
          { para: 'p_covil_klarg', rotulo: 'Ir acabar com o chefe no covil', aviso: '' },
        ],
      },
      {
        id: 'p_covil_klarg', titulo: 'O covil de Klarg', tipo: 'encontro',
        npcs: [
          { nome: 'Klarg', tipo: 'inimigo', descricao: 'Um bugbear enorme e vaidoso que se acha um grande general; comanda o esconderijo em nome do Rei Goblin Grol e do Aranha Negra.', notasPrivadas: 'Bloco: use o Bugbear do bestiário. Luta com o lobo de estimação "Rasga" ao lado (se não foi solto no canil). Guarda um baú com os mantimentos roubados de Gundren e algumas moedas — bom primeiro tesouro (gere pela Fase 13).' },
        ],
        narracao: 'A câmara mais funda do esconderijo é iluminada por uma fogueira sob uma fenda de fumaça. Sobre pilhas de sacos saqueados ergue-se Klarg — um bugbear enorme de presas amarelas — batendo no peito com o porrete. "EU sou Klarg! Ninguém passa!" A seu lado, dois goblins e um lobo rosnando prontos para saltar.',
        notasMestre: 'Combate-clímax do capítulo (o mais duro para nível 1). Klarg (Bugbear, ND 1) tem Emboscador e Brutal — o primeiro golpe dele dói; abra distância ou derrube-o cedo. Se o lobo "Rasga" já foi solto/morto no canil, remova o lobo daqui. Klarg luta até o fim, gabando-se. No baú dele: os mantimentos de Gundren, cerca de 600 pc/110 pp e uma poção — o gancho é que Gundren NÃO está aqui: foi levado ao Castelo Cragmaw.',
        encontro: [{ nome: 'Bugbear', qtd: 1 }, { nome: 'Goblin', qtd: 2 }, { nome: 'Lobo', qtd: 1 }],
        saidas: [
          { para: 'p_resgate', rotulo: 'Vasculhar o covil e libertar o prisioneiro', aviso: '' },
          { para: 'p_tpk', rotulo: 'Enfrentar o esconderijo inteiro de uma vez', aviso: 'mortal' },
        ],
      },
      {
        id: 'p_resgate', titulo: 'A gratidão de Sildar', tipo: 'narracao',
        npcs: [
          { nome: 'Sildar Hallwinter', tipo: 'aliado', descricao: 'Livre das cordas e de volta à luta, o veterano recupera o fôlego e a espada — e a informação que muda a campanha.', notasPrivadas: 'Recompensa: 50 po por PJ ao chegar a Phandalin. Revela: Gundren foi levado ao Castelo Cragmaw a mando do "Aranha Negra"; Gundren carregava o mapa da Caverna do Eco das Ondas (a Mina Perdida de Phandelver). Sildar procura o amigo Iarno "Bastão de Vidro" Albrek, sumido em Phandalin.' },
        ],
        narracao: 'Cortadas as cordas, Sildar Hallwinter se ergue com um gemido e aperta a mão de cada um. "Devo-lhes a vida." Entre goles d\'água, ele conta o essencial: os goblins Cragmaw serviam a um tal "Aranha Negra", que ordenou que Gundren fosse levado vivo ao Castelo Cragmaw — porque o anão carrega o mapa para a Caverna do Eco das Ondas, a lendária Mina Perdida de Phandelver. "Levem-me a Phandalin. Lá eu pago o que prometi, e juntos descobrimos onde estão a segurar o Gundren."',
        notasMestre: 'Ponto de virada: o resgate imediato foi cumprido, mas a MISSÃO MAIOR (achar Gundren e a Mina) abre a campanha inteira. Sildar dá 50 po por PJ ao chegar à vila e pede ajuda para achar Iarno Albrek. Deixe o grupo saquear o esconderijo (baú de Klarg, provisões de Gundren) antes de partir.',
        encontro: [], saidas: [
          { para: 'p_vitoria', rotulo: 'Escoltar Sildar e a carroça até Phandalin', aviso: '' },
        ],
      },
      {
        id: 'p_vitoria', titulo: 'Chegada a Phandalin', tipo: 'final', resultado: 'vitoria',
        narracao: 'Ao entardecer, a carroça range pela rua de terra de Phandalin com Sildar são e salvo ao vosso lado. Ele paga o prometido e brinda à vossa coragem no Pônei Saltitante. Mas a vila vive sob medo — a gangue dos Mantos Vermelhos aperta o povo — e, em algum lugar ao norte, Gundren Rockseeker segue prisioneiro no Castelo Cragmaw, com o mapa da Mina Perdida nas mãos do misterioso Aranha Negra. A vossa verdadeira jornada apenas começou. — Fim do Capítulo 1.',
        notasMestre: 'Vitória do Capítulo 1 (Flechas Goblin). Recompensas: 50 po/PJ de Sildar + o baú de Klarg + provisões entregues. XP sugerido: nível 2 para todos. Ganchos para o Capítulo 2 (Phandalin): os Mantos Vermelhos e Iarno "Bastão de Vidro", e a caçada ao Castelo Cragmaw para libertar Gundren. Continue com aventuras próprias ou aguarde os próximos capítulos do módulo.',
        encontro: [], saidas: [],
      },
      {
        id: 'p_tpk', titulo: 'Cercados no esconderijo', tipo: 'final', resultado: 'derrota',
        narracao: 'Barulho demais, inimigos demais. Goblins, lobos e o porrete de Klarg convergem de todos os túneis ao mesmo tempo, e a caverna se fecha sobre vocês como uma armadilha. As tochas se apagam uma a uma.',
        notasMestre: 'Só se a mesa insistir em despertar o esconderijo inteiro de uma vez. Alternativa clemente e fiel ao módulo: em vez de morte, os PJs acordam AMARRADOS — capturados como Sildar. Podem escapar (Atletismo/Ladinagem) e retomar do poleiro de Yeemik, transformando a derrota em reviravolta.',
        encontro: [], saidas: [],
      },
    ],
  },
  // =====================================================================
  // ONE-SHOT ORIGINAL (material de demonstração — P7). Conteúdo próprio,
  // não reproduz módulo publicado. 13 nós, nível 1-3, hub + escolha moral
  // sem resposta certa + becos/mortes sinalizados + finais múltiplos.
  // Monstros: nomes EXATOS do bestiário (todos com loot na Fase 13).
  // =====================================================================
  {
    id: 'modelo_cripta_sino_silencioso',
    titulo: 'A Cripta do Sino Silencioso (one-shot)',
    limites: { jogadoresMax: 5, nivelMin: 1, nivelMax: 3 },
    noInicial: 'c_inicio',
    nos: [
      {
        id: 'c_inicio', titulo: 'O sino que emudeceu', tipo: 'narracao',
        narracao: 'Na vila de Marcabru, o velho sino da capela tocava a cada amanhecer há cem anos. Há três noites, emudeceu. Desde então, dois moradores desapareceram das camas sem deixar rasto. O padre Anselmo, de mãos trémulas, oferece a bolsa da paróquia a quem descobrir o que se esconde sob a igreja.',
        notasMestre: 'Gancho social simples. O sino silenciou quando um cultista reabriu a cripta selada e começou a erguer os mortos. Deixe os PJs escolherem a abordagem; todas convergem para a cripta.',
        encontro: [], saidas: [
          { para: 'c_coveiro', rotulo: 'Interrogar o coveiro antes de descer', aviso: '' },
          { para: 'c_cemiterio', rotulo: 'Vigiar o cemitério à noite', aviso: '' },
          { para: 'c_entrada', rotulo: 'Descer já pela cripta sob a capela', aviso: '' },
          { para: 'c_ignorar', rotulo: 'Recusar e seguir viagem', aviso: 'beco' },
        ],
      },
      {
        id: 'c_coveiro', titulo: 'O coveiro Orin', tipo: 'social',
        npcs: [{ nome: 'Orin, o Coveiro', tipo: 'neutro', descricao: 'Homem magro de olhos fundos que cava as covas de Marcabru há trinta anos.', notasPrivadas: 'Sabe que a laje da cripta inferior foi arrombada por dentro. Está aterrorizado; um teste de Persuasão CD 12 (ou uma moeda) solta a informação e um mapa rabiscado que dá vantagem na descida.' }],
        narracao: 'Orin range os dentes: "A laje selada lá em baixo... alguém a abriu por DENTRO. Ouço cânticos quando o vento vira. Não desçam desarmados." Ele hesita, depois estende um mapa rabiscado dos túneis.',
        notasMestre: 'Persuasão CD 12 (ou sub­orno) entrega o mapa: descreva-o como vantagem narrativa na descida (os PJs evitam a emboscada do ossuário se quiserem). Orin não desce de forma alguma.',
        encontro: [], saidas: [
          { para: 'c_cemiterio', rotulo: 'Vigiar o cemitério primeiro', aviso: '' },
          { para: 'c_entrada', rotulo: 'Seguir o mapa até a cripta', aviso: '' },
        ],
      },
      {
        id: 'c_cemiterio', titulo: 'Vigília no cemitério', tipo: 'encontro',
        narracao: 'A meia-noite, a terra fofa de três covas recentes começa a mexer. Mãos de osso rompem o solo: esqueletos erguem-se com os olhos acesos por uma luz fria e avançam em silêncio de rebanho.',
        notasMestre: 'Combate de aquecimento. Se os PJs recuarem para a capela, os esqueletos não os seguem para dentro (solo sagrado). Vencer aqui revela a escada da cripta escondida atrás do altar.',
        encontro: [{ nome: 'Esqueleto', qtd: 3 }],
        saidas: [
          { para: 'c_entrada', rotulo: 'Entrar na cripta pela escada do altar', aviso: '' },
          { para: 'c_fuga_noturna', rotulo: 'Perseguir a luz fria noite adentro', aviso: 'mortal' },
        ],
      },
      {
        id: 'c_entrada', titulo: 'A boca da cripta', tipo: 'narracao',
        narracao: 'Ar gelado sobe da escada em espiral. Lá no alto, o sino de bronze pende imóvel, amarrado com trapos escuros para não soar. Dois caminhos se abrem: a escada principal que mergulha na treva e um arco lateral cheio de nichos de ossos.',
        notasMestre: 'Nó de bifurcação. Quem trouxe o mapa de Orin pode ir direto pela escada e pular o ossuário. O ossuário é opcional: mais loot, mais risco.',
        encontro: [], saidas: [
          { para: 'c_ossuario', rotulo: 'Explorar o ossuário lateral', aviso: '' },
          { para: 'c_descida', rotulo: 'Descer direto pela escada principal', aviso: '' },
        ],
      },
      {
        id: 'c_ossuario', titulo: 'O ossuário', tipo: 'encontro',
        narracao: 'Prateleiras de crânios se perdem no escuro. Algo escorre entre os nichos — um lodo cinzento e faminto que já comeu o brilho de várias moedas — enquanto ratos do tamanho de cães disputam os restos.',
        notasMestre: 'Encontro opcional com boa recompensa (o lodo guarda uma gema indigesta; ver loot). Cuidado com a armadura dos PJs contra o Lodo Cinzento (corrói metal). Daqui só se segue para a escada.',
        encontro: [{ nome: 'Rato Gigante', qtd: 3 }, { nome: 'Lodo Cinzento (Gray Ooze)', qtd: 1 }],
        saidas: [
          { para: 'c_descida', rotulo: 'Voltar e descer a escada principal', aviso: '' },
        ],
      },
      {
        id: 'c_descida', titulo: 'A câmara dos festins', tipo: 'encontro',
        narracao: 'A escada desemboca numa câmara funerária profanada. Sarcófagos foram arrombados e, agachados sobre um deles, dois carniçais banqueteiam-se com algo que é melhor não olhar de perto. Erguem os focinhos ensanguentados na vossa direção.',
        notasMestre: 'Os carniçais podem paralisar com as garras (salva de Constituição). Após a luta, um gemido humano vem da câmara seguinte — leva ao nó moral.',
        encontro: [{ nome: 'Carniçal (Ghoul)', qtd: 2 }],
        saidas: [
          { para: 'c_moral', rotulo: 'Seguir o gemido até a câmara do sino', aviso: '' },
        ],
      },
      {
        id: 'c_moral', titulo: 'O pacto sob o sino', tipo: 'social',
        npcs: [
          { nome: 'Vespero, o Cultista', tipo: 'inimigo', descricao: 'Cultista pálido que ergueu os mortos para "poupar Marcabru de morrer de velhice".', notasPrivadas: 'Sincero no seu delírio. Se aceito o pacto, ele PARA de erguer mortos, mas os dois desaparecidos ficam presos como servos e a vila vive sob toque de recolher eterno.' },
          { nome: 'Doralin, o morador', tipo: 'aliado', descricao: 'Um dos desaparecidos, amarrado e vivo — por enquanto.', notasPrivadas: 'Libertá-lo antes do combate dá vantagem ao grupo (mais um par de mãos), mas o cultista aproveita a distração para chamar o guardião Wight.' },
        ],
        narracao: 'Sob o sino silenciado, um cultista de véspere pálida ergue as mãos: "Não sou vosso inimigo. Enquanto o sino não tocar, ninguém em Marcabru envelhece, ninguém morre. Deixem-me terminar e a vila viverá para sempre." Atrás dele, amarrado, um morador ainda respira.',
        notasMestre: 'DECISÃO MORAL sem resposta certa: matar o cultista quebra o feitiço mas condena Marcabru à mortalidade comum (e liberta os mortos-vivos numa última investida); aceitar o pacto salva corpos ao custo de almas. Não recompense nem puna — deixe a mesa decidir e conviver.',
        encontro: [], saidas: [
          { para: 'c_libertar', rotulo: 'Libertar o morador primeiro', aviso: '' },
          { para: 'c_chefe', rotulo: 'Atacar o cultista de imediato', aviso: '' },
          { para: 'c_pacto', rotulo: 'Aceitar o pacto e recuar', aviso: '' },
        ],
      },
      {
        id: 'c_libertar', titulo: 'As cordas cortadas', tipo: 'narracao',
        narracao: 'Vocês cortam as cordas de Doralin — mas o cultista aproveita o segundo de distração para bradar uma palavra morta. A laje de um sarcófago maior desliza: um guardião de olhos frios se ergue para proteger o mestre.',
        notasMestre: 'Recompensa e custo: Doralin salvo (aliado, +1 combatente fraco), mas o combate seguinte começa com o Wight já desperto e adjacente ao cultista.',
        encontro: [], saidas: [
          { para: 'c_chefe', rotulo: 'Enfrentar o cultista e o guardião', aviso: '' },
        ],
      },
      {
        id: 'c_chefe', titulo: 'O guardião do sino', tipo: 'encontro',
        narracao: 'O cultista recua para trás de um vulto encouraçado de podridão antiga — um Wight, o primeiro senhor desta cripta, erguido para servir de escudo. O ar cheira a terra e ferro. É agora.',
        notasMestre: 'Combate-clímax. O Wight drena vida (perda de PV máximo em acerto crítico) e o cultista lança magia da retaguarda — foquem o conjurador para encurtar a luta. Ao cair o cultista, os mortos-vivos remanescentes desabam inertes.',
        encontro: [{ nome: 'Cultista', qtd: 1 }, { nome: 'Wight', qtd: 1 }],
        saidas: [
          { para: 'c_vitoria', rotulo: 'Derrotar o cultista e o guardião', aviso: '' },
          { para: 'c_derrota', rotulo: 'Sucumbir na câmara do sino', aviso: 'mortal' },
        ],
      },
      {
        id: 'c_pacto', titulo: 'O preço da vida eterna', tipo: 'final', resultado: 'neutro',
        narracao: 'Vocês recuam e deixam o cultista terminar. O sino nunca mais toca — e Marcabru nunca mais enterra ninguém. Os desaparecidos regressam com os olhos frios, obedientes, e a vila vive num crepúsculo sem fim onde ninguém morre... nem realmente vive. Vocês partem com a bolsa da paróquia e um silêncio no peito.',
        notasMestre: 'Final ambíguo intencional. Ótimo gancho: anos depois, Marcabru pode virar uma cidade inteira de servos do culto — semente de campanha.',
        encontro: [], saidas: [],
      },
      {
        id: 'c_vitoria', titulo: 'O sino volta a soar', tipo: 'final', resultado: 'vitoria',
        narracao: 'Com o cultista caído, os trapos que amordaçavam o sino desfazem-se e, ao amanhecer, o bronze volta a cantar sobre Marcabru. Os mortos descansam de novo, Doralin abraça a família e o padre Anselmo cumpre a bolsa prometida. A vila envelhecerá — como deve ser — mas viva e livre.',
        notasMestre: 'Vitória. Recompensas: bolsa da paróquia (2d6×10 po ao grupo), o loot do cultista e do Wight (Fase 13) + a gratidão de Marcabru como base amiga. XP sugerido: subir para o nível seguinte.',
        encontro: [], saidas: [],
      },
      {
        id: 'c_derrota', titulo: 'Sob o sino mudo', tipo: 'final', resultado: 'derrota',
        narracao: 'O frio do Wight rouba-vos o calor golpe a golpe até que a câmara escurece. O sino permanece amarrado, e Marcabru acorda para mais um dia sem badalada — agora com novos rostos entre os desaparecidos.',
        notasMestre: 'Alternativa clemente ao TPK: em vez de morte, os PJs acordam AMARRADOS junto de Doralin, poupados para servir de material ao ritual — podem escapar (Ladinagem/Atletismo) e retomar do nó do pacto, transformando a derrota em segunda chance.',
        encontro: [], saidas: [],
      },
      {
        id: 'c_fuga_noturna', titulo: 'A luz fria no ermo', tipo: 'final', resultado: 'derrota',
        narracao: 'Vocês perseguem a luz fria para longe das luzes da vila. Ela sempre parece a dez passos — até que, cercados pela treva e sem terreno conhecido, percebem tarde demais que eram a caça, não os caçadores.',
        notasMestre: 'Beco mortal sinalizado. Clemência opcional: em vez de morte, os PJs perdem a noite (exaustão) e acordam à beira do bosque — podem recomeçar do nó inicial, sabendo agora que a resposta está SOB a igreja, não fora.',
        encontro: [], saidas: [],
      },
      {
        id: 'c_ignorar', titulo: 'Estrada afora', tipo: 'final', resultado: 'neutro',
        narracao: 'Não é o vosso problema. Vocês seguem viagem ao raiar do dia — e semanas depois, numa taverna distante, ouvem que Marcabru foi abandonada: um vilarejo fantasma onde, dizem, um sino nunca toca e ninguém que entra volta a sair.',
        notasMestre: 'Beco de inação: mostre o custo de virar as costas e ofereça recomeçar do nó inicial se a mesa se arrepender.',
        encontro: [], saidas: [],
      },
    ],
  },
  // =====================================================================
  // ONE-SHOT ORIGINAL Nº2 (P7) — aventura SELVAGEM de escolta/emboscada,
  // sem mortos-vivos, para variar o tom do material de demonstração.
  // Conteúdo próprio. 14 nós, nível 1-3. Escolha moral: os "bandidos"
  // são refugiados desesperados. Monstros: nomes exatos do bestiário.
  // =====================================================================
  {
    id: 'modelo_comboio_de_sal',
    titulo: 'O Comboio de Sal (one-shot)',
    limites: { jogadoresMax: 5, nivelMin: 1, nivelMax: 3 },
    noInicial: 'cs_inicio',
    nos: [
      {
        id: 'cs_inicio', titulo: 'A estrada da Fenda', tipo: 'narracao',
        narracao: 'O mercador Halden contrata-vos para escoltar a sua carroça de sal pela estrada da Fenda, um desfiladeiro estreito entre penhascos. "Poucas moedas, mas a viagem é curta", diz ele, contando o cofre com olhos gulosos. Ao longe, urubus giram sobre a garganta do desfiladeiro.',
        notasMestre: 'Gancho de escolta. Halden é ganancioso e trata mal quem cruza o caminho dele — plantar isso agora paga na escolha moral. Todos os caminhos convergem para a Fenda; os urubus antecipam o ninho.',
        encontro: [], saidas: [
          { para: 'cs_batedor', rotulo: 'Enviar batedores à frente', aviso: '' },
          { para: 'cs_dia', rotulo: 'Viajar de dia, com cautela', aviso: '' },
          { para: 'cs_noite', rotulo: 'Atravessar a Fenda à noite para ganhar tempo', aviso: 'mortal' },
          { para: 'cs_recusar', rotulo: 'Recusar a Fenda e pegar a estrada longa e segura', aviso: 'beco' },
        ],
      },
      {
        id: 'cs_batedor', titulo: 'Sinais na trilha', tipo: 'social',
        narracao: 'Adiante, rastros contam duas histórias: pegadas humanas magras e descalças convergindo para um acampamento improvisado — e, mais fundo na garganta, fios de teia grossa cobrindo as pedras. Percepção CD 12 revela ambos.',
        notasMestre: 'Recompensa a cautela: quem batedor sabe que a "emboscada" é gente faminta e que a Fenda tem um ninho de aranhas. Isso permite escolher a rota com informação.',
        encontro: [], saidas: [
          { para: 'cs_emboscada', rotulo: 'Ir ao acampamento dos suspeitos', aviso: '' },
          { para: 'cs_ravina', rotulo: 'Evitar o acampamento e cruzar a garganta', aviso: '' },
        ],
      },
      {
        id: 'cs_dia', titulo: 'Marcha cautelosa', tipo: 'narracao',
        narracao: 'A carroça range pela estrada sob o sol. Halden resmunga a cada parada. Ao dobrar uma curva de pedra, figuras esfarrapadas bloqueiam o caminho com paus e uma velha espada.',
        notasMestre: 'Leva à emboscada em condições justas (dia, PJs alertas). Deixe claro que os assaltantes tremem de fome, não de fúria.',
        encontro: [], saidas: [
          { para: 'cs_emboscada', rotulo: 'Encarar os que bloqueiam a estrada', aviso: '' },
        ],
      },
      {
        id: 'cs_noite', titulo: 'A garganta às escuras', tipo: 'final', resultado: 'derrota',
        narracao: 'À noite, a Fenda é uma armadilha. As rodas prendem nas teias que vocês não veem, e da escuridão descem as patas. Cercados sem luz nem espaço, a carroça de sal vira um túmulo.',
        notasMestre: 'Beco mortal sinalizado. Clemência opcional: em vez de TPK, os PJs perdem a carroça e acordam feridos ao amanhecer, presos na garganta — podem recomeçar do nó inicial, agora respeitando o desfiladeiro.',
        encontro: [], saidas: [],
      },
      {
        id: 'cs_emboscada', titulo: 'Os que bloqueiam a estrada', tipo: 'encontro',
        narracao: 'Eles atacam mal, com armas improvisadas e dois cães magros ao lado. Não lutam como bandidos treinados — lutam como quem não tem mais nada a perder.',
        notasMestre: 'Combate propositalmente vencível. Ao primeiro ferido grave (ou moral CD 10), um deles ergue as mãos e implora — leva ao nó do parlamento. Se os PJs abaterem todos sem piedade, saltam direto para a garganta, sem o aviso do ninho.',
        encontro: [{ nome: 'Bandido', qtd: 3 }, { nome: 'Lobo', qtd: 2 }],
        saidas: [
          { para: 'cs_parlei', rotulo: 'Aceitar a rendição e ouvir', aviso: '' },
          { para: 'cs_ravina', rotulo: 'Terminar a luta e seguir para a garganta', aviso: '' },
        ],
      },
      {
        id: 'cs_parlei', titulo: 'Fome, não malícia', tipo: 'social',
        npcs: [{ nome: 'Sargento Bram', tipo: 'neutro', descricao: 'Ex-soldado de ombros largos que lidera um punhado de camponeses expulsos da própria aldeia pela seca.', notasPrivadas: 'Sabe o caminho seguro pela borda da garganta e avisa do ninho de aranhas — se tratado com dignidade. Se humilhado ou entregue a Halden, essa ajuda se perde.' }],
        narracao: 'O líder, um ex-soldado chamado Bram, larga a espada: "Não queremos a vossa vida, só comida. A aldeia expulsou-nos na seca. O gordo da carroça? Foi ele quem comprou as nossas terras por um punhado de sal." Halden cospe: "Ladrões! Matem-nos e sigam!"',
        notasMestre: 'ESCOLHA MORAL sem resposta certa: dividir o sal/comida enfurece Halden (menos paga), mas Bram guia-vos com segurança e avisa do ninho; entregar os refugiados agrada ao mercador, mas vocês entram na garganta às cegas. Não recompense nem puna — deixe a mesa carregar a decisão.',
        encontro: [], saidas: [
          { para: 'cs_ajudar', rotulo: 'Partilhar o sal e a comida com os refugiados', aviso: '' },
          { para: 'cs_entregar', rotulo: 'Expulsá-los e agradar a Halden', aviso: '' },
          { para: 'cs_ravina', rotulo: 'Ignorar tudo e apenas cruzar a garganta', aviso: '' },
        ],
      },
      {
        id: 'cs_ajudar', titulo: 'Pão partido', tipo: 'narracao',
        narracao: 'Vocês abrem um saco de sal e o pouco que têm. Halden esperneia, mas Bram aperta-vos o braço: "Há uma borda alta que passa por cima do ninho. Sigam-me — e cuidado com as teias." Dois dos refugiados pegam em lanças para ajudar.',
        notasMestre: 'Recompensa narrativa: vantagem na garganta (aproximação pela borda) e 1-2 aliados fracos no combate seguinte. Halden reduz a paga, mas a mesa ganhou uma comunidade grata (gancho de campanha).',
        encontro: [], saidas: [
          { para: 'cs_ravina', rotulo: 'Seguir Bram até a garganta', aviso: '' },
        ],
      },
      {
        id: 'cs_entregar', titulo: 'O sorriso de Halden', tipo: 'narracao',
        narracao: 'Vocês afugentam os refugiados a golpes de cabo. Halden ri e promete uma moeda extra. Bram, ao recuar, apenas diz: "Que a garganta seja mais piedosa que vocês." Só ao entrar nas sombras da Fenda percebem que ninguém vos avisou do que espera lá dentro.',
        notasMestre: 'Custo escondido: sem o aviso de Bram, a garganta começa em desvantagem (surpresa das aranhas). Halden paga mais — se sobreviverem para receber.',
        encontro: [], saidas: [
          { para: 'cs_ravina', rotulo: 'Entrar na garganta sem guia', aviso: '' },
        ],
      },
      {
        id: 'cs_ravina', titulo: 'A garganta das teias', tipo: 'encontro',
        narracao: 'As paredes do desfiladeiro se fecham e o sol some atrás de um teto de teias. Formas peludas do tamanho de cães descem pelos fios, patas testando o ar em vossa direção.',
        notasMestre: 'Quem veio pela borda (ajudou Bram) ataca de posição alta (vantagem); quem entrou às cegas (entregou os refugiados) pode ser surpreendido na 1ª rodada. Após a luta, um rugido ecoa do fundo — o guardião do ninho.',
        encontro: [{ nome: 'Aranha Gigante', qtd: 2 }],
        saidas: [
          { para: 'cs_ninho', rotulo: 'Avançar até o fundo da garganta', aviso: '' },
        ],
      },
      {
        id: 'cs_ninho', titulo: 'O dono da Fenda', tipo: 'encontro',
        narracao: 'No fundo, entre casulos e ossos, ergue-se a fera que reina na garganta: um ursaco de olhos redondos e bico manchado, faminto e territorial. Entre vocês e a saída do desfiladeiro, só ele.',
        notasMestre: 'Combate-clímax. O ursaco é bruto mas burro — terreno e flanqueamento decidem. Se os PJs têm aliados de Bram, agora fazem diferença. Vencer aqui abre a saída e conclui a escolta.',
        encontro: [{ nome: 'Ursaco (Owlbear)', qtd: 1 }],
        saidas: [
          { para: 'cs_vitoria', rotulo: 'Derrubar a fera e furar a garganta', aviso: '' },
          { para: 'cs_derrota', rotulo: 'Ser esmagado no fundo do desfiladeiro', aviso: 'mortal' },
        ],
      },
      {
        id: 'cs_vitoria', titulo: 'Do outro lado da Fenda', tipo: 'final', resultado: 'vitoria',
        narracao: 'A carroça de sal emerge da garganta sob o sol do fim de tarde, intacta. Halden paga o combinado a contragosto. Se vocês pouparam os refugiados, Bram e a sua gente esperam na saída com água e pão — e a promessa de um lar amigo na estrada. Se não, seguem sozinhos, mais ricos e mais frios.',
        notasMestre: 'Vitória. Recompensas: paga de Halden (mais alta se entregaram os refugiados, mais baixa se os ajudaram) + loot das aranhas e do ursaco (Fase 13). XP sugerido: subir de nível. A comunidade de Bram vira base amiga se merecida.',
        encontro: [], saidas: [],
      },
      {
        id: 'cs_derrota', titulo: 'Sal e ossos', tipo: 'final', resultado: 'derrota',
        narracao: 'A fera é rápida demais no espaço apertado. Um a um vocês caem entre os casulos, e a garganta reclama mais uma carroça para os seus ossos.',
        notasMestre: 'Alternativa clemente: em vez de morte, os PJs são arrastados inconscientes para um casulo e acordam à noite — podem cortar-se para fora (Ladinagem/Força) e escapar sem a carga, retomando do nó inicial mais sábios.',
        encontro: [], saidas: [],
      },
      {
        id: 'cs_recusar', titulo: 'A estrada longa', tipo: 'final', resultado: 'neutro',
        narracao: 'Vocês recusam a Fenda e aconselham a estrada longa. Halden, furioso com a demora, contrata outros e parte sem vocês pela garganta. Semanas depois, ninguém em lugar nenhum voltou a ver o mercador de sal — nem a carroça.',
        notasMestre: 'Beco de prudência excessiva: sem risco, sem recompensa nem história. Ofereça recomeçar do nó inicial se a mesa quiser a aventura de verdade.',
        encontro: [], saidas: [],
      },
    ],
  },
];

// Export para o harness de testes em Node (no browser é ignorado)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AVENTURAS_PRONTAS };
}
