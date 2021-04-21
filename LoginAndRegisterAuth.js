//Logowanie
function LogIn() {
  const userSIEmail = document.getElementById("userSIEmail").value;
  const userSIPassword = document.getElementById("userSIPassword").value;
  

  firebase
    .auth()
    .signInWithEmailAndPassword(userSIEmail, userSIPassword)
    .then((value) => {
      const { uid, email } = firebase.auth().currentUser;
      //console.log('uid: ', uid);
      //console.log('email: ', email);
      //document.cookie = "username=" + email;
      sessionStorage.setItem("username", uid);
      //var x = document.cookie;
      //console.log('cookie', x);
      //Logowanie poszło pomyslnie
      window.location.replace("/main/main.html");
    })
    .catch((error) => {
      // Error podczas logowania
      alert("Sprawdź login i hasło");
    });


  // firebase
  //   .auth()
  //   .signInWithEmailAndPassword(userSIEmail, userSIPassword)
  //   .then((value) => {
  //     //Logowanie poszło pomyslnie
  //     window.location.replace("/main/main.html");
  //   })
  //   .catch((error) => {
  //     // Error podczas logowania
  //     alert("Sprawdź login i hasło");
  //   });
}

//Rejestracja
function RegisterAccount() {
  const userEmail = document.getElementById("userEmail").value;
  const userPassword = document.getElementById("userPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  
  const userEmailFormate = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const userPasswordFormate = /(?=.*[a-z])(?=.*[A-Z]).{6,}/;

  const checkUserEmailValid = userEmail.match(userEmailFormate);
  const checkUserPasswordValid = userPassword.match(userPasswordFormate);

  if (userPassword !== confirmPassword) {
    alert("Hasła są różne");
  } else {
    if (checkUserEmailValid === null) {
      alert("Wprowadź poprawny email");
    } else if (checkUserPasswordValid === null) {
      alert("Hasło musi mieć min. 6 znaków, jedną mała i duża litere");
    } else {
      firebase
        .auth()
        .createUserWithEmailAndPassword(userEmail, userPassword)
        .then((value) => {
          const user = firebase.auth().currentUser;
          sessionStorage.setItem("username", uid);
          //Rejestracja poszła pomyslnie
          window.location.replace("/index.html");
        })
        .catch((error) => {
          //Error podczas rejestracji
          alert("Cos poszło nie tak podczas rejestracji");
        });
    }
  }
}




//Rejestracja za pomocą Facebooka
function checkLoginState(response) {
  if (response.authResponse) {
    // User is signed-in Facebook.
    window.location.replace("/main/main.html");
    const unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!isUserEqual(response.authResponse, firebaseUser)) {
        // Build Firebase credential with the Facebook auth token.
        const credential = firebase.auth.FacebookAuthProvider.credential(
            response.authResponse.accessToken);
        const { uid, email } = firebase.auth().currentUser;
        console.log('wartosc uid', uid);
        // Sign in with the credential from the Facebook user.
        firebase.auth().signInWithCredential(credential)
          .catch((error) => {
            console.error(error);
          });
      } else {
        // User is already signed-in Firebase with the correct user.
      }
    });
  } else {
    // User is signed-out of Facebook.
    firebase.auth().signOut();
  }
}

function isUserEqual(facebookAuthResponse, firebaseUser) {
  if (firebaseUser) {
    const providerData = firebaseUser.providerData;
    for (const i = 0; i < providerData.length; i++) {
      if (providerData[i].providerId === firebase.auth.FacebookAuthProvider.PROVIDER_ID &&
          providerData[i].uid === facebookAuthResponse.userID) {
        // We don't need to re-auth the Firebase connection.
        return true;
      }
    }
  }
  return false;
}


//Wylogowanie
function signOut() {
  firebase.auth().signOut().then(() => {
      // Wylogowanie powiodło się
      window.location.replace("../index.html");
      //alert("wylogowanie powiodło się"); //
      //Ponizej jest wylogowanie z fb
      firebase.auth().signOut();
    })
    .catch((error) => {
      // Error podczas wylogowania
      alert("wylogowanie nie powiodło się");
    });
    
}

//For services workers 
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(res => console.log("Service worker registered"))
      .catch(err => console.log("Service worker not registered", err))
  })
}