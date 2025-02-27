const tintColor = document.getElementById("tint-color");
const tintStrength = document.getElementById("tint-strength");
const strengthValue = document.getElementById("strength-value");
const tintPreview = document.getElementById("tint-preview");
const applyButton = document.getElementById("apply-button");
const statusText = document.getElementById("status");

// Load saved settings when popup opens
chrome.storage.sync.get(["color", "strength"], (data) => {
  const color = data.color || "#FF9D23";
  const strength = data.strength || 0.2;

  tintColor.value = color;
  tintStrength.value = strength;
  strengthValue.textContent = `${Math.round(strength * 100)}%`;
  updatePreview();
});

// Update preview in real-time
tintColor.addEventListener("input", updatePreview);
tintStrength.addEventListener("input", () => {
  strengthValue.textContent = `${Math.round(tintStrength.value * 100)}%`;
  updatePreview();
});

// Apply settings and update immediately via background script
applyButton.addEventListener("click", () => {
  const color = tintColor.value;
  const strength = parseFloat(tintStrength.value);

  // Save to storage first
  chrome.storage.sync.set({ color, strength }, () => {
    // Then communicate with the background script to update all tabs
    chrome.runtime.sendMessage(
      {
        action: "updateAllTabs",
        color: color,
        strength: strength,
      },
      () => {
        // Also send a message to the current tab directly for immediate effect
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs
              .sendMessage(tabs[0].id, {
                action: "updateTint",
                color: color,
                strength: strength,
              })
              .catch(() => {
                // Ignore errors if content script isn't loaded
              });
          }
        });

        statusText.textContent = "Applied! Changes are active on all tabs.";
        setTimeout(() => {
          statusText.textContent = "Changes will apply to all tabs";
        }, 2000);
      }
    );
  });
});

function updatePreview() {
  tintPreview.style.backgroundColor = tintColor.value;
  tintPreview.style.opacity = tintStrength.value;
}
