// Upload Mode Toggle Script
let currentUploadMode = "single";

function setUploadMode(mode) {
  if (mode === currentUploadMode) return;

  currentUploadMode = mode;
  updateToggleButtons(mode);
  switchActiveForms(mode);
}

function updateToggleButtons(activeMode) {
  const buttons = document.querySelectorAll(".upload-mode__button");
  buttons.forEach((btn) => {
    btn.classList.toggle(
      "upload-mode__button--active",
      btn.dataset.mode === activeMode
    );
  });
}

function switchActiveForms(mode) {
  const singleForm = document.getElementById("singleTrackForm");
  const albumForm = document.getElementById("albumForm");

  if (mode === "single") {
    singleForm.classList.add("upload-form--active");
    albumForm.classList.remove("upload-form--active");
  } else {
    singleForm.classList.remove("upload-form--active");
    albumForm.classList.add("upload-form--active");
  }
}

function bindToggleEvents() {
  const buttons = document.querySelectorAll(".upload-mode__button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => setUploadMode(btn.dataset.mode));
  });
}

function getCurrentUploadMode() {
  return currentUploadMode;
}

function initializeUploadToggle() {
  bindToggleEvents();
}

document.addEventListener("DOMContentLoaded", initializeUploadToggle);

// Vinyl Preview Script
const vinylState = {
  single: {
    coverImage: "",
    primaryColor: "#2a2928",
    secondaryColor: "#605f5f",
  },
  album: {
    coverImage: "",
    primaryColor: "#2a2928",
    secondaryColor: "#605f5f",
  },
};

function createVinylRecord() {
  const vinyl = document.createElement("div");
  vinyl.className = "record";

  const albumCover = document.createElement("div");
  albumCover.className = "album-cover";

  const recordLabel = document.createElement("div");
  recordLabel.className = "record-label";

  const centerHole = document.createElement("div");
  centerHole.className = "center-hole";

  vinyl.appendChild(albumCover);
  vinyl.appendChild(recordLabel);
  vinyl.appendChild(centerHole);

  return vinyl;
}

function applyVinylStyles(type) {
  const preview = document.getElementById(
    type === "single" ? "singleVinylPreview" : "albumVinylPreview"
  );
  const data = vinylState[type];

  const vinyl = preview.querySelector(".record");
  if (!vinyl) return;

  // Update album cover
  const albumCover = vinyl.querySelector(".album-cover");
  if (data.coverImage) {
    albumCover.style.backgroundImage = `url(${data.coverImage})`;
  } else {
    albumCover.style.backgroundImage = "none";
  }

  // Update record label
  const recordLabel = vinyl.querySelector(".record-label");
  recordLabel.style.border = `solid 2px ${data.secondaryColor}`;
  recordLabel.style.boxShadow = `
        0 0 0 4px ${data.primaryColor},
        inset 0 0 0 27px ${data.primaryColor}
      `;
}

function updateVinylColor(type, colorType, value) {
  vinylState[type][colorType] = value;
  applyVinylStyles(type);
}

function updateVinylCoverImage(type, imageUrl) {
  vinylState[type].coverImage = imageUrl;
  applyVinylStyles(type);
}

function setupColorInputs() {
  const singlePrimary = document.getElementById("singlePrimaryColor");
  const singleSecondary = document.getElementById("singleSecondaryColor");
  const albumPrimary = document.getElementById("albumPrimaryColor");
  const albumSecondary = document.getElementById("albumSecondaryColor");

  // Set initial values
  singlePrimary.value = vinylState.single.primaryColor;
  singleSecondary.value = vinylState.single.secondaryColor;
  albumPrimary.value = vinylState.album.primaryColor;
  albumSecondary.value = vinylState.album.secondaryColor;

  // Bind events
  singlePrimary.addEventListener("input", (e) => {
    updateVinylColor("single", "primaryColor", e.target.value);
  });

  singleSecondary.addEventListener("input", (e) => {
    updateVinylColor("single", "secondaryColor", e.target.value);
  });

  albumPrimary.addEventListener("input", (e) => {
    updateVinylColor("album", "primaryColor", e.target.value);
  });

  albumSecondary.addEventListener("input", (e) => {
    updateVinylColor("album", "secondaryColor", e.target.value);
  });
}

function renderVinylPreviews() {
  const singlePreview = document.getElementById("singleVinylPreview");
  const albumPreview = document.getElementById("albumVinylPreview");

  singlePreview.appendChild(createVinylRecord());
  albumPreview.appendChild(createVinylRecord());

  applyVinylStyles("single");
  applyVinylStyles("album");
}

function initializeVinylPreviews() {
  renderVinylPreviews();
  setupColorInputs();
}

document.addEventListener("DOMContentLoaded", initializeVinylPreviews);

// Preview Utils Script
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_AUDIO_TYPES = [".mp3"];
const ALLOWED_IMAGE_TYPES = [".jpg", ".jpeg", ".png", ".webp"];

// Helper Functions
function validateFile(file, type) {
  const errors = [];

  if (type === "audio") {
    if (file.size > MAX_AUDIO_SIZE) {
      errors.push("Audio file must be less than 100MB");
    }
    const extension = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_AUDIO_TYPES.includes(extension)) {
      errors.push("Audio file must be MP3, WAV, or FLAC");
    }
  } else if (type === "image") {
    if (file.size > MAX_IMAGE_SIZE) {
      errors.push("Image file must be less than 10MB");
    }
    const extension = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.includes(extension)) {
      errors.push("Image file must be JPG, PNG, or GIF");
    }
  }

  return errors;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function updateFileUploadUI(container, file) {
  const fileName = container.querySelector(".upload-form__file-name");
  if (fileName) {
    fileName.textContent = file.name;
  }
}

// Public Methods
async function handleFileUpload(file, type, container) {
  try {
    // Validate file
    const errors = validateFile(file, type);
    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }

    // Update UI
    updateFileUploadUI(container, file);

    // Read file if it's an image
    if (type === "image") {
      return await readFileAsDataURL(file);
    }

    return file;
  } catch (error) {
    alert(error.message);
    return null;
  }
}

function resetFileUpload(container) {
  const fileName = container.querySelector(".upload-form__file-name");
  if (fileName) {
    fileName.textContent = container.dataset.placeholder || "Choose file";
  }
}

// Artist Management - Separate for Single and Album
let mockArtists = [];

// Fetch artists data
fetch("../includes/get_artists.php")
  .then((res) => res.json())
  .then((data) => {
    mockArtists = data;
    console.log(data);
  })
  .catch((err) => console.error(err));

