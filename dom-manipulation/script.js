// Use existing elements instead of creating new ones
const quoteDisplay = document.getElementById("quoteDisplay");
const showQuoteButton = document.getElementById("newQuote");
const addQuoteButton = document.getElementById("addQuoteButton");
const importInput = document.getElementById("importFile");
const exportButton = document.getElementById("exportQuotes");

// Load quotes from localStorage or default list
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

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> "${quote.text}"</p>
    <p><em>Category:</em> ${quote.category}</p>
  `;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Please fill in both fields.");
  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  showRandomQuote();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Export quotes as a JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format: expected an array of quotes.");
      }
    } catch (err) {
      alert("Failed to import: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Wire up event listeners
window.onload = () => {
  showQuoteButton.addEventListener("click", showRandomQuote);
  addQuoteButton.addEventListener("click", addQuote);
  exportButton.addEventListener("click", exportToJsonFile);
  importInput.addEventListener("change", importFromJsonFile);

  // Show last viewed quote if available
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerHTML = `
      <p><strong>Last Viewed Quote:</strong> "${quote.text}"</p>
      <p><em>Category:</em> ${quote.category}</p>
    `;
  } else {
    showRandomQuote();
  }
};
