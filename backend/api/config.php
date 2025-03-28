<?php
function loadEnv($path) {
  if (!file_exists($path)) {
      throw new Exception(".env-Datei nicht gefunden.");
  }
  $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
      if (strpos(trim($line), '#') === 0) continue; // ignore comments
      list($name, $value) = explode('=', $line, 2);
      putenv("$name=$value");
  }
}
loadEnv(__DIR__ . '/../.env.dev');

// database configuration
$host = getenv('DB_HOST');
$dbname = getenv('DB_NAME');
$username = getenv('DB_USER');
$password = getenv('DB_PASS');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die(json_encode(["success" => false, "message" => "Datenbankverbindung fehlgeschlagen: " . $e->getMessage()]));
}
?>