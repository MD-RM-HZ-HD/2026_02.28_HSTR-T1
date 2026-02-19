// Script/pdf-manager.js

// تحديد موقع ملف الـ Worker الخاص بالمكتبة (ضروري جداً للعمل)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PdfViewer {
    constructor(url, canvasId, pageNumSpanId, pageCountSpanId) {
        this.url = url;
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.pageNumSpan = document.getElementById(pageNumSpanId);
        this.pageCountSpan = document.getElementById(pageCountSpanId);
        
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = 1.5; // التكبير الافتراضي
        this.fitToWidth = true; // تفعيل العرض بعرض الشاشة تلقائياً
    }

    // تهيئة وتحميل الملف
    async init() {
        try {
            this.pdfDoc = await pdfjsLib.getDocument(this.url).promise;
            if(this.pageCountSpan) this.pageCountSpan.textContent = this.pdfDoc.numPages;
            this.renderPage(this.pageNum);
        } catch (error) {
            console.error('Error loading PDF:', error);
            // يمكنك هنا إظهار رسالة خطأ للمستخدم في حال فشل التحميل
            this.ctx.font = '20px Tajawal';
            this.ctx.fillText('عذراً، حدث خطأ في تحميل الملف', 10, 50);
        }
    }

    // دالة رسم الصفحة
    async renderPage(num) {
        this.pageRendering = true;
        
        // جلب الصفحة من الملف
        const page = await this.pdfDoc.getPage(num);

        // حساب الأبعاد المناسبة للشاشة
        let viewport = page.getViewport({ scale: this.scale });
        
        // كود ذكي لجعل العرض 100% من عرض الشاشة (Mobile Responsive)
        if (this.fitToWidth) {
            const containerWidth = this.canvas.parentElement.clientWidth;
            // نطرح قليلاً للهوامش
            const desiredScale = (containerWidth - 20) / page.getViewport({ scale: 1 }).width;
            viewport = page.getViewport({ scale: desiredScale });
            this.scale = desiredScale; // تحديث المقياس الحالي
        }

        // ضبط أبعاد اللوحة (Canvas)
        this.canvas.height = viewport.height;
        this.canvas.width = viewport.width;

        // إعداد عملية الرسم
        const renderContext = {
            canvasContext: this.ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);

        // انتظار انتهاء الرسم
        try {
            await renderTask.promise;
            this.pageRendering = false;
            
            // تحديث رقم الصفحة في الواجهة
            if(this.pageNumSpan) this.pageNumSpan.textContent = num;

            // إذا كان هناك صفحة أخرى بانتظار الرسم (بسبب النقر السريع)
            if (this.pageNumPending !== null) {
                this.renderPage(this.pageNumPending);
                this.pageNumPending = null;
            }
        } catch (e) {
            // تجاهل أخطاء الإلغاء
        }
    }

    // إدارة طلبات التصيير المتتالية
    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    // الصفحة السابقة
    onPrevPage() {
        if (this.pageNum <= 1) return;
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
    }

    // الصفحة التالية
    onNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) return;
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
    }
    
    // إعادة ضبط الحجم عند تدوير الشاشة
    resize() {
        if(this.pdfDoc) {
            this.renderPage(this.pageNum);
        }
    }
}

// مصفوفة لتخزين الكائنات النشطة
window.pdfInstances = {};

// دالة عامة لاستدعائها من HTML
window.loadLessonPdf = function(index, url) {
    // إذا لم يتم تحميل هذا الدرس من قبل
    if (!window.pdfInstances[index]) {
        const viewer = new PdfViewer(
            url, 
            `pdf-canvas-${index}`, 
            `page-num-${index}`, 
            `page-count-${index}`
        );
        viewer.init();
        window.pdfInstances[index] = viewer;
        
        // إضافة مستمع لتغيير حجم الشاشة
        window.addEventListener('resize', () => {
             // استخدام Debounce لتقليل استهلاك المعالج
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(() => viewer.resize(), 200);
        });
    }
};

window.changePage = function(index, direction) {
    const viewer = window.pdfInstances[index];
    if (viewer) {
        if (direction === 'next') viewer.onNextPage();
        if (direction === 'prev') viewer.onPrevPage();
    }
};