<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

echo json_encode(["success" => true, "message" => "CORS test erfolgreich!"]);
?>
