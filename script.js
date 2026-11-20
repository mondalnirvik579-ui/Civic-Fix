// CIVICFIX KOLKATA - Main JavaScript

const STORAGE_KEY = "civicfix_reports_v1";

// Sample demonstration reports
const sampleReports = [
  {
    id: "CF-1001",
    title: "Road damage near Park Street",
    category: "Road Damage",
    area: "Park Street, Kolkata",
    description: "Sample report showing a damaged road.",
    status: "In Progress",
    date: "2026-11-07",
    lat: 22.5535,
    lng: 88.3520
  },
  {
    id: "CF-1002",
    title: "Garbage collection required",
    category: "Garbage",
    area: "Salt Lake, Kolkata",
    description: "Sample report showing a garbage collection issue.",
    status: "Reported",
    date: "2026-11-06",
    lat: 22.5867,
    lng: 88.4170
  },
  {
    id: "CF-1003",
    title: "Streetlight not working",
    category: "Streetlight",
    area: "Howrah, West Bengal",
    description: "Sample report showing a streetlight issue.",
    status: "Resolved",
    date: "2026-11-05",
    lat: 22.5958,
    lng: 88.2636
  }
];

let reports = loadReports();
let map = null;
let markerLayer = null;

// Load saved reports from browser storage
function loadReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Could not load saved reports:", error);
  }

  return sampleReports.map(report => ({ ...report }));
}

// Save reports in this browser
function saveReports() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    alert("Could not save reports. Browser storage may be full.");
    console.error(error);
  }
}

// Create a unique complaint ID
function createId() {
  return "CF-" + Date.now().toString().slice(-8);
}

// Display dashboard statistics
function updateStats() {
  document.getElementById("total-count").textContent =
    reports.length;

  document.getElementById("reported-count").textContent =
    reports.filter(r => r.status === "Reported").length;

  document.getElementById("progress-count").textContent =
    reports.filter(r => r.status === "In Progress").length;

  document.getElementById("resolved-count").textContent =
    reports.filter(r => r.status === "Resolved").length;
}

// Create a safe HTML element with text
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// Render the public reports
function renderReports() {
  const container = document.getElementById("issue-list");
  const emptyMessage = document.getElementById("empty-message");

  container.replaceChildren();

  const searchText =
    document.getElementById("search").value.toLowerCase().trim();

  const selectedStatus =
    document.getElementById("status-filter").value;

  const selectedCategory =
    document.getElementById("category-filter").value;

  const filtered = reports.filter(report => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchText) ||
      report.area.toLowerCase().includes(searchText);

    const matchesStatus =
      selectedStatus === "All" || report.status === selectedStatus;

    const matchesCategory =
      selectedCategory === "All" ||
      report.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  emptyMessage.hidden = filtered.length !== 0;

  filtered.forEach(report => {
    const card = makeElement("article", "issue-card");
    const top = makeElement("div", "issue-top");
    const category = makeElement("span", "category-tag", report.category);
    const status = makeElement(
      "span",
      "status " + statusClass(report.status),
      report.status
    );

    top.append(category, status);

    const title = makeElement("h3", "", report.title);
    const area = makeElement("p", "", "📍 " + report.area);
    const description = makeElement("p", "", report.description);
    const id = makeElement("p", "issue-id", "Report ID: " + report.id);
    const date = makeElement("p", "issue-id", "Date: " + report.date);

    card.append(top, title, area, description, id, date);
    container.appendChild(card);
  });
}

// CSS class for status badges
function statusClass(status) {
  if (status === "In Progress") return "in-progress";
  if (status === "Resolved") return "resolved";
  return "reported";
}

