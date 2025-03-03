<?php
require_once "../config.php"; // Verbindung zur Datenbank einbinden
// OPTIONS-Preflight-Anfragen direkt beantworten
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

// Nur POST-Anfragen zulassen
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
    exit;
}

// JSON-Daten aus dem Request einlesen
$data = json_decode(file_get_contents("php://input"), true);

// Überprüfung der erforderlichen Felder
if (!isset($data["email"], $data["password"], $data["role"], $data["name"], $data["vorname"])) {
    echo json_encode(["success" => false, "message" => "Fehlende Daten."]);
    exit;
}

// Eingaben bereinigen und vorbereiten
$email = trim(strtolower($data["email"]));
$password = $data["password"];
$role = intval($data["role"]); // Sicherstellen, dass es eine Ganzzahl ist
$name = trim($data["name"]);
$vorname = trim($data["vorname"]);

try {
    // Prüfen, ob die E-Mail bereits existiert
    $stmt = $pdo->prepare("SELECT id FROM gp_users WHERE email = :email");
    $stmt->execute([":email" => $email]);

    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "Diese E-Mail-Adresse ist bereits registriert."]);
        exit;
    }

    // hash passwort
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Nutzer in die Datenbank einfügen
    $sql = "INSERT INTO gp_users (email, password, role_id, name, vorname) 
            VALUES (:email, :password, :role_id, :name, :vorname)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":email" => $email,
        ":password" => $hashedPassword,
        ":role_id" => $role, // Hier war vorher ein Fehler: `role_id`
        ":name" => $name,
        ":vorname" => $vorname
    ]);

    echo json_encode(["success" => true, "message" => "Registrierung war erfolgreich!"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Fehler bei der Registrierung.", "error" => $e->getMessage()]);
}
?>
