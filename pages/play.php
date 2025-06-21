<?php
  require_once '../includes/db.php';

  $type = $_GET['type'];
  $id = $_GET['id'];

  $music_collection_name = "";
  if ($type === "track") {
    $stmt = $pdo->prepare("SELECT title FROM tracks WHERE id = ?");
    $stmt->execute([$id]);
    $music_collection_name = ($stmt->fetch(PDO::FETCH_ASSOC))['title'] ?? null;
  } 
  if ($type === "album") {
    $stmt = $pdo->prepare("SELECT title FROM albums WHERE id = ?");
    $stmt->execute([$id]);
    $music_collection_name = ($stmt->fetch(PDO::FETCH_ASSOC))['title'] ?? null;
  } elseif ($type === "playlist") {
    $stmt = $pdo->prepare("SELECT title FROM playlists WHERE id = ?");
    $stmt->execute([$id]);
    $music_collection_name = ($stmt->fetch(PDO::FETCH_ASSOC))['title'] ?? null;
  }
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="../images/icon.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../styles/style.css">
    <title>Play | EchoWave | Music Player</title>
  </head>
  <body>
    <div class="background">
      <img src id="background__image" class="background__image" />
      <div class="background__overlay"></div>
    </div>
    <button class="mobile-menu" id="mobile-menu-btn" aria-label="Toggle menu">
      <i class="mobile-menu__icon fas fa-bars"></i>
    </button>
    <div class="mobile-menu__overlay" id="mobile-overlay"></div>
    <main class="player">
      <aside class="player__sidebar" id="sidebar">
        <div class="player__sidebar-container">
          <header class="player__sidebar-header">
            <a href="../index.php" class="player__home-link">
              <i class="player__home-icon fas fa-home"></i>
              <span class="player__home-text">Back to Home</span>
            </a>
            <h2 class="player__title"><?= $music_collection_name ?></h2>
            <p class="player__subtitle" id="track-count"></p>
          </header>
          <div class="player__sidebar-content">
            <?php if ($type !== 'track'): ?>
              <div class="player__track-list" id="track-list"></div>
            <?php else: ?>
              <div class="player__track-message">
                Feel the vibe — hit play and let this single take over your day! 🎧🔥
              </div>  
            <?php endif; ?>
          </div>
        </div>
      </aside>
      <section class="player__main">
        <div class="player__record" id="record">
          <div class="player__album-cover" id="album-cover"></div>
          <div class="player__record-label" id="record-label"></div>
          <div class="player__center-hole"></div>
        </div>
        <div class="player__scroll player__scroll--title">
          <h2 class="player__track-title player__scroll-text" id="title-scroll">Loading track...</h2>
        </div>
        <div class="player__scroll player__scroll--artist">
          <div class="player__artist-info player__scroll-text" id="artist-scroll">
            <img src="../images/explicit.svg" alt="Explicit Content" id="explicit-content" class="player__explicit player__explicit--hidden" />
            <h3 class="player__artist-name" id="artist-text">Loading Artist...</h3>
          </div>
        </div>
        <div class="player__scroll player__scroll--album">
          <h4 class="player__album-name player__scroll-text" id="album-scroll">Loading Album...</h4>
        </div>
        <div class="player__progress" id="player-progress">
          <div class="player__progress-bar" id="progress"></div>
        </div>
        <div class="player__duration">
          <span class="player__time player__time--current" id="current-time">00:00</span>
          <span class="player__time player__time--total" id="duration">00:00</span>
        </div>
        <div class="player__controls">
          <i class="player__control player__control--prev fa-solid fa-backward" title="Previous" id="prev"></i>
          <i class="player__control player__control--play fa-solid fa-play" title="Play" id="play"></i>
          <i class="player__control player__control--next fa-solid fa-forward" title="Next" id="next"></i>
        </div>
      </section>
    </main>
    <script src="../scripts/player.js" defer></script>
  </body>
</html>