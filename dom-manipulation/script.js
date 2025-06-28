// Quotes array from localStorage or default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The only limit to our realization of tomorrow is our doubts of today.",
    category: "Motivation",
  },
  {
    text: "In the middle of every difficulty lies opportunity.",
    category: "Inspiration",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteButton");
const categoryFilter = document.getElementById("categoryFilter");
const importFile = document.getElementById("importFile");
const exportBtn = document.getElementById("exportQuotes");
const syncNotification = document.getElementById("syncNotification");

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Get unique categories from quotes
function getUniqueCategories() {
  return [...new Set(quotes.map((q) => q.category))];
}

// Populate category dropdown dynamically
function populateCategories() {
  const categories = getUniqueCategories();
  const lastSelected = localStorage.getItem("selectedCategory") || "all";

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === lastSelected) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// Filter and display quotes by selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available in this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> "${quote.text}"</p>
    <p><em>Category:</em> ${quote.category}</p>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Show random quote based on filter
function showRandomQuote() {
  filterQuotes();
}

// Add new quote and sync
async function addQuote() {
  const textInput = document.getElementById("newQuoteText").value.trim();
  const categoryInput = document
    .getElementById("newQuoteCategory")
    .value.trim();
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

  try {
    await postQuoteToServer(newQuote);
    showSyncNotification("New quote added and synced with server.");
  } catch (err) {
    showSyncNotification("Quote added locally but failed to sync with server.");
    console.error("Post error:", err);
  }
}

// Export quotes as JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file input
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Expected an array of quotes.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- SERVER SIMULATION ---

// Fetch quotes from mock server API (simulate with jsonplaceholder)
async function fetchQuotesFromServer() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=5"
  );
  if (!response.ok) throw new Error("Failed to fetch quotes from server");
  const posts = await response.json();

  // Map to quotes with dummy category from userId
  return posts.map((p) => ({
    text: p.title,
    category: `Category${p.userId}`,
  }));
}

// Post new quote to mock server (simulation)
async function postQuoteToServer(quote) {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote),
  });
  if (!response.ok) throw new Error("Failed to post quote to server");
  return await response.json();
}

// Sync server quotes with local, server wins conflicts
function syncQuotes(serverQuotes) {
  let conflictsResolved = false;

  const localSet = new Set(quotes.map((q) => q.text + "||" + q.category));
  const serverSet = new Set(
    serverQuotes.map((q) => q.text + "||" + q.category)
  );

  // New quotes from server not in local
  const newServerQuotes = serverQuotes.filter(
    (q) => !localSet.has(q.text + "||" + q.category)
  );

  if (newServerQuotes.length > 0) {
    conflictsResolved = true;
    // Overwrite local quotes with server quotes for simplicity
    quotes = [...serverQuotes];
    saveQuotes();
  }

  return conflictsResolved;
}

// Show sync notification UI message
function showSyncNotification(message) {
  syncNotification.textContent = message;
  syncNotification.style.display = "block";
  setTimeout(() => {
    syncNotification.style.display = "none";
  }, 5000);
}

// Periodic sync with server every 20 seconds
async function periodicSync() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    const conflicts = syncQuotes(serverQuotes);
    if (conflicts) {
      populateCategories();
      filterQuotes();
      showSyncNotification("Data updated from server. Conflicts resolved.");
    }
  } catch (err) {
    console.error("Sync failed:", err);
    showSyncNotification("Failed to sync with server.");
  }
}

// --- INIT ---

window.onload = () => {
  populateCategories();
  filterQuotes();

  newQuoteBtn.addEventListener("click", showRandomQuote);
  addQuoteBtn.addEventListener("click", addQuote);
  exportBtn.addEventListener("click", exportToJsonFile);
  importFile.addEventListener("change", importFromJsonFile);
  categoryFilter.addEventListener("change", filterQuotes);

  periodicSync();
  setInterval(periodicSync, 20000);
};
