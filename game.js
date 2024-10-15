/**
 * @type {HTMLDivElement}
 */
var gameElement = document.getElementById("game");
var CENTER_X = gameElement.offsetWidth / 2;

const PLATFORM_Y = 512;
const MAX_JUMP_TOP = 200;
const FALL_SPEED = 3;
const PLAYER_IDLE_BLANK_SPACE = 22;
const MAX_IDLE = 17;
const MAX_FORWARD = 9;
const MAX_BACKWARD = 9;
const MAX_KICK = 8;

export class Player {
	constructor(country, num) {
		this.num = num;
		this.country = country;
		this.element = document.getElementById(`player${num}`);
		this.state = ["idle", 0];
		this.basePath = `Characters/Character ${this.country}`;
		this.interval = null;
		this.jump = false;
		this.kick = false;
		this.onTopOf = "groun";
		this.dx = 0;
		this.dy = 0;

		this.element.style.top = `${
			PLATFORM_Y - this.element.offsetHeight + PLAYER_IDLE_BLANK_SPACE
		}px`;

		if (num == 1) this.element.style.left = "128px";
		else if (num == 2)
			this.element.style.left = `${gameElement.offsetWidth - 256}px`;

		this.setState("idle", MAX_IDLE, true);

		document.addEventListener("keydown", this.onkeydown.bind(this));
		document.addEventListener("keyup", this.onkeyup.bind(this));
	}

	left() {
		return this.element.offsetLeft + PLAYER_IDLE_BLANK_SPACE;
	}

	right() {
		return (
			this.element.offsetLeft +
			this.element.offsetWidth -
			PLAYER_IDLE_BLANK_SPACE
		);
	}

	top() {
		return this.element.offsetTop + PLAYER_IDLE_BLANK_SPACE;
	}

	bottom() {
		return (
			this.element.offsetTop +
			this.element.offsetHeight -
			PLAYER_IDLE_BLANK_SPACE
		);
	}

	updateTexture(name, index) {
		this.element.src = `${this.basePath}/${name}/${name}_${index
			.toString()
			.padStart(3, "0")}.png`;
	}

	/**
	 *
	 * @param {Ball} ball
	 */
	update(ball) {
		if (this.jump) {
			this.updateTexture("Jump", 0);

			if (
				this.top() + this.dy < MAX_JUMP_TOP ||
				(this.right() + this.dx > ball.left() &&
					this.bottom() + this.dy > ball.top() &&
					this.left() + this.dx < ball.right() &&
					this.top() + this.dy < ball.bottom())
			) {
				this.jump = false;
				this.dy = -this.dy;
			}
		}

		// Jika sedang jatuh, update texture jadi texture lompat
		if (this.dy == 2) this.updateTexture("Jump", 0);

		// Cek apakah player berada di udara (tidak berada di atas apa-apa) atau di atas tanah
		if (this.bottom() + this.dy < PLATFORM_Y) this.onTopOf = "air";
		else this.onTopOf = "ground";

		// Jika player berada di udara dan sedang tidak lompat, buat dia jatuh
		if (this.onTopOf == "air" && !this.jump) this.dy = 2;

		// Jika player sedang jatuh dan dikatakan berada di tanah
		// Stop pergerakan jatuh
		if (this.dy > 0 && this.onTopOf == "ground") this.dy = 0;

		// Cek apakah player berada di (atas) bola dan sedang jatuh
		if (
			this.dy > 0 &&
			this.right() + this.dx > ball.left() &&
			this.bottom() + this.dy > ball.top() &&
			this.left() + this.dx < ball.right() &&
			this.top() + this.dy < ball.bottom()
		) {
			this.onTopOf = "ball";
			this.dy = 0;
		}

		if (this.state[0] == "idle" && !this.jump && this.onTopOf != "air") {
			this.updateTexture("Idle", this.state[1]);
		} else if (this.state[0] == "backward") {
			if (
				(this.num == 1 &&
					this.right() + this.dx > ball.left() &&
					this.bottom() + this.dy > ball.top() &&
					this.left() + this.dx < ball.right() &&
					this.top() + this.dy < ball.bottom()) ||
				(this.num == 2 &&
					this.right() + this.dx > ball.left() &&
					this.bottom() + this.dy > ball.top() &&
					this.left() + this.dx < ball.right() &&
					this.top() + this.dy < ball.bottom())
			) {
				this.setState("idle", MAX_IDLE);
				this.dx = 0;
			} else {
				this.updateTexture("Move Backward", this.state[1]);
			}
		} else if (this.state[0] == "forward") {
			if (
				(this.num == 1 &&
					this.right() + this.dx > ball.left() &&
					this.bottom() + this.dy > ball.top() &&
					this.left() + this.dx < ball.right() &&
					this.top() + this.dy < ball.bottom()) ||
				(this.num == 2 &&
					this.right() + this.dx > ball.left() &&
					this.bottom() + this.dy > ball.top() &&
					this.left() + this.dx < ball.right() &&
					this.top() + this.dy < ball.bottom())
			) {
				this.setState("idle", MAX_IDLE);
				this.dx = 0;
			} else {
				this.updateTexture("Move Forward", this.state[1]);
			}
		} else if (this.state[0] == "kick") {
			this.updateTexture("Kick", this.state[1]);

			if (
				(this.num == 1 &&
					this.right() + PLAYER_IDLE_BLANK_SPACE > ball.left() &&
					this.bottom() + PLAYER_IDLE_BLANK_SPACE > ball.top() &&
					this.left() - PLAYER_IDLE_BLANK_SPACE < ball.right() &&
					this.top() - PLAYER_IDLE_BLANK_SPACE < ball.bottom()) ||
				(this.num == 2 &&
					this.left() - PLAYER_IDLE_BLANK_SPACE < ball.right() &&
					this.bottom() + PLAYER_IDLE_BLANK_SPACE > ball.top() &&
					this.right() + PLAYER_IDLE_BLANK_SPACE > ball.left() &&
					this.top() - PLAYER_IDLE_BLANK_SPACE < ball.bottom())
			) {
				ball.kickedBy = this;
			}

			// Cek apakah sudah selesai menendang
			if (this.state[1] == MAX_KICK) {
				this.setState("idle", MAX_IDLE);
				this.kick = false;
			}
		}

		this.element.style.left = `${this.element.offsetLeft + this.dx}px`;
		this.element.style.top = `${this.element.offsetTop + this.dy}px`;
	}

