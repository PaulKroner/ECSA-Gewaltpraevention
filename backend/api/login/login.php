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
$token    = $data['token'] ?? '';

$recaptchaSecret = getenv('RECAPTCHA_SECRET_KEY');

// honeypot-protection: If the field is filled, block the request
if (!empty($honeypot)) {
  http_response_code(403);
  echo json_encode(["success" => false, "message" => "Zugriff verweigert."]);
  exit();
}

// Wenn gar kein Token mitgeschickt wurde
if (empty($token)) {
  http_response_code(400);
  echo json_encode([
    "success" => false,
    "message" => "reCAPTCHA Token fehlt."
  ]);
  exit();
}


// reCAPTCHA v2 protection
$verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
$ch = curl_init($verifyUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
  'secret'   => $recaptchaSecret,
  'response' => $token,
  'remoteip' => $_SERVER['REMOTE_ADDR']
]));
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if (empty($result['success']) || $result['success'] !== true) {
  http_response_code(403);
  echo json_encode([
    "success" => false,
    "message" => "reCAPTCHA Verifizierung fehlgeschlagen.",
    "errors"  => $result['error-codes'] ?? [],
    "hostname" => $result['hostname'],
    "debug"   => $result
  ]);
  exit;
}


// login spam protection
$ip              = $_SERVER['REMOTE_ADDR'] ?? '';
$maxAttempts     = 5;    // max trys
$intervalMinutes = 5;    // interval in min

// check if the IP is already in the database
$stmt = $pdo->prepare("
    SELECT COUNT(*) AS cnt
    FROM login_attempts
    WHERE ip = :ip
      AND attempt_time > (NOW() - INTERVAL :min MINUTE)
");
$stmt->execute([
  'ip'  => $ip,
  'min' => $intervalMinutes
]);
$cnt = (int)$stmt->fetchColumn();

// if the number of attempts is greater than the max, block the request
if ($cnt >= $maxAttempts) {
  http_response_code(429);
  echo json_encode([
    "success" => false,
    "message" => "Zu viele Loginversuche. Bitte in einer Minute erneut versuchen."
  ]);
  exit();
}

$insert = $pdo->prepare("
    INSERT INTO login_attempts (ip, attempt_time)
    VALUES (:ip, NOW())
");
$insert->execute(['ip' => $ip]);

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

// success - delete all login attempts for this IP
$cleanup = $pdo->prepare("DELETE FROM login_attempts WHERE ip = :ip");
$cleanup->execute(['ip' => $ip]);


// Expiration time for JWT
// Get current time and add 2 days (2 * 24 * 60 * 60 seconds)
$expiration_time = time() + (2 * 24 * 60 * 60);

// Load JWT secret from .env
$secret_key = getenv('JWT_SECRET_KEY');

$payload = [
  "id"      => $user["id"],
  "role_id" => $user["role_id"],
  "exp"     => $expiration_time,
];

$jwt = JWT::encode($payload, $secret_key, 'HS256');

http_response_code(200);
echo json_encode([
  "message" => "Login erfolgreich",
  "token"   => $jwt
]);
