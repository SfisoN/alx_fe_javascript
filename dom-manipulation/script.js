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

// Create and append the quote display area
const quoteDisplay = document.createElement("div");
quoteDisplay.id = "quoteDisplay";
document.body.appendChild(quoteDisplay);

// Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> "${quote.text}"</p>
    <p><em>Category:</em> ${quote.category}</p>
  `;
}

// Create the "Add Quote" form using createElement/appendChild
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formDiv.appendChild(inputText);
  formDiv.appendChild(inputCategory);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
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

// Setup everything on page load
window.onload = () => {
  // Create Add Quote Form
  createAddQuoteForm();

  // Create "Show New Quote" button
  const showButton = document.createElement("button");
  showButton.id = "newQuote";
  showButton.textContent = "Show New Quote";
  showButton.addEventListener("click", showRandomQuote); // ✅ event listener

  document.body.insertBefore(showButton, quoteDisplay);

  
  showRandomQuote();
};
