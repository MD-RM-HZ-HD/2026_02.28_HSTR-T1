// js/page-init.js

document.addEventListener('alpine:init', () => {
    
    // === 1. Accordion Component ===
    Alpine.data('accordionItem', (defaultOpen = false) => ({
        open: defaultOpen,
        iconText: defaultOpen ? '−' : '+',
        
        init() {
            // Listen for the "Expand All" signal from the navbar
            window.addEventListener('expand-all', () => {
                this.open = true;
                this.iconText = '−';
            });

            // Listen for the "Collapse All" signal from the navbar
            window.addEventListener('collapse-all', () => {
                this.open = false;
                this.iconText = '+';
            });
        },

        toggle() {
            this.open = !this.open;
            this.iconText = this.open ? '−' : '+';
        }
    }));

    // === 2. Page Settings Component (Font, Theme, Modal) ===
    Alpine.data('pageSettings', () => ({
        darkMode: localStorage.getItem('darkMode') === 'true',
        fontSize: parseInt(localStorage.getItem('fontSize')) || 18,
        showIntroModal: !localStorage.getItem('introModalSeen'),
        
        init() {
            this.applyFontSize();

            // Watch for storage changes (if user changes settings in another tab)
            window.addEventListener('storage', () => {
                this.darkMode = localStorage.getItem('darkMode') === 'true';
                this.fontSize = parseInt(localStorage.getItem('fontSize')) || 18;
                this.applyFontSize();
            });

            // Listen for font changes from the Navbar Tools
            window.addEventListener('font-change', (e) => {
                this.changeFontSize(e.detail);
            });

            // Listen for font reset
            window.addEventListener('font-reset', () => {
                this.resetFontSize();
            });

            // Listen for theme toggle
            window.addEventListener('theme-toggle', () => {
                this.toggleDarkMode();
            });
        },

        applyFontSize() {
            document.documentElement.style.setProperty('--content-font-size', this.fontSize + 'px');
        },

        changeFontSize(amount) {
            this.fontSize += amount;
            // Constraints: Min 14px, Max 32px
            if (this.fontSize > 32) this.fontSize = 32;
            if (this.fontSize < 14) this.fontSize = 14;
            
            // Save and Apply
            localStorage.setItem('fontSize', this.fontSize);
            this.applyFontSize();
        },

        resetFontSize() {
            this.fontSize = 18;
            localStorage.setItem('fontSize', 18);
            this.applyFontSize();
        },

        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode);
        },
        
        closeModal() {
            this.showIntroModal = false;
            localStorage.setItem('introModalSeen', 'true');
        }
    }));
});