// Single Track Artist Management
const singleArtistManager = {
  selectedArtists: new Map(),
  searchResults: [],
  isSearching: false,

  buildArtistTag(artist) {
    const tag = document.createElement("div");
    tag.className = "artist-tag";
    tag.dataset.id = artist.id;

    const avatar = document.createElement("img");
    avatar.src = artist.avatar_url;
    avatar.alt = artist.stage_name;

    const name = document.createElement("span");
    name.textContent = artist.stage_name;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.innerHTML =
      '<img src="../images/remove-purple.svg" alt="Remove">';

    tag.appendChild(avatar);
    tag.appendChild(name);
    tag.appendChild(removeBtn);

    return tag;
  },

  buildArtistSearchItem(artist) {
    const item = document.createElement("div");
    item.className = "artist-item";
    item.dataset.id = artist.id;

    const avatar = document.createElement("img");
    avatar.src = artist.avatar_url;
    avatar.alt = artist.stage_name;

    const name = document.createElement("span");
    name.textContent = artist.stage_name;

    const addIcon = document.createElement("img");
    addIcon.src = "../images/add.svg";
    addIcon.alt = "Add";
    addIcon.className = "add-icon";

    item.appendChild(avatar);
    item.appendChild(name);
    item.appendChild(addIcon);

    return item;
  },

  updateHiddenInputs() {
    const inputContainer = document.getElementById(
      "singlefeaturedArtistsInputs"
    );
    if (!inputContainer) return;

    // Clear old inputs
    inputContainer.innerHTML = "";

    // Add new hidden inputs
    this.selectedArtists.forEach((artist) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "single_featured_artists[]";
      input.value = artist.id;
      inputContainer.appendChild(input);
    });
  },

  displaySelectedArtists(container) {
    const selectedContainer = container.querySelector(".selected-artists");
    if (!selectedContainer) return;

    selectedContainer.innerHTML = "";
    this.selectedArtists.forEach((artist) => {
      selectedContainer.appendChild(this.buildArtistTag(artist));
    });
  },

  displaySearchResults(container, results) {
    const dropdown = container.querySelector(".upload-form__artist-dropdown");
    if (!dropdown) return;

    dropdown.innerHTML = "";
    results.forEach((artist) => {
      dropdown.appendChild(this.buildArtistSearchItem(artist));
    });
  },

  showSearchLoading(container) {
    const dropdown = container.querySelector(".upload-form__artist-dropdown");
    if (!dropdown) return;

    dropdown.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <span>Searching artists...</span>
      </div>
    `;
  },

  showNoSearchResults(container, query) {
    const dropdown = container.querySelector(".upload-form__artist-dropdown");
    if (!dropdown) return;

    dropdown.innerHTML = `
      <div class="no-results">
        <span>No artists found for "${query}"</span>
      </div>
    `;
  },

  async searchArtists(container, query) {
    if (!query) {
      this.searchResults = [];
      this.displaySearchResults(container, []);
      return;
    }

    this.isSearching = true;
    this.showSearchLoading(container);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const results = mockArtists.filter((artist) => {
      const matchesSearch = artist.stage_name
        .toLowerCase()
        .includes(query.toLowerCase());

      const notSelected = !this.selectedArtists.has(artist.id);
      return matchesSearch && notSelected;
    });

    this.searchResults = results;
    this.isSearching = false;

    if (results.length === 0) {
      this.showNoSearchResults(container, query);
    } else {
      this.displaySearchResults(container, results);
    }
  },

  addSelectedArtist(container, artistId) {
    const artist = mockArtists.find((a) => a.id === artistId);
    if (!artist) return;

    this.selectedArtists.set(artistId, artist);
    this.displaySelectedArtists(container);
    this.updateHiddenInputs();

    // Clear search
    const searchInput = container.querySelector('input[type="text"]');
    if (searchInput) {
      searchInput.value = "";
    }
    this.searchResults = [];
    this.displaySearchResults(container, []);
  },

  removeSelectedArtist(container, artistId) {
    this.selectedArtists.delete(artistId);
    this.displaySelectedArtists(container);
    this.updateHiddenInputs();
  },

  bindArtistSearchEvents(container) {
    const searchInput = container.querySelector('input[type="text"]');
    searchInput.addEventListener("input", (e) => {
      const dropdown = container.querySelector(".upload-form__artist-dropdown");
      dropdown.style.display = e.target.value ? "block" : "none";
      this.searchArtists(container, e.target.value);
    });

    container.addEventListener("click", (e) => {
      if (e.target.closest(".artist-item")) {
        const artistId = e.target.closest(".artist-item").dataset.id;
        this.addSelectedArtist(container, artistId);
      } else if (e.target.closest(".artist-tag button")) {
        const artistId = e.target.closest(".artist-tag").dataset.id;
        this.removeSelectedArtist(container, artistId);
      }

      const dropdown = container.querySelector(".upload-form__artist-dropdown");
      dropdown.style.display = e.target.value ? "block" : "none";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        const dropdown = container.querySelector(
          ".upload-form__artist-dropdown"
        );
        if (dropdown) {
          dropdown.innerHTML = "";
        }
      }
    });
  },

  createArtistSearchContainer(container) {
    container.innerHTML = `
      <div class="selected-artists"></div>
      <div class="upload-form__multi-select-search">
        <img src="../images/search-silver.svg" alt="Search">
        <input id="artistSearch" type="text" placeholder="Search for featured artists...">
      </div>
      <div class="upload-form__artist-dropdown"></div>
    `;
  },

  initializeArtistSearch(container) {
    this.createArtistSearchContainer(container);
    this.bindArtistSearchEvents(container);
  },

  getSelectedArtistsList() {
    return Array.from(this.selectedArtists.values());
  },

  setSelectedArtistsList(container, artists) {
    this.selectedArtists.clear();
    artists.forEach((artist) => {
      this.selectedArtists.set(artist.id, artist);
    });
    this.displaySelectedArtists(container);
  },
};

// Album Track Artist Management
const albumArtistManager = {
  // Each track has its own artist selection
  trackArtists: new Map(), // trackId -> Map of selected artists

  buildArtistTag(artist) {
    const tag = document.createElement("div");
    tag.className = "artist-tag";
    tag.dataset.id = artist.id;

    const avatar = document.createElement("img");
    avatar.src = artist.avatar_url;
    avatar.alt = artist.stage_name;

    const name = document.createElement("span");
    name.textContent = artist.stage_name;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.innerHTML =
      '<img src="../images/remove-purple.svg" alt="Remove">';

    tag.appendChild(avatar);
    tag.appendChild(name);
    tag.appendChild(removeBtn);

    return tag;
  },

  buildArtistSearchItem(artist) {
    const item = document.createElement("div");
    item.className = "artist-item";
    item.dataset.id = artist.id;

    const avatar = document.createElement("img");
    avatar.src = artist.avatar_url;
    avatar.alt = artist.stage_name;

    const name = document.createElement("span");
    name.textContent = artist.stage_name;

    const addIcon = document.createElement("img");
    addIcon.src = "../images/add.svg";
    addIcon.alt = "Add";
    addIcon.className = "add-icon";

    item.appendChild(avatar);
    item.appendChild(name);
    item.appendChild(addIcon);

    return item;
  },

  getTrackArtists(trackId) {
    if (!this.trackArtists.has(trackId)) {
      this.trackArtists.set(trackId, new Map());
    }
    return this.trackArtists.get(trackId);
  },

  displaySelectedArtists(container, trackId) {
    const selectedContainer = container.querySelector(".selected-artists");
    if (!selectedContainer) return;

    const trackArtists = this.getTrackArtists(trackId);
    selectedContainer.innerHTML = "";
    trackArtists.forEach((artist) => {
      selectedContainer.appendChild(this.buildArtistTag(artist));
    });
  },

  displaySearchResults(container, results) {
    const dropdown = container.querySelector(".upload-form__artist-dropdown");
    if (!dropdown) return;

    dropdown.innerHTML = "";
    results.forEach((artist) => {
      dropdown.appendChild(this.buildArtistSearchItem(artist));
    });
  },

  showSearchLoading(container) {
    const dropdown = container.querySelector(".upload-form__artist-dropdown");
    if (!dropdown) return;

    dropdown.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <span>Searching artists...</span>
      </div>
    `;
  },

  showNoSearchResults(container, query) {
    const dropdown = container.querySelector(".upload-form__artist-dropdown");
    if (!dropdown) return;

    dropdown.innerHTML = `
      <div class="no-results">
        <span>No artists found for "${query}"</span>
      </div>
    `;
  },

  async searchArtists(container, query, trackId) {
    if (!query) {
      this.displaySearchResults(container, []);
      return;
    }

    this.showSearchLoading(container);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const trackArtists = this.getTrackArtists(trackId);
    const results = mockArtists.filter((artist) => {
      const matchesSearch = artist.stage_name
        .toLowerCase()
        .includes(query.toLowerCase());

      const notSelected = !trackArtists.has(artist.id);
      return matchesSearch && notSelected;
    });

    if (results.length === 0) {
      this.showNoSearchResults(container, query);
    } else {
      this.displaySearchResults(container, results);
    }
  },

  addSelectedArtist(container, artistId, trackId) {
    const artist = mockArtists.find((a) => a.id === artistId);
    if (!artist) return;

    const trackArtists = this.getTrackArtists(trackId);
    trackArtists.set(artistId, artist);
    this.displaySelectedArtists(container, trackId);

    // Clear search
    const searchInput = container.querySelector('input[type="text"]');
    if (searchInput) {
      searchInput.value = "";
    }
    this.displaySearchResults(container, []);
  },

  removeSelectedArtist(container, artistId, trackId) {
    const trackArtists = this.getTrackArtists(trackId);
    trackArtists.delete(artistId);
    this.displaySelectedArtists(container, trackId);
  },

  bindArtistSearchEvents(container, trackId) {
    const searchInput = container.querySelector('input[type="text"]');
    searchInput.addEventListener("input", (e) => {
      const dropdown = container.querySelector(".upload-form__artist-dropdown");
      dropdown.style.display = e.target.value ? "block" : "none";
      this.searchArtists(container, e.target.value, trackId);
    });

    container.addEventListener("click", (e) => {
      if (e.target.closest(".artist-item")) {
        const artistId = e.target.closest(".artist-item").dataset.id;
        this.addSelectedArtist(container, artistId, trackId);
      } else if (e.target.closest(".artist-tag button")) {
        const artistId = e.target.closest(".artist-tag").dataset.id;
        this.removeSelectedArtist(container, artistId, trackId);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        const dropdown = container.querySelector(
          ".upload-form__artist-dropdown"
        );
        if (dropdown) {
          dropdown.innerHTML = "";
        }
      }
    });
  },

  createArtistSearchContainer(container) {
    container.innerHTML = `
      <div class="selected-artists"></div>
      <div class="upload-form__multi-select-search">
        <img src="../images/search-silver.svg" alt="Search">
        <input type="text" placeholder="Search for featured artists...">
      </div>
      <div class="upload-form__artist-dropdown"></div>
    `;
  },

  initializeArtistSearch(container, trackId) {
    this.createArtistSearchContainer(container);
    this.bindArtistSearchEvents(container, trackId);
  },

  getSelectedArtistsList(trackId) {
    const trackArtists = this.getTrackArtists(trackId);
    return Array.from(trackArtists.values());
  },

  setSelectedArtistsList(container, artists, trackId) {
    const trackArtists = this.getTrackArtists(trackId);
    trackArtists.clear();
    artists.forEach((artist) => {
      trackArtists.set(artist.id, artist);
    });
    this.displaySelectedArtists(container, trackId);
  },

  removeTrackArtists(trackId) {
    this.trackArtists.delete(trackId);
  },
};

