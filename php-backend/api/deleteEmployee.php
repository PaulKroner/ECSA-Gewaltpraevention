<?php
require_once "config.php"; // Verbindung zur Datenbank einbinden

// DELETE-Anfrage für den Mitarbeiter
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Daten aus der URL holen (id)
    parse_str(file_get_contents("php://input"), $data);
    $id = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(['error' => 'Fehlende ID']);
        http_response_code(400); // Bad Request
        exit;
    }

    try {
        // Datenbankverbindung (PDO)
        $pdo = new PDO("mysql:host=localhost;dbname=deineDatenbank", "username", "password");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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
