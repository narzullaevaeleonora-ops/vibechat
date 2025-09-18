import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ====== ТВОЙ firebaseConfig ======
const firebaseConfig = {
  apiKey: "AIzaSyAGopVUpkWCIw6u9oMC-RTabGbg7PgPVSw",
  authDomain: "vibechat-f931b.firebaseapp.com",
  projectId: "vibechat-f931b",
  storageBucket: "vibechat-f931b.firebasestorage.app",
  messagingSenderId: "819501932717",
  appId: "1:819501932717:web:7d4470f7e0fbf36c68a624",
  measurementId: "G-2679944J8M"
};
// =================================

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const authError = document.getElementById("auth-error");

const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");
const userEmailSpan = document.getElementById("userEmail");

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Регистрация
signupBtn.addEventListener("click", async () => {
  authError.textContent = "";
  try {
    await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
  } catch (e) {
    authError.textContent = e.message;
  }
});

// Вход
loginBtn.addEventListener("click", async () => {
  authError.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
  } catch (e) {
    authError.textContent = e.message;
  }
});

// Выход
logoutBtn.addEventListener("click", () => signOut(auth));

// Следим за входом/выходом
onAuthStateChanged(auth, user => {
  if (user) {
    authSection.style.display = "none";
    chatSection.style.display = "block";
    userEmailSpan.textContent = user.email;
    loadMessages();
  } else {
    authSection.style.display = "block";
    chatSection.style.display = "none";
    messagesDiv.innerHTML = "";
  }
});

// Отправка сообщения
sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (!text || !auth.currentUser) return;
  try {
    await addDoc(collection(db, "messages"), {
      text,
      user: auth.currentUser.email,
      timestamp: serverTimestamp()
    });
    messageInput.value = "";
  } catch (e) {
    console.error("Ошибка отправки:", e);
  }
});

// Загрузка сообщений в реальном времени
let unsubscribe = null;
function loadMessages() {
  if (unsubscribe) unsubscribe();
  const q = query(collection(db, "messages"), orderBy("timestamp"));
  unsubscribe = onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const p = document.createElement("div");
      p.className = "message";
      const who = msg.user || "Аноним";
      const text = msg.text || "";
      p.textContent = ${who}: ${text};
      messagesDiv.appendChild(p);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
