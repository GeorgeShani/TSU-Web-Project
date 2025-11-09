<?php
require_once __DIR__ . "/db.php";

// 1. Fetch Tracks with Artist and Album Info
$tracksQuery = "
  SELECT 
    tracks.id AS track_id,
    tracks.title AS track_title,
    tracks.audio_path,
    tracks.cover_path,
    albums.title AS album_title,
    main_artist.stage_name AS main_artist_name,
    CONCAT(
      main_artist.stage_name,
      CASE 
        WHEN GROUP_CONCAT(DISTINCT 
              CASE 
                WHEN featured_artists.id != main_artist.id THEN featured_artists.stage_name 
                ELSE NULL 
              END 
              ORDER BY featured_artists.id SEPARATOR ', ') IS NOT NULL 
        THEN CONCAT(', ', GROUP_CONCAT(DISTINCT 
              CASE 
                WHEN featured_artists.id != main_artist.id THEN featured_artists.stage_name 
                ELSE NULL 
              END 
              ORDER BY featured_artists.id SEPARATOR ', '))
        ELSE ''
      END
    ) AS all_artists
  FROM tracks
  LEFT JOIN albums ON tracks.album_id = albums.id
  JOIN artists AS main_artist ON tracks.artist_id = main_artist.id
  LEFT JOIN track_features ON track_features.track_id = tracks.id
  LEFT JOIN artists AS featured_artists ON featured_artists.id = track_features.artist_id
  GROUP BY 
    tracks.id, 
    tracks.title, 
    tracks.audio_path, 
    tracks.cover_path, 
    albums.title, 
    main_artist.stage_name
  ORDER BY tracks.id ASC
";

// 2. Fetch Artists with Profile Pictures
$artistsQuery = "
  SELECT 
    artists.id AS artist_id,
    artists.stage_name,
    users.profile_picture
  FROM artists
  LEFT JOIN users ON users.artist_id = artists.id
  ORDER BY artists.stage_name ASC
";

// 3. Fetch Albums with Artist Info and Track Count
$albumsQuery = "
  SELECT 
    albums.id AS album_id,
    albums.title AS album_title,
    albums.cover_path,
    albums.created_at,
    ANY_VALUE(artists.stage_name) AS artist_name,
    COUNT(tracks.id) AS track_count
  FROM albums
  JOIN artists ON albums.artist_id = artists.id
  LEFT JOIN tracks ON tracks.album_id = albums.id
  GROUP BY albums.id
  ORDER BY albums.title ASC
";

// 4. Fetch Playlists with Track Count and Creator Info
$playlistsQuery = "
  SELECT 
    playlists.id AS playlist_id,
    playlists.title AS playlist_name,
    playlists.cover_path,
    playlists.created_at,
    COALESCE(users.username, 'Unknown') AS creator_name,
    COUNT(playlist_items.track_id) AS track_count
  FROM playlists
  LEFT JOIN users ON users.id = playlists.user_id
  LEFT JOIN playlist_items ON playlist_items.playlist_id = playlists.id
  GROUP BY playlists.id
  ORDER BY playlists.title ASC
";

// Execute Queries
$tracksData = $pdo->query($tracksQuery)->fetchAll(PDO::FETCH_ASSOC);
$artistsData = $pdo->query($artistsQuery)->fetchAll(PDO::FETCH_ASSOC);
$albumsData = $pdo->query($albumsQuery)->fetchAll(PDO::FETCH_ASSOC);
$playlistsData = $pdo->query($playlistsQuery)->fetchAll(PDO::FETCH_ASSOC);

// Default Assets
$defaultCoverUrl = "../images/Default Playlist Cover.png";
$defaultArtistImage = "../images/Default Artist Avatar.png";

// Final JSON structure
$searchData = [
  'tracks' => array_map(fn($track) => [
    'id' => (string) $track['track_id'],
    'title' => $track['track_title'],
    'artist' => $track['all_artists'],
    'album' => $track['album_title'] ?? 'Single',
    'audioUrl' => $track['audio_path'] ?? null,
    'image' => $track['cover_path'] ?: $defaultCoverUrl
  ], $tracksData),

  'artists' => array_map(fn($artist) => [
    'id' => (string) $artist['artist_id'],
    'name' => $artist['stage_name'],
    'image' => $artist['profile_picture'] ?: $defaultArtistImage
  ], $artistsData),

  'albums' => array_map(fn($album) => [
    'id' => (string) $album['album_id'],
    'title' => $album['album_title'],
    'artist' => $album['artist_name'],
    'year' => $album['created_at'] ? date('Y', strtotime($album['created_at'])) : 'Unknown',
    'image' => $album['cover_path'] ?: $defaultCoverUrl,
    'trackCount' => (int) $album['track_count']
  ], $albumsData),

  'playlists' => array_map(fn($playlist) => [
    'id' => (string) $playlist['playlist_id'],
    'name' => $playlist['playlist_name'],
    'creator' => $playlist['creator_name'],
    'trackCount' => (int) $playlist['track_count'],
    'image' => $playlist['cover_path'] ?: $defaultCoverUrl
  ], $playlistsData)
];

// Output JSON
header('Content-Type: application/json');
echo json_encode($searchData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
