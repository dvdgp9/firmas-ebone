<?php
session_start(); // Iniciar la sesión

// Comprobar si el usuario está logueado, si no, redirigir a login.php
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // Si es una petición AJAX, devolver un error JSON
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        header('Content-Type: application/json');
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'No autorizado. Inicie sesión.']);
    } else {
        // Si no es AJAX, redirigir
        header('location: login.php');
    }
    exit;
}

header('Content-Type: application/json');

$signatures_dir = 'signatures';
$signatures = [];

if (is_dir($signatures_dir)) {
    // Use scandir and array_diff to exclude . and ..
    $files = array_diff(scandir($signatures_dir), array('.', '..'));

    foreach ($files as $file) {
        // Basic check to ensure it's likely one of our signature files
        if (is_file($signatures_dir . '/' . $file) && pathinfo($file, PATHINFO_EXTENSION) === 'html') {
            $signatures[] = [
                'filename' => $file,
                // We could potentially add modification time if needed later
                // 'modified' => filemtime($signatures_dir . '/' . $file)
            ];
        }
    }

    // Optional: Sort signatures, e.g., by filename or modification time
    // For now, sort alphabetically by filename
    usort($signatures, function ($a, $b) {
        return strcmp($a['filename'], $b['filename']);
    });

}

echo json_encode($signatures);

?> 