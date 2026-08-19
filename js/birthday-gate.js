(function () {
    var SECRET_PIN = "2054";
    var TARGET_TIMEZONE = "Asia/Jakarta";
    var TARGET_TIME_UTC = Date.now() + (10 * 1000);
    var countdownInterval = null;

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
            input.blur();
            setTimeout(startCountdown, 850);
            return;
        }

        feedback.textContent = "Hmm... that's not the key";
        form.classList.add("is-error");
        input.value = "";
        input.focus();
        setTimeout(function () {
            form.classList.remove("is-error");
        }, 420);
    }

    function openEnvelope() {
        var envelopeScreen = byId("envelope-screen");
        envelopeScreen.classList.add("is-open");
        setTimeout(function () {
            showScreen("letter-screen");
        }, 1850);
    }

    function continueToBirthdayExperience() {
        var gate = byId("birthday-gate");
        document.body.classList.remove("pre-birthday");
        gate.classList.add("is-complete");

        setTimeout(function () {
            gate.setAttribute("hidden", "hidden");
            var playButton = byId("play");
            if (playButton) {
                playButton.focus();
            }
        }, 820);
    }

    document.addEventListener("DOMContentLoaded", function () {
        byId("lock-form").addEventListener("submit", handleUnlock);
        byId("open-letter-gate").addEventListener("click", function () {
            showScreen("envelope-screen");
        });
        byId("envelope-button").addEventListener("click", openEnvelope);
        byId("continue-birthday").addEventListener("click", continueToBirthdayExperience);
        byId("pin-input").focus();
    });
}());
