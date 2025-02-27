const tintColor = document.getElementById("tint-color");
const tintStrength = document.getElementById("tint-strength");
const strengthValue = document.getElementById("strength-value");
const tintPreview = document.getElementById("tint-preview");
const applyButton = document.getElementById("apply-button");
const statusText = document.getElementById("status");

chrome.storage.sync.get(["color", "strength"], (data) => {
  const color = data.color || "#FF9D23";
  const strength = data.strength || 0.2;

  tintColor.value = color;
  tintStrength.value = strength;
  strengthValue.textContent = `${Math.round(strength * 100)}%`;
  updatePreview();
});

tintColor.addEventListener("input", updatePreview);
tintStrength.addEventListener("input", () => {
  strengthValue.textContent = `${Math.round(tintStrength.value * 100)}%`;
  updatePreview();
});

applyButton.addEventListener("click", () => {
  const color = tintColor.value;
  const strength = parseFloat(tintStrength.value);

  chrome.storage.sync.set({ color, strength }, () => {
    statusText.textContent = "Applied! Changes are active on all tabs.";
    setTimeout(() => {
      statusText.textContent = "Changes will apply to all tabs";
    }, 2000);
  });
});

function updatePreview() {
  tintPreview.style.backgroundColor = tintColor.value;
  tintPreview.style.opacity = tintStrength.value;
}
