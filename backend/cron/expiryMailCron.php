<?php
set_include_path(__DIR__ . '/../api');
require_once 'config.php';
require_once 'mailconfig.php';

// function for checking if email was sent in the last 30 days
function emailSentInLast30Days($pdo, $email, $nachweisType)
{
  if ($nachweisType === 'us') {
    // Check if the second reminder for "us" was already sent
    $query = "SELECT 1 FROM email_logs WHERE email = ? AND nachweis = 'us' AND gesendet_am >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$email]);
    return $stmt->fetch() ? true : false;
  } else {
    $query = "SELECT 1 FROM email_logs WHERE email = ? AND nachweis = ? AND gesendet_am >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$email, $nachweisType]);
    return $stmt->fetch() ? true : false;
  }
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
    } elseif (!emailSentInLast30Days($pdo, $email, 'us')) {
      sendSecondReminderUS($pdo, $email, $name, $vorname);
    }

    $message = "
            <h1>$subject</h1>
            <p>Liebe(r) $vorname $name,</p>
            $emailBody
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

    // add logos
    $mail->addEmbeddedImage(__DIR__ . '/../assets/EC-Mail-Logo.png', 'ec_logo_cid', 'EC-Mail-Logo.png');
    $mail->addEmbeddedImage(__DIR__ . '/../assets/FTS-Mail-Logo.jpg', 'fts_logo_cid', 'FTS-Mail-Logo.jpg');

    $mail->addAddress($email, "$vorname $name");
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $message;
    $mail->AltBody = "Liebe(r) $vorname $name,\n\n$emailBody";

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

// function for second reminder us_abgelaufen
function sendSecondReminderUS($pdo, $email, $name, $vorname)
{
    // Check if the second mail was already sent in the last 30 days
    if (emailSentInLast30Days($pdo, $email, 'us')) {
        echo json_encode(["message" => "Zweite Erinnerung bereits gesendet an $email. Überspringe."]);
        return;
    }

    $message = "
      <h1>Erinnerung: Upgrade-Schulung</h1>
      <p>Liebe(r) $vorname $name,</p>
      <div>
        Vermutlich hast du bisher noch keine Chance gehabt, eine Upgrade-Schulung zu machen 
        oder bei der Meldung in unserem System ist etwas schiefgelaufen?
        <br><br/>
        Wir möchten dich nochmals ganz herzlich bitten, deine Schulung aufzufrischen und 
        an einer Upgrade-Schulung teilzunehmen, damit die Voraussetzungen für deine Mitarbeit 
        in unserem Verband weiter gegeben sind. <br>
        Die kommenden Termine für Upgrade-Schulungen erfährst du bei deiner beauftragten Person, 
        deinem Freizeitleiter oder unter (Link zur Übersicht auf der Homepage).
        <br><br/>
        <p>
          Viele Grüße
        </p>
        Thomas
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
      <img src=\"cid:fts_logo_cid\" alt=\"FTS-Mail-Log\" style=\"max-width: 300px; height: auto;\" />
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

    $mail = createMailConnection();

    $mail->addEmbeddedImage(__DIR__ . '/../assets/EC-Mail-Logo.png', 'ec_logo_cid', 'EC-Mail-Logo.png');
    $mail->addEmbeddedImage(__DIR__ . '/../assets/FTS-Mail-Logo.jpg', 'fts_logo_cid', 'FTS-Mail-Logo.jpg');

    $mail->addAddress($email, "$vorname $name");
    $mail->isHTML(true);
    $mail->Subject = "Erinnerung: Upgrade-Schulung fehlt noch";
    $mail->Body = $message;
    $mail->AltBody = "Liebe(r) $vorname $name,\n\nDeine Upgrade-Schulung ist weiterhin ausstehend.";

    try {
        $mail->send();

        $logQuery = "INSERT INTO email_logs (email, nachweis, gesendet_am) VALUES (?, ?, NOW())";
        $logStmt = $pdo->prepare($logQuery);
        $logStmt->execute([$email, 'us']);

        echo json_encode(["message" => "Zweite Erinnerung erfolgreich versendet an $email"]);
    } catch (Exception $e) {
        echo "Zweite Erinnerung konnte nicht gesendet werden an $email. Fehler: {$e->getMessage()}";
        http_response_code(500);
    }
}

