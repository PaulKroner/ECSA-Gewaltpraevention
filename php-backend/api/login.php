<?php


// OPTIONS-Requests direkt beantworten (CORS Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


$email = $data["email"] ?? "";
$password = $data["password"] ?? "";

// Prüfe, ob beide Felder ausgefüllt sind
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "E-Mail und Passwort erforderlich."]);
    exit();
}

// SQL-Abfrage: Suche Nutzer mit passender E-Mail
$stmt = $pdo->prepare("SELECT id, email, password FROM users WHERE email = :email");
$stmt->execute(["email" => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Ungültige Zugangsdaten."]);
    exit();
}

// Klartext-Vergleich der Passwörter (nicht sicher!)
if ($password !== $user['password']) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Falsches Passwort"]);
    exit();
}

// Login erfolgreich
http_response_code(200);
echo json_encode(["success" => true, "message" => "Login erfolgreich"]);
?>
