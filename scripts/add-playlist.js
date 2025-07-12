const playlistData = {
  name: "",
  cover_image: null,
  tracks: [],
};

let searchTimeout = null;
let draggedIndex = null;

// DOM elements
const elements = {
  playlistName: document.getElementById("playlistName"),
  imageInput: document.getElementById("imageInput"),
  imageDropzone: document.getElementById("imageDropzone"),
  imagePreview: document.getElementById("imagePreview"),
  previewImage: document.getElementById("previewImage"),
  removeImage: document.getElementById("removeImage"),
  searchInput: document.getElementById("searchInput"),
  searchSpinner: document.getElementById("searchSpinner"),
  searchResults: document.getElementById("searchResults"),
  tracksList: document.getElementById("tracksList"),
  playlistSummary: document.getElementById("playlistSummary"),
  trackCount: document.getElementById("trackCount"),
  submitButton: document.getElementById("submitButton"),
  selectedTracksInput: document.getElementById("selectedTracks"),
  playlistForm: document.getElementById("playlistForm"),
};

let tracks = [];

fetch("../includes/get_tracks.php")
  .then((res) => res.json())
  .then((data) => {
    tracks = data;
  })
  .catch((err) => console.error(err));;

// Playlist name handling
function updatePlaylistName() {
  const name = elements.playlistName.value;
  playlistData.name = name;
  updateSubmitButton();
}

// Image upload handling
function handleImageSelect(file) {
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    elements.previewImage.src = e.target.result;
    elements.imagePreview.style.display = "block";
    elements.imageDropzone.style.display = "none";
  };

  reader.readAsDataURL(file);
  playlistData.cover_image = file;
}

function removeImagePreview() {
  elements.imagePreview.style.display = "none";
  elements.imageDropzone.style.display = "flex";
  elements.imageInput.value = "";
  playlistData.cover_image = null;
}

// Search functionality
function searchTracks(query) {
  if (!query.trim()) {
    displaySearchResults([]);
    return;
  }

  elements.searchSpinner.style.display = "block";

  setTimeout(() => {
    const filteredTracks = tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase()) ||
        (track.album && track.album.toLowerCase().includes(query.toLowerCase()))
    );

    displaySearchResults(filteredTracks);
    elements.searchSpinner.style.display = "none";
  }, 300);
}

function displaySearchResults(tracks) {
  if (tracks.length === 0) {
    const query = elements.searchInput.value;
    if (query) {
      elements.searchResults.innerHTML = `
        <div class="add-playlist__search-empty">
          <svg class="add-playlist__search-empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          <p class="add-playlist__search-empty-title">No tracks found for "${query}"</p>
          <p class="add-playlist__search-empty-subtitle">Try different search terms</p>
        </div>
      `;
    } else {
      elements.searchResults.innerHTML = `
        <div class="add-playlist__search-empty">
          <img src="../images/search-silver.svg" alt="Search Icon" width="64" height="64" />
          <p class="add-playlist__search-empty-title">Start typing to search for tracks</p>
          <p class="add-playlist__search-empty-subtitle">Discover amazing music to add to your playlist</p>
        </div>
      `;
    }
    return;
  }

  const resultsHTML = tracks
    .map(
      (track) => `
        <div class="add-playlist__search-result">
          <div class="add-playlist__search-result-cover">
            ${
              track.cover_url
                ? `<img src="${track.cover_url}" alt="${track.title} cover">`
                : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>`
            }
          </div>
          <div class="add-playlist__search-result-info">
            <h4 class="add-playlist__search-result-title">${track.title}</h4>
            <p class="add-playlist__search-result-artist">${track.artist}</p>
            ${
              track.album
                ? `<p class="add-playlist__search-result-album">${track.album}</p>`
                : ""
            }
          </div>
          <button class="add-playlist__search-result-action" onclick="addTrack('${
            track.id
          }')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      `
    )
    .join("");

  elements.searchResults.innerHTML = resultsHTML;
}

// Track management
function addTrack(trackId) {
  const track = tracks.find((t) => t.id === trackId);
  if (track && !playlistData.tracks.some((t) => t.id === trackId)) {
    playlistData.tracks.push(track);
    updateSelectedTracks();
    updatePlaylistSummary();
    updateSubmitButton();
    updateHiddenInput();
  }
}

