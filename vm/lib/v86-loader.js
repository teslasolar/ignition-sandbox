// V86 Loader - Loads v86 emulator from CDN with fallback
(function() {
    // Try primary CDN
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/v86@latest/build/libv86.js';
    script.onerror = function() {
        console.warn('Primary v86 CDN failed, trying fallback...');
        // Fallback to another CDN
        var fallback = document.createElement('script');
        fallback.src = 'https://cdn.jsdelivr.net/npm/v86@latest/build/libv86.js';
        fallback.onerror = function() {
            console.error('All v86 CDN sources failed. Please check your internet connection.');
            // Final fallback - use basic emulation
            window.V86Starter = function(options) {
                console.error('V86 emulator not available. Using placeholder.');
                this.screen_container = options.screen_container;
                if (this.screen_container) {
                    this.screen_container.innerHTML = '<div style="color:#f00;padding:20px;">Error: V86 emulator failed to load. Please refresh the page or check your internet connection.</div>';
                }
                this.add_listener = function() {};
                this.keyboard_send_text = function() {};
                this.stop = function() {};
                this.restart = function() {};
                this.destroy = function() {};
            };
        };
        document.head.appendChild(fallback);
    };
    script.onload = function() {
        console.log('V86 emulator loaded successfully');
    };
    document.head.appendChild(script);
})();