<?php
require_once "../config.php";
require_once '../../middleware/authMiddleware.php';

// check auth
$userData = authenticateRequest();

// Only Admins are allowed to delete employees
if ($userData['role_id'] != 1) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Zugriff verweigert."]);
    exit();
}

// Handle preflight (OPTIONS request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// DELETE-request for deleting an employee
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Daten aus der URL holen (id)
    parse_str(file_get_contents("php://input"), $data);
    $id = $_GET['id'] ?? null;

    if (!$id) {
        echo json_encode(['error' => 'Fehlende ID']);
        http_response_code(400); // Bad Request
        exit;
    }

    try {
        $sql = "DELETE FROM gp_employees WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        $stmt->execute();

        // check if employee was deleted
        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Mitarbeiter erfolgreich gelöscht']);
        } else {
            echo json_encode(['error' => 'Mitarbeiter nicht gefunden']);
            http_response_code(404); // Not Found
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]);
        http_response_code(500); // Internal Server Error
    }
} else {
    echo json_encode(['error' => 'Method Not Allowed']);
    http_response_code(405); // Method Not Allowed
}
?>
