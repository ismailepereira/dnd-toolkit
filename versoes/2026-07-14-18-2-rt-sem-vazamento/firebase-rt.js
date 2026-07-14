// =====================================================
// FIREBASE - sincronização em TEMPO REAL (somente leitura no cliente)
// O backend (Flask + Admin SDK) é quem escreve; aqui só escutamos.
// Config web (não é segredo).
//
// Fase 10.8: antes de escutar, o cliente troca a sessão Flask por um token
// personalizado do Firebase Auth (/api/firebase_token) — as Regras do
// Firestore (firestore.rules) só deixam ler a campanha de que o utilizador
// é membro/mestre. Se o Auth falhar (ex.: regras antigas ainda públicas,
// produto Auth por ativar), tenta escutar na mesma — degradação suave para
// não quebrar o tempo real durante a transição de regras.
// =====================================================
(function () {
  // Config web partilhada (não é segredo). Exposta em window.FIREBASE_CONFIG
  // para o storage.js (Fase 16.1) reutilizar o MESMO app/auth — inicializar o
  // Firebase duas vezes lançaria erro.
  const firebaseConfig = window.FIREBASE_CONFIG || (window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyAKKSGRPAtfmXgjGDNrqfs5WaoDBZTURHQ",
    authDomain: "ded-aplicativo.firebaseapp.com",
    projectId: "ded-aplicativo",
    storageBucket: "ded-aplicativo.firebasestorage.app",
    messagingSenderId: "474119482441",
    appId: "1:474119482441:web:514be23e3de2349bcaa398",
  });

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

  // Autentica UMA vez por página (promessa partilhada por todos os ouvir()).
  let _authPromessa = null;
  function autenticar() {
    if (!ok) return Promise.resolve(false);
    if (typeof firebase.auth !== 'function') {
      console.warn('[RT] firebase-auth-compat não carregado — a escutar sem login.');
      return Promise.resolve(false);
    }
    if (!_authPromessa) {
      _authPromessa = fetch('/api/firebase_token')
        .then(r => r.json())
        .then(d => {
          if (!d.disponivel || !d.token) { console.warn('[RT] Token de Auth indisponível — a escutar sem login.'); return false; }
          return firebase.auth().signInWithCustomToken(d.token).then(() => true);
        })
        .catch(e => {
          console.warn('[RT] Auth falhou — a escutar sem login:', (e && (e.code || e.message)) || e);
          return false;
        });
    }
    return _authPromessa;
  }

  window.RT = {
    ativo: () => ok,
    // Fase 16.1: promessa de login partilhada — o storage.js reutiliza para
    // subir imagens autenticado (mesmo token do backend). Resolve false se o
    // Auth não estiver disponível (degradação suave).
    garantirAuth: () => autenticar(),
    // Escuta o documento da campanha; chama cb(estado) a cada mudança.
    ouvir(cb) {
      if (!ok) return false;
      autenticar().then(() => {
        try {
          const docId = (window.CAMPANHA_ID || 'principal');
          fsdb.collection('campanha').doc(docId).onSnapshot(
            snap => { if (snap.exists) cb(snap.data() || {}); },
            err => console.warn('[RT] onSnapshot erro (verifique as Regras do Firestore / firestore.rules):', err.code || err)
          );
        } catch (e) {
          console.warn('[RT] Não foi possível escutar:', e);
        }
      });
      return true;
    },
  };
})();
