<?php
require_once "../config.php";
require_once '../../middleware/authMiddleware.php';

header('Content-Type: application/json');

// check auth
$userData = authenticateRequest();

// Only Admins are allowed to delete employees
if ($userData['role_id'] != 1) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Zugriff verweigert."]);
    exit();
}

// OPTIONS-Preflight-requests
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Ungültige Anfrage."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// check if all required data is set
if (!isset($data["email"], $data["password"], $data["role"], $data["name"], $data["vorname"])) {
    echo json_encode(["success" => false, "message" => "Fehlende Daten."]);
    exit;
}

// input data cleaning and validation
$email = trim(strtolower($data["email"]));
$password = $data["password"];
$role = intval($data["role"]); // check if role is an integer
$name = trim($data["name"]);
$vorname = trim($data["vorname"]);

try {
    // check if email is already registered
    $stmt = $pdo->prepare("SELECT id FROM gp_users WHERE email = :email");
    $stmt->execute([":email" => $email]);

    if ($stmt->fetch()) {
      http_response_code(400); // <<< HTTP-Status setzen
      echo json_encode(["success" => false, "message" => "Diese E-Mail-Adresse ist bereits registriert."]);
      exit;
  }

    // hash passwort
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    $sql = "INSERT INTO gp_users (email, password, role_id, name, vorname) 
            VALUES (:email, :password, :role_id, :name, :vorname)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":email" => $email,
        ":password" => $hashedPassword,
        ":role_id" => $role,
        ":name" => $name,
        ":vorname" => $vorname
    ]);

    echo json_encode(["success" => true, "message" => "Registrierung war erfolgreich!"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Fehler bei der Registrierung.", "error" => $e->getMessage()]);
}
?>
