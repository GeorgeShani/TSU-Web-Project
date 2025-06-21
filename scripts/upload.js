// Global State Management
const AppState = {
  currentMode: 'single',
  single: {
    title: '',
    audioFile: null,
    coverFile: null,
    featuredArtists: new Map(),
    isExplicit: false,
    vinylColors: {
      primary: '#2a2928',
      secondary: '#605f5f'
    },
    coverImageUrl: ''
  },
  album: {
    title: '',
    coverFile: null,
    tracks: [],
    vinylColors: {
      primary: '#2a2928',
      secondary: '#605f5f'
    },
    coverImageUrl: ''
  },
  artists: [],
  trackCounter: 0
};

const Utils = {
  // File validation constants
  MAX_AUDIO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,  // 10MB
  ALLOWED_AUDIO_TYPES: ['.mp3', '.wav', '.flac'],
  ALLOWED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png', '.webp'],

  validateFile(file, type) {
    const errors = [];
    const extension = '.' + file.name.split('.').pop().toLowerCase();

    if (type === 'audio') {
      if (file.size > this.MAX_AUDIO_SIZE) {
        errors.push('Audio file must be less than 100MB');
      }
      if (!this.ALLOWED_AUDIO_TYPES.includes(extension)) {
        errors.push('Audio file must be MP3, WAV, or FLAC');
      }
    } else if (type === 'image') {
      if (file.size > this.MAX_IMAGE_SIZE) {
        errors.push('Image file must be less than 10MB');
      }
      if (!this.ALLOWED_IMAGE_TYPES.includes(extension)) {
        errors.push('Image file must be JPG, PNG, WEBP, or GIF');
      }
    }

    return errors;
  },

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

const UploadModeManager = {
  init() {
    this.bindEvents();
    this.setMode('single');
  },

  bindEvents() {
    const buttons = document.querySelectorAll('.upload-mode__button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setMode(btn.dataset.mode);
      });
    });
  },

  setMode(mode) {
    if (mode === AppState.currentMode) return;

    AppState.currentMode = mode;
    this.updateButtons(mode);
    this.switchForms(mode);
  },

  updateButtons(activeMode) {
    const buttons = document.querySelectorAll('.upload-mode__button');
    buttons.forEach(btn => {
      btn.classList.toggle('upload-mode__button--active', btn.dataset.mode === activeMode);
    });
  },

  switchForms(mode) {
    const singleForm = document.getElementById('singleTrackForm');
    const albumForm = document.getElementById('albumForm');

    if (mode === 'single') {
      singleForm.classList.add('upload-form--active');
      albumForm.classList.remove('upload-form--active');
    } else {
      singleForm.classList.remove('upload-form--active');
      albumForm.classList.add('upload-form--active');
    }
  }
};

