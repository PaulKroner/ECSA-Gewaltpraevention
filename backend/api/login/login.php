<?php
require_once "../config.php";
require_once "../../vendor/autoload.php";

use Firebase\JWT\JWT;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$email = $data["email"] ?? "";
$password = $data["password"] ?? "";
$honeypot = $data["honeypot"] ?? "";

// honeypot-protection: If the field is filled, block the request
if (!empty($honeypot)) {
  http_response_code(403);
  echo json_encode(["success" => false, "message" => "Zugriff verweigert."]);
  exit();
}

// check if email and password are set
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "E-Mail und Passwort erforderlich."]);
    exit();
}

$stmt = $pdo->prepare("SELECT id, email, role_id, password FROM gp_users WHERE email = :email");
$stmt->execute(["email" => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Falsche Zugangsdaten."]);
    exit();
}

// Expiration time for JWT
// Get current time and add 2 days (2 * 24 * 60 * 60 seconds)
$expiration_time = time() + (2 * 24 * 60 * 60);

// Load JWT secret from .env
$secret_key = getenv('JWT_SECRET_KEY');

$payload = [
    "id" => $user["id"],
    "role_id" => $user["role_id"],
    "exp" => $expiration_time,
];

$jwt = JWT::encode($payload, $secret_key, 'HS256');

http_response_code(200);
echo json_encode([
    "message" => "Login erfolgreich",
    "token" => $jwt // JWT contains (id, role_id, exp)
]);
?>