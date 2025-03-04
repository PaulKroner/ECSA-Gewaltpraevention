<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

set_include_path(__DIR__ . '/../vendor');
require_once 'autoload.php';


// mail-connection configuration
function createMailConnection()
{
  $mail = new PHPMailer(true);
  try {
    // SMTP-settings
    $mail->isSMTP();
    $mail->Host       = 'mail.your-server.de'; // mail-server
    $mail->SMTPAuth   = true;
    $mail->Username   = 'admin@paul-coding.de';
    $mail->Password   = 'Admin1!';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; //TLS encryption
    $mail->Port       = 587;
    $mail->CharSet = 'UTF-8';  // Set charset to UTF-8 for proper encoding

    // sender settings
    $mail->setFrom('admin@paul-coding.de', 'EC Sachsen-Anhalt e.V.');
  } catch (Exception $e) {
    error_log("Mail konnte nicht konfiguriert werden: {$mail->ErrorInfo}");
    die(json_encode(["success" => false, "message" => "Mail-Verbindung fehlgeschlagen: " . $e->getMessage()]));
  }

  return $mail;
}
