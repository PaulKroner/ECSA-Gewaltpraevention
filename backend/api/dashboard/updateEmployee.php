<?php
require_once "../config.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// check if all required data is set
if (!isset($data["id"], $data["name"], $data["vorname"], $data["email"])) {
  echo json_encode(["success" => false, "message" => "Fehlende Daten."]);
  exit;
}

// Postadresse optional, ansonsten prüfen
if (!isset($data["postadresse"]) || empty($data["postadresse"])) {
  $data["postadresse"] = "";
} else {
  if (!preg_match('/^\d{5} [A-Za-zÄÖÜäöüß\s-]+$/u', $data["postadresse"])) {
    echo json_encode(["success" => false, "message" => "Ungültiges Format der Postadresse."]);
    exit;
  }
}

// Hilfsfunktion: prüft, ob ein Wert gesetzt ist (nicht null/leer)
function isFilled($val)
{
  return isset($val) && $val !== "" && $val !== null;
}

// Gruppendefinitionen: Felder und ihre Benutzer‑Labels
$groups = [
  "Führungszeugnis" => [
    "fields" => ["fz_eingetragen", "fz_kontrolliert", "fz_kontrolliert_am"],
    "labels" => ["gültig ab", "kontrolliert von", "kontrolliert am"]
  ],
  "Grundlagenschulung" => [
    "fields" => ["gs_eingetragen", "gs_kontrolliert"],
    "labels" => ["gültig ab", "kontrolliert von"]
  ],
  "Upgradeschulung" => [
    "fields" => ["us_eingetragen", "us_abgelaufen", "us_kontrolliert"],
    "labels" => ["gültig ab", "Ablaufdatum", "kontrolliert von"]
  ],
  "Selbstverpflichtungserklärung" => [
    "fields" => ["sve_eingetragen", "sve_kontrolliert"],
    "labels" => ["gültig ab", "kontrolliert von"]
  ],
];

// Gruppenvollständigkeitsprüfung
foreach ($groups as $groupName => $group) {
  // Welche Felder sind ausgefüllt?
  $filled = array_filter($group["fields"], fn($k) => isFilled($data[$k] ?? null));
  if (count($filled) > 0) {
    // Welche fehlen noch?
    $missing = array_filter($group["fields"], fn($k) => !isFilled($data[$k] ?? null));
    if (count($missing) > 0) {
      // Fehlende Labels ermitteln
      $missingLabels = [];
      foreach ($missing as $fieldKey) {
        $idx = array_search($fieldKey, $group["fields"], true);
        $missingLabels[] = $group["labels"][$idx];
      }
      echo json_encode([
        "success" => false,
        "message" => "$groupName: Bitte füllen Sie folgende Felder aus: "
          . implode(", ", $missingLabels) . "."
      ]);
      exit;
    }
  }
}

// optional field hauptamt (default 0)
$hauptamt = (isset($data["hauptamt"]) && ($data["hauptamt"] === '1' || $data["hauptamt"] === true))
  ? 1 : 0;

try {

  // Datumskonvertierung oder NULL
  function convertToDate($date)
  {
    return !empty($date)
      ? date("Y-m-d H:i:s", strtotime($date))
      : null;
  }

  // FZ-Log löschen, wenn fz_abgelaufen gesetzt ist
  if (!empty($data["fz_abgelaufen"])) {
    $stmtDeleteFZ = $pdo->prepare(
      "DELETE FROM email_logs WHERE email = :email AND nachweis = 'fz'"
    );
    $stmtDeleteFZ->execute([":email" => $data["email"]]);
  }

  // US-Log löschen, wenn us_abgelaufen gesetzt ist
  if (!empty($data["us_abgelaufen"])) {
    $stmtDeleteUS = $pdo->prepare(
      "DELETE FROM email_logs WHERE email = :email AND nachweis = 'us'"
    );
    $stmtDeleteUS->execute([":email" => $data["email"]]);
  }

  // Update-Statement
  $sql = "UPDATE gp_employees SET 
            name              = :name,
            vorname           = :vorname,
            email             = :email,
            postadresse       = :postadresse,
            gemeinde_freizeit = :gemeinde_freizeit,
            fz_eingetragen    = :fz_eingetragen,
            fz_abgelaufen     = :fz_abgelaufen,
            fz_kontrolliert   = :fz_kontrolliert,
            fz_kontrolliert_am= :fz_kontrolliert_am,
            gs_eingetragen    = :gs_eingetragen,
            gs_erneuert       = :gs_erneuert,
            gs_kontrolliert   = :gs_kontrolliert,
            us_eingetragen    = :us_eingetragen,
            us_abgelaufen     = :us_abgelaufen,
            us_kontrolliert   = :us_kontrolliert,
            sve_eingetragen   = :sve_eingetragen,
            sve_kontrolliert  = :sve_kontrolliert,
            hauptamt          = :hauptamt
          WHERE id = :id";
  $stmt = $pdo->prepare($sql);

  $stmt->execute([
    ":name"              => $data["name"],
    ":vorname"           => $data["vorname"],
    ":email"             => $data["email"],
    ":postadresse"       => $data["postadresse"],
    ":gemeinde_freizeit" => $data["gemeinde_freizeit"],
    ":fz_eingetragen"    => convertToDate($data["fz_eingetragen"]),
    ":fz_abgelaufen"     => convertToDate($data["fz_abgelaufen"]),
    ":fz_kontrolliert"   => $data["fz_kontrolliert"],
    ":fz_kontrolliert_am" => convertToDate($data["fz_kontrolliert_am"]),
    ":gs_eingetragen"    => convertToDate($data["gs_eingetragen"]),
    ":gs_erneuert"       => convertToDate($data["gs_erneuert"]),
    ":gs_kontrolliert"   => $data["gs_kontrolliert"],
    ":us_eingetragen"    => convertToDate($data["us_eingetragen"]),
    ":us_abgelaufen"     => convertToDate($data["us_abgelaufen"]),
    ":us_kontrolliert"   => $data["us_kontrolliert"],
    ":sve_eingetragen"   => convertToDate($data["sve_eingetragen"]),
    ":sve_kontrolliert"  => $data["sve_kontrolliert"],
    ":hauptamt"          => $hauptamt,
    ":id"                => $data["id"]
  ]);

  echo json_encode(["success" => true, "message" => "Mitarbeiter erfolgreich aktualisiert."]);
} catch (PDOException $e) {
  echo json_encode([
    "success" => false,
    "message" => "Fehler beim Aktualisieren des Mitarbeiters.",
    "error"   => $e->getMessage()
  ]);
}
