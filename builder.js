// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyB2Z6FegNJkXIs_Fdk5Qn7DaoQtFPdpshU",
  authDomain: "flockersdevhub-6ae8a.firebaseapp.com",
  projectId: "flockersdevhub-6ae8a",
  storageBucket: "flockersdevhub-6ae8a.firebasestorage.app",
  messagingSenderId: "821197375071",
  appId: "1:821197375071:web:9b36cee3c1e1af1f3c7dea"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const previewImg = document.getElementById("previewImg");
const premadeGrid = document.getElementById("premadeGrid");
const imageInput = document.getElementById("imageInput");
const saveBtn = document.getElementById("saveBtn");
const output = document.getElementById("output");

const tintColorInput = document.getElementById("tintColor");
const tintOpacityInput = document.getElementById("tintOpacity");
const captionTextInput = document.getElementById("captionText");
const captionOpacityInput = document.getElementById("captionOpacity");
const dropShadowCheckbox = document.getElementById("dropShadow"); // NEW
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const tintLayer = document.querySelector(".tint-layer");
const overlayCaption = document.querySelector(".overlay-caption");

let selectedImageSrc = previewImg.src || "";
let selectedAnimations = new Set();

function updateUIForUser(user) {
  loginBtn.style.display = user ? "none" : "inline-block";
  logoutBtn.style.display = user ? "inline-block" : "none";
  saveBtn.disabled = !user;
}

auth.onAuthStateChanged(updateUIForUser);

loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(console.error);
});

logoutBtn.addEventListener("click", () => {
  auth.signOut().catch(console.error);
});

premadeGrid.addEventListener("click", e => {
  if (e.target.tagName === "IMG") {
    Array.from(premadeGrid.children).forEach(img => img.classList.remove("selected"));
    e.target.classList.add("selected");
    selectedImageSrc = e.target.src;
    previewImg.src = selectedImageSrc;
    imageInput.value = "";
    applyTintColor();
    applyCaption();
    applyAnimations();
    applyCaptionStyle();
  }
});

imageInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    previewImg.src = reader.result;
    selectedImageSrc = reader.result;
    Array.from(premadeGrid.children).forEach(img => img.classList.remove("selected"));
    applyTintColor();
    applyCaption();
    applyAnimations();
    applyCaptionStyle();
  };
  reader.readAsDataURL(file);
});

function hexToRgb(hex) {
  const cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length !== 6) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

function applyTintColor() {
  const hex = tintColorInput.value;
  const opacity = parseFloat(tintOpacityInput.value);
  const rgb = hexToRgb(hex);
  if (!rgb) return;

  const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  tintLayer.style.backgroundColor = rgba;
  tintLayer.style.boxShadow = `inset 0 0 50px ${rgba}`;
}

function applyCaptionStyle() {
  const hex = tintColorInput.value;
  const opacity = parseFloat(captionOpacityInput.value);
  const rgb = hexToRgb(hex);
  if (!rgb) return;

  const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  overlayCaption.style.color = rgba;

  // Apply or remove drop shadow based on toggle
  if (dropShadowCheckbox.checked) {
    overlayCaption.style.textShadow = `0 0 10px ${rgba}`;
  } else {
    overlayCaption.style.textShadow = "none";
  }
}

function applyCaption() {
  overlayCaption.textContent = captionTextInput.value.trim();
}

const animationCheckboxes = document.querySelectorAll("input[name=animation]");
animationCheckboxes.forEach(cb =>
  cb.addEventListener("change", () => {
    selectedAnimations.clear();
    animationCheckboxes.forEach(box => {
      if (box.checked) selectedAnimations.add(box.value);
    });
    applyAnimations();
  })
);

function applyAnimations() {
  previewImg.classList.remove("fade-in", "slide-in", "zoom-in");
  void previewImg.offsetWidth;
  selectedAnimations.forEach(anim => previewImg.classList.add(anim));
}

// === Event listeners ===
tintColorInput.addEventListener("input", () => {
  applyTintColor();
  applyCaptionStyle();
});
tintOpacityInput.addEventListener("input", applyTintColor);
captionTextInput.addEventListener("input", applyCaption);
captionOpacityInput.addEventListener("input", applyCaptionStyle);
dropShadowCheckbox.addEventListener("change", applyCaptionStyle); // NEW

saveBtn.addEventListener("click", () => {
  const data = {
    image: selectedImageSrc,
    tintColor: tintColorInput.value,
    tintOpacity: tintOpacityInput.value,
    caption: captionTextInput.value,
    captionOpacity: captionOpacityInput.value,
    dropShadow: dropShadowCheckbox.checked, // NEW
    animations: Array.from(selectedAnimations),
    user: auth.currentUser ? auth.currentUser.email : "Not logged in",
  };

  output.innerHTML =
    `<strong>Overlay saved!</strong><br>` +
    `User: ${data.user}<br>` +
    `Tint Color: ${data.tintColor}<br>` +
    `Tint Opacity: ${data.tintOpacity}<br>` +
    `Caption: ${data.caption}<br>` +
    `Caption Opacity: ${data.captionOpacity}<br>` +
    `Drop Shadow: ${data.dropShadow ? "On" : "Off"}<br>` +
    `Animations: ${data.animations.join(", ") || "None"}` +
    `<br><br><input type="text" readonly value="${selectedImageSrc}" title="Overlay Image Source"/>`;
});

// Initialize everything
applyTintColor();
applyCaption();
applyAnimations();
applyCaptionStyle();
