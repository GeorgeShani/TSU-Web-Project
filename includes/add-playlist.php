<?php
session_start();
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/aws_s3.php";

$userId = $_SESSION['user_id'];
$artistUsername = $_SESSION['username'];
$image_upload_dir = "uploads/$artistUsername/covers";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  try {
    $playlist_name = $_POST['playlist_name'];
    $playlist_cover = $_FILES['playlist_cover'];
    $playlist_tracks = json_decode($_POST['selected_tracks'] ?? '[]', true);

    if (!$playlist_name || !isset($playlist_cover) || !isset($playlist_tracks)) {
      throw new Exception("Missing required fields");
    }

    $pdo->beginTransaction();

    $playlist_cover_url = uploadFileToS3($playlist_cover, $image_upload_dir, $bucket, $s3Client);

    $stmt = $pdo->prepare("
      INSERT INTO playlists(title, user_id, cover_path, created_at)
      VALUES(?, ?, ?, NOW())
    ");
    $stmt->execute([$playlist_name, $userId, $playlist_cover_url]);
    
    $playlistId = $pdo->lastInsertId();

    foreach ($playlist_tracks as $index => $trackId) {
      $trackId = (int)$trackId;
      $stmt = $pdo->prepare("
        INSERT INTO playlist_items(playlist_id, track_id, order_index)
        VALUES (?, ?, ?)
      ");

      $stmt->execute([$playlistId, $trackId, $index]);
    }
    
    $pdo->commit();
    error_log("Playlist added successfully!");
    header("Location: ../pages/profile.php");
    exit;
  } catch (Exception $e) {
    $pdo->rollBack();
    error_log(json_encode(['error' => $e->getMessage()]));
  }
}