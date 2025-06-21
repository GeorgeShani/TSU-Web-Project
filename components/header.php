<?php
  session_start();
  $baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/';
  $userRole = $_SESSION['role'] ?? header('Location: ../pages/login.php');

  function isActive($expectedPath)
  {
    $currentPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    return $currentPath === "/$expectedPath" ? 'sidebar__link--active' : '';
  }
?>

<button class="sidebar__toggle-button">
  <svg class="sidebar__icon" id="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
</button>
<div class="sidebar__overlay hidden"></div>
<header class="sidebar sidebar--open">
  <div class="sidebar__content">
    <div class="sidebar__logo">
      <div class="sidebar__logo-icon">
        <img src="<?= $baseUrl ?>images/music.svg" alt="Music Icon" class="sidebar__music-icon" />
      </div>
      <h1 class="sidebar__logo-title">EchoWave</h1>
    </div>
    <nav class="sidebar__nav">
      <ul class="sidebar__links">
        <li class="sidebar__link-item">
          <a href="<?= $baseUrl ?>" class="sidebar__link <?= isActive('') ?>">
            <span class="sidebar__link-icon"><img src="<?= $baseUrl ?>images/home.svg" alt="Home" /></span>
            <span class="sidebar__link-text">Home</span>
          </a>
        </li>
        <li class="sidebar__link-item">
          <a href="<?= $baseUrl ?>pages/search.php" class="sidebar__link <?= isActive('pages/search.php') ?>">
            <span class="sidebar__link-icon"><img src="<?= $baseUrl ?>images/search.svg" alt="Search" /></span>
            <span class="sidebar__link-text">Search</span>
          </a>
        </li>
        <li class="sidebar__link-item">
          <a href="<?= $baseUrl ?>pages/profile.php" class="sidebar__link <?= isActive('pages/profile.php') ?>">
            <span class="sidebar__link-icon"><img src="<?= $baseUrl ?>images/user.svg" alt="Profile" /></span>
            <span class="sidebar__link-text">Profile</span>
          </a>
        </li>
        <li class="sidebar__link-item">
          <a href="<?= $baseUrl ?>pages/add-playlist.php" class="sidebar__link <?= isActive('pages/add-playlist.php') ?>">
            <span class="sidebar__link-icon"><img src="<?= $baseUrl ?>images/plus.svg" alt="Profile" /></span>
            <span class="sidebar__link-text">Add Playlist</span>
          </a>
        </li>
        <?php if ($userRole === 'artist'): ?>
        <li class="sidebar__link-item">
          <a href="<?= $baseUrl ?>pages/upload.php" class="sidebar__link">
            <span class="sidebar__link-icon"><img src="<?= $baseUrl ?>images/upload.svg" alt="Upload" /></span>
            <span class="sidebar__link-text">Upload Music</span>
          </a>
        </li>
        <?php endif; ?>
        <li class="sidebar__link-item">
          <a href="<?= $baseUrl ?>includes/logout.php" class="sidebar__link">
            <span class="sidebar__link-icon"><img src="<?= $baseUrl ?>images/logout.svg" alt="Log Out" /></span>
            <span class="sidebar__link-text">Log Out</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</header>