function removeTrack(trackId) {
  playlistData.tracks = playlistData.tracks.filter((t) => t.id !== trackId);
  updateSelectedTracks();
  updatePlaylistSummary();
  updateSubmitButton();
  updateHiddenInput();
}

function updateHiddenInput() {
  if (elements.selectedTracksInput) {
    elements.selectedTracksInput.value = JSON.stringify(
      playlistData.tracks.map((t) => t.id)
    );
  }
}

function updateSelectedTracks() {
  if (playlistData.tracks.length === 0) {
    elements.tracksList.innerHTML = `
      <div class="add-playlist__tracks-empty">
        <img src="../images/music-silver.svg" alt="Music Icon" width="64" height="64" />
        <p class="add-playlist__tracks-empty-title">No tracks selected</p>
        <p class="add-playlist__tracks-empty-subtitle">Search and add tracks to build your playlist</p>
      </div>
    `;
    return;
  }

  const tracksHTML = playlistData.tracks
    .map(
      (track, index) => `
        <div class="add-playlist__track-item" draggable="true" data-index="${index}">
          <div class="add-playlist__track-drag">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="12" r="1"/>
              <circle cx="9" cy="5" r="1"/>
              <circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="12" r="1"/>
              <circle cx="15" cy="5" r="1"/>
              <circle cx="15" cy="19" r="1"/>
            </svg>
          </div>
          <div class="add-playlist__track-number">${index + 1}</div>
          <div class="add-playlist__track-cover">
            ${
              track.cover_url
                ? `<img src="${track.cover_url}" alt="${track.title} cover">`
                : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>`
            }
          </div>
          <div class="add-playlist__track-info">
            <h4 class="add-playlist__track-title">${track.title}</h4>
            <p class="add-playlist__track-artist">${track.artist}</p>
          </div>
          <button class="add-playlist__track-remove" onclick="removeTrack('${
            track.id
          }')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2,2h4a2,2,0,0,1,2,2V6"/>
            </svg>
          </button>
        </div>
      `
    )
    .join("");

  elements.tracksList.innerHTML = tracksHTML;
  setupDragAndDrop();
}

function updatePlaylistSummary() {
  if (playlistData.tracks.length === 0) {
    elements.playlistSummary.style.display = "none";
    return;
  }

  elements.playlistSummary.style.display = "block";
  elements.trackCount.textContent = playlistData.tracks.length;
}

// Drag and drop functionality
function setupDragAndDrop() {
  const trackElements = document.querySelectorAll(".add-playlist__track-item");

  trackElements.forEach((element, index) => {
    element.addEventListener("dragstart", (e) => {
      e.preventDefault();
      draggedIndex = index;
      element.classList.add("add-playlist__track-item--dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    element.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    element.addEventListener("drop", (e) => {
      e.preventDefault();
      const dropIndex = Number.parseInt(element.dataset.index);

      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        const draggedTrack = playlistData.tracks[draggedIndex];
        playlistData.tracks.splice(draggedIndex, 1);
        playlistData.tracks.splice(dropIndex, 0, draggedTrack);
        updateSelectedTracks();
        updateHiddenInput();
      }
    });

    element.addEventListener("dragend", () => {
      e.preventDefault();
      element.classList.remove("add-playlist__track-item--dragging");
      draggedIndex = null;
    });
  });
}

// Submit functionality
function updateSubmitButton() {
  const hasName = playlistData.name.trim().length > 0;
  elements.submitButton.disabled = !hasName;
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Playlist name input
  elements.playlistName.addEventListener("input", updatePlaylistName);

  // Image upload
  elements.imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleImageSelect(file);
  });

  elements.imageDropzone.addEventListener("click", (e) => {
    e.preventDefault();
    elements.imageInput.click();
  });

  elements.removeImage.addEventListener("click", removeImagePreview);

  // Drag and drop for image upload
  elements.imageDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    elements.imageDropzone.style.borderColor = "#9333ea";
  });

  elements.imageDropzone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    elements.imageDropzone.style.borderColor = "#374151";
  });

  elements.imageDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    elements.imageDropzone.style.borderColor = "#374151";
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  });

  // Search input with debouncing
  elements.searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchTracks(e.target.value);
    }, 300);
  });

  // Initialize
  updateSubmitButton();
  displaySearchResults([]);
});

// Global functions for onclick handlers
window.addTrack = addTrack;
window.removeTrack = removeTrack;
