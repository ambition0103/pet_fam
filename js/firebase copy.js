// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";
// 아래 데이터는 본인의 Firebase 프로젝트 설정에서 확인할 수 있습니다.
const firebaseConfig = {
  apiKey: "AIzaSyD1X761HKgsGp9BDme7LbMEML4CiI-4PGg",
  authDomain: "sparta-project-abb92.firebaseapp.com",
  projectId: "sparta-project-abb92",
  storageBucket: "sparta-project-abb92.appspot.com",
  messagingSenderId: "227640442522",
  appId: "1:227640442522:web:a65d84dcacacb5451e2923",
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const dbService = getFirestore(app);
export const authService = getAuth(app);
export const storageService = getStorage(app);
