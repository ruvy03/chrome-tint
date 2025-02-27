// Create the tint element as soon as the script loads
let tintDiv;

function applyTint(color, strength) {
  if (!tintDiv) {
    tintDiv = document.createElement("div");
    tintDiv.id = "chrome-tint-overlay";
    tintDiv.style.pointerEvents = "none";
    tintDiv.style.position = "fixed";
    tintDiv.style.top = "0";
    tintDiv.style.left = "0";
    tintDiv.style.width = "100%";
    tintDiv.style.height = "100%";
    tintDiv.style.zIndex = "999999";
    document.documentElement.appendChild(tintDiv);
  }

  tintDiv.style.backgroundColor = color;
  tintDiv.style.opacity = strength;
}

// Apply tint immediately when page loads
chrome.storage.sync.get(["color", "strength"], (data) => {
  const color = data.color || "#FF9D23";
  const strength = data.strength || 0.2;
  applyTint(color, strength);
});

// Listen for direct messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateTint") {
    applyTint(message.color, message.strength);
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async responses
});

// Also listen for storage changes as a backup method
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    let color, strength;

    if (changes.color && changes.color.newValue) {
      color = changes.color.newValue;
    }

    if (changes.strength && changes.strength.newValue !== undefined) {
      strength = changes.strength.newValue;
    }

    // Get any missing values from storage
    if (color === undefined || strength === undefined) {
      chrome.storage.sync.get(["color", "strength"], (data) => {
        applyTint(
          color !== undefined ? color : data.color || "#FF9D23",
          strength !== undefined ? strength : data.strength || 0.2
        );
      });
    } else {
      applyTint(color, strength);
    }
  }
});

// Make sure the tint is properly applied even after page navigation within SPA
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["color", "strength"], (data) => {
    const color = data.color || "#FF9D23";
    const strength = data.strength || 0.2;
    applyTint(color, strength);
  });
});

// Ensure the tint stays on top of everything
window.addEventListener("load", () => {
  if (tintDiv && document.body) {
    // Move to end of body to ensure it's on top
    document.body.appendChild(tintDiv);
  }
});
