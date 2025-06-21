<?php
require_once __DIR__ . '/../includes/auth.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $email = trim($_POST['email'] ?? '');
  $password = $_POST['password'] ?? '';

  if (login($email, $password)) {
    header("Location: ../index.php");
    exit();
  } else {
    $error = 'Invalid email or password.';
  }
}
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="../images/icon.svg">
    <link rel="stylesheet" href="../styles/style.css">
    <title>Log In | EchoWave | Music Player</title>
  </head>
  <body>
    <main class="main-content login">
      <div class="login__container">
        <div class="login__card">
          <div class="login__header">
            <div class="login__brand">
              <div class="login__logo">
                <div class="login__logo-icon">
                  <img src="../images/music.svg" alt="Music Icon" />
                </div>
                <h1 class="login__logo-title">EchoWave</h1>
              </div>
              <h2 class="login__subtitle">Welcome Back 😊</h2>
            </div>
            <form class="login__form" id="loginForm" method="POST" action="">
              <fieldset class="login__field">
                <legend>Email Address</legend>
                <label for="email" class="login__label">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  placeholder="Enter your email"
                  class="login__input login__input--with-email-icon"
                />
              </fieldset>
              <fieldset class="login__field">
                <legend>Password</legend>
                <label for="password" class="login__label">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required 
                  placeholder="Enter your password"
                  class="login__input login__input--with-password-icon"
                />
              </fieldset>
              <button type="submit" class="login__submit">Sign In</button>
            </form>
            <?php if (!empty($error)): ?>
              <p class="login__error"><?= htmlspecialchars($error) ?></p>
            <?php endif; ?>
            <div class="login__footer">
              <p class="login__footer-text">
                Don't have an account?
                <a href="./signup.php" class="login__footer-link">Sign up</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </body>
</html>