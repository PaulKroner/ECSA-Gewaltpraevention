<?php
include_once "../config.php";
require 'sendResetSuccessEmail.php';

header('Content-Type: application/json');

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);
$token = isset($data['token']) ? $data['token'] : '';
$newPassword = isset($data['newPassword']) ? $data['newPassword'] : '';

if (empty($token) || empty($newPassword)) {
  echo json_encode(["status" => "error", "message" => "Token and new password are required"]);
  exit;
}

// Check if the token exists and is valid
$query = "SELECT id, email, password, reset_token_expiry FROM gp_users WHERE reset_token = ?";
$stmt = $pdo->prepare($query);
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
  http_response_code(400);
  echo json_encode(["message" => "Ungültiger oder abgelaufener Token."]);
  exit;
}

// Check if token has expired
$currentDate = date('Y-m-d H:i:s');
if ($user['reset_token_expiry'] < $currentDate) {
  http_response_code(400);
  echo json_encode(["message" => "Token ist abgelaufen."]);
  exit;
}

// Compare new password with old password
if (password_verify($newPassword, $user['password'])) {
  http_response_code(400);
  echo json_encode(["message" => "Das neue Passwort darf nicht gleich dem alten Passwort sein."]);
  exit;
}

// Hash the new password
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

// Update password and delete reset token
$updateQuery = "UPDATE gp_users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?";
$stmt = $pdo->prepare($updateQuery);
$success = $stmt->execute([$hashedPassword, $user['email']]);

if ($success) {
  $emailSent = sendResetSuccessEmail($user['email']);
  echo json_encode(["status" => "success", "message" => "Passwort erfolgreich zurückgesetzt!"]);
} else {
  echo json_encode(["status" => "error", "message" => "Passwort zurücksetzen fehlgeschlagen!"]);
}
