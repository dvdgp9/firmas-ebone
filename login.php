<?php
session_start(); // Iniciar la sesión al principio

$password_correcta = "firmaEBO"; // La contraseña maestra
$error = '';

// Si ya está logueado, redirigir a index.php
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header("Location: index.php");
    exit;
}

// Procesar el formulario cuando se envía
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['password']) && $_POST['password'] === $password_correcta) {
        // Contraseña correcta: guardar en sesión y redirigir
        $_SESSION['logged_in'] = true;
        header("Location: index.php");
        exit;
    } else {
        // Contraseña incorrecta
        $error = "Contraseña incorrecta.";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Creador Firmas</title>
    <link rel="stylesheet" href="style.css">
    <style>
        /* Estilos básicos para el login */
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f0f2f5; /* Un gris claro más suave */
            font-family: 'Montserrat', sans-serif; /* Tipografía Montserrat */
            margin: 0;
        }
        .login-container {
            background-color: #fff;
            padding: 40px; /* Más padding */
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Sombra más definida */
            text-align: center;
            width: 100%;
            max-width: 450px; /* Aumentado el ancho máximo del contenedor */
            box-sizing: border-box;
        }
        .login-logo {
             max-width: 180px; /* Ajusta según el tamaño de tu logo */
             margin-bottom: 25px; /* Espacio debajo del logo */
        }
        .login-container h2 {
            margin-bottom: 25px;
            color: #333;
            font-size: 1.5em; /* Tamaño de título ligeramente mayor */
        }
        .login-container label {
            display: block;
            margin-bottom: 8px;
            text-align: center; /* Alinear etiqueta a la izquierda */
            color: #555;
            font-weight: 600;
        }
        .login-container input[type="password"] {
            width: 100%; /* Ocupar todo el ancho */
            padding: 12px; /* Más padding interno */
            margin-bottom: 20px; /* Más espacio inferior */
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box; /* Incluir padding en el width */
            font-size: 1em;
        }
        .login-container form { /* Estilos para el formulario */
            display: flex;
            flex-direction: column;
            gap: 15px; /* Espacio entre label, input y button */
        }
        .login-container button {
            padding: 12px 25px;
            background-color: #23AAC5; /* Nuevo color principal */
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            width: 100%; /* Botón ancho completo */
            font-size: 1em;
            font-weight: 600;
        }
        .login-container button:hover {
            background-color: #1d8a9e; /* Tono más oscuro de #23AAC5 */
        }
        .error-message {
            color: #d9534f; /* Rojo para errores */
            margin-top: 20px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <img src="images/logo-grupo.png" alt="Logo Grupo" class="login-logo"> <!-- Logo añadido -->
        <h2>Acceso al Generador de firmas del Grupo Ebone</h2>
        <form action="login.php" method="post">
            <label for="password">Contraseña:</label> <!-- Quitado div y estilo inline -->
            <input type="password" id="password" name="password" required>
            <button type="submit">Entrar</button>
        </form>
        <?php if (!empty($error)): ?>
            <p class="error-message"><?php echo htmlspecialchars($error); ?></p>
        <?php endif; ?>
    </div>
</body>
</html> 