<?php
session_start();
if ($_SESSION['role'] !== 'artist') {
  header("Location: ../index.php");
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="../images/icon.svg">
    <link rel="stylesheet" href="../styles/style.css">
    <title>Upload | EchoWave | Music Player</title>
  </head>
  <body>
    <main class="main-content upload-page">
      <div class="upload-page__main">
        <div class="upload-page__container">
          <div class="upload-page__header">
            <div class="upload-page__logo">
              <a href="../index.html" class="upload-page__logo-link">
                <div class="upload-page__logo-icon">
                  <img src="../images/music.svg" alt="Music Icon" class="upload-page__logo-image" />
                </div>
                <span class="upload-page__logo-text">EchoWave</span>
              </a>
            </div>
            <h1 class="upload-page__title">Upload Your Music</h1>
            <p class="upload-page__subtitle">
              Create something legendary with vinyl-style presentation
            </p>
          </div>
          <div class="upload-mode">
            <div class="upload-mode__container">
              <div class="upload-mode__buttons">
                <button class="upload-mode__button upload-mode__button--active" data-mode="single">
                  <img src="../images/music.svg" alt="Single Icon" class="upload-mode__button-icon">
                  Upload Single
                </button>
                <button class="upload-mode__button" data-mode="album">
                  <img src="../images/album.svg" alt="Album Icon" class="upload-mode__button-icon">
                  Upload Album
                </button>
              </div>
            </div>
          </div>
          <form
            id="singleTrackForm"
            class="upload-form upload-form--single upload-form--active"
            enctype="multipart/form-data"
            method="POST"
            action="../includes/upload-single.php"
          >
            <h2 class="upload-form__title">
              <img src="../images/music-purple.svg" alt="Single Track" class="upload-form__title-icon" />
              Upload Single Track
            </h2>
            <div class="upload-form__grid">
              <div class="upload-form__column">
                <h3 class="upload-form__section-title">
                  <img src="../images/palette.svg" alt="Palette" class="upload-form__section-icon" />
                  Vinyl Preview
                </h3>
                <div class="upload-form__vinyl-preview">
                  <div class="vinyl-preview" id="singleVinylPreview"></div>
                  <div class="upload-form__color-pickers">
                    <fieldset class="upload-form__color-picker">
                      <label for="singlePrimaryColor" class="upload-form__color-label">Primary Vinyl Color</label>
                      <input 
                        type="color" 
                        id="singlePrimaryColor" 
                        name="single_vinyl_primary_color" 
                        class="upload-form__color-input" 
                        value="#2a2928" 
                      />
                    </fieldset>
                    <fieldset class="upload-form__color-picker">
                      <label for="singleSecondaryColor" class="upload-form__color-label">Secondary Vinyl Color</label>
                      <input 
                        type="color" 
                        id="singleSecondaryColor" 
                        name="single_vinyl_secondary_color" 
                        class="upload-form__color-input" 
                        value="#605f5f" 
                      />
                    </fieldset>
                  </div>
                </div>
              </div>
              <div class="upload-form__column">
                <fieldset class="upload-form__section">
                  <label for="singleAudioInput" class="upload-form__label">Audio File*</label>
                  <div class="upload-form__file-upload" id="singleAudioUpload">
                    <input
                      type="file"
                      accept=".mp3"
                      id="singleAudioInput"
                      name="single_audio_file"
                      class="upload-form__file-input"
                      required
                    />
                    <div class="upload-form__file-placeholder">
                      <img src="../images/upload-silver.svg" alt="Upload" class="upload-form__file-icon" />
                      <p class="upload-form__file-name">Choose audio file</p>
                      <p class="upload-form__file-info">MP3 up to 100MB</p>
                    </div>
                  </div>
                </fieldset>
                <fieldset class="upload-form__section">
                  <label for="singleCoverInput" class="upload-form__label">Cover Art*</label>
                  <div class="upload-form__file-upload" id="singleCoverUpload">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      id="singleCoverInput"
                      name="single_cover_image"
                      class="upload-form__file-input"
                      required
                    />
                    <div class="upload-form__file-placeholder">
                      <img src="../images/image-silver.svg" alt="Image" class="upload-form__file-icon" />
                      <p class="upload-form__file-name">Choose cover image</p>
                      <p class="upload-form__file-info">JPG, PNG, or WEBP up to 10MB</p>
                    </div>
                  </div>
                </fieldset>
              </div>
              <div class="upload-form__column">
                <fieldset class="upload-form__field">
                  <label for="singleTitle" class="upload-form__label">Track Title*</label>
                  <input
                    type="text"
                    id="singleTitle"
                    class="upload-form__input"
                    name="single_track_title"
                    required
                    placeholder="Enter track title"
                  />
                </fieldset>
                <fieldset class="upload-form__field">
                  <label for="artistSearch" class="upload-form__label">Featured Artists (Optional)</label>
                  <div class="upload-form__multi-select" id="singleArtistSelect"></div>
                  <div id="singlefeaturedArtistsInputs"></div>
                </fieldset>
                <fieldset class="upload-form__field">
                  <div class="upload-form__checkbox-group">
                    <input type="checkbox" id="singleExplicit" name="is_single_explicit" class="upload-form__checkbox" value="1" />
                    <label for="singleExplicit" class="upload-form__checkbox-label">
                      This track contains explicit content
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>
            <div class="upload-form__actions">
              <button type="submit" class="upload-form__submit-button">
                <img src="../images/upload.svg" alt="Upload" class="upload-form__submit-icon" />
                Upload Single
              </button>
            </div>
          </form>
          <form 
            id="albumForm" 
            class="upload-form upload-form--album" 
            enctype="multipart/form-data"
            method="POST" 
            action="../includes/upload-album.php"
          >
            <h2 class="upload-form__title">
              <img src="../images/album-purple.svg" alt="Album" class="upload-form__title-icon" />
              Upload Album
            </h2>
            <div class="upload-form__grid">
              <div class="upload-form__column">
                <h3 class="upload-form__section-title">
                  <img src="../images/palette.svg" alt="Palette" class="upload-form__section-icon" />
                  Album Vinyl Preview
                </h3>
                <div class="upload-form__vinyl-preview">
                  <div class="vinyl-preview" id="albumVinylPreview"></div>
                  <div class="upload-form__color-pickers">
                    <fieldset class="upload-form__color-picker">
                      <legend>Primary Vinyl Color</legend>
                      <label for="albumPrimaryColor" class="upload-form__color-label">Primary Vinyl Color</label>
                      <input 
                        type="color" 
                        id="albumPrimaryColor" 
                        name="album_vinyl_primary_color" 
                        class="upload-form__color-input" 
                        value="#2a2928" 
                      />
                    </fieldset>
                    <fieldset class="upload-form__color-picker">
                      <legend>Secondary Vinyl Color</legend>
                      <label for="albumSecondaryColor" class="upload-form__color-label">Secondary Vinyl Color</label>
                      <input 
                        type="color" 
                        id="albumSecondaryColor" 
                        name="album_vinyl_secondary_color" 
                        class="upload-form__color-input" 
                        value="#605f5f" 
                      />
                    </fieldset>
                  </div>
                </div>
              </div>
              <div class="upload-form__column upload-form__column--wide">
                <fieldset class="upload-form__field">
                  <legend>Album Title</legend>
                  <label for="albumTitle" class="upload-form__label">Album Title*</label>
                  <input
                    type="text"
                    id="albumTitle"
                    class="upload-form__input"
                    name="album_title"
                    required
                    placeholder="Enter album title"
                  />
                </fieldset>
                <fieldset class="upload-form__section">
                  <legend>Album Cover</legend>
                  <label for="albumCoverInput" class="upload-form__label">Album Cover*</label>
                  <div class="upload-form__file-upload" id="albumCoverUpload">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      id="albumCoverInput"
                      name="album_cover_image"
                      class="upload-form__file-input"
                      required
                    />
                    <div class="upload-form__file-placeholder">
                      <img src="../images/image-silver.svg" alt="Image" class="upload-form__file-icon" />
                      <p class="upload-form__file-name">Choose cover image</p>
                      <p class="upload-form__file-info">JPG, PNG, or WEBP up to 10MB</p>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
            <div class="upload-form__track-manager">
              <div class="upload-form__track-manager-header">
                <h3 class="upload-form__track-manager-title">Album Tracks</h3>
                <button type="button" class="upload-form__add-track-button" id="addTrackBtn">
                  <img src="../images/plus.svg" alt="Add" class="upload-form__add-track-icon" />
                  Add Track
                </button>
              </div>
              <div class="upload-form__track-list" id="trackList"></div>
              <div class="upload-form__track-empty" id="emptyTrackList">
                <div class="upload-form__track-empty-icon">
                  <img src="../images/add.svg" alt="Add Track" />
                </div>
                <p class="upload-form__track-empty-title">No tracks added yet</p>
                <p class="upload-form__track-empty-subtitle">
                  Click "Add Track" to get started with your album
                </p>
              </div>
            </div>
            <div id="albumHiddenInputs" style="display: none;"></div>
            <div class="upload-form__actions">
              <button type="submit" class="upload-form__submit-button">
                <img src="../images/upload.svg" alt="Upload" class="upload-form__submit-icon" />
                Upload Album
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
    <template id="trackTemplate">
      <div class="track">
        <div class="track__header">
          <div class="track__number">
            <span class="track__number-text"></span>
          </div>
          <span class="track__title">Track <span class="track__index"></span></span>
          <div class="track__actions">
            <button type="button" class="track__btn track__btn--move-up" title="Move Up">
              <img src="../images/up.svg" alt="Move Up" />
            </button>
            <button type="button" class="track__btn track__btn--move-down" title="Move Down">
              <img src="../images/down.svg" alt="Move Down" />
            </button>
            <button type="button" class="track__btn track__btn--remove" title="Remove Track">
              <img src="../images/trash.svg" alt="Remove" />
            </button>
          </div>
        </div>
        <div class="track__content">
          <div class="track__grid">
            <div class="track__field">
              <label class="track__label">Track Title*</label>
              <input
                type="text"
                class="track__input track__input--title"
                required
                placeholder="Enter track title"
              />
            </div>
            <div class="track__field">
              <label class="track__label">Audio File*</label>
              <input
                type="file"
                accept=".mp3"
                class="track__input track__input--audio"
                required
              />
            </div>
          </div>
          <div class="track__field-group">
            <div class="track__field">
              <label for="artistSearch" class="track__label">Featured Artists (Optional)</label>
              <div class="track__multi-select track__multi-select--artists"></div>
            </div>
            <div class="track__field">
              <div class="track__checkbox-field">
                <input type="checkbox" class="track__checkbox track__checkbox--explicit" value="1" />
                <label>This track contains explicit content</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <script src="../scripts/upload.js"></script>
  </body>
</html>