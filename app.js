// ✅ PASTE YOUR CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyDPWhnynPtua1YxgqmIFhIUOH02aTeM2D8",
  authDomain: "tasky-60a47.firebaseapp.com",
  projectId: "tasky-60a47"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

// 🔑 TRACK LOGIN
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user.email;
    loadTasks();
  }
});

// ✅ SIGN UP
function signup() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("User created ✅"))
    .catch(err => alert(err.message));
}

// ✅ LOGIN
function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => alert("Logged in ✅"))
    .catch(err => alert(err.message));
}

// ✅ CREATE TASK
function createTask() {
  db.collection("tasks").add({
    title: document.getElementById("title").value,
    desc: document.getElementById("desc").value,
    phone: document.getElementById("phone").value,
    createdBy: currentUser,
    assignedTo: null,
    status: "pending"
  });
}

// ✅ LOAD TASKS
function loadTasks() {
  db.collection("tasks").onSnapshot(snapshot => {
    renderTasks(snapshot);
  });
}

// ✅ FILTER
function filterTasks(status) {
  db.collection("tasks")
    .where("status", "==", status)
    .onSnapshot(snapshot => {
      renderTasks(snapshot);
    });
}

// ✅ DISPLAY TASKS
function renderTasks(snapshot) {
  const div = document.getElementById("tasks");
  div.innerHTML = "";

  snapshot.forEach(doc => {
    const t = doc.data();

    div.innerHTML += `
      <div class="task">
        <h3>${t.title}</h3>
        <p>${t.desc}</p>
        <p>Status: ${t.status}</p>
        <p>Created by: ${t.createdBy}</p>

        <button onclick="takeTask('${doc.id}')">Take</button>
        <button onclick="finishTask('${doc.id}', '${t.phone}')">Done</button>
      </div>
    `;
  });
}

// ✅ TAKE TASK
function takeTask(id) {
  db.collection("tasks").doc(id).update({
    assignedTo: currentUser,
    status: "in progress"
  });
}

// ✅ FINISH TASK
function finishTask(id, phone) {
  db.collection("tasks").doc(id).update({
    status: "done"
  });

  const msg = "✅ Your task is completed!";
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
}