const VinylPreview = {
  init() {
    this.renderPreviews();
    this.bindColorInputs();
  },

  renderPreviews() {
    const singlePreview = document.getElementById('singleVinylPreview');
    const albumPreview = document.getElementById('albumVinylPreview');

    singlePreview.appendChild(this.createVinylRecord());
    albumPreview.appendChild(this.createVinylRecord());

    this.updatePreview('single');
    this.updatePreview('album');
  },

  createVinylRecord() {
    const vinyl = document.createElement('div');
    vinyl.className = 'record';

    const albumCover = document.createElement('div');
    albumCover.className = 'album-cover';

    const recordLabel = document.createElement('div');
    recordLabel.className = 'record-label';

    const centerHole = document.createElement('div');
    centerHole.className = 'center-hole';

    vinyl.appendChild(albumCover);
    vinyl.appendChild(recordLabel);
    vinyl.appendChild(centerHole);

    return vinyl;
  },

  updatePreview(type) {
    const preview = document.getElementById(type === 'single' ? 'singleVinylPreview' : 'albumVinylPreview');
    const data = AppState[type];
    const vinyl = preview.querySelector('.record');

    if (!vinyl) return;

    // Update album cover
    const albumCover = vinyl.querySelector('.album-cover');
    if (data.coverImageUrl) {
      albumCover.style.backgroundImage = `url(${data.coverImageUrl})`;
      albumCover.style.backgroundSize = 'cover';
      albumCover.style.backgroundPosition = 'center';
    } else {
      albumCover.style.backgroundImage = 'none';
    }

    // Update record label colors
    const recordLabel = vinyl.querySelector('.record-label');
    recordLabel.style.border = `solid 2px ${data.vinylColors.secondary}`;
    recordLabel.style.boxShadow = `
      0 0 0 4px ${data.vinylColors.primary},
      inset 0 0 0 27px ${data.vinylColors.primary}
    `;
  },

  bindColorInputs() {
    const colorInputs = [
      { id: 'singlePrimaryColor', type: 'single', colorType: 'primary' },
      { id: 'singleSecondaryColor', type: 'single', colorType: 'secondary' },
      { id: 'albumPrimaryColor', type: 'album', colorType: 'primary' },
      { id: 'albumSecondaryColor', type: 'album', colorType: 'secondary' }
    ];

    colorInputs.forEach(({ id, type, colorType }) => {
      const input = document.getElementById(id);
      if (input) {
        input.value = AppState[type].vinylColors[colorType];
        input.addEventListener('input', (e) => {
          AppState[type].vinylColors[colorType] = e.target.value;
          this.updatePreview(type);
        });
      }
    });
  },

  updateCoverImage(type, imageUrl) {
    AppState[type].coverImageUrl = imageUrl;
    this.updatePreview(type);
  }
};

const FileUploadHandler = {
  async handleFileUpload(input, type, onSuccess, onError) {
    const file = input.files[0];
    if (!file) return;

    try {
      // Validate file
      const errors = Utils.validateFile(file, type);
      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }

      // Update UI
      this.updateFileUploadUI(input, file);

      // Process file
      let result = file;
      if (type === "image") {
        result = await Utils.readFileAsDataURL(file);
      }

      if (onSuccess) {
        onSuccess(result, file);
      }
    } catch (error) {
      console.error("File upload error:", error);
      if (onError) {
        onError(error);
      } else {
        alert(error.message);
      }
      this.resetFileUpload(input);
    }
  },

  updateFileUploadUI(input, file) {
    // Check if this is a main form file upload (with container structure)
    const container = input.closest(".upload-form__file-upload");

    if (container) {
      // Main form file upload structure
      const fileName = container.querySelector(".upload-form__file-name");
      const fileInfo = container.querySelector(".upload-form__file-info");

      if (fileName) {
        fileName.textContent = file.name;
      }

      if (fileInfo) {
        fileInfo.textContent = `${Utils.formatFileSize(file.size)}`;
      }

      container.classList.add("upload-form__file-upload--has-file");
    } else {
      // Track file input (simple input without container)
      // Add visual feedback by changing the input's appearance or adding a label
      const trackContainer = input.closest(".track__field");
      if (trackContainer) {
        let fileLabel = trackContainer.querySelector(".track__file-label");
        if (!fileLabel) {
          fileLabel = document.createElement("div");
          fileLabel.className = "track__file-label";
          input.parentNode.appendChild(fileLabel);
        }
        fileLabel.textContent = `Selected: ${file.name} (${Utils.formatFileSize(
          file.size
        )})`;
        fileLabel.style.color = "#10b981"; // Green color to indicate success
        fileLabel.style.fontSize = "0.875rem";
        fileLabel.style.marginTop = "0.25rem";
      }
    }
  },

  resetFileUpload(input) {
    // Check if this is a main form file upload (with container structure)
    const container = input.closest(".upload-form__file-upload");

    if (container) {
      // Main form file upload structure
      const fileName = container.querySelector(".upload-form__file-name");
      const fileInfo = container.querySelector(".upload-form__file-info");

      if (fileName) {
        fileName.textContent = container.dataset.placeholder || "Choose file";
      }

      if (fileInfo) {
        fileInfo.textContent = container.dataset.info || "";
      }

      container.classList.remove("upload-form__file-upload--has-file");
    } else {
      // Track file input (simple input without container)
      const trackContainer = input.closest(".track__field");
      if (trackContainer) {
        const fileLabel = trackContainer.querySelector(".track__file-label");
        if (fileLabel) {
          fileLabel.remove();
        }
      }
    }

    input.value = "";
  },
};

