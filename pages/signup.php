<?php
require_once __DIR__ . '/../includes/auth.php';

$error = '';
$success = '';

function check_password($password)
{
  if (strlen($password) < 8) {
    return "Password must be at least 8 characters long.";
  } elseif (!preg_match('/[A-Z]/', $password)) {
    return "Password must include at least one uppercase letter.";
  } elseif (!preg_match('/[a-z]/', $password)) {
    return "Password must include at least one lowercase letter.";
  } elseif (!preg_match('/[0-9]/', $password)) {
    return "Password must include at least one number.";
  } elseif (!preg_match('/[\W_]/', $password)) {
    return "Password must include at least one special character.";
  }

  return null; // password is valid
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $full_name = trim($_POST['full_name'] ?? '');
  $username = trim($_POST['username'] ?? '');
  $email = trim($_POST['email'] ?? '');
  $password = $_POST['password'] ?? '';
  $confirmPassword = $_POST['confirmPassword'] ?? '';
  $role = $_POST['role'] ?? 'listener';

  if (empty($full_name) || empty($username) || empty($email) || empty($password)) {
    $error = "All fields are required.";
  } elseif ($password !== $confirmPassword) {
    $error = "Passwords do not match.";
  } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $error = "Invalid email format.";
  } else {
    $passwordError = check_password($password);
    if ($passwordError !== null) {
      $error = $passwordError;
    } else {
      if (register($full_name, $username, $email, $password, $role)) {
        $success = "Account created successfully. Redirecting to login...";
        ob_start();
        header("refresh:2;url=./login.php");
        ob_end_flush();
      } else {
        $error = "Failed to create account. Email may already be registered.";
      }
    }
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
    <title>Sign Up | EchoWave | Music Player</title>
  </head>
  <body>
    <main class="main-content signup">
      <div class="signup__container">
        <div class="signup__card">
          <div class="signup__header">
            <div class="signup__logo">
              <div class="signup__logo-icon">
                <img src="../images/music.svg" alt="Music Icon" />
              </div>
              <h1 class="signup__logo-title">EchoWave</h1>
            </div>
            <h2 class="signup__subtitle">Create Your Account 🎵</h2>
          </div>
          <form class="signup__form" id="signupForm" method="POST" action="">
            <fieldset class="signup__field">
              <legend>Full Name</legend>
              <label for="full_name" class="signup__label">Full Name</label>
              <input 
                type="text" 
                id="full_name" 
                name="full_name" 
                required 
                pattern="^[a-zA-Z]{2,}( [a-zA-Z]{2,}){0,4}$"
                placeholder="Enter your full name" 
                class="signup__input signup__input--with-user-icon" 
              />
            </fieldset>
            <fieldset class="signup__field">
              <legend>Usernsame</legend>
              <label for="username" class="signup__label">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                required 
                pattern="^(?=[a-zA-Z_])[a-zA-Z0-9_]{3,20}$"
                placeholder="Enter your username" 
                class="signup__input signup__input--with-user-icon" 
              />
            </fieldset>
            <fieldset class="signup__field">
              <legend>Email Address</legend>
              <label for="email" class="signup__label">Email Address</label>
              <input 
                type="email" 
                id="email"
                name="email" 
                required 
                placeholder="Enter your email" 
                class="signup__input signup__input--with-email-icon" 
              />
            </fieldset>
            <fieldset class="signup__field">
              <legend>Password</legend>
              <label for="password" class="signup__label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                minlength="8"
                placeholder="Create a password" 
                class="signup__input signup__input--with-password-icon" 
              />
            </fieldset>
            <fieldset class="signup__field">
              <legend>Confirm Password</legend>
              <label for="confirmPassword" class="signup__label">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                required
                placeholder="Confirm your password" 
                class="signup__input signup__input--with-password-icon" 
              />
            </fieldset>
            <fieldset class="signup__field">
              <legend>Account Type</legend>
              <label for="role" class="signup__label">Account Type</label>
              <select id="role" name="role" class="signup__select">
                <option value="listener">Listener</option>
                <option value="artist">Artist</option>
              </select>
            </fieldset>
            <button type="submit" class="signup__submit">
              Create Account
            </button>
          </form>
          <?php if ($error): ?>
            <p class="signup__error"><?= htmlspecialchars($error) ?></p>
          <?php elseif ($success): ?>
            <p class="signup__success"><?= htmlspecialchars($success) ?></p>
          <?php endif; ?>
          <div class="signup__footer">
            <p class="signup__footer-text">
              Already have an account?
              <a href="./login.php" class="signup__footer-link">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  </body>
</html>