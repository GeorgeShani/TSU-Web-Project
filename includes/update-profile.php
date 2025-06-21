<?php
session_start();
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/aws_s3.php";

$userId = $_SESSION["user_id"];
$artistUsername = $_SESSION["username"];
$image_upload_dir = "uploads/$artistUsername/profile";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $stage_name = isset($_POST["stage_name"]) && trim($_POST["stage_name"]) !== "" 
                ? trim($_POST["stage_name"]) 
                : null;

  $biography = isset($_POST["bio"]) && trim($_POST["bio"]) !== "" 
               ? trim($_POST["bio"]) 
               : null;

  $profile_image_url = null;
  if (
    isset($_FILES["profile_image"]) &&
    is_uploaded_file($_FILES["profile_image"]["tmp_name"]) &&
    $_FILES["profile_image"]["error"] === UPLOAD_ERR_OK
  ) {
    $profile_image = $_FILES["profile_image"];
    $profile_image_url = uploadFileToS3($profile_image, $image_upload_dir, $bucket, $s3Client);

    $stmt = $pdo->prepare("UPDATE users SET profile_picture = ? WHERE id = ?");
    $stmt->execute([$profile_image_url, $userId]);
  }

  $stmt = $pdo->prepare("UPDATE artists SET stage_name = ?, bio = ? WHERE user_id = ?");
  $stmt->execute([$stage_name, $biography, $userId]);

  header("Location: ../pages/profile.php");
}