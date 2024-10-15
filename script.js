import { Game } from "./game.js";

/**
 * @type {HTMLButtonElement}
 */
var playButton = document.getElementById("play");
/**
 * @type {HTMLButtonElement}
 */
var showInstructionButton = document.getElementById("showInstruction");
/**
 * @type {HTMLInputElement}
 */
var usernameInput = document.getElementById("username");
/**
 * @type {HTMLSelectElement}
 */
var countrySelect = document.getElementById("country");
/**
 * @type {HTMLSelectElement}
 */
var opponentCountrySelect = document.getElementById("opponentCountry");
/**
 * @type {HTMLSelectElement}
 */
var levelSelect = document.getElementById("level");
/**
 * @type {HTMLSelectElement}
 */
var ballSelect = document.getElementById("ball");
/**
 * @type {HTMLButtonElement}
 */
var closeButton = document.getElementById("closeButton");
/**
 * @type {HTMLDivElement}
 */
var instruction = document.getElementById("instruction");
/**
 * @type {HTMLDivElement}
 */
var overlay = document.getElementsByClassName("overlay")[0];
/**
 * @type {HTMLDivElement}
 */
var countdown = document.getElementById("countdown");
/**
 * @type {HTMLDivElement}
 */
var welcome = document.getElementById("welcome");
/**
 * @type {HTMLDivElement}
 */
var game = document.getElementById("game");

usernameInput.addEventListener("input", () => {
	if (usernameInput.value == "") {
		playButton.disabled = true;
	} else {
		playButton.disabled = false;
	}
});

function play() {
	overlay.style.display = "flex";
	let count = 3;

	countdown.innerText = count.toString();

	var interval = setInterval(() => {
		if (count < 1) {
			clearInterval(interval);
			overlay.style.display = "none";
			welcome.style.display = "none";
			game.style.display = "flex";

			new Game(
				countrySelect.value,
				opponentCountrySelect.value,
				levelSelect.value,
				ballSelect.value
			).run();
		} else {
			countdown.innerText = (--count).toString();
		}
	}, 1000);
}

playButton.addEventListener("click", () => {
	if (countrySelect.value == "placeholder") alert("Please select the country");
	else if (opponentCountrySelect.value == "placeholder")
		alert("Please select the opponent country");
	else if (levelSelect.value == "placeholder") alert("Please select the level");
	else if (ballSelect.value == "placeholder") alert("Please select the ball");
	else play();
});

showInstructionButton.addEventListener("click", () => {
	instruction.style.visibility = "";
});

closeButton.addEventListener("click", () => {
	instruction.style.visibility = "hidden";
});
