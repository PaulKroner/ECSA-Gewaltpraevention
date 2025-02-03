<?php
// Datenbankkonfiguration
$host = "localhost"; // oder IP des Servers
$dbname = "gewaltprävention-edv";
$username = "root"; // dein DB-Benutzer
$password = ""; // dein DB-Passwort

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die(json_encode(["success" => false, "message" => "Datenbankverbindung fehlgeschlagen: " . $e->getMessage()]));
}
?>