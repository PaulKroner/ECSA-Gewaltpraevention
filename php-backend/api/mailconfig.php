<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/autoload.php';

// Mail-Verbindung konfigurieren
function createMailConnection()
{
  $mail = new PHPMailer(true);
  try {
    // SMTP-Einstellungen
    $mail->isSMTP();
    $mail->Host       = 'mail.your-server.de'; // Dein Mail-Server
    $mail->SMTPAuth   = true;
    $mail->Username   = 'admin@paul-coding.de'; // Deine vollständige E-Mail-Adresse
    $mail->Password   = 'Admin1!'; // Dein E-Mail-Passwort
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS-Verschlüsselung
    $mail->Port       = 587; // Standardmäßig 587 für TLS, alternativ 465 für SSL
    $mail->CharSet = 'UTF-8';  // Set charset to UTF-8 for proper encoding

    // Absender konfigurieren
    $mail->setFrom('admin@paul-coding.de', 'Admin');
  } catch (Exception $e) {
    error_log("Mail konnte nicht konfiguriert werden: {$mail->ErrorInfo}");
    // return null;
    die(json_encode(["success" => false, "message" => "Mail-Verbindung fehlgeschlagen: " . $e->getMessage()]));
  }

  return $mail;
}