sendExpiryNotification(
  $pdo,
  'fz_abgelaufen',
  'fz',
  'Führungszeugnis übermitteln',
  'Aufforderung Polizeiliches Führungszeugnis EDV.pdf',
  '<div>
    Wie die Zeit vergeht! Du bekommst diese Mail, weil dein erweitertes polizeiliches Führungszeugnis abgelaufen ist 
    und erneuert werden muss. Bitte ergänze in der angehängten PDF-Datei „Aufforderung zur Vorlage eines Führungszeugnisses“ deine Daten, 
    drucke die Datei aus und geh damit zu dem für dich zuständigen Einwohnermeldeamt oder Bürgerbüro. <br>
    Nach etwa 3 Wochen bekommst du das Führungszeugnis per Post zugeschickt. Bitte geh damit zu der beauftragten Person oder den Freizeitleiter und lass ihn und gewähre dieser und einer weitere Person Einsicht in das Führungszeugnis. 
    Um alles weitere kümmert sich die für dich zuständige beauftragte Person.<br>
    Ich danke dir ganz herzlich für dein Verständnis und die zeitnahe Umsetzung dieser Aufforderung und wünsche dir weiterhin viel Freude, Gelingen und Segen bei deinem wichtigen und wertvollen Dienst.
    <br><br/>
    <p>
      Viele Grüße
    </p>
    Thomas
    <br><br/>
    Thomas Kamm
    <br/>
    Geschäftsführer im
  </div>
  <div style="font-weight:bold">
    EC-Verband für Kinder- und Jugendarbeit Sachsen-Anhalt e.V.
  </div>
  <img src="cid:ec_logo_cid" alt="EC-Mail-Logo" style="max-width: 300px; height: auto;" />
  <div>
    und
  </div>
  <div style="font-weight:bold">
    Förderverein Theologisches Studienzentrum Berlin e.V.
  </div>
  <img src="cid:fts_logo_cid" alt="FTS-Mail-Log" style="max-width: 300px; height: auto;" />
  <div>
    Bülstringer Straße 42 <br/>
    39340 Haldensleben <br/>
    Tel.: +49 - 3904 - 462302 <br/>
    Fax: +49 - 3904 - 462303 <br/>
    Mobil: +49 - 1575 - 7046619
  </div>
   <div style="display: inline-flex; align-items: center; gap: 5px;">
    <a href="https://www.ecsa.de" target="_blank">www.ecsa.de</a><br/>
    <span>&nbsp;/&nbsp;</span>      
    <a href="https://www.tsberlin.org" target="_blank">www.tsberlin.org</a><br/>
  </div>
    ',
  true
);

sendExpiryNotification(
  $pdo,
  'us_abgelaufen',
  'us',
  'Upgradeschulung abgelaufen',
  '',
  '
  <div>
    Unser Gewaltschutz-Konzept sieht vor, dass sich unsere Mitarbeiterinnen und Mitarbeiter in dem 
    wichtigen Bereich des Schutzes der uns anvertrauten Menschen kontinuierlich weiterbilden und 
    sensibilisieren. Deshalb möchten wir dich ganz herzlich bitten, deine Schulung aufzufrischen und 
    zeitnah an einer Upgrade-Schulung teilzunehmen. Die kommenden Termine hierfür erfährst du bei deiner 
    beauftragten Person, deinem Freizeitleiter oder unter (<a href=\"https://ecsa.de/\" target=\"_blank\">www.ecsa.de</a>).
    <br><br/>
    Vielen Dank für dein Verständnis und die zeitnahe Umsetzung dieser Bitte!
    <br><br/>
    <p>
      Viele Grüße
    </p>
    Thomas
    <br><br/>
    Thomas Kamm
    <br/>
    Geschäftsführer im
  </div>
  <div style="font-weight:bold">
    EC-Verband für Kinder- und Jugendarbeit Sachsen-Anhalt e.V.
  </div>
  <img src="cid:ec_logo_cid" alt="EC-Mail-Logo" style="max-width: 300px; height: auto;" />
  <div>
    und
  </div>
  <div style="font-weight:bold">
    Förderverein Theologisches Studienzentrum Berlin e.V.
  </div>
  <img src="cid:fts_logo_cid" alt="FTS-Mail-Logo" style="max-width: 300px; height: auto;" />
  <div>
    Bülstringer Straße 42 <br/>
    39340 Haldensleben <br/>
    Tel.: +49 - 3904 - 462302 <br/>
    Fax: +49 - 3904 - 462303 <br/>
    Mobil: +49 - 1575 - 7046619
  </div>
  <div style="display: inline-flex; align-items: center; gap: 5px;">
    <a href="https://www.ecsa.de" target="_blank">www.ecsa.de</a><br/>
    <span>&nbsp;/&nbsp;</span>      
    <a href="https://www.tsberlin.org" target="_blank">www.tsberlin.org</a><br/>
  </div>
  ',
  false
);

?>