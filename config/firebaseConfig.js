var admin = require("firebase-admin");

var serviceAccount = require("../config/firebaseServiceAccountKey.json");

const firebaseConfig = {
  apiKey: "AIzaSyCz1aUGq1yAe5gfEambA4EAJlVRIFYik8Q",
  authDomain: "goglobalshareholder.firebaseapp.com",
  projectId: "goglobalshareholder",
  storageBucket: "goglobalshareholder.appspot.com",
  messagingSenderId: "346818643054",
  appId: "1:346818643054:web:6f865bc3cd14b3399d127f",
  credential: admin.credential.cert(serviceAccount)
};


const app = admin.initializeApp(firebaseConfig);
const auth = admin.auth()
module.exports = {
  auth
} 
