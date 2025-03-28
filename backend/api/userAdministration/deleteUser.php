<?php
require_once "../config.php";
// Handle preflight (OPTIONS request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// DELETE-request for deleting a user
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $data);
    $id = $_GET['id'] ?? null;

    if (!$id) {
        echo json_encode(['error' => 'Fehlende ID']);
        http_response_code(400); // Bad Request
        exit;
    }

    try {
        $sql = "DELETE FROM gp_users WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        $stmt->execute();

        // check if user was deleted
        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'User erfolgreich gelöscht']);
        } else {
            echo json_encode(['error' => 'User nicht gefunden']);
            http_response_code(404); // Not Found
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]);
        http_response_code(500); // Internal Server Error
    }
} else {
    // Falsche Anfrage
    echo json_encode(['error' => 'Method Not Allowed']);
    http_response_code(405); // Method Not Allowed
}
?>
