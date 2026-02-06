// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCt2jF1NoRzG9qYYrAPk_61fgmiQKr57mc",
    authDomain: "f1hub-f2b4a.firebaseapp.com",
    projectId: "f1hub-f2b4a",
    storageBucket: "f1hub-f2b4a.firebasestorage.app",
    messagingSenderId: "134793378457",
    appId: "1:134793378457:web:f60707d523f44770c1d608"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
import { getAuth } from 'firebase/auth';
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
import { initializeFirestore } from 'firebase/firestore';
const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
});

// Initialize Cloud Storage
import { getStorage } from 'firebase/storage';
const storage = getStorage(app);

export { auth, db, storage };