	setState(newState, maxState, ignoreSameState = false, interval = 50) {
		if (newState === this.state[0] && !ignoreSameState) return;

		this.state = [newState, 0];

		clearInterval(this.interval);
		this.interval = setInterval(() => {
			this.state = [newState, (this.state[1] + 1) % (maxState + 1)];
		}, interval);
	}

	/**
	 *
	 * @param {KeyboardEvent} e
	 */
	onkeydown(e) {
		const key = e.key.toLowerCase();

		if (
			((key == "a" && this.num == 1) ||
				(key == "arrowright" && this.num == 2)) &&
			!this.kick
		) {
			this.setState("backward", MAX_BACKWARD);
			this.dx = this.num == 1 ? -1 : 1;
		} else if (
			((key == "d" && this.num == 1) ||
				(key == "arrowleft" && this.num == 2)) &&
			!this.kick
		) {
			this.setState("forward", MAX_FORWARD);
			this.dx = this.num == 1 ? 1 : -1;
		} else if (
			((key == "w" && this.num == 1) || (key == "arrowup" && this.num == 2)) &&
			!this.jump &&
			this.onTopOf != "air"
		) {
			this.jump = true;
			this.dy = -2;
		} else if (
			(this.num == 1 && key == " ") ||
			(this.num == 2 && key == "enter")
		) {
			this.setState("kick", MAX_KICK, false, 50);
			this.kick = true;
			this.dx = 0;
		}
	}

	/**
	 *
	 * @param {KeyboardEvent} e
	 */
	onkeyup(e) {
		const key = e.key.toLowerCase();

		if (
			(key == "a" && this.num == 1 && this.state[0] == "backward") ||
			(key == "arrowleft" && this.num == 2 && this.state[0] == "forward") ||
			(key == "d" && this.num == 1 && this.state[0] == "forward") ||
			(key == "arrowright" && this.num == 2 && this.state[0] == "backward")
		) {
			this.setState("idle", MAX_IDLE);
			this.dx = 0;
		}
	}
}

export class Ball {
	constructor(ball) {
		this.element = document.getElementById("theBall");
		this.element.src =
			ball == 1 ? "Sprites/Ball 01.png" : "Sprites/Ball 02.png";
		this.element.style.top = "0px";
		this.element.style.left = `${CENTER_X - this.element.offsetWidth / 2}px`;
		this.dx = 0;
		this.dy = 0;
		/**
		 * @type {Player}
		 */
		this.kickedBy = null;
	}

	top() {
		return this.element.offsetTop;
	}

	bottom() {
		return this.element.offsetTop + this.element.offsetHeight;
	}

	left() {
		return this.element.offsetLeft;
	}

	right() {
		return this.element.offsetLeft + this.element.offsetWidth;
	}

	/**
	 *
	 * @param {Player} player1
	 * @param {Player} player2
	 */
	update(player1, player2) {
		if (this.bottom() < PLATFORM_Y) {
			this.dy = Math.min(PLATFORM_Y - this.bottom(), 1);
		}

		if (
			this.bottom() + this.dy > player1.top() &&
			this.left() + this.dx < player1.right() &&
			this.right() + this.dx > player1.left() &&
			this.top() + this.dy < player1.bottom()
		) {
			this.dy = 0;

			if (this.kickedBy == player2) {
				this.kickedBy = null;
				this.dx = 0;
			}
		}

		if (
			this.bottom() + this.dy > player2.top() &&
			this.left() + this.dx < player2.right() &&
			this.right() + this.dx > player2.left() &&
			this.top() + this.dy < player2.bottom()
		) {
			this.dy = 0;

			if (this.kickedBy == player1) {
				this.kickedBy = null;
				this.dx = 0;
			}
		}

		if (this.kickedBy != null) {
			this.dx = this.kickedBy == player1 ? 5 : -5;

			// Tentukan arah bola (ke bawah atau atas)
			this.dy =
				this.kickedBy.bottom() > this.bottom() - this.element.offsetHeight / 2
					? -1
					: 1;
		}

		if (this.bottom() + this.dy > PLATFORM_Y) this.dy = 0;

		this.element.style.left = `${this.element.offsetLeft + this.dx}px`;
		this.element.style.top = `${this.element.offsetTop + this.dy}px`;
	}
}

