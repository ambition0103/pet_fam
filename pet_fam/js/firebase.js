// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";

// 아래 데이터는 본인의 Firebase 프로젝트 설정에서 확인할 수 있습니다.
const firebaseConfig = {
  apiKey: "AIzaSyCbanqx-9y7vrwIZeH74tf0QNF8V-KFHPM",
  authDomain: "fetfam-b6471.firebaseapp.com",
  projectId: "fetfam-b6471",
  storageBucket: "fetfam-b6471.appspot.com",
  messagingSenderId: "425548019960",
  appId: "1:425548019960:web:10aee47709ece8846ae30d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const dbService = getFirestore(app);
export const authService = getAuth(app);
export const storageService = getStorage(app);
