const tintColor = document.getElementById("tint-color");
const tintStrength = document.getElementById("tint-strength");

tintColor.addEventListener("input", updateTint);
tintStrength.addEventListener("input", updateTint);

function updateTint() {
    const color = tintColor.value;
    const strength = tintStrength.value;
    chrome.storage.sync.set{color, strength};
};