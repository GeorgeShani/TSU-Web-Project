<?php
session_start();
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/aws_s3.php";

$userId = $_SESSION['user_id'];
$artistUsername = $_SESSION['username'];
$audio_upload_dir = "uploads/$artistUsername/audio";
$image_upload_dir = "uploads/$artistUsername/covers";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  try {
    $title = $_POST['single_track_title'];
    $primaryColor = $_POST['single_vinyl_primary_color'];
    $secondaryColor = $_POST['single_vinyl_secondary_color'];
    $featuredArtists = $_POST['single_featured_artists'] ?? [];
    $isExplicit = isset($_POST['is_single_explicit']) && $_POST['is_single_explicit'] === "1" ? 1 : 0;

    $audioFile = $_FILES['single_audio_file'];
    $imageFile = $_FILES['single_cover_image'];

    if (!$title || !isset($audioFile) || !isset($imageFile)) {
      throw new Exception("Missing required fields");
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT * FROM artists WHERE user_id = ?");
    $stmt->execute([$userId]);
    $artist_data = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$artist_data) {
      throw new Exception("Artist not found for user ID: $userId");
    }

    $artistID = $artist_data['id'];

    // Upload files BEFORE the insert, but be ready to handle rollback
    $audioUrl = uploadFileToS3($audioFile, $audio_upload_dir, $bucket, $s3Client);
    $imageUrl = uploadFileToS3($imageFile, $image_upload_dir, $bucket, $s3Client);

    $stmt = $pdo->prepare("
      INSERT INTO tracks (title, audio_path, cover_path, artist_id, vinyl_primary_color, vinyl_secondary_color, includes_explicit_content, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$title, $audioUrl, $imageUrl, $artistID, $primaryColor, $secondaryColor, $isExplicit]);
    $trackId = $pdo->lastInsertId();

    if (!empty($featuredArtists)) {
      $stmtArtist = $pdo->prepare("INSERT INTO track_features (track_id, artist_id) VALUES (?, ?)");
      foreach ($featuredArtists as $featuredId) {
        $stmtArtist->execute([$trackId, (int) $featuredId]);
      }
    }

    $pdo->commit();
    error_log("Track inserted successfully!");
    header("Location: ../pages/profile.php");
    exit;
  } catch (Exception $e) {
    $pdo->rollBack();
    error_log(json_encode(['error' => $e->getMessage()]));
  }
}
