<?php
function validateResetToken($token) {
    require_once "../config.php";
    
    // Query to check if the token exists and is valid
    $stmt = $pdo->prepare("SELECT * FROM gp_users WHERE reset_token = :token AND reset_token_expiry > NOW()");
    $stmt->bindParam(':token', $token);
    $stmt->execute();
    
    // If a valid token is found
    if ($stmt->rowCount() > 0) {
        return true;
    }
    
    return false; // Invalid or expired token
}

header('Content-Type: application/json');

// Example usage in an API route

ini_set('display_errors', 1);
error_reporting(E_ALL);


if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['token'])) {
  $token = $_GET['token'];
  
  if (validateResetToken($token)) {
      $response = ['valid' => true, 'message' => 'Token is valid'];
  } else {
      $response = ['valid' => false, 'message' => 'Token is invalid'];
  }
  echo json_encode([$response]);
} else {
  $response = ['valid' => false, 'message' => 'Token not provided'];
}
?>