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
    $mail->Host       = getenv('MAIL_HOST');
    $mail->SMTPAuth   = true;
    $mail->Username   = getenv('MAIL_USERNAME');
    $mail->Password   = getenv('MAIL_PASSWORD');
    $mail->SMTPSecure = getenv('MAIL_ENCRYPTION') === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = getenv('MAIL_PORT');
    $mail->CharSet    = 'UTF-8';  // Set charset to UTF-8 for proper encoding

    // sender settings
    $mail->setFrom(getenv('MAIL_FROM_ADDRESS'), getenv('MAIL_FROM_NAME'));
  } catch (Exception $e) {
    error_log("Mail konnte nicht konfiguriert werden: {$mail->ErrorInfo}");
    die(json_encode(["success" => false, "message" => "Mail-Verbindung fehlgeschlagen: " . $e->getMessage()]));
  }

  return $mail;
}
