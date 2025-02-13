<?php
include_once "../config.php"; // Database connection

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
$query = "SELECT email, reset_token_expiry FROM gp_users WHERE reset_token = ?";
$stmt = $pdo->prepare($query);
$stmt->execute([$token]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(["status" => "error", "message" => "Invalid token"]);
    exit;
}

// Check if token has expired
$currentDate = date('Y-m-d H:i:s');
if ($user['reset_token_expiry'] < $currentDate) {
    echo json_encode(["status" => "error", "message" => "Token has expired"]);
    exit;
}

// Hash the new password
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

// Update password and delete reset token
$updateQuery = "UPDATE gp_users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?";
$stmt = $pdo->prepare($updateQuery);
$success = $stmt->execute([$hashedPassword, $user['email']]);

if ($success) {
    echo json_encode(["status" => "success", "message" => "Password successfully reset"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to update password"]);
}
?>