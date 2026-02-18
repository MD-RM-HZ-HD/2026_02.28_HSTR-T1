/**
 * script_mindmap.js - Simple Version
 * - بناء الشجرة مع المستويات (للألوان)
 * - دعم الفتح/الطي عند النقر
 * - بدون Zoom/Pan (تمرير طبيعي)
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('mindmap-tree-container');
    
    // التحقق
    if (!container) return;
    if (typeof mindmapData === 'undefined') {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:red;">No Data</div>`;
        return;
    }

    // 1. بناء الشجرة
    function buildTreeHTML(node, level = 1) {
        const hasChildren = node.children && node.children.length > 0;
        let html = `<li>`;
        const cssClass = hasChildren ? 'branch-node' : 'leaf-node';
        const icon = hasChildren ? '<span class="toggle-icon" style="font-size:0.8em; margin-right:5px;">▼</span>' : '';
        
        // إضافة data-level ضروري للألوان
        html += `<span class="${cssClass}" data-action="toggle" data-level="${level}">${node.title} ${icon}</span>`;
        
        if (hasChildren) {
            html += `<ul>`;
            node.children.forEach(child => html += buildTreeHTML(child, level + 1));
            html += `</ul>`;
        }
        html += `</li>`;
        return html;
    }

    container.innerHTML = `<ul class="root-ul">${buildTreeHTML(mindmapData)}</ul>`;

    // فتح جميع العقد افتراضياً
    container.querySelectorAll('li').forEach(li => {
        if(li.querySelector('ul')) li.classList.remove('collapsed');
    });

    // 2. منطق النقر البسيط (فتح/طي)
    container.addEventListener('click', (e) => {
        const targetSpan = e.target.closest('span[data-action="toggle"]');
        if (targetSpan) {
            const li = targetSpan.parentElement;
            if (li.querySelector('ul')) {
                // منع التحديد عند النقر السريع
                e.preventDefault(); 
                
                li.classList.toggle('collapsed');
                
                // تحديث الأيقونة
                const icon = targetSpan.querySelector('.toggle-icon');
                if(icon) {
                    icon.innerText = li.classList.contains('collapsed') ? '◀' : '▼';
                }
            }
        }
    });

    // 3. أزرار الشريط العلوي
    window.addEventListener('expand-all', () => {
        container.querySelectorAll('li').forEach(li => {
            if(li.querySelector('ul')) { 
                li.classList.remove('collapsed'); 
                const i = li.querySelector('.toggle-icon'); 
                if(i) i.innerText='▼'; 
            }
        });
    });

    window.addEventListener('collapse-all', () => {
        container.querySelectorAll('li').forEach(li => {
            if(li.querySelector('ul') && !li.parentElement.classList.contains('root-ul')) {
                li.classList.add('collapsed'); 
                const i = li.querySelector('.toggle-icon'); 
                if(i) i.innerText='◀';
            }
        });
    });
});