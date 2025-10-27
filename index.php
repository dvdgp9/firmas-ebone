<?php
session_start(); // Iniciar la sesión

// Comprobar si el usuario está logueado, si no, redirigir a login.php
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("location: login.php");
    exit; // Asegurarse de que el script se detiene después de la redirección
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generador de Firmas Ebone</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Generador de Firmas</h1>
    <div style="text-align: center; margin-bottom: 20px;">
        <p style="margin: 5px 0; color: #666; font-size: 0.95em;">
            📖 <a href="https://wiki.ebone.es/docs/como-anadir-la-firma-en-el-grupo-ebone-cualquier-linea-al-webmail/" target="_blank" style="color: #23AAC5; text-decoration: none;">
                Guía: Cómo añadir la firma generada al Webmail
            </a>
        </p>
    </div>
    <div style="position: absolute; top: 15px; right: 15px; z-index: 10;">
        <a href="logout.php" style="text-decoration: none; color: #fff; background-color: #d9534f; padding: 8px 12px; border-radius: 4px; font-size: 0.9em;">Cerrar Sesión</a>
    </div>

    <div id="branch-selector" class="branch-selector">
        <h3>Línea de Negocio:</h3>
        <button data-branch="grupo_ebone" class="branch-button active">Grupo Ebone</button>
        <button data-branch="ebone_servicios" class="branch-button">Ebone Servicios</button>
        <button data-branch="cubofit" class="branch-button">CUBOFIT</button>
        <button data-branch="uniges3" class="branch-button">Uniges-3</button>
    </div>

    <form id="signature-form">
        <input type="hidden" id="selected_branch" name="branch" value="grupo_ebone"> <!-- Hidden input to store selected branch -->

        <div class="form-field-group">
            <label for="name">Nombre:</label>
            <input type="text" id="name" name="name" required>
        </div>

        <div class="form-field-group">
            <label for="position">Cargo:</label>
            <input type="text" id="position" name="position" required>
        </div>

        <div class="form-field-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
        </div>

        <div class="form-field-group">
            <label for="phone">Teléfono:</label>
            <input type="tel" id="phone" name="phone" required>
        </div>

        <div class="form-field-group">
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" required>
        </div>

        <button type="submit">Generar Firma</button>
    </form>

    <div id="newly-generated-signature">
        <h2>Firma Generada</h2>
        <!-- Newly generated signature will appear here -->
    </div>

    <div id="previous-signatures">
        <h2>Firmas Anteriores</h2>
        <!-- Existing signatures will be loaded here -->
    </div>

    <script src="script.js"></script>
</body>
</html>
