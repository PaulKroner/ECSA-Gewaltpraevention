<?php
require_once "../mailconfig.php";
function sendResetSuccessEmail($email)
{

  // E-Mail content
  $message = "
    <h1>Passwort wurde erfolgreich zurückgesetzt!</h1>
    <p></p>
    <div>Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich nun mit dem neuen Passwort anmelden.</div>
    <div>Falls du das nicht warst, wende dich umgehend an einen Admin.</div>
    <br><br/>
    <div>Herzliche Grüße</div>
    <div>Dein Team vom ECSA</div>
";

  $mail = createMailConnection();

  // receiver
  $mail->addAddress($email, "");

  // e-mail format
  $mail->isHTML(true);
  $mail->Subject = 'Passwort wurde erfolgreich zurückgesetzt';
  $mail->Body    = $message;
  $mail->AltBody = "Passwort erfolgreich zurückgesetzt! \n\n Dein Passwort wurde erfolgreich zurückgesetzt. Falls du das nicht warst, wende dich umgehend an einen Admin.";
  
  try {
    $mail->send();
    echo json_encode(["message" => "Email erfolgreich versendet"]);
  } catch (Exception $e) {
    http_response_code($e->getCode() ?: 400);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
  }
}
