document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signature-form');
    const newlyGeneratedDiv = document.getElementById('newly-generated-signature');
    const branchSelectorDiv = document.getElementById('branch-selector');
    const hiddenBranchInput = document.getElementById('selected_branch');
    // Modal elements
    const signatureModal = document.getElementById('signature-modal');
    const modalDialog = signatureModal ? signatureModal.querySelector('.modal-dialog') : null;
    const modalCloseBtn = signatureModal ? signatureModal.querySelector('.modal-close') : null;
    const modalSignatureContainer = document.getElementById('modal-signature-container');
    const btnCopyHtml = document.getElementById('btn-copy-html');
    const btnCopyPreview = document.getElementById('btn-copy-preview');
    const btnDownloadHtml = document.getElementById('btn-download-html');
    const toastContainer = document.getElementById('toast-container');
    let lastFilename = null;

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

    // --- LocalStorage persistence ---
    const fields = ['name','position','email','phone'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const saved = localStorage.getItem(`sig_${id}`);
        if (saved) el.value = saved;
        el.addEventListener('input', () => localStorage.setItem(`sig_${id}`, el.value));
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
                lastFilename = result.filename;
                // Clear previous new signature and display the new one
                clearContainer(newlyGeneratedDiv);
                displaySignature(result.html, null, result.filename, newlyGeneratedDiv);
                newlyGeneratedDiv.style.display = 'block'; // Ensure section is visible
                // form.reset(); // Remove this line to keep form values
                // Mantener también la vista inferior, además del modal.

                // Also show the same content nicely in a modal
                if (signatureModal && modalSignatureContainer) {
                    clearElement(modalSignatureContainer);
                    displaySignature(result.html, null, result.filename, modalSignatureContainer);
                    // Update download link
                    if (btnDownloadHtml) {
                        btnDownloadHtml.href = `signatures/${result.filename}`;
                    }
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

    async function copyHtmlFromElement(element) {
        const html = element.innerHTML;
        const plain = element.innerText || element.textContent || '';
        try {
            if (navigator.clipboard && window.ClipboardItem) {
                const item = new ClipboardItem({
                    'text/html': new Blob([html], { type: 'text/html' }),
                    'text/plain': new Blob([plain], { type: 'text/plain' })
                });
                await navigator.clipboard.write([item]);
                return true;
            }
        } catch (e) {
            // fall through to fallback
        }
        // Fallback: use contenteditable selection to copy rich HTML
        const helper = document.createElement('div');
        helper.contentEditable = 'true';
        helper.style.position = 'fixed';
        helper.style.left = '-9999px';
        helper.innerHTML = html;
        document.body.appendChild(helper);
        const range = document.createRange();
        range.selectNodeContents(helper);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        let ok = false;
        try { ok = document.execCommand('copy'); } catch { ok = false; }
        sel.removeAllRanges();
        document.body.removeChild(helper);
        return ok;
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
        if (password) {
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

        // Add to the specified target container
        targetContainer.appendChild(signatureContainer);
    }

    // --- Toast helpers ---
    function showToast(message, type='success') {
        if (!toastContainer) return;
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = message;
        toastContainer.appendChild(t);
        setTimeout(() => { t.classList.add('show'); }, 10);
        setTimeout(() => { t.classList.remove('show'); t.remove(); }, 2500);
    }

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch { ok = false; }
            document.body.removeChild(ta);
            return ok;
        }
    }

    // --- Modal actions ---
    if (btnCopyHtml) {
        btnCopyHtml.addEventListener('click', async () => {
            const ta = signatureModal.querySelector('.raw-html-textarea');
            if (!ta) { showToast('No se encontró el HTML', 'error'); return; }
            const ok = await copyText(ta.value);
            showToast(ok ? 'HTML copiado' : 'Error al copiar HTML', ok ? 'success' : 'error');
        });
    }

    if (btnCopyPreview) {
        btnCopyPreview.addEventListener('click', async () => {
            const prev = signatureModal.querySelector('.signature-preview');
            if (!prev) { showToast('No se encontró la vista previa', 'error'); return; }
            const ok = await copyHtmlFromElement(prev);
            showToast(ok ? 'Vista previa copiada' : 'Error al copiar vista previa', ok ? 'success' : 'error');
        });
    }

    if (btnDownloadHtml) {
        btnDownloadHtml.addEventListener('click', (e) => {
            if (!lastFilename) {
                e.preventDefault();
                showToast('Genera una firma primero', 'error');
            }
        });
    }

    // --- Delete Signature Function (works with newly generated container) ---
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
                    // Hide the newly generated section if its entry is deleted
                    newlyGeneratedDiv.style.display = 'none';
                    signatureContainer.remove();
                    alert(result.message);
                } else {
                    alert(`Error al eliminar: ${result.error || 'Error desconocido del servidor.'}`);
                }
            } catch (error) {
                console.error('Error deleting signature:', error);
                alert('Error de conexión al intentar eliminar la firma.');
            }
        }
    }

    // --- Initial Load ---
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
