<?php
include_once "config.php";
require_once "mailconfig.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
  exit;
}

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'];

// Validate the email
if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
  // Check if the email exists in the database
  $query = "SELECT vorname, name FROM gp_users WHERE email = ?";
  $stmt = $pdo->prepare($query);
  $stmt->execute([$email]); // Properly execute with parameter
  $user = $stmt->fetch();

  if ($user) {
    // Generate a reset token
    $resetToken = bin2hex(random_bytes(32));

    // Set expiry date to 15 minutes from now
    $expiryDate = date('Y-m-d H:i:s', strtotime('+15 minutes'));

    // Save the reset token and expiry date in the database
    $updateQuery = "UPDATE gp_users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?";
    $stmt = $pdo->prepare($updateQuery);
    $stmt->execute([$resetToken, $expiryDate, $email]);

    // Create reset link
    $resetLink = "https://gewaltpraevention.ecsa.de/registration/resetPassword/$resetToken";

    $vorname = $user['vorname'];
    $name = $user['name'];

    // create mail connection from mailconfig.php
    $mail = createMailConnection();

    $mail->addEmbeddedImage(__DIR__ . '/../assets/EC-Mail-Logo.png', 'ec_logo_cid', 'EC-Mail-Logo.png');
    // E-Mail Inhalt

    $message = "
      <h1>Passwort zurücksetzen</h1>
      <p>Liebe(r) $vorname $name,</p>
      <div>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</div>
      <a href=\"$resetLink\">$resetLink</a>
      <br></br>
      <br></br>
      <div>Herzliche Grüße</div>
      <div>Dein Team vom ECSA</div>
      <img src=\"cid:ec_logo_cid\" alt=\"EC-Mail-Logo\" style=\"max-width: 300px; height: auto;\" />
      <div>
        <a href=\"https://www.ecsa.de\" target=\"_blank\">www.ecsa.de</a><br/>
      </div>
    ";

    // sender & receiver
    $mail->addAddress($email, "");
    // e-Mail format
    $mail->isHTML(true);
    $mail->Subject = 'Passwort zurücksetzen';
    $mail->Body    = $message;
    $mail->AltBody = "Liebe(r) ,\n\nKlicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:'$resetLink'";

    try {
      // Senden
      $mail->send();
      echo json_encode(["message" => "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet."]);
    } catch (Exception $e) {
      echo "E-Mail konnte nicht gesendet werden. Fehler: {$e->getMessage()}";
      http_response_code(500);
    }
  }
}
