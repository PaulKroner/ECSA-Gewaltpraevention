<?php
require_once "config.php"; // Verbindung zur Datenbank einbinden
// Handle preflight (OPTIONS request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// DELETE-Anfrage für den Mitarbeiter
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
        // Debugging: Überprüfen, ob die ID korrekt empfangen wird
        error_log("Deleting employee with ID: " . $id);

        // SQL-Abfrage vorbereiten
        $sql = "DELETE FROM employees WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        // Abfrage ausführen
        $stmt->execute();

        // Erfolgreiches Löschen prüfen
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
    // Falsche Anfrage
    echo json_encode(['error' => 'Method Not Allowed']);
    http_response_code(405); // Method Not Allowed
}
?>