// Single Track Form Module
let singleTrackTitle = "";
let singleTrackFile = null;
let singleTrackCover = null;
let singleTrackFeaturedArtists = [];
let singleTrackVinylPrimaryColor = "#2a2928";
let singleTrackVinylSecondaryColor = "#605f5f";
let singleTrackIsExplicit = false;

function updateSingleTrackTitle(value) {
  singleTrackTitle = value;
}

async function processSingleAudioFile(file, uploadElement) {
  if (!file) return;

  const result = await handleFileUpload(
    file,
    "audio",
    uploadElement.closest(".upload-form__file-upload")
  );

  if (result) {
    singleTrackFile = result;
  }
}

async function processSingleCoverFile(file, uploadElement) {
  if (!file) return;

  const result = await handleFileUpload(
    file,
    "image",
    uploadElement.closest(".upload-form__file-upload")
  );

  if (result) {
    singleTrackCover = result;
    updateVinylCoverImage("single", result);
  }
}

function updateSingleTrackExplicit(isExplicit) {
  singleTrackIsExplicit = isExplicit;
}

function bindSingleFormEvents() {
  const titleInput = document.getElementById("singleTitle");
  const audioInput = document.getElementById("singleAudioInput");
  const coverInput = document.getElementById("singleCoverInput");
  const explicitCheckbox = document.getElementById("singleExplicit");

  titleInput.addEventListener("input", (e) => {
    updateSingleTrackTitle(e.target.value);
  });

  audioInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    processSingleAudioFile(file, audioInput);
  });

  coverInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    processSingleCoverFile(file, coverInput);
  });

  explicitCheckbox.addEventListener("change", (e) => {
    updateSingleTrackExplicit(e.target.checked);
  });
}

function initializeSingleTrackForm() {
  // Bind form events
  bindSingleFormEvents();
}

// Auto-initialize
document.addEventListener("DOMContentLoaded", initializeSingleTrackForm);

// Album Form Module - Function-based approach
let albumTitle = "";
let albumCover = null;
let albumVinylPrimaryColor = "#2a2928";
let albumVinylSecondaryColor = "#605f5f";

function updateAlbumTitle(value) {
  albumTitle = value;
}

async function processAlbumCoverFile(file, uploadElement) {
  if (!file) return;

  const result = await handleFileUpload(
    file,
    "image",
    uploadElement.closest(".upload-form__file-upload")
  );

  if (result) {
    albumCover = result;
    updateVinylCoverImage("album", result);
  }
}

function bindAlbumFormEvents() {
  const titleInput = document.getElementById("albumTitle");
  const coverInput = document.getElementById("albumCoverInput");

  titleInput.addEventListener("input", (e) => {
    updateAlbumTitle(e.target.value);
  });

  coverInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    processAlbumCoverFile(file, coverInput);
  });
}

function initializeAlbumForm() {
  bindAlbumFormEvents();
}

document.addEventListener("DOMContentLoaded", initializeAlbumForm);

// Track List Module
let tracks = [];
let trackCounter = 0;

// DOM element getters
function getTrackList() {
  return document.getElementById("trackList");
}

function getEmptyTrackList() {
  return document.getElementById("emptyTrackList");
}

function getAddTrackBtn() {
  return document.getElementById("addTrackBtn");
}

function getTrackTemplate() {
  return document.getElementById("trackTemplate");
}

