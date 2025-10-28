<?php
session_start(); // Iniciar la sesión

// Comprobar si el usuario está logueado, si no, redirigir a login.php
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // Si es una petición AJAX (común en estos scripts), devolver un error JSON
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get POST data
    $name = $_POST['name'] ?? '';
    $position = $_POST['position'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $branch = $_POST['branch'] ?? '';

    // Basic validation
    if (empty($name) || empty($position) || empty($email) || empty($phone) || empty($branch)) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Todos los campos son obligatorios.']);
        exit;
    }

    // --- Determine Template Path based on Branch ---
    $template_path = null;
    switch ($branch) {
        case 'grupo_ebone':
            $template_path = 'templates/grupo_ebone.html';
            break;
        case 'ebone_servicios':
            $template_path = 'templates/ebone_servicios.html';
            break;
        case 'cubofit':
            $template_path = 'templates/cubofit.html';
            break;
        case 'uniges3':
            $template_path = 'templates/uniges3.html';
            break;
        default:
            http_response_code(400); // Bad Request
            echo json_encode(['error' => 'Delegación seleccionada no válida.']);
            exit;
    }

    if ($template_path === null) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Plantilla no disponible para la delegación seleccionada.']);
        exit;
    }
    // ------

    if (!file_exists($template_path)) {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'No se encontró la plantilla para la delegación seleccionada.']);
        exit;
    }

    // Read the template file
    $template_content = file_get_contents($template_path);
    if ($template_content === false) {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'Error al leer la plantilla.']);
        exit;
    }

    // Format phone number for display (e.g., 609 335 556)
    $display_phone = $phone; // Default to original if formatting fails
    $cleaned_phone = preg_replace('/[^0-9]/', '', $phone);
    if (strlen($cleaned_phone) === 9) {
        $display_phone = substr($cleaned_phone, 0, 3) . ' ' . substr($cleaned_phone, 3, 3) . ' ' . substr($cleaned_phone, 6, 3);
    }

    // Replace placeholders
    $replacements = [
        '{{NAME}}' => htmlspecialchars($name),
        '{{POSITION}}' => htmlspecialchars($position),
        '{{EMAIL}}' => htmlspecialchars($email),
        '{{PHONE}}' => htmlspecialchars($cleaned_phone), // Use cleaned phone for tel: link
        '{{DISPLAY_PHONE}}' => htmlspecialchars($display_phone) // Use formatted phone for display
    ];

    $generated_html_fragment = str_replace(array_keys($replacements), array_values($replacements), $template_content);

    // --- Wrap fragment in full HTML document with UTF-8 charset declaration ---
    $full_html = "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Firma: " . htmlspecialchars($name) . "</title>\n    <style> body { margin: 0; padding: 0; } </style> <!-- Basic reset -->\n</head>\n<body>\n" . $generated_html_fragment . "\n</body>\n</html>";
    // ------

    // Generate filename (nombre-branch-diamesaño.html)
    $safe_name = preg_replace('/[^a-zA-Z0-9_\-](\.html)?$/', '', strtolower($name)); // Keep only safe chars, remove trailing .html if present
    $safe_name = str_replace(' ', '_', $safe_name); // Replace spaces with underscores
    $current_date = date('dmY'); // Format: ddmmyyyy
    $filename = "{$safe_name}-{$branch}-{$current_date}.html";
    $filepath = 'signatures/' . $filename;

    // Check if file with this exact name (name-branch-date) already exists.
    // If it does, add a counter to make it unique.
    $counter = 1;
    while (file_exists($filepath)) {
        $filename = "{$safe_name}-{$branch}-{$current_date}-{$counter}.html";
        $filepath = 'signatures/' . $filename;
        $counter++;
    }

    // Save the generated signature (using the full HTML)
    if (file_put_contents($filepath, $full_html) === false) {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'Error al guardar la firma generada.']);
        exit;
    }

    // Return success response with the *fragment* HTML
    echo json_encode([
        'success' => true,
        'filename' => $filename,
        'html' => $generated_html_fragment // Return the FRAGMENT for immediate display
    ]);

} else {
    // Handle non-POST requests (optional: redirect or show error)
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Método no permitido.']);
}

?> 