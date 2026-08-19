(function () {
    var SECRET_PIN = "2054";
    var TARGET_TIMEZONE = "Asia/Jakarta";
    var TARGET_TIME_UTC = new Date("2026-08-19T17:00:00Z").getTime();
    var countdownInterval = null;
    var fadeInterval = null;
    var TARGET_VOLUME = 0.25;

    function byId(id) {
        return document.getElementById(id);
    }

    function showScreen(id) {
        var screens = document.querySelectorAll(".gate-screen");
        screens.forEach(function (screen) {
            screen.classList.toggle("is-active", screen.id === id);
        });
    }

    function formatPart(value) {
        return String(value).padStart(2, "0");
    }

    function playMessageMusic() {
        var audio = byId("messageMusic");
        if (!audio) return;

        if (fadeInterval) clearInterval(fadeInterval);
        audio.volume = 0;
        var playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(function () {
                var currentVol = 0;
                fadeInterval = setInterval(function () {
                    currentVol += 0.025;
                    if (currentVol >= TARGET_VOLUME) {
                        currentVol = TARGET_VOLUME;
                        clearInterval(fadeInterval);
                        fadeInterval = null;
                    }
                    audio.volume = currentVol;
                }, 100);
                var toggleBtn = byId("message-music-toggle");
                if (toggleBtn) toggleBtn.classList.remove("is-muted");
            }).catch(function (e) {
                console.log("Autoplay restricted or postponed: ", e);
                var toggleBtn = byId("message-music-toggle");
                if (toggleBtn) toggleBtn.classList.add("is-muted");
            });
        }
    }

    function stopMessageMusic(callback) {
        var audio = byId("messageMusic");
        if (!audio) {
            if (callback) callback();
            return;
        }

        if (fadeInterval) clearInterval(fadeInterval);

        if (audio.paused || audio.volume <= 0) {
            audio.pause();
            audio.currentTime = 0;
            if (callback) callback();
            return;
        }

        var currentVol = audio.volume;
        fadeInterval = setInterval(function () {
            currentVol -= 0.04;
            if (currentVol <= 0) {
                currentVol = 0;
                audio.volume = 0;
                audio.pause();
                audio.currentTime = 0;
                clearInterval(fadeInterval);
                fadeInterval = null;
                if (callback) callback();
            } else {
                audio.volume = currentVol;
            }
        }, 50);
    }

    function toggleMessageMusic() {
        var audio = byId("messageMusic");
        var toggleBtn = byId("message-music-toggle");
        if (!audio) return;

        if (audio.paused) {
            audio.volume = TARGET_VOLUME;
            audio.play();
            if (toggleBtn) toggleBtn.classList.remove("is-muted");
        } else {
            audio.pause();
            if (toggleBtn) toggleBtn.classList.add("is-muted");
        }
    }

    function updateCountdown() {
        var remaining = TARGET_TIME_UTC - Date.now();
        var readyPanel = byId("countdown-ready");
        var timer = byId("countdown-timer");

        if (remaining <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            byId("days").textContent = "00";
            byId("hours").textContent = "00";
            byId("minutes").textContent = "00";
            byId("seconds").textContent = "00";
            timer.setAttribute("hidden", "hidden");
            readyPanel.removeAttribute("hidden");
            setTimeout(function () {
                showScreen("letter-screen");
                playMessageMusic();
            }, 1800);
            return;
        }

        var totalSeconds = Math.floor(remaining / 1000);
        var days = Math.floor(totalSeconds / 86400);
        var hours = Math.floor((totalSeconds % 86400) / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        byId("days").textContent = formatPart(days);
        byId("hours").textContent = formatPart(hours);
        byId("minutes").textContent = formatPart(minutes);
        byId("seconds").textContent = formatPart(seconds);
    }

    function startCountdown() {
        var countdownScreen = byId("countdown-screen");
        countdownScreen.dataset.timezone = TARGET_TIMEZONE;
        showScreen("countdown-screen");
        updateCountdown();
        if (!countdownInterval) {
            countdownInterval = setInterval(updateCountdown, 1000);
        }
    }

    function updatePinSlots() {
        var input = byId("pin-input");
        if (!input) return;
        var val = input.value || "";
        var slots = document.querySelectorAll(".pin-slot");
        var isFocused = document.activeElement === input;
        slots.forEach(function (slot, idx) {
            slot.classList.toggle("is-filled", idx < val.length);
            slot.classList.toggle("is-active", isFocused && (idx === val.length || (idx === 3 && val.length === 4)));
        });
    }

    function handleUnlock(event) {
        event.preventDefault();

        var form = byId("lock-form");
        var input = byId("pin-input");
        var feedback = byId("pin-feedback");
        var lockScreen = byId("lock-screen");

        form.classList.remove("is-error");
        feedback.textContent = "";

        if (input.value === SECRET_PIN) {
            lockScreen.classList.add("is-unlocking");
            var lockCard = lockScreen.querySelector(".lock-card");
            if (lockCard) {
                lockCard.classList.add("is-unlocked-card");
            }
            input.blur();
            updatePinSlots();
            setTimeout(startCountdown, 750);
            return;
        }

        feedback.textContent = "Hmm... PIN-nya belum pas 🤭";
        form.classList.add("is-error");
        input.value = "";
        updatePinSlots();
        input.focus();
        setTimeout(function () {
            form.classList.remove("is-error");
        }, 420);
    }

    function continueToBirthdayExperience() {
        var gate = byId("birthday-gate");
        stopMessageMusic(function () {
            document.body.classList.remove("pre-birthday");
            gate.classList.add("is-complete");

            setTimeout(function () {
                gate.setAttribute("hidden", "hidden");
                if (window.startBirthdayExperience) {
                    window.startBirthdayExperience();
                }
            }, 600);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        byId("lock-form").addEventListener("submit", handleUnlock);
        byId("continue-birthday").addEventListener("click", continueToBirthdayExperience);
        var toggleBtn = byId("message-music-toggle");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", toggleMessageMusic);
        }
        var pinInput = byId("pin-input");
        if (pinInput) {
            pinInput.addEventListener("input", updatePinSlots);
            pinInput.addEventListener("focus", updatePinSlots);
            pinInput.addEventListener("blur", updatePinSlots);
        }
        updatePinSlots();
        if (pinInput) {
            pinInput.focus();
        }
    });
}());