const ArtistSearch = {
  searchCache: new Map(),
  searchTimeout: null,

  async init() {
    await this.loadArtists();
    this.initializeSearchContainers();
  },

  async loadArtists() {
    try {
      const response = await fetch("../includes/get_artists.php");
      const data = await response.json();
      AppState.artists = data;
    } catch (error) {
      console.error("Failed to load artists:", error);
      AppState.artists = [];
    }
  },

  initializeSearchContainers() {
    const singleContainer = document.getElementById("singleArtistSelect");
    if (singleContainer) {
      this.createSearchContainer(singleContainer, "single");
    }
  },

  createSearchContainer(container, context) {
    container.innerHTML = `
      <div class="selected-artists" data-context="${context}"></div>
      <div class="upload-form__multi-select-search">
        <img src="../images/search-silver.svg" alt="Search">
        <input id="artistSearch" type="text" placeholder="Search for featured artists..." class="artist-search-input">
      </div>
      <div class="upload-form__artist-dropdown" style="display: none;"></div>
    `;

    this.bindSearchEvents(container, context);
    this.updateSelectedArtists(container, context);
  },

  bindSearchEvents(container, context) {
    const searchInput = container.querySelector(".artist-search-input");
    const dropdown = container.querySelector(".upload-form__artist-dropdown");

    // Search input events
    searchInput.addEventListener(
      "input",
      Utils.debounce((e) => {
        const query = e.target.value.trim();
        if (query) {
          dropdown.style.display = "block";
          this.performSearch(container, query, context);
        } else {
          dropdown.style.display = "none";
          dropdown.innerHTML = "";
        }
      }, 300)
    );

    searchInput.addEventListener("focus", (e) => {
      if (e.target.value.trim()) {
        dropdown.style.display = "block";
      }
    });

    // Container click events
    container.addEventListener("click", (e) => {
      if (e.target.closest(".artist-item")) {
        const artistId = e.target.closest(".artist-item").dataset.id;
        this.addArtist(container, artistId, context);
      } else if (e.target.closest(".artist-tag button")) {
        const artistId = e.target.closest(".artist-tag").dataset.id;
        this.removeArtist(container, artistId, context);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
  },

  async performSearch(container, query, context) {
    const dropdown = container.querySelector(".upload-form__artist-dropdown");

    // Check cache first
    const cacheKey = query.toLowerCase();
    if (this.searchCache.has(cacheKey)) {
      this.displaySearchResults(
        dropdown,
        this.searchCache.get(cacheKey),
        context
      );
      return;
    }

    // Show loading
    dropdown.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <span>Searching artists...</span>
      </div>
    `;

    // Simulate API delay and search
    await new Promise((resolve) => setTimeout(resolve, 300));

    const selectedArtists = this.getSelectedArtists(context);
    const results = AppState.artists.filter((artist) => {
      const matchesSearch = artist.stage_name
        .toLowerCase()
        .includes(query.toLowerCase());
      const notSelected = !selectedArtists.has(artist.id);
      return matchesSearch && notSelected;
    });

    // Cache results
    this.searchCache.set(cacheKey, results);

    if (results.length === 0) {
      dropdown.innerHTML = `
        <div class="no-results">
          <span>No artists found for "${query}"</span>
        </div>
      `;
    } else {
      this.displaySearchResults(dropdown, results, context);
    }
  },

  displaySearchResults(dropdown, results, context) {
    dropdown.innerHTML = "";
    results.forEach((artist) => {
      const item = this.createArtistSearchItem(artist);
      dropdown.appendChild(item);
    });
  },

  createArtistSearchItem(artist) {
    const item = document.createElement("div");
    item.className = "artist-item";
    item.dataset.id = artist.id;

    item.innerHTML = `
      <img src="${artist.avatar_url}" alt="${artist.stage_name}">
      <span>${artist.stage_name}</span>
      <img src="../images/add.svg" alt="Add" class="add-icon">
    `;

    return item;
  },

  createArtistTag(artist) {
    const tag = document.createElement("div");
    tag.className = "artist-tag";
    tag.dataset.id = artist.id;

    tag.innerHTML = `
      <img src="${artist.avatar_url}" alt="${artist.stage_name}">
      <span>${artist.stage_name}</span>
      <button type="button">
        <img src="../images/remove-purple.svg" alt="Remove">
      </button>
    `;

    return tag;
  },

  updateSelectedArtists(container, context) {
    const selectedContainer = container.querySelector(".selected-artists");
    const selectedArtists = this.getSelectedArtists(context);

    selectedContainer.innerHTML = "";
    selectedArtists.forEach((artist) => {
      selectedContainer.appendChild(this.createArtistTag(artist));
    });
  },

  updateHiddenInputs(context) {
    if (context === "single") {
      const inputContainer = document.getElementById("singlefeaturedArtistsInputs");
      if (!inputContainer) return;
  
      inputContainer.innerHTML = "";
      AppState.single.featuredArtists.forEach((artist) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "single_featured_artists[]";
        input.value = artist.id;
        inputContainer.appendChild(input);
      });
    }
    else if (context.startsWith("track-")) {
      // For album tracks, regenerate ALL track featured artist inputs
      // This ensures consistency and proper indexing
      this.updateAllTrackFeaturedArtistsInputs();
    }
  },
  
  updateAllTrackFeaturedArtistsInputs() {
    const albumHiddenContainer = document.getElementById('albumHiddenInputs');
    if (!albumHiddenContainer) return;
  
    // Remove existing featured artist inputs
    const existingInputs = albumHiddenContainer.querySelectorAll('input[name*="featured_artists"]');
    existingInputs.forEach(input => input.remove());
  
    // Add featured artist inputs for all tracks
    AppState.album.tracks.forEach((track, trackIndex) => {
      if (track.featuredArtists && track.featuredArtists.size > 0) {
        track.featuredArtists.forEach((artist, artistId) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = `tracks[${trackIndex}][featured_artists][]`;
          input.value = artistId;
          albumHiddenContainer.appendChild(input);
        });
      }
    });
  
    console.log('Updated all track featured artist inputs');
  },

  getSelectedArtists(context) {
    if (context === "single") {
      return AppState.single.featuredArtists;
    }
    // FIX: Properly handle album track contexts
    if (context.startsWith("track-")) {
      const trackId = context.replace("track-", "");
      const track = AppState.album.tracks.find((t) => t.id === trackId);
      if (track) {
        // Ensure the featuredArtists Map exists
        if (!track.featuredArtists) {
          track.featuredArtists = new Map();
        }
        return track.featuredArtists;
      }
    }
    return new Map();
  },

  addArtist(container, artistId, context) {
    const artist = AppState.artists.find((a) => a.id === artistId);
    if (!artist) return;

    const selectedArtists = this.getSelectedArtists(context);
    selectedArtists.set(artistId, artist);

    // FIX: For album tracks, ensure the data is stored in the track object
    if (context.startsWith("track-")) {
      const trackId = context.replace("track-", "");
      const track = AppState.album.tracks.find((t) => t.id === trackId);
      if (track) {
        track.featuredArtists = selectedArtists;
        console.log(`Added artist ${artist.stage_name} to track ${trackId}`);
        console.log(
          `Track ${trackId} now has artists:`,
          Array.from(track.featuredArtists.values()).map((a) => a.stage_name)
        );
      }
    }

    this.updateSelectedArtists(container, context);
    this.updateHiddenInputs(context);

    // Clear search
    const searchInput = container.querySelector(".artist-search-input");
    const dropdown = container.querySelector(".upload-form__artist-dropdown");
    searchInput.value = "";
    dropdown.style.display = "none";
    dropdown.innerHTML = "";
  },

  removeArtist(container, artistId, context) {
    const selectedArtists = this.getSelectedArtists(context);
    selectedArtists.delete(artistId);

    // FIX: For album tracks, ensure the data is removed from the track object
    if (context.startsWith("track-")) {
      const trackId = context.replace("track-", "");
      const track = AppState.album.tracks.find((t) => t.id === trackId);
      if (track) {
        track.featuredArtists = selectedArtists;
        console.log(`Removed artist from track ${trackId}`);
        console.log(
          `Track ${trackId} now has artists:`,
          Array.from(track.featuredArtists.values()).map((a) => a.stage_name)
        );
      }
    }

    this.updateSelectedArtists(container, context);
    this.updateHiddenInputs(context);
  },
};

const SingleTrackForm = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Title input
    const titleInput = document.getElementById('singleTitle');
    titleInput.addEventListener('input', (e) => {
      AppState.single.title = e.target.value;
    });

    // Audio file input
    const audioInput = document.getElementById('singleAudioInput');
    audioInput.addEventListener('change', () => {
      FileUploadHandler.handleFileUpload(
        audioInput,
        'audio',
        (result, file) => {
          AppState.single.audioFile = file;
        }
      );
    });

    // Cover image input
    const coverInput = document.getElementById('singleCoverInput');
    coverInput.addEventListener('change', () => {
      FileUploadHandler.handleFileUpload(
        coverInput,
        'image',
        (result, file) => {
          AppState.single.coverFile = file;
          VinylPreview.updateCoverImage('single', result);
        }
      );
    });

    // Explicit content checkbox
    const explicitCheckbox = document.getElementById('singleExplicit');
    explicitCheckbox.addEventListener('change', (e) => {
      AppState.single.isExplicit = e.target.checked;
    });

    // Form submission
    const form = document.getElementById('singleTrackForm');
    form.addEventListener('submit', (e) => {
      this.handleSubmit(e);
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    // Form is valid, allow normal submission
    e.target.submit();
  },

  validateForm() {
    const errors = [];

    if (!AppState.single.title.trim()) {
      errors.push('Track title is required');
    }

    if (!AppState.single.audioFile) {
      errors.push('Audio file is required');
    }

    if (!AppState.single.coverFile) {
      errors.push('Cover image is required');
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return false;
    }

    return true;
  }
};

const AlbumForm = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Album title input
    const titleInput = document.getElementById("albumTitle");
    titleInput.addEventListener("input", (e) => {
      AppState.album.title = e.target.value;
    });

    // Album cover input
    const coverInput = document.getElementById("albumCoverInput");
    coverInput.addEventListener("change", () => {
      FileUploadHandler.handleFileUpload(
        coverInput,
        "image",
        (result, file) => {
          AppState.album.coverFile = file;
          VinylPreview.updateCoverImage("album", result);
        }
      );
    });

    // Form submission
    const form = document.getElementById("albumForm");
    form.addEventListener("submit", (e) => {
      this.handleSubmit(e);
    });
  },

  handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.updateHiddenInputs();
    e.target.submit();
  },

  validateForm() {
    const errors = [];

    if (!AppState.album.title.trim()) {
      errors.push("Album title is required");
    }

    if (!AppState.album.coverFile) {
      errors.push("Album cover is required");
    }

    if (AppState.album.tracks.length === 0) {
      errors.push("At least one track is required");
    }

    // Validate each track
    AppState.album.tracks.forEach((track, index) => {
      if (!track.title.trim()) {
        errors.push(`Track ${index + 1}: Title is required`);
      }
      if (!track.audioFile) {
        errors.push(`Track ${index + 1}: Audio file is required`);
      }
    });

    if (errors.length > 0) {
      alert("Please fix the following errors:\n\n" + errors.join("\n"));
      return false;
    }

    return true;
  },

  updateHiddenInputs() {
    const hiddenContainer = document.getElementById("albumHiddenInputs");
    hiddenContainer.innerHTML = "";

    // Add album data
    const albumTitleInput = document.createElement("input");
    albumTitleInput.type = "hidden";
    albumTitleInput.name = "album_title";
    albumTitleInput.value = AppState.album.title;
    hiddenContainer.appendChild(albumTitleInput);

    // FIX: Add track data with proper featured artists handling
    AppState.album.tracks.forEach((track, index) => {
      console.log(`Processing track ${index + 1} (${track.id}):`, {
        title: track.title,
        hasAudioFile: !!track.audioFile,
        isExplicit: track.isExplicit,
        featuredArtistsCount: track.featuredArtists
          ? track.featuredArtists.size
          : 0,
        featuredArtists: track.featuredArtists
          ? Array.from(track.featuredArtists.values()).map((a) => a.stage_name)
          : [],
      });

      // Track title
      const titleInput = document.createElement("input");
      titleInput.type = "hidden";
      titleInput.name = `tracks[${index}][title]`;
      titleInput.value = track.title;
      hiddenContainer.appendChild(titleInput);

      // Track explicit flag
      const explicitInput = document.createElement("input");
      explicitInput.type = "hidden";
      explicitInput.name = `tracks[${index}][is_explicit]`;
      explicitInput.value = track.isExplicit ? "1" : "0";
      hiddenContainer.appendChild(explicitInput);

      // FIX: Featured artists - properly handle the Map structure
      if (track.featuredArtists && track.featuredArtists.size > 0) {
        track.featuredArtists.forEach((artist, artistId) => {
          const artistInput = document.createElement("input");
          artistInput.type = "hidden";
          artistInput.name = `tracks[${index}][featured_artists][]`;
          artistInput.value = artistId; // Use the artist ID, not the artist object
          hiddenContainer.appendChild(artistInput);

          console.log(
            `Added hidden input for track ${index}, artist: ${artist.stage_name} (ID: ${artistId})`
          );
        });
      }
    });

    // Debug: Log all hidden inputs
    console.log("Generated hidden inputs:", hiddenContainer.innerHTML);
  },
};

const TrackManager = {
  init() {
    this.bindEvents();
    this.updateEmptyState();
  },

  bindEvents() {
    const addTrackBtn = document.getElementById("addTrackBtn");
    const trackList = document.getElementById("trackList");

    addTrackBtn.addEventListener("click", () => {
      this.addTrack();
    });

    trackList.addEventListener("click", (e) => {
      this.handleTrackListClick(e);
    });

    trackList.addEventListener("change", (e) => {
      this.handleTrackListChange(e);
    });
  },

  addTrack() {
    const track = {
      id: `track-${++AppState.trackCounter}`,
      title: "",
      audioFile: null,
      featuredArtists: new Map(),
      isExplicit: false,
    };

    AppState.album.tracks.push(track);

    const trackElement = this.createTrackElement(track);
    document.getElementById("trackList").appendChild(trackElement);

    this.updateEmptyState();
    this.updateTrackNumbers();

    const artistContainer = trackElement.querySelector(
      ".track__multi-select--artists"
    );
    const context = `track-${track.id}`;
    ArtistSearch.createSearchContainer(artistContainer, context);

    console.log(`Created track ${track.id} with context: ${context}`);
  },

  createTrackElement(track) {
    const template = document.getElementById("trackTemplate");
    const clone = template.content.cloneNode(true);
    const trackElement = clone.querySelector(".track");

    trackElement.dataset.id = track.id;

    const titleInput = trackElement.querySelector(".track__input--title");
    const audioInput = trackElement.querySelector(".track__input--audio");
    const explicitCheckbox = trackElement.querySelector(
      ".track__checkbox--explicit"
    );

    const trackIndex = AppState.album.tracks.length - 1;
    titleInput.id = `track-${trackIndex}-title`;
    titleInput.name = `tracks[${trackIndex}][title]`;

    audioInput.name = `track-${trackIndex}-audio-file`;
    audioInput.name = `audio_files[]`;

    explicitCheckbox.id = `track-${trackIndex}-is-explicit`;
    explicitCheckbox.name = `tracks[${trackIndex}][is_explicit]`;

    return trackElement;
  },

  removeTrack(trackId) {
    const trackIndex = AppState.album.tracks.findIndex((t) => t.id === trackId);
    if (trackIndex === -1) return;

    AppState.album.tracks.splice(trackIndex, 1);

    const trackElement = document.querySelector(`[data-id="${trackId}"]`);
    trackElement.remove();

    ArtistSearch.updateAllTrackFeaturedArtistsInputs();

    this.updateEmptyState();
    this.updateTrackNumbers();
  },

  moveTrack(trackId, direction) {
    const currentIndex = AppState.album.tracks.findIndex(
      (t) => t.id === trackId
    );
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= AppState.album.tracks.length) return;

    // Move in array
    const track = AppState.album.tracks[currentIndex];
    AppState.album.tracks.splice(currentIndex, 1);
    AppState.album.tracks.splice(newIndex, 0, track);

    // Move in DOM
    const trackList = document.getElementById("trackList");
    const trackElement = document.querySelector(`[data-id="${trackId}"]`);
    const targetElement = trackList.children[newIndex];

    if (direction === "up") {
      targetElement.before(trackElement);
    } else {
      targetElement.after(trackElement);
    }

    this.updateTrackNumbers();
  },

  updateTrackNumbers() {
    const trackElements = document.querySelectorAll("#trackList .track");
    trackElements.forEach((element, index) => {
      const numberText = element.querySelector(".track__number-text");
      const indexText = element.querySelector(".track__index");

      if (numberText) numberText.textContent = index + 1;
      if (indexText) indexText.textContent = index + 1;
    });
  },

  updateEmptyState() {
    const emptyList = document.getElementById("emptyTrackList");
    const trackList = document.getElementById("trackList");

    if (AppState.album.tracks.length === 0) {
      emptyList.style.display = "block";
      trackList.style.display = "none";
    } else {
      emptyList.style.display = "none";
      trackList.style.display = "block";
    }
  },

  handleTrackListClick(e) {
    const trackElement = e.target.closest(".track");
    if (!trackElement) return;

    const trackId = trackElement.dataset.id;

    if (e.target.closest(".track__btn--move-up")) {
      this.moveTrack(trackId, "up");
    } else if (e.target.closest(".track__btn--move-down")) {
      this.moveTrack(trackId, "down");
    } else if (e.target.closest(".track__btn--remove")) {
      this.removeTrack(trackId);
    }
  },

  handleTrackListChange(e) {
    const trackElement = e.target.closest(".track");
    if (!trackElement) return;

    const trackId = trackElement.dataset.id;
    const track = AppState.album.tracks.find((t) => t.id === trackId);
    if (!track) return;

    if (e.target.classList.contains("track__input--title")) {
      track.title = e.target.value;
    } else if (e.target.classList.contains("track__input--audio")) {
      const file = e.target.files[0];
      if (file) {
        // Use the FileUploadHandler for consistent validation and UI updates
        FileUploadHandler.handleFileUpload(
          e.target,
          "audio",
          (result, file) => {
            track.audioFile = file;
            console.log(`Audio file uploaded for track ${trackId}:`, file.name);
          },
          (error) => {
            console.error(`Audio upload failed for track ${trackId}:`, error);
            alert(`Failed to upload audio file: ${error.message}`);
          }
        );
      }
    } else if (e.target.classList.contains("track__checkbox--explicit")) {
      track.isExplicit = e.target.checked;
    }
  },
};

class MusicUploadApp {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      UploadModeManager.init();
      VinylPreview.init();
      await ArtistSearch.init();
      SingleTrackForm.init();
      AlbumForm.init();
      TrackManager.init();

      this.initialized = true;
      console.log('Music Upload App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Music Upload App:', error);
    }
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new MusicUploadApp();
  app.init();
});

// Export for potential external use
window.MusicUploadApp = MusicUploadApp;
window.AppState = AppState;