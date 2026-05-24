import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
 
const firebaseConfig = {
    apiKey: "AIzaSyBUTIKxh2N05Xmvzfa9fTkFTN_TTxvPTIA",
    authDomain: "tasksphere-2fb71.firebaseapp.com",
    projectId: "tasksphere-2fb71",
    storageBucket: "tasksphere-2fb71.firebasestorage.app",
    messagingSenderId: "146031809729",
    appId: "1:146031809729:web:eeec68ff2afbb836bcf040"
};
 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
 
export { db };