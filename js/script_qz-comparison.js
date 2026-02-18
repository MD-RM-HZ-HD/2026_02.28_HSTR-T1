// 1. المتغيرات والتعريفات
const totalQuestions = quizData.length;
const questionsPerPage = 1;
let currentPage = 1;
const totalPages = Math.ceil(totalQuestions / questionsPerPage);
let score = 0; // يمثل الصفحة الحالية في وضع المراجعة

// ❌ تم حذف تعريفات العناصر الثابتة (progressFill etc) لأنها ستكون ديناميكية
const quizPages = document.getElementById('quiz-container');
const nextQuestionBtn = document.getElementById('next-question-btn');

// 2. دالة بناء هيكل السؤال (كما هي)
function buildQuestionHTML(q, displayNumber) {
    let inputsA = '';
    let inputsB = '';

    q.criteria.forEach((criterion, index) => {
        inputsA += `
            <textarea id="blank-input-${q.id}-A-${index}" 
                   placeholder="اكتب (${criterion.label}) هنا..."
                   class="p-2 border border-gray-300 rounded-lg text-right mb-2 bg-green-50 resize-none min-h-[75px] review-mode w-full"
                   rows="3"
                   data-correct-answer="${criterion.answerA}"
                   data-label="${criterion.label}"
                   data-index="${index}" data-side="A" disabled></textarea>
        `;
        inputsB += `
            <textarea id="blank-input-${q.id}-B-${index}" 
                   placeholder="اكتب (${criterion.label}) هنا..."
                   class="p-2 border border-gray-300 rounded-lg text-right mb-2 bg-green-50 resize-none min-h-[75px] review-mode w-full"
                   rows="3"
                   data-correct-answer="${criterion.answerB}"
                   data-label="${criterion.label}"
                   data-index="${index}" data-side="B" disabled></textarea>
        `;
    });

    return `
        <div class="question-card fill-blank container-main w-full" id="q-card-${q.id}" 
             style="padding: 1rem 1rem 1.5rem; box-sizing: border-box;">

            <div class="flex justify-between items-center mb-4 w-full">
                <div class="q-tag">
                    <span class="q-tag-word">السؤال</span>
                    <span class="q-tag-number">${displayNumber}</span>
                </div>

                <h2 class="question-title-highlight text-lg md:text-xl font-bold text-right"
                    style="color: var(--text); flex-grow: 1; margin: 0 1rem; line-height: 1.6;">
                    ${q.title}
                </h2>
            </div>

            <!-- Responsive grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                
                <!-- BOX A -->
                <div class="comparison-box w-full">
                    <h3 class="text-xl font-bold mb-3 text-center card-title-review"
                        style="color: var(--color-success-text);">
                        ${q.caseA_label}
                    </h3>
                    <div class="flex flex-col gap-3 w-full">
                        ${inputsA}
                    </div>
                </div>

                <!-- BOX B -->
                <div class="comparison-box w-full">
                    <h3 class="text-xl font-bold mb-3 text-center card-title-review"
                        style="color: var(--color-danger-text);">
                        ${q.caseB_label}
                    </h3>
                    <div class="flex flex-col gap-3 w-full">
                        ${inputsB}
                    </div>
                </div>

            </div>

            <p id="blank-feedback-${q.id}" class="mt-4 text-center font-bold" style="display: none;"></p>
        </div>
    `;
}


