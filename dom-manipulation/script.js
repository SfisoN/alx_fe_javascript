// Initial quotes or load from localStorage
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

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteButton");
const categoryFilter = document.getElementById("categoryFilter");
const importFile = document.getElementById("importFile");
const exportBtn = document.getElementById("exportQuotes");

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate the category dropdown dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map((q) => q.category))];
  const lastSelected = localStorage.getItem("selectedCategory") || "all";

  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    if (category === lastSelected) {
      option.selected = true;
    }
    categoryFilter.appendChild(option);
  });
}

// Display a random quote, filtered by category
function showRandomQuote() {
  filterQuotes(); // Uses selected category to filter
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes = quotes;
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

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Add new quote to array and update UI
function addQuote() {
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

// Import quotes from a JSON file
function importFromJsonFile(event) {
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
        alert("Invalid JSON format. Expected an array.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Setup on window load
window.onload = () => {
  populateCategories();
  filterQuotes(); // Initial quote

  newQuoteBtn.addEventListener("click", showRandomQuote);
  addQuoteBtn.addEventListener("click", addQuote);
  exportBtn.addEventListener("click", exportToJsonFile);
  importFile.addEventListener("change", importFromJsonFile);
  categoryFilter.addEventListener("change", filterQuotes);
};
