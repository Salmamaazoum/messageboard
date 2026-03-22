/* ============================================================
   script.js — MessageBoard client
   Connects to the Node.js micro-service via fetch / AJAX
   ============================================================ */

/* ── 3.1 : Basic JS exercises (console only) ────────────────── */

function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}
console.log("fact(6) =", fact(6)); // 720

function applique(f, tab) {
  const result = [];
  for (let i = 0; i < tab.length; i++) {
    result.push(f(tab[i]));
  }
  return result;
}
console.log("Factorials:", applique(fact, [1, 2, 3, 4, 5, 6]));
console.log("n+1:", applique(function(n) { return n + 1; }, [1, 2, 3, 4, 5, 6]));


/* ── Server URL (Section 3.4 — configurable) ────────────────── */

// Default: same origin as the page (works when served by index.js)
let SERVER_URL = window.location.origin;

const serverInput = document.getElementById("input-server");
if (serverInput) {
  serverInput.value = SERVER_URL;
  serverInput.addEventListener("change", function() {
    SERVER_URL = serverInput.value.trim().replace(/\/$/, "");
    loadMessages();
  });
}


/* ── Helpers ────────────────────────────────────────────────── */

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

/**
 * Rebuild the <ul> from an array of message objects.
 * Each object: { id, pseudo, msg, date }
 */
function update(tableau) {
  const liste = document.getElementById("liste-messages");
  liste.innerHTML = "";

  if (!tableau || tableau.length === 0) {
    const li = document.createElement("li");
    li.classList.add("message-item", "empty-state");
    li.textContent = "No messages yet — be the first!";
    liste.appendChild(li);
    return;
  }

  tableau.forEach(function(item) {
    const li = document.createElement("li");
    li.classList.add("message-item");
    li.dataset.id = item.id;

    const meta = document.createElement("div");
    meta.classList.add("message-meta");

    const pseudo = document.createElement("span");
    pseudo.classList.add("pseudo");
    pseudo.textContent = item.pseudo || "Anonymous";

    const date = document.createElement("span");
    date.classList.add("date");
    date.textContent = formatDate(item.date);

    const delBtn = document.createElement("button");
    delBtn.classList.add("btn-del");
    delBtn.textContent = "✕";
    delBtn.setAttribute("aria-label", "Delete message");
    delBtn.addEventListener("click", function() {
      deleteMessage(item.id);
    });

    meta.appendChild(pseudo);
    meta.appendChild(date);
    meta.appendChild(delBtn);

    const texte = document.createElement("p");
    texte.textContent = item.msg;

    li.appendChild(meta);
    li.appendChild(texte);
    liste.appendChild(li);
  });
}


/* ── Section 3.2 : Load all messages from the server ────────── */

function loadMessages() {
  fetch(SERVER_URL + "/msg/getAll")
    .then(function(response) { return response.json(); })
    .then(function(data) {
      update(data);
    })
    .catch(function(err) {
      console.error("Failed to load messages:", err);
    });
}


/* ── Section 3.3 : Post a new message ───────────────────────── */

document.getElementById("btn-envoyer").addEventListener("click", function() {
  const pseudoInput  = document.getElementById("input-pseudo");
  const messageInput = document.getElementById("input-message");

  const pseudo = pseudoInput.value.trim() || "Anonymous";
  const texte  = messageInput.value.trim();

  if (!texte) {
    alert("Please write a message before sending!");
    return;
  }

  const encodedMsg    = encodeURIComponent(texte);
  const encodedPseudo = encodeURIComponent(pseudo);
  const url = SERVER_URL + "/msg/post/" + encodedMsg + "?pseudo=" + encodedPseudo;

  fetch(url)
    .then(function(response) { return response.json(); })
    .then(function(data) {
      if (data.code === 0) {
        messageInput.value = "";
        pseudoInput.value  = "";
        loadMessages();
        const liste = document.getElementById("liste-messages");
        liste.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
      } else {
        alert("Error posting message (code " + data.code + ")");
      }
    })
    .catch(function(err) {
      console.error("Failed to post message:", err);
    });
});


/* ── Delete a message ───────────────────────────────────────── */

function deleteMessage(id) {
  fetch(SERVER_URL + "/msg/del/" + id)
    .then(function(response) { return response.json(); })
    .then(function(data) {
      if (data.code === 0) {
        loadMessages();
      } else {
        alert("Could not delete message #" + id);
      }
    })
    .catch(function(err) {
      console.error("Failed to delete message:", err);
    });
}


/* ── Refresh button ─────────────────────────────────────────── */

document.getElementById("btn-update").addEventListener("click", function() {
  loadMessages();
});


/* ── Theme toggle ───────────────────────────────────────────── */

const btnTheme = document.getElementById("btn-theme");
btnTheme.addEventListener("click", function() {
  const body = document.body;
  if (body.classList.contains("theme-dark")) {
    body.classList.replace("theme-dark", "theme-light");
    btnTheme.textContent = "🌙 Dark mode";
  } else {
    body.classList.replace("theme-light", "theme-dark");
    btnTheme.textContent = "☀️ Light mode";
  }
});


/* ── Init: load messages on page load ───────────────────────── */
loadMessages();
