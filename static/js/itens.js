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

  // Itens mágicos comuns
  { nome: 'Poção de Cura Maior', categoria: 'Mágico', preco: '~500 po', peso: '0,25 kg', descricao: 'Recupera 4d4+4 PV ao beber' },
  { nome: 'Anel de Proteção', categoria: 'Mágico', preco: 'Raro', peso: '-', descricao: '+1 CA e testes de resistência (requer sintonização)' },
  { nome: 'Capa de Proteção', categoria: 'Mágico', preco: 'Raro', peso: '1 kg', descricao: '+1 CA e testes de resistência (requer sintonização)' },
  { nome: 'Bolsa de Devoração', categoria: 'Mágico', preco: 'Incomum', peso: '14,5 kg', descricao: 'Espaço extradimensional, 250kg de capacidade' },
  { nome: 'Pergaminho de Proteção', categoria: 'Mágico', preco: 'Raro', peso: '-', descricao: 'Proteção contra um tipo de criatura por 5 minutos' },
];
