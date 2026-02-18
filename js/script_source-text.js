/**
 * مشغل صوت بسيط - صف واحد أفقي
 * Simple Audio Player - One Horizontal Row
 */

(function() {
    'use strict';
    
    console.log('🎵 Audio Player Script Loaded');
    
    function initPlayers() {
        console.log('🔍 Searching for audio elements...');
        
        const audioElements = document.querySelectorAll('audio');
        console.log(`✅ Found ${audioElements.length} audio elements`);
        
        if (audioElements.length === 0) {
            console.warn('⚠️ No audio elements found!');
            return;
        }
        
        audioElements.forEach((audio, index) => {
            console.log(`🎵 Creating player ${index + 1}...`);
            try {
                const player = createSimplePlayer(audio, index);
                audio.parentNode.insertBefore(player, audio);
                audio.style.display = 'none';
                console.log(`✅ Player ${index + 1} created successfully`);
            } catch (error) {
                console.error(`❌ Error creating player ${index + 1}:`, error);
            }
        });
        
        // Stop other audios when one plays
        audioElements.forEach(audio => {
            audio.addEventListener('play', function() {
                audioElements.forEach(other => {
                    if (other !== audio && !other.paused) {
                        other.pause();
                    }
                });
            });
        });
        
        console.log('✅ All players initialized');
    }
    
    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayers);
    } else {
        initPlayers();
    }
    
    function createSimplePlayer(audio, index) {
        
        const wrapper = document.createElement('div');
        wrapper.className = 'simple-audio-player';
        wrapper.onclick = e => e.stopPropagation();
        
        wrapper.innerHTML = `
            <div class="player-row">
                <button class="btn-play" data-id="${index}">▶</button>
                <span class="time-current">00:00</span>
                <div class="progress-bar" data-id="${index}">
                    <div class="progress-fill"></div>
                </div>
                <span class="time-total">00:00</span>
                <div class="speed-wrapper">
                    <button class="btn-speed" data-id="${index}">⋮</button>
                    <div class="speed-menu-horizontal">
                        <button class="btn-speed-decrease">−</button>
                        <button class="btn-speed-value" data-speed="1.00" class="active">1.00x</button>
                        <button class="btn-speed-value" data-speed="1.25">1.25x</button>
                        <button class="btn-speed-value" data-speed="1.50">1.50x</button>
                        <button class="btn-speed-increase">+</button>
                    </div>
                </div>
            </div>
        `;
        
        setupPlayer(wrapper, audio);
        return wrapper;
    }
    
    function setupPlayer(wrapper, audio) {
        
        const playBtn = wrapper.querySelector('.btn-play');
        const timeCurrent = wrapper.querySelector('.time-current');
        const timeTotal = wrapper.querySelector('.time-total');
        const progressBar = wrapper.querySelector('.progress-bar');
        const progressFill = wrapper.querySelector('.progress-fill');
        const speedBtn = wrapper.querySelector('.btn-speed');
        const speedMenu = wrapper.querySelector('.speed-menu-horizontal');
        const speedValues = wrapper.querySelectorAll('.btn-speed-value');
        const speedDecrease = wrapper.querySelector('.btn-speed-decrease');
        const speedIncrease = wrapper.querySelector('.btn-speed-increase');
        
        let currentSpeed = 1.00;
        
        // Play/Pause
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playBtn.textContent = '⏸';
                playBtn.classList.add('playing');
            } else {
                audio.pause();
                playBtn.textContent = '▶';
                playBtn.classList.remove('playing');
            }
        });
        
        // Jump to time - Click on current time
        timeCurrent.addEventListener('click', (e) => {
            e.stopPropagation();
            showTimeJumpModal(audio, timeCurrent);
        });
        
        // Update progress
        audio.addEventListener('timeupdate', () => {
            if (audio.duration > 0) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = percent + '%';
                timeCurrent.textContent = formatTime(audio.currentTime);
            }
        });
        
        // Load duration
        audio.addEventListener('loadedmetadata', () => {
            timeTotal.textContent = formatTime(audio.duration);
        });
        
        // Try to set duration immediately
        if (audio.duration && isFinite(audio.duration)) {
            timeTotal.textContent = formatTime(audio.duration);
        }
        
        // Ended
        audio.addEventListener('ended', () => {
            playBtn.textContent = '▶';
            playBtn.classList.remove('playing');
            progressFill.style.width = '0%';
        });
        
        // Seek
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            audio.currentTime = percent * audio.duration;
        });
        
        // Speed toggle
        speedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Calculate position above the player
            const btnRect = speedBtn.getBoundingClientRect();
            const menuHeight = 50; // approximate menu height
            const topPosition = btnRect.top - menuHeight - 8;
            
            // Position menu
            speedMenu.style.top = topPosition + 'px';
            speedMenu.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!speedBtn.contains(e.target) && !speedMenu.contains(e.target)) {
                speedMenu.classList.remove('show');
            }
        });
        
        // Speed preset selection
        speedValues.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const speed = parseFloat(btn.dataset.speed);
                currentSpeed = speed;
                audio.playbackRate = speed;
                speedValues.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Speed decrease by 0.25
        speedDecrease.addEventListener('click', (e) => {
            e.stopPropagation();
            currentSpeed = Math.max(0.25, currentSpeed - 0.25);
            audio.playbackRate = currentSpeed;
            updateActiveSpeed();
        });
        
        // Speed increase by 0.25
        speedIncrease.addEventListener('click', (e) => {
            e.stopPropagation();
            currentSpeed = Math.min(3.00, currentSpeed + 0.25);
            audio.playbackRate = currentSpeed;
            updateActiveSpeed();
        });
        
        function updateActiveSpeed() {
            speedValues.forEach(btn => {
                const speed = parseFloat(btn.dataset.speed);
                if (Math.abs(speed - currentSpeed) < 0.01) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }
    
    function showTimeJumpModal(audio, timeDisplay) {
        // Remove existing modal if any
        const existingModal = document.querySelector('.time-jump-modal');
        if (existingModal) existingModal.remove();
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'time-jump-modal';
        
        const currentTime = audio.currentTime;
        const mins = Math.floor(currentTime / 60);
        const secs = Math.floor(currentTime % 60);
        
        modal.innerHTML = `
            <div class="time-jump-content">
                <h3>انتقال إلى</h3>
                <div class="time-inputs-simple">
                    <input type="number" class="time-input-mins" min="0" max="999" value="${mins}" placeholder="00">
                    <span>:</span>
                    <input type="number" class="time-input-secs" min="0" max="59" value="${secs}" placeholder="00">
                </div>
                <div class="time-buttons">
                    <button class="btn-jump-cancel">إلغاء</button>
                    <button class="btn-jump-go">✓</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const minsInput = modal.querySelector('.time-input-mins');
        const secsInput = modal.querySelector('.time-input-secs');
        const cancelBtn = modal.querySelector('.btn-jump-cancel');
        const goBtn = modal.querySelector('.btn-jump-go');
        
        // Focus on minutes input
        setTimeout(() => minsInput.select(), 100);
        
        // Cancel
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Go / Jump
        goBtn.addEventListener('click', () => {
            const newMins = parseInt(minsInput.value) || 0;
            const newSecs = parseInt(secsInput.value) || 0;
            const newTime = (newMins * 60) + newSecs;
            
            if (newTime >= 0 && newTime <= audio.duration) {
                audio.currentTime = newTime;
                modal.remove();
            } else {
                alert('الوقت غير صحيح');
            }
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Enter key to jump
        [minsInput, secsInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    goBtn.click();
                }
            });
        });
        
        // Auto-advance to seconds after 2 digits in minutes
        minsInput.addEventListener('input', () => {
            if (minsInput.value.length >= 2) {
                secsInput.focus();
            }
        });
    }
    
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    
})();
