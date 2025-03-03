<?php
require_once "../config.php";
require_once "../../vendor/autoload.php"; // Load installed packages

use Firebase\JWT\JWT;

// OPTIONS-Requests direkt beantworten (CORS Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Daten einlesen
$data = json_decode(file_get_contents("php://input"), true);
$email = $data["email"] ?? "";
$password = $data["password"] ?? "";

// Prüfen, ob beide Felder ausgefüllt sind
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "E-Mail und Passwort erforderlich."]);
    exit();
}

// Nutzer suchen
$stmt = $pdo->prepare("SELECT id, email, role_id, password FROM gp_users WHERE email = :email");
$stmt->execute(["email" => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Falsche Zugangsdaten."]);
    exit();
}

$secret_key = "your_secret_key"; // Replace with an actual secret key

$payload = [
    "id" => $user["id"],
    "role_id" => $user["role_id"],
];

$jwt = JWT::encode($payload, $secret_key, 'HS256');

http_response_code(200);
echo json_encode([
    "message" => "Login erfolgreich",
    "token" => $jwt // JWT contains (id, role_id, exp)
]);
?>