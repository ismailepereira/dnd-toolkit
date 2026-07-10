// =====================================================
// FIREBASE STORAGE — upload de imagens (Fase 16.1)
// -----------------------------------------------------
// Helper de subida para miniaturas de personagem (e, depois, mapas/monstros).
// Reutiliza o app/auth já inicializados por firebase-rt.js (carregado ANTES
// deste ficheiro) e o mesmo login por token do backend (/api/firebase_token).
//
// Exposto como window.Armazenamento (NÃO window.Storage — esse nome é a
// interface nativa do localStorage).
//
// Degradação suave: se o SDK do Storage não carregou ou o produto não está
// ativo no Console, disponivel() devolve false e enviar*() rejeita com uma
// mensagem amigável que a UI mostra ("ative o Storage no Firebase").
//
// PRÉ-REQUISITO (manual, uma vez): Console do Firebase → Storage → Começar,
// e publicar storage.rules. Sem isso, o upload falha com permission-denied /
// storage/unknown.
// =====================================================
(function () {
  const CFG = window.FIREBASE_CONFIG;
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — igual ao teto das regras
  const TIPOS_OK = ['image/png', 'image/webp', 'image/jpeg'];

  let storage = null;
  try {
    if (typeof firebase !== 'undefined' && typeof firebase.storage === 'function') {
      // firebase-rt.js já chamou initializeApp; se por algum motivo não, tenta.
      if (firebase.apps && firebase.apps.length === 0 && CFG) firebase.initializeApp(CFG);
      storage = firebase.storage();
    } else {
      console.warn('[Storage] SDK firebase-storage-compat não carregou.');
    }
  } catch (e) {
    console.warn('[Storage] Falha ao iniciar Storage:', e);
  }

  function sanitizarNome(nome) {
    return (nome || 'img')
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(-60) || 'img';
  }

  function extDe(file) {
    const m = { 'image/png': 'png', 'image/webp': 'webp', 'image/jpeg': 'jpg' };
    return m[file.type] || 'png';
  }

  // Valida cliente-lado antes de gastar rede. Lança Error com msg amigável.
  function validar(file) {
    if (!file) throw new Error('Nenhum ficheiro selecionado.');
    if (!TIPOS_OK.includes(file.type)) {
      throw new Error('Formato inválido. Use PNG, WebP ou JPG.');
    }
    if (file.size > MAX_BYTES) {
      throw new Error(`Imagem muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo 5 MB.`);
    }
  }

  // Sobe o ficheiro para `caminho` e devolve a URL pública. onProgress(0..100).
  function enviar(caminho, file, onProgress) {
    if (!storage) {
      return Promise.reject(new Error('Armazenamento indisponível — ative o Storage no Console do Firebase.'));
    }
    validar(file);
    const login = (window.RT && window.RT.garantirAuth) ? window.RT.garantirAuth() : Promise.resolve(false);
    return login.then(() => new Promise((resolve, reject) => {
      const ref = storage.ref().child(caminho);
      const tarefa = ref.put(file, { contentType: file.type });
      tarefa.on('state_changed',
        snap => {
          if (typeof onProgress === 'function' && snap.totalBytes) {
            onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
          }
        },
        err => {
          const cod = (err && err.code) || '';
          if (cod === 'storage/unauthorized') reject(new Error('Sem permissão para enviar (verifique as Regras do Storage).'));
          else if (cod === 'storage/unknown') reject(new Error('Storage não configurado — ative-o no Console do Firebase.'));
          else reject(new Error('Falha no envio: ' + (err && (err.message || cod) || err)));
        },
        () => ref.getDownloadURL().then(resolve).catch(reject)
      );
    }));
  }

  const campanha = () => window.CAMPANHA_ID || 'principal';

  window.Armazenamento = {
    disponivel: () => !!storage,
    MAX_BYTES,
    TIPOS_OK,

    // Miniatura de personagem (PNG/WebP sem fundo, ou JPG). Vai para a pasta
    // do dono (uid) — as regras só deixam o dono escrever ali.
    enviarMiniatura(file, opts) {
      opts = opts || {};
      const uid = opts.uid || window.MEU_UID || 'anon';
      const nome = `${Date.now()}-${sanitizarNome(file && file.name)}.${extDe(file)}`;
      const caminho = `campanhas/${opts.campanhaId || campanha()}/miniaturas/${uid}/${nome}`;
      return enviar(caminho, file, opts.onProgress);
    },

    // Mapa / imagem de nó (Fase 16.2). JPG grande é normal aqui.
    enviarMapa(file, opts) {
      opts = opts || {};
      const nome = `${Date.now()}-${sanitizarNome(file && file.name)}.${extDe(file)}`;
      const caminho = `campanhas/${opts.campanhaId || campanha()}/mapas/${nome}`;
      return enviar(caminho, file, opts.onProgress);
    },
  };
})();
