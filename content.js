let tintDiv;

function applyTint(color, strength) {
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
  tintDiv.style.backgroundColor = color;
  tintDiv.style.opacity = strength;
}

chrome.storage.sync.get(["color", "strength"], (data) => {
  const color = data.color || "#FF9D23";
  const strength = data.strength || 0.2;
  applyTint(color, strength);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.color && changes.strength) {
    applyTint(changes.color.newValue, changes.strength.newValue);
  }
});
