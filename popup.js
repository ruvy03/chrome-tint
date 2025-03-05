document.addEventListener("DOMContentLoaded", () => {
  const tintSwitch = document.getElementById("tint-switch");
  const colorControls = document.querySelector(".color-controls");
  const tintColor = document.getElementById("tint-color");
  const tintStrength = document.getElementById("tint-strength");
  const strengthValue = document.getElementById("strength-value");
  const statusText = document.getElementById("status");
  const presetColors = document.querySelectorAll(".preset-color");

  // Set preset color backgrounds
  presetColors.forEach((preset) => {
    const color = preset.getAttribute("data-color");
    preset.style.backgroundColor = color;
  });

  // Load initial state
  chrome.storage.sync.get(["enabled", "color", "strength"], (data) => {
    const enabled = data.enabled !== undefined ? data.enabled : true;
    const color = data.color || "#FFC87C";
    const strength = data.strength || 0.2;

    tintSwitch.checked = enabled;
    colorControls.style.opacity = enabled ? "1" : "0.3";
    colorControls.style.pointerEvents = enabled ? "auto" : "none";
    tintColor.value = color;
    tintStrength.value = strength;
    strengthValue.textContent = `${Math.round(strength * 100)}%`;
  });

  // Toggle switch event
  tintSwitch.addEventListener("change", () => {
    const enabled = tintSwitch.checked;
    colorControls.style.opacity = enabled ? "1" : "0.3";
    colorControls.style.pointerEvents = enabled ? "auto" : "none";

    chrome.storage.sync.set({ enabled }, () => {
      updateTint();
    });
  });

  // Preset colors event
  presetColors.forEach((preset) => {
    preset.addEventListener("click", () => {
      const color = preset.getAttribute("data-color");
      tintColor.value = color;
      updateTint();
    });
  });

  // Color and strength change events
  tintColor.addEventListener("input", updateTint);
  tintStrength.addEventListener("input", () => {
    strengthValue.textContent = `${Math.round(tintStrength.value * 100)}%`;
    updateTint();
  });

  // Update tint function
  function updateTint() {
    const color = tintColor.value;
    const strength = parseFloat(tintStrength.value);
    const enabled = tintSwitch.checked;

    // Save to storage
    chrome.storage.sync.set({ color, strength, enabled }, () => {
      // Update current tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs
            .sendMessage(tabs[0].id, {
              action: "updateTint",
              color: color,
              strength: strength,
              enabled: enabled,
            })
            .catch(() => {
              // Ignore errors if content script isn't loaded
            });
        }
      });

      // Update all tabs
      chrome.runtime.sendMessage({
        action: "updateAllTabs",
        color: color,
        strength: strength,
        enabled: enabled,
      });
    });
  }
});
