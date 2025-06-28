// === Your existing quotes & DOM refs ===
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteButton");
const categoryFilter = document.getElementById("categoryFilter");
const importFile = document.getElementById("importFile");
const exportBtn = document.getElementById("exportQuotes");
const syncNotification = document.getElementById("syncNotification");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function getUniqueCategories() {
  return [...new Set(quotes.map(q => q.category))];
}

function populateCategories() {
  const categories = getUniqueCategories();
  const lastSelected = localStorage.getItem("selectedCategory") || "all";

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === lastSelected) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  let filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available in this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> "${quote.text}"</p>
    <p><em>Category:</em> ${quote.category}</p>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

function showRandomQuote() {
  filterQuotes();
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText").value.trim();
  const categoryInput = document.getElementById("newQuoteCategory").value.trim();
  if (!textInput || !categoryInput) {
    alert("Please enter both quote text and category.");
    return;
  }
  const newQuote = { text: textInput, category: categoryInput };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = e => {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Expected an array.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- SYNC PART ---

// Simulate server quotes fetched from JSONPlaceholder posts endpoint.
// We convert posts to quotes with dummy categories.
async function fetchServerQuotes() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
  if (!response.ok) throw new Error("Failed to fetch server data");
  const posts = await response.json();

  // Map posts to quotes with category based on userId (for example)
  return posts.map(p => ({
    text: p.title,
    category: `Category${p.userId}`
  }));
}

// Conflict resolution: server quotes overwrite local for conflicts.
// We'll detect if server data has quotes not in local by text & category.
function mergeQuotes(serverQuotes) {
  let conflictsResolved = false;

  // We'll consider quote conflicts by comparing text + category (unique combo)
  const localSet = new Set(quotes.map(q => q.text + "||" + q.category));
  const serverSet = new Set(serverQuotes.map(q => q.text + "||" + q.category));

  // Detect new quotes on server that local lacks
  const newServerQuotes = serverQuotes.filter(q => !localSet.has(q.text + "||" + q.category));

  if (newServerQuotes.length > 0) {
    conflictsResolved = true;
    // Remove any local quotes that conflict (same text/category)
    // But in our simple model, server quotes take precedence, so just add new ones
    quotes = quotes.filter(q => !serverSet.has(q.text + "||" + q.category));
    quotes.push(...serverQuotes); // Replace local with full server dataset for simplicity
    saveQuotes();
  }

  return conflictsResolved;
}

function showSyncNotification(message) {
  syncNotification.textContent = message;
  syncNotification.style.display = "block";
  setTimeout(() => {
    syncNotification.style.display = "none";
  }, 5000);
}

// Periodically sync data every 20 seconds
async function syncWithServer() {
  try {
    const serverQuotes = await fetchServerQuotes();
    const conflicts = mergeQuotes(serverQuotes);
    if (conflicts) {
      populateCategories();
      filterQuotes();
      showSyncNotification("Data updated from server. Conflicts resolved by overwriting local data.");
    } else {
      // Optional: show notification that data is up to date
      // showSyncNotification("Data synced with server. No conflicts.");
    }
  } catch (err) {
    console.error("Sync error:", err);
    showSyncNotification("Error syncing data with server.");
  }
}

// --- INITIALIZATION ---
window.onload = () => {
  populateCategories();
  filterQuotes();

  newQuoteBtn.addEventListener("click", showRandomQuote);
  addQuoteBtn.addEventListener("click", addQuote);
  exportBtn.addEventListener("click", exportToJsonFile);
  importFile.addEventListener("change", importFromJsonFile);
  categoryFilter.addEventListener("change", filterQuotes);

  // Initial sync and then periodic
  syncWithServer();
  setInterval(syncWithServer, 20_000); // every 20 seconds
};
