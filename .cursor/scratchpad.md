# Background and Motivation

Crear una nueva firma “Firma Navidad” basada en la plantilla actual de Grupo Ebone sustituyendo el logo por la imagen navideña proporcionada, y exponerla como opción generable en la aplicación.

# Key Challenges and Analysis

- Confirmar configuración Git local (nombre/email) por si el commit falla.
- Decidir si incluir `.gitignore` antes del commit inicial (pendiente de preferencia del usuario).

# High-level Task Breakdown

1) Revisar plantilla actual de Grupo Ebone y la lógica de selección/generación para usarla como base.
   - Success: ubicadas plantilla y branch correspondiente en backend/frontend.
2) Crear plantilla “firma_navidad” clonada de Grupo Ebone reemplazando el logo por la imagen navideña (archivo local o URL).
   - Success: nuevo archivo en `templates/` con placeholders funcionales y nueva imagen.
3) Añadir opción de branch “firma_navidad” en UI y en `generate_signature.php`.
   - Success: botón visible/seleccionable, switch del backend acepta branch y genera con la nueva plantilla.
4) Probar generación y guardado.
   - Success: firma renderiza con imagen navideña y se guarda con nombre `*-firma_navidad-*.html`.

# Project Status Board

- [ ] Revisar plantilla y lógica de Grupo Ebone como base
- [x] Crear plantilla “firma_navidad” con imagen navideña
- [x] Exponer branch “firma_navidad” en UI y backend
- [ ] Probar generación/guardado de “firma_navidad”

# Current Status / Progress Tracking

- Modo: Executor
- Nueva tarea en curso: añadir firma “Firma Navidad”.
- Avances: clonada plantilla `grupo_ebone` a `templates/firma_navidad.html` reemplazando el logo por `https://ebone.es/wp-content/uploads/2025/12/firma-navidad.png`. Añadido branch en UI (botón) y en switch de `generate_signature.php`.

# Executor's Feedback or Assistance Requests

- Siguiente paso recomendado: añadir un `.gitignore` adecuado (stack PHP) y eliminar `/.DS_Store` del repo con un commit de limpieza.
- Proponer commit y push de los cambios del modal y la retirada de "Firmas Anteriores".

# Lessons

- Evitar commitear archivos de sistema como `.DS_Store`; añadirlos al `.gitignore` desde el inicio.
