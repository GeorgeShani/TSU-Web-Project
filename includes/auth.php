<?php
session_start();
require_once __DIR__ . '/db.php';

function login($email, $password)
{
  global $pdo;

  $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
  $stmt->execute([$email]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($user && password_verify($password, $user['password_hash'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    return true;
  }

  return false;
}

function register($full_name, $username, $email, $password, $role = 'listener')
{
  global $pdo;

  $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare("INSERT INTO users (full_name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)");
  return $stmt->execute([$full_name, $username, $email, $hashedPassword, $role]);
}

function isLoggedIn()
{
  return isset($_SESSION['user_id']);
}

function isArtist()
{
  return isset($_SESSION['role']) && $_SESSION['role'] === 'artist';
}

function logout()
{
  session_start();
  $_SESSION = [];
  session_destroy();
  header("Location: ../pages/login.php");
  exit();
}