// 3. دالة عرض الأسئلة (كما هي)
function renderPage(page = currentPage) {
    if (!quizPages) return;
    quizPages.innerHTML = '';

    const startIndex = (page - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const questionsToShow = quizData.slice(startIndex, endIndex);

    questionsToShow.forEach((q, index) => {
        const displayNumber = startIndex + index + 1;
        quizPages.innerHTML += buildQuestionHTML(q, displayNumber);
        startReviewMode(q.id);
    });
}

// 4. وظيفة الكاتب الآلي (كما هي)
async function startReviewMode(questionId) {
    const questionData = quizData.find(q => q.id === questionId);
    if (!questionData) return;

    for (let i = 0; i < questionData.criteria.length; i++) {
        const textareaA = document.getElementById(`blank-input-${questionId}-A-${i}`);
        const textareaB = document.getElementById(`blank-input-${questionId}-B-${i}`);

        if (textareaA) {
            await typeWordByWord(textareaA, textareaA.getAttribute('data-correct-answer'), textareaA.getAttribute('data-label'));
        }
        if (textareaB) {
            await typeWordByWord(textareaB, textareaB.getAttribute('data-correct-answer'), textareaB.getAttribute('data-label'));
        }
    }

    if (nextQuestionBtn) {
        nextQuestionBtn.disabled = false;
        if (currentPage === totalQuestions) {
            nextQuestionBtn.textContent = 'عرض النتيجة';
        } else {
            nextQuestionBtn.textContent = 'السؤال التالي';
        }
        nextQuestionBtn.style.background = 'linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%)';
    }
}

// 5. وظيفة مساعد الكاتب الآلي (كما هي)
function typeWordByWord(textarea, text, label) {
    return new Promise(resolve => {
        const labelPrefix = `${label}: `;
        if (!text || text.trim() === "") {
            textarea.value = labelPrefix + (text || "");
            resolve();
            return;
        }
        const words = text.split(' ').filter(w => w.length > 0);
        let wordIndex = 0;
        textarea.value = labelPrefix; 
        if (words.length === 0) {
            textarea.value = labelPrefix + text;
            resolve(); return;
        }
        const interval = setInterval(() => {
            if (wordIndex < words.length) {
                textarea.value = labelPrefix + words.slice(0, wordIndex + 1).join(' ');
                wordIndex++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, 200); 
    });
}

// 6. دالة تغيير الصفحة (كما هي)
function changePage(step) {
    if (currentPage === totalQuestions && step > 0) {
        score = totalQuestions; 
        updateProgress();
        showFinalResults();
        return;
    }

    const newPage = Math.min(Math.max(currentPage + step, 1), totalPages);
    if (newPage === currentPage) return;
    currentPage = newPage;
    
    score = newPage; 
    updateProgress();
    
    renderPage(currentPage); 
    window.scrollTo(0, 0);

    if (nextQuestionBtn) {
        nextQuestionBtn.disabled = true;
        nextQuestionBtn.textContent = '...يتم عرض الإجابات...';
        nextQuestionBtn.style.background = ''; 
    }
}

// ✅ 7. دالة تحديث شريط التقدم (معدلة لتجلب العناصر ديناميكياً)
function updateProgress() {
    // جلب العناصر التي أنشأها quiz-status-bar.js
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const scoreDisplay = document.getElementById('score-display'); 
    const questionCounter = document.getElementById('question-counter');

    const progress = (score / totalQuestions) * 100;
    
    if (progressFill) progressFill.style.width = progress + '%';
    if (progressText) progressText.textContent = Math.round(progress) + '%';
    
    // في هذا الاختبار: النتيجة = رقم السؤال الحالي
    if (scoreDisplay) scoreDisplay.textContent = score; 
    
    if (questionCounter) questionCounter.textContent = `${score} / ${totalQuestions}`;
}

// 8. دالة عرض النتائج النهائية (معدلة للإخفاء)
function showFinalResults() {
    const message = 'أكملت المراجعة!';
    const emoji = '🏆'; 

    if (quizPages) {
        quizPages.innerHTML = `
            <div class="text-center py-8 md:py-12 container-main">
                <div class="text-5xl md:text-7xl mb-4 md:mb-6">${emoji}</div>
                <h2 class="text-2xl md:text-3xl font-bold mb-3 md:mb-4">${message}</h2>
                <div class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl p-6 md:p-8 mb-4 md:mb-6">
                    <p class="text-3xl md:text-5xl font-bold mb-1 md:mb-2">${totalQuestions} / ${totalQuestions}</p>
                    <p class="text-xl md:text-2xl">100%</p>
                </div>
                <button onclick="location.reload()"
                        class="btn-answer" style="background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%); color: white;">
                    🔄 إعادة المراجعة
                </button>
            </div>
        `;
    }
    if (nextQuestionBtn) nextQuestionBtn.style.display = 'none';

    // ✅ تحديث شريط الحالة ليعرض النتيجة النهائية 100% بدلاً من إخفائه
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const scoreDisplay = document.getElementById('score-display');
    const questionCounter = document.getElementById('question-counter');

    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = '100%';
    if (scoreDisplay) scoreDisplay.textContent = totalQuestions;
    if (questionCounter) questionCounter.textContent = `${totalQuestions} / ${totalQuestions}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ✅ 10. دالة التهيئة الشاملة (معدلة)
function init() {
    // 1. بناء الشريط الموحد
    if (typeof QuizStatusBar !== 'undefined') {
        QuizStatusBar.init('status-bar-placeholder');
    }

    shuffleArray(quizData);
    score = 1; 
    
    updateProgress(); // تحديث فوري
    
    renderPage();
    if (nextQuestionBtn) {
        nextQuestionBtn.disabled = true; 
        nextQuestionBtn.textContent = '...يتم عرض الإجابات...';
        nextQuestionBtn.addEventListener('click', () => changePage(1));
    }
}

document.addEventListener('DOMContentLoaded', () => {
     const titleEl = document.querySelector('.page-title-card h1');
     if(titleEl) document.title = titleEl.textContent;
     if (typeof quizData === 'undefined' || quizData.length === 0) {
        if(quizPages) quizPages.innerHTML = "<p class='text-center text-red-500 font-bold'>خطأ: لم يتم تحميل الأسئلة.</p>";
        return;
     }
     init();
});

// Styles... (كما هي)
document.head.insertAdjacentHTML('beforeend', `<style>
    .q-tag {
        background-color: #f97316; 
        color: white;
        border-radius: 0.75rem; 
        padding: 0.5rem 0.75rem;
        text-align: center;
        font-weight: bold;
        display: flex;
        flex-direction: column;
        line-height: 1.2;
        min-width: 60px; 
    }
    .q-tag-word {
        font-size: 0.75rem; 
        opacity: 0.9;
    }
    .q-tag-number {
        font-size: 1.125rem; 
    }
    @media (max-width: 640px) {
        textarea.review-mode:disabled {
            font-size: 0.875rem; 
            min-h-[60px]; 
        }
        .card-title-review {
            font-size: 1.125rem; 
        }
    }
    textarea.review-mode:disabled {
        background-color: #f0fdf4; 
        color: #15803d; 
        font-weight: bold;
        opacity: 1;
        -webkit-text-fill-color: #15803d; 
    }
    html.dark body textarea.review-mode:disabled {
        background-color: #052e16; 
        color: #bbf7d0; 
        -webkit-text-fill-color: #bbf7d0;
    }
</style>`);	
