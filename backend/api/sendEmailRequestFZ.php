<?php
require_once "mailconfig.php";
require_once "config.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'];
$name = "test";
$vorname = "testa";

// E-Mail content
$message = "
    <h1>Führungszeugnis übermitteln</h1>
    <p>Hallo $vorname $name,</p>
    <div>Schicken Sie ihr Führungszeugnis bitte an diese E-Mail-Adresse: gewaltschutz@ecsa.de</div>
    <div>Im Anhang finden Sie die PDF.</div>
    <br><br/>
    <div>Herzliche Grüße</div>
    <div>Dein Team vom ECSA</div>
";

// createMailConnection() is defined in mailconfig.php
$mail = createMailConnection();

// PDF-Attachment
$pdfPath = __DIR__ . '/../assets/Aufforderung Polizeiliches Führungszeugnis 2023.pdf';
if (file_exists($pdfPath)) {
  $mail->addAttachment($pdfPath, 'Aufforderung Polizeiliches Führungszeugnis 2023.pdf');
} else {
  throw new Exception("PDF Datei nicht gefunden");
}

// receiver
$mail->addAddress($email, "");

// E-Mail format
$mail->isHTML(true);
$mail->Subject = 'Führungszeugnis übermitteln';
$mail->Body    = $message;
$mail->AltBody = "Hallo $vorname $name,\n\nSchicken Sie ihr Führungszeugnis bitte an diese E-Mail-Adresse: gewaltschutz@ecsa.de";

try {
  $mail->send();
  echo json_encode(["message" => "Email erfolgreich versendet"]);
} catch (Exception $e) {
  http_response_code($e->getCode() ?: 400);
  echo json_encode(["success" => false, "message" => $e->getMessage()]);
}