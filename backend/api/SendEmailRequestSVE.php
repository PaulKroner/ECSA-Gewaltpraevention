<?php
require_once "mailconfig.php";
require_once "config.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'];
$name = $data['name'];
$vorname = $data['vorname'];

// createMailConnection() is defined in mailconfig.php
$mail = createMailConnection();

// add logos
$mail->addEmbeddedImage(__DIR__ . '/../assets/EC-Mail-Logo.png', 'ec_logo_cid', 'EC-Mail-Logo.png');
$mail->addEmbeddedImage(__DIR__ . '/../assets/FTS-Mail-Logo.jpg', 'fts_logo_cid', 'FTS-Mail-Logo.jpg');

// E-Mail content
$message = "
    <h1>Führungszeugnis übermitteln</h1>
    <p>Liebe(r) $vorname $name,</p>
    <div>
      Du hast dich dazu bereit erklärt, ehrenamtlich in unserem Verband mitzuarbeiten. Sehr gute
      Entscheidung! Vielen Dank dafür! Herzlich willkommen!<br/>
      Wie du vielleicht schon weißt, ist uns der Schutz der uns anvertrauten Menschen sehr wichtig, sodass
      wir uns einige Regelungen gegeben haben, die die Voraussetzung für die Mitarbeit in unseren
      Arbeiten bilden.<br/>
      Dazu gehört eine Selbstverpflichtungserklärung. Bitte ergänze in der
      angehängten PDF-Datei „SE 2025“ deine Daten,
      drucke die Datei aus, unterschreibe und gib sie dann der für dich zuständig beauftragten Person ab.
      <br><br/>
      Ich danke dir ganz herzlich für dein Verständnis und die zeitnahe Umsetzung dieser Schritte und
      wünsche dir viel Freude, Gelingen und Segen bei deinem wichtigen und wertvollen Dienst.
      <br><br/>
      Viele Grüße
      <br><br/>
      Thomas Kamm
      <br/>
      Geschäftsführer im
    </div>
    <div style=\"font-weight:bold\">
      EC-Verband für Kinder- und Jugendarbeit Sachsen-Anhalt e.V.
    </div>
    <img src=\"cid:ec_logo_cid\" alt=\"EC-Mail-Logo\" style=\"max-width: 300px; height: auto;\" />
    <div>
      und
    </div>
    <div style=\"font-weight:bold\">
      Förderverein Theologisches Studienzentrum Berlin e.V.
    </div>
    <img src=\"cid:fts_logo_cid\" alt=\"FTS-Mail-Logo\" style=\"max-width: 300px; height: auto;\" />
    <div>
      Bülstringer Straße 42 <br/>
      39340 Haldensleben <br/>
      Tel.: +49 - 3904 - 462302 <br/>
      Fax: +49 - 3904 - 462303 <br/>
      Mobil: +49 - 1575 - 7046619
    </div>
    <div style=\"display: inline-flex; align-items: center; gap: 5px;\">
      <a href=\"https://www.ecsa.de\" target=\"_blank\">www.ecsa.de</a><br/>
      <span>&nbsp;/&nbsp;</span>      
      <a href=\"https://www.tsberlin.org\" target=\"_blank\">www.tsberlin.org</a><br/>
    </div>
";

// PDF-Attachment
$pdfPath = __DIR__ . '/../assets/SE 2025.pdf';
if (file_exists($pdfPath)) {
  $mail->addAttachment($pdfPath, 'SE 2025.pdf.pdf');
} else {
  throw new Exception("PDF Datei nicht gefunden");
}

// receiver
$mail->addAddress($email, "");

// E-Mail format
$mail->isHTML(true);
$mail->Subject = 'Selbstverpflichtungserklärung übermitteln';
$mail->Body    = $message;
$mail->AltBody = "Liebe(r) $vorname $name,\n\nBitte unterschreib die Selbstverständniserklärung aus dem Anhang und gib sie der für dich zuständig beauftragten Person ab.";

try {
  $mail->send();
  echo json_encode(["message" => "Email erfolgreich versendet"]);
} catch (Exception $e) {
  http_response_code($e->getCode() ?: 400);
  echo json_encode(["success" => false, "message" => $e->getMessage()]);
}