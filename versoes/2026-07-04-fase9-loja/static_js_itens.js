// Catálogo padrão de itens (baseado no equipamento do Livro do Jogador 5e)
const ITENS_PADRAO = [
  // Armas simples
  { nome: 'Adaga', categoria: 'Arma', preco: '2 po', peso: '1 kg', descricao: '1d4 perfurante, leve, acuidade, arremesso (6/18m)' },
  { nome: 'Machadinha', categoria: 'Arma', preco: '5 po', peso: '0,9 kg', descricao: '1d6 corte, leve, arremesso (6/18m)' },
  { nome: 'Maça', categoria: 'Arma', preco: '5 po', peso: '2 kg', descricao: '1d6 concussão' },
  { nome: 'Martelo Leve', categoria: 'Arma', preco: '2 po', peso: '1 kg', descricao: '1d4 concussão, leve, arremesso (6/18m)' },
  { nome: 'Lança', categoria: 'Arma', preco: '1 po', peso: '1,5 kg', descricao: '1d6 perfurante, arremesso (6/18m), versátil 1d8' },
  { nome: 'Bastão', categoria: 'Arma', preco: '2 sp', peso: '2 kg', descricao: '1d6 concussão, versátil 1d8' },
  { nome: 'Arco Curto', categoria: 'Arma', preco: '25 po', peso: '1 kg', descricao: '1d6 perfurante, munição (24/96m), duas mãos' },

  // Armas marciais
  { nome: 'Espada Longa', categoria: 'Arma', preco: '15 po', peso: '1,5 kg', descricao: '1d8 corte, versátil 1d10' },
  { nome: 'Espada Curta', categoria: 'Arma', preco: '10 po', peso: '1 kg', descricao: '1d6 perfurante, leve, acuidade' },
  { nome: 'Machado de Batalha', categoria: 'Arma', preco: '10 po', peso: '2 kg', descricao: '1d8 corte, versátil 1d10' },
  { nome: 'Espadão', categoria: 'Arma', preco: '50 po', peso: '3 kg', descricao: '2d6 corte, pesada, duas mãos' },
  { nome: 'Machado Grande', categoria: 'Arma', preco: '30 po', peso: '3 kg', descricao: '1d12 corte, pesada, duas mãos' },
  { nome: 'Rapieira', categoria: 'Arma', preco: '25 po', peso: '1 kg', descricao: '1d8 perfurante, acuidade' },
  { nome: 'Arco Longo', categoria: 'Arma', preco: '50 po', peso: '1 kg', descricao: '1d8 perfurante, munição (45/180m), pesada, duas mãos' },
  { nome: 'Besta Leve', categoria: 'Arma', preco: '25 po', peso: '2,5 kg', descricao: '1d8 perfurante, munição (24/96m), carregar, duas mãos' },
  { nome: 'Besta Pesada', categoria: 'Arma', preco: '50 po', peso: '9 kg', descricao: '1d10 perfurante, munição (30/120m), pesada, carregar, duas mãos' },
  { nome: 'Alabarda', categoria: 'Arma', preco: '20 po', peso: '3 kg', descricao: '1d10 corte, pesada, alcance, duas mãos' },

  // Armaduras
  { nome: 'Armadura de Couro', categoria: 'Armadura', preco: '10 po', peso: '5 kg', descricao: 'CA 11 + mod. Destreza, leve' },
  { nome: 'Couro Batido', categoria: 'Armadura', preco: '45 po', peso: '6,5 kg', descricao: 'CA 12 + mod. Destreza, leve' },
  { nome: 'Cota de Malha', categoria: 'Armadura', preco: '75 po', peso: '20 kg', descricao: 'CA 16, força 13 recomendada, pesada' },
  { nome: 'Cota de Placas', categoria: 'Armadura', preco: '1500 po', peso: '32,5 kg', descricao: 'CA 18, força 15 recomendada, pesada, desvantagem furtividade' },
  { nome: 'Escudo', categoria: 'Armadura', preco: '10 po', peso: '3 kg', descricao: '+2 CA' },
  { nome: 'Camisão de Malha', categoria: 'Armadura', preco: '50 po', peso: '10 kg', descricao: 'CA 13 + mod. Destreza (máx 2), média' },

  // Equipamento de aventura
  { nome: 'Mochila', categoria: 'Aventura', preco: '2 po', peso: '2,5 kg', descricao: 'Carrega itens diversos' },
  { nome: 'Corda de Cânhamo (15m)', categoria: 'Aventura', preco: '1 po', peso: '5 kg', descricao: 'Útil para escalar e amarrar' },
  { nome: 'Kit de Suprimentos de Cura', categoria: 'Aventura', preco: '5 po', peso: '1,5 kg', descricao: '10 usos, estabiliza criaturas' },
  { nome: 'Tocha', categoria: 'Aventura', preco: '1 pc', peso: '0,5 kg', descricao: 'Ilumina 6m por 1 hora' },
  { nome: 'Lanterna (Capuz)', categoria: 'Aventura', preco: '5 po', peso: '1 kg', descricao: 'Ilumina 9m, gasta óleo' },
  { nome: 'Óleo (frasco)', categoria: 'Aventura', preco: '1 po', peso: '0,5 kg', descricao: 'Combustível para lanterna, 6h' },
  { nome: 'Ração de Viagem (1 dia)', categoria: 'Aventura', preco: '5 sp', peso: '1 kg', descricao: 'Alimento que não estraga' },
  { nome: 'Cantil', categoria: 'Aventura', preco: '2 sp', peso: '2,5 kg (cheio)', descricao: 'Armazena água/líquidos por 4 dias' },
  { nome: 'Saco de Dormir', categoria: 'Aventura', preco: '1 po', peso: '3,5 kg', descricao: 'Para descanso ao relento' },
  { nome: 'Pé de Cabra', categoria: 'Aventura', preco: '2 po', peso: '2,5 kg', descricao: 'Vantagem para forçar portas/baús' },
  { nome: 'Poção de Cura', categoria: 'Aventura', preco: '50 po', peso: '0,25 kg', descricao: 'Recupera 2d4+2 PV ao beber' },
  { nome: 'Flechas (20)', categoria: 'Aventura', preco: '1 po', peso: '1,5 kg', descricao: 'Munição para arcos' },
  { nome: 'Bestas Virotes (20)', categoria: 'Aventura', preco: '1 po', peso: '0,75 kg', descricao: 'Munição para bestas' },

  // Ferramentas
  { nome: 'Ferramentas de Ladrão', categoria: 'Ferramenta', preco: '25 po', peso: '0,5 kg', descricao: 'Necessário para arrombar fechaduras e desarmar armadilhas' },
  { nome: 'Kit de Disfarce', categoria: 'Ferramenta', preco: '25 po', peso: '1,5 kg', descricao: 'Cosméticos, tinturas e itens para disfarces' },
  { nome: 'Suprimentos de Curandeiro', categoria: 'Ferramenta', preco: '5 po', peso: '1,5 kg', descricao: 'Necessário para usar a perícia Medicina' },
  { nome: 'Ferramentas de Falsificador', categoria: 'Ferramenta', preco: '15 po', peso: '2,5 kg', descricao: 'Criar documentos e selos falsos' },

  // Montarias/Veículos
  { nome: 'Cavalo de Montaria', categoria: 'Montaria', preco: '75 po', peso: '-', descricao: 'Deslocamento 18m, capacidade 540kg' },
  { nome: 'Mula', categoria: 'Montaria', preco: '8 po', peso: '-', descricao: 'Deslocamento 12m, carga pesada' },
  { nome: 'Carroça', categoria: 'Montaria', preco: '35 po', peso: '-', descricao: 'Transporte de carga, deslocamento 9m' },
  { nome: 'Barco a Remo', categoria: 'Montaria', preco: '50 po', peso: '-', descricao: 'Deslocamento 4,5km/h em água' },

];

