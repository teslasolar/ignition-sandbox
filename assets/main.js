/* Ignition Sandbox - Shared JavaScript */

// Copy to clipboard utility
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

// Auto-bind copy buttons
document.addEventListener('DOMContentLoaded', () => {
    // Copy buttons with data-copy attribute
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-copy');
            const target = document.getElementById(targetId);
            if (target) {
                copyToClipboard(target.textContent, btn);
            }
        });
    });

    // Clickable code blocks
    document.querySelectorAll('code[id]').forEach(code => {
        code.addEventListener('click', () => {
            const btn = document.querySelector(`[data-copy="${code.id}"]`);
            if (btn) {
                copyToClipboard(code.textContent, btn);
            } else {
                navigator.clipboard.writeText(code.textContent);
            }
        });
    });
});

// Fetch and display sandbox status
async function checkSandboxStatus(statusEl) {
    if (!statusEl) return;

    try {
        const resp = await fetch('https://teslasolar.github.io/ignition-sandbox/', {
            method: 'HEAD',
            mode: 'no-cors'
        });
        statusEl.innerHTML = '<span style="color:#238636">● Online</span>';
    } catch {
        statusEl.innerHTML = '<span style="color:#d29922">● Checking...</span>';
    }
}

// Export for modules
if (typeof module !== 'undefined') {
    module.exports = { copyToClipboard, checkSandboxStatus };
}
