// Handle messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateAllTabs") {
    // Update all tabs with new tint settings
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        try {
          chrome.tabs
            .sendMessage(tab.id, {
              action: "updateTint",
              color: message.color,
              strength: message.strength,
            })
            .catch(() => {
              // Ignore errors for tabs where content script isn't running
            });
        } catch (e) {
          // Ignore errors for restricted tabs
        }
      });
    });
    sendResponse({ success: true });
  }
  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url.startsWith("http")) {
        try {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
        } catch (e) {
          // Ignore errors for restricted tabs
        }
      }
    });
  });
});
