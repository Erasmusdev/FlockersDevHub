// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyB2Z6FegNJkXIs_Fdk5Qn7DaoQtFPdpshU",
  authDomain: "flockersdevhub-6ae8a.firebaseapp.com",
  projectId: "flockersdevhub-6ae8a",
  storageBucket: "flockersdevhub-6ae8a.firebasestorage.app",
  messagingSenderId: "821198356849",
  appId: "1:821198356849:web:ebdc5eaf96b9a5ca279f59",
  measurementId: "G-T58RYJJGVC",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
});

logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

auth.onAuthStateChanged((user) => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});

// --- Overlay Layer Data Structure ---

class Layer {
  constructor(id, imgSrc, caption = "", tint = "#00c8f8", opacity = 0, textOpacity = 1, visible = true) {
    this.id = id;
    this.imgSrc = imgSrc;
    this.caption = caption;
    this.tint = tint;
    this.opacity = opacity; // default 0
    this.textOpacity = textOpacity;
    this.visible = visible;
    this.x = 0;
    this.y = 0;
    this.width = 150;
    this.height = 150;
  }
}

const layers = [];
let activeLayerId = null;

const previewCanvas = document.getElementById("previewCanvas");
const layersList = document.getElementById("layersList");

const tintColorInput = document.getElementById("tintColor");
const tintOpacityInput = document.getElementById("tintOpacity");
const captionTextInput = document.getElementById("captionText");
const captionOpacityInput = document.getElementById("captionOpacity");

const premadeGrid = document.getElementById("premadeGrid");
const imageInput = document.getElementById("imageInput");
const saveBtn = document.getElementById("saveBtn");
const addLayerBtn = document.getElementById("addLayerBtn");

// --- DRAGGING AND RESIZING HELPERS ---

let dragData = {
  dragging: false,
  startX: 0,
  startY: 0,
  origX: 0,
  origY: 0,
  layerId: null,
};

let resizeData = {
  resizing: false,
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
  startXPos: 0,
  startYPos: 0,
  layerId: null,
  handle: null,
};

// Render preview canvas with draggable + resizable layers
function renderPreviewCanvas() {
  previewCanvas.innerHTML = "";
  previewCanvas.style.position = "relative";

  layers.forEach((layer, index) => {
    if (!layer.visible) return;

    const wrapper = document.createElement("div");
    wrapper.className = "layer-image-wrapper";
    wrapper.style.position = "absolute";
    wrapper.style.left = layer.x + "px";
    wrapper.style.top = layer.y + "px";
    wrapper.style.width = layer.width + "px";
    wrapper.style.height = layer.height + "px";
    wrapper.style.zIndex = index + 1; // Ensure layering order
    wrapper.style.cursor = layer.id === activeLayerId ? "move" : "default";
    wrapper.dataset.layerId = layer.id;

    // Image element or placeholder
    if (layer.imgSrc) {
      const img = document.createElement("img");
      img.src = layer.imgSrc;
      img.alt = layer.caption || "Overlay image";
      img.draggable = false;
      img.style.width = "100%";
      img.style.height = "100%";
      wrapper.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.textContent = "Click to upload image";
      Object.assign(placeholder.style, {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#eee",
        border: "1px dashed #aaa",
        cursor: "pointer",
        fontSize: "14px",
        textAlign: "center",
        color: "#666",
      });
      placeholder.addEventListener("click", () => {
        pendingImageLayerId = layer.id;
        imageInput.click();
      });
      wrapper.appendChild(placeholder);
    }

    // Tint overlay
    const tintDiv = document.createElement("div");
    tintDiv.className = "layer-tint";
    tintDiv.style.backgroundColor = layer.tint;
    tintDiv.style.opacity = layer.opacity;
    Object.assign(tintDiv.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    });
    wrapper.appendChild(tintDiv);

    // Caption overlay
    const captionDiv = document.createElement("div");
    captionDiv.className = "layer-caption";
    captionDiv.textContent = layer.caption || "";
    captionDiv.style.opacity = layer.textOpacity;
    Object.assign(captionDiv.style, {
      position: "absolute",
      bottom: "0",
      left: "0",
      width: "100%",
      textAlign: "center",
      pointerEvents: "none",
      color: "#fff",
      textShadow: "0 0 5px rgba(0,0,0,0.7)",
      fontWeight: "bold",
      padding: "2px 0",
      userSelect: "none",
    });
    wrapper.appendChild(captionDiv);

    if (layer.id === activeLayerId) {
      // Drag start on wrapper
      wrapper.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("resize-handle")) return; // skip if resizing
        onDragStart(e, layer);
      });

      // Add resize handles
      ["nw", "ne", "sw", "se"].forEach((pos) => {
        const handle = document.createElement("div");
        handle.className = "resize-handle " + pos;
        Object.assign(handle.style, {
          position: "absolute",
          width: "12px",
          height: "12px",
          backgroundColor: "white",
          border: "1px solid black",
          boxSizing: "border-box",
          zIndex: 10,
          cursor: pos + "-resize",
        });
        switch (pos) {
          case "nw":
            handle.style.top = "-6px";
            handle.style.left = "-6px";
            break;
          case "ne":
            handle.style.top = "-6px";
            handle.style.right = "-6px";
            break;
          case "sw":
            handle.style.bottom = "-6px";
            handle.style.left = "-6px";
            break;
          case "se":
            handle.style.bottom = "-6px";
            handle.style.right = "-6px";
            break;
        }
        handle.addEventListener("mousedown", (e) => onResizeStart(e, layer, pos));
        wrapper.appendChild(handle);
      });
    }

    previewCanvas.appendChild(wrapper);
  });
}

