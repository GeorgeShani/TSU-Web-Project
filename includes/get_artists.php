<?php
require_once __DIR__ . "/db.php";

session_start();
header('Content-Type: application/json');

$currentArtistId = (int) $_SESSION['user_id'];

$stmt = $pdo->prepare("
  SELECT artists.id, artists.stage_name, users.profile_picture as avatar_url FROM artists
  JOIN users ON users.artist_id = artists.id
  WHERE users.id != :currentArtistId
");

$stmt->bindParam(':currentArtistId', $currentArtistId, PDO::PARAM_INT);
$stmt->execute();

$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($results as &$artist) {
  $artist['id'] = (string) $artist['id'];
}


echo json_encode($results, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);