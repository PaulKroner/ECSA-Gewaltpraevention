<?php
require_once '../config.php';
require_once '../../middleware/authMiddleware.php';

// check auth
$userData = authenticateRequest();

// Only Admins are allowed to delete employees
if ($userData['role_id'] != 1) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Zugriff verweigert."]);
    exit();
}

try {
  $stmt = $pdo->query("SELECT * FROM gp_users");
  $rows = $stmt->fetchAll();

  echo json_encode($rows, JSON_PRETTY_PRINT);
} catch (PDOException $e) {
  echo json_encode(["success" => false, "message" => "Datenbankfehler: " . $e->getMessage()]);
}
?>