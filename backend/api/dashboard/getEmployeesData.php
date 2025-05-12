<?php
require_once '../config.php';
require_once '../../middleware/authMiddleware.php';

// check auth
$userData = authenticateRequest();

// SQL-request for getting all employees
try {
    $stmt = $pdo->query("SELECT * FROM gp_employees ORDER BY name ASC");
    $rows = $stmt->fetchAll();

    echo json_encode($rows, JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Datenbankfehler: " . $e->getMessage()]);
}

?>