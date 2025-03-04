<?php
require_once '../config.php';

try {
  $stmt = $pdo->query("SELECT * FROM gp_users");
  $rows = $stmt->fetchAll();

  echo json_encode($rows, JSON_PRETTY_PRINT);
} catch (PDOException $e) {
  echo json_encode(["success" => false, "message" => "Datenbankfehler: " . $e->getMessage()]);
}
?>