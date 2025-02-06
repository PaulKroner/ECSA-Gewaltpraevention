<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/autoload.php';

// Mail-Verbindung konfigurieren
function createMailConnection() {
    $mail = new PHPMailer(true);
    
    // SMTP-Einstellungen für MailHog (oder echten Mailserver)
    $mail->isSMTP();
    $mail->Host       = 'localhost'; // Dein Mail-Server
    $mail->SMTPAuth   = false;
    $mail->Port       = 1025; // Port von MailHog oder deinem Mail-Server
    $mail->SMTPSecure = false;

    // Absender konfigurieren
    $mail->setFrom('admin@example.com', 'Admin');
    return $mail;
}