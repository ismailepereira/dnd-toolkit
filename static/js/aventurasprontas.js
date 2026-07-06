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
];

// Export para o harness de testes em Node (no browser é ignorado)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AVENTURAS_PRONTAS };
}
