document.addEventListener("DOMContentLoaded", () => {
  const tintSwitch = document.getElementById("tint-switch");
  const colorControls = document.querySelector(".color-controls");
  const tintColor = document.getElementById("tint-color");
  const tintStrength = document.getElementById("tint-strength");
  const strengthValue = document.getElementById("strength-value");
  const tintDarkness = document.getElementById("tint-darkness");
  const darknessValue = document.getElementById("darkness-value");
  const statusText = document.getElementById("status");
  const presetColors = document.querySelectorAll(".preset-color");

  // Set preset color backgrounds
  presetColors.forEach((preset) => {
    const color = preset.getAttribute("data-color");
    preset.style.backgroundColor = color;
  });

  // Load initial state
  chrome.storage.sync.get(
    ["enabled", "color", "strength", "darkness", "originalColor"],
    (data) => {
      const enabled = data.enabled !== undefined ? data.enabled : true;
      const color = data.color || "#FFC87C";
      const strength = data.strength || 0.2;
      const darkness = data.darkness || 0;
      const originalColor = data.originalColor || color;

      tintSwitch.checked = enabled;
      colorControls.style.opacity = enabled ? "1" : "0.3";
      colorControls.style.pointerEvents = enabled ? "auto" : "none";
      tintColor.value = color;
      tintStrength.value = strength;
      strengthValue.textContent = `${Math.round(strength * 100)}%`;
      tintDarkness.value = darkness;
      darknessValue.textContent = `${Math.round(darkness * 100)}%`;
    }
  );

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

  // Darkness slider event
  tintDarkness.addEventListener("input", () => {
    darknessValue.textContent = `${Math.round(tintDarkness.value * 100)}%`;
    updateTint();
  });

  // Update tint function
  function updateTint() {
    const color = tintColor.value;
    const strength = parseFloat(tintStrength.value);
    const darkness = parseFloat(tintDarkness.value);
    const enabled = tintSwitch.checked;

    // Store the original color in local storage when first selected
    chrome.storage.sync.get(["originalColor"], (data) => {
      const originalColor = data.originalColor || color;

      // Apply darkness by darkening the color
      let finalColor = color;
      if (darkness > 0) {
        const darkenedColor = darkenColor(color, darkness);
        finalColor = darkenedColor;
      }

      // Save to storage
      chrome.storage.sync.set(
        {
          color,
          strength,
          enabled,
          darkness,
          originalColor,
        },
        () => {
          // Update current tab
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs
                .sendMessage(tabs[0].id, {
                  action: "updateTint",
                  color: finalColor,
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
            color: finalColor,
            strength: strength,
            enabled: enabled,
          });
        }
      );
    });
  }

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
});
