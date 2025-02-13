<?php
include_once "config.php";
require_once "mailconfig.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
  exit;
}

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);
$email = isset($data['email']) ? $data['email'] : '';
if (!isset($data['email'])) {
  echo json_encode(["message" => "Falsche Eingaben"]);
  http_response_code(400);
  exit();
} else {
  echo json_encode(["message" => "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet."]);
};

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
    $updateQuery = "UPDATE gp_users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?";
    $stmt = $pdo->prepare($updateQuery);
    $stmt->execute([$resetToken, $expiryDate, $email]);

    // Create reset link
    $resetLink = "http://localhost:3000/registration/resetPassword/$resetToken";

    // E-Mail Inhalt
    $message = "
      <h1>Passwort zurücksetzen</h1>
      <p>Hallo ,</p>
      <div>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</div>
      <a href=\"$resetLink\">$resetLink</a>
    ";

    // Benutze die Funktion createMailConnection(), um eine Verbindung zu erstellen
    $mail = createMailConnection();

    // Absender & Empfänger
    $mail->addAddress($email, "");
    // E-Mail Format
    $mail->isHTML(true);
    $mail->Subject = 'Passwort zurücksetzen';
    $mail->Body    = $message;
    $mail->AltBody = "Hallo ,\n\nKlicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:'$resetLink'";


    try {
      // Senden
      $mail->send();
      echo json_encode(["message" => "Email erfolgreich versendet"]);
    } catch (Exception $e) {
      echo "E-Mail konnte nicht gesendet werden. Fehler: {$e->getMessage()}";
      http_response_code(500);
    }
  }
}
?>