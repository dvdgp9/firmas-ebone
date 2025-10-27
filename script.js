document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signature-form');
    const newlyGeneratedDiv = document.getElementById('newly-generated-signature');
    const previousSignaturesDiv = document.getElementById('previous-signatures');
    const branchSelectorDiv = document.getElementById('branch-selector');
    const hiddenBranchInput = document.getElementById('selected_branch');
    // Modal elements
    const signatureModal = document.getElementById('signature-modal');
    const modalDialog = signatureModal ? signatureModal.querySelector('.modal-dialog') : null;
    const modalCloseBtn = signatureModal ? signatureModal.querySelector('.modal-close') : null;
    const modalSignatureContainer = document.getElementById('modal-signature-container');

    // --- Branch Button Logic ---
    branchSelectorDiv.addEventListener('click', (event) => {
        if (event.target.classList.contains('branch-button')) {
            // Remove active class from all buttons
            branchSelectorDiv.querySelectorAll('.branch-button').forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            event.target.classList.add('active');
            // Update the hidden input value
            hiddenBranchInput.value = event.target.dataset.branch;
            // Optional: Clear form or take other actions when branch changes
        }
    });

    // --- Form Submission Logic ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(form);
        // Append the selected branch from the hidden input (already named 'branch')
        // formData.append('branch', hiddenBranchInput.value); // No need, it's already in the form

        const statusDiv = document.createElement('div'); // To show loading/error messages
        statusDiv.style.marginTop = '10px';
        form.insertAdjacentElement('afterend', statusDiv);

        statusDiv.textContent = 'Generando firma...';
        statusDiv.style.color = 'blue';

        try {
            const response = await fetch('generate_signature.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            statusDiv.remove(); // Remove loading message

            if (response.ok && result.success) {
                // Clear previous new signature and display the new one
                clearContainer(newlyGeneratedDiv);
                displaySignature(result.html, result.password, result.filename, newlyGeneratedDiv);
                newlyGeneratedDiv.style.display = 'block'; // Ensure section is visible
                // form.reset(); // Remove this line to keep form values
                // Maybe reload previous signatures in case the new one matches an old one?
                // Or add it to previous signatures automatically after some time/action?
                // For now, just displays in the new section.

                // Also show the same content nicely in a modal
                if (signatureModal && modalSignatureContainer) {
                    clearElement(modalSignatureContainer);
                    displaySignature(result.html, result.password, result.filename, modalSignatureContainer);
                    openModal();
                }
            } else {
                alert(`Error: ${result.error || 'No se pudo generar la firma.'}`);
            }
        } catch (error) {
            console.error('Error sending request:', error);
            statusDiv.remove();
            alert('Error de conexión al generar la firma.');
        }
    });

    // --- Clear container helper function ---
    function clearContainer(containerElement) {
        while (containerElement.children.length > 1) { // Keep the H2
            containerElement.removeChild(containerElement.lastChild);
        }
    }

    // --- Clear all children helper ---
    function clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // --- Display Signature Function (Modified to accept target container) ---
    function displaySignature(htmlContent, password = null, filename, targetContainer) {
        const signatureContainer = document.createElement('div');
        signatureContainer.classList.add('signature-entry');
        signatureContainer.dataset.filename = filename;

        const signatureDetails = document.createElement('div');
        signatureDetails.classList.add('signature-details');

        // --- Display Raw HTML Code ---
        const rawHtmlTitle = document.createElement('h4');
        rawHtmlTitle.textContent = 'Código HTML de la Firma:';
        const rawHtmlTextArea = document.createElement('textarea');
        rawHtmlTextArea.classList.add('raw-html-textarea');
        rawHtmlTextArea.value = htmlContent;
        rawHtmlTextArea.readOnly = true;
        rawHtmlTextArea.rows = 10;

        const copyHtmlButton = document.createElement('button');
        copyHtmlButton.textContent = 'Copiar HTML';
        copyHtmlButton.classList.add('copy-html-button');
        copyHtmlButton.addEventListener('click', () => {
            rawHtmlTextArea.select();
            try {
                navigator.clipboard.writeText(rawHtmlTextArea.value).then(() => {
                    copyHtmlButton.textContent = '¡Copiado!';
                    setTimeout(() => { copyHtmlButton.textContent = 'Copiar HTML'; }, 2000);
                }, (err) => {
                    console.error('Error al copiar HTML: ', err);
                    alert('Error al copiar el HTML.');
                });
            } catch (err) {
                 console.error('Error al copiar HTML (fallback might be needed): ', err);
                 alert('Error al copiar el HTML. Es posible que tu navegador no sea compatible.');
            }
        });

        // --- Display Rendered Preview ---
        const htmlPreviewTitle = document.createElement('h4');
        htmlPreviewTitle.textContent = 'Vista Previa de la Firma:';
        const signaturePreview = document.createElement('div');
        signaturePreview.classList.add('signature-preview');
        signaturePreview.innerHTML = htmlContent;

        // --- Assemble the common elements ---
        signatureDetails.appendChild(rawHtmlTitle);
        signatureDetails.appendChild(rawHtmlTextArea);
        signatureDetails.appendChild(copyHtmlButton);
        signatureDetails.appendChild(htmlPreviewTitle);
        signatureDetails.appendChild(signaturePreview);

        // --- Conditionally Display Password ---
        if (password !== null) {
            const passwordTitle = document.createElement('h4');
            passwordTitle.textContent = 'Contraseña Email:';
            const passwordDisplay = document.createElement('p');
            passwordDisplay.classList.add('password-display');
            passwordDisplay.textContent = password;

            signatureDetails.appendChild(passwordTitle);
            signatureDetails.appendChild(passwordDisplay);
        }

        // --- Add Delete Button ---
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', handleDelete);
        signatureDetails.appendChild(deleteButton);


        signatureContainer.appendChild(signatureDetails);

        // Add a separator (only needed for previous signatures)
        if (targetContainer === previousSignaturesDiv) {
            const separator = document.createElement('hr');
            signatureContainer.appendChild(separator);
        }

        // Add to the specified target container
        targetContainer.appendChild(signatureContainer);
    }

    // --- Delete Signature Function (Unchanged logic, works with either container) ---
    async function handleDelete(event) {
        const signatureContainer = event.target.closest('.signature-entry');
        const filenameToDelete = signatureContainer.dataset.filename;

        if (confirm(`¿Estás seguro de que quieres eliminar la firma ${filenameToDelete}?`)) {
            try {
                const response = await fetch('delete_signature.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: filenameToDelete })
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    // Also hide the newly generated section if its entry is deleted
                    if (signatureContainer.parentElement === newlyGeneratedDiv) {
                        newlyGeneratedDiv.style.display = 'none';
                    }
                    signatureContainer.remove();
                    alert(result.message);
                    // Potentially reload previous signatures if a match was deleted?
                    // loadExistingSignatures(); // Could be added here
                } else {
                    alert(`Error al eliminar: ${result.error || 'Error desconocido del servidor.'}`);
                }
            } catch (error) {
                console.error('Error deleting signature:', error);
                alert('Error de conexión al intentar eliminar la firma.');
            }
        }
    }

    // --- Load Existing Signatures Function (Modified target) ---
    async function loadExistingSignatures() {
        try {
            const response = await fetch('list_signatures.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const signatures = await response.json();

            clearContainer(previousSignaturesDiv); // Clear the correct div

            if (signatures.length === 0) {
                const noSignaturesMsg = document.createElement('p');
                noSignaturesMsg.textContent = 'No hay firmas anteriores guardadas todavía.';
                noSignaturesMsg.id = 'no-signatures-message';
                previousSignaturesDiv.appendChild(noSignaturesMsg);
            } else {
                const existingMsg = document.getElementById('no-signatures-message');
                if (existingMsg) existingMsg.remove();

                for (const signature of signatures) {
                    try {
                        const sigResponse = await fetch(`signatures/${signature.filename}`);
                        if (!sigResponse.ok) {
                            console.warn(`Could not load content for ${signature.filename}`);
                            continue;
                        }
                        const htmlContent = await sigResponse.text();
                        // Display in the previous signatures section
                        displaySignature(htmlContent, null, signature.filename, previousSignaturesDiv);
                    } catch (fetchError) {
                        console.error(`Error fetching content for ${signature.filename}:`, fetchError);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading existing signatures:', error);
            const errorMsg = document.createElement('p');
            errorMsg.textContent = 'Error al cargar las firmas anteriores.';
            errorMsg.style.color = 'red';
            clearContainer(previousSignaturesDiv);
            previousSignaturesDiv.appendChild(errorMsg);
        }
    }

    // --- Initial Load ---
    loadExistingSignatures();
    // Initially hide the newly generated section
    newlyGeneratedDiv.style.display = 'none';

    // --- Modal logic ---
    function openModal() {
        signatureModal.classList.add('show');
        signatureModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        signatureModal.classList.remove('show');
        signatureModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (signatureModal) {
        // Close when clicking outside the dialog
        signatureModal.addEventListener('click', (e) => {
            if (e.target === signatureModal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && signatureModal && signatureModal.classList.contains('show')) {
            closeModal();
        }
    });
});
