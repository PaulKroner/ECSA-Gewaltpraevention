<?php
require_once "../config.php"; // Verbindung zur Datenbank einbinden

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
  exit;
}

// JSON-Daten aus dem Request einlesen
$data = json_decode(file_get_contents("php://input"), true);

// Überprüfung der erforderlichen Felder
if (!isset($data["id"], $data["name"], $data["vorname"], $data["email"], $data["role"])) {
  echo json_encode(["success" => false, "message" => "Fehlende Daten."]);
  exit;
}

try {
  // SQL-Abfrage vorbereiten
  $sql = "UPDATE users SET 
          name = :name, 
          vorname = :vorname, 
          email = :email, 
          role_id = :role_id
        WHERE id = :id";

  // Prepare the statement
  $stmt = $pdo->prepare($sql);

  // Execute the statement with the form data
  $stmt->execute([
    ":name" => $data["name"],
    ":vorname" => $data["vorname"],
    ":email" => $data["email"],
    ":role_id" => $data["role"],
    ":id" => $data["id"]
  ]);

  echo json_encode(["success" => true, "message" => "Mitarbeiter erfolgreich aktualisiert."]);


  echo json_encode(["success" => true, "message" => "Mitarbeiter erfolgreich aktualisiert."]);
} catch (PDOException $e) {
  echo json_encode(["success" => false, "message" => "Fehler beim Aktualisieren des Mitarbeiters.", "error" => $e->getMessage()]);
}
