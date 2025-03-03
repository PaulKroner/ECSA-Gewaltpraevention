<?php
require '../../vendor/autoload.php';
require_once "../api/mailconfig.php";
require_once "../api/config.php";

error_reporting(E_ALL);
ini_set('display_errors', 1);

// cron logic
// Überprüfe alle Mitarbeiter, deren Führungszeugnis abgelaufen ist
$query = "SELECT email, name, vorname, fz_abgelaufen FROM gp_employees WHERE fz_abgelaufen < NOW()";
$stmt = $pdo->prepare($query);
$stmt->execute();
$employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

// E-Mail logik
foreach ($employees as $data) {
  $email = $data['email'];
  $name = $data['name'];
  $vorname = $data['vorname'];

  $message = "
      <h1>Führungszeugnis abgelaufen</h1>
      <p>Hallo $vorname $name,</p>
      <div>Ihr Führungszeugnis ist abgelaufen. Im Anhang finden Sie die PDF.</div>
      <div>Schicken Sie die ausgefüllte PDF an diese E-Mail-Adresse gewaltschutz@ecsa.de</div>
      <div>Herzliche Grüße</div>
      <div>Dein Team vom ECSA</div>
  ";

  // Benutze die Funktion createMailConnection(), um eine Verbindung zu erstellen
  $mail = createMailConnection();

  $pdfPath = __DIR__ . '/../assets/Aufforderung Polizeiliches Führungszeugnis 2023.pdf';
  if (file_exists($pdfPath)) {
    $mail->addAttachment($pdfPath, 'Aufforderung Polizeiliches Führungszeugnis 2023.pdf');
  } else {
    throw new Exception("PDF Datei nicht gefunden");
  }

  // Absender & Empfänger
  $mail->addAddress($email, "$vorname $name");

  // E-Mail Format
  $mail->isHTML(true);
  $mail->Subject = 'Führungszeugnis übermitteln';
  $mail->Body    = $message;
  $mail->AltBody = "Hallo $vorname $name,\n\nSchicken Sie ihr Führungszeugnis bitte an diese E-Mail-Adresse: gewaltschutz@ecsa.de";

  try {
    $mail->send();
    echo json_encode(["message" => "E-Mail erfolgreich versendet an $email"]);
  } catch (Exception $e) {
    echo "E-Mail konnte nicht gesendet werden an $email. Fehler: {$e->getMessage()}";
    http_response_code(500);
  }
}