export class GoalSide {
	constructor(num) {
		this.num = num;
		this.element = document.getElementById(`goalSide${num}`);
		this.element.style.top = `${PLATFORM_Y - this.element.offsetHeight}px`;

		if (num == 1) this.element.style.left = "44px";
		else if (num == 2) this.element.style.right = "48px";

		this.score1 = document.getElementById("score1");
		this.score2 = document.getElementById("score2");
	}

	top() {
		return this.element.offsetTop;
	}

	bottom() {
		return this.element.offsetTop + this.element.offsetHeight;
	}

	left() {
		return this.element.offsetLeft;
	}

	right() {
		return this.element.offsetLeft + this.element.offsetWidth;
	}

	/**
	 *
	 * @param {Ball} ball
	 * @param {Game} game
	 */
	update(ball, game) {
		if (
			ball.right() >= this.left() &&
			ball.bottom() >= this.top() &&
			ball.left() <= this.right() &&
			ball.top() <= this.bottom()
		) {
			if (this.num == 1)
				this.score2.innerText = Number(this.score2.innerText) + 1;
			else this.score1.innerText = Number(this.score1.innerText) + 1;

			game.again();

			if (game.isTimerUp()) {
				const score1 = Number(this.score1.innerText);
				const score2 = Number(this.score2.innerText);

				game.setWinner(score1 > score2 ? "Player 1" : "Player 2");
			}
		}
	}
}

export class Game {
	constructor(country1, country2, level, ball) {
		gameElement = document.getElementById("game");
		CENTER_X = gameElement.offsetWidth / 2;

		this.ballType = ball;
		this.country1 = country1;
		this.country2 = country2;
		this.level = level;
		this.player1 = new Player(this.country1, 1);
		this.player2 = new Player(this.country2, 2);
		this.goalSide1 = new GoalSide(1);
		this.goalSide2 = new GoalSide(2);
		this.ball = new Ball(this.ballType);
		this.timer = document.getElementById("timerSecond");
		this.paused = false;

		switch (level) {
			case "easy":
				this.timer.innerText = 30;
				break;
			case "medium":
				this.timer.innerText = 20;
				break;
			case "hard":
				this.timer.innerText = 15;
				break;
		}

		this.keydownEvent = document.addEventListener(
			"keydown",
			this.onkeydown.bind(this)
		);
	}

	/**
	 *
	 * @param {KeyboardEvent} e
	 */
	onkeydown(e) {
		if (e.key == "Escape") {
			this.paused = !this.paused;

			const overlay = document.getElementsByClassName("overlay")[2];
			if (this.paused) overlay.style.display = "flex";
			else overlay.style.display = "none";
		}
	}

	isTimerUp() {
		return this.timer.innerText == 0;
	}

	setWinner(winner) {
		document.getElementsByClassName("overlay")[1].style.display = "flex";

		document.getElementById("win").innerText = `${winner} Won!`;

		clearInterval(this.gameInterval);
	}

	again() {
		this.player1 = new Player(this.country1, 1);
		this.player2 = new Player(this.country2, 2);
		this.ball = new Ball(this.ballType);
	}

	run() {
		const flag1Path = `Sprites/Flag/${this.country1}.png`;
		const flag2Path = `Sprites/Flag/${this.country2}.png`;

		document.querySelectorAll("#countryFlags img").forEach((v) => {
			v.src = v.classList.contains("flag1") ? flag1Path : flag2Path;
		});
		document.getElementById("flag1Image").src = flag1Path;
		document.getElementById("flag2Image").src = flag2Path;
		document.getElementById("flag1Name").innerText = this.country1;
		document.getElementById("flag2Name").innerText = this.country2;

		var intervalTimer = setInterval(() => {
			if (this.paused) return;

			this.timer.innerText = this.timer.innerText - 1;

			if (this.timer.innerText <= 0) {
				clearInterval(intervalTimer);

				const score1 = Number(document.getElementById("score1").innerText);
				const score2 = Number(document.getElementById("score2").innerText);

				if (score1 != score2) {
					this.setWinner(score1 > score2 ? "Player 1" : "Player 2");
				}
			}
		}, [1000]);

		this.gameInterval = setInterval(() => {
			if (this.paused) return;

			this.player1.update(this.ball);
			this.player2.update(this.ball);
			this.ball.update(this.player1, this.player2);
			this.goalSide1.update(this.ball, this);
			this.goalSide2.update(this.ball, this);
		});
	}
}
