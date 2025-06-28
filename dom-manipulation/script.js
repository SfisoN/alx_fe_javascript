// Initial array of quote objects
const quotes = [
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

// Get DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

// Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> "${quote.text}"</p>
    <p><em>Category:</em> ${quote.category}</p>
  `;
}

// Optionally reference existing form elements (placeholder function)
function createAddQuoteForm() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const addButton = document.querySelector('button[onclick="addQuote()"]');

  if (!textInput || !categoryInput || !addButton) {
    console.warn("Add Quote form elements are missing in the HTML.");
  } else {
    console.log("Add Quote form is already present in the DOM.");
  }
}

// Add a new quote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please fill in both the quote and category.");
    return;
  }

  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  quoteDisplay.innerHTML = `
    <p><strong>New Quote Added:</strong> "${newQuote.text}"</p>
    <p><em>Category:</em> ${newQuote.category}</p>
  `;
}

// Initial setup
window.onload = () => {
  createAddQuoteForm(); 
  newQuoteButton.addEventListener("click", showRandomQuote);
  showRandomQuote(); 
};
