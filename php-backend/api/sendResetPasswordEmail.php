<?php
include_once "config.php";

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);
$email = isset($data['email']) ? $data['email'] : '';

// Validate the email
if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
    // Check if the email exists in the database
    $query = "SELECT * FROM users WHERE email = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // Generate a reset token
        $resetToken = bin2hex(random_bytes(32));

        // Set expiry date to 15 minutes from now
        $expiryDate = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        // Save the reset token and expiry date in the database
        $updateQuery = "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?";
        $stmt = $pdo->prepare($updateQuery);
        $stmt->execute([$resetToken, $expiryDate, $email]);

        // Create reset link
        $resetUrl = "http://localhost/registration/resetPassword/$resetToken";
        
        // Send the reset email
        $subject = "Password Reset Request";
        $message = "Hello,\n\nWe received a request to reset your password. You can reset your password by clicking the link below:\n$resetUrl\n\nIf you did not request this, please ignore this email.";
        $headers = 'From: no-reply@yourdomain.com' . "\r\n" .
                   'Reply-To: no-reply@yourdomain.com' . "\r\n" .
                   'X-Mailer: PHP/' . phpversion();

        if (mail($email, $subject, $message, $headers)) {
            echo json_encode(["status" => "success", "message" => "Password reset email sent"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to send email"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No account found with that email"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid email address"]);
}
?>