let tracks = [];

const params = new URLSearchParams(window.location.search);
const type = params.get("type"); // e.g., "track"
const id = params.get("id"); // e.g., "3"

// Function to initialize player after data is loaded
async function initializeMusicPlayer() {
  if (type && id) {
    try {
      const response = await fetch(`../includes/get_music.php?type=${type}&id=${id}`);
      const data = await response.json();
      tracks = data;
      console.log('Tracks loaded:', tracks);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  }
  
  if (document.getElementById("record") || document.getElementById("play")) {
    try {
      window.musicPlayer = new MusicPlayer();
    } catch (error) {
      console.error("Failed to initialize music player:", error);
    }
  }
}
class MusicPlayer {
  constructor() {
    // Track management
    this.tracks = tracks;
    this.currentTrackIndex = 0;
    this.isSidebarOpen = false;

    // Audio context and advanced audio handling
    this.audioContext = null;
    this.gainNode = null;
    this.currentSource = null;
    this.audioBuffers = new Map();
    this.songMetadata = new Map();
    this.loadingPromises = new Map();
    this.bufferQueue = new Set();
    this.maxBufferSize = 5;

    // Playback state
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.playbackStartTime = 0;
    this.songStartOffset = 0;
    this.pausedAt = 0;
    this.nextSongTimeout = null;
    this.progressInterval = null;
    this.resizeObserver = null;

    this.initializePlayer();
  }

  async initializePlayer() {
    this.initializeElements();
    await this.initializeAudioContext();
    this.bindEvents();
    this.renderTrackList();
    await this.loadInitialTrack();
    this.updateUI();
    this.setupResizeObserver();
  }

  initializeElements() {
    // Background elements
    this.bgImg = document.getElementById("background__image");

    // Record/Album elements
    this.record = document.getElementById("record");
    this.albumCover = document.getElementById("album-cover");
    this.recordLabel = document.getElementById("record-label");

    // Track info elements
    this.titleScroll = document.getElementById("title-scroll");
    this.artistScroll = document.getElementById("artist-scroll");
    this.artistText = document.getElementById("artist-text");
    this.albumScroll = document.getElementById("album-scroll");
    this.explicitContent = document.getElementById("explicit-content");

    // Progress elements
    this.playerProgress = document.getElementById("player-progress");
    this.progress = document.getElementById("progress");
    this.currentTimeEl = document.getElementById("current-time");
    this.durationEl = document.getElementById("duration");

    // Control elements
    this.playBtn = document.getElementById("play");
    this.prevBtn = document.getElementById("prev");
    this.nextBtn = document.getElementById("next");

    // Sidebar elements
    this.trackList = document.getElementById("track-list");
    this.trackCount = document.getElementById("track-count");
    this.sidebar = document.getElementById("sidebar");

    // Mobile elements
    this.mobileMenuBtn = document.getElementById("mobile-menu-btn");
    this.mobileOverlay = document.getElementById("mobile-overlay");
  }

  async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
      this.showError("Audio initialization failed. Please refresh the page.");
    }
  }

  bindEvents() {
    // Control events
    this.playBtn?.addEventListener("click", () => this.togglePlayPause());
    this.prevBtn?.addEventListener("click", () => this.previousTrack());
    this.nextBtn?.addEventListener("click", () => this.nextTrack());
    this.playerProgress?.addEventListener("click", (e) =>
      this.handleProgressClick(e)
    );

    // Mobile menu events
    this.mobileMenuBtn?.addEventListener("click", () => this.toggleSidebar());
    this.mobileOverlay?.addEventListener("click", () => this.closeSidebar());

    // Keyboard events
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));

    // Window resize event for responsive handling
    window.addEventListener("resize", () => this.handleResize());
  }

  async loadInitialTrack() {
    await this.loadTrack(this.currentTrackIndex);
    this.backgroundPreload();
  }

  // Enhanced track loading with promise tracking
  async loadTrack(index) {
    if (this.audioBuffers.has(index)) return;

    // If already loading, return the existing promise
    if (this.loadingPromises.has(index)) {
      return this.loadingPromises.get(index);
    }

    if (this.bufferQueue.has(index)) return;

    this.bufferQueue.add(index);

    const loadPromise = (async () => {
      try {
        const track = this.tracks[index];
        const response = await fetch(track.audioUrl, {
          cache: "force-cache",
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(
          arrayBuffer
        );

        this.audioBuffers.set(index, audioBuffer);
        this.songMetadata.set(index, {
          duration: audioBuffer.duration,
          loaded: true,
        });

        // Clean up excess buffers after successful load
        this.smartCleanupBuffers();

        return audioBuffer;
      } catch (e) {
        console.error(`Failed to load track ${index}:`, e);
        this.songMetadata.set(index, { duration: 0, loaded: false });
        this.showError(
          `Failed to load track: ${this.tracks[index]?.title || "Unknown"}`
        );
        throw e;
      } finally {
        this.bufferQueue.delete(index);
        this.loadingPromises.delete(index);
      }
    })();

    this.loadingPromises.set(index, loadPromise);
    return loadPromise;
  }

  // Smart buffer cleanup that preserves priority tracks
  smartCleanupBuffers() {
    if (this.audioBuffers.size <= this.maxBufferSize) return;

    // Always keep current track and immediate neighbors
    const priorityIndices = new Set([
      this.currentTrackIndex,
      (this.currentTrackIndex + 1) % this.tracks.length,
      (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length,
    ]);

    // Sort buffers by distance from current track
    const bufferEntries = Array.from(this.audioBuffers.entries());
    const sortedByDistance = bufferEntries.sort(([indexA], [indexB]) => {
      const distanceA = this.getCircularDistance(
        this.currentTrackIndex,
        indexA,
        this.tracks.length
      );
      const distanceB = this.getCircularDistance(
        this.currentTrackIndex,
        indexB,
        this.tracks.length
      );
      return distanceA - distanceB;
    });

    // Remove furthest tracks first, but never remove priority tracks
    let removed = 0;
    const toRemove = this.audioBuffers.size - this.maxBufferSize;

    for (
      let i = sortedByDistance.length - 1;
      i >= 0 && removed < toRemove;
      i--
    ) {
      const [index] = sortedByDistance[i];
      if (!priorityIndices.has(index)) {
        this.audioBuffers.delete(index);
        // Keep metadata but mark as not loaded
        if (this.songMetadata.has(index)) {
          const meta = this.songMetadata.get(index);
          this.songMetadata.set(index, { ...meta, loaded: false });
        }
        removed++;
      }
    }
  }

  // Calculate circular distance between two indices
  getCircularDistance(from, to, length) {
    const direct = Math.abs(to - from);
    const wrap = length - direct;
    return Math.min(direct, wrap);
  }

  // Enhanced background preload with smarter priority
  backgroundPreload() {
    const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    const prevIndex =
      (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;

    // Always ensure adjacent tracks are loaded
    if (!this.audioBuffers.has(nextIndex) && !this.bufferQueue.has(nextIndex)) {
      this.loadTrack(nextIndex);
    }

    if (!this.audioBuffers.has(prevIndex) && !this.bufferQueue.has(prevIndex)) {
      this.loadTrack(prevIndex);
    }

    // If we have space, preload one more in each direction
    if (this.audioBuffers.size < this.maxBufferSize - 1) {
      const nextNext = (this.currentTrackIndex + 2) % this.tracks.length;
      const prevPrev =
        (this.currentTrackIndex - 2 + this.tracks.length) % this.tracks.length;

      if (!this.audioBuffers.has(nextNext) && !this.bufferQueue.has(nextNext)) {
        this.loadTrack(nextNext);
      } else if (
        !this.audioBuffers.has(prevPrev) &&
        !this.bufferQueue.has(prevPrev)
      ) {
        this.loadTrack(prevPrev);
      }
    }
  }

  renderTrackList() {
    if (!this.trackList) return;

    this.trackList.innerHTML = "";
    if (this.trackCount) {
      this.trackCount.textContent = `${this.tracks.length} tracks`;
    }

    this.tracks.forEach((track, index) => {
      const trackItem = document.createElement("div");
      trackItem.className = `player__track-item ${
        index === this.currentTrackIndex ? "active" : ""
      }`;

      const metadata = this.songMetadata.get(index);
      const buffer = this.audioBuffers.get(index);
      const duration = metadata?.duration || buffer?.duration;
      const durationText = duration ? this.formatTime(duration) : "--:--";

      // Conditional explicit icon
      const explicitIcon = track.explicit
        ? `<img src="../images/explicit.svg" alt="Explicit Content" width="14" height="14" />`
        : "";

      trackItem.innerHTML = `
        <div class="player__track-item__content">
          <span class="player__track-item__number">${index + 1}</span>
          <div class="player__track-item__info">
            <p class="player__track-item__title">
              ${this.escapeHtml(track.title)}
            </p>
            <p class="player__track-item__artist">
              ${explicitIcon}  
              <span class="artist-name">${this.escapeHtml(track.artist)}</span>
            </p>
          </div>
          <span class="player__track-item__duration">${durationText}</span>
        </div>
      `;

      trackItem.addEventListener("click", () => this.selectTrack(index));
      this.trackList.appendChild(trackItem);
    });    
  }

  updateUI() {
    const currentTrack = this.tracks[this.currentTrackIndex];

    if (currentTrack) {
      // Update background image
      if (this.bgImg) {
        this.bgImg.src =
          currentTrack.coverUrl || "../images/Default Playlist Cover.png";
        this.bgImg.alt = `${currentTrack.album} cover`;
      }

      // Update album cover
      if (this.albumCover) {
        this.albumCover.style.backgroundImage = `url(${
          currentTrack.coverUrl || "../images/Default Playlist Cover.png"
        })`;
      }

      // Update track info with scrolling text
      if (this.titleScroll) {
        this.titleScroll.textContent = currentTrack.title;
        this.setupScrollingText(this.titleScroll);
      }

      if (this.artistText) {
        this.artistText.textContent = currentTrack.artist;
        this.setupScrollingText(this.artistScroll);
      }

      if (this.albumScroll) {
        this.albumScroll.textContent = currentTrack.album;
        this.setupScrollingText(this.albumScroll);
      }

      // Update record label colors if available
      if (this.recordLabel && currentTrack.colors) {
        this.recordLabel.style.border = `solid 2px ${currentTrack.colors[1]}`;
        this.recordLabel.style.boxShadow = `0 0 0 4px ${currentTrack.colors[0]}, inset 0 0 0 27px ${currentTrack.colors[0]}`;
      }

      // Handle explicit content indicator
      if (this.explicitContent) {
        if (currentTrack.explicit) {
          this.explicitContent.classList.remove(
            "player__explicit--hidden",
            "hidden"
          );
        } else {
          this.explicitContent.classList.add(
            "player__explicit--hidden",
            "hidden"
          );
        }
      }

      // Update duration display
      this.updateDurationDisplay();
    }

    // Update play/pause button
    this.updatePlayButton();

    // Update record spinning animation
    if (this.record) {
      if (this.isPlaying) {
        this.record.classList.add("spinning");
      } else {
        this.record.classList.remove("spinning");
      }
    }

    // Update control buttons state
    this.updateControlButtonsState();

    // Update track list active state
    this.renderTrackList();
  }

  updateDurationDisplay() {
    if (!this.durationEl) return;

    const metadata = this.songMetadata.get(this.currentTrackIndex);
    const buffer = this.audioBuffers.get(this.currentTrackIndex);

    if (buffer && metadata?.loaded) {
      this.durationEl.textContent = this.formatTime(metadata.duration);
    } else if (buffer) {
      // Buffer exists but metadata might be stale
      this.durationEl.textContent = this.formatTime(buffer.duration);
      // Update metadata
      this.songMetadata.set(this.currentTrackIndex, {
        duration: buffer.duration,
        loaded: true,
      });
    } else if (
      this.bufferQueue.has(this.currentTrackIndex) ||
      this.loadingPromises.has(this.currentTrackIndex)
    ) {
      this.durationEl.textContent = "Loading...";
    } else {
      this.durationEl.textContent = "00:00";
    }
  }

  updatePlayButton() {
    if (!this.playBtn) return;

    this.playBtn.classList.toggle("fa-play", !this.isPlaying);
    this.playBtn.classList.toggle("fa-pause", this.isPlaying);

    // Alternative class names for different icon systems
    this.playBtn.className = this.isPlaying
      ? "player__control player__control--play fa-solid fa-pause"
      : "player__control player__control--play fa-solid fa-play";

    this.playBtn.title = this.isPlaying ? "Pause" : "Play";
  }

  updateControlButtonsState() {
    if (this.prevBtn) {
      this.prevBtn.style.opacity = this.currentTrackIndex === 0 ? "0.3" : "1";
      this.prevBtn.style.cursor =
        this.currentTrackIndex === 0 ? "not-allowed" : "pointer";
    }

    if (this.nextBtn) {
      this.nextBtn.style.opacity =
        this.currentTrackIndex === this.tracks.length - 1 ? "0.3" : "1";
      this.nextBtn.style.cursor =
        this.currentTrackIndex === this.tracks.length - 1
          ? "not-allowed"
          : "pointer";
    }
  }

  setupScrollingText(element) {
    if (!element) return;

    const container = element.parentElement;
    const containerWidth = container.offsetWidth;
    const textWidth = element.scrollWidth;

    // Only animate if text is wider than container
    if (textWidth > containerWidth) {
      const scrollDistance = textWidth - containerWidth;
      element.style.setProperty("--scroll-distance", `-${scrollDistance}px`);
      element.classList.add("animate");
    } else {
      element.classList.remove("animate");
    }
  }

  setupResizeObserver() {
    if (!window.ResizeObserver) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });

    // Observe elements that might need scrolling text updates
    [this.titleScroll, this.artistScroll, this.albumScroll].forEach((el) => {
      if (el) this.resizeObserver.observe(el.parentElement || el);
    });
  }

  async togglePlayPause() {
    if (!this.audioContext) return;

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.isPlaying ? this.pause() : await this.play();
  }

  async play() {
    // Ensure current track is loaded
    if (!this.audioBuffers.has(this.currentTrackIndex)) {
      await this.loadTrack(this.currentTrackIndex);
    }

    this.stopCurrentSource();
    const buffer = this.audioBuffers.get(this.currentTrackIndex);
    if (!buffer) return;

    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = buffer;
    this.currentSource.connect(this.gainNode);

    const now = this.audioContext.currentTime;
    this.playbackStartTime = now;
    this.currentSource.start(now, this.pausedAt);
    this.songStartOffset = this.pausedAt;
    this.pausedAt = 0;

    this.scheduleNextTrack(buffer.duration - this.songStartOffset);

    this.isPlaying = true;
    this.updateUI();
    this.startProgressUpdate();

    this.backgroundPreload();
  }

  pause() {
    if (!this.isPlaying || !this.currentSource) return;

    const elapsed = this.audioContext.currentTime - this.playbackStartTime;
    this.pausedAt = this.songStartOffset + elapsed;

    this.stopCurrentSource();
    this.clearNextTrackTimeout();

    this.isPlaying = false;
    this.updateUI();
    this.stopProgressUpdate();
  }

  stopCurrentSource() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {}
      this.currentSource.disconnect();
      this.currentSource = null;
    }
  }

  scheduleNextTrack(duration) {
    this.clearNextTrackTimeout();
    const timeUntilNext = Math.max(0, (duration - 0.02) * 1000);
    this.nextSongTimeout = setTimeout(() => {
      if (this.isPlaying) this.transitionToNextTrack();
    }, timeUntilNext);
  }

  async transitionToNextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.songStartOffset = 0;
    this.pausedAt = 0;

    this.updateUI();
    await this.play();
    // Clean up after successful transition
    this.smartCleanupBuffers();
  }

  clearNextTrackTimeout() {
    if (this.nextSongTimeout) {
      clearTimeout(this.nextSongTimeout);
      this.nextSongTimeout = null;
    }
  }

  async nextTrack() {
    if (this.currentTrackIndex < this.tracks.length - 1) {
      this.currentTrackIndex++;
      await this.changeTrack();
    }
  }

  async previousTrack() {
    if (this.currentTrackIndex > 0) {
      this.currentTrackIndex--;
      await this.changeTrack();
    }
  }

  async selectTrack(index) {
    if (index >= 0 && index < this.tracks.length) {
      this.currentTrackIndex = index;
      await this.changeTrack();
      this.closeSidebar();
    }
  }

  // Enhanced track change with proper loading sequence
  async changeTrack() {
    this.pause();
    this.songStartOffset = 0;
    this.pausedAt = 0;

    // Update display first
    this.updateUI();

    // Ensure new track is loaded before playing
    if (!this.audioBuffers.has(this.currentTrackIndex)) {
      // Show loading state
      if (this.durationEl) this.durationEl.textContent = "Loading...";
      await this.loadTrack(this.currentTrackIndex);
      // Update display again once loaded
      this.updateUI();
    }

    // Trigger background preload for adjacent tracks
    this.backgroundPreload();

    // Clean up after navigation
    this.smartCleanupBuffers();

    await this.play();
  }

  handleProgressClick(e) {
    const metadata = this.songMetadata.get(this.currentTrackIndex);
    if (!metadata || !metadata.loaded) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = Math.max(0, percent * metadata.duration);
    const wasPlaying = this.isPlaying;

    this.pause();
    this.songStartOffset = seekTime;
    this.pausedAt = seekTime;

    if (wasPlaying) this.play();
    else this.updateProgress();
  }

  getCurrentPosition() {
    if (this.isPlaying && this.currentSource) {
      return Math.max(
        0,
        this.songStartOffset +
          (this.audioContext.currentTime - this.playbackStartTime)
      );
    }
    return Math.max(0, this.pausedAt || this.songStartOffset);
  }

  startProgressUpdate() {
    this.stopProgressUpdate();
    this.progressInterval = setInterval(() => this.updateProgress(), 100);
  }

  stopProgressUpdate() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  updateProgress() {
    const metadata = this.songMetadata.get(this.currentTrackIndex);
    const buffer = this.audioBuffers.get(this.currentTrackIndex);

    // Use buffer duration if metadata is missing
    const duration = metadata?.duration || buffer?.duration || 0;

    if (duration <= 0) return;

    const currentTime = this.getCurrentPosition();
    const progress = (currentTime / duration) * 100;

    if (this.progress) {
      this.progress.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
    }

    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = this.formatTime(currentTime);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;

    if (this.mobileMenuBtn) {
      this.mobileMenuBtn.classList.toggle("active", this.isSidebarOpen);
    }

    if (this.sidebar) {
      this.sidebar.classList.toggle("active", this.isSidebarOpen);
    }

    if (this.mobileOverlay) {
      this.mobileOverlay.classList.toggle("active", this.isSidebarOpen);
    }

    // Prevent body scroll when sidebar is open
    document.body.style.overflow = this.isSidebarOpen ? "hidden" : "";
  }

  closeSidebar() {
    this.isSidebarOpen = false;

    if (this.mobileMenuBtn) {
      this.mobileMenuBtn.classList.remove("active");
    }

    if (this.sidebar) {
      this.sidebar.classList.remove("active");
    }

    if (this.mobileOverlay) {
      this.mobileOverlay.classList.remove("active");
    }

    document.body.style.overflow = "";
  }

  handleKeyPress(e) {
    // Prevent default behavior when input elements are focused
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    switch (e.code) {
      case "Space":
        e.preventDefault();
        this.togglePlayPause();
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.previousTrack();
        break;
      case "ArrowRight":
        e.preventDefault();
        this.nextTrack();
        break;
      case "Escape":
        e.preventDefault();
        this.closeSidebar();
        break;
    }
  }

  handleResize() {
    // Recalculate scrolling text on window resize
    if (this.titleScroll) this.setupScrollingText(this.titleScroll);
    if (this.artistScroll) this.setupScrollingText(this.artistScroll);
    if (this.albumScroll) this.setupScrollingText(this.albumScroll);
  }

  formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showError(message) {
    console.error(message);

    // Create a toast notification
    const errorDiv = document.createElement("div");
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      max-width: 300px;
      word-wrap: break-word;
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 5000);
  }

  // Public method to get current track info
  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  // Cleanup method
  destroy() {
    // Stop playback
    this.pause();
    this.stopCurrentSource();
    this.clearNextTrackTimeout();

    // Disconnect audio context
    if (this.gainNode) {
      this.gainNode.disconnect();
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }

    // Clear intervals and observers
    this.stopProgressUpdate();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Clear all caches
    this.audioBuffers.clear();
    this.songMetadata.clear();
    this.bufferQueue.clear();
    this.loadingPromises.clear();

    // Reset body styles
    document.body.style.overflow = "";
  }
}

// Initialize the music player when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeMusicPlayer);

// Handle page unload
window.addEventListener("beforeunload", () => {
  if (window.musicPlayer) {
    window.musicPlayer.destroy();
  }
});
