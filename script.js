
// ===============================
// 🚀 GLOBAL STATE (SAFE INIT)
// ===============================
let contacts = [];
let filteredContacts = [];
let darkMode = false;

// ===============================
// 📦 INIT APP
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  bindEvents();
  registerSWSafe();
});

// ===============================
// 📊 LOAD DATA (SAFE FALLBACK)
// ===============================
function loadData() {
  try {
    const saved = localStorage.getItem("contacts");
    contacts = saved ? JSON.parse(saved) : sampleData();

    filteredContacts = [...contacts];
    renderContacts();
  } catch (err) {
    console.error("Data Load Error:", err);
    contacts = sampleData();
    filteredContacts = [...contacts];
    renderContacts();
  }
}

// ===============================
// 🧪 SAMPLE DATA (FALLBACK)
// ===============================
function sampleData() {
  return [
    {
      id: 1,
      name: "Officer A",
      phone: "9999999999",
      status: "active",
      duty: "Collectorate"
    },
    {
      id: 2,
      name: "Officer B",
      phone: "8888888888",
      status: "leave",
      duty: "Revenue"
    }
  ];
}

// ===============================
// 🎯 EVENT BINDINGS
// ===============================
function bindEvents() {
  const search = document.getElementById("searchInput");

  if (search) {
    search.addEventListener("input", (e) => {
      const value = e.target.value.toLowerCase();
      filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(value) ||
        c.phone.includes(value)
      );
      renderContacts();
    });
  }

  const backBtn = document.getElementById("back-to-top");
  window.addEventListener("scroll", () => {
    if (backBtn) {
      backBtn.style.display = window.scrollY > 200 ? "block" : "none";
    }
  });
}

// ===============================
// 🧾 RENDER CONTACTS (OPTIMIZED)
// ===============================
function renderContacts() {
  const container = document.getElementById("contactList");
  if (!container) return;

  container.innerHTML = "";

  if (filteredContacts.length === 0) {
    container.innerHTML = `<p style="text-align:center;">No records found</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  filteredContacts.forEach(contact => {
    const card = document.createElement("div");
    card.className = "contact-card";

    card.innerHTML = `
      <div class="contact-info">
        <div class="avatar-circle">
          ${getInitials(contact.name)}
        </div>

        <div>
          <strong>${escapeHTML(contact.name)}</strong><br/>
          <small>${contact.phone}</small><br/>
          <span class="duty-badge">${contact.duty || ""}</span>
        </div>
      </div>

      <div class="contact-actions">
        <button class="action-icon" onclick="callUser('${contact.phone}')">📞</button>
        <button class="action-icon" onclick="shareUser('${contact.name}','${contact.phone}')">📤</button>
        <button class="star-icon" onclick="toggleFavorite(${contact.id})">⭐</button>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

// ===============================
// 🔐 SECURITY HELPERS
// ===============================
function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ===============================
// 📞 ACTIONS
// ===============================
function callUser(phone) {
  if (!phone) return;
  window.location.href = `tel:${phone}`;
}

function shareUser(name, phone) {
  if (navigator.share) {
    navigator.share({
      title: "Officer Contact",
      text: `${name} - ${phone}`
    });
  } else {
    alert(`${name} - ${phone}`);
  }
}

function toggleFavorite(id) {
  contacts = contacts.map(c =>
    c.id === id ? { ...c, favorite: !c.favorite } : c
  );

  saveData();
  renderContacts();
}

// ===============================
// 💾 LOCAL STORAGE SAFE SAVE
// ===============================
function saveData() {
  try {
    localStorage.setItem("contacts", JSON.stringify(contacts));
  } catch (err) {
    console.error("Save Error:", err);
  }
}

// ===============================
// 🌙 DARK MODE FIXED
// ===============================
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
}

// ===============================
// 🤖 TOAST (FIXED)
// ===============================
function showAssistantToast() {
  const toast = document.getElementById("assistant-toast");
  if (!toast) return;

  toast.style.display = "flex";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

// ===============================
// ⬆ BACK TO TOP
// ===============================
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===============================
// ⚙ SAFE SERVICE WORKER
// ===============================
function registerSWSafe() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("SW Registered"))
      .catch(err => console.log("SW Failed:", err));
  });
}
