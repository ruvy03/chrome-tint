document.addEventListener("DOMContentLoaded", () => {
  const tintSwitch = document.getElementById("tint-switch");
  const tintControls = document.querySelector(".tint-controls");
  const tintColor = document.getElementById("tint-color");
  const tintStrength = document.getElementById("tint-strength");
  const strengthValue = document.getElementById("strength-value");
  const tintPreview = document.getElementById("tint-preview");
  const statusText = document.getElementById("status");
  const presetColors = document.querySelectorAll(".preset-color");

  // Load initial state
  chrome.storage.sync.get(["enabled", "color", "strength"], (data) => {
    const enabled = data.enabled !== undefined ? data.enabled : true;
    const color = data.color || "#FF9D23";
    const strength = data.strength || 0.2;

    tintSwitch.checked = enabled;
    tintControls.classList.toggle("hidden", !enabled);
    tintColor.value = color;
    tintStrength.value = strength;
    strengthValue.textContent = `${Math.round(strength * 100)}%`;
    updatePreview();
  });

  // Toggle switch event
  tintSwitch.addEventListener("change", () => {
    const enabled = tintSwitch.checked;
    tintControls.classList.toggle("hidden", !enabled);

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

  // Update preview function
  function updatePreview() {
    tintPreview.style.backgroundColor = tintColor.value;
    tintPreview.style.opacity = tintSwitch.checked ? tintStrength.value : 0;
  }

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
      chrome.runtime.sendMessage(
        {
          action: "updateAllTabs",
          color: color,
          strength: strength,
          enabled: enabled,
        },
        () => {
          updatePreview();
          statusText.textContent = "Changes applied to all tabs";
          setTimeout(() => {
            statusText.textContent = "Changes will apply to all tabs";
          }, 2000);
        }
      );
    });
  }
});
