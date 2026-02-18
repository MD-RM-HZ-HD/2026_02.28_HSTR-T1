// js/nav-loader.js

// === Configuration ===
const NAV_CONFIG = {
  mainLinks: [
    { href: 'index.html', label: 'الرئيسية', isRoot: true },
    // Removed source-text.html as it is now the main index
    { href: 'mindmap.html', label: 'خريطة ذهنية' },
    { href: 'mindmap_interactive.html', label: 'خريطة ذهنية تفاعلية' },
    { href: 'questions.html', label: 'أسئلة الكتاب' },
    { href: 'pdf.html', label: 'PDF ⋒' }, // ✅ تمت إضافة الرابط للديسك توب
  ],
  examLinks: [
    { href: 'qz-true-false.html', label: 'صواب/خطأ' },
    { href: 'qz-mc-in.html', label: 'اختيار تفاعلي' },
    { href: 'qz-fill-blank.html', label: 'املأ الفراغ' },
    { href: 'card-flip.html', label: 'بطاقات مراجعة' },
    { href: 'qz-comparison.html', label: 'جدول مقارنة' }
  ]
};

// === Font & Theme Manager ===
class ToolsManager {
  constructor() {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.init();
  }
  init() {
    this.injectGlobalStyles();
    this.applyTheme();
    document.addEventListener('theme-toggle', () => {
      this.isDarkMode = !this.isDarkMode;
      this.applyTheme();
    });
  }
  injectGlobalStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      
      /* Circular Buttons */
      .tool-btn-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255, 255, 255, 0.2); color: white; transition: all 0.2s; background-color: transparent; cursor: pointer; }
      .tool-btn-circle:hover { background-color: rgba(0, 0, 0, 0.3); transform: scale(1.05); }
      .tool-btn-circle:active { transform: scale(0.95); }

      /* === New Theme Switch Styles === */
      .theme-switch-container {
        width: 54px;
        height: 28px;
        background-color: #e5e7eb; /* Light Gray */
        border-radius: 999px;
        position: relative;
        cursor: pointer;
        transition: background-color 0.3s ease;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
      }
      /* Dark mode background for switch */
      html.dark .theme-switch-container {
        background-color: #374151; /* Dark Gray */
      }

      /* The Slider Knob */
      .theme-switch-slider {
        width: 24px;
        height: 24px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        left: 2px;
        transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      /* Move slider right in dark mode */
      html.dark .theme-switch-slider {
        transform: translateX(26px);
      }

      /* Icons inside the knob */
      .theme-icon {
        position: absolute;
        width: 16px;
        height: 16px;
        transition: opacity 0.3s ease;
      }
      
      /* Sun State */
      .sun-icon { opacity: 1; color: #f59e0b; fill: currentColor; }
      html.dark .sun-icon { opacity: 0; }

      /* Moon State */
      .moon-icon { opacity: 0; color: #f59e0b; fill: currentColor; }
      html.dark .moon-icon { opacity: 1; }

      /* === MOBILE POPUP POSITIONING FIX: Centered on screen === */
      .mobile-popup-sheet {
        position: fixed;
        bottom: 60px; /* Above the fixed mobile nav bar */
        left: 50%; /* New: Position to the center of the screen */
        transform: translateX(-50%); /* New: Pull back by 50% of its own width for true centering */
        background-color: #38a169; 
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        padding: 8px 0;
        z-index: 40;
        min-width: 160px;
      }
    `;
    document.head.appendChild(style);
  }
  applyTheme() {
    if (this.isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }
}

// === HTML Generators ===
function buildPath(href, pageType) {
  if (href === 'index.html') return pageType === 'root' ? './index.html' : '../index.html';
  return pageType === 'root' ? `pages/${href}` : href;
}

function createNavLink(link, pageType, isMobile = false) {
  const href = buildPath(link.href, pageType);
  const textSize = link.isSmall ? 'text-sm' : 'text-base';
  if (isMobile) return `<a href="${href}" style="color: white !important;" class="block px-4 py-${link.isSmall ? '2' : '3'} ${textSize} font-bold text-white no-underline hover:bg-white hover:bg-opacity-10 transition-colors">${link.label}</a>`;
  return `<a href="${href}" class="px-3 py-2 ${textSize} font-bold text-white rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200 transform hover:-translate-y-0.5">${link.label}</a>`;
}

function createExamDropdown(pageType, isMobile = false) {
  const links = NAV_CONFIG.examLinks.map(link => {
      const href = buildPath(link.href, pageType);
      const cls = isMobile 
        ? "block px-6 py-2 text-sm font-bold text-white hover:bg-white hover:bg-opacity-10" 
        : "block px-4 py-3 text-base font-bold text-white hover:bg-white hover:bg-opacity-20";
      return `<a href="${href}" style="color: white !important;" class="${cls} no-underline transition-colors">${link.label}</a>`;
    }).join('');

  if (isMobile) {
    return `
      <div class="border-t border-white border-opacity-20">
        <button id="mobile-exams-dropdown-toggle" style="color: white !important;" class="w-full text-right px-4 py-3 text-base font-bold text-white flex items-center justify-between hover:bg-white hover:bg-opacity-10 transition-colors">
          <span>امتحانات</span>
          <svg id="mobile-exams-dropdown-arrow" class="w-4 h-4 transition-transform text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <div id="mobile-exams-dropdown-menu" class="hidden bg-gradient-to-r from-green-600 to-emerald-700 overflow-hidden">${links}</div>
      </div>`;
  }

  return `
    <div class="relative z-50">
      <button id="exams-dropdown-toggle" class="px-3 py-2 text-base font-bold text-white rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200 flex items-center gap-1">
        <span>امتحانات</span>
        <svg id="exams-dropdown-arrow" class="w-4 h-4 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div id="exams-dropdown-menu" class="hidden absolute left-0 mt-2 w-56 rounded-lg shadow-xl bg-gradient-to-r from-green-600 to-emerald-700 border border-white border-opacity-10 overflow-hidden z-50">${links}</div>
    </div>`;
}

function createToolsMenu(enabled) {
  if (!enabled) return ''; // 🛑 Stop if tools disabled
  return `
    <div x-data="{ toolsOpen: false }" class="relative nav-tools-container ml-2">
        <button @click="toolsOpen = !toolsOpen" :class="{'bg-black bg-opacity-25 shadow-inner': toolsOpen, 'hover:bg-white hover:bg-opacity-20': !toolsOpen}" class="p-2 rounded-lg text-white transition-all duration-200 flex items-center justify-center focus:outline-none" title="الإعدادات">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
        <div x-show="toolsOpen" @click.away="toolsOpen = false" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 translate-y-1" x-transition:enter-end="opacity-100 translate-y-0" class="absolute left-0 mt-2 w-64 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl shadow-xl border border-white border-opacity-20 p-4 z-50 flex flex-col gap-3" style="display: none;">
             <div class="flex items-center justify-between px-2">
                 <button @click="$dispatch('font-change', 2)" class="tool-btn-circle" title="تكبير الخط"><span class="font-bold text-lg">A+</span></button>
                 <button @click="$dispatch('font-reset')" class="tool-btn-circle" title="إعادة تعيين"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                 <button @click="$dispatch('font-change', -2)" class="tool-btn-circle" title="تصغير الخط"><span class="font-bold text-sm">A-</span></button>
             </div>
             <div class="h-px bg-white bg-opacity-20 w-full"></div>
             
             <div class="flex items-center justify-between px-2">
                 <div @click="$dispatch('theme-toggle')" class="theme-switch-container" title="تبديل الوضع">
                   <div class="theme-switch-slider">
                     <svg class="theme-icon sun-icon" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
                     <svg class="theme-icon moon-icon" viewBox="0 0 24 24"><path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 18.55 13.77 22 9.25 22 4.14 22 0 17.86 0 12.75c0-4.52 3.45-8.2 7.99-9.24h.01c.45 1.1.91 2.1 1.37 3z"/></svg>
                   </div>
                 </div>

                 <button @click="$dispatch('expand-all')" class="tool-btn-circle" title="توسيع الكل"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></button>
                 <button @click="$dispatch('collapse-all')" class="tool-btn-circle" title="طي الكل"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg></button>
             </div>
        </div>
    </div>`;
}

// === Main Function ===
function loadNavbar(options = {}) {
    // ✅ FIX: Prevent double loading
    window.navbarLoaded = true;

    const { pageType = 'root', showTools = true } = options;
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) {
        console.error('Navbar Error: <div id="navbar-placeholder"></div> missing.');
        return;
    }

    const isMobile = window.innerWidth < 768;
    let navHtml = '';

    if (isMobile) {
        // --- MOBILE LOGIC: Bug Fixes & Restored Features ---
        const currentPath = window.location.pathname;

        // Active State Logic
        const isHomeActive = currentPath.endsWith('/') || currentPath.endsWith('index.html');
        // تعريف متغيرات الحالة
        const isQuestionsActive = currentPath.includes('questions'); 
        const isPdfActive = currentPath.includes('pdf'); // ✅ متغير جديد لصفحة PDF
        const isMindMapActive = currentPath.includes('mindmap');
        const isQuizActive = currentPath.includes('qz-') || currentPath.includes('card-flip');
        
        // HTML for Popups (Arabic)
        const quizPopup = `
        <div x-show="activePopup === 'quiz'" @click.away="activePopup = null" class="mobile-popup-sheet" x-transition:enter="transition ease-out duration-150" x-transition:enter-start="opacity-0 transform scale-95" x-transition:enter-end="opacity-100 transform scale-100" x-transition:leave="transition ease-in duration-100" x-transition:leave-start="opacity-100 transform scale-100" x-transition:leave-end="opacity-0 transform scale-95" style="display: none;">
            <a href="${buildPath('qz-true-false.html', pageType)}" class="mobile-popup-link">صواب / خطأ</a>
            <a href="${buildPath('qz-mc-in.html', pageType)}" class="mobile-popup-link">اختيار متعدد</a>
            <a href="${buildPath('qz-fill-blank.html', pageType)}" class="mobile-popup-link">املأ الفراغ</a>
            <a href="${buildPath('card-flip.html', pageType)}" class="mobile-popup-link">بطاقات مراجعة</a>
            <a href="${buildPath('qz-comparison.html', pageType)}" class="mobile-popup-link">جدول مقارنة</a>
        </div>`;

        const mindmapPopup = `
        <div x-show="activePopup === 'mindmap'" @click.away="activePopup = null" class="mobile-popup-sheet" x-transition:enter="transition ease-out duration-150" x-transition:enter-start="opacity-0 transform scale-95" x-transition:enter-end="opacity-100 transform scale-100" x-transition:leave="transition ease-in duration-100" x-transition:leave-start="opacity-100 transform scale-100" x-transition:leave-end="opacity-0 transform scale-95" style="display: none;">
            <a href="${buildPath('mindmap.html', pageType)}" class="mobile-popup-link">خريطة ذهنية</a>
            <a href="${buildPath('mindmap_interactive.html', pageType)}" class="mobile-popup-link">خريطة تفاعلية</a>
        </div>`;
        
        const settingsPopup = `
        <div x-show="activePopup === 'tools'" @click.away="activePopup = null" class="mobile-popup-sheet" x-transition>
            <div class="tools-row">
                <button @click="$dispatch('expand-all'); activePopup = null" class="tool-circle-btn tool-full-btn" style="width: 45%; border-radius: 20px; font-size: 11px;">
                    + توسيع الكل
                </button>
                <button @click="$dispatch('collapse-all'); activePopup = null" class="tool-circle-btn tool-full-btn" style="width: 45%; border-radius: 20px; font-size: 11px;">
                    - طي الكل
                </button>
            </div>
            <div class="divider-line"></div>
            <div class="tools-row">
                <button @click="$dispatch('font-change', -2)" class="tool-circle-btn">-A</button>
                <button @click="$dispatch('font-reset')" class="tool-circle-btn">↺</button>
                <button @click="$dispatch('font-change', 2)" class="tool-circle-btn">+A</button>
            </div>
            <div class="divider-line"></div>
            <div class="flex justify-center py-2">
                 <button @click="$dispatch('theme-toggle')" class="tool-circle-btn tool-full-btn">
                    الوضع الليلي ☾
                 </button>
            </div>
        </div>`;

        navHtml = `
        <div x-data="{ activePopup: null }">
            ${quizPopup}
            ${mindmapPopup}
            ${settingsPopup}

            <nav id="mobile-bottom-nav">
                <a href="${buildPath('index.html', pageType)}" @click="activePopup = null" class="mobile-nav-item ${isHomeActive ? 'active-tab' : ''}">
                    <span class="icon-container">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </span>
                    <span class="label-text">الرئيسية</span>
                </a>
                
                <button @click.stop="activePopup = (activePopup === 'quiz' ? null : 'quiz')" class="mobile-nav-item" :class="{'active-tab': activePopup === 'quiz' || (!activePopup && ${isQuizActive})}">
                    <span class="icon-container">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </span>
                    <span class="label-text">اختبارات</span>
                </button>

                <button @click.stop="activePopup = (activePopup === 'mindmap' ? null : 'mindmap')" class="mobile-nav-item" :class="{'active-tab': activePopup === 'mindmap' || (!activePopup && ${isMindMapActive})}">
                    <span class="icon-container">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h1m5 10v-1m10-5h-1M10 3v1m-4 1.75l.7.7M16.25 15.5l.7.7M7.75 16.25l.7-.7M16.25 7.75l.7-.7M12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>
                    </span>
                    <span class="label-text">خرائط</span>
                </button>
                
                <a href="${buildPath('questions.html', pageType)}" @click="activePopup = null" class="mobile-nav-item ${isQuestionsActive ? 'active-tab' : ''}">
                    <span class="icon-container" style="display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 22px; line-height: 1;">📝</span>
                    </span>
                    <span class="label-text">أسئلة</span>
                </a>

                <a href="${buildPath('pdf.html', pageType)}" @click="activePopup = null" class="mobile-nav-item ${isPdfActive ? 'active-tab' : ''}">
                    <span class="icon-container" style="display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 24px; line-height: 1;">⋒</span>
                    </span>
                    <span class="label-text">PDF</span>
                </a>
                
                <button @click.stop="activePopup = (activePopup === 'tools' ? null : 'tools')" class="mobile-nav-item" :class="{ 'active-tab': activePopup === 'tools' }">
                    <span class="icon-container">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </span>
                    <span class="label-text">إعدادات</span>
                </button>
            </nav>
        </div>`;
    } else {
        // --- DESKTOP LOGIC: Top Nav Bar (Existing) ---
        const desktopLinks = NAV_CONFIG.mainLinks.map(link => createNavLink(link, pageType)).join('\n');
        const mobileLinks = NAV_CONFIG.mainLinks.map(link => createNavLink(link, pageType, true)).join('\n');
        const toolsHtml = createToolsMenu(showTools);

        navHtml = `
        <nav x-data="{ open: false }" class="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[900px] z-50 p-2">
            <div class="hidden md:flex justify-between items-center rounded-xl p-2 w-full bg-gradient-to-r from-green-600 to-emerald-700 shadow-lg">
                <div class="flex justify-start items-center w-full space-x-2 space-x-reverse">
                    ${desktopLinks} ${createExamDropdown(pageType)}
                    <div class="flex-grow"></div> ${toolsHtml}
                </div>
            </div>
            <div class="md:hidden flex justify-between items-center">
                <button @click="open = !open" class="flex items-center px-4 py-2 text-white rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200 bg-gradient-to-r from-green-600 to-emerald-700 shadow-lg">
                    <svg class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>
                    <span class="font-bold text-white">القائمة</span>
                </button>
                <div class="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg shadow-lg">${toolsHtml}</div>
            </div>
            <div x-show="open" @click.away="open = false" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 transform -translate-y-2" x-transition:enter-end="opacity-100 transform translate-y-0" class="md:hidden absolute left-1/2 transform -translate-x-1/2 w-64 mt-2 rounded-lg shadow-xl z-10 bg-gradient-to-r from-green-600 to-emerald-700" style="display: none;">
                ${mobileLinks} ${createExamDropdown(pageType, true)}
            </div>
        </nav>`;
    }

    placeholder.innerHTML = navHtml;
    initDropdownListeners();

    // Run tools manager only if tools are enabled
    if (showTools && !window.toolsManager) {
        window.toolsManager = new ToolsManager();
    }

    // Call external script for Alpine.js data
    const scriptPath = (pageType === 'root') ? './js/page-init.js' : '../js/page-init.js';
    if (!document.querySelector(`script[src="${scriptPath}"]`)) {
        const script = document.createElement('script');
        script.src = scriptPath;
        script.defer = true;
        document.body.appendChild(script);
    }
}

// === Named Listeners (Prevent click conflicts) ===
function handleDropdownClick(e) {
  if (e.target.closest('#exams-dropdown-toggle')) {
      toggleDropdown('exams-dropdown-menu', 'exams-dropdown-arrow'); e.preventDefault(); return;
  }
  if (e.target.closest('#mobile-exams-dropdown-toggle')) {
      toggleDropdown('mobile-exams-dropdown-menu', 'mobile-exams-dropdown-arrow'); e.preventDefault(); return;
  }
  const desktopMenu = document.getElementById('exams-dropdown-menu');
  if (desktopMenu && !desktopMenu.classList.contains('hidden') && !e.target.closest('#exams-dropdown-toggle')) {
      desktopMenu.classList.add('hidden');
      document.getElementById('exams-dropdown-arrow')?.classList.remove('rotate-180');
  }
}

function initDropdownListeners() {
  document.removeEventListener('click', handleDropdownClick);
  document.addEventListener('click', handleDropdownClick);
}

function toggleDropdown(menuId, arrowId) {
  const menu = document.getElementById(menuId);
  const arrow = document.getElementById(arrowId);
  if (menu && arrow) { menu.classList.toggle('hidden'); arrow.classList.toggle('rotate-180'); }
}

// === AUTO-INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    // ✅ FIX: Check if navbar was manually loaded
    if (window.navbarLoaded) return; 

    const isSubPage = window.location.pathname.includes('/pages/');
    const pType = isSubPage ? 'sub' : 'root';
    const hideTools = document.body.hasAttribute('data-no-tools');
    loadNavbar({ pageType: pType, showTools: !hideTools });
});


/* === AUTO FULLSCREEN ON FIRST INTERACTION (MOBILE ONLY) === */
document.addEventListener('DOMContentLoaded', () => {
    // Check if device is mobile
    const isMobileDevice = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.innerWidth <= 768;
    };

    // Only enable fullscreen if on mobile
    if (isMobileDevice()) {
        // Function to trigger fullscreen
        const enableFullscreen = () => {
            // Only try if not already in fullscreen
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                const doc = document.documentElement;
                const request = doc.requestFullscreen || doc.webkitRequestFullscreen || doc.mozRequestFullScreen || doc.msRequestFullscreen;
                
                if (request) {
                    request.call(doc).catch(err => {
                        // Silently fail if blocked (e.g. rapid reloading)
                        console.log('Fullscreen blocked:', err);
                    });
                }
            }
            // Remove listeners immediately so it doesn't annoy the user on subsequent clicks
            document.removeEventListener('click', enableFullscreen);
            document.removeEventListener('touchstart', enableFullscreen);
        };

        // Listen for the very first interaction anywhere on the page
        document.addEventListener('click', enableFullscreen);
        document.addEventListener('touchstart', enableFullscreen);
    }
});