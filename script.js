// =============================
// GLOBAL STATE
// =============================
let leads = JSON.parse(localStorage.getItem("crm_leads")) || [];
const loginPage = document.getElementById("loginPage");
const activityList = document.getElementById("activityList");

// =============================
// LOGIN SYSTEM
// =============================
if (localStorage.getItem("crm_auth") === "true") {
  loginPage.style.display = "none";
}

document.getElementById("loginBtn").onclick = () => {
  const email = loginEmail.value.trim();
  const pass = loginPassword.value.trim();

  if (email === "admin@crm.com" && pass === "admin123") {
    localStorage.setItem("crm_auth", "true");
    loginPage.style.display = "none";
    logActivity("🔐 Admin logged in");
  } else {
    alert("Invalid credentials");
  }
};

logoutBtn.onclick = () => {
  localStorage.removeItem("crm_auth");
  loginPage.style.display = "flex";
  logActivity("🚪 Admin logged out");
};

// =============================
// ADD LEAD
// =============================
customerForm.addEventListener("submit", e => {
  e.preventDefault();

  const lead = {
    id: Date.now(),
    name: name.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    status: "New",
    notes: [],
    createdAt: new Date().toISOString()
  };

  leads.push(lead);
  persist();
  render();
  logActivity(`➕ Lead "${lead.name}" added`);
  customerForm.reset();
});

// =============================
// DELETE LEAD
// =============================
function deleteLead(id) {
  leads = leads.filter(l => l.id !== id);
  persist();
  render();
  logActivity("🗑️ Lead deleted");
}

// =============================
// UPDATE STATUS
// =============================
function updateStatus(id, value) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;

  lead.status = value;
  persist();
  render();
  logActivity(`🔄 Status updated to "${value}"`);
}

// =============================
// ADD NOTE
// =============================
function addNote(id) {
  const note = prompt("Enter follow-up note:");
  if (!note) return;

  const lead = leads.find(l => l.id === id);
  lead.notes.push({
    text: note,
    time: new Date().toLocaleString()
  });

  persist();
  logActivity("📝 Note added");
}

// =============================
// RENDER TABLE
// =============================
function render() {
  customerList.innerHTML = "";

  leads.forEach(lead => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${lead.name}</td>
      <td>${lead.email}</td>
      <td>${lead.phone}</td>
      <td>
        <select onchange="updateStatus(${lead.id}, this.value)">
          <option ${lead.status==="New"?"selected":""}>New</option>
          <option ${lead.status==="Contacted"?"selected":""}>Contacted</option>
          <option ${lead.status==="Converted"?"selected":""}>Converted</option>
        </select>
      </td>
      <td>
        <button onclick="addNote(${lead.id})">Notes (${lead.notes.length})</button>
        <button onclick="deleteLead(${lead.id})">Delete</button>
      </td>
    `;

    customerList.appendChild(row);
  });

  updateDashboard();
}

// =============================
// DASHBOARD CALCULATION
// =============================
function updateDashboard() {
  const total = leads.length;
  const newCount = leads.filter(l => l.status === "New").length;
  const contacted = leads.filter(l => l.status === "Contacted").length;
  const converted = leads.filter(l => l.status === "Converted").length;

  totalCount.innerText = total;
  newCountEl.innerText = newCount;
  contactedCount.innerText = contacted;
  convertedCount.innerText = converted;

  const rate = total ? Math.round((converted / total) * 100) : 0;
  conversionRate.innerText = rate + "%";
  ringPercent.innerText = rate + "%";

  const circle = document.querySelector(".ring .progress");
  const circumference = 314;
  const offset = circumference - (rate / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  // Insight logic
  if (total === 0) {
    insightText.innerText = "No leads yet.";
  } else if (rate < 30) {
    insightText.innerText = "📉 Improve follow-ups.";
  } else if (rate < 60) {
    insightText.innerText = "📊 Moderate performance.";
  } else {
    insightText.innerText = "🚀 Excellent conversion!";
  }
}

// =============================
// ACTIVITY LOG
// =============================
function logActivity(message) {
  if (activityList.querySelector(".empty")) {
    activityList.innerHTML = "";
  }

  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  activityList.prepend(li);
}

// =============================
// STORAGE
// =============================
function persist() {
  localStorage.setItem("crm_leads", JSON.stringify(leads));
}

// =============================
// SIDEBAR NAV
// =============================
dashboardBtn.onclick = () => {
  dashboardSection.style.display = "block";
  leadsSection.style.display = "none";
};

leadsBtn.onclick = () => {
  dashboardSection.style.display = "none";
  leadsSection.style.display = "block";
};

// =============================
render();