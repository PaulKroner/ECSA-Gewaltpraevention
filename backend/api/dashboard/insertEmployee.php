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
// check if email is not a duplicate
$stmt = $pdo->prepare("SELECT id FROM gp_employees WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->rowCount() > 0) {
  http_response_code(409);
  echo json_encode(["message" => "Ein Mitarbeiter mit dieser E-Mail-Adresse existiert bereits."]);
  exit();
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

// Hilfsfunktion für „gefüllt?“
function isFilled($val)
{
  return isset($val) && $val !== "" && $val !== null;
}

// Gruppendefinitionen: Felder und deren Labels
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
  // zähle ausgefüllte Felder
  $filled = array_filter($group["fields"], fn($k) => isFilled($data[$k] ?? null));
  if (count($filled) > 0) {
    // finde fehlende Felder
    $missing = array_filter($group["fields"], fn($k) => !isFilled($data[$k] ?? null));
    if (count($missing) > 0) {
      // korrespondierende Labels ermitteln
      $missingLabels = [];
      foreach ($missing as $idx => $fieldKey) {
        // Label an gleicher Stelle wie im fields‑Array
        $pos = array_search($fieldKey, $group["fields"]);
        $missingLabels[] = $group["labels"][$pos];
      }
      echo json_encode([
        "success" => false,
        "message" => "$groupName: Bitte füllen Sie folgende Felder aus: " . implode(", ", $missingLabels) . "."
      ]);
      exit;
    }
  }
}

// hauptamt casten
$hauptamt = (isset($data["hauptamt"]) && ($data["hauptamt"] === '1' || $data["hauptamt"] === true)) ? 1 : 0;

try {
  $sql = "INSERT INTO gp_employees
    (name, vorname, email, postadresse, gemeinde_freizeit,
     fz_eingetragen, fz_abgelaufen, fz_kontrolliert, fz_kontrolliert_am,
     gs_eingetragen, gs_erneuert, gs_kontrolliert,
     us_eingetragen, us_abgelaufen, us_kontrolliert,
     sve_eingetragen, sve_kontrolliert, hauptamt)
  VALUES
    (:name, :vorname, :email, :postadresse, :gemeinde_freizeit,
     :fz_eingetragen, :fz_abgelaufen, :fz_kontrolliert, :fz_kontrolliert_am,
     :gs_eingetragen, :gs_erneuert, :gs_kontrolliert,
     :us_eingetragen, :us_abgelaufen, :us_kontrolliert,
     :sve_eingetragen, :sve_kontrolliert, :hauptamt)";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ":name"                => $data["name"],
    ":vorname"             => $data["vorname"],
    ":email"               => $data["email"],
    ":postadresse"         => $data["postadresse"],
    ":gemeinde_freizeit"   => $data["gemeinde_freizeit"],
    ":fz_eingetragen"      => $data["fz_eingetragen"],
    ":fz_abgelaufen"       => $data["fz_abgelaufen"],
    ":fz_kontrolliert"     => $data["fz_kontrolliert"],
    ":fz_kontrolliert_am"  => $data["fz_kontrolliert_am"],
    ":gs_eingetragen"      => $data["gs_eingetragen"],
    ":gs_erneuert"         => $data["gs_erneuert"],
    ":gs_kontrolliert"     => $data["gs_kontrolliert"],
    ":us_eingetragen"      => $data["us_eingetragen"],
    ":us_abgelaufen"       => $data["us_abgelaufen"],
    ":us_kontrolliert"     => $data["us_kontrolliert"],
    ":sve_eingetragen"     => $data["sve_eingetragen"],
    ":sve_kontrolliert"    => $data["sve_kontrolliert"],
    ":hauptamt"            => $hauptamt
  ]);

  echo json_encode(["success" => true, "message" => "Mitarbeiter erfolgreich hinzugefügt."]);
} catch (PDOException $e) {
  // Duplicate key error (SQLSTATE 23000, MySQL error 1062)
  $info = $e->errorInfo;
  if (isset($info[0], $info[1]) && $info[0] === '23000' && $info[1] === 1062
      && stripos($info[2], "for key 'email'") !== false) {
    http_response_code(409);
    echo json_encode([
      "success" => false,
      "message" => "Ein Mitarbeiter mit dieser E-Mail-Adresse existiert bereits."
    ]);
  } else {
    http_response_code(500);
    echo json_encode([
      "success" => false,
      "message" => "Fehler beim Einfügen des Mitarbeiters.",
      "error"   => $e->getMessage()
    ]);
  }
} catch (Throwable $t) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Unerwarteter Fehler: " . $t->getMessage()
  ]);
}
?>