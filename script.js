// Check if DOM is ready
let formReady = (callback) => {
	if (document.readyState != "loading") callback();
	else document.addEventListener("DOMContentLoaded", callback);
};

// Execute form code when DOM is ready
formReady(() => {
	// Element variables
	let streamFrame = document.getElementById("streamFrame");
	let unknownStreamElement = document.getElementById("unknownStream");
	let twitchStreamElement = document.getElementById("twitchStream");
	let mixerStreamElement = document.getElementById("mixerStream");
	let mixerChatElement = document.getElementById("mixerChat");
	let instructionsElement = document.getElementById("instructions");
	let gameElement = document.getElementById("game");
	let streamURLElement = document.getElementById("streamURL");

	// Data variables
	let playerURL = new URL(document.location.href.toString()); // Grab current URL for the player URL used for link sharing
	let streamURL = getStreamURLParam(); // Get stream URL from player URL param
	let twitchChannelId = ""; // Variable to hold Twitch channel id
	let mixerChannelName = ""; // Variable to hold Mixer channel name

	// Function for setting up split view
	function setupSplitView() {
		streamFrame.classList.remove("lg:w-1/2");
		streamFrame.classList.remove("absolute");
		streamFrame.classList.remove("w-screen");
		streamFrame.classList.add("static");
		streamFrame.classList.add("w-1/2");

		gameElement.classList.remove("lg:w-1/2");
		gameElement.classList.remove("absolute");
		gameElement.classList.remove("w-screen");
		gameElement.classList.add("static");
		gameElement.classList.add("w-1/2");
	}

	// Function for setting up swap view
	function setupSwapView() {
		streamFrame.classList.remove("lg:w-1/2");
		streamFrame.classList.remove("static");
		streamFrame.classList.remove("w-1/2");
		streamFrame.classList.add("absolute");
		streamFrame.classList.add("w-screen");

		gameElement.classList.remove("lg:w-1/2");
		gameElement.classList.remove("static");
		gameElement.classList.remove("w-1/2");
		gameElement.classList.add("absolute");
		gameElement.classList.add("w-screen");
	}

	// Function for swapping which frame is in front
	function swapView() {
		if (streamFrame.classList.contains("z-10")) {
			streamFrame.classList.remove("z-10");
			streamFrame.classList.add("z-20");

			gameElement.classList.remove("z-20");
			gameElement.classList.add("z-10");
		} else {
			streamFrame.classList.remove("z-20");
			streamFrame.classList.add("z-10");

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

	// Function for getting stream URL from player URL param
	// Based on: https://blog.bitscry.com/2018/08/17/getting-and-setting-url-parameters-with-javascript/
	function getStreamURLParam() {
		let parameter = "streamURL";
		parameter = parameter.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		let regex = new RegExp("[\\?|&]" + parameter.toLowerCase() + "=([^&#]*)");
		let results = regex.exec("?" + playerURL.toString().toLowerCase().split("?")[1]);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, ""));
	}

	// Function for navigating the window URL to the player URL
	function updatePlayerURL() {
		// Update the streamURL variable with the entered stream URL
		streamURL = streamURLElement.value;

		// If there is a stream URL entered
		if (streamURL != "") {
			playerURL.searchParams.set("streamURL", streamURLElement.value); // Add stream URL as a param to the player URL
			window.history.replaceState(null, null, "?streamURL=" + encodeURIComponent(streamURL)); // Add the streamURL to the window URL
		}
	}

	// Show appropriate stream type
	function showStreamFrameElement(type) {
		// Hide unknown Stream Element
		function hideUnknownStream() {
			unknownStreamElement.classList.add("hidden"); // Hide unknown stream element
			unknownStreamElement.src = ""; // Clear unknown stream element
		}

		// Hide instructions
		function hideInstructions() {
			instructionsElement.classList.add("hidden"); // Hide instructions
		}

		// Hide Twitch Stream Element
		function hideTwitchStream() {
			twitchStreamElement.classList.add("hidden"); // Hide Twitch stream element
			twitchStreamElement.innerHTML = ""; // Clear Twitch stream element
			twitchChannelId = ""; // Clear Twitch channel id
		}

		// Hide Mixer Stream Element
		function hideMixerStream() {
			mixerStreamElement.classList.add("hidden"); // Hide Mixer stream element
			mixerChatElement.classList.add("hidden"); // Hide Mixer chat element
			mixerStreamElement.src = ""; // Clear Mixer stream element
			mixerChatElement.src = ""; // Clear Mixer chat element
			mixerChannelName = ""; // Clear Mixer channel name
		}

		// If type equals Twitch
		if (type == "twitch") {
			// Display Twitch stream element
			twitchStreamElement.classList.remove("hidden");

			hideInstructions(); // Hide instructions
			hideUnknownStream(); // Hide unknown stream
			hideMixerStream(); // Hide Mixer stream
		}
		// If type equals instructions
		else if (type == "instructions") {
			// Display instructions element
			instructionsElement.classList.remove("hidden");

			hideUnknownStream(); // Hide unknown stream
			hideTwitchStream(); // Hide twitch
			hideMixerStream(); // Hide Mixer stream
		}
		// If type equals mixer
		else if (type == "mixer") {
			// Display Mixer stream element
			mixerStreamElement.classList.remove("hidden");

			// Display Mixer chat element
			mixerChatElement.classList.remove("hidden");

			hideInstructions(); // Hide instructions
			hideUnknownStream(); // Hide unknown stream
			hideTwitchStream(); // Hide Twitch stream
		}
		// Else use unknown stream element
		else {
			// Display unknown stream element
			unknownStreamElement.classList.remove("hidden");

			hideInstructions(); // Hide instructions
			hideTwitchStream(); // Hide Twitch stream
			hideMixerStream(); // Hide Mixer stream
		}
	}

	// Function for navigating stream frame
	function updateStreamFrame() {
		// If the stream URL field is not blank
		if (streamURLElement.value != "") {
			/////////////////////////////
			// Clean up URL formatting //
			/////////////////////////////

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

			/////////////////////////////
			//   Setup stream element  //
			/////////////////////////////

			// If the stream URL is for Twitch
			if (streamURLElement.value.toString().includes("twitch.tv")) {
				// If Twitch channel id is blank or has changed
				if (
					twitchChannelId === "" ||
					twitchChannelId !== streamURLElement.value.toString().split("/")[3]
				) {
					// Update the Twitch channel id
					twitchChannelId = streamURLElement.value.toString().split("/")[3];

					// Show Twitch stream
					showStreamFrameElement("twitch");

					// TTV configuration
					let ttvConfig = () => {
						var embed = new Twitch.Embed("twitchStream", {
							allowfullscreen: false,
							width: "100%",
							height: "100%",
							channel: twitchChannelId,
							theme: "dark",
							layout: "video-with-chat",
							autoplay: true,
							// only needed if your site is also embedded on embed.example.com and othersite.example.com
							parent: [
								"remote-jackbox-player.isaacyakl.com",
								"isaacyakl.com",
								"isaacyakl.github.io",
							],
						});

						embed.addEventListener(Twitch.Embed.VIDEO_READY, () => {
							var player = embed.getPlayer();
							player.play();
						});
					};

					// If the Twitch embed script has not previously been loaded
					if (
						document.getElementById("ttvEmbedScript") == null ||
						document.getElementById("ttvEmbedScript") == undefined
					) {
						// Load and configure Twitch script
						let ttvEmbedScript = document.createElement("script");
						ttvEmbedScript.setAttribute("id", "ttvEmbedScript");
						ttvEmbedScript.setAttribute("src", "https://embed.twitch.tv/embed/v1.js");
						ttvEmbedScript.addEventListener("load", ttvConfig);

						document.body.appendChild(ttvEmbedScript); // Append Twitch script
					}
					// Else it has already loaded
					else {
						// Clear any previous Twitch streams
						twitchStreamElement.innerHTML = "";

						// Configure Twitch stream
						ttvConfig();
					}
				}
			}
			// If the stream URL is for Mixer
			else if (streamURLElement.value.toString().includes("mixer.com")) {
				// If Mixer channel name is blank or has changed
				if (
					mixerChannelName === "" ||
					mixerChannelName !== streamURLElement.value.toString().split("/")[3]
				) {
					// Update the Mixer channel name
					mixerChannelName = streamURLElement.value.toString().split("/")[3];

					// Show Mixer stream
					showStreamFrameElement("mixer");

					mixerStreamElement.src =
						"https://mixer.com/embed/player/" +
						streamURLElement.value.toString().split("/")[3];

					mixerChatElement.src =
						"https://mixer.com/embed/chat/" + streamURLElement.value.toString().split("/")[3];
				}
			}
			// Use unknown stream element
			else {
				// Show unknown stream element
				showStreamFrameElement();

				// If the stream source has not changed do not waste time updating/reloading it
				if (unknownStreamElement.src !== streamURLElement.value) {
					// Update the iframe source
					unknownStreamElement.src = streamURLElement.value;
				}
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
		updateStreamFrame(); // Update the stream frame
		updatePlayerURL(); // Update the player URL
	});

	// Add event listener for URL input field
	streamURLElement.addEventListener("focus", () => {
		updateStreamFrame(); // Update the stream frame
		updatePlayerURL(); // Update the player URL
	});

	// Add event listener for share button
	document.getElementById("shareButton").addEventListener("click", () => {
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
		// If the instructions are hidden
		if (Array.from(instructionsElement.classList).includes("hidden")) {
			showStreamFrameElement("instructions"); // Show instructions element
		} else {
			updateStreamFrame(); // Update the stream frame
			updatePlayerURL(); // Update the player URL
		}
	});

	// If stream URL param of the player URL is not blank
	if (streamURL != "") {
		// Set the stream URL input element to the stream URL
		streamURLElement.value = streamURL;

		// Show the stream
		updateStreamFrame();
	}
});
