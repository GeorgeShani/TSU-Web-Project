<?php
require_once __DIR__ . "/db.php";

$stmt = $pdo->prepare("
  SELECT 
    CAST(tracks.id AS CHAR) AS id,
    tracks.title AS title,
    GROUP_CONCAT(
      DISTINCT artists.stage_name
      ORDER BY 
        CASE 
          WHEN artists.id = main_artist.id THEN 0 
          ELSE 1 
        END,
        artists.stage_name
      SEPARATOR ', '
    ) AS artist,
    albums.title AS album,
    tracks.cover_path AS cover_url

  FROM tracks
  LEFT JOIN albums ON tracks.album_id = albums.id
  JOIN artists AS main_artist ON tracks.artist_id = main_artist.id
  LEFT JOIN track_features ON track_features.track_id = tracks.id
  LEFT JOIN artists ON artists.id = track_features.artist_id OR artists.id = tracks.artist_id

  GROUP BY tracks.id
");

$stmt->execute();
$tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($tracks, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);