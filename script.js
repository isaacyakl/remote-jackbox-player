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

	function setupSplitView() {
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

	function setupSwapView() {
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

	function swapView() {
		if (streamElement.classList.contains("z-10")) {
			streamElement.classList.remove("z-10");
			streamElement.classList.add("z-20");

			gameElement.classList.remove("z-20");
			gameElement.classList.add("z-10");
		} else {
			streamElement.classList.remove("z-20");
			streamElement.classList.add("z-10");

			gameElement.classList.remove("z-10");
			gameElement.classList.add("z-20");
		}
	}

	const copyToClipboard = (str) => {
		const el = document.createElement("textarea"); // Create a <textarea> element
		el.value = str; // Set its value to the string that you want copied
		el.setAttribute("readonly", ""); // Make it readonly to be tamper-proof
		el.style.position = "absolute";
		el.style.left = "-9999px"; // Move outside the screen to make it invisible
		document.body.appendChild(el); // Append the <textarea> element to the HTML document
		const selected =
			document.getSelection().rangeCount > 0 // Check if there is any content selected previously
				? document.getSelection().getRangeAt(0) // Store selection if found
				: false; // Mark as false to know no selection existed before
		el.select(); // Select the <textarea> content
		document.execCommand("copy"); // Copy - only works as a result of a user action (e.g. click events)
		document.body.removeChild(el); // Remove the <textarea> element
		if (selected) {
			// If a selection existed before copying
			document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
			document.getSelection().addRange(selected); // Restore the original selection
		}
	};

	let playerURL = new URL(document.location.href.toString()); // Grab current URL for the player URL

	// Function for adding stream URL to player URL using a param
	function setStreamURLParam() {
		playerURL.searchParams.set("streamURL", streamURLElement.value); // Add stream URL as a param
	}

	// Function for navigating the window to the player URL
	function updatePlayerURL() {
		document.location.href = playerURL; // Set the window URL to the new playerURL
	}

	// Function for getting stream URL from player URL param
	// Based on: https://blog.bitscry.com/2018/08/17/getting-and-setting-url-parameters-with-javascript/
	function getStreamURLParam() {
		let parameter = "streamURL";
		parameter = parameter.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		let regex = new RegExp("[\\?|&]" + parameter.toLowerCase() + "=([^&#]*)");
		let results = regex.exec("?" + playerURL.toString().toLowerCase().split("?")[1]);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, ""));
	}

	// Function for navigating stream frame
	function updateStreamFrame() {
		// If the stream URL field is not blank
		if (streamURLElement.value != "") {
			// If the entered URL starts with "http://" but not "https://"
			if (
				streamURLElement.value.toString().startsWith("http://") &&
				!streamURLElement.value.toString().startsWith("https://")
			) {
				// Swap "http://" out for "https://"
				streamURLElement.value = streamURLElement.value
					.toString()
					.replace(/http:\/\//, "https://");
			} // Else if it does not start with "https://"
			else if (!streamURLElement.value.toString().startsWith("https://")) {
				// Add https
				streamURLElement.value = "https://" + streamURLElement.value;
			}

			// If frame source is not the same as the value in the stream URL field (probably due to clicking the instructions button)
			if (streamElement.src != streamURLElement.value) {
				// Update the iframe source
				streamElement.src = streamURLElement.value;
			}
		}
	}

	// Add event listener for the split view button
	document.getElementById("splitViewButton").addEventListener("click", () => {
		setupSplitView();
	});

	// Add event listener for the swap view button
	document.getElementById("swapViewButton").addEventListener("click", () => {
		setupSwapView();
		swapView();
	});

	// Add event listener for URL input field
	streamURLElement.addEventListener("input", () => {
		// Update the stream frame
		updateStreamFrame();
	});

	// Add event listener for URL input field
	streamURLElement.addEventListener("focus", () => {
		// Update the stream frame
		updateStreamFrame();
	});

	// Add event listener for iframe location
	streamElement.addEventListener("load", () => {
		// Violates cross-origin frame policy

		// When the location changes update the URL input
		// streamURLElement.value = streamElement.contentWindow.location.href;

		// If Chrome blocked due to cross-origin frame policy
		if (
			streamURLElement.value == "about:blank#blocked" ||
			streamURLElement.value == "undefined"
		) {
			// Clear URL input
			streamURLElement.value = "";
		}
	});

	// Add event listener for share button
	document.getElementById("shareButton").addEventListener("click", () => {
		// Update streamURL
		setStreamURLParam();

		// Copy URL to clipboard
		copyToClipboard(playerURL.toString());

		// Let the user know the link was copied to the clipboard
		document.getElementById("shareText").classList.remove("hidden");
		setTimeout(() => {
			document.getElementById("shareText").classList.add("hidden");
		}, 3500);
	});

	// Add event listener for instructions button
	document.getElementById("instructionsButton").addEventListener("click", () => {
		// Set stream frame to instructions page
		streamElement.src = "instructions.html";
	});

	// Variable for streamURL
	let streamURL = getStreamURLParam(); // Get stream URL from player URL param

	// If the streamURL param was not blank
	if (streamURL != "") {
		streamURL = new URL(streamURL); // Get stream URL from player URL param
	}

	// If stream URL param of the player URL is not blank
	if (streamURL != "") {
		// Set the stream URL input element to the stream URL
		streamURLElement.value = streamURL.toString();

		// Set the stream element to the stream URL param
		streamElement.src = streamURL;
	}
});
