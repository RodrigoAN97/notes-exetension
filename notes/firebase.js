// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: 'AIzaSyDaYEYyXbC3la_WLvcRSCkh6tttgPddIQw',
  authDomain: 'notes-extension-c2fe4.firebaseapp.com',
  projectId: 'notes-extension-c2fe4',
  storageBucket: 'notes-extension-c2fe4.appspot.com',
  messagingSenderId: '274571857059',
  appId: '1:274571857059:web:d0e02065161711706d0316',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// console.log(firebase);

chrome.runtime.onMessage.addListener((message, sender, response) => {
  if (message.command === 'fetchNotes') {
    firebase
      .firestore()
      .collection('notes')
      .get()
      .then((querySnapshot) => {
        console.log(querySnapshot);
        // response({ type: 'result', status: 'success', data: querySnapshot.val(), request: message });
        let data = [];
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          data.push({ ...doc.data(), id: doc.id });
          console.log(doc.id, ' => ', doc.data());
        });
        response({ type: 'result', status: 'success', data: data, request: message });
      })
      .catch((error) => {
        console.log('Error getting documents: ', error);
      });
  }

  if (message.command === 'deleteNote') {
    const noteId = message.data.id;
    if (noteId) {
      try {
        const docRef = firebase.firestore().collection('notes').doc(noteId);
        docRef.delete();
        response({ type: 'result', status: 'success', id: noteId, request: message });
      } catch (err) {
        console.error(err);
        response({ type: 'result', status: 'error', data: err, request: message });
      }
    }
  }

  if (message.command === 'postNote') {
    const title = message.data.title;
    const body = message.data.body;
    const icon = message.data.icon;
    const noteId = message.data.noteId;

    try {
      if (!noteId) {
        const docRef = firebase.firestore().collection('notes').doc();
        docRef.set({ title: title, icon: icon, body: body });
        docId = docRef.id;
        response({ type: 'result', status: 'success', id: docId, request: message });
      } else {
        const docRef = firebase.firestore().collection('notes').doc(noteId);
        docRef.update({ title: title, icon: icon, body: body });
        response({ type: 'result', status: 'success', id: noteId, request: message });
      }
    } catch (err) {}
  }

  if (message.command === 'signIn') {
    let email = message.data.email;
    let password = message.data.password;

    firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      response({ type: 'auth', status: 'error', message: error });
    });

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        response({ type: 'auth', status: 'success', message: user });
      } else {
        console.log('no user');
      }
    });
  }

  if (message.command === 'checkAuth') {
    let user = firebase.auth().currentUser;
    if (user) {
      response({ type: 'auth', status: 'success', message: user });
    } else {
      response({ type: 'auth', status: 'no-auth', message: false });
    }
  }

  if (message.command === 'logout') {
    firebase.auth().signOut().then(
      () => {
        response({ type: 'auth', status: 'success', message: false });
      },
      (error) => {
        response({ type: 'auth', status: 'error', message: error });
      },
    );
  }

  return true;
});