// Handle the report form
document.getElementById("issue-form").addEventListener("submit", event => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const area = document.getElementById("area").value.trim();
  const description =
    document.getElementById("description").value.trim();

  if (!title || !category || !area || !description) {
    document.getElementById("form-message").textContent =
      "Please complete all fields.";
    return;
  }

  const newReport = {
    id: createId(),
    title,
    category,
    area,
    description,
    status: "Reported",
    date: new Date().toISOString().slice(0, 10),
    lat: null,
    lng: null
  };

  reports.unshift(newReport);
  saveReports();

  document.getElementById("issue-form").reset();
  document.getElementById("form-message").textContent =
    "Report submitted successfully! Your demo ID is " + newReport.id;

  refreshApp();

  document.getElementById("issues").scrollIntoView({
    behavior: "smooth"
  });
});

// Admin demo: update report status
function renderAdmin() {
  const container = document.getElementById("admin-list");
  container.replaceChildren();

  reports.forEach(report => {
    const row = makeElement("div", "admin-row");
    const details = makeElement("div");

    details.append(
      makeElement("h4", "", report.title),
      makeElement("p", "issue-id", report.id + " • " + report.area)
    );

    const select = document.createElement("select");
    select.setAttribute("aria-label", "Update status for " + report.id);

    ["Reported", "In Progress", "Resolved"].forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      if (status === report.status) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      const current = reports.find(r => r.id === report.id);
      if (!current) return;

      current.status = select.value;
      saveReports();
      refreshApp();
    });

    row.append(details, select);
    container.appendChild(row);
  });
}

// Initialise the sample map
function initialiseMap() {
  const mapElement = document.getElementById("map");

  if (typeof L === "undefined") {
    mapElement.textContent =
      "The map could not load. Check your internet connection and refresh.";
    return;
  }

  map = L.map("map").setView([22.5726, 88.3639], 11);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);
setTimeout(() => {
    map.invalidateSize();
}, 300);

  markerLayer = L.layerGroup().addTo(map);
  updateMap();
}

// Update map markers

// CIVICFIX 3.0 - SMART CITY MAP MARKERS

function updateMap() {
  if (!map || !markerLayer) return;

  markerLayer.clearLayers();

  const markerColors = {
    "Road Damage": "#ffb547",
    "Garbage": "#39e69a",
    "Streetlight": "#35e6e0",
    "Waterlogging": "#5c9dff",
    "Other": "#c28bff"
  };

  reports.forEach(report => {
    if (
      typeof report.lat !== "number" ||
      typeof report.lng !== "number"
    ) return;

    const color = markerColors[report.category] || "#ffffff";

    const marker = L.circleMarker(
      [report.lat, report.lng],
      {
        radius: 10,
        color: color,
        fillColor: color,
        fillOpacity: 0.85,
        weight: 2
      }
    );

    const popup = document.createElement("div");

    const title = makeElement("strong", "", report.title);
    const area = makeElement("p", "", report.area);
    const category = makeElement(
      "p", "", "Category: " + report.category
    );
    const status = makeElement(
      "p", "", "Status: " + report.status
    );

    popup.append(title, area, category, status);

    marker.bindPopup(popup);
    marker.addTo(markerLayer);
  });
}

// Refresh all parts of the website

// CIVICFIX 3.0 - LIVE ANALYTICS

function renderAnalytics() {
  const statusContainer = document.getElementById("status-chart");
  const categoryContainer = document.getElementById("category-chart");

  if (!statusContainer || !categoryContainer) return;

  statusContainer.replaceChildren();
  categoryContainer.replaceChildren();

  function addChartRow(container, label, count, total) {
    const row = makeElement("div", "chart-row");
    const labelRow = makeElement("div", "chart-label");

    const percentage = total > 0
      ? Math.round((count / total) * 100)
      : 0;

    labelRow.append(
      makeElement("span", "", label),
      makeElement("strong", "", count + " (" + percentage + "%)")
    );

    const track = makeElement("div", "chart-track");
    const fill = makeElement("div", "chart-fill");

    fill.style.width = percentage + "%";

    track.appendChild(fill);
    row.append(labelRow, track);
    container.appendChild(row);
  }

  const statuses = ["Reported", "In Progress", "Resolved"];

  statuses.forEach(status => {
    const count = reports.filter(r => r.status === status).length;
    addChartRow(statusContainer, status, count, reports.length);
  });

  const categories = [
    "Road Damage",
    "Garbage",
    "Streetlight",
    "Waterlogging",
    "Other"
  ];

  categories.forEach(category => {
    const count = reports.filter(r => r.category === category).length;
    addChartRow(categoryContainer, category, count, reports.length);
  });
}

