document.addEventListener("DOMContentLoaded", () => {
    const modal = document.querySelector(".booking-modal");
    const openButtons = document.querySelectorAll("[data-modal-open]");
    const closeButtons = document.querySelectorAll("[data-modal-close]");
    const counters = document.querySelectorAll(".booking-counter__control");
    const bookingForms = document.querySelectorAll(".booking-form");
    const menuToggles = document.querySelectorAll(".menu-toggle");
    const mapBlock = document.querySelector("[data-map-block]");
    const mapToggle = document.querySelector("[data-map-toggle]");
    const zineCarousels = document.querySelectorAll("[data-zine-carousel]");
    const errorGame = document.querySelector("[data-error-game]");
    const merchShop = document.querySelector("[data-merch-shop]");

    document.addEventListener("click", (event) => {
        const toggle = event.target.closest(".menu-toggle");

        if (toggle) {
            const header = toggle.closest(".header");
            const isOpen = header?.classList.toggle("is-nav-open") || false;

            toggle.classList.toggle("is-active", isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
            toggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
            return;
        }

        const navLink = event.target.closest(".header .nav a");

        if (navLink) {
            const header = navLink.closest(".header");
            const headerToggle = header?.querySelector(".menu-toggle");

            header?.classList.remove("is-nav-open");
            headerToggle?.classList.remove("is-active");
            headerToggle?.setAttribute("aria-expanded", "false");
            headerToggle?.setAttribute("aria-label", "Открыть меню");
        }
    });

    if (modal && openButtons.length) {
        const openModal = (event) => {
            event.preventDefault();
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
            modal.querySelector("input, select, button")?.focus();
        };

        const closeModal = () => {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-open");
            openButtons[0].focus();
        };

        openButtons.forEach((button) => button.addEventListener("click", openModal));
        closeButtons.forEach((button) => button.addEventListener("click", closeModal));

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && modal.classList.contains("is-open")) {
                closeModal();
            }
        });
    }

    if (bookingForms.length) {
        bookingForms.forEach((form) => {
            form.querySelectorAll("input[name='name'], input[name='quest'], input[name='phone'], input[type='checkbox']").forEach((input) => {
                input.required = true;
            });

            form.addEventListener("submit", (event) => {
                event.preventDefault();

                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                window.alert("Форма успешно отправлена");

                if (modal?.contains(form)) {
                    modal.classList.remove("is-open");
                    modal.setAttribute("aria-hidden", "true");
                    document.body.classList.remove("modal-open");
                }

                form.reset();
            });
        });
    }

    counters.forEach((counter) => {
        const output = counter.querySelector("output");
        const buttons = counter.querySelectorAll("button");
        let count = Number(output?.textContent) || 1;

        const updateCount = (nextCount) => {
            count = Math.min(10, Math.max(1, nextCount));

            if (output) {
                output.textContent = String(count);
            }
        };

        buttons[0]?.addEventListener("click", () => updateCount(count - 1));
        buttons[1]?.addEventListener("click", () => updateCount(count + 1));
    });

    if (mapBlock && mapToggle) {
        mapToggle.addEventListener("click", () => {
            const isOpen = mapBlock.classList.toggle("is-map-open");
            mapToggle.setAttribute("aria-expanded", String(isOpen));
            mapToggle.setAttribute("aria-label", isOpen ? "Скрыть карту" : "Показать карту");
        });
    }

    zineCarousels.forEach((carousel) => {
        const spreads = Array.from(carousel.querySelectorAll("[data-zine-spread]"));
        const prevButton = carousel.querySelector("[data-zine-prev]");
        const nextButton = carousel.querySelector("[data-zine-next]");
        let currentIndex = 0;

        const updateSpread = () => {
            spreads.forEach((spread, index) => {
                spread.classList.toggle("is-active", index === currentIndex);
            });
        };

        prevButton?.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + spreads.length) % spreads.length;
            updateSpread();
        });

        nextButton?.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % spreads.length;
            updateSpread();
        });

        updateSpread();
    });

    if (merchShop) {
        const filterButtons = merchShop.querySelectorAll("[data-merch-filter]");
        const cards = merchShop.querySelectorAll("[data-merch-card]");

        const applyFilter = (filter) => {
            filterButtons.forEach((button) => {
                button.classList.toggle("is-active", button.dataset.merchFilter === filter);
            });

            cards.forEach((card) => {
                const isVisible = filter === "all" || card.dataset.category === filter;
                card.hidden = !isVisible;
            });
        };

        filterButtons.forEach((button) => {
            button.addEventListener("click", () => applyFilter(button.dataset.merchFilter));
        });

        merchShop.querySelectorAll(".merch-options button").forEach((button) => {
            button.addEventListener("click", () => {
                const options = button.closest(".merch-options");

                options?.querySelectorAll("button").forEach((option) => {
                    option.setAttribute("aria-pressed", String(option === button));
                });
            });
        });

        applyFilter("clothes");
    }

    if (errorGame) {
        const player = errorGame.querySelector("[data-error-player]");
        const obstacle = errorGame.querySelector("[data-error-obstacle]");
        const scoreOutput = errorGame.querySelector("[data-error-score]");
        const restartButton = errorGame.querySelector("[data-error-restart]");
        let isJumping = false;
        let isPlaying = false;
        let isGameOver = false;
        let score = 0;
        let obstacleX = 0;
        let obstacleSpeed = 0;
        let nextObstacleAt = 0;
        let lastFrameTime = 0;
        let hasJumpedThisRound = false;
        let hasScoredThisRound = false;
        let animationFrameId;
        let obstacleScale = 1;
        let obstacleTilt = 0;

        const updateScore = () => {
            if (scoreOutput) {
                scoreOutput.value = String(score);
                scoreOutput.textContent = String(score);
            }
        };

        const resetObstacle = (delay = 0) => {
            if (!obstacle) {
                return;
            }

            obstacleScale = 0.78 + Math.random() * 0.52;
            obstacleTilt = -18 + Math.random() * 36;
            obstacleX = errorGame.offsetWidth + obstacle.offsetWidth + Math.random() * 520;
            obstacleSpeed = 980 + Math.random() * 1120;
            nextObstacleAt = performance.now() + delay;
            hasJumpedThisRound = false;
            hasScoredThisRound = false;
            obstacle.style.opacity = "0";
            obstacle.style.transform = `translateX(${obstacleX}px) scale(${obstacleScale}) rotate(${obstacleTilt}deg)`;
        };

        const startGame = () => {
            if (isPlaying) {
                return;
            }

            isGameOver = false;
            isPlaying = true;
            score = 0;
            updateScore();
            errorGame.classList.remove("is-waiting", "is-hit", "is-over");
            resetObstacle(Math.random() * 35);
            lastFrameTime = performance.now();
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = window.requestAnimationFrame(runGame);
        };

        const endGame = () => {
            if (!obstacle) {
                return;
            }

            isPlaying = false;
            isGameOver = true;
            window.cancelAnimationFrame(animationFrameId);
            player?.classList.remove("is-jumping");
            isJumping = false;
            errorGame.classList.add("is-hit");

            window.setTimeout(() => {
                errorGame.classList.remove("is-hit");
                errorGame.classList.add("is-over");
                obstacle.style.opacity = "0";
            }, 180);
        };

        const runGame = (timestamp) => {
            if (!isPlaying || !player || !obstacle) {
                return;
            }

            const deltaSeconds = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
            lastFrameTime = timestamp;

            if (timestamp < nextObstacleAt) {
                animationFrameId = window.requestAnimationFrame(runGame);
                return;
            }

            obstacle.style.opacity = "1";
            obstacleX -= obstacleSpeed * deltaSeconds;
            obstacle.style.transform = `translateX(${obstacleX}px) scale(${obstacleScale}) rotate(${obstacleTilt}deg)`;

            const playerRect = player.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();
            const hasPassedPlayer = obstacleRect.right < playerRect.left;

            if (hasPassedPlayer && !hasScoredThisRound) {
                if (hasJumpedThisRound) {
                    score += 1;
                    updateScore();
                }

                hasScoredThisRound = true;
            }

            if (obstacleRect.right < errorGame.getBoundingClientRect().left - obstacleRect.width) {
                resetObstacle(Math.random() * 55);
            }

            const hasCollision =
                !isJumping &&
                obstacleRect.left < playerRect.right &&
                obstacleRect.right > playerRect.left &&
                obstacleRect.top < playerRect.bottom &&
                obstacleRect.bottom > playerRect.top;

            if (hasCollision) {
                endGame();
                return;
            }

            animationFrameId = window.requestAnimationFrame(runGame);
        };

        const jump = () => {
            if (!player || isJumping || isGameOver) {
                return;
            }

            startGame();
            isJumping = true;
            if (isPlaying && obstacle && obstacle.style.opacity !== "0") {
                hasJumpedThisRound = true;
            }
            player.classList.add("is-jumping");

            window.setTimeout(() => {
                player.classList.remove("is-jumping");
                isJumping = false;
            }, 680);
        };

        errorGame.addEventListener("click", () => {
            if (isGameOver) {
                startGame();
            } else {
                jump();
            }
        });
        restartButton?.addEventListener("click", (event) => {
            event.stopPropagation();
            startGame();
        });

        errorGame.addEventListener("keydown", (event) => {
            if (event.key === " " || event.key === "ArrowUp") {
                event.preventDefault();
                if (isGameOver) {
                    startGame();
                } else {
                    jump();
                }
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === " " || event.key === "ArrowUp") {
                event.preventDefault();
                if (isGameOver) {
                    startGame();
                } else {
                    jump();
                }
            }
        });

        resetObstacle();
    }
});
