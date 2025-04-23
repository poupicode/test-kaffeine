 // Import the functions you need from the SDKs you need
 import { initializeApp } from "firebase/app";
 import { getFirestore } from "firebase/firestore";


 // Firebase configuration
 const firebaseConfig = {
    apiKey: "AIzaSyDu-Qeg0bX0LAPjMKpxxHMVaSxJ2D76zIs",
    authDomain: "fir-rtc-2c9d4.firebaseapp.com",
    databaseURL: "https://fir-rtc-2c9d4-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fir-rtc-2c9d4",
    storageBucket: "fir-rtc-2c9d4.appspot.com",
    messagingSenderId: "222676364450",
    appId: "1:222676364450:web:1981eae93cfd3647b43bfb",
    measurementId: "G-VVQWJHK5CR"
}
 
// Initialize Firebase
 
const app = initializeApp(firebaseConfig);

// Export firestore database
// It will be imported into your react app whenever it is needed
export const db = getFirestore(app);

