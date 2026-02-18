/**
 * script_mindmap_interactive.js
 * يرسم الخريطة التفاعلية باستخدام مكتبة Markmap
 * ويدعم التفاعل مع القائمة العلوية
 */

document.addEventListener('DOMContentLoaded', function() {
    renderInteractiveMap();
});

function renderInteractiveMap() {
    const container = document.getElementById('markmap-container');
    const svgEl = document.querySelector('#markmap');

    // التحقق من البيانات
    if (typeof mindmapData === 'undefined') {
        if(container) container.innerHTML = '<h3 style="text-align:center; margin-top:50px; color:red;">خطأ: لم يتم تحميل البيانات (تأكد من data_mindmap.js).</h3>';
        return;
    }

    // دالة لتحويل البيانات لتناسب Markmap مع التحكم في الطي (Fold)
    function transformData(node, foldLevel = 1) {
        return transformRecursively(node, 0, foldLevel);
    }

    function transformRecursively(node, depth, mode) {
        let shouldFold = 0; // افتراضياً مفتوح

        if (mode === 0) {
            shouldFold = 0; // فتح الكل
        } else if (mode === 1 || mode === 2) {
            if (depth > 0) shouldFold = 1; // طي الأبناء
            if (mode === 1 && depth === 1) shouldFold = 1; 
        }

        const newNode = {
            content: node.title,
            children: [],
            payload: { fold: shouldFold }
        };

        if (node.children && node.children.length > 0) {
            newNode.children = node.children.map(c => transformRecursively(c, depth + 1, mode));
        }

        return newNode;
    }

    // إعدادات المكتبة
    const { Markmap } = window.markmap;
    
    // ---------------------------------------------------------
    // التعديل 1: تعطيل autoFit لمنع التصغير التلقائي عند النقر
    // ---------------------------------------------------------
    const options = {
        autoFit: false, // تم التغيير من true إلى false
        duration: 500,
        spacingHorizontal: 80,
    };

    // دالة لرسم/تحديث الخريطة
    function drawMap(mode) {
        // 1. تنظيف الـ SVG القديم
        svgEl.innerHTML = '';
        
        // 2. تجهيز البيانات الجديدة حسب الوضع (0: الكل، 1: افتراضي، 2: طي)
        const rootData = transformData(mindmapData, mode);
        
        // تأكد دائماً أن الجذر مفتوح
        rootData.payload = { fold: 0 }; 

        // 3. الرسم
        // ---------------------------------------------------------
        // التعديل 2: التقاط المتغير mm لعمل fit يدوياً
        // ---------------------------------------------------------
        const mm = Markmap.create(svgEl, options, rootData);
        
        // نقوم بعمل Fit يدوياً فقط عند إنشاء الخريطة بالكامل (مثل التحميل الأول أو أزرار القائمة)
        // لكن عند النقر العادي على العقد، لن يتم استدعاء هذا السطر ولن يتم التصغير
        mm.fit(); 
    }

    try {
        // الرسم الأولي (الوضع الافتراضي: 1)
        drawMap(1);

        // ==========================================
        // تفعيل النقر على النصوص (Simulated Click)
        // ==========================================
        svgEl.addEventListener('click', (e) => {
            const target = e.target;
            // هل النقر على نص أو خلفية نص؟
            if (target.tagName === 'tspan' || target.tagName === 'text' || target.closest('foreignObject')) {
                const g = target.closest('g');
                if (g) {
                    // ابحث عن الدائرة في نفس المجموعة
                    const circle = g.querySelector('circle');
                    if (circle) {
                        const event = new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        });
                        circle.dispatchEvent(event);
                    }
                }
            }
        });

        // ==========================================
        // الاستجابة لأحداث الشريط العلوي (Navbar)
        // ==========================================
        
        window.addEventListener('expand-all', () => {
            drawMap(0); // 0 = وضع فتح الكل
        });

        window.addEventListener('collapse-all', () => {
            drawMap(2); // 2 = وضع طي الكل
        });

    } catch (error) {
        console.error("Markmap Error:", error);
        container.innerHTML = `<p style="color:red; text-align:center">خطأ في الرسم: ${error.message}</p>`;
    }
}