// =====================================================
// ITENS MÁGICOS (PHB/DMG) — com raridade, sintonização e efeito
// sintonia=true exige sintonização (máx. 3 itens sintonizados por personagem)
// =====================================================
const ITENS_MAGICOS = [
  // Poções (consumíveis, sem sintonização)
  { nome: 'Poção de Cura Maior', raridade: 'Incomum', sintonia: false, tipo: 'Poção', peso: '0,25 kg', efeito: 'Recupera 4d4+4 PV ao beber.' },
  { nome: 'Poção de Cura Superior', raridade: 'Raro', sintonia: false, tipo: 'Poção', peso: '0,25 kg', efeito: 'Recupera 8d4+8 PV ao beber.' },
  { nome: 'Poção de Força do Gigante da Colina', raridade: 'Incomum', sintonia: false, tipo: 'Poção', peso: '0,25 kg', efeito: 'Sua Força vira 21 por 1 hora.' },
  { nome: 'Poção de Resistência', raridade: 'Incomum', sintonia: false, tipo: 'Poção', peso: '0,25 kg', efeito: 'Resistência a um tipo de dano por 1 hora.' },
  { nome: 'Poção de Voo', raridade: 'Raro', sintonia: false, tipo: 'Poção', peso: '0,25 kg', efeito: 'Ganha deslocamento de voo de 18m por 1 hora.' },
  { nome: 'Poção de Invisibilidade', raridade: 'Muito raro', sintonia: false, tipo: 'Poção', peso: '0,25 kg', efeito: 'Fica invisível por 1 hora (acaba se atacar/conjurar).' },
  // Armas e armaduras
  { nome: 'Espada Longa +1', raridade: 'Incomum', sintonia: false, tipo: 'Arma', peso: '1,5 kg', efeito: '+1 nas jogadas de ataque e dano (1d8+1 corte mágico).' },
  { nome: 'Espada Flamejante', raridade: 'Raro', sintonia: true, tipo: 'Arma', peso: '1,5 kg', efeito: 'Por ação bônus pega fogo: +2d6 de dano de fogo e emite luz.' },
  { nome: 'Armadura +1', raridade: 'Raro', sintonia: false, tipo: 'Armadura', peso: '-', efeito: '+1 na Classe de Armadura.' },
  { nome: 'Escudo +1', raridade: 'Incomum', sintonia: false, tipo: 'Armadura', peso: '3 kg', efeito: '+1 na CA, além do bônus normal de escudo.' },
  // Anéis (sintonização)
  { nome: 'Anel de Proteção', raridade: 'Raro', sintonia: true, tipo: 'Anel', peso: '-', efeito: '+1 na CA e em todas as salvaguardas.' },
  { nome: 'Anel de Resistência', raridade: 'Raro', sintonia: true, tipo: 'Anel', peso: '-', efeito: 'Resistência a um tipo de dano (definido pela gema).' },
  { nome: 'Anel de Ação Livre', raridade: 'Raro', sintonia: true, tipo: 'Anel', peso: '-', efeito: 'Imune a terreno difícil; não pode ser paralisado/agarrado por magia.' },
  { nome: 'Anel de Saltos', raridade: 'Incomum', sintonia: true, tipo: 'Anel', peso: '-', efeito: 'Conjura Saltar em si mesmo à vontade (ação bônus).' },
  // Maravilhosos
  { nome: 'Capa de Proteção', raridade: 'Raro', sintonia: true, tipo: 'Maravilhoso', peso: '1 kg', efeito: '+1 na CA e em todas as salvaguardas.' },
  { nome: 'Manto Élfico', raridade: 'Incomum', sintonia: true, tipo: 'Maravilhoso', peso: '0,5 kg', efeito: 'Vantagem em Furtividade; criaturas têm desvantagem para te perceber pela visão.' },
  { nome: 'Botas Aladas', raridade: 'Incomum', sintonia: true, tipo: 'Maravilhoso', peso: '0,5 kg', efeito: 'Deslocamento de voo igual ao seu, até 4 horas (recarrega 2h/dia).' },
  { nome: 'Botas da Rapidez', raridade: 'Raro', sintonia: true, tipo: 'Maravilhoso', peso: '0,5 kg', efeito: 'Ação bônus: dobra o deslocamento e ataques de oportunidade têm desvantagem (até 10 min/descanso).' },
  { nome: 'Amuleto da Saúde', raridade: 'Raro', sintonia: true, tipo: 'Maravilhoso', peso: '-', efeito: 'Sua Constituição vira 19 enquanto sintonizado.' },
  { nome: 'Cinto da Força do Gigante da Pedra', raridade: 'Muito raro', sintonia: true, tipo: 'Maravilhoso', peso: '0,5 kg', efeito: 'Sua Força vira 23 enquanto sintonizado.' },
  { nome: 'Pedra da Sorte', raridade: 'Incomum', sintonia: true, tipo: 'Maravilhoso', peso: '-', efeito: '+1 em testes de habilidade e salvaguardas.' },
  { nome: 'Bolsa de Devoração (Bag of Holding)', raridade: 'Incomum', sintonia: false, tipo: 'Maravilhoso', peso: '7 kg', efeito: 'Espaço extradimensional: guarda até 250 kg / 1,1 m³ pesando sempre 7 kg.' },
  // Varinhas / cajados
  { nome: 'Varinha de Mísseis Mágicos', raridade: 'Incomum', sintonia: false, tipo: 'Varinha', peso: '0,5 kg', efeito: '7 cargas: gasta 1+ para conjurar Mísseis Mágicos (recupera 1d6+1/amanhecer).' },
  { nome: 'Varinha da Teia', raridade: 'Incomum', sintonia: true, tipo: 'Varinha', peso: '0,5 kg', efeito: '7 cargas: conjura Teia (CD 15) gastando 1 carga.' },
  { nome: 'Cajado da Cura', raridade: 'Raro', sintonia: true, tipo: 'Cajado', peso: '2 kg', efeito: 'Cargas para conjurar Curar Ferimentos, Restauração Menor e Cura em Massa.' },
  // Pergaminhos
  { nome: 'Pergaminho de Proteção', raridade: 'Raro', sintonia: false, tipo: 'Pergaminho', peso: '-', efeito: 'Proteção contra um tipo de criatura (à escolha) por 5 minutos.' },
];

// Adiciona os itens mágicos ao catálogo da loja/inventário (com a etiqueta de raridade no preço)
ITENS_MAGICOS.forEach(im => ITENS_PADRAO.push({
  nome: im.nome, categoria: 'Mágico', preco: im.raridade, peso: im.peso || '-',
  descricao: im.efeito + (im.sintonia ? ' (requer sintonização)' : ''),
}));

// Lookup do item mágico estruturado por nome — inclui itens criados pelo
// Mestre na ferramenta de criação (window.ITENS_MESTRE, carregados à parte
// do acervo/loja do jogador), para que sintonização/inventário reconheçam
// o item assim que o Mestre o enviar a uma ficha.
function itemMagico(nome) {
  return ITENS_MAGICOS.find(i => i.nome === nome)
    || (window.ITENS_MESTRE || []).find(i => i.nome === nome)
    || null;
}
