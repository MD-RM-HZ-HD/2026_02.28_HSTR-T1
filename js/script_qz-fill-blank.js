// 1. المتغيرات والتعريفات
const totalQuestions = quizData.length;
const questionsPerPage = 1;
let currentPage = 1;
const totalPages = Math.ceil(totalQuestions / questionsPerPage);
let score = 0;
const maxScore = totalQuestions;
const pointsPerQuestion = 1;

// تتبع حالة كشف الأسئلة
const questionStates = {};

// ❌ تم حذف تعريفات عناصر DOM الثابتة من هنا لتجنب الأخطاء
// سيتم جلبها عند الحاجة داخل الدوال (مثل updateProgress)

const quizPages = document.getElementById('quiz-container');
const nextQuestionBtn = document.getElementById('next-question-btn');


// ... (دالة buildQuestionHTML كما هي بدون تغيير) ...
function buildQuestionHTML(q, displayNumber) {
    const isMultiBlank = Array.isArray(q.answer);
    const numBlanks = isMultiBlank ? q.answer.length : 1;
    const answers = isMultiBlank ? q.answer : [q.answer];

    let inputFieldsHTML = '';
    if (isMultiBlank) {
        let inputsHTML = '';
        for (let i = 0; i < numBlanks; i++) {
            inputsHTML += `
                <input id="blank-input-${q.id}-${i}" type="text" placeholder="اضغط هنا لكشف الإجابة #${i + 1}"
                    class="p-2 border border-gray-300 rounded-lg text-right mb-2 bg-green-50 review-mode"
                    data-correct-answer="${answers[i]}"
                    data-qid="${q.id}" data-index="${i}">
            `;
        }
        inputFieldsHTML = `
            <div class="inputs-column flex flex-col">
                ${inputsHTML}
            </div>
        `;
    } else {
         inputFieldsHTML = `
            <input id="blank-input-${q.id}-0" type="text" placeholder="اضغط هنا لكشف الإجابة..."
                class="flex-1 p-2 border border-gray-300 rounded-lg text-right bg-green-50 review-mode"
                data-correct-answer="${answers[0]}"
                data-qid="${q.id}" data-index="0">
         `;
    }

    return `
        <div class="question-card fill-blank" id="q-card-${q.id}" style="background: var(--card-bg); border-radius: 0.75rem; box-shadow: var(--shadow-sm); padding: 1.5rem;">
            <div class="flex justify-between items-center">
                <span class="question-number" style="margin: 0; vertical-align: middle; height: 35px; line-height: 35px; display: inline-flex; align-items: center;">
                    السؤال ${displayNumber}
                </span>
            </div>
            <p class="question-text">
                ${q.text}
            </p>
            <div class="multi-blank-container">
                ${inputFieldsHTML}
            </div>
        </div>
    `;
}

// ... (دالة renderPage كما هي) ...
function renderPage(page = currentPage) {
    if (!quizPages) return;
    quizPages.innerHTML = '';

    const startIndex = (page - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const questionsToShow = quizData.slice(startIndex, endIndex);

    let pageHTML = '';
    questionsToShow.forEach((q, index) => {
        if (!questionStates[q.id]) {
            questionStates[q.id] = { scored: false };
        }
        const displayNumber = startIndex + index + 1;
        pageHTML += buildQuestionHTML(q, displayNumber);
    });
    quizPages.innerHTML = pageHTML;

    document.querySelectorAll(`#quiz-container input[type=text]`).forEach(input => {
        input.addEventListener('click', handleInputClick);
    });
}

// ... (دالة handleInputClick كما هي) ...
async function handleInputClick(event) {
    const inputElement = event.target;
    if (inputElement.disabled) return; 

    inputElement.disabled = true; 
    inputElement.placeholder = ''; 

    const qid = parseInt(inputElement.getAttribute('data-qid'));

    await typeLetterByLetter(inputElement);
    checkAllRevealed(qid);
}

// ... (دالة typeLetterByLetter كما هي) ...
function typeLetterByLetter(inputElement) {
    return new Promise(resolve => { 
        const text = inputElement.getAttribute('data-correct-answer');
        
        if (!text || text.trim() === "") {
            inputElement.value = text || "";
            resolve();
            return;
        }

        let charIndex = 0;
        inputElement.value = ''; 

        const interval = setInterval(() => {
            if (charIndex < text.length) {
                inputElement.value = text.substring(0, charIndex + 1);
                charIndex++;
            } else {
                clearInterval(interval);
                resolve(); 
            }
        }, 100); 
    });
}

// ... (دالة checkAllRevealed كما هي) ...
function checkAllRevealed(questionId) {
    const allInputs = document.querySelectorAll(`#q-card-${questionId} input[type=text]`);
    const allDone = Array.from(allInputs).every(input => input.disabled);

    if (allDone) {
        const state = questionStates[questionId];
        if (!state.scored) {
            state.scored = true;
            score++;
            updateProgress();
        }
        
        if (nextQuestionBtn) {
            nextQuestionBtn.disabled = false;
            if (currentPage === totalQuestions) {
                nextQuestionBtn.textContent = 'عرض النتيجة';
            } else {
                nextQuestionBtn.textContent = 'السؤال التالي';
            }
            nextQuestionBtn.style.background = 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)';
        }
    }
}

