<?php
require_once "../config.php";

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
$stmt = $pdo->prepare("SELECT id, email, role_id, password FROM users WHERE email = :email");
$stmt->execute(["email" => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Falsche Zugangsdaten."]);
    exit();
}

// Generate session token
$sessionToken = bin2hex(random_bytes(32));

http_response_code(200);
echo json_encode([
    "success" => true,
    "message" => "Login erfolgreich",
    "token" => $sessionToken,  // store this in localStorage
    "role_id" => $user['role_id'] // pass role_id separately
]);
?>