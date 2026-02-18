// المدة من ملف style.css
const CONTENT_FADE_DURATION = 1000; 

let currentCardIndex = 1; 
let isFlipped = false;
let shuffledCards = [];

// العناصر الأساسية (تم حذف مراجع التقدم الثابتة لأنها أصبحت ديناميكية)
const cardElement = document.getElementById('flashcard');
const totalCards = cardData.length;

const frontFace = document.getElementById('front-face');
const backFace = document.getElementById('back-face');
const frontHeader = document.getElementById('front-header');
const frontContent = document.getElementById('front-content');
const backHeader = document.getElementById('back-header');
const backContent = document.getElementById('back-content');
const endScreen = document.getElementById('end-screen');
const cardAndButtonsContainer = document.getElementById('card-and-buttons-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ✅ دالة تحديث الشريط الموحد (معدلة)
function updateProgress(index) {
    // نجلب العناصر ديناميكياً لأنها أُنشئت بواسطة QuizStatusBar
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    const questionCounter = document.getElementById('question-counter'); // مكان رقم البطاقة
    const scoreDisplay = document.getElementById('score-display');     // مكان النتيجة

    if (totalCards > 0) {
        // حساب النسبة
        const progressPercentage = (index / totalCards) * 100;
        
        // تحديث الشريط
        if(progressText) progressText.textContent = `${Math.round(progressPercentage)}%`;
        if(progressFill) progressFill.style.width = `${progressPercentage}%`;

        // تحديث العداد (البطاقة الحالية / الإجمالي)
        if(questionCounter) questionCounter.textContent = `${index} / ${totalCards}`;

        // تحديث خانة النتيجة لتشير إلى "البطاقات المنجزة" (السابقة)
        // (index - 1) لأن البطاقة الحالية لم تكتمل بعد
        if(scoreDisplay) scoreDisplay.textContent = Math.max(0, index - 1);
    }
}

function applyRandomStyle(displayNumber) {
    frontFace.classList.add('card-face', 'card-front', 'flex', 'flex-col', 'justify-between');
    frontHeader.classList.add('card-header', 'shadow-md');
    frontContent.className = 'card-content';

    backFace.classList.add('card-face', 'card-back', 'flex', 'flex-col', 'justify-between');
    backHeader.classList.add('card-header', 'shadow-md');
    backContent.className = 'card-content';

    frontHeader.textContent = `البطاقة ${displayNumber}`;
    backHeader.textContent = `البطاقة ${displayNumber}`;
}

function loadCard() {
    if (currentCardIndex > totalCards) {
        showEndScreen();
        return;
    }

    const card = shuffledCards[currentCardIndex - 1];
    const wasFlipped = isFlipped;

    isFlipped = false;
    cardElement.classList.remove('flipped'); 

    const updateContent = () => {
        frontContent.textContent = card.question;
        backContent.textContent = card.answer;
        applyRandomStyle(currentCardIndex);
    };

    if (wasFlipped) {
        setTimeout(updateContent, CONTENT_FADE_DURATION);
    } else {
        updateContent();
    }

    updateNavigationButtons();
    updateProgress(currentCardIndex);
}

function nextCard() {
    if (currentCardIndex < totalCards) {
        currentCardIndex++;
        loadCard();
    } else {
        showEndScreen();
    }
}

function prevCard() {
    if (currentCardIndex > 1) {
        currentCardIndex--;
        loadCard();
    }
}

window.flipCard = function() {
    if (currentCardIndex > totalCards) return;

    if (!isFlipped) {
        isFlipped = true;
        cardElement.classList.add('flipped');
        updateNavigationButtons();
    } else {
        nextCard();
    }
}

function updateNavigationButtons() {
    if (prevBtn) prevBtn.disabled = currentCardIndex <= 1 || !isFlipped;
    if (nextBtn) nextBtn.disabled = currentCardIndex >= totalCards || !isFlipped;
}

function showEndScreen() {
    if (cardElement) cardElement.classList.add('hidden');
    if (endScreen) endScreen.classList.remove('hidden');
    if (cardAndButtonsContainer) cardAndButtonsContainer.classList.add('hidden');
    
    // عند الانتهاء، نخفي الشريط الموحد
    const statusBar = document.getElementById('status-bar-placeholder');
    if(statusBar) statusBar.style.display = 'none';
}

window.restartQuiz = function() {
    if (endScreen) endScreen.classList.add('hidden');
    if (cardElement) cardElement.classList.remove('hidden');
    if (cardAndButtonsContainer) cardAndButtonsContainer.classList.remove('hidden');
    
    // إعادة إظهار الشريط عند الإعادة
    const statusBar = document.getElementById('status-bar-placeholder');
    if(statusBar) statusBar.style.display = 'block';
    
    currentCardIndex = 1;
    isFlipped = false; 
    
    shuffledCards = shuffle([...cardData]);
    loadCard();
}

document.addEventListener('DOMContentLoaded', () => {
    // ✅ 1. تهيئة الشريط الموحد أولاً
    if (typeof QuizStatusBar !== 'undefined') {
        QuizStatusBar.init('status-bar-placeholder');
    }

    if (nextBtn) nextBtn.addEventListener('click', nextCard);
    if (prevBtn) prevBtn.addEventListener('click', prevCard);
    
    // البدء
    window.restartQuiz();
});