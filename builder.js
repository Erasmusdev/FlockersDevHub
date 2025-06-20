// Your existing variables and functions
const premadeGrid = document.getElementById('premadeGrid');
const imageInput = document.getElementById('imageInput');
const previewImg = document.getElementById('previewImg');
const animateCheckbox = document.getElementById('animateCheckbox');
const saveBtn = document.getElementById('saveBtn');
const output = document.getElementById('output');

// New: login button element (make sure this exists in your HTML)
const googleLoginBtn = document.getElementById('google-login-btn');

let selectedPremade = null;
let uploadedFile = null;

// Firebase imports and config (make sure Firebase SDK scripts are included in your HTML)
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  // ... other config values
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Your existing helper functions...

function clearPremadeSelection() {
  premadeGrid.querySelectorAll('img').forEach(img => img.classList.remove('selected'));
  selectedPremade = null;
}

function setPreview(src) {
  previewImg.classList.remove('fade-in');
  previewImg.src = src;
  if (animateCheckbox.checked) {
    previewImg.onload = () => {
      previewImg.classList.add('fade-in');
      previewImg.onload = null;
    };
  } else {
    previewImg.onload = null;
  }
}

// Premade image selection
premadeGrid.addEventListener('click', e => {
  if (e.target.tagName === 'IMG') {
    clearPremadeSelection();
    e.target.classList.add('selected');
    selectedPremade = e.target.src;
    uploadedFile = null;
    imageInput.value = '';
    setPreview(selectedPremade);
  }
});

// File upload input
imageInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  uploadedFile = file;
  clearPremadeSelection();
  selectedPremade = null;
  setPreview(URL.createObjectURL(file));
});

// Animate toggle re-apply
animateCheckbox.addEventListener('change', () => {
  if (previewImg.src) {
    setPreview(previewImg.src);
  }
});

// Save button click handler (replace with Firebase or your backend logic)
saveBtn.addEventListener('click', () => {
  if (!previewImg.src) {
    alert('Please upload or select an image first.');
    return;
  }

  // For demo: output info about selected image and animation state
  let info = `Image URL: ${uploadedFile ? 'Local File (upload needed)' : selectedPremade}\n`;
  info += `Animation: ${animateCheckbox.checked ? 'On' : 'Off'}`;
  output.innerHTML = `
    <p>✅ Overlay ready!</p>
    <pre style="white-space: pre-wrap; word-break: break-word;">${info}</pre>
  `;
});

// --- Firebase Authentication part ---

// Login with Google
googleLoginBtn.addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then(result => {
      const user = result.user;
      console.log('User signed in:', user);
      output.innerHTML = `<p>Welcome, ${user.displayName}!</p>`;
      // You can now show/hide UI, fetch user data, etc.
    })
    .catch(error => {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    });
});

// Detect auth state changes to react to login/logout
onAuthStateChanged(auth, user => {
  if (user) {
    console.log('User logged in:', user);
    output.innerHTML = `<p>Welcome back, ${user.displayName}!</p>`;
    googleLoginBtn.style.display = 'none'; // Hide login button when logged in
    // Show user profile, load user data etc.
  } else {
    console.log('User logged out');
    output.innerHTML = `<p>Please log in.</p>`;
    googleLoginBtn.style.display = 'inline-block'; // Show login button when logged out
    // Hide profile etc.
  }
});
