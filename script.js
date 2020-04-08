// Check if DOM is ready
let formReady = (callback) => {
	if (document.readyState != "loading") callback();
	else document.addEventListener("DOMContentLoaded", callback);
};

// Execute form code when DOM is ready
formReady(() => {
	let streamElement = document.getElementById("stream");
	let gameElement = document.getElementById("game");
	let streamURLElement = document.getElementById("streamURL");

	function splitView() {
		streamElement.classList.remove("lg:w-1/2");

		streamElement.classList.add("static");
		streamElement.classList.add("w-1/2");
		streamElement.classList.remove("absolute");
		streamElement.classList.remove("w-screen");

		gameElement.classList.remove("lg:w-1/2");

		gameElement.classList.add("static");
		gameElement.classList.add("w-1/2");
		gameElement.classList.remove("absolute");
		gameElement.classList.remove("w-screen");
	}

	function swapView() {
		streamElement.classList.remove("lg:w-1/2");

		streamElement.classList.remove("static");
		streamElement.classList.remove("w-1/2");
		streamElement.classList.add("absolute");
		streamElement.classList.add("w-screen");

		gameElement.classList.remove("lg:w-1/2");

		gameElement.classList.remove("static");
		gameElement.classList.remove("w-1/2");
		gameElement.classList.add("absolute");
		gameElement.classList.add("w-screen");
	}

	function swapViews() {
		if (streamElement.classList.contains("z-10")) {
			streamElement.classList.add("z-20");
			streamElement.classList.remove("z-10");

			gameElement.classList.add("z-10");
			gameElement.classList.remove("z-20");
		} else {
			streamElement.classList.add("z-10");
			streamElement.classList.remove("z-20");

			gameElement.classList.add("z-20");
			gameElement.classList.remove("z-10");
		}
	}

	// Add event listener for the split view button
	document.getElementById("splitViewButton").addEventListener("click", () => {
		splitView();
	});

	// Add event listener for the swap view button
	document.getElementById("swapViewButton").addEventListener("click", () => {
		swapView();
		swapViews();
	});

	// Add event listener for URL input field
	streamURLElement.addEventListener("input", () => {
		streamElement.src = streamURLElement.value;
	});
});
