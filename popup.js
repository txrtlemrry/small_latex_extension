// popup.js (Final version for "document flow" layout)

document.addEventListener('DOMContentLoaded', function() {
  const convertBtn = document.getElementById('convert-btn');
  const latexInput = document.getElementById('latex-input');
  const outputArea = document.getElementById('output-area');
  const actionButtons = document.getElementById('action-buttons-container');
  const copyBtn = document.getElementById('copy-btn');
  const saveBtn = document.getElementById('save-btn');

  // Load saved text when the popup opens
  chrome.storage.local.get(['latexInput'], function(result) {
    if (result.latexInput) {
      latexInput.value = result.latexInput;
    }
  });

  // Save text to storage every time the user types
  latexInput.addEventListener('input', function() {
    chrome.storage.local.set({ latexInput: latexInput.value });
  });

  // --- Main Render Function (MODIFIED) ---
  convertBtn.addEventListener('click', function() {
    outputArea.innerHTML = '';
    actionButtons.classList.add('hidden');

    const lines = latexInput.value.trim().split('\n');
    let hasContent = false;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        hasContent = true;
        // Create a temporary container for this line's rendering
        const tempContainer = document.createElement('div');
        try {
          // Render the LaTeX into the temporary container
          katex.render(trimmedLine, tempContainer, {
            throwOnError: true,
            displayMode: true // This creates a <div class="katex-display">...</div>
          });
          // Append the rendered content (not the container itself) to the main output area
          while (tempContainer.firstChild) {
            outputArea.appendChild(tempContainer.firstChild);
          }
        } catch (error) {
          const errorDiv = document.createElement('div');
          errorDiv.innerHTML = `<p class="error-message">${error.message}</p>`;
          outputArea.appendChild(errorDiv);
        }
      }
    });

    if (hasContent) {
      actionButtons.classList.remove('hidden');
    } else {
      outputArea.innerHTML = '<p>Please enter some LaTeX code.</p>';
    }
  });

  // --- Copy to Clipboard Function with High Resolution ---
  copyBtn.addEventListener('click', function() {
    html2canvas(outputArea, { scale: 3 }).then(canvas => {
      canvas.toBlob(function(blob) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy Image'; }, 2000);
        });
      });
    });
  });

  // --- Save as PNG Function with High Resolution ---
  saveBtn.addEventListener('click', function() {
    html2canvas(outputArea, { scale: 3 }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'latex_output.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  });
});