// Check if DOM is ready
let formReady = (callback) => {
	if (document.readyState != "loading") callback();
	else document.addEventListener("DOMContentLoaded", callback);
};

// Execute form code when DOM is ready
formReady(() => {
	// Element variables
	let playerElement = document.getElementById("player"); // Main container
	let streamPaneElement = document.getElementById("streamPane"); // Stream pane for all stream related elements
	let unknownStreamElement = document.getElementById("unknownStream"); // Unknown stream iframe
	let twitchStreamElement = document.getElementById("twitchStream"); // Twitch stream div
	let mixerStreamElement = document.getElementById("mixerStream"); // Mixer stream div
	let mixerChatElement = document.getElementById("mixerChat"); // Mixer chat div
	let howToElement = document.getElementById("howTo"); // How-To div
	let gamePaneElement = document.getElementById("gamePane"); // Game pane for all game related elements
	let gameFrameElement = document.getElementById("gameFrame"); // Game iframe
	let streamURLBarElement = document.getElementById("streamURLBar"); // Stream url input
	let streamURLElement = document.getElementById("streamURL"); // Stream url input
	let menuItemsElement = document.getElementById("menuItems"); // Menu div
	let menuButtonElement = document.getElementById("menuButton"); // Menu button
	let swapViewButtonElements = document.querySelectorAll(".swapViewButton"); // Swap view buttons

	// Data variables
	let activeView = "default"; // Variable for active view
	let documentTitle = "Remote Jackbox Player"; // Variable holding the official app title
	let playerURL = null; // Variable for the player URL used for link sharing
	let streamURL = ""; // Variable to hold the stream URL value
	let twitchChannelId = ""; // Variable to hold Twitch channel id
	let mixerChannelName = ""; // Variable to hold Mixer channel name

	const defaultStreamURL = ""; // Default stream URL
	const defaultGameURL = "https://jackbox.tv"; // Default game URL
	const defaultPlayerClasses = playerElement.getAttribute("class"); // Default classes for #player from index.html
	const defaultStreamPaneClasses = streamPaneElement.getAttribute("class"); // Default classes for #streamPane from index.html
	const defaultGamePaneClasses = gamePaneElement.getAttribute("class"); // Default classes for #gamePane from index.html
	const defaultSwapViewButtons = swapViewButtonElements.item(0).getAttribute("class"); // Default classes for .swapViewButton's from index.html

	// Function for setting up default view
	function setupDefaultView() {
		activeView = "default"; // Set active view variable
		playerElement.setAttribute("class", defaultPlayerClasses); // Revert to default player configuration
		streamPaneElement.setAttribute("class", defaultStreamPaneClasses); // Revert to default stream pane configuration
		gamePaneElement.setAttribute("class", defaultGamePaneClasses); // Revert to default game pane configuration

		// For each swap view button
		swapViewButtonElements.forEach((e) => {
			// Revert swap view button configurations
			e.setAttribute("class", defaultSwapViewButtons);
		});
	}

	// Function for updating visible controls based on active view
	function updateControls() {
		// If active view is swap
		if (activeView == "swap") {
			// For each swap view button
			swapViewButtonElements.forEach((e) => {
				// Show swap view button
				e.classList.remove("lg:hidden");
				e.classList.remove("hidden");
			});
		}
		// Not swap view
		else {
			// For each swap view button
			swapViewButtonElements.forEach((e) => {
				// Hide swap view button
				e.classList.remove("lg:hidden");
				e.classList.add("hidden");
			});
		}
	}

	// Function for setting up split view
	function setupSplitView() {
		activeView = "split"; // Set active view variable
		updateControls(); // Hide controls
		playerElement.setAttribute("class", "flex flex-row w-screen h-screen"); // Configure player to fill the screen with flex rows
		streamPaneElement.setAttribute("class", "relative w-1/2"); // Configure stream pane to take 50% of the screen
		gamePaneElement.setAttribute("class", "relative w-1/2"); // Configure game pane to take 50% of the screen
	}

	// Function for setting up swap view
	function setupSwapView() {
		activeView = "swap"; // Set active view variable
		updateControls(); // Show controls
		playerElement.setAttribute("class", "w-screen h-screen"); // Configure player to fill the screen

		// If the stream pane is hidden
		if (streamPaneElement.classList.contains("hidden")) {
			streamPaneElement.setAttribute("class", "relative hidden w-full h-full"); // Configure the stream pane to fill the screen and keep it hidden
			gamePaneElement.setAttribute("class", "relative w-full h-full"); // Configure the game pane to fill the screen
		}
		// Else hide the game pane
		else {
			streamPaneElement.setAttribute("class", "relative w-full h-full"); // Configure the stream pane to fill the screen
			gamePaneElement.setAttribute("class", "relative hidden w-full h-full"); // Configure the game pane to fill the screen and hide it
		}
	}

	// Function for swapping which frame is in front
	function swapView() {
		// If the stream pane is hidden
		if (streamPaneElement.classList.contains("hidden")) {
			gamePaneElement.classList.add("hidden"); // Hide game pane
			streamPaneElement.classList.remove("hidden"); // Show stream pane
		}
		// Else assume game pane is hidden
		else {
			streamPaneElement.classList.add("hidden"); // Hide stream pane
			gamePaneElement.classList.remove("hidden"); // Show game pane
		}
	}

	// Function for setting up scroll view
	function setupScrollView() {
		activeView = "scroll"; // Set active view variable
		updateControls(); // Hide controls
		playerElement.setAttribute("class", ""); // Configure player to be static
		streamPaneElement.setAttribute("class", "relative w-full h-screen"); // Configure stream pane to fill the screen
		gamePaneElement.setAttribute("class", "relative w-full h-screen"); // Configure game pane to fill the screen
	}

	// Function for setting up swipe view
	function setupSwipeView() {
		activeView = "swipe"; // Set active view variable
		updateControls(); // Hide controls
		playerElement.setAttribute("class", "flex flex-no-wrap w-screen h-screen overflow-x-auto"); // Configure player to fill the screen with flex no wrapping and scrolling on the x axis
		streamPaneElement.setAttribute("class", "relative flex-none w-full h-full"); // Configure the stream pane to fill a screen's worth of content without wrapping
		gamePaneElement.setAttribute("class", "relative flex-none w-full h-full"); // Configure the game pane to fill a screen's worth of content without wrapping
	}

	// Function for copying a string to clipboard
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

	// Function for updating the player's state based on new user input
	function updatePlayer() {
		// If the stream URL input is different than the last saved one
		if (streamURLElement.value != streamURL) {
			// Reload gameFrame frame
			gameFrameElement.src = ""; // Clear src of gameFrame frame
			gameFrameElement.src = defaultGameURL; // Set src back to default game URL

			// Update the streamURL variable with the entered stream URL
			streamURL = streamURLElement.value;

			// If there is a stream URL entered
			if (streamURL != "") {
				document.title = `${documentTitle} - ${streamURL}`; // Update document title
				playerURL.searchParams.set("streamURL", streamURLElement.value); // Add stream URL as a param to the player URL
				window.history.pushState(null, null, "?streamURL=" + encodeURIComponent(streamURL)); // Add the streamURL to the window URL and log in history
			}
			// Else it is empty
			else {
				document.title = `${documentTitle}`; // Update document title
				playerURL.searchParams.delete("streamURL"); // Delete streamURL param from the player URL
				window.history.pushState(null, null, "/"); // Remove the streamURL param and log in history
			}
		}
	}

	// Function for initializing the player based on a new URL
	function initializePlayer() {
		playerURL = new URL(document.location.href.toString()); // Grab current URL
		streamURL = getStreamURLParam(); // Get stream URL from player URL param

		// If stream URL param of the player URL is not blank
		if (streamURL != "") {
			streamURLElement.value = streamURL; // Set the stream URL input element to the stream URL
			document.title = `${documentTitle} - ${streamURL}`; // Update document title
			updateStreamFrame(); // Show the stream
		}
		// Else it is empty
		else {
			document.title = `${documentTitle}`; // Update document title
		}
	}

	// Show appropriate stream type
	function showStreamFrameElement(type) {
		// Hide unknown Stream Element
		function hideUnknownStream() {
			unknownStreamElement.classList.add("hidden"); // Hide unknown stream element
			unknownStreamElement.src = ""; // Clear unknown stream element
		}

		// Hide how-to
		function hideHowTo() {
			howToElement.classList.add("hidden"); // Hide how-to
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

			hideHowTo(); // Hide how-to
			hideUnknownStream(); // Hide unknown stream
			hideMixerStream(); // Hide Mixer stream
		}
		// If type equals how-to
		else if (type == "howTo") {
			// Display how-to element
			howToElement.classList.remove("hidden");

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

			hideHowTo(); // Hide how-to
			hideUnknownStream(); // Hide unknown stream
			hideTwitchStream(); // Hide Twitch stream
		}
		// Else use unknown stream element
		else {
			// Display unknown stream element
			unknownStreamElement.classList.remove("hidden");

			hideHowTo(); // Hide how-to
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
			}
			// Else if it does not start with "https://"
			else if (!streamURLElement.value.toString().startsWith("https://")) {
				// Clear input
				streamURLElement.value = "";

				// Add https
				streamURLElement.value = "https://";
			}
			// Else if the stream URL is only "https://"
			else if (streamURLElement.value == "https://") {
				// Show how-to
				document.getElementById("howToButton").click();
			}

			/////////////////////////////
			//   Setup stream element  //
			/////////////////////////////

			// If the stream URL is for Twitch
			else if (streamURLElement.value.toString().includes("twitch.tv")) {
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
		// Else switch to how-to
		else {
			// Click the how-to button
			document.getElementById("howToButton").click();
		}
	}

	// Function for updating the state of the stream URL bar
	function updateStreamURLBarElementState(state) {
		// If the requested stream URL bar state is close
		if (state == "close") {
			// Set in active styling
			streamURLBarElement.classList.add("w-0");
			streamURLBarElement.classList.remove("w-full");
			streamURLBarElement.classList.remove("p-1");
		}
		// Else if the requested stream URL bar state is open
		else if (state == "open") {
			// Set active styling
			streamURLBarElement.classList.add("p-1");
			streamURLBarElement.classList.add("w-full");
			streamURLBarElement.classList.remove("w-0");
		}
	}

	// Function for updating the state of the menu
	function updateMenuElementState(state) {
		const closedMenuIcon = `<i class="fas fa-times" aria-hidden="true"></i>`;
		const menuIcon = `<i class="fas fa-bars" aria-hidden="true"></i>`;

		// If the request state is open
		if (state == "open") {
			menuButtonElement.innerHTML = closedMenuIcon; // Change the icon to the close button
			menuItemsElement.classList.remove("h-0");
			menuItemsElement.style.height = menuItemsElement.childElementCount * 2.5 + "rem"; // Expand the menu 2.5 rem per button
			menuButtonElement.title = "Close menu"; // Set title

			// Set active styling
			menuButtonElement.classList.remove("bg-white");
			menuButtonElement.classList.remove("rounded-r");
			menuButtonElement.classList.add("rounded-br");
			menuButtonElement.classList.add("bg-teal-300");
			menuButtonElement.classList.add("shadow-inner");
		}
		// Else if the request state is close
		else if (state == "close") {
			menuButtonElement.innerHTML = menuIcon; // Change the icon to the menu button
			menuItemsElement.classList.remove("h-0");
			menuItemsElement.style.height = "0rem"; // Close the menu
			menuButtonElement.title = "Open menu"; // Set title

			// Set inactive styling
			menuButtonElement.classList.remove("bg-teal-300");
			menuButtonElement.classList.remove("shadow-inner");
			menuButtonElement.classList.remove("rounded-br");
			menuButtonElement.classList.add("bg-white");
			menuButtonElement.classList.add("rounded-r");
		}
	}

	// Function for initializing the UI
	function initializeUI() {
		updateStreamURLBarElementState("close");
		updateMenuElementState("close");
	}

	// Function for peeking UI
	function peekUI() {
		updateMenuElementState("open"); // Open menu
		updateStreamURLBarElementState("open"); // Open stream URL bar
		streamURLElement.focus(); // Focus the stream URL input

		// A stream URL is included already
		if (streamURL != "") {
			// Hide UI
			setTimeout(() => {
				streamURLElement.blur(); // Blur the stream URL input
				updateMenuElementState("close"); // Close menu
				updateStreamURLBarElementState("close"); // Close stream URL bar
			}, 3000);
		}
	}

	// Add event listener to the setup split view button
	document.getElementById("setupSplitViewButton").addEventListener("click", () => {
		setupSplitView(); // Setup split view
	});

	// Add event listeners to the swap view buttons
	swapViewButtonElements.forEach((e) => {
		e.addEventListener("click", () => {
			swapView(); // Swap view
		});
	});

	// Add event listener to the setup swap view setup button
	document.getElementById("setupSwapViewButton").addEventListener("click", () => {
		setupSwapView(); // Setup swap view
	});

	// Add event listener to the setup scroll view button
	document.getElementById("setupScrollViewButton").addEventListener("click", () => {
		setupScrollView(); // Setup scroll view
	});

	// Add event listener to the setup swipe view button
	document.getElementById("setupSwipeViewButton").addEventListener("click", () => {
		setupSwipeView(); // Setup swipe view
	});

	// Add event listener for when the URL input field receives input
	streamURLElement.addEventListener("input", () => {
		updatePlayer(); // Update the player URL based on user input
		updateStreamFrame(); // Update the stream frame
	});

	// Add event listener for when the URL input field receives focus
	streamURLElement.addEventListener("focus", () => {
		updatePlayer(); // Update the player URL based on user input
		updateStreamFrame(); // Update the stream frame
	});

	// Add event listener for when the URL input field blurs
	streamURLElement.addEventListener("blur", () => {
		updatePlayer(); // Update the player URL based on user input
		updateStreamFrame(); // Update the stream frame
	});

	// Add event listener for when the stream URL form is submitted
	document.getElementById("streamURLForm").addEventListener("submit", function (e) {
		updatePlayer(); // Update the player URL based on user input
		updateStreamFrame(); // Update the stream frame
		e.preventDefault(); // Prevent form submission
	});

	// Add event listener for when the viewport is resized
	window.addEventListener("resize", () => {});

	// Add event listener for when history is traversed in order to update the stream frame and URL input
	window.addEventListener("popstate", () => {
		initializePlayer(); // Initialize the player based on the stream URL if present
		updateStreamFrame(); // Update the stream frame
	});

	// Add event listener to the share button
	document.getElementById("shareButton").addEventListener("click", () => {
		// Copy URL to clipboard
		copyToClipboard(playerURL.toString());

		// Let the user know the link was copied to the clipboard
		document.getElementById("shareText").classList.add("ml-1"); // Add margin on left and right
		document.getElementById("shareText").classList.add("px-1"); // Add padding on left and right
		document.getElementById("shareText").classList.add("w-40"); // Expand share text
		setTimeout(() => {
			document.getElementById("shareText").classList.remove("ml-1"); // Remove margin on left and right
			document.getElementById("shareText").classList.remove("px-1"); // Remove padding on left and right
			document.getElementById("shareText").classList.remove("w-40"); // Collapse share text
		}, 3000);
	});

	// Add event listener to the how-to button
	document.getElementById("howToButton").addEventListener("click", () => {
		// If the how-to are hidden
		if (Array.from(howToElement.classList).includes("hidden")) {
			streamPaneElement.scrollIntoView(true); // Bring the stream frame into view
			showStreamFrameElement("howTo"); // Show how-to element
		} else {
			updatePlayer(); // Update the player URL based on user input
			updateStreamFrame(); // Update the stream frame
		}
	});
	// Add event listener for when the page is reloaded in order to confirm that session will be lost
	window.addEventListener("beforeunload", (e) => {
		// Prompt always shown in Mozilla Firefox
		// Prompt only show in Chrome if user interacted with the page

		// Cancel the default event
		e.preventDefault();

		// Chrome requires returnValue to be set
		e.returnValue = "";
	});

	// Add event listener to the stream reload button
	document.getElementById("reloadStreamButton").addEventListener("click", () => {
		let currentStreamURL = streamURLElement.value; // Grab current stream URL
		streamURLElement.value = ""; // Clear stream URL
		updateStreamFrame(); // Update stream frame
		streamURLElement.value = currentStreamURL; // Replace stream URL
		updateStreamFrame(); // Update stream frame
	});

	// Add event listener to the game reload button
	document.getElementById("reloadGameButton").addEventListener("click", () => {
		let result = false; // Result for user prompt
		result = window.confirm("Reload the game?\nYou will lose your spot in the lobby."); // Check if the user really wants to reload their game

		// If results are true
		if (result === true) {
			// Reload game frame
			gameFrameElement.src = ""; // Clear game src
			gameFrameElement.src = defaultGameURL; // Replace default game URL
		}
	});

	// Add event listener for menu button
	menuButtonElement.addEventListener("click", () => {
		// If the menu is closed
		if (menuButtonElement.title.includes("Open")) {
			updateMenuElementState("open"); // Open the menu
			updateStreamURLBarElementState("open"); // Open the stream URL bar
		}
		// Else if the menu is open
		else if (menuButtonElement.title.includes("Close")) {
			updateMenuElementState("close"); // Close the menu
			updateStreamURLBarElementState("close"); // Close the stream URL bar
		}
	});

	initializePlayer(); // Update the player based on the stream URL if present
	initializeUI(); // Configure the UI
	peekUI(); // Show UI for a bit
});
