chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateAllTabs") {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        try {
          chrome.tabs
            .sendMessage(tab.id, {
              action: "updateTint",
              color: message.color,
              strength: message.strength,
              enabled: message.enabled,
            })
            .catch(() => {});
        } catch (e) {}
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
        } catch (e) {}
      }
    });
  });
});
