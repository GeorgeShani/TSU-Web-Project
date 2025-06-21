<?php
require_once __DIR__ . "/db.php";

$type = $_GET['type'] ?? null;
$id = (int)$_GET['id'] ?? null;

if (!$type || !$id || !in_array($type, ['track', 'album', 'playlist'])) {
  echo json_encode(['error' => 'Invalid type or missing ID']);
  exit;
}

$sql_query = "";

if ($type === "track") {
  $sql_query = "
    SELECT 
      tracks.id AS track_id,
      tracks.title AS track_title,
      tracks.audio_path,
      tracks.cover_path,
      tracks.includes_explicit_content,
      tracks.vinyl_primary_color,
      tracks.vinyl_secondary_color,
      albums.title AS album_title,
      GROUP_CONCAT(
        DISTINCT artists.stage_name
        ORDER BY 
          CASE WHEN artists.id = main_artist.id THEN 0 ELSE 1 END,
          artists.stage_name
        SEPARATOR ', '
      ) AS all_artists
    FROM tracks
    LEFT JOIN albums ON tracks.album_id = albums.id
    JOIN artists AS main_artist ON tracks.artist_id = main_artist.id
    LEFT JOIN track_features ON track_features.track_id = tracks.id
    LEFT JOIN artists ON artists.id = track_features.artist_id OR artists.id = tracks.artist_id
    WHERE tracks.id = ?
    GROUP BY tracks.id
    LIMIT 1
  ";
} elseif ($type === "album") {
  $sql_query = "
    SELECT 
      tracks.id AS track_id,
      tracks.title AS track_title,
      tracks.audio_path,
      tracks.cover_path,
      tracks.includes_explicit_content,
      tracks.vinyl_primary_color,
      tracks.vinyl_secondary_color,
      albums.title AS album_title,
      GROUP_CONCAT(
        DISTINCT artists.stage_name
        ORDER BY 
          CASE WHEN artists.id = main_artist.id THEN 0 ELSE 1 END,
          artists.stage_name
        SEPARATOR ', '
      ) AS all_artists
    FROM tracks
    LEFT JOIN albums ON tracks.album_id = albums.id
    JOIN artists AS main_artist ON tracks.artist_id = main_artist.id
    LEFT JOIN track_features ON track_features.track_id = tracks.id
    LEFT JOIN artists ON artists.id = track_features.artist_id OR artists.id = tracks.artist_id
    WHERE albums.id = ?
    GROUP BY tracks.id
    ORDER BY tracks.id ASC
  ";
} elseif ($type === "playlist") {
  $sql_query = "
    SELECT 
      tracks.id AS track_id,
      tracks.title AS track_title,
      tracks.audio_path,
      tracks.cover_path,
      tracks.includes_explicit_content,
      tracks.vinyl_primary_color,
      tracks.vinyl_secondary_color,
      albums.title AS album_title,
      ANY_VALUE(playlist_items.order_index) AS order_index,
      GROUP_CONCAT(
        DISTINCT artists.stage_name
        ORDER BY 
          CASE WHEN artists.id = main_artist.id THEN 0 ELSE 1 END,
          artists.stage_name
        SEPARATOR ', '
      ) AS all_artists
    FROM playlist_items
    JOIN tracks ON playlist_items.track_id = tracks.id
    LEFT JOIN albums ON tracks.album_id = albums.id
    JOIN artists AS main_artist ON tracks.artist_id = main_artist.id
    LEFT JOIN track_features ON track_features.track_id = tracks.id
    LEFT JOIN artists ON artists.id = track_features.artist_id OR artists.id = tracks.artist_id
    WHERE playlist_items.playlist_id = ?
    GROUP BY tracks.id
    ORDER BY order_index ASC
  ";
}

$stmt = $pdo->prepare($sql_query);
$stmt->execute([$id]);

$tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);
$defaultCoverUrl = "../images/Default Playlist Cover.png";

$trackList = array_map(fn($track) => [
  'id' => (string) $track['track_id'],
  'title' => $track['track_title'],
  'artist' => $track['all_artists'],
  'album' => $track['album_title'] ?? null,
  'audioUrl' => $track['audio_path'] ?: null,
  'coverUrl' => $track['cover_path'] ?: $defaultCoverUrl,
  'explicit' => (bool) $track['includes_explicit_content'],
  'colors' => [
    $track['vinyl_primary_color'] ?? "#000000",
    $track['vinyl_secondary_color'] ?? "#FFFFFF"
  ]
], $tracks);

header('Content-Type: application/json');
echo json_encode($trackList, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);