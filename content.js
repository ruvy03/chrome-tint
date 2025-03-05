let tintDiv;

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
    tintDiv.style.transition = "opacity 0.3s ease";
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

chrome.storage.sync.get(
  ["color", "strength", "enabled", "darkness", "originalColor"],
  (data) => {
    const color = data.color || "#FF9D23";
    const strength = data.strength || 0.2;
    const enabled = data.enabled !== undefined ? data.enabled : true;
    const darkness = data.darkness || 0;
    const originalColor = data.originalColor || color;

    let finalColor = color;
    if (darkness > 0) {
      finalColor = darkenColor(originalColor, darkness);
    }

    applyTint(finalColor, strength, enabled);
  }
);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    chrome.storage.sync.get(
      ["color", "strength", "enabled", "darkness", "originalColor"],
      (data) => {
        const color = data.color || "#FF9D23";
        const strength = data.strength || 0.2;
        const enabled = data.enabled !== undefined ? data.enabled : true;
        const darkness = data.darkness || 0;
        const originalColor = data.originalColor || color;

        let finalColor = color;
        if (darkness > 0) {
          finalColor = darkenColor(originalColor, darkness);
        }

        applyTint(finalColor, strength, enabled);
      }
    );
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateTint") {
    applyTint(message.color, message.strength, message.enabled);
    sendResponse({ success: true });
  }
  return true;
});

window.addEventListener("load", () => {
  if (tintDiv && document.body) {
    document.body.appendChild(tintDiv);
  }
});

function darkenColor(color, darknessLevel) {
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);

  r = Math.round(r * (1 - darknessLevel));
  g = Math.round(g * (1 - darknessLevel));
  b = Math.round(b * (1 - darknessLevel));

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