// ... (دالة changePage كما هي) ...
function changePage(step) {
    if (currentPage === totalQuestions && step > 0) {
        updateProgress();
        showFinalResults();
        return;
    }

    const newPage = Math.min(Math.max(currentPage + step, 1), totalPages);
    if (newPage === currentPage) return;
    currentPage = newPage;
    renderPage(currentPage);

    window.scrollTo(0, 0);

    if (nextQuestionBtn) {
        nextQuestionBtn.disabled = true;
        nextQuestionBtn.textContent = '...اكشف جميع الإجابات...';
        nextQuestionBtn.style.background = 'rgb(203, 213, 225)';
    }
}

// ✅ 8. دالة تحديث شريط التقدم (معدلة لتجلب العناصر ديناميكياً)
function updateProgress() {
    const progress = (score / totalQuestions) * 100;
    
    // نجلب العناصر هنا لأنها قد تكون أنشئت حديثاً بواسطة QuizStatusBar
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const scoreDisplay = document.getElementById('score-display');
    const questionCounter = document.getElementById('question-counter');

    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    if (progressText) {
        progressText.textContent = Math.round(progress) + '%';
    }
    if (scoreDisplay) {
        scoreDisplay.textContent = score;
    }
    if (questionCounter) {
        // تم عكس العرض ليتناسب مع LTR CSS direction المستخدم في الشريط الجديد للأرقام
        // أو يمكنك استخدام التنسيق الذي تفضله
        questionCounter.textContent = `${score} / ${totalQuestions}`;
    }
}

// ... (دالة showFinalResults كما هي) ...
function showFinalResults() {
    const percentage = 100; 
    const finalScore = totalQuestions;
    let message = 'أكملت المراجعة!';
    let emoji = '🏆';

    if (quizPages) {
        quizPages.innerHTML = `
            <div class="text-center py-8 md:py-12 container-main" style="background: var(--card-bg); border-radius: 0.75rem; box-shadow: var(--shadow-sm);">
                <div class="text-5xl md:text-7xl mb-4 md:mb-6">${emoji}</div>
                <h2 class="text-2xl md:text-3xl font-bold mb-3 md:mb-4">انتهت المراجعة!</h2>
                <p class="text-lg md:text-xl mb-6 md:mb-8">${message}</p>

                <div class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl p-6 md:p-8 mb-4 md:mb-6">
                    <p class="text-3xl md:text-5xl font-bold mb-1 md:mb-2">${finalScore} / ${totalQuestions}</p>
                    <p class="text-xl md:text-2xl">${percentage}%</p>
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
    if (scoreDisplay) scoreDisplay.textContent = finalScore;
    if (questionCounter) questionCounter.textContent = `${finalScore} / ${totalQuestions}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ✅ 10. دالة التهيئة الشاملة (معدلة)
function init() {
    // 1. بناء شريط الحالة الموحد أولاً
    if (typeof QuizStatusBar !== 'undefined') {
        QuizStatusBar.init('status-bar-placeholder');
    }

    shuffleArray(quizData);

    // الآن يمكننا تحديث القيم لأن العناصر موجودة في الـ DOM
    updateProgress(); 
    
    renderPage();

    if (nextQuestionBtn) {
        nextQuestionBtn.disabled = true;
        nextQuestionBtn.textContent = '...اكشف جميع الإجابات...';
        nextQuestionBtn.style.background = 'rgb(203, 213, 225)'; 
        nextQuestionBtn.addEventListener('click', () => changePage(1));
    }
}

document.addEventListener('DOMContentLoaded', () => {
     const titleEl = document.querySelector('.page-title-card h1');
     if(titleEl) {
         document.title = titleEl.textContent;
     }

     if (typeof quizData === 'undefined' || quizData.length === 0) {
        console.error("خطأ: لم يتم تحميل متغير 'quizData' أو أنه فارغ.");
        if(quizPages) {
             quizPages.innerHTML = "<p class='text-center text-red-500 font-bold'>خطأ فادح: لم يتم تحميل الأسئلة.</p>";
        }
        return;
     }

     init();
});

// Styles injection... (كما هو)
document.head.insertAdjacentHTML('beforeend', `<style>
    input[type="text"].review-mode {
        cursor: pointer;
    }
    input[type="text"].review-mode:disabled {
        background-color: #f0fdf4;
        color: #15803d;
        font-weight: bold;
        opacity: 1;
        -webkit-text-fill-color: #15803d;
        cursor: default;
    }
    html.dark body input[type="text"].review-mode:disabled {
        background-color: #052e16;
        color: #bbf7d0;
        -webkit-text-fill-color: #bbf7d0;
    }
</style>`);