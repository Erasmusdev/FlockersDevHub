// Firebase config (replace with your actual config)
    const firebaseConfig = {
      apiKey: "AIzaSyB2Z6FegNJkXIs_Fdk5Qn7DaoQtFPdpshU",
      authDomain: "flockersdevhub-6ae8a.firebaseapp.com",
      projectId: "flockersdevhub-6ae8a",
      storageBucket: "flockersdevhub-6ae8a.firebasestorage.app",
      messagingSenderId: "821197375071",
      appId: "1:821197375071:web:9b36cee3c1e1af1f3c7dea"
    };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM references
const previewImg = document.getElementById("previewImg");
const premadeGrid = document.getElementById("premadeGrid");
const imageInput = document.getElementById("imageInput");
const saveBtn = document.getElementById("saveBtn");
const output = document.getElementById("output");

const tintColorInput = document.getElementById("tintColor");
const tintOpacityInput = document.getElementById("tintOpacity");
const captionTextInput = document.getElementById("captionText");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const tintLayer = document.querySelector(".tint-layer");
const overlayCaption = document.querySelector(".overlay-caption");

let selectedImageSrc = previewImg.src || "";
let selectedAnimations = new Set();

// Update UI for logged in/out state
function updateUIForUser(user) {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    saveBtn.disabled = false;
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    saveBtn.disabled = true;
  }
}

auth.onAuthStateChanged(user => {
  updateUIForUser(user);
});

// Login with Google
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(console.error);
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut().catch(console.error);
});

// Premade overlay click handler
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
  }
});

// Image upload handler
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
  };
  reader.readAsDataURL(file);
});

// Convert hex to RGB
function hexToRgb(hex) {
  const cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length !== 6) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

// Apply tint color with opacity
function applyTintColor() {
  const hex = tintColorInput.value;
  const opacity = parseFloat(tintOpacityInput.value);
  const rgb = hexToRgb(hex);
  if (!rgb) return;

  const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;

  tintLayer.style.backgroundColor = rgba;
  tintLayer.style.boxShadow = `inset 0 0 50px ${rgba}`;

  overlayCaption.style.color = rgba;
  overlayCaption.style.textShadow = `0 0 10px ${rgba}`;
}

// Update caption text
function applyCaption() {
  overlayCaption.textContent = captionTextInput.value.trim();
}

// Animation checkboxes
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

// Apply animation classes
function applyAnimations() {
  previewImg.classList.remove("fade-in", "slide-in", "zoom-in");
  void previewImg.offsetWidth; // trigger reflow
  selectedAnimations.forEach(anim => previewImg.classList.add(anim));
}

// Listen to tint and opacity changes
tintColorInput.addEventListener("input", applyTintColor);
tintOpacityInput.addEventListener("input", applyTintColor);

// Listen to caption changes
captionTextInput.addEventListener("input", applyCaption);

// Save overlay (placeholder)
saveBtn.addEventListener("click", () => {
  const data = {
    image: selectedImageSrc,
    tintColor: tintColorInput.value,
    tintOpacity: tintOpacityInput.value,
    caption: captionTextInput.value,
    animations: Array.from(selectedAnimations),
    user: auth.currentUser ? auth.currentUser.email : "Not logged in",
  };

  output.innerHTML =
    `<strong>Overlay saved!</strong><br>` +
    `User: ${data.user}<br>` +
    `Tint Color: ${data.tintColor}<br>` +
    `Opacity: ${data.tintOpacity}<br>` +
    `Caption: ${data.caption}<br>` +
    `Animations: ${data.animations.join(", ") || "None"}` +
    `<br><br><input type="text" readonly value="${selectedImageSrc}" title="Overlay Image Source"/>`;
});

// Initialize on page load
applyTintColor();
applyCaption();
applyAnimations();
