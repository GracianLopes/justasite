// Firebase Configuration - Public Configuration (Read/Write rules set appropriately)
const firebaseConfig = {
    apiKey: "AIzaSyDk_8dQN7pPqL8m5qR9s0tU1vW2xY3z4",
    authDomain: "anniversary-memories-2a7d8.firebaseapp.com",
    databaseURL: "https://anniversary-memories-2a7d8-default-rtdb.firebaseio.com",
    projectId: "anniversary-memories-2a7d8",
    storageBucket: "anniversary-memories-2a7d8.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get reference to database
window.database = firebase.database();
