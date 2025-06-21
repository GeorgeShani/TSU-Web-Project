<?php
require_once '../vendor/autoload.php';

use Dotenv\Dotenv;
use Aws\S3\S3Client;
use Aws\Exception\AwsException;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$s3Client = new S3Client([
  'region' => $_ENV['AWS_REGION'],
  'version' => 'latest',
  'credentials' => [
    'key' => $_ENV['AWS_ACCESS_KEY'],
    'secret' => $_ENV['AWS_SECRET_ACCESS_KEY'],
  ],
]);

$bucket = $_ENV['AWS_BUCKET_NAME'];

function uploadFileToS3($file, $folderPath, $bucket, $s3Client)
{
  try {
    $tmpFilePath = $file['tmp_name'];
    $filename = basename($file['name']);
    $safeFilename = str_replace(' ', '_', $filename);

    $result = $s3Client->putObject([
      'Bucket' => $bucket,
      'Key' => "$folderPath/$safeFilename",
      'SourceFile' => $tmpFilePath,
      'ACL' => 'public-read',
      'ContentType' => mime_content_type($tmpFilePath),
    ]);

    return $result['ObjectURL'];
  } catch (AwsException $e) {
    error_log("AWS S3 Upload Error: " . $e->getAwsErrorMessage());
    return false;
  } catch (Exception $e) {
    error_log("Upload Error: " . $e->getMessage());
    return false;
  }
}
