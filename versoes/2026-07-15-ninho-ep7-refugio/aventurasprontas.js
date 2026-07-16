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
  {
    id: 'modelo_phandelver_phandalin',
    titulo: 'Mina Perdida de Phandelver — Cap. 2: Phandalin',
    limites: { jogadoresMax: 5, nivelMin: 2, nivelMax: 3 },
    noInicial: 'ph2_chegada',
    nos: [
      // ============ CAPÍTULO 2A — PHANDALIN (vila-hub) ============
      // Adaptação própria e condensada (PH1 do docs/CAMPANHA-PHANDELVER.md).
      {
        id: 'ph2_chegada', titulo: 'Chegada a Phandalin', tipo: 'narracao',
        npcs: [
          { nome: 'Elmar Barthen', tipo: 'lojista', descricao: 'Dono magro e calvo do armazém Barthen Provisões, o maior posto de trocas da vila; recebe a carga com alívio evidente.', notasPrivadas: 'Paga as 10 po combinadas pela entrega. Gosta de Gundren e pergunta por ele — não sabe de NADA sobre o sequestro. Vende suprimentos comuns a preço de tabela.' },
        ],
        narracao: 'A trilha desce entre colinas e Phandalin aparece: casas novas de madeira crescendo por entre ruínas cobertas de hera, uma torre de pedra partida ao longe e o cheiro de pão e serragem no ar. No armazém de Elmar Barthen, a carroça é finalmente descarregada — a missão que começou na estrada termina aqui. Mas nos olhares baixos dos vizinhos e nas portas que se fecham cedo, dá para sentir: esta vila tem medo de alguma coisa.',
        notasMestre: 'Pagamento: 10 po pela entrega (mais o que foi combinado na mesa). Barthen menciona, casual, que "os mantos vermelhos" andam cobrando "taxas de proteção" e que ninguém faz nada. Se o grupo resgatou Sildar no Cap. 1, ele se hospeda na Stonehill e chama os PJs para conversar (nó "Sildar Hallwinter"). Este capítulo é SOCIAL: deixe a mesa explorar no ritmo dela pelo nó da praça.',
        encontro: [], saidas: [
          { para: 'ph2_hub', rotulo: 'Explorar a vila', aviso: '' },
        ],
      },
      {
        id: 'ph2_hub', titulo: 'A praça de Phandalin', tipo: 'social',
        narracao: 'Da praça de terra batida se vê a vila inteira: a estalagem Stonehill no centro, o armazém de Barthen e a loja de armas Leão Escudo na rua principal, o pomar do velho Daran a leste, o salão do prefeito com seus cartazes, o pequeno santuário de pedra e, no alto da colina, a carcaça queimada da Mansão Tresendar. Na porta de uma taverna caindo aos pedaços — o Gigante Adormecido — meia dúzia de homens de manto vermelho-sangue observam quem passa.',
        notasMestre: 'HUB do capítulo: cada saída é um local com um NPC e um gancho; todos voltam para cá. Não force ordem. Os Marcarrubra (mantos vermelhos) provocam qualquer PJ que cruze a praça — quando a mesa quiser o confronto, use "Mantos vermelhos na rua". Rumores gerais: colete-os na Stonehill. Partir da vila sem se envolver é permitido (final neutro) — mas sinalize o custo.',
        encontro: [], saidas: [
          { para: 'ph2_stonehill', rotulo: 'Estalagem Stonehill (rumores)', aviso: '' },
          { para: 'ph2_sildar', rotulo: 'Procurar Sildar Hallwinter', aviso: '' },
          { para: 'ph2_leao', rotulo: 'Leão Escudo (loja de armas)', aviso: '' },
          { para: 'ph2_cambio', rotulo: 'Câmbio de Minério (Halia)', aviso: '' },
          { para: 'ph2_pomar', rotulo: 'Pomar Edermath (Daran)', aviso: '' },
          { para: 'ph2_fazenda', rotulo: 'Fazenda Alderleaf (Qelline e Carp)', aviso: '' },
          { para: 'ph2_salao', rotulo: 'Salão do Chefe da Vila (Harbin)', aviso: '' },
          { para: 'ph2_santuario', rotulo: 'Santuário da Sorte (Irmã Garaele)', aviso: '' },
          { para: 'ph2_rua', rotulo: 'Encarar os mantos vermelhos na rua', aviso: '' },
          { para: 'ph2_partir', rotulo: 'Partir da vila sem se envolver', aviso: 'beco' },
        ],
      },
      {
        id: 'ph2_stonehill', titulo: 'Estalagem Stonehill', tipo: 'social',
        npcs: [
          { nome: 'Toblen Stonehill', tipo: 'neutro', descricao: 'Estalajadeiro jovem e falante, orgulhoso da estalagem que construiu; serve ensopado, cerveja e toda fofoca da vila.', notasPrivadas: 'Detesta os Marcarrubra mas tem família — não se arrisca. Quarto: 5 pp/noite. É a melhor fonte de RUMORES da vila.' },
        ],
        narracao: 'A Stonehill é pequena, quente e cheia: mineiros, lavradores e viajantes dividem mesas sob vigas ainda cheirando a madeira nova. Toblen, o dono, serve canecas sem parar de falar — e baixa a voz toda vez que a porta abre e um manto vermelho passa na rua.',
        notasMestre: 'Rumores (dê 1-2 por conversa, de graça ou por uma rodada de bebida): (1) os mantos vermelhos partiram o braço do filho do sapateiro e ninguém foi preso; (2) o mago Iarno, que veio "restaurar a ordem", sumiu há semanas; (3) Daran do pomar anda pagando por notícias de mortos-vivos na Velha Coruja; (4) o marido da tecelã Thel Dendrar foi morto pelos mantos e a família DESAPARECEU. O rumor 4 é a semente emocional do próximo capítulo (os Dendrar estão presos na mansão).',
        encontro: [], saidas: [
          { para: 'ph2_hub', rotulo: 'Voltar à praça', aviso: '' },
        ],
      },
      {
        id: 'ph2_sildar', titulo: 'Sildar Hallwinter', tipo: 'social',
        npcs: [
          { nome: 'Sildar Hallwinter', tipo: 'aliado', descricao: 'Guerreiro veterano da Aliança dos Lordes, hospedado na Stonehill; quer devolver a lei a Phandalin e encontrar os amigos desaparecidos.', notasPrivadas: 'Oferece 500 po pelo resgate de Gundren e a localização do Castelo Cragmaw, e 200 po por notícias do mago Iarno Albrek. NÃO SABE que Iarno é o "Cajavidro" dos Marcarrubra — a revelação deve doer. Cobre fiança/apoio político se os PJs arrumarem encrenca com a lei.' },
        ],
        narracao: 'Sildar limpa a ferrugem da cota de malha numa mesa da Stonehill, o bigode grisalho escondendo um sorriso ao ver o grupo. "Phandalin precisa de gente como vocês", diz, empurrando um mapa da região sobre a mesa. "E eu preciso de duas coisas: achar Gundren — e achar um velho amigo meu que sumiu nesta vila. Um mago chamado Iarno Albrek."',
        notasMestre: 'As duas missões-âncora da campanha: (1) 500 po — localizar o Castelo Cragmaw e resgatar Gundren (Cap. 3); (2) 200 po — descobrir o paradeiro de Iarno (a resposta está na mansão, Cap. 2B). Sildar acredita que Iarno está em perigo. Guarde a cara dele para quando descobrirem a verdade.',
        encontro: [], saidas: [
          { para: 'ph2_hub', rotulo: 'Voltar à praça', aviso: '' },
        ],
      },
      {
        id: 'ph2_leao', titulo: 'Leão Escudo', tipo: 'social',
        npcs: [
          { nome: 'Linene Graywind', tipo: 'lojista', descricao: 'Mestra da loja de armas Leão Escudo, direta e desconfiada; vende lâminas boas a quem parece do lado certo da lei.', notasPrivadas: 'Oferece 50 po pela recuperação das caixas com o selo do Leão Escudo roubadas das caravanas (estão no porão da mansão, Cap. 2B). Sabe que os Marcarrubra usam a Mansão Tresendar, mas NEGA saber se sentir ameaçada — teme retaliação. Não vende a quem apoiar abertamente os mantos.' },
        ],
        narracao: 'Atrás do balcão do Leão Escudo, entre lanças enceradas e escudos pendurados, Linene Graywind mede o grupo dos pés à cabeça antes de cumprimentar. "Três carregamentos meus sumiram na estrada este mês", diz, batendo o dedo numa lista de cargas. "Caixas com o selo do leão. Quem trouxer de volta não paga a próxima espada."',
        notasMestre: 'Missão: 50 po pelas caixas roubadas (estão na área do depósito da mansão — Cap. 2B). Com Persuasão CD 12 (ou provando que enfrentam os mantos), Linene solta o que sabe: os Marcarrubra entram e saem da colina da Mansão Tresendar "como formigas". Loja: armas comuns do catálogo a preço de tabela.',
        encontro: [], saidas: [
          { para: 'ph2_hub', rotulo: 'Voltar à praça', aviso: '' },
        ],
      },
      {
        id: 'ph2_cambio', titulo: 'Câmbio de Minério de Phandalin', tipo: 'social',
        npcs: [
          { nome: 'Halia Thornton', tipo: 'neutro', descricao: 'Gerente do câmbio de minério, elegante e calculista; fala pouco e escuta tudo, como quem já sabe a resposta antes da pergunta.', notasPrivadas: 'AGENTE ZHENTARIM. Oferece 100 po pela morte do líder dos Marcarrubra ("Cajavidro") e pela entrega de TODA a correspondência dele — quer as cartas para chantagem e o submundo da vila para a rede dela. Se os PJs cumprirem, tenta recrutá-los. Se Iarno for capturado vivo e preso na vila, ela o liberta em segredo mais tarde.' },
        ],
        narracao: 'O câmbio é o único prédio de pedra nova da vila, silencioso e organizado como um cofre. Halia Thornton ergue os olhos do livro-razão e vai direto ao ponto, sem rodeios e sem testemunhas: "Os mantos vermelhos têm um chefe. Chamam-no de Cajavidro. Tragam-me a cabeça dele — e cada papel que encontrarem na mesa dele — e eu pago bem pelo serviço."',
        notasMestre: 'Missão-sombra: 100 po por matar o Cajavidro E entregar a correspondência SEM ler (Cap. 2B). As cartas provam a ligação com o Aranha Negra — se os PJs as entregarem sem copiar, perdem uma pista (deixe a escolha pesar). Intuição CD 15 percebe que Halia esconde muito mais do que diz. Ela nunca admite a rede Zhentarim.',
        encontro: [], saidas: [
          { para: 'ph2_hub', rotulo: 'Voltar à praça', aviso: '' },
        ],
      },
      {
        id: 'ph2_pomar', titulo: 'Pomar Edermath', tipo: 'social',
        npcs: [
          { nome: 'Daran Edermath', tipo: 'aliado', descricao: 'Meio-elfo grisalho de porte militar que hoje cultiva maçãs; ex-aventureiro que não consegue ignorar problemas alheios.', notasPrivadas: 'Ex-membro da Ordem da Manopla. Pede que investiguem relatos de MORTOS-VIVOS nas ruínas do Poço da Velha Coruja (Cap. 3) — um garimpeiro fugiu de lá branco como cal. Se os PJs se mostrarem justos, oferece apadrinhá-los na Ordem. Despreza Harbin e a covardia do salão.' },
        ],
        narracao: 'Entre fileiras de macieiras, um meio-elfo de ombros largos poda galhos com a precisão de quem já empunhou coisa mais pesada que tesouras. Daran Edermath oferece sidra fresca e não perde tempo: "Garimpeiros voltaram correndo da Velha Coruja falando de mortos que andam. O prefeito finge que não ouviu. Eu não finjo."',
        notasMestre: 'Gancho do Cap. 3 (Poço da Velha Coruja): sem recompensa em ouro — a moeda dele é reputação e o convite à Ordem da Manopla. Daran também dá contexto honesto sobre a vila: Harbin é covarde, os mantos são bandidos de aluguel, e "todo bando tem um dono". Use-o como o conselheiro moral da campanha.',
        encontro: [], saidas: [
          { para: 'ph2_hub', rotulo: 'Voltar à praça', aviso: '' },
        ],
      },
      {
        id: 'ph2_fazenda', titulo: 'Fazenda Alderleaf', tipo: 'social',
        npcs: [
          { nome: 'Qelline Alderleaf', tipo: 'aliado', descricao: 'Fazendeira halfling de riso fácil e bom senso de sobra; sabe de tudo que acontece na vila sem nunca sair da horta.', notasPrivadas: 'Amiga do druida Reidoth, que conhece cada trilha da região (aponta Árvore Trovão, Cap. 3). Deixa o grupo dormir no celeiro de graça.' },
          { nome: 'Carp Alderleaf', tipo: 'aliado', descricao: 'Filho de Qelline, halfling de dez anos com coragem demais e juízo de menos; sonha em ser aventureiro.', notasPrivadas: 'Descobriu um TÚNEL escondido no matagal da colina da mansão (a fenda da área 8, Cap. 2B) enquanto brincava — viu bandidos saírem por ele. Se contar, dá ao grupo a entrada que EVITA as defesas frontais. Não deixe a mesa levá-lo junto ao assalto.' },
        ],
        narracao: 'A fazenda dos Alderleaf cheira a feno e torta de abóbora. Enquanto Qelline serve fatias generosas, o pequeno Carp circula o grupo como um satélite, os olhos brilhando para as armas — até não aguentar mais e explodir: "Eu sei um segredo! Tem um buraco escondido na colina da mansão, eu VI os homens maus saindo de lá de dentro!"',
        notasMestre: 'DUAS pistas valiosas: o túnel do Carp (entrada alternativa da mansão — vantagem tática enorme no Cap. 2B) e o nome de Reidoth, o druida que conhece a região (guia para Árvore Trovão e para o castelo, Cap. 3). Qelline pede em troca só uma coisa: que o Carp NÃO se meta. Se a mesa prometer e cumprir, ganhe um aliado para a vida toda.',
        encontro: [], saidas: [
          { para: 'ph2_hub', rotulo: 'Voltar à praça', aviso: '' },
        ],
      },
      {
        id: 'ph2_salao', titulo: 'Salão do Chefe da Vila', tipo: 'social',
        npcs: [
          { nome: 'Harbin Wester', tipo: 'neutro', descricao: 'Prefeito banqueiro de Phandalin, rechonchudo e suado; ótimo em carimbar papéis, péssimo em encarar problemas.', notasPrivadas: 'COVARDE assumido: nega com veemência que os Marcarrubra sejam "mais que uns arruaceiros" (foi ameaçado). Paga 100 po pelo fim dos ORCS do Cume da Wyvern (cartaz oficial, Cap. 3) — problema convenientemente LONGE da vila. A cadeia minúscula do salão fica disponível se prenderem alguém.' },
        ],
        narracao: 'No salão da vila, atrás de uma escrivaninha grande demais para ele, o prefeito Harbin Wester sua frio à simples menção dos mantos vermelhos. "Exagero, boataria!", apressa-se, empurrando um cartaz sobre a mesa para mudar de assunto. "Agora, ISTO sim é um problema de verdade: orcs no Cume da Wyvern! Cem peças de ouro para quem limpar aquele ninho!"',
        notasMestre: 'Missão oficial: 100 po contra os orcs do Cume da Wyvern (Cap. 3). Sobre os Marcarrubra, Harbin é uma parede: Intimidação CD 15 arranca só um sussurro ("eles mandaram um recado... eu tenho família"). A covardia dele é proposital — o vácuo de autoridade é o que os PJs vieram preencher.',
        encontro: [], saidas: [
          { para: 'ph2_hub', rotulo: 'Voltar à praça', aviso: '' },
        ],
      },
      {
        id: 'ph2_santuario', titulo: 'Santuário da Sorte', tipo: 'social',
        npcs: [
          { nome: 'Irmã Garaele', tipo: 'aliado', descricao: 'Sacerdotisa élfica jovem do pequeno santuário de Tymora, deusa da sorte; recém-chegada de uma viagem que a deixou exausta e frustrada.', notasPrivadas: 'AGENTE HARPISTA. Precisa que alguém tente o que ela falhou: fazer a banshee AGATHA (perto de Conyberry, Cap. 3) responder uma pergunta sobre o grimório de um mago chamado Arco Suave. Entrega um PENTE DE PRATA como presente de barganha. Recompensa: 3 Poções de Cura e a gratidão dos Harpistas.' },
        ],
        narracao: 'O santuário é uma capela de pedra do tamanho de um quarto, dedicada à deusa da sorte. A jovem sacerdotisa élfica que o zela, Irmã Garaele, tem olheiras de estrada e vai ao ponto com um meio-sorriso: "A sorte ajuda os audazes. Eu preciso de gente audaz para conversar com uma morta."',
        notasMestre: 'Gancho do Cap. 3 (Agatha, a banshee): entregar o pente de prata e fazer UMA pergunta com cortesia. Recompensa: 3 Poções de Cura + a simpatia dos Harpistas (Garaele só revela a organização a quem provar caráter). Se a mesa perguntar a Agatha sobre o CASTELO em vez do grimório, Garaele entende — informação por informação.',
        encontro: [], saidas: [
          { para: 'ph2_hub', rotulo: 'Voltar à praça', aviso: '' },
        ],
      },
      {
        id: 'ph2_rua', titulo: 'Mantos vermelhos na rua', tipo: 'encontro',
        narracao: 'Quatro homens de manto vermelho desencostam da parede do Gigante Adormecido e abrem num meio-círculo preguiçoso, mãos nos punhos das espadas. O mais alto sorri sem nenhuma simpatia: "Forasteiros por aqui pagam taxa de boas-vindas. Armas, bolsas... ou dentes. Escolham."',
        notasMestre: 'O confronto que a vila inteira está esperando (e assistindo das janelas). 4× Bandido; lutam sujo mas SEM disciplina: se três caírem, o último FOGE para a Mansão Tresendar — os PJs podem segui-lo e descobrir a entrada do porão. Prisioneiro + Intimidação CD 10 entrega: a senha das criptas é "Illefarn", o chefe é "Cajavidro" e "tem uma coisa de um olho só no porão que dá pesadelo". Vencer em público muda o clima da vila: portas se abrem, gente agradece.',
        encontro: [{ nome: 'Bandido', qtd: 4 }],
        saidas: [
          { para: 'ph2_decisao', rotulo: 'A vila viu — hora de acabar com os Marcarrubra', aviso: '' },
          { para: 'ph2_hub', rotulo: 'Voltar à praça e se preparar melhor', aviso: '' },
        ],
      },
      {
        id: 'ph2_decisao', titulo: 'A vila pede um basta', tipo: 'social',
        narracao: 'A notícia da surra nos mantos vermelhos corre Phandalin mais rápido que fogo em palha. Toblen serve uma rodada por conta da casa, Linene destranca o balcão bom, e até Harbin aparece para "não ver nada oficialmente". Todos os olhares dizem a mesma coisa: alguém finalmente pode arrancar essa praga pela raiz — se tiver coragem de subir a colina.',
        notasMestre: 'Recapitule as vantagens que a mesa conquistou antes do assalto: o túnel secreto do Carp, a senha "Illefarn", mantos vermelhos como disfarce (dos caídos), e os ganchos de recompensa (Linene 50 po, Halia 100 po, Sildar 200 po por Iarno). Sugira descanso longo. Quando estiverem prontos: importar e iniciar o "Cap. 2B — Esconderijo Marcarrubra".',
        encontro: [], saidas: [
          { para: 'ph2_final_pronto', rotulo: 'Subir a colina até a Mansão Tresendar', aviso: '' },
          { para: 'ph2_hub', rotulo: 'Ainda não — resolver pendências na vila', aviso: '' },
        ],
      },
      {
        id: 'ph2_final_pronto', titulo: 'Rumo à Mansão Tresendar', tipo: 'final', resultado: 'vitoria',
        narracao: 'Com a vila em peso torcendo em silêncio, vocês sobem a colina ao entardecer. A carcaça queimada da Mansão Tresendar se recorta contra o céu — e em algum lugar lá embaixo, em porões que ninguém visita há gerações, o Cajavidro conta moedas roubadas sem saber que a conta dele chegou.',
        notasMestre: 'Vitória do Cap. 2A. XP sugerido: caminho para o nível 3 (o Montador de Encontros ajuda a calibrar). Recompensas sociais consolidadas + ganchos ativos: Velha Coruja (Daran), Agatha (Garaele), orcs do Cume (Harbin), Reidoth (Qelline) — todos do Cap. 3. PRÓXIMO: importar "Cap. 2B — Esconderijo Marcarrubra" (masmorra da mansão) e iniciar com este grupo.',
        encontro: [], saidas: [],
      },
      {
        id: 'ph2_partir', titulo: 'A vila que ficou para trás', tipo: 'final', resultado: 'neutro',
        narracao: 'Vocês recebem o pagamento da entrega, reabastecem as mochilas e pegam a estrada. Phandalin encolhe no horizonte — uma vila pequena demais para os planos de vocês, com medos grandes demais para enfrentar sozinha. Os mantos vermelhos continuam na porta da taverna. Gundren continua desaparecido. E a lendária Mina de Phandelver continua perdida, à espera de gente com mais tempo... ou mais coragem.',
        notasMestre: 'Beco intencional, não punição: mostre o custo de ir embora (Gundren, os Dendrar, a vila). Retomável a qualquer momento pelo nó da praça — Phandalin continua lá, um pouco pior a cada semana. Se a mesa quiser mesmo outra direção, os ganchos do Cap. 3 (Velha Coruja, Agatha, orcs) funcionam como aventuras independentes.',
        encontro: [], saidas: [],
      },
    ],
  },
  {
    id: 'modelo_phandelver_marcarrubra',
    titulo: 'Mina Perdida de Phandelver — Cap. 2B: Esconderijo Marcarrubra',
    limites: { jogadoresMax: 5, nivelMin: 2, nivelMax: 3 },
    noInicial: 'm_entrada',
    nos: [
      // ====== CAPÍTULO 2B — ESCONDERIJO MARCARRUBRA (Mansão Tresendar) ======
      // Adaptação própria e condensada (PH2 do docs/CAMPANHA-PHANDELVER.md).
      // Masmorra sob a mansão queimada; clímax com Iarno "Cajavidro" Albrek.
      {
        id: 'm_entrada', titulo: 'A colina da Mansão Tresendar', tipo: 'social',
        narracao: 'A mansão é uma casca de pedra queimada no alto da colina, telhado ruído e janelas cegas. Ao lado da fundação, uma escada de pedra desce a uma porta de porão reforçada — a rota que os mantos vermelhos usam à vista de todos. Mais adiante, entre o matagal, escancara-se uma fenda estreita no chão: o buraco que o pequeno Carp jurou ter visto os bandidos usarem.',
        notasMestre: 'Nó de decisão que abre a masmorra. Duas entradas com trade-off real: (a) a porta do porão joga o grupo nas defesas em sequência (á.1→á.2), o caminho "cheio"; (b) a fenda do Carp cai direto na fresta (á.8), pulando os primeiros combates mas exigindo uma descida de corda (Atletismo/Acrobacia CD 10) e caindo ao lado do Nothic. Se o grupo não falou com Carp no Cap. 2A, só a porta do porão está disponível. Descanso longo aqui é recomendado antes de descer.',
        encontro: [], saidas: [
          { para: 'm_porao', rotulo: 'Descer pela porta do porão', aviso: '' },
          { para: 'm_fenda', rotulo: 'Entrar pela fenda secreta do Carp', aviso: '' },
        ],
      },
      {
        id: 'm_porao', titulo: 'O porão de suprimentos', tipo: 'encontro',
        narracao: 'A porta range para um porão frio e abobadado, empilhado de barris, sacos de grão e caixotes — vários com o selo de um leão gravado na tampa. Dois mantos vermelhos jogam dados sobre um caixote virado, e demoram um segundo a mais do que deviam para largar os copos e sacar as espadas.',
        notasMestre: 'Primeira sala (á.1). 2× Bandido de guarda, pegos meio desatentos — Furtividade em grupo CD 13 concede surpresa. As caixas com o selo do leão são as cargas roubadas de Linene (missão do Leão Escudo, 50 po no Cap. 2A). Entre os suprimentos: 2 Poções de Cura escondidas num barril de farinha (Investigação CD 12). Barulho demais aqui alerta o alojamento vizinho (á.2) — se os PJs forem estrondosos, os bandidos de lá entram no 3º turno.',
        encontro: [{ nome: 'Bandido', qtd: 2 }],
        saidas: [
          { para: 'm_alojamento', rotulo: 'Seguir para a porta de onde vêm vozes', aviso: '' },
          { para: 'm_criptas', rotulo: 'Descer o corredor rumo a um cheiro de mofo antigo', aviso: '' },
        ],
      },
      {
        id: 'm_alojamento', titulo: 'O alojamento dos mantos', tipo: 'encontro',
        narracao: 'Beliches toscos, roupas penduradas e o fedor de suor e cerveja tomam esta sala comprida. Três mantos vermelhos descansam entre turnos — mas o primeiro a ver vocês já está gritando por reforços enquanto pega a arma.',
        notasMestre: 'Á.2, o quartel dos bandidos comuns. 3× Bandido. Se o grupo chegou fazendo barulho (combate ruidoso no porão), eles estão de pé e prontos (sem surpresa possível); se chegou em silêncio, um deles pode ser subjugado antes de gritar (Furtividade/ataque surpresa). Um baú aos pés de um beliche tem a paga da semana (2d6×10 pc) e uma braçadeira de manto vermelho — útil como DISFARCE nas salas à frente (guarde para á.9). Sinalize que ainda há muito esconderijo pela frente; não é hora de gastar tudo.',
        encontro: [{ nome: 'Bandido', qtd: 3 }],
        saidas: [
          { para: 'm_jaulas', rotulo: 'Seguir gemidos abafados por um corredor lateral', aviso: '' },
          { para: 'm_criptas', rotulo: 'Ir na direção do ar frio e do mofo', aviso: '' },
        ],
      },
      {
        id: 'm_criptas', titulo: 'As criptas de Tresendar', tipo: 'social',
        narracao: 'A masmorra dá lugar a algo bem mais antigo: uma câmara funerária de arcos de pedra e nichos com ossadas, anterior à mansão. Sobre um lintel gasto, uma palavra em élfico foi riscada na poeira por mãos recentes. No fundo, três esqueletos jazem encostados nas paredes — imóveis, até você cruzar a linha invisível que os desperta.',
        notasMestre: 'Á.4, as antigas criptas élficas de Illefarn (a mansão foi erguida sobre elas). Os 3× Esqueleto são guardiões animados: ficam DORMENTES para quem disser a senha "Illefarn" (Inteligência/História CD 10 lê a palavra riscada no lintel) ou vestir um manto vermelho (os bandidos passam sem serem atacados). Sem senha nem disfarce, os esqueletos atacam ao passar. Um nicho tem uma bugiganga de valor (gema de 50 po) para quem procurar (Investigação CD 13).',
        encontro: [{ nome: 'Esqueleto', qtd: 3 }],
        saidas: [
          { para: 'm_jaulas', rotulo: 'Seguir choro abafado que ecoa das celas', aviso: '' },
          { para: 'm_fenda', rotulo: 'Atravessar para uma fresta de onde sopra ar quente', aviso: '' },
        ],
      },
      {
        id: 'm_jaulas', titulo: 'As celas dos prisioneiros', tipo: 'social',
        npcs: [
          { nome: 'Mirna Dendrar', tipo: 'aliado', descricao: 'Mãe da família de tecelões presa pelos mantos vermelhos; abraça os dois filhos e chora de alívio ao ver que não são bandidos.', notasPrivadas: 'O marido, Thel, foi morto pelos Marcarrubra por os enfrentar. GANCHO PH3: ela conta de um colar de esmeraldas ("do valor de 100 po") que a família escondeu na antiga casa deles nas RUÍNAS DE ÁRVORE TROVÃO antes de fugir — de graça, se os PJs quiserem buscar. Libertados, os Dendrar seguem para Phandalin e espalham que os PJs são heróis.' },
        ],
        narracao: 'Três celas de ferro guardam uma mulher e duas crianças encolhidas — a família Dendrar, os tecelões que a vila dava por desaparecidos. Dois mantos vermelhos de guarda se levantam do banco, entediados e cruéis, resmungando que "os pirralhos iam mesmo virar exemplo amanhã".',
        notasMestre: 'Á.5, as jaulas. 2× Bandido de guarda (a chave está no cinto de um deles). Resgatar os Dendrar é o coração emocional do capítulo — Mirna dá o gancho do colar em Árvore Trovão (PH3) e a gratidão da vila. Se o grupo negociar/intimidar em vez de lutar (Carisma CD 13), os guardas podem fugir. NÃO deixe as crianças em fogo cruzado: um Mestre cruel aqui perde a mesa.',
        encontro: [{ nome: 'Bandido', qtd: 2 }],
        saidas: [
          { para: 'm_fenda', rotulo: 'Escoltar a saída e seguir para o ar quente da fresta', aviso: '' },
          { para: 'm_quartel_bugbear', rotulo: 'Avançar rumo a vozes graves e risos brutos', aviso: '' },
        ],
      },
      {
        id: 'm_fenda', titulo: 'A fresta e o observador', tipo: 'social',
        npcs: [
          { nome: 'Nothic (o Guardião da Fresta)', tipo: 'inimigo', descricao: 'Uma criatura curvada de um olho verde só, que espreita das sombras de uma fenda natural; murmura segredos que não deveria saber sobre cada um do grupo.', notasPrivadas: 'Bloco: use o Nothic do bestiário. NÃO precisa virar combate: é ganancioso e curioso. Aceita um SUBORNO (comida/carne, um objeto brilhante) ou a troca de um segredo pessoal e deixa o grupo passar — pode até revelar que "o homem do cajado" (Iarno) fica na oficina adiante. Se atacado ou enganado, luta e usa o Olhar Podre. Guarda um tesouro no ninho: a espada TALON (espada longa +1).' },
        ],
        narracao: 'A passagem se abre numa fenda natural que racha a rocha, quente e úmida. De uma reentrância no alto, um único olho verde-luminoso se acende no escuro e uma voz úmida sussurra o seu nome — e um segredo seu que ninguém deveria saber. "Passagem... tem preço", murmura a coisa curvada. "Dê a Ele algo brilhante. Ou um segredo. E Ele deixa passar."',
        notasMestre: 'Á.8, a fresta — e o ponto onde CAI quem entrou pelo túnel do Carp. O Nothic é um encontro SOCIAL antes de tudo: barganha por comida, um item brilhante ou um segredo dito em voz alta. Satisfeito, aponta a oficina do "homem do cajado" e some. Atacado, luta (Olhar Podre: 2d6 necrótico à distância). No ninho dele, sob ossos e bugigangas: a espada TALON (+1) — a primeira arma mágica da campanha. Investigação CD 12 acha o ninho mesmo sem lutar.',
        encontro: [{ nome: 'Nothic', qtd: 1 }],
        saidas: [
          { para: 'm_quartel_bugbear', rotulo: 'Seguir o rastro do "homem do cajado"', aviso: '' },
          { para: 'm_criptas', rotulo: 'Voltar pelas criptas para explorar o resto', aviso: '' },
        ],
      },
      {
        id: 'm_quartel_bugbear', titulo: 'O quartel dos bugbears', tipo: 'encontro',
        npcs: [
          { nome: 'Droop', tipo: 'neutro', descricao: 'Um goblin franzino e assustadiço, criado como servo pelos bugbears que o espancam por esporte; treme num canto do quartel.', notasPrivadas: 'Bloco: Goblin (mas não quer lutar). Se os PJs poupá-lo, VIRA A CASACA na hora: conta que o "chefe do cajado" está na oficina ao fim do corredor e que "os homens bêbados" da sala ao lado não prestam atenção a nada. Pode até guiar o grupo. Covarde leal a quem o tratar bem.' },
        ],
        narracao: 'Uma sala larga de teto baixo cheira a fumaça e carne malpassada. Três bugbears peludos e enormes afiam lâminas junto ao fogo, e um goblin esquálido se encolhe a um canto, tremendo. Os brutos se levantam rosnando — a não ser que o vermelho dos seus mantos os faça hesitar.',
        notasMestre: 'Á.9, a guarda de elite. 3× Bugbear (+ o goblin Droop, que NÃO luta). O combate mais duro do esconderijo — mas evitável: com um manto vermelho vestido, Enganação CD 15 faz os bugbears baixarem a guarda o suficiente para o grupo passar ou pegar o 1º golpe com vantagem. Droop, poupado, entrega o mapa social da masmorra (oficina + sala dos bêbados). ATALHO MORTAL: atacar tudo aos berros aqui desperta o esconderijo inteiro (ver o aviso 💀).',
        encontro: [{ nome: 'Bugbear', qtd: 3 }],
        saidas: [
          { para: 'm_taverna', rotulo: 'Espiar a sala de onde vêm risadas bêbadas', aviso: '' },
          { para: 'm_oficina', rotulo: 'Ir direto à porta com brasão arcano (a oficina)', aviso: '' },
          { para: 'm_alarme', rotulo: 'Atacar tudo de peito aberto, sem disfarce', aviso: 'mortal' },
        ],
      },
      {
        id: 'm_taverna', titulo: 'O antro dos bêbados', tipo: 'encontro',
        narracao: 'Uma câmara improvisada em taverna: tonéis de saque, canecas viradas e quatro mantos vermelhos jogados pelos bancos, rindo alto e já bem tomados de bebida. Levam um tempo cômico para entender que os recém-chegados não são amigos.',
        notasMestre: 'Á.10, sala opcional (mais loot, menos essencial). 4× Bandido, mas BÊBADOS: começam o combate com desvantagem em ataques e nas salvas de Destreza na 1ª rodada, e um pode cair prostrado ao tentar levantar. Sob um tonel: uma bolsa com 3d6×10 pc e uma Poção de Cura. Barulho aqui também pode alertar Iarno na oficina — decida com base em quão estrondoso foi.',
        encontro: [{ nome: 'Bandido', qtd: 4 }],
        saidas: [
          { para: 'm_oficina', rotulo: 'Seguir para a porta com o brasão arcano', aviso: '' },
        ],
      },
      {
        id: 'm_oficina', titulo: 'A oficina do alquimista', tipo: 'narracao',
        narracao: 'Atrás de uma porta marcada por um brasão arcano abre-se um laboratório meticuloso: alambiques borbulhando, prateleiras de frascos rotulados e uma escrivaninha coberta de cartas lacradas. Um rato preto de olhos pequenos e atentos observa vocês do alto de uma estante — e, de repente, dispara guinchando por uma fresta da parede.',
        notasMestre: 'Á.11, o laboratório de Iarno. O rato é o FAMILIAR dele: se escapar (ele o fará, a menos que alguém o abata antes — Percepção alta / iniciativa), avisa o mago, que se prepara ou FOGE pelo túnel dos fundos. Na escrivaninha: as cartas do "Aranha Negra" para o Cajavidro (prova a conexão — pista-chave; a missão de Halia pede entregá-las SEM ler). Frascos: 1 Poção de Cura e 1 frasco de ácido. Decisão: aproximar-se em silêncio (surpreender Iarno) ou arrombar (ele foge avisado).',
        encontro: [], saidas: [
          { para: 'm_cajavidro', rotulo: 'Aproximar-se em silêncio da câmara do chefe', aviso: '' },
          { para: 'm_cajavidro_fuga', rotulo: 'Arrombar a porta e entrar com tudo', aviso: '' },
        ],
      },
      {
        id: 'm_cajavidro', titulo: 'Cajavidro', tipo: 'encontro',
        npcs: [
          { nome: 'Iarno "Cajavidro" Albrek', tipo: 'inimigo', descricao: 'O mago que Sildar procura — e o verdadeiro líder dos Marcarrubra. Elegante, arrogante e traiçoeiro, empunha um cajado de vidro leitoso que reforça sua armadura mágica.', notasPrivadas: 'Bloco: use o Mago (Mage) do bestiário. É Iarno Albrek, plantado em Phandalin pelo Aranha Negra para desestabilizar a vila — a revelação que vai DOER em Sildar. Cajado da Defesa dá +1 CA e escudo arcano. Rende-se quando cai a 8 PV ou menos ("Eu me rendo! Posso ser útil!"). Loot: CAJADO DA DEFESA + 2 pergaminhos (Bola de Fogo, Relâmpago) + as cartas do Aranha Negra.' },
        ],
        narracao: 'A câmara do chefe é quente e forrada de tapeçarias roubadas. De pé junto à lareira, um homem de barba aparada e cajado de vidro leitoso ergue os olhos sem susto: "Então a vila arranjou coragem." O cajado brilha, o ar cintila numa armadura invisível ao redor dele — e a luta começa.',
        notasMestre: 'Á.12, o clímax do capítulo. Iarno = Mago (Mage). Surpreendido (rota silenciosa), começa sem escudo pronto — vantagem grande para o grupo. Ele mira os PJs frágeis com Mísseis Mágicos e Raio Ardente e usa o Cajado da Defesa para se blindar. RENDE-SE a ≤8 PV. DECISÃO-CHAVE: capturá-lo VIVO abre intriga (XP dobrado; ele sabe do Aranha Negra e do Castelo Cragmaw; mas Halia, se ele for preso na vila, o solta em segredo) ou matá-lo encerra limpo. Loot: Cajado da Defesa + 2 pergaminhos + as cartas.',
        encontro: [{ nome: 'Mago (Mage)', qtd: 1 }],
        saidas: [
          { para: 'm_decisao', rotulo: 'Decidir o destino de Iarno e do esconderijo', aviso: '' },
        ],
      },
      {
        id: 'm_cajavidro_fuga', titulo: 'A fuga do Cajavidro', tipo: 'encontro',
        npcs: [
          { nome: 'Iarno "Cajavidro" Albrek', tipo: 'inimigo', descricao: 'Avisado a tempo pelo familiar, o mago recua para o túnel dos fundos lançando magias por cima do ombro, decidido a não ser pego.', notasPrivadas: 'Bloco: Mago (Mage), mas em FUGA — usa a ação para Disparada/Retirada e lança Mãos Mágicas/Névoa para atrapalhar a perseguição. Se escapar, some para a rede do Aranha Negra e vira um inimigo recorrente (reaparece mais tarde). Deixa para trás as cartas e talvez o Cajado da Defesa na pressa (a critério do Mestre). Perseguição: corrida de Destreza (Atletismo) para alcançá-lo antes do túnel.' },
        ],
        narracao: 'A porta cede com estrondo — e o mago já está de pé, o cajado erguido e uma passagem escura se abrindo atrás dele. "Tarde demais!", cospe, disparando um clarão de energia enquanto recua para o túnel. Se quiserem pegá-lo, vai ser na corrida.',
        notasMestre: 'Ramo da rota barulhenta: Iarno foi avisado pelo rato e tenta ESCAPAR. Combate curto de perseguição — se o grupo o encurralar (ataques à distância / redução de deslocamento), captura-o normalmente; se ele alcançar o túnel, FOGE e vira gancho recorrente (a critério do Mestre, deixando as cartas para trás). Não puna a mesa: mesmo com a fuga, o esconderijo cai e a vila é libertada.',
        encontro: [{ nome: 'Mago (Mage)', qtd: 1 }],
        saidas: [
          { para: 'm_decisao', rotulo: 'Assegurar o esconderijo e decidir o rumo', aviso: '' },
        ],
      },
      {
        id: 'm_decisao', titulo: 'A cabeça, as cartas e a lei', tipo: 'social',
        narracao: 'Com os Marcarrubra desfeitos e o Cajavidro no chão — rendido, morto ou fugido —, resta o que fazer com o que vocês encontraram: um mago que serviu ao Aranha Negra, um maço de cartas que prova a conspiração, e uma vila lá fora esperando notícias. Sildar quer justiça e respostas. Halia Thornton quer a cabeça e cada papel da mesa do chefe. As duas coisas não cabem na mesma mão.',
        notasMestre: 'Nó de consequência (não de combate). Amarre as escolhas do Cap. 2A: (1) IARNO VIVO entregue a SILDAR = a Aliança dos Lordes o interroga (pistas do Castelo Cragmaw e do Aranha Negra) — mas Halia depois o solta em segredo (gancho futuro). (2) Cabeça + cartas para HALIA = 100 po e o favor dos Zhentarim, mas você perde as pistas das cartas (a menos que as copie antes — Intuição CD 15 sugere fazê-lo). (3) Matar Iarno e ficar com as cartas = caminho "limpo", pistas preservadas, sem o dinheiro de Halia. Deixe a mesa escolher; ambos os finais são vitória.',
        encontro: [], saidas: [
          { para: 'm_final_lei', rotulo: 'Entregar Iarno/as cartas a Sildar (a lei)', aviso: '' },
          { para: 'm_final_halia', rotulo: 'Fechar o trato com Halia (a sombra)', aviso: '' },
        ],
      },
      {
        id: 'm_final_lei', titulo: 'Phandalin respira', tipo: 'final', resultado: 'vitoria',
        narracao: 'A notícia desce a colina antes de vocês: os Marcarrubra caíram. Portas se abrem, os Dendrar reencontram a vila, e Sildar — o rosto duro ao saber que o "amigo" Iarno era o traidor — aperta a mão de cada um. As cartas confirmam o pior e o melhor: o Aranha Negra manda os goblins, e Gundren está no Castelo Cragmaw. A vila, enfim, dorme sem medo. — Fim do Capítulo 2.',
        notasMestre: 'Vitória "da lei". Recompensas: missões de Linene (50 po) e o que Sildar prometer por Iarno; caminho para o nível 3-4. As cartas ABREM o PH3/PH4: localização do Castelo Cragmaw e o nome Aranha Negra. Ganchos ativos para o Cap. 3 (Teia da Aranha): colar dos Dendrar em Árvore Trovão (Mirna), Velha Coruja (Daran), Agatha (Garaele), orcs do Cume (Harbin), Reidoth (Qelline). PRÓXIMO: importar "Cap. 3A — A Teia da Aranha".',
        encontro: [], saidas: [],
      },
      {
        id: 'm_final_halia', titulo: 'O favor da sombra', tipo: 'final', resultado: 'vitoria',
        narracao: 'No silêncio do câmbio de minério, Halia Thornton conta as moedas e recolhe as cartas com um sorriso fino que não chega aos olhos. "Vocês servem", diz, como quem guarda um trunfo. Os Marcarrubra caíram e Phandalin celebra sem saber a quem deve o favor — mas alguém, agora, tem uma dívida com a rede que Halia representa. — Fim do Capítulo 2.',
        notasMestre: 'Vitória "da sombra" (Zhentarim). Recompensa: 100 po de Halia + o favor (e a coleira) da rede dela; caminho para o nível 3-4. CUSTO: se o grupo entregou as cartas sem copiar, perdeu a pista escrita do Castelo Cragmaw — nesse caso, Sildar/Reidoth/Agatha ainda fornecem o rumo no PH3 (rede de segurança). Se Iarno foi preso e entregue à vila, Halia o solta em segredo (inimigo recorrente). Ganchos do Cap. 3 seguem ativos. PRÓXIMO: importar "Cap. 3A — A Teia da Aranha".',
        encontro: [], saidas: [],
      },
      {
        id: 'm_alarme', titulo: 'O esconderijo desperta', tipo: 'final', resultado: 'derrota',
        narracao: 'Aos berros e sem disfarce, vocês acordam o esconderijo inteiro de uma só vez. Bugbears, bandidos e o clarão das magias de Cajavidro convergem dos corredores ao mesmo tempo, e a masmorra se fecha como um punho. As últimas tochas se apagam sobre o barulho de correntes.',
        notasMestre: 'Só se a mesa insistir no ataque frontal e escandaloso ao quartel dos bugbears. Alternativa clemente e fiel ao tom: em vez de morte, os PJs são subjugados e ACORDAM presos nas jaulas (á.5), ao lado dos Dendrar — podem escapar (Ladinagem/Atletismo CD 13 na fechadura, ou a chave no guarda) e retomar do nó das celas, transformando o desastre em reviravolta. Não encerre a campanha aqui.',
        encontro: [], saidas: [],
      },
    ],
  },
  {
    id: 'modelo_phandelver_teia',
    titulo: 'Mina Perdida de Phandelver — Cap. 3A: A Teia da Aranha',
    limites: { jogadoresMax: 5, nivelMin: 3, nivelMax: 4 },
    noInicial: 't_hub',
    nos: [
      // ====== CAPÍTULO 3A — A TEIA DA ARANHA (sandbox das estradas) ======
      // Adaptação própria e condensada (PH3 do docs/CAMPANHA-PHANDELVER.md).
      // Hub de viagem: 4 destinos independentes; a pista do Castelo Cragmaw
      // (Agatha OU Reidoth) abre o Cap. 3B. Nível 3-4.
      {
        id: 't_hub', titulo: 'As estradas ao redor de Phandalin', tipo: 'social',
        narracao: 'Com os Marcarrubra desfeitos, Phandalin vira um ponto de partida em vez de um beco. Sildar espalha um mapa da região sobre a mesa da Stonehill: a Trilha Triboar cortando as terras selvagens, a Estrada Alta rumo ao leste, e quatro pontos marcados a carvão onde alguém pode saber do paradeiro do Castelo Cragmaw — e de Gundren.',
        notasMestre: 'HUB do capítulo, sandbox aberto: os quatro destinos são independentes e resolvem os ganchos do Cap. 2A. A PISTA do Castelo Cragmaw (que abre o Cap. 3B) sai de DUAS fontes — a banshee Agatha (Conyberry) ou o druida Reidoth (Árvore Trovão); basta uma. Não force ordem nem obrigue a mesa a fazer tudo. Cada viagem entre pontos passa por "Na Trilha Triboar" (encontro aleatório). Quando tiverem a localização, sigam por "Rumo ao Castelo Cragmaw".',
        encontro: [], saidas: [
          { para: 't_viagem', rotulo: 'Pegar a estrada (viajar entre destinos)', aviso: '' },
          { para: 't_agatha', rotulo: 'Conyberry — a banshee Agatha (missão de Garaele)', aviso: '' },
          { para: 't_coruja1', rotulo: 'Poço da Velha Coruja — mortos-vivos (missão de Daran)', aviso: '' },
          { para: 't_arvore1', rotulo: 'Ruínas de Árvore Trovão — o druida e o dragão', aviso: '' },
          { para: 't_cume1', rotulo: 'Cume da Wyvern — o ninho de orcs (missão de Harbin)', aviso: '' },
          { para: 't_rumo', rotulo: 'Seguir ao Castelo Cragmaw (com a localização em mãos)', aviso: '' },
          { para: 't_partir', rotulo: 'Deixar a região e seguir outro rumo', aviso: 'beco' },
        ],
      },
      {
        id: 't_viagem', titulo: 'Na Trilha Triboar', tipo: 'encontro',
        narracao: 'A estrada serpenteia por colinas de mato alto e bosques ralos, léguas de silêncio quebrado só pelo vento. Então o silêncio muda de textura — e algo faminto percebe que vocês passaram por aqui.',
        notasMestre: 'Encontro de viagem (use a cada trecho entre destinos, ou role 1/dia). TABELA (1d8, adapte ao nível): 1-2 bando de Estirge (4-6); 3 Carniçais (3× Carniçal (Ghoul)) rondando; 4 um Ogro solitário; 5 patrulha goblin (4× Goblin) que sabe do castelo (interrogável — pista!); 6 Hobgoblins (3×) com um cartaz de recompensa pela cabeça dos PJs; 7 Orcs (4×) desgarrados do Cume; 8 um Urso-Coruja territorial. O encontro padrão abaixo são Estirges; troque conforme a tabela. Goblins/hobgoblins interrogados (Intimidação CD 15) podem revelar o Castelo Cragmaw.',
        encontro: [{ nome: 'Estirge (Stirge)', qtd: 5 }],
        saidas: [
          { para: 't_hub', rotulo: 'Seguir viagem e voltar ao mapa', aviso: '' },
        ],
      },
      {
        id: 't_agatha', titulo: 'Conyberry e a banshee', tipo: 'social',
        npcs: [
          { nome: 'Agatha', tipo: 'neutro', descricao: 'O espectro de uma feiticeira élfica há muito morta, uma banshee que paira translúcida entre as ruínas de Conyberry; responde a UMA pergunta a quem a tratar com respeito e cortesia.', notasPrivadas: 'NÃO é combate — atacá-la é praticamente suicídio (o Lamento mata). O PENTE DE PRATA da Irmã Garaele (Cap. 2A) é o presente que garante a boa vontade dela: entregue com cortesia, ela responde UMA pergunta. Sem o pente, Persuasão/Diplomacia CD 15. Perguntas úteis: o grimório do mago Arco Suave (missão de Garaele → 3 Poções de Cura + Harpistas) OU a localização do CASTELO CRAGMAW (abre o Cap. 3B). Desrespeito/ameaça = ela some e nunca mais responde.' },
        ],
        narracao: 'As ruínas de Conyberry foram engolidas pela mata anos atrás. Entre paredes tombadas, o ar esfria de repente e uma figura translúcida de mulher élfica se forma no crepúsculo — cabelos flutuando numa brisa que não existe, olhos de poços vazios. Ela espera, em silêncio mortal, para ver se vocês vêm com respeito ou com aço.',
        notasMestre: 'Encontro SOCIAL puro (sem bloco de combate — Agatha não está no bestiário de propósito; ela não é para ser lutada). Cortesia + o pente de prata = uma resposta garantida. É UMA das duas fontes da pista do Castelo Cragmaw. Se a mesa perguntar pelo grimório (missão de Garaele) em vez do castelo, tudo bem — Reidoth (Árvore Trovão) também dá a localização. Recompense a diplomacia; puna a truculência com a informação perdida para sempre.',
        encontro: [], saidas: [
          { para: 't_pista', rotulo: 'Perguntar pela localização do Castelo Cragmaw', aviso: '' },
          { para: 't_hub', rotulo: 'Agradecer e voltar ao mapa', aviso: '' },
        ],
      },
      {
        id: 't_coruja1', titulo: 'O Poço da Velha Coruja', tipo: 'social',
        npcs: [
          { nome: 'Hamun Kost', tipo: 'inimigo', descricao: 'Um mago vermelho de Thay, magro e cadavérico, que ergueu um acampamento entre as ruínas de uma antiga torre para desenterrar segredos necromânticos; comanda uma guarda de mortos.', notasPrivadas: 'Bloco: use o Mago (Mage) do bestiário. NÃO precisa virar combate: Kost é pragmático e não tem briga com o grupo. Se abordado com calma, propõe PAZ — deixa os PJs em troca de o deixarem trabalhar (ou de uma pequena tarefa). Provocado, joga os 12 zumbis à frente e lança magias de longe. Loot no acampamento: ANEL DE PROTEÇÃO (+1 CA e salvas). Completar o gancho de Daran = só relatar o que viram (com ou sem luta).' },
        ],
        narracao: 'Uma torre em ruínas se ergue sobre um poço de pedra antigo, e ao redor dela param, imóveis como estátuas, uma dúzia de cadáveres ambulantes. Entre eles, junto a uma fogueira azulada, um homem de vestes vermelhas e pele acinzentada ergue os olhos sem pressa: "Curiosos. Cheguem — mas escolham bem se é conversa ou combate que procuram."',
        notasMestre: 'Á. do Poço da Velha Coruja (gancho de Daran, Cap. 2A). Kost = Mago (Mage) com 12× Zumbi de guarda. O encontro tem DUAS saídas: negociar (Kost aceita paz — sem luta, e talvez uma dica) ou lutar (os zumbis avançam). Diplomacia/Intuição revela que ele não é o vilão da campanha, só um necromante ocupado. Loot: Anel de Proteção. Completar a missão de Daran = relatar os mortos-vivos (reputação + convite à Ordem da Manopla).',
        encontro: [], saidas: [
          { para: 't_coruja2', rotulo: 'Sacar as armas contra o necromante', aviso: 'mortal' },
          { para: 't_hub', rotulo: 'Negociar a paz e voltar ao mapa', aviso: '' },
        ],
      },
      {
        id: 't_coruja2', titulo: 'A guarda de cadáveres', tipo: 'encontro',
        narracao: 'A um gesto de Kost, a dúzia de mortos desperta de uma vez, cambaleando para a frente com bocas abertas em rosnados secos enquanto o mago recua para as sombras da torre, palavras arcanas fervendo nos lábios.',
        notasMestre: 'Combate duro pela QUANTIDADE (12× Zumbi como muralha) mais o Mago (Mage) atrás. Táticas: os zumbis têm Fortitude Mórbida (podem cair a 1 PV com uma salva de Con) e são lentos — controle de área (fogo, atordoamento) brilha aqui. Kost foge se chegar a ≤10 PV (vira gancho recorrente). Loot: Anel de Proteção + componentes. Se a mesa preferiu a paz, este nó nem acontece.',
        encontro: [{ nome: 'Zumbi', qtd: 12 }, { nome: 'Mago (Mage)', qtd: 1 }],
        saidas: [
          { para: 't_hub', rotulo: 'Recolher o loot e voltar ao mapa', aviso: '' },
        ],
      },
      {
        id: 't_arvore1', titulo: 'Ruínas de Árvore Trovão', tipo: 'encontro',
        narracao: 'A antiga vila de Árvore Trovão foi abandonada há uma geração, quando um vulcão distante cuspiu cinzas sobre ela. Hoje é um esqueleto de casas engolidas por trepadeiras — e por coisas que se movem entre elas: arbustos que caminham em galhos retorcidos e vultos cobertos de cinza que erguem a cabeça ao ouvir passos.',
        notasMestre: 'Entrada das ruínas de Árvore Trovão (a área mais rica do capítulo, ~5 nós internos). Encontro de abertura: 6× Ramo Seco (Twig Blight) que se disfarçam de arbustos (Percepção CD 12 para não ser surpreendido; vulneráveis a FOGO) + 3× Zumbi das Cinzas (soltam nuvem de cinza ao 1º dano: Con CD 10 ou tosse com desvantagem). A vila é um sandbox: Reidoth (o druida) está numa das torres, cultistas ocupam uma casa, aranhas outra, e o dragão Venomfang domina a torre central. AVISE a mesa desde já: há um DRAGÃO aqui — não é para enfrentar de frente no nível 3-4.',
        encontro: [{ nome: 'Ramo Seco (Twig Blight)', qtd: 6 }, { nome: 'Zumbi das Cinzas', qtd: 3 }],
        saidas: [
          { para: 't_reidoth', rotulo: 'Procurar o eremita que dizem morar aqui', aviso: '' },
          { para: 't_aranhas', rotulo: 'Investigar uma casa coberta de teias', aviso: '' },
          { para: 't_cultistas', rotulo: 'Espiar a casa de onde sai fumaça e cânticos', aviso: '' },
        ],
      },
      {
        id: 't_reidoth', titulo: 'Reidoth, o druida', tipo: 'social',
        npcs: [
          { nome: 'Reidoth', tipo: 'aliado', descricao: 'Um druida idoso e ríspido que zela por Árvore Trovão e conhece cada trilha das terras selvagens; ajuda quem respeita a natureza e o desejo dele de expulsar os invasores das ruínas.', notasPrivadas: 'Conhece a localização do CASTELO CRAGMAW E da Caverna do Eco das Ondas (a Mina) — a SEGUNDA fonte da pista (além de Agatha). Em troca, pede ajuda para livrar Árvore Trovão dos invasores: os cultistas E, sobretudo, o dragão Venomfang (ele sugere ESPANTAR o dragão, não matá-lo — sabe que o grupo não tem nível pra isso). É a rede de segurança da pista do castelo: se a mesa maltratou Agatha, Reidoth garante o rumo.' },
        ],
        narracao: 'Numa torre de pedra ainda de pé, um velho de barba emaranhada e olhos de falcão prepara ervas sem se assustar com a chegada de vocês. "Mais gente na minha vila arruinada", resmunga Reidoth. "Se vieram somar aos ladrões e ao lagarto que se meteu na torre grande, podem ir embora. Se vieram tirá-los daqui — aí, sim, conversamos."',
        notasMestre: 'NPC-chave: Reidoth é a SEGUNDA fonte da pista do Castelo Cragmaw (e da própria Mina) — a rede de segurança caso Agatha tenha sido perdida. Ele troca a informação por ajuda contra os invasores. É honesto sobre o dragão: aconselha ESPANTAR Venomfang, não enfrentá-lo. Dá também o rumo da casa dos Dendrar (loot do colar). Use-o como guia sábio da região.',
        encontro: [], saidas: [
          { para: 't_pista', rotulo: 'Aceitar a troca: a localização do castelo', aviso: '' },
          { para: 't_saque', rotulo: 'Pedir onde ficava a casa dos Dendrar', aviso: '' },
          { para: 't_hub', rotulo: 'Voltar ao mapa', aviso: '' },
        ],
      },
      {
        id: 't_aranhas', titulo: 'A casa das teias', tipo: 'encontro',
        narracao: 'Teias grossas como cordas fecham as portas e janelas de uma casa afundada. Lá dentro, na penumbra pegajosa, duas aranhas do tamanho de cães descem dos caibros com as presas gotejando.',
        notasMestre: 'Encontro opcional: 2× Aranha Gigante. Elas usam Teia (restringe: Des CD 11) para prender os PJs no chão pegajoso antes de morder. Bom combate tático de nível 3. Num casulo, os restos de uma vítima anterior guardam algumas moedas e um pergaminho. Ligar esta casa à do dragão pela rua evita passar sob a torre central.',
        encontro: [{ nome: 'Aranha Gigante', qtd: 2 }],
        saidas: [
          { para: 't_cultistas', rotulo: 'Seguir para a casa dos cânticos', aviso: '' },
          { para: 't_saque', rotulo: 'Vasculhar as ruínas em busca da casa dos Dendrar', aviso: '' },
        ],
      },
      {
        id: 't_cultistas', titulo: 'Os cultistas do dragão', tipo: 'encontro',
        npcs: [
          { nome: 'Favric', tipo: 'inimigo', descricao: 'O líder de um punhado de cultistas que vieram a Árvore Trovão adorar o dragão verde e ganhar seu favor; ambicioso, teme o dragão mais do que o admira.', notasPrivadas: 'Bloco: Cultista (mais durão). Se a luta virar contra ele, Favric PROPÕE TRAIÇÃO: entrega os companheiros e some, ou até aponta uma fraqueza do dragão em troca da vida. Não é confiável. Os cultistas servem a Venomfang na torre central.' },
        ],
        narracao: 'Numa casa de teto rachado, meia dúzia de figuras encapuzadas entoa algo diante de um altar improvisado coberto de escamas verdes. Ao verem vocês, sacam adagas — mas o líder, um homem de olhos nervosos, já mede se vale mais lutar ou negociar.',
        notasMestre: 'Encontro: 6× Cultista liderados por Favric. Combate direto, mas com uma válvula social: Favric é covarde e propõe trair os próprios ou dar uma dica sobre o dragão para salvar a pele. Eles cultuam Venomfang; interrogados, confirmam que a "torre grande" é o covil do dragão — reforce o AVISO de não enfrentá-lo de frente.',
        encontro: [{ nome: 'Cultista', qtd: 6 }],
        saidas: [
          { para: 't_dragao', rotulo: 'Encarar a torre central do dragão', aviso: 'mortal' },
          { para: 't_saque', rotulo: 'Recuar e procurar a casa dos Dendrar', aviso: '' },
        ],
      },
      {
        id: 't_dragao', titulo: 'Venomfang, o dragão verde', tipo: 'encontro',
        npcs: [
          { nome: 'Venomfang', tipo: 'inimigo', descricao: 'Um dragão verde jovem que se instalou no alto da torre central de Árvore Trovão; astuto, vaidoso e mortalmente venenoso. Muito além da força de um grupo de nível 3-4.', notasPrivadas: 'Bloco: Dragão Verde Jovem (Venomfang) — traço de AVISO AO MESTRE no bestiário. NÃO é um combate a vencer no braço: é um teste de esperteza. Ele PREFERE conversar (é vaidoso) e pode deixar os PJs irem se bajulado ou se lhe oferecerem algo/informação. Se lutar, usa o Sopro de Veneno e voa; FOGE quando cai a ~50% dos PV (não luta até a morte). Espantá-lo (a pedido de Reidoth) já é vitória. Enfrentá-lo de peito aberto é TPK provável — daí o aviso 💀.' },
        ],
        narracao: 'A torre central se abre num salão sem teto, e o cheiro adocicado de veneno satura o ar. Enrolado sobre um monte de escombros e algumas moedas, um dragão de escamas verde-musgo ergue a cabeça serpentina e sorri com todos os dentes: "Visitantes. Que raro. Falem depressa por que não deveria devorá-los — eu adoro uma boa razão."',
        notasMestre: 'ENCONTRO DE AVISO 💀: Venomfang é forte demais para o nível 3-4 num combate direto (provável TPK). O caminho certo é SOCIAL/tático: bajular (ele é vaidoso), negociar passagem, ou espantá-lo com esperteza/fogo controlado (o objetivo de Reidoth). Se insistirem em lutar, ele foge a ~50% PV — não persiga. Deixe claro pela fala do dragão e pelo aviso que fugir/negociar É a vitória aqui. Recompensa por espantá-lo: gratidão de Reidoth + saque da torre.',
        encontro: [{ nome: 'Dragão Verde Jovem (Venomfang)', qtd: 1 }],
        saidas: [
          { para: 't_saque', rotulo: 'Espantar/despistar o dragão e saquear as ruínas', aviso: '' },
          { para: 't_hub', rotulo: 'Fugir de Árvore Trovão com vida', aviso: '' },
        ],
      },
      {
        id: 't_saque', titulo: 'O que Árvore Trovão guardava', tipo: 'narracao',
        narracao: 'Com os invasores dispersos, as ruínas se abrem para quem sabe procurar. Na antiga casa dos tecelões, sob uma tábua solta do assoalho, brilha um colar de esmeraldas — o tesouro que Mirna Dendrar descreveu. Entre os escombros da torre e das casas, outras coisas valiosas escaparam do fogo e do tempo.',
        notasMestre: 'Nó de recompensa de Árvore Trovão. Tesouros (adapte ao que a mesa alcançou): COLAR DE ESMERALDAS dos Dendrar (~200 po — devolver a Mirna fecha o gancho emocional com uma boa recompensa/reputação); o machado HEW (+1, dano máximo vs. plantas — perfeito contra Ramos Secos); e pergaminhos arcanos. Reidoth, se ajudado, confirma o rumo do castelo aqui também. Gere loot extra pelo montador/Fase 13.',
        encontro: [], saidas: [
          { para: 't_hub', rotulo: 'Voltar ao mapa com o saque', aviso: '' },
        ],
      },
      {
        id: 't_cume1', titulo: 'A subida do Cume da Wyvern', tipo: 'social',
        narracao: 'O Cume da Wyvern é um morro rochoso e pelado que se ergue sobre a Trilha Triboar. A meia encosta, o cheiro de fumaça e carne assada denuncia um acampamento — e, recortada contra o céu, a silhueta de uma sentinela orc que ainda não viu vocês.',
        notasMestre: 'Aproximação do ninho de orcs (missão de Harbin, 100 po). Decisão tática: a sentinela orc dá o alarme se avistar o grupo (Furtividade em grupo CD 13 para neutralizá-la em silêncio, ou um tiro certeiro antes do grito). Surpreender o acampamento vale MUITO — sem o alarme, os PJs pegam os orcs sem o ogro pronto. Barulho aqui = todos de pé ao mesmo tempo.',
        encontro: [], saidas: [
          { para: 't_cume2', rotulo: 'Atacar o acampamento (com ou sem surpresa)', aviso: '' },
        ],
      },
      {
        id: 't_cume2', titulo: 'O ninho de orcs', tipo: 'encontro',
        npcs: [
          { nome: 'Brughor Machado-Mordedor', tipo: 'inimigo', descricao: 'O chefe orc do Cume da Wyvern, um bruto de cicatrizes e machado lascado que mantém um ogro na coleira como aríete vivo.', notasPrivadas: 'Bloco: use o Orc mais parrudo do grupo como Brughor (PV no máximo; Investida Agressiva). O aliado dele é Gog, o ogro. Se a sentinela deu o alarme, todos entram juntos (duro); se não, o ogro pode estar dormindo — remova-o da 1ª rodada. Derrotá-los completa a missão de Harbin (100 po).' },
          { nome: 'Gog', tipo: 'inimigo', descricao: 'Um ogro enorme e estúpido que Brughor mantém acorrentado e mal-alimentado para soltar contra intrusos.', notasPrivadas: 'Bloco: Ogro. Lento mas devastador no acerto; concentre fogo ou controle-o (derrubar/enredar). Solto no meio do acampamento se houve alarme.' },
        ],
        narracao: 'O acampamento é um círculo de peles fedorentas e fogueiras ao redor de uma caverna rasa. Meia dúzia de orcs se levanta rosnando de machado em punho, e das sombras da gruta vem um urro grave: uma corrente estala e um ogro do tamanho de uma carroça se põe de pé.',
        notasMestre: 'Combate-clímax da região (missão de Harbin): 6× Orc + o ogro Gog. Brughor (o orc chefe) lidera com Investida Agressiva. Se os PJs neutralizaram a sentinela (t_cume1), começam com surpresa e o ogro fora da 1ª rodada — diferença enorme. Loot do chefe: moedas, um item marcial (gere pela Fase 13). Vitória = 100 po de Harbin e a estrada Triboar mais segura.',
        encontro: [{ nome: 'Orc', qtd: 6 }, { nome: 'Ogro', qtd: 1 }],
        saidas: [
          { para: 't_hub', rotulo: 'Reclamar a recompensa e voltar ao mapa', aviso: '' },
        ],
      },
      {
        id: 't_pista', titulo: 'O rumo do Castelo Cragmaw', tipo: 'narracao',
        narracao: 'A informação, enfim, se encaixa: o Castelo Cragmaw fica escondido nas profundezas da Floresta Neverwinter, a leste, uma fortaleza élfica em ruínas tomada pelos goblins Cragmaw. É lá que o "Aranha Negra" mandou levar Gundren — e o mapa da Mina Perdida que ele carrega.',
        notasMestre: 'Consolidação da pista (vinda de Agatha, de Reidoth, ou de goblins/hobgoblins interrogados na trilha). A partir daqui a mesa PODE fechar o capítulo e marchar ao castelo — ou voltar ao hub para resolver as outras missões antes. Não obrigue a completar tudo. Sugira descanso longo e conferir nível (3-4) antes do Cap. 3B.',
        encontro: [], saidas: [
          { para: 't_rumo', rotulo: 'Marchar ao Castelo Cragmaw agora', aviso: '' },
          { para: 't_hub', rotulo: 'Voltar ao mapa para resolver pendências', aviso: '' },
        ],
      },
      {
        id: 't_rumo', titulo: 'A leste, para a Floresta Neverwinter', tipo: 'final', resultado: 'vitoria',
        narracao: 'Com a localização do Castelo Cragmaw enfim conhecida e as terras selvagens um pouco mais seguras às vossas costas, vocês pegam a estrada para leste. A Floresta Neverwinter cresce escura no horizonte, e em algum lugar sob as suas copas Gundren Rockseeker ainda espera — junto do mapa que pode mudar o destino de todos. — Fim do Capítulo 3A.',
        notasMestre: 'Vitória do Cap. 3A. XP: caminho para o nível 4 (o montador de encontros ajuda a calibrar). Recompensas acumuladas dos destinos: Anel de Proteção (Velha Coruja), colar dos Dendrar + Hew (Árvore Trovão), 100 po (Cume/Harbin), 3 Poções de Cura + Harpistas (Agatha/Garaele). Pistas ativas para o Cap. 3B: a localização e as defesas do Castelo Cragmaw. PRÓXIMO: importar "Cap. 3B — Castelo Dentefino".',
        encontro: [], saidas: [],
      },
      {
        id: 't_partir', titulo: 'As terras que ficaram para trás', tipo: 'final', resultado: 'neutro',
        narracao: 'Vocês decidem que os problemas da região não são os de vocês e pegam outro rumo. Phandalin, os Dendrar, o velho Daran e o próprio Gundren desaparecido encolhem no retrovisor — enquanto, na Floresta Neverwinter, o Aranha Negra continua a puxar seus fios, um pouco mais perto da Mina Perdida a cada dia.',
        notasMestre: 'Beco intencional, não punição: mostra o custo de abandonar a busca por Gundren. Retomável a qualquer momento pelo hub das estradas — os destinos continuam lá. Se a mesa quiser mesmo outra direção, cada destino (Agatha, Velha Coruja, Árvore Trovão, Cume) funciona como aventura independente.',
        encontro: [], saidas: [],
      },
    ],
  },
  {
    id: 'modelo_phandelver_castelo',
    titulo: 'Mina Perdida de Phandelver — Cap. 3B: Castelo Dentefino',
    limites: { jogadoresMax: 5, nivelMin: 3, nivelMax: 4 },
    noInicial: 'k_aproximacao',
    nos: [
      // ====== CAPÍTULO 3B — CASTELO DENTEFINO (Castelo Cragmaw) ======
      // Adaptação própria e condensada (PH4 do docs/CAMPANHA-PHANDELVER.md).
      // Fortaleza élfica em ruínas tomada pelos goblins Cragmaw; resgate de
      // Gundren e do mapa da Mina. Nível 3-4.
      {
        id: 'k_aproximacao', titulo: 'O Castelo Dentefino', tipo: 'social',
        narracao: 'No coração da Floresta Neverwinter, um castelo élfico em ruínas se ergue entre as árvores — sete torres, três já desmoronadas, muros cobertos de hera e de sentinelas goblin. Chama-se Castelo Dentefino, e em algum lugar lá dentro está Gundren Rockseeker, prisioneiro do Rei Grol e do mapa que todos cobiçam.',
        notasMestre: 'Nó de decisão de abordagem. Três entradas com trade-off: (a) o PORTÃO principal (á.1) — direto, mas os arqueiros goblin veem tudo e soam alarme; (b) a PORTA lateral (Des/Ladinagem CD 15 para forçar em silêncio) — cai num corredor menos vigiado; (c) uma TORRE em ruínas com uma lona pintada disfarçando um buraco — furtiva, mas exige escalada (Atletismo CD 12). Reconhecimento prévio (Reidoth/goblins interrogados no Cap. 3A) dá o mapa das torres. Descanso longo antes é recomendado.',
        encontro: [], saidas: [
          { para: 'k_portao', rotulo: 'Forçar o portão principal', aviso: '' },
          { para: 'k_lateral', rotulo: 'Arrombar a porta lateral em silêncio', aviso: '' },
          { para: 'k_torre', rotulo: 'Escalar a torre em ruínas com a lona falsa', aviso: '' },
        ],
      },
      {
        id: 'k_portao', titulo: 'Os arqueiros do portão', tipo: 'encontro',
        narracao: 'O portão emperrado range alto ao ceder, e de duas seteiras acima quatro goblins já engatam flechas, guinchando o alarme para o resto do castelo. Há barris e escombros no pátio para quem quiser cobertura.',
        notasMestre: 'Á.3, a entrada barulhenta. 4× Goblin em posição elevada (meia-cobertura: +2 CA) que SOAM ALARME na 1ª rodada — o castelo inteiro fica em alerta (os encontros seguintes começam prontos). Cobertura no pátio ajuda a fechar distância. É a rota mais dura, mas direta. Tomada a guarita, o alarme cessa.',
        encontro: [{ nome: 'Goblin', qtd: 4 }],
        saidas: [
          { para: 'k_corredor', rotulo: 'Entrar nos corredores do castelo', aviso: '' },
        ],
      },
      {
        id: 'k_lateral', titulo: 'A porta lateral', tipo: 'encontro',
        narracao: 'A porta lateral cede com um estalo abafado para um corredor estreito onde três goblins jogam ossos numa fresta de luz. Levam um susto — e a vantagem é de quem reagir primeiro.',
        notasMestre: 'Á.4, entrada mais discreta (recompensa a Ladinagem CD 15). 3× Goblin desprevenidos: Furtividade CD 13 concede surpresa e a chance de silenciá-los antes do alarme. Manter o silêncio aqui é ouro — os chefes lá dentro não ficam a postos. Barulho ainda alerta a sala vizinha.',
        encontro: [{ nome: 'Goblin', qtd: 3 }],
        saidas: [
          { para: 'k_corredor', rotulo: 'Avançar pelos corredores', aviso: '' },
        ],
      },
      {
        id: 'k_torre', titulo: 'A torre da lona falsa', tipo: 'social',
        narracao: 'A torre nordeste é um toco de pedra sem teto — mas uma lona pintada com pedras e musgo esconde, de cima, uma abertura larga no piso. Descer por ela leva a um recanto empoeirado do castelo que ninguém vigia há tempos.',
        notasMestre: 'Á. da torre em ruínas: a entrada FURTIVA (Atletismo CD 12 para escalar/descer com corda). Sem combate na entrada — cai num corredor lateral longe dos guardas. É a melhor rota para quem quer surpreender o Rei Grol: nenhum alarme, nenhuma guarda na entrada. Recompense a esperteza de reconhecer a lona (Percepção/Investigação CD 12).',
        encontro: [], saidas: [
          { para: 'k_corredor', rotulo: 'Descer ao interior silencioso do castelo', aviso: '' },
        ],
      },
      {
        id: 'k_corredor', titulo: 'Os corredores tortos', tipo: 'narracao',
        narracao: 'Por dentro, o Castelo Dentefino é um labirinto de corredores rachados e salões meio desabados, ecoando com passos, tambores distantes e o cheiro de fumaça de goblin. Três caminhos se abrem: um salão iluminado à frente, uma passagem escura à esquerda, e uma capela profanada à direita.',
        notasMestre: 'Hub interno do castelo. As rotas se cruzam (o grafo permite chegar ao Rei Grol por vários caminhos): o salão grande (á.7, Yegg), a passagem do Grick (á.8, emboscada do teto), a capela do falso deus (á.9, Lhupo). Deixe a mesa escolher; todos convergem para os aposentos do Rei Grol. Se o alarme soou no portão, os grupos podem se reforçar entre si.',
        encontro: [], saidas: [
          { para: 'k_hobgoblins', rotulo: 'Passagem à esquerda (vozes disciplinadas)', aviso: '' },
          { para: 'k_grick', rotulo: 'Corredor escuro e úmido', aviso: '' },
          { para: 'k_santuario', rotulo: 'Capela profanada à direita', aviso: '' },
        ],
      },
      {
        id: 'k_hobgoblins', titulo: 'A guarda hobgoblin', tipo: 'encontro',
        narracao: 'Ao contrário dos goblins bagunceiros, os quatro hobgoblins deste posto estão em formação, armaduras afiveladas e lâminas prontas. Combatem com disciplina militar, cobrindo uns aos outros.',
        notasMestre: 'Á.6. 4× Hobgoblin — mais duros e táticos que goblins (Vantagem Marcial: +2d6 quando um aliado está adjacente ao alvo). Lutam em formação; separá-los reduz muito o dano. Guardam um baú com a paga da guarnição e uma chave da capela. Vencer aqui abre o salão do Yegg.',
        encontro: [{ nome: 'Hobgoblin', qtd: 4 }],
        saidas: [
          { para: 'k_salao', rotulo: 'Avançar para o salão iluminado', aviso: '' },
        ],
      },
      {
        id: 'k_salao', titulo: 'O salão de Yegg', tipo: 'encontro',
        npcs: [
          { nome: 'Yegg', tipo: 'inimigo', descricao: 'Um goblin gordo e barulhento que se proclama "senhor do salão" e comanda um bando de capangas menores à base de gritos e chibatadas.', notasPrivadas: 'Bloco: use o Goblin Mestre (Goblin Boss). É um valentão: se cair, TODO o bando de goblins comuns perde a moral e FOGE (ou se rende). Concentrar fogo nele encurta o combate. Guarda comida roubada e algumas moedas.' },
        ],
        narracao: 'O grande salão do castelo virou refeitório goblin: fogueiras no chão de mármore rachado, ossos por toda parte e sete goblins ao redor de um brutamontes gordo que berra ordens de uma cadeira de rei improvisada. "INTRUSOS! Peguem eles!"',
        notasMestre: 'Á.7. 7× Goblin + Yegg (Goblin Mestre). Encontro de MASSA, mas frágil na moral: derrubado Yegg, os goblins comuns fogem ou se rendem — recompense quem focar o chefe. Muito espaço para controle de área. Deste salão dá para ir ao corredor do Grick ou seguir direto aos aposentos do Rei Grol.',
        encontro: [{ nome: 'Goblin', qtd: 7 }, { nome: 'Goblin Mestre (Goblin Boss)', qtd: 1 }],
        saidas: [
          { para: 'k_grick', rotulo: 'Seguir por um corredor úmido lateral', aviso: '' },
          { para: 'k_grol_aprox', rotulo: 'Rumar aos aposentos do Rei Grol', aviso: '' },
        ],
      },
      {
        id: 'k_grick', titulo: 'A coisa no teto', tipo: 'encontro',
        narracao: 'Um corredor úmido e escuro escorre água pelas paredes. Bem no meio dele, algo estala acima — tarde demais: uma criatura tentacular da cor da pedra despenca do teto onde estava camuflada, tentáculos chicoteando.',
        notasMestre: 'Á.8. 1× Grick emboscando do teto (camuflado: Percepção CD 15 para não ser surpreendido; resistência a dano não-mágico). Perigoso pela surpresa e pelos multiataques de tentáculo; luz e dano mágico ajudam. Não guarda tesouro — é um predador solitário que ocupou a passagem. Sobreviver abre a capela ou os aposentos do rei.',
        encontro: [{ nome: 'Grick', qtd: 1 }],
        saidas: [
          { para: 'k_santuario', rotulo: 'Seguir para a capela profanada', aviso: '' },
          { para: 'k_grol_aprox', rotulo: 'Rumar aos aposentos do Rei Grol', aviso: '' },
        ],
      },
      {
        id: 'k_santuario', titulo: 'A capela do falso deus', tipo: 'encontro',
        npcs: [
          { nome: 'Lhupo', tipo: 'inimigo', descricao: 'Um goblin xamã de olhos esbugalhados que se diz profeta de um "deus" que só ele ouve; usa a fé dos capangas para mandar neles.', notasPrivadas: 'Bloco: use o Goblin Mestre (Goblin Boss). Prepara uma EMBOSCADA atrás do altar: os goblins surgem quando os PJs se aproximam da relíquia. Lhupo blefa que o "deus" protege o castelo — Intuição CD 12 desmonta o teatro. Guarda oferendas roubadas (moedas, uma gema).' },
        ],
        narracao: 'Uma antiga capela élfica foi profanada em altar de ossos e velas de sebo. Diante dele, um goblin de mantos esfarrapados murmura preces a algo invisível — e, ao ouvir passos, ergue a cabeça com um sorriso torto enquanto sombras se mexem atrás das colunas.',
        notasMestre: 'Á.9. Lhupo (Goblin Mestre) + 2× Goblin em emboscada atrás do altar/colunas (Percepção CD 13 para não ser pego). Combate curto; Lhupo foge se a coisa desandar. A relíquia élfica do altar (Investigação) vale algumas moedas e pode ser um item menor. Daqui parte um corredor guardado rumo ao Rei Grol.',
        encontro: [{ nome: 'Goblin Mestre (Goblin Boss)', qtd: 1 }, { nome: 'Goblin', qtd: 2 }],
        saidas: [
          { para: 'k_corredor_fundo', rotulo: 'Seguir o corredor guardado aos fundos', aviso: '' },
        ],
      },
      {
        id: 'k_corredor_fundo', titulo: 'O corredor dos aposentos', tipo: 'encontro',
        narracao: 'Dois hobgoblins fazem guarda diante de uma porta reforçada de onde vêm vozes abafadas. Um deles, ao ver vocês, recua gritando para dentro — indo avisar quem quer que mande aqui.',
        notasMestre: 'Á.12, a antecâmara do Rei Grol. 2× Hobgoblin de guarda; se o combate demorar, UM deles corre avisar Grol (que então usa Gundren como escudo e prepara a emboscada — ver k_grol). Ataques à distância / silenciar rápido evita o aviso. Uma porta lateral leva à jaula do urso-coruja (á.13).',
        encontro: [{ nome: 'Hobgoblin', qtd: 2 }],
        saidas: [
          { para: 'k_ursocoruja', rotulo: 'Abrir a porta lateral de onde vêm rosnados', aviso: '' },
          { para: 'k_grol_aprox', rotulo: 'Ir direto à porta reforçada do rei', aviso: '' },
        ],
      },
      {
        id: 'k_ursocoruja', titulo: 'A fera na jaula', tipo: 'social',
        narracao: 'Uma jaula de ferro ocupa esta câmara lateral, e dentro dela range um monstro de penas e pelo — corpo de urso, cabeça de coruja, olhos furiosos de fome. Os goblins o mantêm faminto para soltar contra invasores, mas a tranca também pode ser aberta... na direção deles.',
        notasMestre: 'Á.13. 1× Urso-Coruja (Owlbear) enjaulado e faminto. TRÊS opções: deixá-lo em paz (evitar a jaula), acalmá-lo com carne (Adestrar Animais CD 15 — pode virar uma distração a favor), ou SOLTÁ-LO estrategicamente para atacar os goblins/o Rei Grol (drama excelente, mas imprevisível — a fera não distingue amigos). Combatê-lo à toa é desperdício de recursos antes do chefe.',
        encontro: [{ nome: 'Urso-Coruja (Owlbear)', qtd: 1 }],
        saidas: [
          { para: 'k_grol_aprox', rotulo: 'Seguir à porta reforçada do Rei Grol', aviso: '' },
        ],
      },
      {
        id: 'k_grol_aprox', titulo: 'Diante da porta do Rei', tipo: 'narracao',
        npcs: [
          { nome: 'Gundren Rockseeker', tipo: 'aliado', descricao: 'O anão que começou tudo isto, agora prisioneiro do Rei Grol — espancado, acorrentado, mas vivo, e ainda guardando de cor o caminho para a Mina.', notasPrivadas: 'Refém do Rei Grol na câmara à frente. Grol o usa como ESCUDO VIVO no combate. Resgatado, revela que o "Aranha Negra" é um drow chamado Nezznar que quer a Forja das Magias da Mina; guia o grupo à Caverna do Eco das Ondas. MESMO SE O MAPA SE PERDER, Gundren sabe o caminho de memória (rede de segurança).' },
        ],
        narracao: 'Atrás da porta reforçada, uma voz grave ronca ordens e, entre elas, o gemido abafado de um anão. É aqui: os aposentos do Rei Grol, e com ele o prisioneiro Gundren Rockseeker. Do outro lado, quem entrar vai encontrar o chefe pronto — e talvez não sozinho.',
        notasMestre: 'Antecâmara do clímax. Se o alarme soou ou um guarda avisou, Grol está de pé com Gundren como escudo e a emboscada armada (Vyerith posicionado). Se o grupo chegou em silêncio, pode SURPREENDER — vantagem enorme. Ofereça um último respiro (curar, planejar) antes de abrir a porta.',
        encontro: [], saidas: [
          { para: 'k_grol', rotulo: 'Arrombar a porta e enfrentar o Rei Grol', aviso: '' },
        ],
      },
      {
        id: 'k_grol', titulo: 'O Rei Grol', tipo: 'encontro',
        npcs: [
          { nome: 'Rei Grol', tipo: 'inimigo', descricao: 'O enorme bugbear que reina sobre os Cragmaw, brutal e astuto o bastante para usar o prisioneiro como escudo. Serve ao Aranha Negra — por medo, não por lealdade.', notasPrivadas: 'Bloco: use o Rei Grol (Bugbear) do bestiário (chefe). Segura Gundren à frente como ESCUDO VIVO: ataques que erram o rei por pouco podem acertar o anão (crie tensão, mas não mate Gundren por acaso — dê salvas). Luta com um lobo de estimação. O mapa da Mina está sob o colchão dele.' },
          { nome: 'Vyerith', tipo: 'inimigo', descricao: 'Um "mensageiro drow" do Aranha Negra que observa da sombra — na verdade um doppelganger disfarçado, pronto a trair qualquer lado que perca.', notasPrivadas: 'Bloco: use o Doppelganger do bestiário. Finge ser um enviado do Aranha Negra. Se Grol começa a perder, Vyerith APUNHALA pelas costas (a quem estiver ganhando) e tenta MATAR Gundren e fugir com o mapa para Nezznar. Revelado (Intuição CD 15 ou ao mudar de forma), vira o inimigo mais perigoso da sala. Pode escapar para reaparecer na Caverna (Cap. 4).' },
        ],
        narracao: 'A porta escancara para uma câmara dominada por um bugbear colossal de coroa improvisada — o Rei Grol — que ergue Gundren acorrentado à sua frente como um escudo de carne. A um canto, um lobo rosna, e um mensageiro encapuzado de pele cinzenta observa tudo em silêncio, calculando de que lado vai valer mais a pena estar.',
        notasMestre: 'CLÍMAX do capítulo. Rei Grol (Bugbear chefe) + 1× Lobo + Vyerith (Doppelganger). Complicações: (1) Grol usa Gundren como escudo vivo — cuidado com ataques em área e erros perigosos (dê a Gundren salvas/CA decente; a tensão é o ponto, não a morte); (2) Vyerith TRAI o lado perdedor — se Grol cai, ataca os PJs e tenta fugir com o mapa e matar Gundren. Se soltaram o urso-coruja (á.13), ele pode irromper aqui. Mapa da Mina: sob o colchão de Grol (Investigação CD 10).',
        encontro: [{ nome: 'Rei Grol (Bugbear)', qtd: 1 }, { nome: 'Lobo', qtd: 1 }, { nome: 'Doppelganger', qtd: 1 }],
        saidas: [
          { para: 'k_resgate', rotulo: 'Libertar Gundren e procurar o mapa', aviso: '' },
        ],
      },
      {
        id: 'k_resgate', titulo: 'As correntes de Gundren', tipo: 'social',
        narracao: 'Caído o Rei Grol, vocês arrebentam as correntes de Gundren. O anão, machucado mas inteiro, aperta a mão de cada um com lágrimas nos olhos — e a primeira pergunta dele é sempre a mesma: "O mapa. Vocês têm o mapa?" Sob o colchão imundo do rei, um pergaminho enrolado espera; se Vyerith fugiu com ele, resta a memória de Gundren.',
        notasMestre: 'Desfecho do resgate. Duas situações: (a) o MAPA foi recuperado (sob o colchão) — segue limpo para a Mina; (b) Vyerith FUGIU com o mapa — sem drama: Gundren conhece o caminho de cor (rede de segurança) e a perseguição a Vyerith vira gancho na Caverna. Gundren revela: o Aranha Negra é o drow NEZZNAR, que quer a Forja das Magias da Caverna do Eco das Ondas. Descanso longo antes do capítulo final.',
        encontro: [], saidas: [
          { para: 'k_final_mapa', rotulo: 'Partir com Gundren E o mapa em mãos', aviso: '' },
          { para: 'k_final_memoria', rotulo: 'Partir com Gundren (mapa perdido para Vyerith)', aviso: '' },
        ],
      },
      {
        id: 'k_final_mapa', titulo: 'O caminho para a Mina', tipo: 'final', resultado: 'vitoria',
        narracao: 'Com Gundren livre e o mapa da Caverna do Eco das Ondas enfim em mãos, o objetivo de toda a jornada deixa de ser um rumor: a Mina Perdida de Phandelver existe, e vocês sabem como chegar. Só falta o passo mais perigoso de todos — e o drow Nezznar, o Aranha Negra, já está lá dentro, esperando. — Fim do Capítulo 3.',
        notasMestre: 'Vitória plena do Cap. 3B. Recompensas: o tesouro de Grol + o MAPA. XP: caminho para o nível 4-5 antes do final. Gundren agora é aliado/guia. Gancho para o Cap. 4: a Caverna do Eco das Ondas e o confronto com Nezznar (e talvez Vyerith, se fugiu antes). PRÓXIMO: importar "Cap. 4 — Caverna Onda Eco".',
        encontro: [], saidas: [],
      },
      {
        id: 'k_final_memoria', titulo: 'A memória de Gundren', tipo: 'final', resultado: 'vitoria',
        narracao: 'O mapa se foi nas mãos do impostor Vyerith, mas Gundren bate na própria têmpora com um sorriso cansado: "O caminho tá aqui, e ninguém rouba isso." Livre e vingado do cativeiro, o anão promete guiar vocês à Caverna do Eco das Ondas de memória — sabendo que Nezznar, e talvez o traidor fugitivo, chegarão lá antes. — Fim do Capítulo 3.',
        notasMestre: 'Vitória alternativa (mapa perdido): NÃO é derrota — Gundren guia de cor. Vyerith fugiu com o mapa para Nezznar e reaparece na Caverna (Cap. 4) como inimigo, dando urgência à corrida. Recompensas do castelo seguem valendo. PRÓXIMO: importar "Cap. 4 — Caverna Onda Eco".',
        encontro: [], saidas: [],
      },
    ],
  },
  {
    id: 'modelo_phandelver_caverna',
    titulo: 'Mina Perdida de Phandelver — Cap. 4: Caverna do Eco das Ondas',
    limites: { jogadoresMax: 5, nivelMin: 4, nivelMax: 5 },
    noInicial: 'w_entrada',
    nos: [
      // ====== CAPÍTULO 4 — CAVERNA DO ECO DAS ONDAS (final) ======
      // Adaptação própria e condensada (PH5 do docs/CAMPANHA-PHANDELVER.md).
      // A Mina Perdida de Phandelver e a Forja das Magias; clímax contra
      // Nezznar, o Aranha Negra. Nível 4-5.
      {
        id: 'w_entrada', titulo: 'A boca da mina', tipo: 'social',
        npcs: [
          { nome: 'Gundren Rockseeker', tipo: 'aliado', descricao: 'Guia o grupo até a entrada da mina que a família buscou a vida inteira — e ali encontra a pior das notícias.', notasPrivadas: 'Junto à entrada jaz o corpo de THARDEN, um dos irmãos de Gundren, morto pelos capangas de Nezznar. Gundren fica arrasado mas determinado; o terceiro irmão, NUNDRO, pode estar vivo lá dentro (á.20). Gundren espera na entrada (não entra na masmorra — é o objetivo emocional, não um combatente).' },
        ],
        narracao: 'Após dias de viagem, o mapa leva a uma fenda na encosta de um vale esquecido: a Caverna do Eco das Ondas, a lendária Mina Perdida de Phandelver. Mas a alegria de Gundren morre na garganta — logo à entrada, caído sobre as pedras, está o corpo de seu irmão Tharden. Alguém chegou antes. Lá dentro, o rumor de água e o cheiro de magia antiga esperam.',
        notasMestre: 'Abertura de peso emocional (o corpo de Tharden). Gundren fica na entrada, seguro. Estabeleça o tom: esta é a masmorra FINAL, maior e mais mortal — Nezznar (o Aranha Negra) e seus capangas já estão dentro, indo para a Forja das Magias. A caverna é um sandbox de ~20 áreas; a ordem é livre, mas todos os caminhos convergem para o templo de Nezznar (á.19). Sugira nível 4-5 antes de descer.',
        encontro: [], saidas: [
          { para: 'w_gosma', rotulo: 'Entrar na mina', aviso: '' },
        ],
      },
      {
        id: 'w_gosma', titulo: 'A gosma no túnel', tipo: 'encontro',
        narracao: 'O primeiro túnel escorre umidade. Do teto pinga algo que não é água: uma massa gelatinosa cor de âmbar se derrama de uma fenda e começa a rastejar atrás de vocês, silenciosa e faminta, marcando a pedra por onde passa.',
        notasMestre: 'Á.2. 1× Gosma Ocre (Ochre Jelly): DIVIDE-SE em duas menores quando sofre dano CORTANTE ou elétrico (não a corte!) — fogo e concussão a matam limpo. Lenta, mas persegue; pode virar uma ameaça de fundo que segue o grupo pela masmorra se não for destruída. Corrói metal (armas/armaduras deixadas em contato).',
        encontro: [{ nome: 'Gosma Ocre (Ochre Jelly)', qtd: 1 }],
        saidas: [
          { para: 'w_estirges', rotulo: 'Seguir por um poço de onde vem um zumbido', aviso: '' },
          { para: 'w_cofre', rotulo: 'Desviar para uma câmara lateral fechada', aviso: '' },
        ],
      },
      {
        id: 'w_cofre', titulo: 'O cofre dos mineiros', tipo: 'narracao',
        narracao: 'Uma câmara lateral guarda os restos de um escritório de mineração: prateleiras podres, ferramentas enferrujadas e um baú de ferro semienterrado no entulho, milagrosamente intacto depois de tantos anos.',
        notasMestre: 'Á.5, nó utilitário (recompensa por explorar). O baú (Ladinagem CD 13 ou arrombar) guarda o pagamento antigo dos mineiros: ~600 pc, 180 pp, 90 pe e 60 po, além de uma gema ou item menor (gere pela Fase 13). Sem perigo — respiro entre combates.',
        encontro: [], saidas: [
          { para: 'w_esqueletos', rotulo: 'Seguir pelo corredor principal', aviso: '' },
        ],
      },
      {
        id: 'w_estirges', titulo: 'O poço das estirges', tipo: 'encontro',
        narracao: 'Um poço vertical sobe para a escuridão, e as paredes fervilham: uma nuvem de estirges — parasitas alados do tamanho de punhos — desce zumbindo, ávida por sangue quente.',
        notasMestre: 'Á.3. 10× Estirge que atacam em enxame e AGARRAM (drenam sangue por rodada até se saciar e voar). Perigosas em número contra PJs frágeis; controle de área e ataques rápidos dispersam o enxame. Passagens levam à câmara dos esqueletos e ao lago subterrâneo.',
        encontro: [{ nome: 'Estirge (Stirge)', qtd: 10 }],
        saidas: [
          { para: 'w_esqueletos', rotulo: 'Seguir os trilhos de minério enferrujados', aviso: '' },
          { para: 'w_lago', rotulo: 'Descer rumo ao som de água parada', aviso: '' },
        ],
      },
      {
        id: 'w_esqueletos', titulo: 'Os mineiros mortos', tipo: 'encontro',
        narracao: 'Uma galeria desabada está juncada de ossos com picaretas ainda nas mãos — os mineiros que morreram aqui quando a mina caiu. Ao passo de vocês, nove deles se erguem numa dança rangente de ossos e ferro velho.',
        notasMestre: 'Á.4. 9× Esqueleto (os antigos mineiros, reanimados pela magia residual da Forja). Vulneráveis a dano CONTUNDENTE (martelos, quedas) e a Expulsar Mortos-Vivos. Numerosos mas frágeis. Uma passagem segue ao depósito seguro.',
        encontro: [{ nome: 'Esqueleto', qtd: 9 }],
        saidas: [
          { para: 'w_deposito', rotulo: 'Recuar a uma câmara defensável', aviso: '' },
        ],
      },
      {
        id: 'w_deposito', titulo: 'O depósito seguro', tipo: 'descanso',
        narracao: 'Uma câmara de estocagem com uma única entrada estreita e paredes secas — o lugar mais defensável que a mina ofereceu até agora. Dá para barricar a porta, acender uma fogueira e recuperar o fôlego antes de mergulhar mais fundo.',
        notasMestre: 'Á.7, ponto de DESCANSO. Entrada única fácil de barricar (bom para um descanso curto/longo relativamente seguro). Use-o para a mesa se recompor antes das áreas mais duras (barricada dos bugbears, Caveira Flamejante, Forja, templo). Daqui saem os corredores para os carniçais e para a câmara de esporos.',
        encontro: [], saidas: [
          { para: 'w_carnicais1', rotulo: 'Seguir um cheiro de carniça', aviso: '' },
          { para: 'w_esporos', rotulo: 'Atravessar uma câmara de fungos luminosos', aviso: '' },
        ],
      },
      {
        id: 'w_carnicais1', titulo: 'Garras na escuridão', tipo: 'encontro',
        narracao: 'Três vultos magros e cinzentos, de unhas longas e olhos leitosos, farejam os restos de um antigo acampamento. Ao sentir carne viva, viram a cabeça de uma vez só e avançam com uma fome paralisante.',
        notasMestre: 'Á.6. 3× Carniçal (Ghoul): as garras PARALISAM (Con CD 10 nos não-elfos) — um PJ paralisado vira alvo fácil, então mate-os rápido ou proteja os caídos. Rondam a mina comendo os mortos. Seguem para a câmara de esporos.',
        encontro: [{ nome: 'Carniçal (Ghoul)', qtd: 3 }],
        saidas: [
          { para: 'w_esporos', rotulo: 'Cruzar a câmara dos fungos', aviso: '' },
        ],
      },
      {
        id: 'w_esporos', titulo: 'A câmara dos esporos', tipo: 'encontro',
        narracao: 'Fungos altos e pálidos brilham numa câmara úmida, e o ar está denso de um pó fino. Pisar entre eles levanta nuvens de esporos que ardem nos pulmões — e algo se move no meio da mata de cogumelos.',
        notasMestre: 'Á.8-9. ARMADILHA de esporos: atravessar sem cuidado força Constituição CD 11 (3d6 de dano venenoso e tosse/desvantagem). Rota cuidadosa (Percepção CD 12 para achar o caminho seguro) evita. No fundo, mais carniçais atraídos pelos mortos: 7× Carniçal (Ghoul) — o maior bando da mina, encontro pesado. Fogo controlado limpa os esporos (cuidado com o próprio grupo).',
        encontro: [{ nome: 'Carniçal (Ghoul)', qtd: 7 }],
        saidas: [
          { para: 'w_barricada', rotulo: 'Seguir para uma passagem barricada à frente', aviso: '' },
        ],
      },
      {
        id: 'w_lago', titulo: 'O lago subterrâneo', tipo: 'narracao',
        narracao: 'A caverna se abre num lago negro e imóvel que reflete estalactites como um céu invertido. Na margem, meio afundada na lama, brilha uma varinha de marfim largada por algum aventureiro que não teve a mesma sorte.',
        notasMestre: 'Á.10, nó utilitário. Na margem: uma VARINHA DE MÍSSEIS MÁGICOS (7 cargas) — recompensa por explorar o lago. A água é fria e funda; nadar até o centro (Atletismo) revela pouco além de peixes cegos. Uma passagem submersa/estreita leva à caverna estrelada.',
        encontro: [], saidas: [
          { para: 'w_estrelada', rotulo: 'Seguir para uma câmara que cintila ao longe', aviso: '' },
        ],
      },
      {
        id: 'w_barricada', titulo: 'A barricada dos bugbears', tipo: 'encontro',
        narracao: 'Um corredor foi bloqueado por uma barricada tosca de vigas e pedras, e atrás dela cinco bugbears montam guarda — os capangas que Nezznar deixou para trás para segurar quem viesse atrás dele. "Ninguém passa daqui!"',
        notasMestre: 'Á.11. 5× Bugbear atrás de cobertura (a barricada dá meia-cobertura e obriga a lutar no gargalo, um de cada vez — pode ser bom OU ruim para o grupo). São a retaguarda de Nezznar. Emboscada dele: um bugbear pode recuar para avisar a Forja/o templo. Derrubada a barricada, abre-se o caminho para a câmara da Caveira Flamejante.',
        encontro: [{ nome: 'Bugbear', qtd: 5 }],
        saidas: [
          { para: 'w_flameskull', rotulo: 'Avançar rumo a uma luz esverdeada flutuante', aviso: '' },
        ],
      },
      {
        id: 'w_flameskull', titulo: 'O crânio flamejante', tipo: 'encontro',
        narracao: 'Numa antiga encruzilhada de galerias, uma caveira envolta em chamas verdes flutua no ar, e ao redor dela oito cadáveres de mineiros se arrastam em silêncio. A caveira gira as órbitas vazias na direção de vocês e ri — uma risada seca que ecoa pela pedra.',
        notasMestre: 'Á.12. 1× Caveira Flamejante (Flameskull) + 8× Zumbi. A caveira lança Bola de Fogo e Mísseis Mágicos e é o guardião mágico antigo da mina — CUIDADO: ela REVIVE em 1 hora se destruída, A NÃO SER que os restos sejam tocados por água benta (dê a dica por Religião/Arcanismo CD 13). Os zumbis são muralha. Encontro perigoso: controle o campo e proteja os conjuradores dela.',
        encontro: [{ nome: 'Caveira Flamejante (Flameskull)', qtd: 1 }, { nome: 'Zumbi', qtd: 8 }],
        saidas: [
          { para: 'w_estrelada', rotulo: 'Seguir para uma câmara de teto cintilante', aviso: '' },
        ],
      },
      {
        id: 'w_estrelada', titulo: 'A caverna estrelada', tipo: 'social',
        npcs: [
          { nome: 'Mormesk', tipo: 'inimigo', descricao: 'A aparição de um antigo mago-mineiro que morreu quando a mina caiu e nunca partiu; um espectro amargo que ronda o coração da caverna, faminto por magia arcana.', notasPrivadas: 'Bloco: use a Aparição (Wraith) do bestiário. NÃO precisa virar combate: Mormesk é barganhável. Aceita um PRESENTE ARCANO (um pergaminho, uma varinha, uma magia lançada para ele "sentir") OU pede que os PJs destruam o ESPECTADOR que guarda a Forja (o inimigo antigo dele). Em troca, entrega o MAPA das áreas ainda inexploradas da mina (atalho para o templo). Atacado, luta com Dreno de Vida (reduz o MÁXIMO de PV — perigoso).' },
        ],
        narracao: 'O teto desta câmara faísca com milhares de cristais como um céu estrelado, e no centro paira uma sombra fria com forma de homem — os olhos, dois pontos de luz gélida. "Vivos... com magia nas veias", sussurra a coisa. "Faz tanto tempo. Talvez a gente possa negociar, você e eu."',
        notasMestre: 'Á.13-14. Mormesk (Aparição/Wraith) como encontro SOCIAL: barganhe. Ele quer magia arcana (um presente) ou a morte do Espectador da Forja; em troca dá o mapa das áreas inexploradas (atalho). Atacá-lo é possível mas caro (Dreno de Vida reduz PV máximo). Ligar a fala dele ao Espectador (á.15) prepara a próxima cena. Daqui parte o corredor para a Forja das Magias.',
        encontro: [{ nome: 'Aparição (Wraith)', qtd: 1 }],
        saidas: [
          { para: 'w_forja', rotulo: 'Seguir ao coração da mina: a Forja das Magias', aviso: '' },
        ],
      },
      {
        id: 'w_forja', titulo: 'A Forja das Magias', tipo: 'social',
        npcs: [
          { nome: 'O Espectador', tipo: 'inimigo', descricao: 'Uma aberração flutuante de um olho central e olhos menores em pedúnculos, invocada há séculos para guardar a Forja das Magias — e que nunca foi dispensada do posto.', notasPrivadas: 'Bloco: use o Espectador (Spectator) do bestiário. Guarda a Forja por ordem de mestres há muito mortos. NÃO é maligno: pode ser DISPENSADO com uma boa história (Enganação/Persuasão CD 15 — convencê-lo de que a missão acabou) ou combatido (raios de olho perigosos). Se Mormesk pediu a morte dele, cumprir libera a recompensa do espectro.' },
        ],
        narracao: 'O coração da mina é uma câmara imensa dominada por uma forja de pedra rúnica que ainda pulsa com um brilho mágico antigo — a lendária Forja das Magias. Flutuando diante dela, um único olho enorme gira para encará-los, e ao redor dele pequenos olhos em hastes se abrem um a um. "IDENTIFIQUEM-SE. A Forja não é para os indignos."',
        notasMestre: 'Á.15, a Forja das Magias (o prêmio da campanha e a origem do valor da mina). O Espectador guarda-a: DISPENSE-O com uma boa história (Enganação/Persuasão CD 15) ou lute (raios de olho: paralisia, dano psíquico, ferimento). A Forja, ativa por um mago, concede +1 TEMPORÁRIO (1d12 horas) a uma arma/armadura por descanso longo, e é onde repousam LIGHTBRINGER (maça +1, +1d6 radiante vs. mortos-vivos) e DRAGONGUARD (peitoral +1). ⚠️ As águas da caverna sobem aos poucos (tensão de tempo nos notasMestre) — não durma demais. Adiante, a guarda pessoal de Nezznar.',
        encontro: [{ nome: 'Espectador (Spectator)', qtd: 1 }],
        saidas: [
          { para: 'w_vhalak', rotulo: 'Avançar para a antecâmara do templo', aviso: '' },
        ],
      },
      {
        id: 'w_vhalak', titulo: 'A guarda de Nezznar', tipo: 'encontro',
        npcs: [
          { nome: 'Vhalak', tipo: 'inimigo', descricao: 'Um "guarda drow" a serviço do Aranha Negra — na verdade um doppelganger, tão traiçoeiro quanto o irmão de forma Vyerith, pronto a mudar de cara e de lado.', notasPrivadas: 'Bloco: use o Doppelganger do bestiário, com 3× Bugbear de escolta. Lê pensamentos e ataca com vantagem por surpresa; pode se disfarçar de um PJ ou de um "refém" para confundir. Se Vyerith fugiu do Castelo (Cap. 3B), Vhalak pode SER Vyerith reaparecendo — a critério do Mestre, fechando o arco do traidor.' },
        ],
        narracao: 'A antecâmara do templo é guardada por três bugbears e uma figura encapuzada de pele acinzentada que sorri como quem já sabe o final da história. "O mestre esperava vocês", diz a voz — e a pele dele começa a se remodelar diante dos seus olhos.',
        notasMestre: 'Á.18. Vhalak (Doppelganger) + 3× Bugbear — a guarda pessoal antes do chefe. Vhalak usa Leitura de Pensamentos, disfarce e ataque furtivo; pode fingir ser um refém ou um aliado para semear caos. Ligue-o a Vyerith (Cap. 3B) se aquele fugiu. Vencer aqui abre o templo de Nezznar — dê um último respiro à mesa (a Forja pode ter buffado as armas).',
        encontro: [{ nome: 'Doppelganger', qtd: 1 }, { nome: 'Bugbear', qtd: 3 }],
        saidas: [
          { para: 'w_templo', rotulo: 'Entrar no templo do Aranha Negra', aviso: '' },
        ],
      },
      {
        id: 'w_templo', titulo: 'Nezznar, o Aranha Negra', tipo: 'encontro',
        npcs: [
          { nome: 'Nezznar, o Aranha Negra', tipo: 'inimigo', descricao: 'O drow mago que moveu todos os fios desta trama — sequestrou Gundren, comandou os goblins e os Marcarrubra, tudo para tomar a Forja das Magias. Frio, teatral e perigoso.', notasPrivadas: 'Bloco: use o Mago Drow (Nezznar) do bestiário (chefe). Táticas: fica INVISÍVEL no início; manda as aranhas abrirem com TEIA (restringe os PJs) e ataca os presos com magia. Pode usar um "refém" (um doppelganger disfarçado, ou Nundro) como escudo/blefe. CAPTURÁVEL vivo: rende-se se encurralado e sem saída — se for entregue preso em Phandalin, Halia Thornton (Zhentarim) o solta em segredo (gancho pós-campanha). Loot: CAJADO DA ARANHA + o resto do tesouro do templo.' },
        ],
        narracao: 'O templo é uma câmara circular sob um domo de teias, e no centro dela a Forja lança sombras compridas. A voz vem de todo lugar e de lugar nenhum: "Chegaram longe. Uma pena." O ar cintila, quatro aranhas do tamanho de cavalos descem dos fios — e, invisível, o Aranha Negra começa a tecer o fim de vocês.',
        notasMestre: 'CLÍMAX DA CAMPANHA. Nezznar (Mago Drow, chefe) + 4× Aranha Gigante. Ele abre INVISÍVEL enquanto as aranhas prendem os PJs com Teia; então castiga os imobilizados com magia. Blefe do refão (doppelganger/Nundro como escudo). É um combate de posicionamento: quebre a invisibilidade (dano em área, pó, Sentir Invisível), liberte-se das teias, foque o drow. Nezznar RENDE-SE se sem saída (decisão: matar vs. capturar — se preso em Phandalin, Halia o solta). Vitória aqui = a Mina é retomada.',
        encontro: [{ nome: 'Mago Drow (Nezznar - chefe de Phandelver)', qtd: 1 }, { nome: 'Aranha Gigante', qtd: 4 }],
        saidas: [
          { para: 'w_nundro', rotulo: 'Vasculhar o templo e libertar o prisioneiro', aviso: '' },
        ],
      },
      {
        id: 'w_nundro', titulo: 'O último Rockseeker', tipo: 'social',
        npcs: [
          { nome: 'Nundro Rockseeker', tipo: 'aliado', descricao: 'O terceiro irmão Rockseeker, mantido vivo por Nezznar para trabalhar na Forja; fraco e faminto, mas vivo — a última esperança da família.', notasPrivadas: 'Preso numa cela do templo (Ladinagem/força para libertar). Vivo se os PJs chegaram a tempo. Reunido a Gundren na entrada, é o coração do final feliz: os Rockseeker retomam a Mina. Se Nezznar o usou como escudo e ele morreu no fogo cruzado, o final fica AMARGO.' },
        ],
        narracao: 'Com o Aranha Negra derrotado — morto, rendido ou fugido nas sombras —, o templo silencia. Numa cela lateral, acorrentado e magro, um anão ergue a cabeça: Nundro Rockseeker, o último irmão, vivo. A Forja das Magias pulsa, enfim sem dono, e a mina que custou tanto sangue espera por um novo começo.',
        notasMestre: 'Desfecho. Libertar Nundro (vivo se chegaram a tempo) fecha o arco dos Rockseeker. Decisões finais que definem qual FINAL usar: Nezznar morto/capturado/fugido? Nundro (e Gundren) vivos? A Forja intacta? Consolide o tesouro (Cajado da Aranha + Lightbringer + Dragonguard + o cofre). Encaminhe para o final correspondente. Descanso e retorno triunfal (ou amargo) a Phandalin.',
        encontro: [], saidas: [
          { para: 'w_final_plena', rotulo: 'Sair com os irmãos vivos e a Mina retomada', aviso: '' },
          { para: 'w_final_amarga', rotulo: 'Sair vitoriosos, mas contando os mortos', aviso: '' },
        ],
      },
      {
        id: 'w_final_plena', titulo: 'Os Heróis de Phandelver', tipo: 'final', resultado: 'vitoria',
        narracao: 'A Caverna do Eco das Ondas volta às mãos dos Rockseeker, e Gundren reencontra Nundro entre lágrimas na boca da mina. A Forja das Magias, silenciosa por gerações, voltará a cantar — e vocês, que a devolveram ao mundo, recebem uma parte vitalícia dos lucros e um nome que Phandalin não vai esquecer. A Mina Perdida foi, enfim, encontrada. — Fim da Campanha.',
        notasMestre: 'VITÓRIA PLENA (final canônico): Mina segura, Gundren e Nundro vivos, Nezznar derrotado. Recompensa lendária: 10% dos lucros vitalícios da Mina (renda passiva) + a gratidão de Phandalin + a Forja das Magias como recurso. Ganchos pós-campanha: a mansão Tresendar como base, a masmorra inexplorada do mapa de Mormesk, e — se Nezznar foi entregue vivo a Halia — o Aranha Negra solto pelos Zhentarim, prometendo vingança. Parabéns à mesa: campanha completa!',
        encontro: [], saidas: [],
      },
      {
        id: 'w_final_amarga', titulo: 'A vitória que custou caro', tipo: 'final', resultado: 'vitoria',
        narracao: 'O Aranha Negra caiu e a Mina foi retomada — mas o preço se conta em túmulos. Talvez Nundro não tenha sobrevivido à ganância de Nezznar, talvez o mapa e o traidor tenham escapado nas sombras. Gundren agradece com os olhos marejados de quem ganhou e perdeu ao mesmo tempo. A Mina é vossa; o luto, também. — Fim da Campanha.',
        notasMestre: 'VITÓRIA AMARGA: a Mina foi retomada, mas com perdas (um irmão morto, Nezznar ou o traidor fugidos, a Forja danificada). Ainda é vitória — a mesa venceu —, mas com peso dramático e ganchos abertos: Nezznar/Vyerith à solta jurando vingança, a Forja a recuperar. Recompensa reduzida mas real. Use este final quando as escolhas/dados cobraram seu preço; honre o esforço da mesa sem fingir que saiu de graça.',
        encontro: [], saidas: [],
      },
    ],
  },
  {
    id: 'modelo_ninho_ep4_estrada',
    titulo: 'Ninho da Rainha Dragão — Ep. 4: Na Estrada',
    limites: { jogadoresMax: 5, nivelMin: 4, nivelMax: 5 },
    noInicial: 'e4_partida',
    nos: [
      // ====== EPISÓDIO 4 — NA ESTRADA (Estrada do Comércio) ======
      // Adaptação própria e condensada (Ep4 do docs/CAMPANHA-NINHO.md).
      // Viagem longa + intriga social: seguir o tesouro do culto sem queimar
      // o disfarce. Poucos combates, muita tensão. Nível ~4.
      {
        id: 'e4_partida', titulo: 'A caravana para o norte', tipo: 'social',
        npcs: [
          { nome: 'Ackyn Selebon', tipo: 'neutro', descricao: 'Mestre da caravana, meticuloso e mal-humorado; contrata guardas, cobra taxas e não quer saber de política nem de cultos.', notasPrivadas: 'NÃO é do culto — só quer entregar a carga inteira. Contrata os PJs como guardas (2 po/dia) ou aceita que viajem como mercadores pagando 1 po/dia. Se o disfarce dos PJs cair, ele os EXPULSA da caravana para não ter problema (não os entrega, mas não os protege).' },
        ],
        narracao: 'Os registos de Mondath apontavam o norte, e a Estrada do Comércio é a única via: semanas de marcha até o Castelo Naerytar. Numa feira de beira de estrada, uma caravana longa se forma — e entre os carroceiros comuns há carroças pesadas, cobertas com lona encerada, guardadas por gente que não tem cara de mercador. O tesouro de Greenest está ali, a poucos passos de vocês.',
        notasMestre: 'Abertura do episódio: o grupo precisa de um DISFARCE para viajar junto do culto sem ser reconhecido. Papéis possíveis: guardas contratados (Ackyn paga 2 po/dia), mercadores (pagam 1 po/dia), peregrinos, artistas. Estabeleça a regra do episódio: aqui não se vence no braço — os cultistas são MUITOS. Vence quem observa, escuta e chega a Naerytar sem queimar o disfarce. Se algum PJ lutou contra Cyanwrath em Greenest, o rosto dele é conhecido: exija cuidado extra (capuz, Enganação).',
        encontro: [], saidas: [
          { para: 'e4_estrada', rotulo: 'Entrar na caravana e partir', aviso: '' },
        ],
      },
      {
        id: 'e4_estrada', titulo: 'Semanas de estrada', tipo: 'social',
        narracao: 'A estrada engole os dias: poeira, rodas rangendo, fogueiras à noite e a mesma paisagem por horas. É uma viagem longa demais para ninguém reparar em nada — e é exatamente por isso que ela é perigosa. As carroças de lona seguem sempre no meio do comboio, e ninguém, nunca, chega perto delas.',
        notasMestre: 'HUB do episódio (a viagem inteira). Cada saída é uma cena da estrada; todas voltam para cá — use quantas quiser, na ordem que a mesa preferir, e repita as viagens/encontros para dar peso às semanas. O relógio da campanha: o culto chega ao entreposto em ~4 semanas. Quando a mesa tiver o suficiente (ou você quiser avançar), use "As carroças saem da estrada" para fechar o episódio.',
        encontro: [], saidas: [
          { para: 'e4_caravana', rotulo: 'Conviver com a caravana (quem é quem)', aviso: '' },
          { para: 'e4_noite', rotulo: 'Vigiar o acampamento à noite', aviso: '' },
          { para: 'e4_espionar', rotulo: 'Bisbilhotar as carroças de lona', aviso: 'mortal' },
          { para: 'e4_encontro', rotulo: 'Um dia comum de estrada (encontro)', aviso: '' },
          { para: 'e4_cacadores', rotulo: 'Alguém está perguntando por vocês', aviso: '' },
          { para: 'e4_desvio', rotulo: 'As carroças saem da estrada (avançar)', aviso: '' },
          { para: 'e4_abandonar', rotulo: 'Largar a perseguição e seguir outro rumo', aviso: 'beco' },
        ],
      },
      {
        id: 'e4_caravana', titulo: 'Quem é quem na caravana', tipo: 'social',
        npcs: [
          { nome: 'Jamna Gleamsilver', tipo: 'neutro', descricao: 'Gnoma esperta que se diz mercadora de bugigangas e faz perguntas demais para quem só vende quinquilharia.', notasPrivadas: 'NÃO é do culto — é uma agente que também investiga a caravana (por conta de outro patrão). Desconfia dos PJs tanto quanto eles dela. Pode virar ALIADA se abordada com franqueza (Intuição CD 13 percebe que ela não é cultista); trai se for ameaçada.' },
          { nome: 'Bortand', tipo: 'inimigo', descricao: 'Carroceiro taciturno de mãos calejadas que nunca dorme longe das carroças de lona; usa um anel discreto com uma escama gravada.', notasPrivadas: 'CULTISTA infiltrado (bloco: Cultista). O anel de escama é a marca. Se os PJs bisbilhotarem, é ele quem repara primeiro e avisa o Fanático do Culto. Interrogado a sós e pressionado, entrega pouco — mas confirma "o entreposto na estrada" (gancho do Ep5).' },
        ],
        narracao: 'Uma caravana é uma vila que anda: cada fogueira tem a sua gente e a sua fofoca. Há a gnoma tagarela que pergunta demais, o carroceiro que nunca dorme longe das lonas, o peregrino que reza baixo, o casal que discute o dia todo. Alguns são exatamente o que parecem. Outros, não.',
        notasMestre: 'Cena SOCIAL de identificação — o coração do episódio. Deixe a mesa mapear a caravana: quem é cultista (marca discreta: anel/tatuagem de escama, dracônico sussurrado, sempre perto das lonas) e quem é só gente. Intuição CD 13 fura os disfarces mais fracos. CUIDADO: acusar em público sem prova vira problema com o mestre da caravana. Jamna é o curinga — outra investigadora, aliada em potencial. Use isto para recompensar quem joga com paciência.',
        encontro: [], saidas: [
          { para: 'e4_estrada', rotulo: 'Voltar à rotina da estrada', aviso: '' },
          { para: 'e4_espionar', rotulo: 'Já sei quem vigiar — bisbilhotar as lonas', aviso: 'mortal' },
        ],
      },
      {
        id: 'e4_noite', titulo: 'Vigília no acampamento', tipo: 'descanso',
        narracao: 'À noite a caravana vira um anel de fogueiras no escuro. É a hora em que as línguas se soltam, as cartas aparecem e alguém, sempre, se afasta do fogo para conversar baixo com quem não devia. Do lado das lonas, uma vela acende e apaga em cadência — não é vento; é sinal.',
        notasMestre: 'Descanso + oportunidade. Na vigília: Percepção CD 13 nota o sinal de vela entre os cultistas (eles se comunicam à noite); Furtividade permite chegar perto o bastante para ouvir uma frase em Dracônico (quem entende a língua pega "o entreposto" e "a mestra de escamas negras" — Rezmir). Bom momento para roleplay, para o grupo alinhar o plano e para Jamna aparecer com uma proposta.',
        encontro: [], saidas: [
          { para: 'e4_estrada', rotulo: 'Deixar a noite passar', aviso: '' },
          { para: 'e4_espionar', rotulo: 'Aproveitar o escuro e chegar às lonas', aviso: 'mortal' },
        ],
      },
      {
        id: 'e4_espionar', titulo: 'Sob a lona encerada', tipo: 'assalto',
        narracao: 'As carroças pesadas rangem sob o próprio peso. Sob a lona, à luz de um toco de vela, o que vocês veem confirma tudo: arcas lacradas com o símbolo de cinco cabeças, moedas de Greenest, prataria de família com iniciais de gente que talvez já não exista. E, no fundo, algo embrulhado em couro que ninguém deveria estar carregando por uma estrada pública.',
        notasMestre: 'A cena de RISCO do episódio (aviso 💀 é sobre o disfarce, não só sobre morte). Furtividade em grupo CD 15 (desvantagem se já levantaram suspeita em cenas anteriores). SUCESSO: confirmam o tesouro e ouvem o destino — o entreposto na estrada, depois "o castelo no brejo". FALHA: um cultista dá o alarme → siga para "Disfarce queimado". NÃO deixe roubar o tesouro aqui: são carroças no meio de dezenas de cultistas; roubo = perseguição, não vitória.',
        encontro: [], saidas: [
          { para: 'e4_estrada', rotulo: 'Recuar em silêncio com o que descobriram', aviso: '' },
          { para: 'e4_desmascarado', rotulo: 'Fomos vistos — o alarme', aviso: 'mortal' },
        ],
      },
      {
        id: 'e4_encontro', titulo: 'Um dia comum de estrada', tipo: 'encontro',
        narracao: 'A estrada cobra o seu pedágio: um grito na frente do comboio, cavalos empinando, e algo saindo do mato para testar quem defende a carga. Os cultistas lutam ao vosso lado — e reparam em como vocês lutam.',
        notasMestre: 'Encontro de viagem (repita com variação a cada trecho). TABELA (1d6): 1 bando de Lobos famintos; 2 salteadores (4× Bandido); 3 Estirges no acampamento noturno; 4 um Ogro cobrando "pedágio" numa ponte; 5 kobolds do culto testando os guardas; 6 nada — só chuva e lama. ATENÇÃO NARRATIVA: aqui os PJs lutam AO LADO dos cultistas (defendem a mesma carga) — e o culto observa. Exagerar (magia poderosa, brilho heroico) levanta suspeita: Enganação CD 12 para "lutar mal de propósito". Use o encontro abaixo como padrão.',
        encontro: [{ nome: 'Bandido', qtd: 4 }, { nome: 'Lobo', qtd: 2 }],
        saidas: [
          { para: 'e4_estrada', rotulo: 'Carga salva — a estrada continua', aviso: '' },
        ],
      },
      {
        id: 'e4_cacadores', titulo: 'Perguntando por vocês', tipo: 'encontro',
        npcs: [
          { nome: 'Azbara Jos', tipo: 'inimigo', descricao: 'Um mago de vestes discretas e sotaque estrangeiro que viaja com a caravana sem carga nenhuma; observa muito e fala pouco.', notasPrivadas: 'Bloco: Fanático do Culto (Cult Fanatic). Não é exatamente do culto — é um agente aliado com interesses próprios, e é ESPERTO: não ataca de frente. Se desconfiar dos PJs, primeiro TESTA (perguntas, armadilhas verbais, um cultista mandado espiar). Se os PJs forem descuidados, ele arma o desmascaramento numa hora conveniente para ele.' },
        ],
        narracao: 'Numa parada de beira de estrada, um estalajadeiro comenta de passagem: "Uns tipos passaram por aqui perguntando de um grupo com a descrição de vocês. Pagaram bem pela informação." Na caravana, o mago de vestes discretas ergue os olhos do livro — só por um segundo — e volta a ler.',
        notasMestre: 'A pressão sobe. O culto (ou os aliados dele) espalhou a descrição do grupo que atrapalhou Greenest. Duas frentes: (1) caçadores de recompensa na estrada — o encontro abaixo, que pode ser resolvido no braço LONGE da caravana ou por conversa/suborno; (2) Azbara Jos, o mago frio, que passa a TESTAR os PJs. Se o grupo se expuser aqui, marque suspeita: a próxima Furtividade nas lonas vira desvantagem.',
        encontro: [{ nome: 'Bandido Capitão', qtd: 1 }, { nome: 'Bandido', qtd: 3 }],
        saidas: [
          { para: 'e4_estrada', rotulo: 'Resolver a ameaça e voltar à caravana', aviso: '' },
          { para: 'e4_desmascarado', rotulo: 'A briga aconteceu à vista de todos', aviso: 'mortal' },
        ],
      },
      {
        id: 'e4_desmascarado', titulo: 'Disfarce queimado', tipo: 'encontro',
        narracao: '"São ELES!" O grito corta o acampamento, e num instante metade dos rostos amigáveis da caravana muda: mãos vão aos cintos, mantos se abrem sobre escamas tatuadas, e um fanático de manto ergue a voz num cântico dracônico. O mestre da caravana grita para os seus não se meterem — esta briga não é dele.',
        notasMestre: 'O disfarce caiu. Encontro duro, mas NÃO é o exército inteiro: só a célula que viaja perto (o resto está espalhado pelo comboio). Objetivo realista da mesa: sobreviver e SUMIR, não vencer a caravana. Se vencerem rápido e discretamente, ainda podem seguir o comboio de LONGE (volta ao hub, com desvantagem em tudo que envolva aproximação). Se apanharem, os PJs são expulsos/deixados para trás — e aí seguem o rasto pelas marcas de roda até o entreposto (o episódio continua, mais difícil).',
        encontro: [{ nome: 'Fanático do Culto (Cult Fanatic)', qtd: 1 }, { nome: 'Cultista', qtd: 4 }, { nome: 'Garra do Dragão (Dragonclaw)', qtd: 1 }],
        saidas: [
          { para: 'e4_estrada', rotulo: 'Sumir na noite e seguir o comboio de longe', aviso: '' },
          { para: 'e4_final_aberto', rotulo: 'Seguir o rasto sem disfarce até o entreposto', aviso: '' },
        ],
      },
      {
        id: 'e4_desvio', titulo: 'As carroças saem da estrada', tipo: 'narracao',
        narracao: 'Numa manhã de neblina, o comboio para. As carroças de lona se separam da caravana e pegam um ramal de terra batida rumo ao oeste, para longe da Estrada do Comércio — em direção a um casario de pedra baixo, meio construído, que se agacha à margem de um rio. Ackyn não pergunta nada: recebe o pagamento, vira as costas e toca os seus para o norte.',
        notasMestre: 'Fecho do episódio: o tesouro deixa a estrada e entra no ENTREPOSTO do culto (o Carnath Roadhouse — Ep5). Decisão do grupo: continuar com a caravana (perder o rasto = beco) ou largar a caravana e seguir as carroças. Se ainda estiverem disfarçados, podem entrar no entreposto pela porta da frente; se o disfarce caiu, entram pelas sombras. Sugira descanso longo e conferir nível (~5) antes do Ep5.',
        encontro: [], saidas: [
          { para: 'e4_chegada', rotulo: 'Largar a caravana e seguir as carroças', aviso: '' },
        ],
      },
      {
        id: 'e4_chegada', titulo: 'O entreposto à margem do rio', tipo: 'social',
        narracao: 'De um morro coberto de mato, vocês veem o lugar inteiro: uma casa de estrada de pedra ainda em obras, currais, um cais de madeira novo sobre o rio e barcaças amarradas. As carroças de lona entram por um portão dos fundos e são descarregadas depressa, por gente demais para um simples entreposto. Seja lá o que o culto está a construir aqui, não é uma estalagem.',
        notasMestre: 'Chegada ao Carnath Roadhouse (Ep5). Reconhecimento: Percepção CD 12 conta os guardas e nota que o tesouro desce para o CAIS — vai continuar de barco, não de carroça. Escolha o final conforme o estado do grupo: disfarce intacto (entram como hóspedes) ou queimado (entram pelas sombras). Ambos são vitória — o Ep5 muda de tom conforme a rota.',
        encontro: [], saidas: [
          { para: 'e4_final_disfarce', rotulo: 'Entrar pela porta da frente, ainda disfarçados', aviso: '' },
          { para: 'e4_final_aberto', rotulo: 'Entrar pelas sombras, sem disfarce', aviso: '' },
        ],
      },
      {
        id: 'e4_final_disfarce', titulo: 'Hóspedes do inimigo', tipo: 'final', resultado: 'vitoria',
        narracao: 'Poeirentos e anônimos como qualquer viajante, vocês cruzam o portão do entreposto pela porta da frente — e ninguém ergue os olhos. O tesouro de Greenest desce para o cais a poucos metros de onde vocês vão dormir esta noite. Semanas de estrada, de mordidas na língua e de disfarce intacto valeram exatamente isto: estar dentro. — Fim do Episódio 4.',
        notasMestre: 'Vitória "limpa": disfarce preservado. No Ep5, o grupo entra como hóspede — pode circular, ouvir e escolher a hora, com o risco de ser reconhecido a qualquer momento. XP: caminho para o nível 5. Pistas ativas: o tesouro segue de BARCO pelo rio; "a mestra de escamas negras" (Rezmir) e "o castelo no brejo" (Naerytar). PRÓXIMO: importar "Ep. 5 — Obras à Frente".',
        encontro: [], saidas: [],
      },
      {
        id: 'e4_final_aberto', titulo: 'Sem máscara, no encalço', tipo: 'final', resultado: 'vitoria',
        narracao: 'O disfarce ficou para trás em algum ponto da estrada, junto com a paciência. Vocês chegam ao entreposto pelo mato, sujos e conhecidos — sabendo que lá dentro há gente que sabe os vossos rostos. O tesouro está ali, descendo para as barcaças. Vai ser mais difícil assim. Não vai ser impossível. — Fim do Episódio 4.',
        notasMestre: 'Vitória "suja": o rasto foi mantido, o disfarce não. No Ep5, o grupo age pelas sombras (infiltração/assalto) e o entreposto pode estar em alerta. Também é vitória — não puna a mesa, só mude o tom. XP: caminho para o nível 5. PRÓXIMO: importar "Ep. 5 — Obras à Frente".',
        encontro: [], saidas: [],
      },
      {
        id: 'e4_abandonar', titulo: 'A estrada que se perdeu', tipo: 'final', resultado: 'neutro',
        narracao: 'Vocês deixam a caravana seguir e pegam outro rumo. Em algum lugar ao norte, arcas com a prataria das famílias de Greenest continuam a rolar para as mãos de uma rainha de escamas — e ninguém mais está olhando. As perguntas de Leosin ficarão sem resposta por muito tempo.',
        notasMestre: 'Beco intencional (não punição): mostra o custo de largar o rasto. Retomável — o culto leva semanas para escoar tudo; a mesa pode voltar ao hub da estrada e retomar a caravana com uma cena de reencontro. Se quiserem mesmo outro rumo, os Eps 1-3 já dão um arco fechado em Greenest.',
        encontro: [], saidas: [],
      },
    ],
  },
  {
    id: 'modelo_ninho_ep5_carnath',
    titulo: 'Ninho da Rainha Dragão — Ep. 5: Obras à Frente',
    limites: { jogadoresMax: 5, nivelMin: 5, nivelMax: 5 },
    noInicial: 'e5_chegada',
    nos: [
      // ====== EPISÓDIO 5 — OBRAS À FRENTE (Entreposto de Carnath) ======
      // Adaptação própria e condensada (Ep5 do docs/CAMPANHA-NINHO.md).
      // O entreposto onde o tesouro sai das carroças e entra nas barcaças.
      // Infiltração + logística; o objetivo é DESCOBRIR e PEGAR CARONA.
      {
        id: 'e5_chegada', titulo: 'A casa de estrada inacabada', tipo: 'social',
        npcs: [
          { nome: 'Mestra de Obras Vardra', tipo: 'inimigo', descricao: 'Mulher seca de avental de couro que toca a construção do entreposto com pulso de capataz; recebe hóspedes com uma hospitalidade que não chega aos olhos.', notasPrivadas: 'Bloco: Fanático do Culto (Cult Fanatic). É a oficial do culto no entreposto. Finge ser só estalajadeira/mestra de obras. Aluga quartos (1 po/noite) e OBSERVA. Se os PJs perguntarem do cais ou das arcas, ela desconversa e manda vigiá-los. Nas anotações dela: manifestos de carga e o nome do destino — Naerytar.' },
        ],
        narracao: 'De perto, o entreposto é mais canteiro de obras do que estalagem: paredes de pedra pela metade, andaimes, um telhado provisório de lona. Mas o cais no rio é novo em folha, bem-feito e caro demais para uma casa de estrada no meio do nada. Uma mulher de avental de couro cruza o pátio gritando ordens e para ao ver vocês, sorrindo com a boca apenas: "Viajantes. Temos quartos. Temos sopa. Não temos perguntas."',
        notasMestre: 'Entrada do episódio. O tom depende do fim do Ep4: com DISFARCE, os PJs são hóspedes e circulam quase à vontade (mas Vardra os observa); SEM disfarce, tudo é furtivo e o entreposto pode estar em alerta. Estabeleça o mistério logo: por que um cais caro numa obra parada? Regra do episódio: o objetivo NÃO é limpar o entreposto no braço — é descobrir que o tesouro segue de BARCO e conseguir ir junto.',
        encontro: [], saidas: [
          { para: 'e5_hub', rotulo: 'Entrar e se instalar', aviso: '' },
        ],
      },
      {
        id: 'e5_hub', titulo: 'Dentro do entreposto', tipo: 'social',
        narracao: 'O lugar é um formigueiro mal disfarçado: pedreiros que não assentam pedra nenhuma, "hóspedes" que nunca saem, carroceiros que descarregam arcas pesadas de madrugada. Do salão comum dá para ver o pátio; do pátio, o cais; e no andar de cima, atrás de uma porta trancada, alguém escreve até tarde.',
        notasMestre: 'HUB do episódio — todas as saídas voltam para cá. Deixe a mesa escolher a ordem e o método. As pistas se somam: o salão dá as fofocas, o pátio mostra a operação, o cais revela as barcaças (o coração da descoberta), o andar de cima tem os papéis (o destino: Naerytar). O porão é o tesouro em si — cofre demais para levar; a graça é SEGUIR, não roubar.',
        encontro: [], saidas: [
          { para: 'e5_salao', rotulo: 'Salão comum (ouvir os hóspedes)', aviso: '' },
          { para: 'e5_patio', rotulo: 'Pátio das obras (ver a operação)', aviso: '' },
          { para: 'e5_docas', rotulo: 'Descer até o cais (as barcaças)', aviso: '' },
          { para: 'e5_andar', rotulo: 'Andar de cima (a porta trancada)', aviso: 'mortal' },
          { para: 'e5_porao', rotulo: 'Porão (seguir as arcas)', aviso: 'mortal' },
          { para: 'e5_barcaca', rotulo: 'Já sei o bastante — arranjar passagem', aviso: '' },
        ],
      },
      {
        id: 'e5_salao', titulo: 'O salão comum', tipo: 'social',
        npcs: [
          { nome: 'Irmão Alvo', tipo: 'aliado', descricao: 'Monge itinerante de hábito puído que bebe sozinho num canto e observa tudo por cima da caneca; sabe mais do que devia sobre quem manda aqui.', notasPrivadas: 'NÃO é do culto — é um viajante que ficou preso aqui e teme pela vida. Se tratado com respeito (e uma rodada de bebida), conta: as arcas descem para o cais SEMPRE de madrugada; as barcaças partem rio abaixo, para o brejo; e "a mulher de escamas negras" (Rezmir) passou por aqui há dias, indo no mesmo rumo. Não luta. Se os PJs armarem confusão, some.' },
        ],
        narracao: 'O salão cheira a sopa rala e serragem. Meia dúzia de "hóspedes" ocupa as mesas sem beber quase nada e sem falar quase nunca — gente esperando alguma coisa. Só um deles destoa: um monge magro de hábito puído, sozinho no canto, que ergue os olhos da caneca no instante em que vocês entram e volta a baixá-los depressa demais.',
        notasMestre: 'Cena social de informação. Os "hóspedes" são cultistas de folga (Cultista) — não atacam sem motivo; observam. O Irmão Alvo é a mina de ouro: bebida + Persuasão CD 12 (ou só gentileza) e ele entrega o horário das arcas (madrugada), o destino (rio abaixo, o brejo) e a passagem de Rezmir. Intuição CD 13 percebe que os "pedreiros" têm calos de espada, não de pedra.',
        encontro: [], saidas: [
          { para: 'e5_hub', rotulo: 'Voltar a circular pelo entreposto', aviso: '' },
        ],
      },
      {
        id: 'e5_patio', titulo: 'O pátio das obras', tipo: 'social',
        narracao: 'À luz do dia, a farsa quase se desfaz sozinha: os andaimes estão no mesmo lugar há meses, as pedras empilhadas cobertas de mato, e os "pedreiros" passam o dia jogando dados e olhando a estrada. Nos currais, presos por correntes curtas, dois répteis atarracados farejam o vento e rosnam para quem chega perto do caminho do cais.',
        notasMestre: 'A obra é FACHADA — a construção nunca avança porque não é o objetivo. 2× Guarda Draco acorrentados perto do caminho do cais (não atacam quem passa longe; rosnam e denunciam quem se aproxima à noite — obstáculo para a cena do cais). Investigação CD 12 no canteiro: as pedras nunca foram movidas; a única coisa nova e bem-feita é o cais. Se os PJs provocarem os dracos, use o encontro.',
        encontro: [{ nome: 'Guarda Draco (Guard Drake)', qtd: 2 }],
        saidas: [
          { para: 'e5_hub', rotulo: 'Voltar para dentro', aviso: '' },
          { para: 'e5_docas', rotulo: 'Seguir o caminho até o cais', aviso: '' },
        ],
      },
      {
        id: 'e5_docas', titulo: 'O cais de madrugada', tipo: 'assalto',
        narracao: 'Antes do sol, o entreposto acorda de verdade. Uma fila silenciosa de homens desce do porão para o cais carregando arcas lacradas, e três barcaças de fundo chato esperam amarradas, já meio cheias. Um cultista risca cada arca num rol conforme ela embarca. O rio corre preto para o oeste — para o brejo.',
        notasMestre: 'A DESCOBERTA central do episódio: o tesouro não segue de carroça, segue de BARCO — rio abaixo, para o pântano (Castelo Naerytar). Observar sem ser visto: Furtividade em grupo CD 14 (desvantagem se os dracos do pátio foram alertados). Sucesso = confirmam a rota, o horário e quantas barcaças. Falha = alarme. Roubar uma arca aqui é possível e BURRO (perdem o rasto e ganham uma caçada); a jogada certa é ir junto.',
        encontro: [], saidas: [
          { para: 'e5_hub', rotulo: 'Recuar com o que viram', aviso: '' },
          { para: 'e5_barcaca', rotulo: 'Arranjar um jeito de embarcar', aviso: '' },
          { para: 'e5_alarme', rotulo: 'Fomos vistos no cais', aviso: 'mortal' },
        ],
      },
      {
        id: 'e5_andar', titulo: 'A porta trancada', tipo: 'assalto',
        narracao: 'No topo da escada, uma porta de madeira boa — a única coisa acabada do prédio — fica trancada o dia inteiro. Lá dentro, uma escrivaninha, um baú de viagem e pilhas de papel: manifestos, rotas, nomes. É o cérebro da operação, e ele cabe numa sacola.',
        notasMestre: 'Os PAPÉIS do culto: Ladinagem CD 14 (ou a chave, no cinto de Vardra). Ganho: manifestos de carga confirmando o destino — **Castelo Naerytar, no brejo** — e a menção a "Rezmir" como quem responde pelo tesouro. Risco: Vardra sobe a cada poucas horas; ser pego aqui = alarme (e ela luta). Copiar em vez de levar evita que o culto perceba o roubo (recompense a esperteza).',
        encontro: [], saidas: [
          { para: 'e5_hub', rotulo: 'Sair com os papéis (ou uma cópia)', aviso: '' },
          { para: 'e5_chefe', rotulo: 'Vardra abre a porta', aviso: 'mortal' },
        ],
      },
      {
        id: 'e5_porao', titulo: 'O porão das arcas', tipo: 'encontro',
        narracao: 'A escada do porão desce para um frio de pedra e um brilho que não devia estar ali: arcas empilhadas até o teto, algumas abertas, transbordando moedas, castiçais e prataria com iniciais gravadas. É o saque de meia dúzia de vilas — e Greenest é só uma delas. Dois guardas jogam dados sobre uma arca virada.',
        notasMestre: 'O tesouro em si. 2× Cultista + 1× Garra do Dragão de guarda (rendição/suborno possíveis com Enganação CD 13 se os PJs ainda estiverem disfarçados). O peso é NARRATIVO: aqui a mesa vê o tamanho do roubo — e percebe que não dá para carregar isso (são toneladas). Deixe roubarem umas peças (loot pela Fase 13), mas o objetivo continua sendo seguir a carga. Barulho aqui = alarme.',
        encontro: [{ nome: 'Cultista', qtd: 2 }, { nome: 'Garra do Dragão (Dragonclaw)', qtd: 1 }],
        saidas: [
          { para: 'e5_hub', rotulo: 'Subir antes que dêem falta dos guardas', aviso: '' },
          { para: 'e5_alarme', rotulo: 'O barulho desceu o entreposto inteiro', aviso: 'mortal' },
        ],
      },
      {
        id: 'e5_chefe', titulo: 'Vardra, mestra de obras', tipo: 'encontro',
        narracao: '"Eu sabia." Vardra está na porta, sem o avental e sem o sorriso, e o cântico dracônico já começou entre os dentes dela. Atrás, na escada, passos pesados sobem depressa: os pedreiros que nunca assentaram uma pedra vêm ver o serviço.',
        notasMestre: 'A oficial do culto pega os PJs no flagra. Vardra = Fanático do Culto (Comando/Infligir Ferimentos) + 2× Cultista + 1× Garra do Dragão de reforço em 2 rodadas. Ela luta para PRENDER, não para matar (o culto quer saber quem os mandou) — uma derrota aqui pode virar cativeiro numa barcaça (gancho ótimo: acordam a caminho de Naerytar). Vencer rápido e em silêncio ainda salva o disfarce.',
        encontro: [{ nome: 'Fanático do Culto (Cult Fanatic)', qtd: 1 }, { nome: 'Cultista', qtd: 2 }, { nome: 'Garra do Dragão (Dragonclaw)', qtd: 1 }],
        saidas: [
          { para: 'e5_barcaca', rotulo: 'Silenciá-la e correr para o cais', aviso: '' },
          { para: 'e5_alarme', rotulo: 'O grito dela acordou o entreposto', aviso: 'mortal' },
        ],
      },
      {
        id: 'e5_alarme', titulo: 'O entreposto em alerta', tipo: 'encontro',
        narracao: 'Um sino de obra badala no pátio e o disfarce do lugar cai junto com o vosso: os pedreiros sacam lâminas, os hóspedes largam as canecas, os dracos arrebentam as correntes. Entre vocês e o rio há mais gente do que dá para matar — mas as barcaças ainda estão lá, amarradas.',
        notasMestre: 'Cena de FUGA, não de vitória. Não conte os inimigos: são muitos (use a onda abaixo e sinalize que vem mais). O objetivo é chegar ao cais e cortar as amarras, ou sumir no mato e seguir a pé pelo brejo. Se a mesa insistir em segurar a posição, capture-os (acordam presos numa barcaça rumo a Naerytar — o episódio continua, de outro jeito). Não encerre a campanha aqui.',
        encontro: [{ nome: 'Cultista', qtd: 4 }, { nome: 'Garra do Dragão (Dragonclaw)', qtd: 2 }, { nome: 'Guarda Draco (Guard Drake)', qtd: 2 }],
        saidas: [
          { para: 'e5_barcaca', rotulo: 'Romper até o cais e tomar uma barcaça', aviso: '' },
          { para: 'e5_final_terra', rotulo: 'Sumir no mato e seguir o rio a pé', aviso: '' },
        ],
      },
      {
        id: 'e5_barcaca', titulo: 'Passagem rio abaixo', tipo: 'social',
        narracao: 'As barcaças partem carregadas antes do amanhecer, guiadas por varas compridas contra a corrente lenta. Há três jeitos de ir junto: como carga (escondidos entre as arcas), como tripulação (com os mantos certos e a cara de sono certa) ou atrás delas, numa canoa roubada, à distância de uma flecha.',
        notasMestre: 'Decisão de método — todas as rotas funcionam, mude só o tom do Ep6: (a) ESCONDIDOS na carga (Furtividade CD 13; chegam sem serem vistos, mas presos no meio do inimigo); (b) COMO TRIPULAÇÃO (precisa de disfarce + Enganação CD 14; conversam com os cultistas na viagem e ouvem coisas); (c) ATRÁS, de canoa (sem risco social, mas o rio do brejo cobra o seu — encontro na água). Escolha o final conforme a rota.',
        encontro: [], saidas: [
          { para: 'e5_rio', rotulo: 'Embarcar (escondidos ou como tripulação)', aviso: '' },
          { para: 'e5_final_terra', rotulo: 'Seguir por terra, acompanhando o rio', aviso: '' },
        ],
      },
      {
        id: 'e5_rio', titulo: 'O rio para dentro do brejo', tipo: 'encontro',
        narracao: 'A margem some aos poucos. A água escurece, o cheiro azeda e as árvores fecham o céu — o rio deixou de atravessar a terra e passou a atravessar um pântano vivo. Nas barcaças ninguém fala alto; nem os cultistas gostam deste lugar. Alguma coisa acompanha o comboio pela margem, sem pressa.',
        notasMestre: 'A viagem para o Brejo dos Mortos. Encontro do rio: estirges do pântano (abaixo) ou, se preferir, um bando de kobolds nativos em jangadas. Se os PJs vão como tripulação, os cultistas lutam ao lado deles — outra chance de ouvir conversa. Se vão escondidos, precisam decidir se ajudam (revelando-se) ou deixam os cultistas se virarem. Ao fim: a silhueta do castelo entre as árvores mortas. Sugira descanso e nível ~5-6 antes do Ep6.',
        encontro: [{ nome: 'Estirge (Stirge)', qtd: 8 }],
        saidas: [
          { para: 'e5_final_barca', rotulo: 'Chegar a Naerytar com o comboio', aviso: '' },
        ],
      },
      {
        id: 'e5_final_barca', titulo: 'Carga viva', tipo: 'final', resultado: 'vitoria',
        narracao: 'Dias de água parada depois, as barcaças encostam num ancoradouro podre sob torres tortas: Castelo Naerytar, afundando devagar no próprio brejo. As arcas de Greenest descem para o pátio de uma fortaleza cheia de vozes que não são humanas — e vocês descem junto com elas, no coração do inimigo, sem ninguém saber. — Fim do Episódio 5.',
        notasMestre: 'Vitória "por dentro": o grupo chega a Naerytar COM o comboio, escondido na carga ou fingindo ser tripulação. No Ep6 começam DENTRO do castelo (vantagem enorme, risco enorme). XP: caminho para o nível 6. Pistas ativas: Rezmir responde pelo tesouro; o castelo é o entroncamento. PRÓXIMO: importar "Ep. 6 — Castelo Naerytar".',
        encontro: [], saidas: [],
      },
      {
        id: 'e5_final_terra', titulo: 'Pelo brejo, a pé', tipo: 'final', resultado: 'vitoria',
        narracao: 'Sem barco e sem disfarce, resta o pântano: dias de lama até o joelho, sanguessugas, febre e o rio sempre à esquerda como única bússola. Quando as torres tortas de Naerytar enfim aparecem entre as árvores mortas, vocês chegam por fora, imundos e livres — vendo o castelo inteiro antes que ele veja vocês. — Fim do Episódio 5.',
        notasMestre: 'Vitória "por fora": mais dura (marchas forçadas no brejo — considere 1-2 níveis de exaustão ou um encontro extra), mas com uma vantagem real: chegam LIVRES e podem reconhecer o castelo de fora antes de entrar (e conhecer os bullywugs/homens-lagarto do brejo antes do culto). No Ep6 começam do lado de fora. XP: caminho para o nível 6. PRÓXIMO: importar "Ep. 6 — Castelo Naerytar".',
        encontro: [], saidas: [],
      },
    ],
  },
  {
    id: 'modelo_ninho_ep6_naerytar',
    titulo: 'Ninho da Rainha Dragão — Ep. 6: Castelo Naerytar',
    limites: { jogadoresMax: 5, nivelMin: 5, nivelMax: 6 },
    noInicial: 'e6_chegada',
    nos: [
      // ====== EPISÓDIO 6 — CASTELO NAERYTAR (o brejo) ======
      // Adaptação própria e condensada (Ep6 do docs/CAMPANHA-NINHO.md).
      // Fortaleza no pântano: culto + bullywugs + homens-lagarto numa aliança
      // podre. Rezmir e o CÍRCULO DE TELETRANSPORTE. A política é a chave.
      {
        id: 'e6_chegada', titulo: 'As torres tortas', tipo: 'social',
        narracao: 'Castelo Naerytar afunda no próprio brejo há séculos: muralha de pedra negra manchada de limo, torres tortas, um pátio de lama e um ancoradouro podre onde as barcaças descarregam. Dentro convivem três povos que se odeiam: os cultistas do dragão, que mandam; os bullywugs, homens-sapo que se acham reis do pântano; e os homens-lagarto, que só querem que todos vão embora.',
        notasMestre: 'Abertura do episódio mais POLÍTICO da campanha. Estabeleça a tensão de três lados desde já — é ela que dá a vitória, não a espada. O culto é forte demais para um assalto frontal, mas está por um fio: os bullywugs se sentem humilhados e os homens-lagarto foram enganados. Se o grupo veio na carga (Ep5), começa dentro; se veio a pé, começa fora e pode falar com o pântano primeiro. Objetivo real: chegar ao CÍRCULO DE TELETRANSPORTE — é assim que o tesouro some daqui.',
        encontro: [], saidas: [
          { para: 'e6_hub', rotulo: 'Encarar o castelo', aviso: '' },
        ],
      },
      {
        id: 'e6_hub', titulo: 'Três povos, um castelo', tipo: 'social',
        narracao: 'De qualquer sombra do pátio dá para ler a política do lugar: os cultistas ocupam o torreão e o pátio central, os bullywugs coaxam no pátio inundado e nos alojamentos baixos, os homens-lagarto se agacham perto do ancoradouro e do brejo. As arcas descem das barcaças e somem por uma porta que ninguém mais atravessa — a torre do fundo.',
        notasMestre: 'HUB do episódio. Deixe a mesa escolher: aliar-se aos bullywugs, aos homens-lagarto, aos dois, ou ignorar a política e ir na furtividade (mais duro). A revolta é a jogada de mestre: com um dos povos virado contra o culto, o assalto ao torreão vira possível no nível 5-6. A torre do fundo (o círculo) é o objetivo; Rezmir está entre vocês e ela.',
        encontro: [], saidas: [
          { para: 'e6_bullywugs', rotulo: 'Falar com os bullywugs (o rei do brejo)', aviso: '' },
          { para: 'e6_lagartos', rotulo: 'Falar com os homens-lagarto (o ancoradouro)', aviso: '' },
          { para: 'e6_ancoradouro', rotulo: 'Vigiar o ancoradouro (onde as arcas chegam)', aviso: '' },
          { para: 'e6_celas', rotulo: 'Investigar gemidos vindos do subsolo', aviso: '' },
          { para: 'e6_patio', rotulo: 'Circular pelo pátio do culto', aviso: '' },
          { para: 'e6_torreao', rotulo: 'Entrar no torreão do culto', aviso: 'mortal' },
          { para: 'e6_revolta', rotulo: 'Acender a revolta no castelo', aviso: '' },
          { para: 'e6_partir', rotulo: 'Desistir e sair do brejo', aviso: 'beco' },
        ],
      },
      {
        id: 'e6_bullywugs', titulo: 'A corte do Rei Sapo', tipo: 'social',
        npcs: [
          { nome: 'Pharblex Spattergoo', tipo: 'inimigo', descricao: 'Xamã bullywug de olhos esbugalhados e coroa de juncos que se proclama senhor de Naerytar; vive humilhado pelos cultistas, que fingem obedecê-lo e riem pelas costas.', notasPrivadas: 'Bloco: Fanático do Culto (Cult Fanatic) com o traço anfíbio dos bullywugs (ou use Bullywug reforçado). VAIDADE é a fraqueza dele — bajulação (Persuasão CD 13) ou uma prova de que o culto zomba dele (os papéis do Ep5 servem!) o vira contra os cultistas. Aliado, joga toda a horda de bullywugs no torreão — a maior vantagem tática do episódio. Traiçoeiro: cobra tributo depois.' },
        ],
        narracao: 'O pátio inundado é uma corte de lama: dezenas de homens-sapo coaxam em coro enquanto um deles, de coroa de juncos e olhos esbugalhados, se empoleira num trono de pedra rachada. Pharblex Spattergoo, "senhor de Naerytar", recebe vocês com pompa ridícula — e com uma raiva mal escondida cada vez que um cultista passa pelo pátio sem se curvar.',
        notasMestre: 'A cena política mais valiosa do episódio. Pharblex ACHA que manda no castelo; o culto o trata como bicho de estimação. Provas da humilhação (os manifestos do Ep5, uma conversa ouvida, uma zombaria de cultista) + bajulação (Persuasão CD 13) o convertem: ele solta a horda de bullywugs contra o torreão. Desprezá-lo, porém, faz dele um inimigo a mais. Atacar aqui é suicídio (são dezenas) — daí não haver aviso de combate: é conversa.',
        encontro: [], saidas: [
          { para: 'e6_hub', rotulo: 'Voltar ao pátio', aviso: '' },
          { para: 'e6_revolta', rotulo: 'Fechar a aliança e acender o pavio', aviso: '' },
        ],
      },
      {
        id: 'e6_lagartos', titulo: 'Os que querem todos fora', tipo: 'social',
        npcs: [
          { nome: 'Snapjaw', tipo: 'aliado', descricao: 'Guerreiro homem-lagarto de cicatrizes antigas que fala Comum devagar e sem rodeios; despreza os bullywugs e desconfia do culto que prometeu o que não cumpriu.', notasPrivadas: 'Bloco: Homem-Lagarto (Lizardfolk), mais durão. PRAGMÁTICO, não malvado: o culto prometeu território e trouxe só ordens; os bullywugs mandam nele por força. Não pede bajulação — pede RESULTADO. Se os PJs prometerem (e cumprirem) tirar o culto ou os bullywugs do brejo, ele guia pelos túneis de baixo até a torre do círculo, evitando o torreão inteiro. É a rota furtiva do episódio.' },
        ],
        narracao: 'Perto do ancoradouro, agachados na lama como troncos que respiram, os homens-lagarto observam as barcaças em silêncio. Um deles se levanta quando vocês chegam — alto, cheio de cicatrizes — e fala Comum devagar, medindo cada palavra: "Sapos mandam. Homens de escama mandam. Nós ficamos na lama. Vocês vieram mandar também?"',
        notasMestre: 'A outra metade da política — e a mais honesta. Snapjaw não quer poder, quer o brejo de volta. Não adianta bajular: ele quer um trato claro (tirar o culto OU os bullywugs). Fechado o trato, ele entrega a ROTA DOS TÚNEIS: passagens alagadas por baixo do castelo que saem direto perto da torre do círculo — pulando o torreão. Recompense a mesa que preferir diplomacia a espada.',
        encontro: [], saidas: [
          { para: 'e6_hub', rotulo: 'Voltar ao pátio', aviso: '' },
          { para: 'e6_tuneis', rotulo: 'Aceitar o trato e usar os túneis', aviso: '' },
        ],
      },
      {
        id: 'e6_ancoradouro', titulo: 'O ancoradouro podre', tipo: 'social',
        narracao: 'Tábuas apodrecidas rangem sobre a água preta enquanto mais uma barcaça encosta. A rotina é sempre a mesma: homens-lagarto puxam as cordas, bullywugs coaxam ordens que ninguém obedece, e cultistas contam cada arca num rol antes de mandá-la para a torre do fundo. Ninguém conta as arcas que SAEM — porque nenhuma sai.',
        notasMestre: 'Cena de observação (e o melhor lugar para cruzar com Snapjaw). Percepção CD 11: o fluxo é só de entrada — tudo some na torre do fundo (a pista do círculo). Investigação nos róis largados: nomes de vilas saqueadas, e a assinatura de Rezmir conferindo a carga. Aqui também dá para sabotar barcaças (atrasa o culto) ou roubar um rol como prova para Pharblex (que o culto o trata como carregador) — munição para a revolta.',
        encontro: [], saidas: [
          { para: 'e6_hub', rotulo: 'Voltar às sombras do castelo', aviso: '' },
          { para: 'e6_lagartos', rotulo: 'Puxar conversa com os homens-lagarto', aviso: '' },
        ],
      },
      {
        id: 'e6_celas', titulo: 'As celas do subsolo', tipo: 'encontro',
        narracao: 'Uma escada estreita desce da muralha para um corredor alagado de celas. Lá dentro, encolhidos na água até os tornozelos, meia dúzia de prisioneiros — carroceiros, um mercador, gente que viu o que não devia na estrada. Um guarda cochila numa banqueta com as chaves no cinto, e um draco dorme enrolado a seus pés.',
        notasMestre: 'Cena de resgate opcional — e de consciência. 1× Garra do Dragão + 1× Guarda Draco (Furtividade CD 13 para pegar as chaves sem luta). Os prisioneiros não sabem lutar, mas sabem coisas: os horários do culto, que "a mulher de escamas negras manda em tudo" e que ninguém que entra na torre do fundo volta. Libertá-los é um problema (como tirá-los do brejo?) e uma vantagem: soltos no meio da revolta, viram caos extra. Deixe a mesa decidir — e sentir o peso.',
        encontro: [{ nome: 'Garra do Dragão (Dragonclaw)', qtd: 1 }, { nome: 'Guarda Draco (Guard Drake)', qtd: 1 }],
        saidas: [
          { para: 'e6_hub', rotulo: 'Voltar ao castelo com o que ouviram', aviso: '' },
        ],
      },
      {
        id: 'e6_patio', titulo: 'O pátio do culto', tipo: 'encontro',
        narracao: 'O pátio central é o único pedaço seco do castelo, e é do culto: fogueiras, tendas, dracos acorrentados e cultistas descarregando arcas rumo à torre do fundo. Um deles ergue os olhos para vocês por um segundo a mais do que devia.',
        notasMestre: 'Zona do culto: circular aqui é possível com disfarce (Enganação CD 13) ou furtividade (CD 14). Percepção CD 12: TODAS as arcas somem na torre do fundo e NENHUMA sai de lá — a pista do círculo de teletransporte. Se o disfarce cair, use o encontro (patrulha). Não é o combate principal — é o preço de bisbilhotar sem plano.',
        encontro: [{ nome: 'Cultista', qtd: 4 }, { nome: 'Garra do Dragão (Dragonclaw)', qtd: 1 }, { nome: 'Guarda Draco (Guard Drake)', qtd: 1 }],
        saidas: [
          { para: 'e6_hub', rotulo: 'Recuar para as sombras', aviso: '' },
          { para: 'e6_torreao', rotulo: 'Forçar a entrada do torreão', aviso: 'mortal' },
        ],
      },
      {
        id: 'e6_revolta', titulo: 'O pavio aceso', tipo: 'encontro',
        narracao: 'Basta uma faísca. O coaxar do pátio inundado vira um rugido só, e centenas de bullywugs saltam sobre o pátio do culto ao mesmo tempo — lanças, lama e fúria de anos de humilhação. Os cultistas se fecham no torreão, e o castelo inteiro vira uma guerra de três lados. Ninguém está olhando para a torre do fundo. Ninguém, menos vocês.',
        notasMestre: 'O PAYOFF da política: com os bullywugs (e/ou os homens-lagarto) revoltados, o culto está ocupado demais para guardar o círculo. O encontro abaixo é só o que sobra no caminho — o grosso da luta é cenário ao redor. Deixe a mesa sentir que a diplomacia venceu o que a espada não venceria. Daqui: a torre do fundo, quase sem guarda, ou o torreão para caçar Rezmir no meio do caos.',
        encontro: [{ nome: 'Cultista', qtd: 3 }, { nome: 'Garra do Dragão (Dragonclaw)', qtd: 1 }],
        saidas: [
          { para: 'e6_torre_circulo', rotulo: 'Correr para a torre do fundo no meio do caos', aviso: '' },
          { para: 'e6_torreao', rotulo: 'Caçar Rezmir no torreão', aviso: 'mortal' },
        ],
      },
      {
        id: 'e6_tuneis', titulo: 'Os túneis alagados', tipo: 'assalto',
        narracao: 'Snapjaw abre uma grade enferrujada sob o ancoradouro e desce sem hesitar na água preta até o peito. Por baixo, o castelo é outro: galerias antigas meio submersas, raízes, ossos velhos e o eco de tambores lá em cima. Ninguém patrulha aqui — os cultistas nem sabem que estes túneis existem.',
        notasMestre: 'A rota FURTIVA (recompensa do trato com os homens-lagarto). Sem combate se o grupo seguir Snapjaw (a travessia pede Atletismo CD 10 e tolerância a lugares apertados). Sai direto ao lado da torre do fundo, pulando o pátio e o torreão inteiros. Encontro opcional se quiser tensão: algo que vive na água escura (use 1× Gosma Ocre). É a melhor jogada tática do episódio — deixe brilhar.',
        encontro: [], saidas: [
          { para: 'e6_torre_circulo', rotulo: 'Emergir ao pé da torre do fundo', aviso: '' },
        ],
      },
      {
        id: 'e6_torreao', titulo: 'O torreão do culto', tipo: 'encontro',
        narracao: 'Dentro do torreão o culto vive bem: tapeçarias sobre a pedra úmida, braseiros, mapas na mesa. E, de costas para vocês, estudando um deles, uma figura alta de manto negro e escamas negras se vira devagar — sem pressa nenhuma, como quem já esperava. "Os arruaceiros de Greenest", diz Rezmir. "Vieram longe para morrer molhados."',
        notasMestre: 'O CONFRONTO com Rezmir — duríssimo no nível 5-6 (Meia-Dragã Negra, CR 6: sopro de ácido em linha + Hazirawn). Ela NÃO luta até a morte: aos ~40% dos PV recua para a torre do círculo e TELETRANSPORTA-SE (fugindo com a Máscara Negra — reaparece no Ep8). Isso é o desenho, não um erro: a caçada continua. Se a mesa a derrotar aqui, ótimo — mas ela ainda escapa pelo círculo. Guarda de 2× Garra do Dragão + 1× Fanático. Nos mapas da mesa: o destino do tesouro pelo círculo.',
        encontro: [{ nome: 'Rezmir (Meia-Dragã Negra)', qtd: 1 }, { nome: 'Garra do Dragão (Dragonclaw)', qtd: 2 }, { nome: 'Fanático do Culto (Cult Fanatic)', qtd: 1 }],
        saidas: [
          { para: 'e6_torre_circulo', rotulo: 'Perseguir Rezmir até a torre do fundo', aviso: '' },
        ],
      },
      {
        id: 'e6_torre_circulo', titulo: 'A torre do fundo', tipo: 'social',
        narracao: 'A torre do fundo não tem tesouro nenhum: tem um chão de pedra gasta gravado com um círculo de runas que pulsa num azul doentio. Enquanto vocês olham, dois cultistas empurram uma arca para dentro do círculo — e a arca simplesmente deixa de existir. É assim que o saque de meia dúzia de vilas desaparece do mundo sem deixar rasto.',
        notasMestre: 'A REVELAÇÃO do episódio: um círculo de teletransporte manda o tesouro para longe (o Refúgio de Caça, Ep7 — e de lá para o castelo voador). Decisão: entrar no círculo (Arcanismo CD 13 confirma que é seguro e para onde vai; sem o teste, é um salto no escuro) ou destruí-lo (corta o fluxo, mas perde o rasto — a mesa fica sem saber para onde foi tudo). Se Rezmir fugiu por aqui, ela já está do outro lado, avisando.',
        encontro: [], saidas: [
          { para: 'e6_final_circulo', rotulo: 'Entrar no círculo atrás do tesouro', aviso: '' },
          { para: 'e6_final_destruir', rotulo: 'Destruir o círculo e cortar o fluxo', aviso: '' },
        ],
      },
      {
        id: 'e6_final_circulo', titulo: 'Do outro lado das runas', tipo: 'final', resultado: 'vitoria',
        narracao: 'O brejo some num estalo azul e o ar muda: seco, frio, cheirando a pinho e neve. Vocês caem num salão de madeira escura decorado com troféus de caça, longe — muito longe — de qualquer pântano. As arcas de Greenest estão empilhadas ao lado, e vozes se aproximam pelo corredor. Vocês seguiram o tesouro até o fim do mundo, e o fim do mundo é aqui. — Fim do Episódio 6.',
        notasMestre: 'Vitória plena: o grupo segue o tesouro pelo círculo e chega ao Refúgio de Caça (Ep7) — no meio do inimigo, sem rota de fuga fácil. Recompensas: loot de Rezmir (se caiu) ou do torreão; a gratidão (interesseira) dos bullywugs/homens-lagarto. XP: caminho para o nível 6-7. PRÓXIMO: importar "Ep. 7 — O Refúgio de Caça".',
        encontro: [], saidas: [],
      },
      {
        id: 'e6_final_destruir', titulo: 'O círculo partido', tipo: 'final', resultado: 'vitoria',
        narracao: 'As runas estalam e apagam, e o brejo volta a ser só um brejo. O fluxo do saque parou — o que ainda estiver em Naerytar fica em Naerytar, e o culto perdeu a sua veia. Mas o que já passou pelo círculo está em algum lugar que vocês não sabem apontar num mapa, e Rezmir passou junto. A vitória é real. O rasto, não. — Fim do Episódio 6.',
        notasMestre: 'Vitória "amarga": cortaram o fluxo (o tesouro que restou volta às vilas — ótima reputação) mas perderam o rasto do que já passou. NÃO é beco: no Ep7, o grupo chega ao Refúgio de Caça pelo caminho longo (as anotações de Rezmir/os mapas do torreão dão a região — rede de segurança). Mais lento, e o culto ganha tempo para preparar o castelo voador. XP: nível 6-7. PRÓXIMO: importar "Ep. 7 — O Refúgio de Caça".',
        encontro: [], saidas: [],
      },
      {
        id: 'e6_partir', titulo: 'O brejo fica com ele', tipo: 'final', resultado: 'neutro',
        narracao: 'Naerytar é fundo demais, molhado demais, e são três exércitos contra meia dúzia. Vocês dão meia-volta pelo pântano e deixam as torres tortas para trás. Atrás de vocês, arca após arca entra num círculo de runas azuis e some do mundo — rumo a um lugar onde uma rainha de cinco cabeças espera o suficiente para acordar.',
        notasMestre: 'Beco intencional (não punição): o custo de largar. Retomável pelo hub — o castelo continua lá, e o culto leva semanas para escoar tudo. Se a mesa quiser mesmo parar, os Eps 1-3 fecham um arco digno em Greenest.',
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

// =====================================================================
// CAMPANHA COMPLETA (DERIVADA) — Mina Perdida de Phandelver
// ---------------------------------------------------------------------
// Os 6 capítulos acima são a FONTE ÚNICA DA VERDADE. Este bloco compõe os
// 6 num único grafo (93 nós, nível 1-5) para quem quer importar UMA vez e
// jogar a campanha inteira de ponta a ponta. Como é derivado, corrigir um
// nó no capítulo corrige também a campanha completa — as duas versões
// nunca divergem.
//
// A única transformação: os Finais de "vitória de capítulo" viram nós de
// PASSAGEM (sem `resultado`, com uma saída para o capítulo seguinte). Os
// becos/derrotas (p_phandalin_cedo, p_tpk, ph2_partir, m_alarme, t_partir)
// e os dois desfechos do Cap. 4 continuam Finais de verdade.
// =====================================================================
const PHANDELVER_CAPITULOS = [
  'modelo_phandelver_emboscada',   // Cap. 1  — Emboscada Goblin      (1-2)
  'modelo_phandelver_phandalin',   // Cap. 2A — Phandalin             (2-3)
  'modelo_phandelver_marcarrubra', // Cap. 2B — Esconderijo Marcarrubra (2-3)
  'modelo_phandelver_teia',        // Cap. 3A — A Teia da Aranha      (3-4)
  'modelo_phandelver_castelo',     // Cap. 3B — Castelo Dentefino     (3-4)
  'modelo_phandelver_caverna',     // Cap. 4  — Caverna do Eco das Ondas (4-5)
];

// Final de capítulo -> nó inicial do capítulo seguinte.
const PHANDELVER_TRANSICOES = {
  p_vitoria: { para: 'ph2_chegada', rotulo: '▶ Continuar — Cap. 2A: Phandalin' },
  ph2_final_pronto: { para: 'm_entrada', rotulo: '▶ Continuar — Cap. 2B: Esconderijo Marcarrubra' },
  m_final_lei: { para: 't_hub', rotulo: '▶ Continuar — Cap. 3A: A Teia da Aranha' },
  m_final_halia: { para: 't_hub', rotulo: '▶ Continuar — Cap. 3A: A Teia da Aranha' },
  t_rumo: { para: 'k_aproximacao', rotulo: '▶ Continuar — Cap. 3B: Castelo Dentefino' },
  k_final_mapa: { para: 'w_entrada', rotulo: '▶ Continuar — Cap. 4: Caverna do Eco das Ondas' },
  k_final_memoria: { para: 'w_entrada', rotulo: '▶ Continuar — Cap. 4: Caverna do Eco das Ondas' },
};

function montarCampanhaCompleta(lista, capitulos, transicoes, meta) {
  const nos = [];
  capitulos.forEach(id => {
    const cap = lista.find(a => a.id === id);
    if (!cap) return;
    // cópia profunda: a campanha completa nunca mexe nos capítulos originais
    JSON.parse(JSON.stringify(cap.nos)).forEach(n => {
      const t = transicoes[n.id];
      if (t) {
        n.tipo = 'narracao';
        delete n.resultado;
        n.saidas = [{ para: t.para, rotulo: t.rotulo, aviso: '' }];
        n.notasMestre = (n.notasMestre || '') +
          ' ⏭️ CAMPANHA COMPLETA: não precisa importar nada — siga pela saída abaixo; as fichas e o progresso continuam.';
      }
      nos.push(n);
    });
  });
  return Object.assign({ nos }, meta);
}

AVENTURAS_PRONTAS.push(montarCampanhaCompleta(AVENTURAS_PRONTAS, PHANDELVER_CAPITULOS, PHANDELVER_TRANSICOES, {
  id: 'modelo_phandelver_completa',
  titulo: 'Mina Perdida de Phandelver — CAMPANHA COMPLETA (Cap. 1 ao 4)',
  limites: { jogadoresMax: 5, nivelMin: 1, nivelMax: 5 },
  noInicial: 'p_estrada',
}));

// Export para o harness de testes em Node (no browser é ignorado)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AVENTURAS_PRONTAS, montarCampanhaCompleta };
}
