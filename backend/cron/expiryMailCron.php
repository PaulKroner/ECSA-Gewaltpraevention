<?php
set_include_path(__DIR__ . '/../api');
require_once 'config.php';
require_once 'mailconfig.php';

// send email notification to employees whose certificate (US and FZ) has expired
function sendExpiryNotification($pdo, $column, $subject, $pdfFilename, $emailBody, $attachPdf = true)
{
    $query = "SELECT email, name, vorname FROM gp_employees WHERE $column < NOW()";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($employees as $data) {
        $email = $data['email'];
        $name = $data['name'];
        $vorname = $data['vorname'];

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
    'Führungszeugnis übermitteln',
    'Aufforderung Polizeiliches Führungszeugnis 2023.pdf',
    'Ihr Führungszeugnis ist abgelaufen. Im Anhang finden Sie die PDF.<br>Schicken Sie die ausgefüllte PDF an diese E-Mail-Adresse gewaltschutz@ecsa.de',
    true
);

sendExpiryNotification(
    $pdo,
    'us_abgelaufen',
    'Upgradeschulung abgelaufen',
    '',
    'Ihre Upgradeschulung ist abgelaufen. Bitte erneuern Sie Ihre Upgradeschulung.',
    false
);
?>