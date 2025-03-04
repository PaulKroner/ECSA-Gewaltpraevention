<?php
set_include_path(__DIR__ . '/../api');
require_once 'config.php';
// autoload.php gets included in mailconfig.php
set_include_path(__DIR__ . '/../api');
require_once 'mailconfig.php';

// cron logic
// check for every employee whose upgradeschulung certificate has expired
$query = "SELECT email, name, vorname, us_abgelaufen FROM gp_employees WHERE us_abgelaufen < NOW()";
$stmt = $pdo->prepare($query);
$stmt->execute();
$employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

// E-Mail logic
foreach ($employees as $data) {
  $email = $data['email'];
  $name = $data['name'];
  $vorname = $data['vorname'];

  $message = "
      <h1>Upgradeschulung abgelaufen</h1>
      <p>Hallo $vorname $name,</p>
      <div>Ihre Upgradeschulung ist abgelaufen. Im Anhang finden Sie die PDF..</div>
      <div>Schicken Sie die ausgefüllte PDF bitte an diese E-Mail-Adresse: gewaltschutz@ecsa.de</div>
      <br><br/>
      <div>Herzliche Grüße</div>
      <div>Dein Team vom ECSA</div>
  ";

  // function createMailConnection() is defined in mailconfig.php
  $mail = createMailConnection();

  $pdfPath = __DIR__ . '/../assets/Aufforderung Polizeiliches Führungszeugnis 2023.pdf';
  if (file_exists($pdfPath)) {
    $mail->addAttachment($pdfPath, 'Aufforderung Polizeiliches Führungszeugnis 2023.pdf');
  } else {
    throw new Exception("PDF Datei nicht gefunden");
  }

  // sender & recipient
  $mail->addAddress($email, "$vorname $name");

  // E-Mail format
  $mail->isHTML(true);
  $mail->Subject = 'Upgradeschulung abgelaufen';
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