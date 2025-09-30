window.onload = function() {
  // Element references
  const usernameInput = document.getElementById("username-input");
  const addUserBtn = document.getElementById("add-user-btn");
  const existingUsersDiv = document.getElementById("existing-users");
  const userUI = document.getElementById("user-ui");
  const entryUI = document.getElementById("entry-ui");
  const withdrawUI = document.getElementById("withdraw-ui");
  const missedUI = document.getElementById("missed-ui");
  const dashboardUI = document.getElementById("dashboard-ui");
  const todayDateSpan = document.getElementById("today-date");
  const entryInput = document.getElementById("entry-input");
  const addEntryBtn = document.getElementById("add-entry-btn");
  const overwriteEntryBtn = document.getElementById("overwrite-entry-btn");
  const withdrawInput = document.getElementById("withdraw-input");
  const confirmWithdrawBtn = document.getElementById("confirm-withdraw-btn");
  const cancelWithdrawBtn = document.getElementById("cancel-withdraw-btn");
  const missedDateInput = document.getElementById("missed-date-input");
  const missedAmountInput = document.getElementById("missed-amount-input");
  const missedAddBtn = document.getElementById("missed-add-btn");
  const fetchRecordBtn = document.getElementById("fetch-record-btn");
  const recordList = document.getElementById("record-list");
  const headerBar = document.getElementById("header-bar");
  const loggedUserSpan = document.getElementById("logged-user");
  const menuToggle = document.getElementById("menu-toggle");
  const sideMenu = document.getElementById("side-menu");
  const menuItems = document.querySelectorAll("#side-menu ul li");
  const menuLogoutBtn = document.getElementById("menu-logout-btn");

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

  // Show header and user initial
  function showHeader() {
    headerBar.style.display = "flex";
    loggedUserSpan.textContent = `Logged in as: ${currentUser}`;
  }

  // Continue with selected user
  window.continueUser = function(name) {
    currentUser = name;
    userUI.style.display = "none";
    dashboardUI.style.display = "block";
    showHeader();
    recordList.innerHTML = "";
    document.querySelector("#menu-records").click();
    document.getElementById("menu-toggle").style.display = "block";
    updateButtons();
  };

  // Remove user
  window.removeUser = function(name) {
    if (confirm(`Remove user "${name}" and all data?`)) {
      localStorage.removeItem(name);
      loadUsers();
    }
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

  // Logout logic
  menuLogoutBtn.onclick = () => {
    currentUser = null;
    userUI.style.display = "block";
    dashboardUI.style.display = "none";
    entryUI.style.display = "none";
    withdrawUI.style.display = "none";
    missedUI.style.display = "none";
    headerBar.style.display = "none";
    sideMenu.classList.remove("open");
    recordList.innerHTML = "";
    usernameInput.value = "";
    document.getElementById("menu-toggle").style.display = "none";
    loadUsers();
  };

  // Menu toggle
  menuToggle.onclick = () => {
    sideMenu.classList.toggle("open");
  };

  // Menu navigation
  menuItems.forEach(item => {
    item.onclick = () => {
      menuItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      entryUI.style.display = "none";
      withdrawUI.style.display = "none";
      missedUI.style.display = "none";
      dashboardUI.style.display = "none";

      if (item.id === "menu-records") dashboardUI.style.display = "block";
      if (item.id === "menu-add") entryUI.style.display = "block";
      if (item.id === "menu-withdraw") withdrawUI.style.display = "block";
      if (item.id === "menu-missed") missedUI.style.display = "block";
      sideMenu.classList.remove("open");

    };
  });

  // Update overwrite button visibility
  function updateButtons() {
    const userData = JSON.parse(localStorage.getItem(currentUser));
    overwriteEntryBtn.style.display = userData?.[today] ? "inline-block" : "none";
  }

  // Add entry
  addEntryBtn.onclick = () => {
    const amount = parseFloat(entryInput.value);
    if (isNaN(amount)) return alert("Enter a valid amount");
    const userData = JSON.parse(localStorage.getItem(currentUser)) || {};
    userData[today] = (userData[today] || 0) + amount;
    localStorage.setItem(currentUser, JSON.stringify(userData));
    entryInput.value = "";
    alert(`₹${amount} added Today`);
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

  // Confirm withdrawal
  confirmWithdrawBtn.onclick = () => {
    const amount = parseFloat(withdrawInput.value);
    if (isNaN(amount) || amount <= 0) return alert("Enter a valid amount");
    const userData = JSON.parse(localStorage.getItem(currentUser)) || {};
    const total = Object.values(userData).reduce((sum, val) => sum + val, 0);
    if (amount > total) return alert("Insufficient total balance");
    userData[today] = (userData[today] || 0) - amount;
    localStorage.setItem(currentUser, JSON.stringify(userData));
    withdrawInput.value = "";
    withdrawUI.style.display = "none";
    entryUI.style.display = "block";
    updateButtons();
  };

  // Cancel withdrawal
  cancelWithdrawBtn.onclick = () => {
    withdrawUI.style.display = "none";
    entryUI.style.display = "block";
  };

  // Missed date entry
  missedAddBtn.onclick = () => {
    const date = missedDateInput.value;
    const amount = parseFloat(missedAmountInput.value);
    if (!date || isNaN(amount)) return alert("Enter valid date and amount");
    const formattedDate = date.split("-").reverse().join("-");
    const userData = JSON.parse(localStorage.getItem(currentUser)) || {};
    userData[formattedDate] = (userData[formattedDate] || 0) + amount;
    localStorage.setItem(currentUser, JSON.stringify(userData));
    alert(`₹${amount} added to ${formattedDate}`);
    missedDateInput.value = "";
    missedAmountInput.value = "";
  };

  // Fetch savings record
  fetchRecordBtn.onclick = () => {
    const userData = JSON.parse(localStorage.getItem(currentUser)) || {};
    recordList.innerHTML = "";

    const entries = Object.entries(userData)
      .sort(([a], [b]) => new Date(a.split("-").reverse().join("-")) - new Date(b.split("-").reverse().join("-")));

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

    ttlbtn.addEventListener("click", () => {
      if (!totalContainer.contains(totalItem)) {
        totalContainer.appendChild(totalItem);
      }
    });

    totalContainer.appendChild(ttlbtn);
    recordList.appendChild(totalContainer);
  };
  // Initialize
  loadUsers();
}