/**
 * Quiz Status Bar Component
 * يقوم بإنشاء شريط التقدم والنتيجة المدمج في صندوق واحد
 */
const QuizStatusBar = {
    /**
     * دالة التهيئة: تقوم بحقن كود HTML في المكان المخصص
     * @param {string} containerId - معرف العنصر الذي سيتم وضع الشريط بداخله (مثلاً 'status-bar-placeholder')
     */
    init: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`QuizStatusBar: لم يتم العثور على العنصر #${containerId}`);
            return;
        }

        // بناء الهيكل المدمج (Flexbox) ليطابق التصميم المطلوب
        // الجانب الأيمن: التقدم والشريط
        // الجانب الأيسر: النتيجة ورقم السؤال
        // فاصل بينهما
        container.innerHTML = `
            <div class="container-main p-0 overflow-hidden flex flex-col md:flex-row items-stretch" style="min-height: 85px;">
                
                <div class="flex-grow p-4 md:px-6 md:py-3 flex flex-col justify-center relative">
                    <div class="flex justify-between items-end mb-2">
                        <span class="font-bold text-sm md:text-base opacity-80">التقدم</span>
                        <span id="progress-text" class="font-bold text-sm md:text-base text-accent-dark">0%</span>
                    </div>
                    <div class="progress-bar w-full bg-gray-200 rounded-full h-3 md:h-4 overflow-hidden shadow-inner">
                        <div id="progress-fill" class="progress-fill h-full rounded-full transition-all duration-500 ease-out" 
                             style="width: 0%; background: linear-gradient(90deg, var(--color-success) 0%, var(--color-success-dark) 100%);">
                        </div>
                    </div>
                </div>

                <div class="hidden md:block w-[1px] bg-gray-300 my-2 opacity-50"></div>
                <div class="block md:hidden h-[1px] bg-gray-300 mx-4 opacity-50"></div>

                <div class="flex-none min-w-[240px] p-3 md:p-0 flex items-center justify-between md:justify-center gap-2 md:gap-6 bg-gray-50/50 md:bg-transparent text-sm md:text-base">
                    
                    <div class="flex flex-col items-center justify-center px-4">
                        <span class="text-xs text-gray-500 mb-1">السؤال</span>
                        <span id="question-counter" class="font-bold text-lg dir-ltr" style="direction: ltr;">0 / 0</span>
                    </div>

                    <div class="w-[1px] h-8 bg-gray-300"></div>

                    <div class="flex flex-col items-center justify-center px-4">
                        <span class="text-xs text-gray-500 mb-1">النتيجة</span>
                        <span id="score-display" class="font-bold text-lg text-green-700">0</span>
                    </div>
                </div>

            </div>
        `;
    }

};