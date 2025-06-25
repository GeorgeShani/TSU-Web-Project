<?php
  require_once __DIR__ . "/includes/db.php";

  $stmt = $pdo->prepare("
    SELECT 
      tracks.*,
      GROUP_CONCAT(
        DISTINCT artists.stage_name
        ORDER BY 
          CASE 
            WHEN artists.id = main_artist.id THEN 0 
            ELSE 1 
          END,
          artists.stage_name
        SEPARATOR ', '
      ) AS all_artists

    FROM tracks
    JOIN artists AS main_artist ON tracks.artist_id = main_artist.id

    LEFT JOIN track_features ON track_features.track_id = tracks.id
    LEFT JOIN artists ON artists.id = track_features.artist_id OR artists.id = tracks.artist_id
    WHERE tracks.album_id IS NULL
    GROUP BY tracks.id
  ");
  $stmt->execute();
  $tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $stmt = $pdo->prepare("
    SELECT albums.*, artists.stage_name AS artist_name
    FROM albums JOIN artists ON albums.artist_id = artists.id
  ");
  $stmt->execute();
  $albums = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $stmt = $pdo->prepare("SELECT * FROM playlists");
  $stmt->execute();
  $playlists = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="./images/icon.svg">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="./styles/style.css">
  <title>EchoWave | Music Player</title>
</head>
<body>
  <?php require_once 'components/header.php'; ?>
  <main class="main-content">
    <article class="hero">
      <div class="hero__background"></div>
      <div class="hero__overlay"></div>
      <section class="hero__content">
        <div class="hero__text">
          <h1 class="hero__text-heading">
            Your Music,<br />
            <span class="hero__text-highlight">Your World</span>
          </h1>
          <p class="hero__text-description">
            Discover millions of songs, create playlists, and share your passion for music with the world.
          </p>
        </div>
        <div class="hero__vinyl">
          <div class="hero__vinyl-wrapper">
            <img src="../images/music-4.svg" alt="Music Icon" width="100" height="100">
          </div>
        </div>
      </section>
    </article>
    <article class="featured-section">
      <?php if (count($tracks) > 0): ?>
        <section class="featured-section__category">
          <h2 class="featured-section__title">
            <i class="fas fa-music section-header__icon"></i>
            Recent Tracks
          </h2>
          <div class="featured-section__grid">
            <?php foreach ($tracks as $track): ?>
              <a href="./pages/play.php?type=track&id=<?= $track['id']?>" style="text-decoration: none;">
                <div class="track-card">
                  <div class="track-card__thumbnail">
                    <?php if (isset($track['cover_path'])): ?>
                      <img class="track-card__image" src="<?= $track['cover_path'] ?>" />
                    <?php else: ?>
                      <div class="track-card__cover">
                        <img src="./images/music-4.svg" alt="Music Icon" width="48" height="48">
                      </div>
                    <?php endif; ?>
                    <button class="track-card__play-button">
                      <svg class="track-card__play-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-5.197-3.027A1 1 0 008 9.027v5.946a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.664z" />
                      </svg>
                    </button>
                  </div>
                  <h3 class="track-card__title"><?= $track['title'] ?></h3>
                  <p class="track-card__artist"><?= $track['all_artists'] ?></p>
                </div>
              </a>
            <?php endforeach; ?>
          </div>
        </section>
      <?php endif; ?>
      <?php if (count($albums) > 0): ?>
        <section class="featured-section__category">
          <h2 class="featured-section__title">
            <i class="fas fa-compact-disc section-header__icon section-header__icon--blue"></i>
            Spotlight Albums
          </h2>
          <div class="featured-section__grid">
            <?php foreach ($albums as $album): ?>
              <a href="./pages/play.php?type=album&id=<?= $album['id'] ?>" style="text-decoration: none;">
                <div class="album-card">
                  <div class="album-card__thumbnail">
                    <?php if (isset($album['cover_path'])): ?>
                      <img class="album-card__image" src="<?= $album['cover_path'] ?>" />
                    <?php else: ?>
                      <div class="album-card__cover">
                        <img src="./images/music-4.svg" alt="Music Icon" width="48" height="48">
                      </div>
                    <?php endif; ?>
                    <button class="album-card__play-button">
                      <svg class="album-card__play-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-5.197-3.027A1 1 0 008 9.027v5.946a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.664z" />
                      </svg>
                    </button>
                  </div>
                  <h3 class="album-card__title"><?= $album['title'] ?></h3>
                  <p class="album-card__artist"><?= $album['artist_name'] ?></p>
                  <p class="album-card__year"><?= substr($album['created_at'], 0, 4); ?></p>
                </div>
              </a>
            <?php endforeach; ?>
          </div>
        </section>
      <?php endif; ?>
      <?php if (count($playlists) > 0): ?>
        <section class="featured-section__category">
          <h2 class="featured-section__title">
            <i class="fas fa-list section-header__icon section-header__icon--green"></i>
            Featured Playlists
          </h2>
          <div class="featured-section__grid">
            <?php foreach ($playlists as $playlist): ?>
              <a href="./pages/play.php?type=playlist&id=<?= $playlist['id'] ?>" style="text-decoration: none;">
                <div class="playlist-card">
                  <div class="playlist-card__thumbnail">
                    <?php if (isset($playlist['cover_path'])): ?>
                      <img class="playlist-card__image" src="<?= $playlist['cover_path'] ?>" />
                    <?php else: ?>
                      <div class="playlist-card__cover">
                        <img src="./images/music-4.svg" alt="Music Icon" width="48" height="48">
                      </div>
                    <?php endif; ?>
                    <button class="playlist-card__play-button">
                      <svg class="playlist-card__play-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-5.197-3.027A1 1 0 008 9.027v5.946a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.664z" />
                      </svg>
                    </button>
                  </div>
                  <?php
                    require_once __DIR__ . "/includes/db.php";

                    $stmt = $pdo->prepare("SELECT * FROM playlist_items WHERE playlist_id = ?");
                    $stmt->execute([$playlist['id']]);
                    $playlistTracks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                  ?>
                  <h3 class="playlist-card__title"><?= $playlist['title'] ?></h3>
                  <p class="playlist-card__count"><?= count($playlistTracks) ?> songs</p>
                </div>
              </a>
            <?php endforeach; ?>
          </div>
        </section>
      <?php endif; ?>
    </article>
  </main>
  <script src="./scripts/index.js"></script>
</body>
</html>