function refreshApp() {
  updateStats();
  renderReports();
  renderAdmin();
  renderAnalytics();
  updateMap();
}

// Filter controls
document.getElementById("search").addEventListener("input", renderReports);
document.getElementById("status-filter").addEventListener("change", renderReports);
document.getElementById("category-filter").addEventListener("change", renderReports);

// Start the application
refreshApp();
initialiseMap();

// CIVICFIX 3.0 - SMART CATEGORY ASSISTANT

const assistantToggle = document.getElementById("assistant-toggle");
const assistantPanel = document.getElementById("assistant-panel");
const assistantClose = document.getElementById("assistant-close");
const assistantForm = document.getElementById("assistant-form");
const assistantQuestion = document.getElementById("assistant-question");
const assistantMessages = document.getElementById("assistant-messages");

assistantToggle.addEventListener("click", () => {
  assistantPanel.hidden = !assistantPanel.hidden;
});

assistantClose.addEventListener("click", () => {
  assistantPanel.hidden = true;
});

// Suggest a category from words in the user's description
function suggestCategory(message) {
  const text = message.toLowerCase();

  if (
    text.includes("pothole") ||
    text.includes("road") ||
    text.includes("street damage")
  ) {
    return {
      category: "Road Damage",
      explanation: "Your description sounds like a road or pothole issue."
    };
  }

  if (
    text.includes("garbage") ||
    text.includes("rubbish") ||
    text.includes("waste") ||
    text.includes("dustbin")
  ) {
    return {
      category: "Garbage",
      explanation: "Your description sounds like a waste collection issue."
    };
  }

  if (
    text.includes("light") ||
    text.includes("lamp") ||
    text.includes("dark street")
  ) {
    return {
      category: "Streetlight",
      explanation: "Your description sounds like a streetlight issue."
    };
  }

  if (
    text.includes("waterlogging") ||
    text.includes("flood") ||
    text.includes("drain") ||
    text.includes("water on road")
  ) {
    return {
      category: "Waterlogging",
      explanation: "Your description may be related to drainage or waterlogging."
    };
  }

  return {
    category: "Other",
    explanation: "I could not identify a clear category. Please select the category manually."
  };
}

// Add a chat message safely
function addAssistantMessage(message, type) {
  const bubble = makeElement(
    "div",
    type === "user" ? "user-message" : "bot-message",
    message
  );

  assistantMessages.appendChild(bubble);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

// Handle assistant questions
assistantForm.addEventListener("submit", event => {
  event.preventDefault();

  const message = assistantQuestion.value.trim();

  if (!message) return;

  addAssistantMessage(message, "user");

  const result = suggestCategory(message);

  addAssistantMessage(
    result.explanation + " Suggested category: " + result.category +
    ". You can choose this category in the report form.",
    "bot"
  );

  assistantQuestion.value = "";
});

// Fill the report form with the suggested category
assistantMessages.addEventListener("click", event => {
  const bubble = event.target.closest(".bot-message");

  if (!bubble) return;

  const message = bubble.textContent;

  const categories = [
    "Road Damage",
    "Garbage",
    "Streetlight",
    "Waterlogging",
    "Other"
  ];

  const category = categories.find(item =>
    message.includes("Suggested category: " + item)
  );

  if (category) {
    document.getElementById("category").value = category;
    document.getElementById("report").scrollIntoView({
      behavior: "smooth"
    });

    addAssistantMessage(
      "Category selected: " + category +
      ". Please complete the rest of your report.",
      "bot"
    );
  }
});
