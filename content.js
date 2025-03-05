if (enabled) {
  let tintDiv;
}

function applyTint(color, strength, enabled = true) {
  if (!tintDiv) {
    tintDiv = document.createElement("div");
    tintDiv.style.pointerEvents = "none";
    tintDiv.style.position = "fixed";
    tintDiv.style.top = "0";
    tintDiv.style.left = "0";
    tintDiv.style.width = "100%";
    tintDiv.style.height = "100%";
    tintDiv.style.zIndex = "999999";
    document.documentElement.appendChild(tintDiv);
  }

  if (!enabled || strength === 0) {
    tintDiv.style.display = "none";
  } else {
    tintDiv.style.display = "block";
    tintDiv.style.backgroundColor = color;
    tintDiv.style.opacity = strength;
  }
}

chrome.storage.sync.get(["color", "strength", "enabled"], (data) => {
  const color = data.color || "#FF9D23";
  const strength = data.strength || 0.2;
  const enabled = data.enabled !== undefined ? data.enabled : true;
  applyTint(color, strength, enabled);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    chrome.storage.sync.get(["color", "strength", "enabled"], (data) => {
      applyTint(data.color, data.strength, data.enabled);
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateTint") {
    applyTint(message.color, message.strength, message.enabled);
    sendResponse({ success: true });
  }
  return true;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    let color, strength;

    if (changes.color && changes.color.newValue) {
      color = changes.color.newValue;
    }

    if (changes.strength && changes.strength.newValue !== undefined) {
      strength = changes.strength.newValue;
    }

    if (color === undefined || strength === undefined) {
      chrome.storage.sync.get(["color", "strength"], (data) => {
        applyTint(
          color !== undefined ? color : data.color || "#FF9D23",
          strength !== undefined ? strength : data.strength || 0
        );
      });
    } else {
      applyTint(color, strength);
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["color", "strength"], (data) => {
    const color = data.color || "#FF9D23";
    const strength = data.strength || 0;
    applyTint(color, strength);
  });
});

window.addEventListener("load", () => {
  if (tintDiv && document.body) {
    document.body.appendChild(tintDiv);
  }
});
