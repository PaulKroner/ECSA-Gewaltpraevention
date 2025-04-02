<?php
require_once "../config.php";

// Handle preflight (OPTIONS request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// check if all required data is set
if (!isset($data["name"], $data["vorname"], $data["email"])) {
  echo json_encode(["success" => false, "message" => "Fehlende Daten."]);
  exit;
}

if (!isset($data["postadresse"]) || empty($data["postadresse"])) {
  $data["postadresse"] = "";
} else {
  if (!preg_match('/^\d{5} [A-Za-zÄÖÜäöüß\s-]+$/u', $data["postadresse"])) {
      echo json_encode(["success" => false, "message" => "Ungültiges Format der Postadresse."]);
      exit; // Beendet das Skript
  }
}


$hauptamt = isset($data["hauptamt"]) && ($data["hauptamt"] === '1' || $data["hauptamt"] === true) ? 1 : 0;

try {
  $sql = "INSERT INTO gp_employees (name, vorname, email, postadresse, gemeinde_freizeit, fz_eingetragen, fz_abgelaufen, fz_kontrolliert, fz_kontrolliert_am, gs_eingetragen, gs_erneuert, gs_kontrolliert, us_eingetragen, us_abgelaufen, us_kontrolliert, sve_eingetragen, sve_kontrolliert, hauptamt)
            VALUES (:name, :vorname, :email, :postadresse, :gemeinde_freizeit, :fz_eingetragen, :fz_abgelaufen, :fz_kontrolliert, :fz_kontrolliert_am, :gs_eingetragen, :gs_erneuert, :gs_kontrolliert, :us_eingetragen, :us_abgelaufen, :us_kontrolliert, :sve_eingetragen, :sve_kontrolliert, :hauptamt)";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ":name" => $data["name"],
    ":vorname" => $data["vorname"],
    ":email" => $data["email"],
    ":postadresse" => $data["postadresse"],
    ":gemeinde_freizeit" => $data["gemeinde_freizeit"],
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
