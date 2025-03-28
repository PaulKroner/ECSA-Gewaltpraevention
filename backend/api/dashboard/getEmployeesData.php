<?php
require_once '../config.php';

// SQL-request for getting all employees
try {
    $stmt = $pdo->query("SELECT * FROM gp_employees");
    $rows = $stmt->fetchAll();

    echo json_encode($rows, JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Datenbankfehler: " . $e->getMessage()]);
}

?>