<?php
// Einbinden der Konfigurationsdatei
require_once '../config.php';

// SQL-Abfrage, um alle Benutzer aus der Tabelle 'employees' abzurufen
try {
    $stmt = $pdo->query("SELECT * FROM gp_employees");
    $rows = $stmt->fetchAll();

    // Ausgabe der Daten als JSON
    echo json_encode($rows, JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Datenbankfehler: " . $e->getMessage()]);
}

?>