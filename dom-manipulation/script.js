// Initial array of quote objects
const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Get DOM elements from the existing HTML
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

// Show a random quote from the array
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> "${quote.text}"</p>
    <p><em>Category:</em> ${quote.category}</p>
  `;
}

// Function to add a new quote from form input
function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please fill in both the quote and category.");
    return;
  }

  const newQuote = {
    text: quoteText,
    category: quoteCategory
  };

  quotes.push(newQuote);

  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';

  // Optionally display the newly added quote
  quoteDisplay.innerHTML = `
    <p><strong>New Quote Added:</strong> "${newQuote.text}"</p>
    <p><em>Category:</em> ${newQuote.category}</p>
  `;
}

// Setup event listener for "Show New Quote" button
window.onload = () => {
  newQuoteButton.addEventListener('click', showRandomQuote);
  showRandomQuote(); // Show one quote on load
};
