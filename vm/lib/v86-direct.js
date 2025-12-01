// Direct V86 Loader - Simple and reliable
console.log('[V86] Starting direct loader...');

// Load v86 directly from copy.sh CDN
(function() {
    // Skip if already loaded
    if (typeof V86Starter !== 'undefined') {
        console.log('[V86] Already loaded');
        return;
    }

    console.log('[V86] Loading from copy.sh CDN...');

    // Create script element for v86
    const script = document.createElement('script');
    script.src = 'https://copy.sh/v86/build/libv86.js';

    script.onload = function() {
        console.log('[V86] Script loaded, checking V86Starter...');

        // Check if V86Starter is available
        setTimeout(function() {
            if (typeof V86Starter !== 'undefined') {
                console.log('[V86] ✓ V86Starter is available!');
                console.log('[V86] Type:', typeof V86Starter);

                // Dispatch event
                window.dispatchEvent(new Event('v86-ready'));

                // Update status if element exists
                if (document.getElementById('bootLog')) {
                    const log = document.getElementById('bootLog');
                    log.innerHTML = '<div class="success">✓ V86 emulator loaded successfully</div>' + log.innerHTML;
                }
            } else {
                console.error('[V86] V86Starter not found after load');
            }
        }, 100);
    };

    script.onerror = function(e) {
        console.error('[V86] Failed to load from CDN:', e);

        // Show error to user
        if (document.getElementById('bootLog')) {
            document.getElementById('bootLog').innerHTML =
                '<div class="error">Failed to load V86 emulator. Please check your internet connection.</div>';
        }
    };

    // Add to document
    document.head.appendChild(script);
    console.log('[V86] Script tag added to document');
})();