// Drag functions

function onDragStart(e, layer) {
  dragData.dragging = true;
  dragData.startX = e.clientX;
  dragData.startY = e.clientY;
  dragData.origX = layer.x;
  dragData.origY = layer.y;
  dragData.layerId = layer.id;
  e.preventDefault();
}

function onDragMove(e) {
  if (!dragData.dragging) return;
  const layer = layers.find(l => l.id === dragData.layerId);
  if (!layer) return;

  const dx = e.clientX - dragData.startX;
  const dy = e.clientY - dragData.startY;

  layer.x = dragData.origX + dx;
  layer.y = dragData.origY + dy;

  updateUI();
}

function onDragEnd() {
  dragData.dragging = false;
  dragData.layerId = null;
}

// Resize functions

function onResizeStart(e, layer, handlePos) {
  e.stopPropagation();
  e.preventDefault();

  resizeData.resizing = true;
  resizeData.startX = e.clientX;
  resizeData.startY = e.clientY;
  resizeData.startWidth = layer.width;
  resizeData.startHeight = layer.height;
  resizeData.startXPos = layer.x;
  resizeData.startYPos = layer.y;
  resizeData.layerId = layer.id;
  resizeData.handle = handlePos;

  setActiveLayer(layer.id);
}

function onResizeMove(e) {
  if (!resizeData.resizing) return;
  const layer = layers.find(l => l.id === resizeData.layerId);
  if (!layer) return;

  const dx = e.clientX - resizeData.startX;
  const dy = e.clientY - resizeData.startY;

  const minSize = 50;

  switch (resizeData.handle) {
    case "se":
      layer.width = Math.max(minSize, resizeData.startWidth + dx);
      layer.height = Math.max(minSize, resizeData.startHeight + dy);
      break;
    case "sw":
      layer.width = Math.max(minSize, resizeData.startWidth - dx);
      layer.height = Math.max(minSize, resizeData.startHeight + dy);
      layer.x = resizeData.startXPos + dx;
      break;
    case "ne":
      layer.width = Math.max(minSize, resizeData.startWidth + dx);
      layer.height = Math.max(minSize, resizeData.startHeight - dy);
      layer.y = resizeData.startYPos + dy;
      break;
    case "nw":
      layer.width = Math.max(minSize, resizeData.startWidth - dx);
      layer.height = Math.max(minSize, resizeData.startHeight - dy);
      layer.x = resizeData.startXPos + dx;
      layer.y = resizeData.startYPos + dy;
      break;
  }

  updateUI();
}

function onResizeEnd() {
  resizeData.resizing = false;
  resizeData.layerId = null;
  resizeData.handle = null;
}

// Event listeners

document.addEventListener("mousemove", (e) => {
  onDragMove(e);
  onResizeMove(e);
});

document.addEventListener("mouseup", () => {
  onDragEnd();
  onResizeEnd();
});

// Set active layer for editing
function setActiveLayer(id) {
  activeLayerId = id;
  updateUI();
}

// Move layer in layers array by offset (-1 = up, +1 = down)
function moveLayer(id, offset) {
  const index = layers.findIndex((l) => l.id === id);
  if (index < 0) return;
  const newIndex = index + offset;
  if (newIndex < 0 || newIndex >= layers.length) return;
  [layers[index], layers[newIndex]] = [layers[newIndex], layers[index]];
  updateUI();
}

// Update UI controls based on active layer
function updateUI() {
  renderLayersList();
  renderPreviewCanvas();

  const layer = layers.find((l) => l.id === activeLayerId);

  if (layer) {
    tintColorInput.disabled = false;
    tintOpacityInput.disabled = false;
    captionTextInput.disabled = false;
    captionOpacityInput.disabled = false;

    tintColorInput.value = layer.tint;
    tintOpacityInput.value = layer.opacity;
    captionTextInput.value = layer.caption;
    captionOpacityInput.value = layer.textOpacity;
  } else {
    tintColorInput.disabled = true;
    tintOpacityInput.disabled = true;
    captionTextInput.disabled = true;
    captionOpacityInput.disabled = true;

    tintColorInput.value = "#00c8f8";
    tintOpacityInput.value = 0.5;
    captionTextInput.value = "";
    captionOpacityInput.value = 1;
  }
}

