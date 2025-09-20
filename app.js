const usernameInput = document.getElementById("username-input");
const addUserBtn = document.getElementById("add-user-btn");
const existingUsersDiv = document.getElementById("existing-users");
const userUI = document.getElementById("user-ui");
const entryUI = document.getElementById("entry-ui");
const todayDateSpan = document.getElementById("today-date");
const entryInput = document.getElementById("entry-input");
const addEntryBtn = document.getElementById("add-entry-btn");
const overwriteEntryBtn = document.getElementById("overwrite-entry-btn");
const recordBox = document.getElementById("record-box");
const fetchRecordBtn = document.getElementById("fetch-record-btn");
const headerBar = document.getElementById("header-bar");
const loggedUserSpan = document.getElementById("logged-user");
const logoutBtn = document.getElementById("logout-btn");
const withdrawBtn = document.getElementById("withdraw-btn");
const withdrawUI = document.getElementById("withdraw-ui");
const withdrawInput = document.getElementById("withdraw-input");
const confirmWithdrawBtn = document.getElementById("confirm-withdraw-btn");
const cancelWithdrawBtn = document.getElementById("cancel-withdraw-btn");


let currentUser = null;
const today = new Date().toLocaleDateString("en-GB").split("/").join("-");
todayDateSpan.textContent = today;

// Load existing users
function loadUsers() {
  existingUsersDiv.innerHTML = "";
  const users = Object.keys(localStorage);
  users.forEach(user => {
    const div = document.createElement("div");
    div.className = "user-option";
    div.innerHTML = `
      <strong>${user}</strong>
      <button onclick="continueUser('${user}')">Continue</button>
      <button onclick="removeUser('${user}')">Remove User</button>
    `;

    existingUsersDiv.appendChild(div);
  });
}

// Show header with username
function showHeader() {
  headerBar.style.display = "flex";
  loggedUserSpan.textContent = `Logged in as: ${currentUser}`;
}

withdrawBtn.onclick = () => {
  entryUI.style.display = "none";
  withdrawUI.style.display = "block";
};

cancelWithdrawBtn.onclick = () => {
  withdrawUI.style.display = "none";
  entryUI.style.display = "block";
};

confirmWithdrawBtn.onclick = () => {
  const amount = parseFloat(withdrawInput.value);
  if (isNaN(amount) || amount <= 0) return alert("Enter a valid amount");

  const userData = JSON.parse(localStorage.getItem(currentUser)) || {};
  const currentAmount = userData[today] || 0;

  if (amount > currentAmount) {
    alert("Insufficient balance for today.");
    return;
  }

  userData[today] = currentAmount - amount;
  localStorage.setItem(currentUser, JSON.stringify(userData));
  withdrawInput.value = "";
  withdrawUI.style.display = "none";
  entryUI.style.display = "block";
  updateButtons();
};

// Logout function
logoutBtn.onclick = () => {
  currentUser = null;
  entryUI.style.display = "none";
  userUI.style.display = "block";
  headerBar.style.display = "none";
  usernameInput.value = "";
  document.getElementById("record-list").innerHTML = `<input type="type" style="border: none;" placeholder="Savings Records...">`;
  loadUsers();
};

window.removeUser = function(name) {
  if (confirm(`Are you sure you want to remove user "${name}" and all their data?`)) {
    localStorage.removeItem(name);
    loadUsers();
  }
};


// Modify continueUser to show header
window.continueUser = function(name) {
  currentUser = name;
  userUI.style.display = "none";
  entryUI.style.display = "block";
  document.getElementById("record-list").innerHTML = `<input type="text" style="border: none;" placeholder="Savings Records...">`;
  showHeader();
  updateButtons();
};

// Add new user
addUserBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Please enter a name");
  if (!localStorage.getItem(name)) {
    localStorage.setItem(name, JSON.stringify({}));
  }
  continueUser(name);
};

// Update buttons based on entry existence
function updateButtons() {
  const userData = JSON.parse(localStorage.getItem(currentUser));
  if (userData && userData[today]) {
    overwriteEntryBtn.style.display = "inline-block";
  } else {
    overwriteEntryBtn.style.display = "none";
  }
}

// Add entry
addEntryBtn.onclick = () => {
  const amount = parseFloat(entryInput.value);
  if (isNaN(amount)) return alert("Enter a valid amount");
  const userData = JSON.parse(localStorage.getItem(currentUser)) || {};
  userData[today] = (userData[today] || 0) + amount;
  localStorage.setItem(currentUser, JSON.stringify(userData));
  entryInput.value = "";
  updateButtons();
};

// Overwrite entry
overwriteEntryBtn.onclick = () => {
  const amount = parseFloat(entryInput.value);
  if (isNaN(amount)) return alert("Enter a valid amount");
  const userData = JSON.parse(localStorage.getItem(currentUser)) || {};
  userData[today] = amount;
  localStorage.setItem(currentUser, JSON.stringify(userData));
  entryInput.value = "";
  updateButtons();
};

// Fetch savings record
fetchRecordBtn.onclick = () => {
  const userData = JSON.parse(localStorage.getItem(currentUser)) || {};
  const recordList = document.getElementById("record-list");
  recordList.innerHTML = "";

  const entries = Object.entries(userData)
    .sort(([a], [b]) => new Date(a) - new Date(b));

  let total = 0;

  if (entries.length === 0) {
    recordList.innerHTML = `<div class="record-item">No records found.</div>`;
    return;
  }

  entries.forEach(([date, amount]) => {
    const type = amount >= 0 ? "deposit" : "withdrawal";
    const sign = amount >= 0 ? "+" : "-";
    total += amount;

    const item = document.createElement("div");
    item.className = `record-item ${type}`;
    item.textContent = `${date}: ${sign}₹${Math.abs(amount)}`;
    recordList.appendChild(item);
  });

  recordList.append(document.createElement("hr"));

  const totalContainer = document.createElement("div");
  totalContainer.className = "total-container";

  const ttlbtn = document.createElement("button");
  ttlbtn.type = "button";
  ttlbtn.textContent = "Total Savings:";
  ttlbtn.classList.add("totalbtn");

  const totalItem = document.createElement("span");
  totalItem.className = "total-value";
  totalItem.textContent = `₹${total}`;

  totalContainer.appendChild(ttlbtn);
  recordList.appendChild(totalContainer);

  ttlbtn.addEventListener("click", () => {
    if (!document.querySelector(".total-value")) {
      totalContainer.appendChild(totalItem);
    }
  });


};




// Initialize
loadUsers();
