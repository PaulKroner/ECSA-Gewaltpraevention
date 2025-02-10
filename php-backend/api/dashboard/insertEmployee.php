<?php
require_once "../config.php"; // Verbindung zur Datenbank einbinden

// Handle preflight (OPTIONS request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
  exit;
}

// JSON-Daten aus dem Request einlesen
$data = json_decode(file_get_contents("php://input"), true);

// Überprüfung der erforderlichen Felder
if (!isset($data["name"], $data["vorname"], $data["email"])) {
  echo json_encode(["success" => false, "message" => "Fehlende Daten."]);
  exit;
}
$hauptamt = isset($data["hauptamt"]) && ($data["hauptamt"] === '1' || $data["hauptamt"] === true) ? 1 : 0;

try {
  // Datumskonvertierung (nur wenn die Felder existieren)
  // $dates = ["fz_eingetragen", "fz_abgelaufen", "fz_kontrolliert_am", "gs_eingetragen", "gs_erneuert", "us_eingetragen", "us_abgelaufen", "sve_eingetragen"];
  // foreach ($dates as $field) {
  //     if (!empty($data[$field])) {
  //         $data[$field] = date("Y-m-d", strtotime($data[$field])); // in MySQL-kompatibles Format umwandeln
  //     } else {
  //         $data[$field] = null; // NULL setzen, falls leer
  //     }
  // }

  // SQL-Abfrage vorbereiten
  $sql = "INSERT INTO employees (name, vorname, email, postadresse, fz_eingetragen, fz_abgelaufen, fz_kontrolliert, fz_kontrolliert_am, gs_eingetragen, gs_erneuert, gs_kontrolliert, us_eingetragen, us_abgelaufen, us_kontrolliert, sve_eingetragen, sve_kontrolliert, hauptamt)
            VALUES (:name, :vorname, :email, :postadresse, :fz_eingetragen, :fz_abgelaufen, :fz_kontrolliert, :fz_kontrolliert_am, :gs_eingetragen, :gs_erneuert, :gs_kontrolliert, :us_eingetragen, :us_abgelaufen, :us_kontrolliert, :sve_eingetragen, :sve_kontrolliert, :hauptamt)";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ":name" => $data["name"],
    ":vorname" => $data["vorname"],
    ":email" => $data["email"],
    ":postadresse" => $data["postadresse"],
    ":fz_eingetragen" => $data["fz_eingetragen"],
    ":fz_abgelaufen" => $data["fz_abgelaufen"],
    ":fz_kontrolliert" => $data["fz_kontrolliert"],
    ":fz_kontrolliert_am" => $data["fz_kontrolliert_am"],
    ":gs_eingetragen" => $data["gs_eingetragen"],
    ":gs_erneuert" => $data["gs_erneuert"],
    ":gs_kontrolliert" => $data["gs_kontrolliert"],
    ":us_eingetragen" => $data["us_eingetragen"],
    ":us_abgelaufen" => $data["us_abgelaufen"],
    ":us_kontrolliert" => $data["us_kontrolliert"],
    ":sve_eingetragen" => $data["sve_eingetragen"],
    ":sve_kontrolliert" => $data["sve_kontrolliert"],
    ":hauptamt" => $hauptamt
  ]);

  echo json_encode(["success" => true, "message" => "Mitarbeiter erfolgreich hinzugefügt."]);
} catch (PDOException $e) {
  echo json_encode(["success" => false, "message" => "Fehler beim Einfügen des Mitarbeiters.", "error" => $e->getMessage()]);
}
