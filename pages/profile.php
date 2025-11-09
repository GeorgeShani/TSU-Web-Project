<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="../images/icon.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../styles/style.css">
    <title>Profile | EchoWave | Music Player</title>
  </head>
  <body>
    <?php require_once '../components/header.php'; ?>
    <?php
      require_once __DIR__ . "/../includes/db.php";

      $userId = $_SESSION['user_id'];
      $role = $_SESSION['role'];

      $stmt = $pdo->prepare("
        SELECT artists.*, users.* 
        FROM artists
        JOIN users ON artists.user_id = users.id
        WHERE artists.user_id = ?
      ");
      $stmt->execute([$userId]);
      $artist_data = $stmt->fetch(PDO::FETCH_ASSOC);

      $stmt = $pdo->prepare("
        SELECT 
          tracks.*,
          CONCAT(
            main_artist.stage_name,
            CASE 
              WHEN GROUP_CONCAT(DISTINCT 
                CASE 
                  WHEN artists.id != main_artist.id THEN artists.stage_name 
                  ELSE NULL 
                END 
                ORDER BY artists.id SEPARATOR ', ') IS NOT NULL 
              THEN CONCAT(', ', GROUP_CONCAT(DISTINCT 
                CASE 
                  WHEN artists.id != main_artist.id THEN artists.stage_name 
                  ELSE NULL 
                END 
                ORDER BY artists.id SEPARATOR ', '))
              ELSE ''
            END
          ) AS all_artists
        FROM tracks
        JOIN artists AS main_artist ON tracks.artist_id = main_artist.id
        LEFT JOIN track_features ON track_features.track_id = tracks.id
        LEFT JOIN artists ON artists.id = track_features.artist_id
        WHERE tracks.artist_id = ? AND tracks.album_id IS NULL
        GROUP BY tracks.id;
      ");
      $stmt->execute([$artist_data['artist_id']]);
      $tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);

      $stmt = $pdo->prepare("SELECT * FROM albums WHERE artist_id = ?");
      $stmt->execute([$artist_data['artist_id']]);
      $albums = $stmt->fetchAll(PDO::FETCH_ASSOC);

      $stmt = $pdo->prepare("SELECT * FROM playlists WHERE user_id = ?");
      $stmt->execute([$userId]);
      $playlists = $stmt->fetchAll(PDO::FETCH_ASSOC);

      $stats = [];
      if (count($tracks) > 0) {
        $trackCount = count($tracks);
        $stats[] = "$trackCount public singles";
      }

      if (count($albums) > 0) {
        $albumsCount = count($albums);
        $stats[] = "$albumsCount public albums";
      }

      if (count($playlists) > 0) {
        $playlistsCount = count($playlists);
        $stats[] = "$playlistsCount public playlists";
      }

      $statsText = implode(' • ', $stats);
    ?>
    <main class="main-content">
      <div class="profile">
        <section class="profile__header">
          <div class="profile__header-content">
            <div class="profile__header-avatar">
              <?php if (isset($artist_data['profile_picture'])): ?>
                <img src="<?= $artist_data['profile_picture'] ?>" alt="User Photo" class="image" />
              <?php else: ?>
                <div class="avatar">
                  <i class="fas fa-music avatar__icon"></i>
                </div>
              <?php endif; ?>
            </div>
            <div class="profile__info">
              <h1 class="profile__name">
                <?php if (isset($artist_data['stage_name']) || $artist_data['stage_name'] !== ""): ?>
                  <?= $artist_data['stage_name'] ?> 
                <?php else: ?>
                  <?= $artist_data['full_name'] ?>
                <?php endif; ?>
              </h1>
              <p class="profile__stats" style="font-weight: 600;"><?= "@" . $artist_data['username'] ?></p>
              <p class="profile__stats">
                <?= ucfirst($role) ?> 
                <?php if (isset($statsText) || $statsText !== ""): ?>
                  • <?= $statsText ?>
                <?php endif; ?>
              </p>
              <div class="profile__actions">
                <button class="profile__btn profile__btn--outline" id="editProfileBtn">
                  <i class="fas fa-edit"></i>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </section>
        <section class="profile__form profile__form--hidden" id="editForm">
          <div class="profile-form">
            <div class="profile-form__header">
              <h2 class="profile-form__title">
                <i class="fas fa-edit"></i>
                Edit Profile
              </h2>
            </div>
            <div class="profile-form__content">
            <form class="form" id="profileForm" method="post" enctype="multipart/form-data" action="../includes/update-profile.php">
                <div class="form__group">
                  <label for="stageName" class="form__label">Stage Name</label>
                  <input 
                    type="text" 
                    id="stageName" 
                    class="form__input" 
                    name="stage_name"
                    value="<?= htmlspecialchars($artist_data['stage_name'] ?? '') ?>"
                    placeholder="Enter your stage name"
                  />
                </div>

                <div class="form__group">
                  <label for="biography" class="form__label">Biography</label>
                  <textarea 
                    id="biography" 
                    class="form__input" 
                    name="bio"
                    placeholder="Tell us more about yourself"
                  >
                    <?= htmlspecialchars($artist_data['bio'] ?? '') ?>
                  </textarea>
                </div>
                <div class="form__group">
                  <label for="profilePicture" class="form__label">Profile Picture</label>
                  <div class="form__file-wrapper">
                    <input type="file" id="profilePicture" class="form__file" name="profile_image" accept="image/*">
                  </div>
                </div>
                <div class="form__actions">
                  <button type="submit" class="button button--gradient">
                    <i class="fas fa-save"></i>
                    Save Changes
                  </button>
                  <button type="button" class="button button--outline" id="cancelEditBtn">
                    <i class="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
        <?php if (count($tracks) > 0): ?>
          <section class="profile__content-section">
            <div class="section-header">
              <i class="fas fa-music section-header__icon"></i>
              <h2 class="section-header__title">Your Tracks</h2>
              <span class="section-header__count">(<?= count($tracks) ?>)</span>
            </div>
            <div class="profile__tracks-grid">
              <?php foreach ($tracks as $track): ?>
                <a href="./play.php?type=track&id=<?= $track['id'] ?>" class="track-card__link">
                  <article class="track-card">
                    <div class="track-card__cover">
                      <img src="<?= $track['cover_path'] ?>" alt="<?= $track['title'] ?>" class="track-card__image">
                      <div class="track-card__overlay">
                        <button class="play-button">
                          <i class="fas fa-play"></i>
                        </button>
                      </div>
                    </div>
                    <div class="track-card__info">
                      <h3 class="track-card__title"><?= $track['title'] ?></h3>
                      <h3 class="track-card__artist"><?= $track['all_artists'] ?></h3>
                    </div>
                  </article>
                </a>
              <?php endforeach; ?>
            </div>
          </section>
        <?php endif ?>
        <?php if (count($albums) > 0): ?>
          <section class="profile__content-section">
            <div class="section-header">
              <i class="fas fa-compact-disc section-header__icon"></i>
              <h2 class="section-header__title">Your Albums</h2>
              <span class="section-header__count">(<?= count($albums) ?>)</span>
            </div>
            <div class="profile__albums-grid">
              <?php foreach ($albums as $album): ?>
              <a href="./play.php?type=album&id=<?= $album['id'] ?>" class="track-card__link">
                <article class="album-card">
                  <div class="album-card__cover">
                    <img src="<?= $album['cover_path'] ?>" alt="<?= $album['title'] ?>" class="album-card__image">
                    <div class="album-card__overlay">
                      <button class="play-button">
                        <i class="fas fa-play"></i>
                      </button>
                    </div>
                  </div>
                  <div class="album-card__info">
                    <h3 class="album-card__title"><?= $album['title'] ?></h3>
                    <div class="album-card__details">
                      <?php
                        require_once __DIR__ . "/../includes/db.php";
                        $stmt = $pdo->prepare("SELECT * FROM tracks WHERE album_id = ?");
                        $stmt->execute([$album["id"]]);
                        $album_tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                      ?>
                      <p><?= count($album_tracks) ?> tracks</p>
                      <p><?= substr($album['created_at'], 0, 4); ?></p>
                    </div>
                  </div>
                </article>
              </a>
              <?php endforeach; ?>
            </div>
          </section>
        <?php endif ?>
        <?php if (count($playlists) > 0): ?>
          <section class="profile__content-section">
            <div class="section-header">
              <i class="fas fa-list section-header__icon section-header__icon--green"></i>
              <h2 class="section-header__title">Your Playlists</h2>
              <span class="section-header__count">(<?= count($playlists)?>)</span>
            </div>
            <div class="profile__playlists-grid">
              <?php foreach($playlists as $playlist): ?>
                <a href="./play.php?type=playlist&id=<?= $playlist['id']?>" class="track-card__link">
                  <article class="playlist-card">
                    <div class="playlist-card__cover">
                      <img src="<?= $playlist['cover_path'] ?>" alt="<?= $playlist['title'] ?>" class="playlist-card__image">
                      <div class="playlist-card__overlay">
                        <button class="play-button">
                          <i class="fas fa-play"></i>
                        </button>
                      </div>
                    </div>
                    <div class="playlist-card__info">
                      <h3 class="playlist-card__title"><?= $playlist['title'] ?></h3>
                      <div class="playlist-card__details">
                        <?php
                        require_once __DIR__ . "/../includes/db.php";
                          $stmt = $pdo->prepare("SELECT * FROM playlist_items WHERE playlist_id = ?");
                          $stmt->execute([$playlist["id"]]);
                          $playlist_tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        ?>
                        <p><?= count($playlist_tracks) ?> tracks</p>
                      </div>
                    </div>
                  </article>
                </a>
              <?php endforeach; ?>
            </div>
          </section>
        <?php endif ?>
      </div>
    </main>
    <script src="../scripts/profile.js"></script>
    <script src="../scripts/index.js"></script>
  </body>
</html>