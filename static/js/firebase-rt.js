// =====================================================
// FIREBASE - sincronização em TEMPO REAL (somente leitura no cliente)
// O backend (Flask + Admin SDK) é quem escreve; aqui só escutamos.
// Config web (não é segredo).
// =====================================================
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyAKKSGRPAtfmXgjGDNrqfs5WaoDBZTURHQ",
    authDomain: "ded-aplicativo.firebaseapp.com",
    projectId: "ded-aplicativo",
    storageBucket: "ded-aplicativo.firebasestorage.app",
    messagingSenderId: "474119482441",
    appId: "1:474119482441:web:514be23e3de2349bcaa398",
  };

  let fsdb = null, ok = false;
  try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      firebase.initializeApp(firebaseConfig);
      fsdb = firebase.firestore();
      ok = true;
    } else {
      console.warn('[RT] SDK do Firebase não carregou.');
    }
  } catch (e) {
    console.warn('[RT] Falha ao iniciar Firebase:', e);
  }

  window.RT = {
    ativo: () => ok,
    // Escuta o documento da campanha; chama cb(estado) a cada mudança.
    ouvir(cb) {
      if (!ok) return false;
      try {
        fsdb.collection('campanha').doc('principal').onSnapshot(
          snap => { if (snap.exists) cb(snap.data() || {}); },
          err => console.warn('[RT] onSnapshot erro (verifique as Regras do Firestore):', err.code || err)
        );
        return true;
      } catch (e) {
        console.warn('[RT] Não foi possível escutar:', e);
        return false;
      }
    },
  };
})();
