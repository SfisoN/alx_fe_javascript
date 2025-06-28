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
      // Exact notification as requested
      showSyncNotification("Quotes synced with server!");
    }
  } catch (err) {
    console.error("Sync failed:", err);
    showSyncNotification("Failed to sync with server.");
  }
}
