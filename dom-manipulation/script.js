// Initial quotes
let quotes = [
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

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteButton");
const importFileInput = document.getElementById("importFile");
const exportQuotesBtn = document.getElementById("exportQuotes");
const categoryFilter = document.getElementById("categoryFilter");
const syncNotification = document.getElementById("syncNotification");

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      // If corrupted, keep default quotes
    }
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load last selected category filter from localStorage
function loadLastFilter() {
  const stored = localStorage.getItem("lastCategoryFilter");
  return stored ? stored : "all";
}

// Save last selected category filter to localStorage
function saveLastFilter(category) {
  localStorage.setItem("lastCategoryFilter", category);
}

// Display a random quote matching current filter
function showRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter.value;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter((q) => q.category === selectedCategory);
  }
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> "${quote.text}"</p>
    <p><em>Category:</em> ${quote.category}</p>
  `;
  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Populate category filter dropdown dynamically
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastFilter = loadLastFilter();
  if ([...categoryFilter.options].some((o) => o.value === lastFilter)) {
    categoryFilter.value = lastFilter;
  } else {
    categoryFilter.value = "all";
  }
}

// Filter quotes based on selected category and show one
function filterQuotes() {
  saveLastFilter(categoryFilter.value);
  showRandomQuote();
}

// Add a new quote from input fields
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please fill in both the quote and category.");
    return;
  }

  const newQuote = {
    text: quoteText,
    category: quoteCategory,
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  quoteDisplay.innerHTML = `
    <p><strong>New Quote Added:</strong> "${newQuote.text}"</p>
    <p><em>Category:</em> ${newQuote.category}</p>
  `;
}

// Create Add Quote form dynamically (if not in HTML)
function createAddQuoteForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const formHtml = `
    <div>
      <input type="text" id="newQuoteText" placeholder="Enter quote" />
      <input type="text" id="newQuoteCategory" placeholder="Enter category" />
      <button id="addQuoteButton">Add Quote</button>
    </div>
  `;
  container.innerHTML = formHtml;

  // Attach event listener to dynamically created button
  document.getElementById("addQuoteButton").addEventListener("click", addQuote);
}

// Export quotes as JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Failed to parse JSON file.");
    }
  };
  fileReader.readAsText(file);
}

// Show notification message for syncing/conflicts
function showSyncNotification(message) {
  syncNotification.textContent = message;
  syncNotification.style.display = "block";
  setTimeout(() => {
    syncNotification.style.display = "none";
  }, 5000);
}

// Simulated server endpoint (using JSONPlaceholder for demo)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch quotes from server (simulate GET)
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_URL);
  if (!response.ok) throw new Error("Network response was not ok");
  const data = await response.json();

  return data.slice(0, 10).map((post) => ({
    text: post.title,
    category: "Server" + post.userId,
  }));
}

// Post quotes to server (simulate POST)
async function postQuotesToServer(quotesToPost) {
  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quotesToPost),
  });
  if (!response.ok) throw new Error("Failed to post to server");
  return await response.json();
}

// Sync local quotes with server quotes
function syncQuotes(serverQuotes) {
  let conflictsResolved = false;
  const localMap = new Map(quotes.map((q) => [`${q.text}|${q.category}`, q]));

  serverQuotes.forEach((sq) => {
    const key = `${sq.text}|${sq.category}`;
    if (!localMap.has(key)) {
      quotes.push(sq);
      conflictsResolved = true;
    }
  });

  if (conflictsResolved) {
    saveQuotes();
  }
  return conflictsResolved;
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
    } else {
      showSyncNotification("Quotes synced with server!");
    }
  } catch (err) {
    console.error("Sync failed:", err);
    showSyncNotification("Failed to sync with server.");
  }
}

// Initialization
window.onload = () => {
  loadQuotes();
  populateCategories();
  filterQuotes();

  // Create the add quote form if needed
  createAddQuoteForm("addQuoteFormContainer");

  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportQuotesBtn.addEventListener("click", exportToJsonFile);
  importFileInput.addEventListener("change", importFromJsonFile);
  categoryFilter.addEventListener("change", filterQuotes);

  periodicSync();
  setInterval(periodicSync, 20000);
};
