// مسار الملف: ../js/script_pdf-manager.js

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

window.pdfInstances = {};

window.loadLessonPdf = async function(index, url) {
    const canvas = document.getElementById(`pdf-canvas-${index}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // إعداد لوحة الرسم
    canvas.width = 300;
    canvas.height = 150;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Tajawal, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('جاري تحميل الملف...', canvas.width / 2, canvas.height / 2);

    // --- مفتاح الحل هنا ---
    // تحويل المسار النسبي إلى مسار ويب مطلق وكامل ليفهمه السكربت بوضوح
    const absoluteUrl = new URL(url, window.location.href).href;

    try {
        // نمرر المسار المطلق للمكتبة بدلاً من المسار النسبي
        const loadingTask = pdfjsLib.getDocument(absoluteUrl);
        const pdfDoc = await loadingTask.promise;
        
        document.getElementById(`page-count-${index}`).textContent = pdfDoc.numPages;
        
        window.pdfInstances[index] = {
            pdf: pdfDoc,
            pageNum: 1,
            render: async function() {
                const page = await this.pdf.getPage(this.pageNum);
                const containerWidth = canvas.parentElement.clientWidth;
                const desiredScale = (containerWidth - 20) / page.getViewport({ scale: 1 }).width;
                const viewport = page.getViewport({ scale: desiredScale });
                
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                document.getElementById(`page-num-${index}`).textContent = this.pageNum;
            }
        };
        
        window.pdfInstances[index].render();

    } catch (error) {
        console.error("PDF Error: ", error);
        ctx.fillStyle = '#ffeaea';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#d32f2f';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('❌ فشل تحميل الملف!', canvas.width / 2, 40);
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        if (error.name === 'MissingPDFException') {
            // إضافة المسار المطلق للرسالة للتأكد من أنه تمت قراءته بشكل صحيح
            ctx.fillText('الملف غير موجود في:', canvas.width / 2, 70);
            ctx.fillText(absoluteUrl, canvas.width / 2, 90);
        } else if (error.message && error.message.includes('fetch')) {
            ctx.fillText('يجب تشغيل المشروع عبر خادم محلي (Live Server)', canvas.width / 2, 70);
        } else {
            ctx.fillText('حدث خطأ غير معروف، يرجى فحص الـ Console', canvas.width / 2, 70);
        }
    }
};

window.changePage = function(index, direction) {
    const instance = window.pdfInstances[index];
    if (!instance) return;
    
    if (direction === 'next' && instance.pageNum < instance.pdf.numPages) {
        instance.pageNum++;
        instance.render();
    } else if (direction === 'prev' && instance.pageNum > 1) {
        instance.pageNum--;
        instance.render();
    }
};