// Render the layers list with photo-show style
function renderLayersList() {
  layersList.innerHTML = "";

  layers.forEach((layer, index) => {
    const li = document.createElement("li");
    li.className = "layer-item" + (layer.id === activeLayerId ? " active" : "");

    // Eye icon
    const eyeIcon = document.createElement("span");
    eyeIcon.className = "eye-icon";
    eyeIcon.textContent = layer.visible ? "👁️" : "🚫";
    eyeIcon.title = layer.visible ? "Hide Layer" : "Show Layer";
    eyeIcon.style.cursor = "pointer";
    eyeIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      layer.visible = !layer.visible;
      updateUI();
    });

    // Caption text
    const captionSpan = document.createElement("span");
    captionSpan.className = "caption-text";
    captionSpan.textContent = layer.caption || "Unnamed Layer";
    captionSpan.style.cursor = "pointer";
    captionSpan.addEventListener("click", () => {
      setActiveLayer(layer.id);
    });

    // Controls container
    const controlsDiv = document.createElement("div");
    controlsDiv.className = "controls";

    // Up button
    const upBtn = document.createElement("button");
    upBtn.textContent = "⬆️";
    upBtn.title = "Move Layer Up";
    upBtn.disabled = index === 0;
    upBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (index > 0) moveLayer(layer.id, -1);
    });

    // Down button
    const downBtn = document.createElement("button");
    downBtn.textContent = "⬇️";
    downBtn.title = "Move Layer Down";
    downBtn.disabled = index === layers.length - 1;
    downBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (index < layers.length - 1) moveLayer(layer.id, 1);
    });

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.title = "Delete Layer";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = layers.findIndex((l) => l.id === layer.id);
      if (idx !== -1) {
        layers.splice(idx, 1);
        if (activeLayerId === layer.id) activeLayerId = null;
        updateUI();
      }
    });

    controlsDiv.appendChild(upBtn);
    controlsDiv.appendChild(downBtn);
    controlsDiv.appendChild(delBtn);

    li.appendChild(eyeIcon);
    li.appendChild(captionSpan);
    li.appendChild(controlsDiv);

    layersList.appendChild(li);
  });
}

// Event handlers for controls changes

tintColorInput.addEventListener("input", () => {
  const layer = layers.find((l) => l.id === activeLayerId);
  if (!layer) return;
  layer.tint = tintColorInput.value;
  updateUI();
});

tintOpacityInput.addEventListener("input", () => {
  const layer = layers.find((l) => l.id === activeLayerId);
  if (!layer) return;
  layer.opacity = parseFloat(tintOpacityInput.value);
  updateUI();
});

captionTextInput.addEventListener("input", () => {
  const layer = layers.find((l) => l.id === activeLayerId);
  if (!layer) return;
  layer.caption = captionTextInput.value;
  updateUI();
});

captionOpacityInput.addEventListener("input", () => {
  const layer = layers.find((l) => l.id === activeLayerId);
  if (!layer) return;
  layer.textOpacity = parseFloat(captionOpacityInput.value);
  updateUI();
});

// Add new layer button
addLayerBtn.addEventListener("click", () => {
  const id = "layer_" + Date.now();
  const newLayer = new Layer(id, "", "New Layer", "#00c8f8", 0, 1, true);
  layers.push(newLayer);
  setActiveLayer(id);
  updateUI();
});

// Handle premade grid images click to add new layer
premadeGrid.querySelectorAll("img").forEach((img) => {
  img.style.cursor = "pointer";
  img.addEventListener("click", () => {
    const id = "layer_" + Date.now();
    const newLayer = new Layer(id, img.src, "Premade Layer", "#00c8f8", 0.5, 1, true);
    layers.push(newLayer);
    setActiveLayer(id);
    updateUI();
  });
});

// Image input upload for active or pending layer
let pendingImageLayerId = null;

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const imgSrc = event.target.result;
    const layerId = pendingImageLayerId || activeLayerId;
    if (!layerId) {
      alert("No layer selected to assign image.");
      return;
    }
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    layer.imgSrc = imgSrc;
    pendingImageLayerId = null;
    imageInput.value = ""; // reset file input
    updateUI();
  };
  reader.readAsDataURL(file);
});

// Save button to export the composite image (optional)
// You can extend this with canvas rendering later if needed
saveBtn.addEventListener("click", () => {
  alert("Save functionality not implemented yet.");
});

// Initialize UI
updateUI();
