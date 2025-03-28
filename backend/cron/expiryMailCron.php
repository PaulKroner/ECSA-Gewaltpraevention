<?php
set_include_path(__DIR__ . '/../api');
require_once 'config.php';
require_once 'mailconfig.php';

// function for checking if email was sent in the last 30 days
function emailSentInLast30Days($pdo, $email, $nachweisType)
{
  $query = "SELECT 1 FROM email_logs WHERE email = ? AND nachweis = ? AND gesendet_am >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
  $stmt = $pdo->prepare($query);
  $stmt->execute([$email, $nachweisType]);
  return $stmt->fetch() ? true : false;
}

// send email notification to employees whose certificate (US and FZ) has expired
function sendExpiryNotification($pdo, $column, $nachweisType, $subject, $pdfFilename, $emailBody, $attachPdf = true)
{
  $query = "SELECT email, name, vorname FROM gp_employees WHERE $column < NOW()";
  $stmt = $pdo->prepare($query);
  $stmt->execute();
  $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

  foreach ($employees as $data) {
    $email = $data['email'];
    $name = $data['name'];
    $vorname = $data['vorname'];

    // check if email was sent in the last 30 days
    if (emailSentInLast30Days($pdo, $email, $nachweisType)) {
      echo json_encode(["message" => "E-Mail an $email wurde bereits in den letzten 30 Tagen gesendet. Überspringe."]);
      continue;
    }

    $message = "
            <h1>$subject</h1>
            <p>Hallo $vorname $name,</p>
            <div>$emailBody</div>
            <br><br/>
            <div>Herzliche Grüße</div>
            <div>Dein Team vom ECSA</div>
        ";

    $mail = createMailConnection();

    if ($attachPdf) {
      $pdfPath = __DIR__ . '/../assets/' . $pdfFilename;
      if (file_exists($pdfPath)) {
        $mail->addAttachment($pdfPath, $pdfFilename);
      } else {
        throw new Exception("PDF Datei nicht gefunden");
      }
    }

    $mail->addAddress($email, "$vorname $name");
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $message;
    $mail->AltBody = "Hallo $vorname $name,\n\n$emailBody";

    // save email in email_logs table
    $logQuery = "INSERT INTO email_logs (email, nachweis, gesendet_am) VALUES (?, ?, NOW())";
    $logStmt = $pdo->prepare($logQuery);
    $logStmt->execute([$email, $nachweisType]);

    try {
      $mail->send();
      echo json_encode(["message" => "E-Mail erfolgreich versendet an $email"]);
    } catch (Exception $e) {
      echo "E-Mail konnte nicht gesendet werden an $email. Fehler: {$e->getMessage()}";
      http_response_code(500);
    }
  }
}

sendExpiryNotification(
  $pdo,
  'fz_abgelaufen',
  'fz',
  'Führungszeugnis übermitteln',
  'Aufforderung Polizeiliches Führungszeugnis 2023.pdf',
  'Ihr Führungszeugnis ist abgelaufen. Im Anhang finden Sie die PDF.<br>Schicken Sie die ausgefüllte PDF an diese E-Mail-Adresse gewaltschutz@ecsa.de',
  true
);

sendExpiryNotification(
  $pdo,
  'us_abgelaufen',
  'us',
  'Upgradeschulung abgelaufen',
  '',
  'Ihre Upgradeschulung ist abgelaufen. Bitte erneuern Sie Ihre Upgradeschulung.',
  false
);
