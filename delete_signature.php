<?php
session_start(); // Iniciar la sesión

// Comprobar si el usuario está logueado, si no, actuar
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // Es una petición AJAX (espera JSON), devolver un error JSON
    header('Content-Type: application/json');
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'No autorizado. Inicie sesión.']);
    exit; // Detener ejecución
}

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

// Get the filename from the POST body
$data = json_decode(file_get_contents('php://input'), true);
$filename = $data['filename'] ?? null;

// Validate filename
if (empty($filename)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'No se proporcionó el nombre del archivo.']);
    exit;
}

// Basic security check: prevent directory traversal and ensure it's likely an HTML file
if (strpos($filename, '..') !== false || !preg_match('/^[a-zA-Z0-9_\-]+\.html$/', $filename)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Nombre de archivo no válido.']);
    exit;
}

$filepath = 'signatures/' . $filename;

// Check if file exists
if (!file_exists($filepath)) {
    http_response_code(404); // Not Found
    echo json_encode(['error' => 'El archivo de firma no existe.']);
    exit;
}

// Attempt to delete the file
if (unlink($filepath)) {
    echo json_encode(['success' => true, 'message' => "Firma '{$filename}' eliminada correctamente."]);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => "No se pudo eliminar la firma '{$filename}'."]);
}

?> 