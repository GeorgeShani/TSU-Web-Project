<?php
session_start();
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/aws_s3.php";

$userId = $_SESSION['user_id'];
$artistUsername = $_SESSION['username'];
$audio_upload_dir = "uploads/$artistUsername/audio";
$image_upload_dir = "uploads/$artistUsername/covers";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $album_title = $_POST['album_title'];
  $album_cover_image = $_FILES['album_cover_image'];
  $album_vinyl_primary_color = $_POST['album_vinyl_primary_color'];
  $album_vinyl_secondary_color = $_POST['album_vinyl_secondary_color'];

  $album_tracks = array_values($_POST['tracks']);
  $album_audio_files = $_FILES['audio_files'];

  $stmt = $pdo->prepare("SELECT * FROM artists WHERE user_id = ?");
  $stmt->execute([$userId]);
  $artist_data = $stmt->fetch(PDO::FETCH_ASSOC);
  $artistID = $artist_data["id"];

  try {
    $pdo->beginTransaction();

    $album_cover_url = uploadFileToS3($album_cover_image, $image_upload_dir, $bucket, $s3Client);

    $stmt = $pdo->prepare("
      INSERT INTO albums(title, cover_path, artist_id, created_at)
      VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$album_title, $album_cover_url, $artistID]);
    $albumID = $pdo->lastInsertId();

    foreach ($album_tracks as $index => $track) {
      $title = $track['title'];
      $isExplicit = isset($track['is_explicit']) && $track['is_explicit'] === "1" ? 1 : 0;
      $featuredArtists = $track['featured_artists'] ?? [];
      $trackOrderIndex = $index;

      $audioFile = [
        'name' => $album_audio_files['name'][$index],
        'type' => $album_audio_files['type'][$index],
        'tmp_name' => $album_audio_files['tmp_name'][$index],
        'error' => $album_audio_files['error'][$index],
        'size' => $album_audio_files['size'][$index],
      ];

      $audioUrl = uploadFileToS3($audioFile, $audio_upload_dir, $bucket, $s3Client);

      $stmt = $pdo->prepare("
        INSERT INTO tracks(title, audio_path, cover_path, album_id, artist_id, order_index, vinyl_primary_color, vinyl_secondary_color, includes_explicit_content, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ");
      $stmt->execute([$title, $audioUrl, $album_cover_url, $albumID, $artistID, $trackOrderIndex, $album_vinyl_primary_color, $album_vinyl_secondary_color, $isExplicit]);
      $trackId = $pdo->lastInsertId();

      foreach ($featuredArtists as $artistId) {
        $stmt = $pdo->prepare("INSERT INTO track_features(track_id, artist_id) VALUES (?, ?)");
        $stmt->execute([$trackId, (int) $artistId]);
      }
    }

    $pdo->commit();
    error_log("Album inserted successfully");
    header("Location: ../pages/profile.php");
    exit;
  } catch (Exception $e) {
    $pdo->rollBack();
    error_log("Upload album failed: " . $e->getMessage());
  }
}