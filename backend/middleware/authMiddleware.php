<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function getAuthorizationHeader() {
  if (function_exists('getallheaders')) {
      $headers = getallheaders();
      if (isset($headers['Authorization'])) {
          return $headers['Authorization'];
      } elseif (isset($headers['authorization'])) {
          return $headers['authorization'];
      }
  }

  if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
      return $_SERVER['HTTP_AUTHORIZATION'];
  } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
      return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
  }

  return null;
}

/**
 * Authenticates the request using JWT.
 *
 * @return array The decoded JWT payload.
 */
function authenticateRequest() {
  $header = getAuthorizationHeader();

  if (!$header) {
      http_response_code(401);
      echo json_encode(["success" => false, "message" => "Authorization-Header fehlt."]);
      exit();
  }

  if (preg_match('/Bearer\s(\S+)/', $header, $matches)) {
      $jwt = $matches[1];
  } else {
      http_response_code(401);
      echo json_encode(["success" => false, "message" => "Ungültiger Authorization-Header."]);
      exit();
  }

  try {
      $secret_key = getenv('JWT_SECRET_KEY');
      if (!$secret_key) {
          throw new Exception("JWT_SECRET_KEY nicht gesetzt.");
      }

      $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));

      return (array)$decoded;
  } catch (Exception $e) {
      http_response_code(401);
      echo json_encode([
          "success" => false,
          "message" => "Token ungültig oder abgelaufen: " . $e->getMessage()
      ]);
      exit();
  }
}