// Track creation and management
function createTrackData(index = tracks.length) {
  return {
    id: `track-${Date.now().toString()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    index: index,
    title: "",
    file: null,
    featuredArtists: [],
    isExplicit: false,
  };
}

function createTrackElement(track) {
  const template = getTrackTemplate();
  const clone = template.content.cloneNode(true);
  const trackElement = clone.querySelector(".track");

  trackElement.dataset.id = track.id;
  setTrackNumber(trackElement, track.index + 1);
  initializeTrackInputs(trackElement, track);

  return trackElement;
}

function setTrackNumber(trackElement, number) {
  const numberElement = trackElement.querySelector(".track__number-text");
  const indexElement = trackElement.querySelector(".track__index");

  if (numberElement) numberElement.textContent = number;
  if (indexElement) indexElement.textContent = number;
}

function initializeTrackInputs(trackElement, track) {
  const titleInput = trackElement.querySelector(".track__input--title");
  const explicitCheckbox = trackElement.querySelector(
    ".track__checkbox--explicit"
  );
  const artistSelect = trackElement.querySelector(
    ".track__multi-select--artists"
  );

  if (titleInput) titleInput.value = track.title || "";
  if (explicitCheckbox) explicitCheckbox.checked = track.isExplicit || false;

  if (artistSelect) {
    albumArtistManager.initializeArtistSearch(artistSelect, track.id);
    if (track.featuredArtists.length > 0) {
      albumArtistManager.setSelectedArtistsList(
        artistSelect,
        track.featuredArtists,
        track.id
      );
    }
  }
}

// Track list operations
function addTrack() {
  const newTrack = createTrackData();
  tracks.push(newTrack);

  const trackElement = createTrackElement(newTrack);
  getTrackList().appendChild(trackElement);

  updateEmptyState();
  generateAlbumHiddenInputs();
  return newTrack;
}

function removeTrack(trackId) {
  const trackElement = findTrackElement(trackId);
  if (!trackElement) return false;

  tracks = tracks.filter((track) => track.id !== trackId);
  trackElement.remove();

  // Remove artist data for this track
  albumArtistManager.removeTrackArtists(trackId);

  updateAllTrackNumbers();
  updateEmptyState();
  generateAlbumHiddenInputs();
  return true;
}

function moveTrack(trackId, direction) {
  const currentIndex = tracks.findIndex((track) => track.id === trackId);
  if (currentIndex === -1) return false;

  const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (newIndex < 0 || newIndex >= tracks.length) return false;

  // Swap tracks in array
  const track = tracks[currentIndex];
  tracks.splice(currentIndex, 1);
  tracks.splice(newIndex, 0, track);

  // Move DOM element
  const trackElement = findTrackElement(trackId);
  const targetElement = getTrackList().children[newIndex];

  if (direction === "up") {
    targetElement.before(trackElement);
  } else {
    targetElement.after(trackElement);
  }

  updateAllTrackNumbers();
  generateAlbumHiddenInputs();
  return true;
}

// Helper functions
function findTrackElement(trackId) {
  return getTrackList().querySelector(`[data-id="${trackId}"]`);
}

function findTrackData(trackId) {
  return tracks.find((track) => track.id === trackId);
}

function updateAllTrackNumbers() {
  const trackElements = getTrackList().querySelectorAll(".track");
  trackElements.forEach((element, index) => {
    setTrackNumber(element, index + 1);
    // Update track index in data
    const trackId = element.dataset.id;
    const track = findTrackData(trackId);
    if (track) {
      track.index = index;
    }
  });
}

function updateEmptyState() {
  const emptyList = getEmptyTrackList();
  const trackList = getTrackList();

  if (tracks.length === 0) {
    emptyList.style.display = "block";
    trackList.style.display = "none";
  } else {
    emptyList.style.display = "none";
    trackList.style.display = "block";
  }
}

function updateTrackData(trackId) {
  const trackElement = findTrackElement(trackId);
  const track = findTrackData(trackId);

  if (!trackElement || !track) return false;

  const titleInput = trackElement.querySelector(".track__input--title");
  const audioInput = trackElement.querySelector(".track__input--audio");
  const explicitCheckbox = trackElement.querySelector(
    ".track__checkbox--explicit"
  );

  if (titleInput) track.title = titleInput.value;
  if (audioInput && audioInput.files[0]) track.file = audioInput.files[0];
  if (explicitCheckbox) track.isExplicit = explicitCheckbox.checked;

  // Update featured artists from album artist manager
  track.featuredArtists = albumArtistManager.getSelectedArtistsList(trackId);

  generateAlbumHiddenInputs();
  return true;
}

// Event handling
function handleTrackListClick(event) {
  const trackElement = event.target.closest(".track");
  if (!trackElement) return;

  const trackId = trackElement.dataset.id;

  if (event.target.closest(".track__btn--move-up")) {
    moveTrack(trackId, "up");
  } else if (event.target.closest(".track__btn--move-down")) {
    moveTrack(trackId, "down");
  } else if (event.target.closest(".track__btn--remove")) {
    removeTrack(trackId);
  }
}

function handleTrackListChange(event) {
  const trackElement = event.target.closest(".track");
  if (!trackElement) return;

  updateTrackData(trackElement.dataset.id);
}

function clearAllTracks() {
  tracks = [];
  getTrackList().innerHTML = "";
  albumArtistManager.trackArtists.clear();
  updateEmptyState();
  generateAlbumHiddenInputs();
}

function getTrackCount() {
  return tracks.length;
}

// Initialization
function initializeTrackList() {
  const addTrackBtn = getAddTrackBtn();
  const trackList = getTrackList();

  if (addTrackBtn) {
    addTrackBtn.addEventListener("click", addTrack);
  }

  if (trackList) {
    trackList.addEventListener("click", handleTrackListClick);
    trackList.addEventListener("change", handleTrackListChange);
  }

  updateEmptyState();
}

document.addEventListener("DOMContentLoaded", initializeTrackList);

// Hidden Inputs Generation
function generateSingleHiddenInputs() {
  const hiddenContainer = document.getElementById(
    "singlefeaturedArtistsInputs"
  );
  if (!hiddenContainer) return;

  // Clear existing inputs
  hiddenContainer.innerHTML = "";

  // Add featured artists
  singleArtistManager.selectedArtists.forEach((artist) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "single_featured_artists[]";
    input.value = artist.id;
    hiddenContainer.appendChild(input);
  });

  // Add other single track data
  const singleData = {
    vinyl_primary_color: vinylState.single.primaryColor,
    vinyl_secondary_color: vinylState.single.secondaryColor,
    is_explicit: singleTrackIsExplicit ? "1" : "0",
  };

  Object.entries(singleData).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = `single_${key}`;
    input.value = value;
    hiddenContainer.appendChild(input);
  });
}

function generateAlbumHiddenInputs(
  albumTitle,
  tracks,
  updateTrackData,
  albumArtistManager
) {
  const hiddenContainer = document.getElementById("albumHiddenInputs");
  if (!hiddenContainer) return;

  // Clear existing hidden inputs
  hiddenContainer.innerHTML = "";

  // Generate album-level hidden inputs (only title, no vinyl colors)
  if (albumTitle) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "album_title";
    input.value = albumTitle;
    hiddenContainer.appendChild(input);
  }

  // Generate track-level hidden inputs
  tracks.forEach((track, trackIndex) => {
    // Update track data first
    updateTrackData(track.id);

    // Track title
    if (track.title) {
      const titleInput = document.createElement("input");
      titleInput.type = "hidden";
      titleInput.name = `tracks[${trackIndex}][track_title]`;
      titleInput.value = track.title;
      hiddenContainer.appendChild(titleInput);
    }

    // Track explicit flag
    const explicitInput = document.createElement("input");
    explicitInput.type = "hidden";
    explicitInput.name = `tracks[${trackIndex}][is_explicit]`;
    explicitInput.value = track.isExplicit ? "1" : "0";
    hiddenContainer.appendChild(explicitInput);

    // Featured artists for this track (as array of integers)
    const trackArtists = albumArtistManager.getSelectedArtistsList(track.id);
    trackArtists.forEach((artist) => {
      const artistInput = document.createElement("input");
      artistInput.type = "hidden";
      artistInput.name = `tracks[${trackIndex}][featured_artist][]`;
      artistInput.value = artist.id; // This should be an integer
      hiddenContainer.appendChild(artistInput);
    });

    // Track audio file indicator (the actual file will be handled by the file input)
    if (track.file) {
      const fileInput = document.createElement("input");
      fileInput.type = "hidden";
      fileInput.name = `tracks[${trackIndex}][has_audio_file]`;
      fileInput.value = "1";
      hiddenContainer.appendChild(fileInput);
    }
  });
}

// Form Validation
function validateSingleForm() {
  const errors = [];

  if (!singleTrackTitle.trim()) {
    errors.push("Track title is required");
  }

  if (!singleTrackFile) {
    errors.push("Audio file is required");
  }

  if (!singleTrackCover) {
    errors.push("Cover image is required");
  }

  return errors;
}

function validateAlbumForm() {
  const errors = [];

  if (!albumTitle.trim()) {
    errors.push("Album title is required");
  }

  if (!albumCover) {
    errors.push("Album cover is required");
  }

  if (tracks.length === 0) {
    errors.push("At least one track is required");
  }

  tracks.forEach((track, index) => {
    if (!track.title.trim()) {
      errors.push(`Track ${index + 1}: Title is required`);
    }
    if (!track.file) {
      errors.push(`Track ${index + 1}: Audio file is required`);
    }
  });

  return errors;
}

// Form Submission Handlers
function handleSingleFormSubmit(event) {
  // Generate hidden inputs for single track
  generateSingleHiddenInputs();

  // Validate required fields
  const errors = validateSingleForm();
  if (errors.length > 0) {
    event.preventDefault();
    alert("Please fix the following errors:\n" + errors.join("\n"));
    return false;
  }

  return true;
}

function handleAlbumFormSubmit(event) {
  // Update all track data before submission
  tracks.forEach((track) => {
    updateTrackData(track.id);
  });

  // Generate final hidden inputs
  generateAlbumHiddenInputs();

  // Validate required fields
  const errors = validateAlbumForm();
  if (errors.length > 0) {
    event.preventDefault();
    alert("Please fix the following errors:\n" + errors.join("\n"));
    return false;
  }

  return true;
}

// Initialize form submission handlers
function initializeFormSubmissionHandlers() {
  const albumForm = document.getElementById("albumForm");
  const singleForm = document.getElementById("singleTrackForm");

  if (albumForm) {
    albumForm.addEventListener("submit", handleAlbumFormSubmit);
  }

  if (singleForm) {
    singleForm.addEventListener("submit", handleSingleFormSubmit);
  }
}

// Initialize artist search for single track
document.addEventListener("DOMContentLoaded", () => {
  const artistSearchContainer = document.getElementById("singleArtistSelect");
  if (artistSearchContainer) {
    singleArtistManager.initializeArtistSearch(artistSearchContainer);
  }

  // Initialize form submission handlers
  initializeFormSubmissionHandlers();

  // Generate initial hidden inputs
  setTimeout(() => {
    generateSingleHiddenInputs();
    generateAlbumHiddenInputs();
  }, 100);
});

// // Upload Mode Toggle Script
// let currentUploadMode = "single";

// function setUploadMode(mode) {
//   if (mode === currentUploadMode) return;

//   currentUploadMode = mode;
//   updateToggleButtons(mode);
//   switchActiveForms(mode);
// }

// function updateToggleButtons(activeMode) {
//   const buttons = document.querySelectorAll(".upload-mode__button");
//   buttons.forEach((btn) => {
//     btn.classList.toggle(
//       "upload-mode__button--active",
//       btn.dataset.mode === activeMode
//     );
//   });
// }

// function switchActiveForms(mode) {
//   const singleForm = document.getElementById("singleTrackForm");
//   const albumForm = document.getElementById("albumForm");

//   if (mode === "single") {
//     singleForm.classList.add("upload-form--active");
//     albumForm.classList.remove("upload-form--active");
//   } else {
//     singleForm.classList.remove("upload-form--active");
//     albumForm.classList.add("upload-form--active");
//   }
// }

// function bindToggleEvents() {
//   const buttons = document.querySelectorAll(".upload-mode__button");
//   buttons.forEach((btn) => {
//     btn.addEventListener("click", () => setUploadMode(btn.dataset.mode));
//   });
// }

// function getCurrentUploadMode() {
//   return currentUploadMode;
// }

// function initializeUploadToggle() {
//   bindToggleEvents();
// }

// document.addEventListener("DOMContentLoaded", initializeUploadToggle);

// // Vinyl Preview Script
// const vinylState = {
//   single: {
//     coverImage: "",
//     primaryColor: "#2a2928",
//     secondaryColor: "#605f5f",
//   },
//   album: {
//     coverImage: "",
//     primaryColor: "#2a2928",
//     secondaryColor: "#605f5f",
//   },
// };

// function createVinylRecord() {
//   const vinyl = document.createElement("div");
//   vinyl.className = "record";

//   const albumCover = document.createElement("div");
//   albumCover.className = "album-cover";

//   const recordLabel = document.createElement("div");
//   recordLabel.className = "record-label";

//   const centerHole = document.createElement("div");
//   centerHole.className = "center-hole";

//   vinyl.appendChild(albumCover);
//   vinyl.appendChild(recordLabel);
//   vinyl.appendChild(centerHole);

//   return vinyl;
// }

// function applyVinylStyles(type) {
//   const preview = document.getElementById(
//     type === "single" ? "singleVinylPreview" : "albumVinylPreview"
//   );
//   const data = vinylState[type];

//   const vinyl = preview.querySelector(".record");
//   if (!vinyl) return;

//   // Update album cover
//   const albumCover = vinyl.querySelector(".album-cover");
//   if (data.coverImage) {
//     albumCover.style.backgroundImage = `url(${data.coverImage})`;
//   } else {
//     albumCover.style.backgroundImage = "none";
//   }

//   // Update record label
//   const recordLabel = vinyl.querySelector(".record-label");
//   recordLabel.style.border = `solid 2px ${data.secondaryColor}`;
//   recordLabel.style.boxShadow = `
//         0 0 0 4px ${data.primaryColor},
//         inset 0 0 0 27px ${data.primaryColor}
//       `;
// }

// function updateVinylColor(type, colorType, value) {
//   vinylState[type][colorType] = value;
//   applyVinylStyles(type);
// }

// function updateVinylCoverImage(type, imageUrl) {
//   vinylState[type].coverImage = imageUrl;
//   applyVinylStyles(type);
// }

// function setupColorInputs() {
//   const singlePrimary = document.getElementById("singlePrimaryColor");
//   const singleSecondary = document.getElementById("singleSecondaryColor");
//   const albumPrimary = document.getElementById("albumPrimaryColor");
//   const albumSecondary = document.getElementById("albumSecondaryColor");

//   // Set initial values
//   singlePrimary.value = vinylState.single.primaryColor;
//   singleSecondary.value = vinylState.single.secondaryColor;
//   albumPrimary.value = vinylState.album.primaryColor;
//   albumSecondary.value = vinylState.album.secondaryColor;

//   // Bind events
//   singlePrimary.addEventListener("input", (e) => {
//     updateVinylColor("single", "primaryColor", e.target.value);
//   });

//   singleSecondary.addEventListener("input", (e) => {
//     updateVinylColor("single", "secondaryColor", e.target.value);
//   });

//   albumPrimary.addEventListener("input", (e) => {
//     updateVinylColor("album", "primaryColor", e.target.value);
//   });

//   albumSecondary.addEventListener("input", (e) => {
//     updateVinylColor("album", "secondaryColor", e.target.value);
//   });
// }

// function renderVinylPreviews() {
//   const singlePreview = document.getElementById("singleVinylPreview");
//   const albumPreview = document.getElementById("albumVinylPreview");

//   singlePreview.appendChild(createVinylRecord());
//   albumPreview.appendChild(createVinylRecord());

//   applyVinylStyles("single");
//   applyVinylStyles("album");
// }

// function initializeVinylPreviews() {
//   renderVinylPreviews();
//   setupColorInputs();
// }

// document.addEventListener("DOMContentLoaded", initializeVinylPreviews);

// // Preview Utils Script
// const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
// const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
// const ALLOWED_AUDIO_TYPES = [".mp3"];
// const ALLOWED_IMAGE_TYPES = [".jpg", ".jpeg", ".png", ".webp"];

// // Helper Functions
// function validateFile(file, type) {
//   const errors = [];

//   if (type === "audio") {
//     if (file.size > MAX_AUDIO_SIZE) {
//       errors.push("Audio file must be less than 100MB");
//     }
//     const extension = "." + file.name.split(".").pop().toLowerCase();
//     if (!ALLOWED_AUDIO_TYPES.includes(extension)) {
//       errors.push("Audio file must be MP3, WAV, or FLAC");
//     }
//   } else if (type === "image") {
//     if (file.size > MAX_IMAGE_SIZE) {
//       errors.push("Image file must be less than 10MB");
//     }
//     const extension = "." + file.name.split(".").pop().toLowerCase();
//     if (!ALLOWED_IMAGE_TYPES.includes(extension)) {
//       errors.push("Image file must be JPG, PNG, or GIF");
//     }
//   }

//   return errors;
// }

// function readFileAsDataURL(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = (e) => resolve(e.target.result);
//     reader.onerror = (e) => reject(e);
//     reader.readAsDataURL(file);
//   });
// }

// function updateFileUploadUI(container, file) {
//   const fileName = container.querySelector(".upload-form__file-name");
//   if (fileName) {
//     fileName.textContent = file.name;
//   }
// }

// // Public Methods
// async function handleFileUpload(file, type, container) {
//   try {
//     // Validate file
//     const errors = validateFile(file, type);
//     if (errors.length > 0) {
//       throw new Error(errors.join("\n"));
//     }

//     // Update UI
//     updateFileUploadUI(container, file);

//     // Read file if it's an image
//     if (type === "image") {
//       return await readFileAsDataURL(file);
//     }

//     return file;
//   } catch (error) {
//     alert(error.message);
//     return null;
//   }
// }

// function resetFileUpload(container) {
//   const fileName = container.querySelector(".upload-form__file-name");
//   if (fileName) {
//     fileName.textContent = container.dataset.placeholder || "Choose file";
//   }
// }

// // Multi-Select Artist Script
// const selectedArtists = new Map();
// let searchResults = [];
// let isSearching = false;

// // Mock data - In a real app, this would be fetched from an API
// // const mockArtists = [
// //   {
// //     id: "1",
// //     stage_name: "DJ Shadow",
// //     avatar_url: "/images/artists/dj-shadow.jpg",
// //   },
// //   {
// //     id: "2",
// //     stage_name: "Luna Echo",
// //     avatar_url: "/images/artists/luna-echo.jpg",
// //   },
// //   {
// //     id: "3",
// //     stage_name: "Neon Pulse",
// //     avatar_url: "/images/artists/neon-pulse.jpg",
// //   },
// //   {
// //     id: "4",
// //     stage_name: "Midnight Vibe",
// //     avatar_url: "/images/artists/midnight-vibe.jpg",
// //   },
// //   {
// //     id: "5",
// //     stage_name: "Bass Journey",
// //     avatar_url: "/images/artists/bass-journey.jpg",
// //   },
// //   {
// //     id: "6",
// //     stage_name: "Electric Storm",
// //     avatar_url: "/images/artists/electric-storm.jpg",
// //   },
// //   {
// //     id: "7",
// //     stage_name: "Crystal Wave",
// //     avatar_url: "/images/artists/crystal-wave.jpg",
// //   },
// // ];

// let mockArtists = [];

// fetch("../includes/get_artists.php")
//   .then((res) => res.json())
//   .then((data) => {
//     mockArtists = data;
//     console.log(data);
//   })
//   .catch(err => console.error(err));

// function buildArtistTag(artist) {
//   const tag = document.createElement("div");
//   tag.className = "artist-tag";
//   tag.dataset.id = artist.id;

//   const avatar = document.createElement("img");
//   avatar.src = artist.avatar_url;
//   avatar.alt = artist.stage_name;

//   const name = document.createElement("span");
//   name.textContent = artist.stage_name;

//   const removeBtn = document.createElement("button");
//   removeBtn.type = "button";
//   removeBtn.innerHTML = '<img src="../images/remove-purple.svg" alt="Remove">';

//   tag.appendChild(avatar);
//   tag.appendChild(name);
//   tag.appendChild(removeBtn);

//   return tag;
// }

// function buildArtistSearchItem(artist) {
//   const item = document.createElement("div");
//   item.className = "artist-item";
//   item.dataset.id = artist.id;

//   const avatar = document.createElement("img");
//   avatar.src = artist.avatar_url;
//   avatar.alt = artist.stage_name;

//   const name = document.createElement("span");
//   name.textContent = artist.stage_name;

//   const addIcon = document.createElement("img");
//   addIcon.src = "../images/add.svg";
//   addIcon.alt = "Add";
//   addIcon.className = "add-icon";

//   item.appendChild(avatar);
//   item.appendChild(name);
//   item.appendChild(addIcon);

//   return item;
// }

// function updateHiddenInputs() {
//   const inputContainer = document.getElementById("singlefeaturedArtistsInputs");
//   if (!inputContainer) return;

//   // Clear old inputs
//   inputContainer.innerHTML = "";

//   // Add new hidden inputs
//   selectedArtists.forEach((artist) => {
//     const input = document.createElement("input");
//     input.type = "hidden";
//     input.name = "single_featured_artists[]";
//     input.value = artist.id;
//     inputContainer.appendChild(input);
//   });
// }

// function displaySelectedArtists(container) {
//   const selectedContainer = container.querySelector(".selected-artists");
//   if (!selectedContainer) return;

//   selectedContainer.innerHTML = "";
//   selectedArtists.forEach((artist) => {
//     selectedContainer.appendChild(buildArtistTag(artist));
//   });
// }

// function displaySearchResults(container, results) {
//   const dropdown = container.querySelector(".upload-form__artist-dropdown");
//   if (!dropdown) return;

//   dropdown.innerHTML = "";
//   results.forEach((artist) => {
//     dropdown.appendChild(buildArtistSearchItem(artist));
//   });
// }

// function showSearchLoading(container) {
//   const dropdown = container.querySelector(".upload-form__artist-dropdown");
//   if (!dropdown) return;

//   dropdown.innerHTML = `
//     <div class="loading-state">
//       <div class="loading-spinner"></div>
//       <span>Searching artists...</span>
//     </div>
//   `;
// }

// function showNoSearchResults(container, query) {
//   const dropdown = container.querySelector(".upload-form__artist-dropdown");
//   if (!dropdown) return;

//   dropdown.innerHTML = `
//     <div class="no-results">
//       <span>No artists found for "${query}"</span>
//     </div>
//   `;
// }

// async function searchArtists(container, query) {
//   if (!query) {
//     searchResults = [];
//     displaySearchResults(container, []);
//     return;
//   }

//   isSearching = true;
//   showSearchLoading(container);

//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 300));

//   const results = mockArtists.filter((artist) => {
//     const matchesSearch = artist.stage_name
//       .toLowerCase()
//       .includes(query.toLowerCase());

//     const notSelected = !selectedArtists.has(artist.id);
//     return matchesSearch && notSelected;
//   });

//   searchResults = results;
//   isSearching = false;

//   if (results.length === 0) {
//     showNoSearchResults(container, query);
//   } else {
//     displaySearchResults(container, results);
//   }
// }

// function addSelectedArtist(container, artistId) {
//   const artist = mockArtists.find((a) => a.id === artistId);
//   if (!artist) return;

//   selectedArtists.set(artistId, artist);
//   displaySelectedArtists(container);
//   updateHiddenInputs();

//   // Clear search
//   const searchInput = container.querySelector('input[type="text"]');
//   if (searchInput) {
//     searchInput.value = "";
//   }
//   searchResults = [];
//   displaySearchResults(container, []);
// }

// function removeSelectedArtist(container, artistId) {
//   selectedArtists.delete(artistId);
//   displaySelectedArtists(container);
//   updateHiddenInputs();
// }

// function bindArtistSearchEvents(container) {
//   const searchInput = container.querySelector('input[type="text"]');
//   searchInput.addEventListener("input", (e) => {
//     const dropdown = container.querySelector(".upload-form__artist-dropdown");
//     dropdown.style.display = e.target.value ? "block" : "none";
//     searchArtists(container, e.target.value);
//   });

//   container.addEventListener("click", (e) => {
//     if (e.target.closest(".artist-item")) {
//       const artistId = e.target.closest(".artist-item").dataset.id;
//       addSelectedArtist(container, artistId);
//     } else if (e.target.closest(".artist-tag button")) {
//       const artistId = e.target.closest(".artist-tag").dataset.id;
//       removeSelectedArtist(container, artistId);
//     }

//     const dropdown = container.querySelector(".upload-form__artist-dropdown");
//     dropdown.style.display = e.target.value ? "block" : "none";
//   });

//   // Close dropdown when clicking outside
//   document.addEventListener("click", (e) => {
//     if (!container.contains(e.target)) {
//       const dropdown = container.querySelector(".upload-form__artist-dropdown");
//       if (dropdown) {
//         dropdown.innerHTML = "";
//       }
//     }
//   });
// }

// function createArtistSearchContainer(container) {
//   container.innerHTML = `
//     <div class="selected-artists"></div>
//     <div class="upload-form__multi-select-search">
//       <img src="../images/search-silver.svg" alt="Search">
//       <input id="artistSearch" type="text" placeholder="Search for featured artists...">
//     </div>
//     <div class="upload-form__artist-dropdown"></div>
//   `;
// }

// function initializeArtistSearch(container) {
//   createArtistSearchContainer(container);
//   bindArtistSearchEvents(container);
// }

// function getSelectedArtistsList() {
//   return Array.from(selectedArtists.values());
// }

// function setSelectedArtistsList(container, artists) {
//   selectedArtists.clear();
//   artists.forEach((artist) => {
//     selectedArtists.set(artist.id, artist);
//   });
//   displaySelectedArtists(container);
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const artistSearchContainer = document.getElementById("singleArtistSelect");
//   if (artistSearchContainer) initializeArtistSearch(artistSearchContainer);
// });

// // Single Track Form Module
// let singleTrackTitle = "";
// let singleTrackFile = null;
// let singleTrackCover = null;
// let singleTrackFeaturedArtists = [];
// let singleTrackVinylPrimaryColor = "#2a2928";
// let singleTrackVinylSecondaryColor = "#605f5f";
// let singleTrackIsExplicit = false;

// function updateSingleTrackTitle(value) {
//   singleTrackTitle = value;
// }

// async function processSingleAudioFile(file, uploadElement) {
//   if (!file) return;

//   const result = await handleFileUpload(
//     file,
//     "audio",
//     uploadElement.closest(".upload-form__file-upload")
//   );

//   if (result) {
//     singleTrackFile = result;
//   }
// }

// async function processSingleCoverFile(file, uploadElement) {
//   if (!file) return;

//   const result = await handleFileUpload(
//     file,
//     "image",
//     uploadElement.closest(".upload-form__file-upload")
//   );

//   if (result) {
//     singleTrackCover = result;
//     updateVinylCoverImage("single", result);
//   }
// }

// function updateSingleTrackExplicit(isExplicit) {
//   singleTrackIsExplicit = isExplicit;
// }

// function bindSingleFormEvents() {
//   const titleInput = document.getElementById("singleTitle");
//   const audioInput = document.getElementById("singleAudioInput");
//   const coverInput = document.getElementById("singleCoverInput");
//   const explicitCheckbox = document.getElementById("singleExplicit");

//   titleInput.addEventListener("input", (e) => {
//     updateSingleTrackTitle(e.target.value);
//   });

//   audioInput.addEventListener("change", (e) => {
//     const file = e.target.files[0];
//     processSingleAudioFile(file, audioInput);
//   });

//   coverInput.addEventListener("change", (e) => {
//     const file = e.target.files[0];
//     processSingleCoverFile(file, coverInput);
//   });

//   explicitCheckbox.addEventListener("change", (e) => {
//     updateSingleTrackExplicit(e.target.checked);
//   });
// }

// function initializeSingleTrackForm() {
//   // Bind form events
//   bindSingleFormEvents();
// }

// // Auto-initialize
// document.addEventListener("DOMContentLoaded", initializeSingleTrackForm);

// // Album Form Module - Function-based approach
// let albumTitle = "";
// let albumCover = null;
// let albumVinylPrimaryColor = "#2a2928";
// let albumVinylSecondaryColor = "#605f5f";

// function updateAlbumTitle(value) {
//   albumTitle = value;
// }

// async function processAlbumCoverFile(file, uploadElement) {
//   if (!file) return;

//   const result = await handleFileUpload(
//     file,
//     "image",
//     uploadElement.closest(".upload-form__file-upload")
//   );

//   if (result) {
//     albumCover = result;
//     updateVinylCoverImage("album", result);
//   }
// }

// function bindAlbumFormEvents() {
//   const titleInput = document.getElementById("albumTitle");
//   const coverInput = document.getElementById("albumCoverInput");

//   titleInput.addEventListener("input", (e) => {
//     updateAlbumTitle(e.target.value);
//   });

//   coverInput.addEventListener("change", (e) => {
//     const file = e.target.files[0];
//     processAlbumCoverFile(file, coverInput);
//   });
// }

// function initializeAlbumForm() {
//   bindAlbumFormEvents();
// }

// document.addEventListener("DOMContentLoaded", initializeAlbumForm);

// // Track List Module
// let tracks = [];
// let trackCounter = 0;

// // DOM element getters
// function getTrackList() {
//   return document.getElementById("trackList");
// }

// function getEmptyTrackList() {
//   return document.getElementById("emptyTrackList");
// }

// function getAddTrackBtn() {
//   return document.getElementById("addTrackBtn");
// }

// function getTrackTemplate() {
//   return document.getElementById("trackTemplate");
// }

// // Track creation and management
// function createTrackData(index = tracks.length) {
//   return {
//     id: `track-${Date.now().toString()}`,
//     index: index,
//     title: "",
//     file: null,
//     featuredArtists: [],
//     isExplicit: false,
//   };
// }

// function createTrackElement(track) {
//   const template = getTrackTemplate();
//   const clone = template.content.cloneNode(true);
//   const trackElement = clone.querySelector(".track");

//   trackElement.dataset.id = track.id;
//   setTrackNumber(trackElement, track.index + 1);
//   initializeTrackInputs(trackElement, track);

//   return trackElement;
// }

// function setTrackNumber(trackElement, number) {
//   const numberElement = trackElement.querySelector(".track__number-text");
//   const indexElement = trackElement.querySelector(".track__index");

//   if (numberElement) numberElement.textContent = number;
//   if (indexElement) indexElement.textContent = number;
// }

// function initializeTrackInputs(trackElement, track) {
//   const titleInput = trackElement.querySelector(".track__input--title");
//   const explicitCheckbox = trackElement.querySelector(
//     ".track__checkbox--explicit"
//   );
//   const artistSelect = trackElement.querySelector(
//     ".track__multi-select--artists"
//   );

//   if (titleInput) titleInput.value = track.title || "";
//   if (explicitCheckbox) explicitCheckbox.checked = track.isExplicit || false;

//   if (artistSelect) {
//     initializeArtistSearch(artistSelect);
//     if (track.featuredArtists.length > 0) {
//       setSelectedArtistsList(artistSelect, track.featuredArtists);
//     }
//   }
// }

// // Track list operations
// function addTrack() {
//   const newTrack = createTrackData();
//   tracks.push(newTrack);

//   const trackElement = createTrackElement(newTrack);
//   getTrackList().appendChild(trackElement);

//   updateEmptyState();
//   return newTrack;
// }

// function removeTrack(trackId) {
//   const trackElement = findTrackElement(trackId);
//   if (!trackElement) return false;

//   tracks = tracks.filter((track) => track.id !== trackId);
//   trackElement.remove();

//   updateAllTrackNumbers();
//   updateEmptyState();
//   return true;
// }

// function moveTrack(trackId, direction) {
//   const currentIndex = tracks.findIndex((track) => track.id === trackId);
//   if (currentIndex === -1) return false;

//   const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
//   if (newIndex < 0 || newIndex >= tracks.length) return false;

//   // Swap tracks in array
//   const track = tracks[currentIndex];
//   tracks.splice(currentIndex, 1);
//   tracks.splice(newIndex, 0, track);

//   // Move DOM element
//   const trackElement = findTrackElement(trackId);
//   const targetElement = getTrackList().children[newIndex];

//   if (direction === "up") {
//     targetElement.before(trackElement);
//   } else {
//     targetElement.after(trackElement);
//   }

//   updateAllTrackNumbers();
//   return true;
// }

// // Helper functions
// function findTrackElement(trackId) {
//   return getTrackList().querySelector(`[data-id="${trackId}"]`);
// }

// function findTrackData(trackId) {
//   return tracks.find((track) => track.id === trackId);
// }

// function updateAllTrackNumbers() {
//   const trackElements = getTrackList().querySelectorAll(".track");
//   trackElements.forEach((element, index) => {
//     setTrackNumber(element, index + 1);
//   });
// }

// function updateEmptyState() {
//   const emptyList = getEmptyTrackList();
//   const trackList = getTrackList();

//   if (tracks.length === 0) {
//     emptyList.style.display = "block";
//     trackList.style.display = "none";
//   } else {
//     emptyList.style.display = "none";
//     trackList.style.display = "block";
//   }
// }

// function updateTrackData(trackId) {
//   const trackElement = findTrackElement(trackId);
//   const track = findTrackData(trackId);

//   if (!trackElement || !track) return false;

//   const titleInput = trackElement.querySelector(".track__input--title");
//   const audioInput = trackElement.querySelector(".track__input--audio");
//   const explicitCheckbox = trackElement.querySelector(
//     ".track__checkbox--explicit"
//   );
//   const artistSelect = trackElement.querySelector(
//     ".track__multi-select--artists"
//   );

//   if (titleInput) track.title = titleInput.value;
//   if (audioInput && audioInput.files[0]) track.file = audioInput.files[0];
//   if (explicitCheckbox) track.isExplicit = explicitCheckbox.checked;

//   if (artistSelect) {
//     track.featuredArtists = getSelectedArtistsList();
//   }

//   return true;
// }

// // Event handling
// function handleTrackListClick(event) {
//   const trackElement = event.target.closest(".track");
//   if (!trackElement) return;

//   const trackId = trackElement.dataset.id;

//   if (event.target.closest(".track__btn--move-up")) {
//     moveTrack(trackId, "up");
//   } else if (event.target.closest(".track__btn--move-down")) {
//     moveTrack(trackId, "down");
//   } else if (event.target.closest(".track__btn--remove")) {
//     removeTrack(trackId);
//   }
// }

// function handleTrackListChange(event) {
//   const trackElement = event.target.closest(".track");
//   if (!trackElement) return;

//   updateTrackData(trackElement.dataset.id);
// }

// function clearAllTracks() {
//   tracks = [];
//   getTrackList().innerHTML = "";
//   updateEmptyState();
// }

// function getTrackCount() {
//   return tracks.length;
// }

// // Initialization
// function initializeTrackList() {
//   const addTrackBtn = getAddTrackBtn();
//   const trackList = getTrackList();

//   if (addTrackBtn) {
//     addTrackBtn.addEventListener("click", addTrack);
//   }

//   if (trackList) {
//     trackList.addEventListener("click", handleTrackListClick);
//     trackList.addEventListener("change", handleTrackListChange);
//   }

//   updateEmptyState();
// }

// document.addEventListener("DOMContentLoaded", initializeTrackList);
