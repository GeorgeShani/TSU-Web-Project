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
      CONCAT(
        main_artist.stage_name,
        CASE 
          WHEN GROUP_CONCAT(DISTINCT 
                  CASE 
                    WHEN artists.id != main_artist.id THEN artists.stage_name 
                    ELSE NULL 
                  END 
                  ORDER BY artists.id SEPARATOR ', ') IS NOT NULL 
          THEN CONCAT(', ', GROUP_CONCAT(DISTINCT 
                  CASE 
                    WHEN artists.id != main_artist.id THEN artists.stage_name 
                    ELSE NULL 
                  END 
                  ORDER BY artists.id SEPARATOR ', '))
          ELSE ''
        END
      ) AS all_artists
    FROM tracks
    LEFT JOIN albums ON tracks.album_id = albums.id
    JOIN artists AS main_artist ON tracks.artist_id = main_artist.id
    LEFT JOIN track_features ON track_features.track_id = tracks.id
    LEFT JOIN artists ON artists.id = track_features.artist_id
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
      CONCAT(
        main_artist.stage_name,
        IF(COUNT(DISTINCT features.id) > 0, CONCAT(', ', GROUP_CONCAT(DISTINCT features.stage_name ORDER BY features.id SEPARATOR ', ')), '')
      ) AS all_artists
    FROM tracks
    LEFT JOIN albums ON tracks.album_id = albums.id
    JOIN artists AS main_artist ON tracks.artist_id = main_artist.id
    LEFT JOIN track_features ON track_features.track_id = tracks.id
    LEFT JOIN artists AS features ON features.id = track_features.artist_id AND features.id != main_artist.id
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
      CONCAT(
        main_artist.stage_name,
        CASE 
          WHEN GROUP_CONCAT(DISTINCT 
                  CASE 
                    WHEN artists.id != main_artist.id THEN artists.stage_name 
                    ELSE NULL 
                  END 
                  ORDER BY artists.id SEPARATOR ', ') IS NOT NULL 
          THEN CONCAT(', ', GROUP_CONCAT(DISTINCT 
                  CASE 
                    WHEN artists.id != main_artist.id THEN artists.stage_name 
                    ELSE NULL 
                  END 
                  ORDER BY artists.id SEPARATOR ', '))
          ELSE ''
        END
      ) AS all_artists
    FROM playlist_items
    JOIN tracks ON playlist_items.track_id = tracks.id
    LEFT JOIN albums ON tracks.album_id = albums.id
    JOIN artists AS main_artist ON tracks.artist_id = main_artist.id
    LEFT JOIN track_features ON track_features.track_id = tracks.id
    LEFT JOIN artists ON artists.id = track_features.artist_id
    WHERE playlist_items.playlist_id = ?
    GROUP BY tracks.id
    ORDER BY order_index ASC;
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