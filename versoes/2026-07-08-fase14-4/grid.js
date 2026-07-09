// =====================================================================
// GRID.JS (Fase 14.1) — matemática de grelha para o combate, pura e sem DOM.
// ---------------------------------------------------------------------
// Regras 5e: 1 quadrado = 1,5 m; diagonal conta como 1 quadrado (Chebyshev).
// Trabalha só com a grelha LÓGICA (posições {x,y} em quadrados) — não sabe
// nada de SVG/canvas. Testável isoladamente (mesmo padrão de multiclasse.js).
// =====================================================================
const Grid = (function () {
  const METROS_POR_QUADRO = 1.5;

  // Distância de Chebyshev em quadrados (diagonal = 1). Infinity se faltar pos.
  function distanciaQuadros(a, b) {
    if (!a || !b) return Infinity;
    return Math.max(Math.abs((a.x || 0) - (b.x || 0)), Math.abs((a.y || 0) - (b.y || 0)));
  }
  function distanciaMetros(a, b) { return distanciaQuadros(a, b) * METROS_POR_QUADRO; }

  // Adjacência de corpo a corpo: mesma célula (0) ou vizinha (1 quadrado).
  function adjacentes(a, b) {
    const d = distanciaQuadros(a, b);
    return d === 0 || d === 1;
  }

  function dentroDoAlcanceMetros(a, b, alcanceM) {
    return distanciaMetros(a, b) <= (Number(alcanceM) || 0);
  }

  // Extrai o alcance em METROS de textos como "18m", "(24/96m)", "corpo a corpo".
  // Retorna null quando não há número (ex.: alcance "Toque"/"Pessoal").
  function parseAlcanceMetros(txt) {
    const s = String(txt || '');
    if (/corpo a corpo|toque|pessoal/i.test(s)) return METROS_POR_QUADRO; // 1 quadrado
    const m = s.match(/(\d+)\s*(?:\/\s*\d+)?\s*m/i);
    return m ? Number(m[1]) : null;
  }

  // Está a posição dentro de uma área de efeito? v1: círculo/esfera.
  function dentroDaArea(pos, area) {
    if (!area || !pos || !area.centro) return false;
    const tipo = area.tipo || 'circulo';
    if (tipo === 'circulo' || tipo === 'esfera') {
      return distanciaQuadros(pos, area.centro) <= (Number(area.raioQuadros) || 0);
    }
    return false; // cone/linha ficam para uma sub-fase posterior (14.5)
  }

  function combatentesNaArea(combatentes, area) {
    return (combatentes || []).filter(c => c.pos && dentroDaArea(c.pos, area));
  }

  // Células percorridas entre a e b (Bresenham), EXCLUINDO os dois extremos.
  function celulasEntre(a, b) {
    const cel = [];
    if (!a || !b) return cel;
    let x = a.x, y = a.y;
    const x1 = b.x, y1 = b.y;
    const dx = Math.abs(x1 - x), dy = Math.abs(y1 - y);
    const sx = x < x1 ? 1 : -1, sy = y < y1 ? 1 : -1;
    let err = dx - dy;
    // limite de segurança para grelhas grandes/entradas inválidas
    for (let passos = 0; passos < 1000; passos++) {
      const inicio = (x === a.x && y === a.y);
      const fim = (x === x1 && y === y1);
      if (!inicio && !fim) cel.push({ x, y });
      if (fim) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
    return cel;
  }

  // Linha de visão limpa? Falha se alguma célula no caminho bloqueia visão.
  function temLinhaDeVisao(a, b, obstaculos) {
    const bloq = new Set(
      (obstaculos || []).filter(o => o && o.bloqueiaVisao).map(o => o.x + ',' + o.y)
    );
    if (!bloq.size) return true;
    return !celulasEntre(a, b).some(c => bloq.has(c.x + ',' + c.y));
  }

  return {
    METROS_POR_QUADRO,
    distanciaQuadros, distanciaMetros, adjacentes,
    dentroDoAlcanceMetros, parseAlcanceMetros,
    dentroDaArea, combatentesNaArea,
    celulasEntre, temLinhaDeVisao,
  };
})();

if (typeof window !== 'undefined') window.Grid = Grid;
if (typeof module !== 'undefined' && module.exports) module.exports = { Grid };
