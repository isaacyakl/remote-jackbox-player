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
	let swapViewButtonWrapperElements = document.querySelectorAll(".swapViewButtonWrapper"); // Swap view button wrappers

	// Data variables
	let activeView = "default"; // Variable for active view
	let documentTitle = "Remote Jackbox Player"; // Variable holding the official app title
	let playerURL = null; // Variable for the player URL used for link sharing
	let streamURL = ""; // Variable to hold the stream URL value
	let peekUITimeoutID; // Variable to hold the timeout used in peekUI()

	// Channel id/names
	let twitchChannelId = ""; // Variable to hold Twitch channel id
	let mixerChannelName = ""; // Variable to hold Mixer channel name

	const defaultStreamURL = ""; // Default stream URL
	const defaultGameURL = "https://jackbox.tv"; // Default game URL
	const defaultPlayerClasses = playerElement.getAttribute("class"); // Default classes for #player from index.html
	const defaultStreamPaneClasses = streamPaneElement.getAttribute("class"); // Default classes for #streamPane from index.html
	const defaultGamePaneClasses = gamePaneElement.getAttribute("class"); // Default classes for #gamePane from index.html
	const defaultSwapViewButtonWrappersClasses = swapViewButtonWrapperElements
		.item(0)
		.getAttribute("class"); // Default classes for .swapViewButton's from index.html

	// Function for setting up default view
	function setupDefaultView() {
		activeView = "default"; // Set active view variable
		playerElement.setAttribute("class", defaultPlayerClasses); // Revert to default player configuration
		streamPaneElement.setAttribute("class", defaultStreamPaneClasses); // Revert to default stream pane configuration
		gamePaneElement.setAttribute("class", defaultGamePaneClasses); // Revert to default game pane configuration

		// For each swap view button
		swapViewButtonWrapperElements.forEach((e) => {
			// Revert swap view button configurations
			e.setAttribute("class", defaultSwapViewButtonWrappersClasses);
		});
	}

	// Function for updating visible controls based on active view
	function updateControls() {
		// If active view is swap
		if (activeView == "swap") {
			// For each swapViewButton that is hidden on large displays
			swapViewButtonWrapperElements.forEach((e) => {
				// Show that control
				e.classList.remove("lg:hidden");
				e.classList.remove("hidden");
			});

			// Update rounding style on reload buttons since swap button is present
			document.getElementById("reloadStreamButton").classList.remove("lg:rounded-l");
			document.getElementById("reloadGameButton").classList.remove("lg:rounded-l");
			document.getElementById("reloadStreamButton").classList.remove("rounded-l");
			document.getElementById("reloadGameButton").classList.remove("rounded-l");
		}
		// Not swap view
		else {
			// For each swapViewButton that is hidden on large displays
			swapViewButtonWrapperElements.forEach((e) => {
				// Hide that control
				e.classList.remove("lg:hidden");
				e.classList.add("hidden");
			});

			// Update rounding style on reload buttons since swap button is absent
			document.getElementById("reloadStreamButton").classList.remove("lg:rounded-l");
			document.getElementById("reloadGameButton").classList.remove("lg:rounded-l");
			document.getElementById("reloadStreamButton").classList.add("rounded-l");
			document.getElementById("reloadGameButton").classList.add("rounded-l");
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

	// Function for updating the player's state based on new user input. Always call after calling updateStreamFrame()
	function updatePlayer() {
		// If the stream URL input is different than the last saved one and is not just "https://"
		if (streamURLElement.value != streamURL && streamURLElement.value != "https://") {
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

		// If the hash is not empty (there may be a Twitch auth token for a random stream)
		if (document.location.hash != "") {
			streamURLElement.disabled = true; // Disable the stream URL input
			streamURLElement.value = "Searching..."; // Indicate to the user that searching is in progress
			setUIState("open"); // Open UI
			document.getElementById("randomStreamButton").click(); // Click the random button
		}
		// Else if stream URL param of the player URL is not blank
		else if (streamURL != "") {
			streamURLElement.value = streamURL; // Set the stream URL input element to the stream URL
			document.title = `${documentTitle} - ${streamURL}`; // Update document title
			updateStreamFrame(); // Show the stream
			peekUI(); // Briefly show UI
		}
		// Else it is empty
		else {
			document.title = `${documentTitle}`; // Update document title
			setUIState("open"); // Open UI
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

			// Bring the stream frame into view
			streamPaneElement.scrollIntoView(true);

			hideUnknownStream(); // Hide unknown stream
			hideTwitchStream(); // Hide twitch
			hideMixerStream(); // Hide Mixer stream
			updateStreamURLBarElementState("open"); // Show stream URL bar
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

	// Function for clearing channel id/name variables
	function clearChannelIds() {
		twitchChannelId = ""; // Clear Twitch channel Id
		mixerChannelName = ""; // Clear Mixer channel name
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
		// Else if the requested stream URL bar state is open
		if (state == "open") {
			// Increase opacity of stream URL bar
			setOpacityStreamURLBar("1.0");

			// Set active styling
			streamURLBarElement.classList.add("w-full");
			streamURLBarElement.classList.remove("w-0");

			setTimeout(() => {
				// For each titleHelpText within #streamURLBarTitleHelpText
				document
					.querySelectorAll("#streamURLBarTitleHelpText > .titleHelpText")
					.forEach((e) => {
						// Show it
						e.classList.add("opacity-100");
						e.classList.remove("opacity-0");
					});
			}, 500);
		}
		// Else if the requested stream URL bar state is close
		else if (state == "close") {
			// For each titleHelpText within #streamURLBarTitleHelpText
			document.querySelectorAll("#streamURLBarTitleHelpText > .titleHelpText").forEach((e) => {
				// Hide it
				e.classList.add("opacity-0");
				e.classList.remove("opacity-100");
			});

			setTimeout(() => {
				// Set inactive styling
				streamURLBarElement.classList.add("w-0");
				streamURLBarElement.classList.remove("w-full");
			}, 500);
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

			setTimeout(() => {
				// For each titleHelpText for a menuItem
				document.querySelectorAll(".menuItem > .titleHelpText").forEach((e) => {
					// Show it
					e.classList.add("opacity-100");
					e.classList.remove("opacity-0");
				});

				// For each titleHelpText for a control
				document.querySelectorAll(".control > .titleHelpText").forEach((e) => {
					// Show it
					e.classList.add("opacity-100");
					e.classList.remove("opacity-0");
				});
			}, 500);
		}
		// Else if the request state is close
		else if (state == "close") {
			// For each titleHelpText for a menuItem
			document.querySelectorAll(".menuItem > .titleHelpText").forEach((e) => {
				// Hide it
				e.classList.add("opacity-0");
				e.classList.remove("opacity-100");
			});

			// For each titleHelpText for a control
			document.querySelectorAll(".control > .titleHelpText").forEach((e) => {
				// Hide it
				e.classList.add("opacity-0");
				e.classList.remove("opacity-100");
			});

			setTimeout(() => {
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
			}, 500);
		}
	}

	// Function for setting the UI state
	function setUIState(state) {
		updateStreamURLBarElementState(state);
		updateMenuElementState(state);
	}

	// Function for peeking UI
	function peekUI() {
		setUIState("open"); // Open the UI

		// A stream URL is included already
		if (streamURL != "") {
			// Hide UI
			peekUITimeoutID = setTimeout(() => {
				streamURLElement.blur(); // Blur the stream URL input
				setUIState("close"); // Close the UI
			}, 3000);
		} else {
			streamURLElement.focus(); // Focus the stream URL input
		}
	}

	// Function for stopping peekUI()
	function stopPeekUI() {
		// If there is a value in the timeout ID
		if (peekUITimeoutID != undefined) {
			clearTimeout(peekUITimeoutID); // Clear peekUI timeout
			peekUITimeoutID = undefined; // Set it to undefined
		}
	}

	// Function for setting opacity of stream URL bar
	function setOpacityStreamURLBar(amount) {
		streamURLBarElement.style.opacity = amount; // Set opacity value
	}

	// Add event listener to the setup split view button
	document.getElementById("setupSplitViewButton").addEventListener("click", () => {
		setupSplitView(); // Setup split view
	});

	// Add event listeners to the swap view buttons
	swapViewButtonElements.forEach((e) => {
		e.addEventListener("click", () => {
			// If the active view is not already swap view (this should never happen if the UI controls are setup correctly)
			if (activeView != "swap") {
				setupSwapView(); // Setup swap view
			}
			swapView(); // Swap view
		});
	});

	// Add event listener to the setup swap view setup button
	document.getElementById("setupSwapViewButton").addEventListener("click", () => {
		// If the active view is already swap view
		if (activeView == "swap") {
			swapView(); // Swap view
		}
		// Active view is already swap view
		else {
			setupSwapView(); // Setup swap view
		}
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
		updateStreamFrame(); // Update the stream frame
		updatePlayer(); // Update the player URL based on user input
		setOpacityStreamURLBar("1.0"); // Increase opacity of stream URL bar
	});

	// Add event listener for when the URL input field receives focus
	streamURLElement.addEventListener("focus", () => {
		stopPeekUI(); // Stop menus from hiding after peekUI()
		updateStreamFrame(); // Update the stream frame
		updatePlayer(); // Update the player URL based on user input
		setOpacityStreamURLBar("1.0"); // Increase opacity of stream URL bar

		// If the device is low res
		if (window.innerWidth < 768 || window.innerHeight < 768) {
			// Move menu to bottom of screen (helpful on mobile devices)
			document.getElementById("menu").classList.remove("mb-24");
			document.getElementById("menu").classList.add("mb-6");
		}
	});

	// Add event listener for when the URL input field blurs
	streamURLElement.addEventListener("blur", () => {
		updateStreamFrame(); // Update the stream frame
		updatePlayer(); // Update the player URL based on user input

		// If the device is low res
		if (window.innerWidth < 768 || window.innerHeight < 768) {
			// Move menu back to original position
			document.getElementById("menu").classList.remove("mb-6");
			document.getElementById("menu").classList.add("mb-24");
		}
	});

	// Add event listener for when the stream URL form is submitted
	document.getElementById("streamURLForm").addEventListener("submit", function (e) {
		updateStreamFrame(); // Update the stream frame
		updatePlayer(); // Update the player URL based on user input
		setUIState("close"); // Hide UI

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
		setUIState("open"); // Show UI
		stopPeekUI(); // Stop menus from hiding after peekUI()

		// Copy URL to clipboard
		copyToClipboard(playerURL.toString());

		// Let the user know the link was copied to the clipboard
		document.getElementById("shareText").classList.add("px-1"); // Add padding on left and right
		document.getElementById("shareText").classList.add("w-40"); // Expand share text
		document.getElementById("shareButton").classList.remove("rounded-r"); // Remove rounding on right side of share button
		document.getElementById("shareTextDoppelganger").classList.add("px-1"); // Add padding on left and right of doppelganger
		document.getElementById("shareTextDoppelganger").classList.add("w-40"); // Expand doppelganger
		setTimeout(() => {
			document.getElementById("shareText").classList.remove("px-1"); // Remove padding on left and right
			document.getElementById("shareText").classList.remove("w-40"); // Collapse share text
			document.getElementById("shareButton").classList.add("rounded-r"); // Add rounding on right side of share button
			document.getElementById("shareTextDoppelganger").classList.remove("px-1"); // Remove padding on left and right of doppelganger
			document.getElementById("shareTextDoppelganger").classList.remove("w-40"); // Collapse doppelganger
			setUIState("close"); // Hide UI
		}, 3000);
	});

	// Add event listener to the how-to button
	document.getElementById("howToButton").addEventListener("click", () => {
		// If the how-to is hidden
		if (Array.from(howToElement.classList).includes("hidden")) {
			updateMenuElementState("close"); // Hide the menu
			showStreamFrameElement("howTo"); // Show how-to element
		} else {
			updateStreamFrame(); // Update the stream frame
			updatePlayer(); // Update the player URL based on user input
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
		clearChannelIds(); // Clear channel info so that stream pane will reload
		updateStreamFrame(); // Update stream pane
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
			setUIState("open"); // Open UI
			streamURLElement.focus(); // Focus on stream URL input
		}
		// Else if the menu is open
		else if (menuButtonElement.title.includes("Close")) {
			setUIState("close"); // Close UI
			streamURLElement.blur(); // Blur stream URL input
		}
	});

	// Add event listener for close button on stream URL bar
	document.getElementById("hideStreamURLBarButton").addEventListener("click", () => {
		updateStreamURLBarElementState("close"); // Close stream URL bar
	});

	// Add event listener for button title text mouseover
	document.querySelectorAll(".menuItem").forEach((e) => {
		e.addEventListener("mouseover", () => {
			stopPeekUI(); // Stop menus from hiding after peekUI()
		});
	});

	// Add event listener for control button mouseover
	document.querySelectorAll(".control").forEach((e) => {
		e.addEventListener("mouseover", () => {
			stopPeekUI(); // Stop menus from hiding after peekUI()
		});
	});

	// Add event listener for stream URL bar mouseover
	streamURLBarElement.addEventListener("mouseover", () => {
		stopPeekUI(); // Stop menus from hiding after peekUI()

		// Increase opacity of stream URL bar
		setOpacityStreamURLBar("1.0");
	});

	// Add event listener for stream URL bar mouseover
	streamURLBarElement.addEventListener("mouseout", () => {
		// If stream URL input is not empty
		if (streamURLElement.value != "") {
			setOpacityStreamURLBar("0.5"); // Decrease opacity of stream URL bar
		}
	});

	// Add event listener for random stream button
	document.getElementById("randomStreamButton").addEventListener("click", async () => {
		// Function for pulling hash parameters from the URL
		function getHashParam(query) {
			let parameter = query;
			parameter = parameter.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			let regex = new RegExp("[\\#|&]" + parameter + "=([^&#]*)");
			let results = regex.exec("#" + playerURL.toString().split("#")[1]);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, ""));
		}

		// Function for getting a random integer
		function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
		}

		let clientID = "ysaytynx3opj4orxahqrpc2fvsrwj1"; // Twitch Client ID
		let twitchGameIDsFile = await fetch("feature-random-stream_twitch-game-ids.json"); // Retrieve Twitch game ids json file
		let twitchGameIDs; // Variable to hold array of game ids

		// If the game ids json file was retrieved successfully
		if (twitchGameIDsFile.ok) {
			twitchGameIDs = Array.from(await twitchGameIDsFile.json()); // Parse the game id json into an array
		}

		// If the location hash contains something and there is an access token
		if (document.location.hash != "" && getHashParam("access_token") != "") {
			let authToken = getHashParam("access_token"); // Get the access token

			// Clear URL params
			window.history.pushState(null, null, "/");

			let streamPool = []; // Array of possible streams
			let currentGameIDPool = []; // Array of streams gather thus far for a given game id
			let twitchCursor = ""; // Variable for holding the results cursor

			// Retrieve top 30 streams (based on view count) using a game id
			for (let i = 0; i < twitchGameIDs.length; ) {
				// For this game id fetch top 30 streams
				let twitchResult = await fetch(
					`https://api.twitch.tv/helix/streams?language=en&first=30&game_id=${twitchGameIDs[i].game_id}&after=${twitchCursor}`,
					{
						headers: { "Client-ID": clientID, Authorization: `Bearer ${authToken}` },
					}
				);

				// If retrieval was successful
				if (twitchResult.ok) {
					let resultJSON = await twitchResult.json(); // Get results as a json object

					// For each stream
					for (let j = 0; j < resultJSON.data.length; j++) {
						// If there are less than 8 viewers
						if (resultJSON.data[j].viewer_count < 8) {
							currentGameIDPool.push(resultJSON.data[j]); // Add it to current game id pool
						}
					}

					// If there are less than 30 results and more results exist
					if (currentGameIDPool.length < 30 && resultJSON.pagination.cursor != undefined) {
						twitchCursor = resultJSON.pagination.cursor; // Save last pagination location
					}
					// Else pagination is blank (no more results left) or we have enough results already
					else {
						twitchCursor = ""; // Empty the cursor
						currentGameIDPool.forEach((s) => streamPool.push(s)); // Add the current game id pool to the total stream pool
						currentGameIDPool = []; // Clear current game id pool
						i++; // Move to the next game id
					}
				}
				// Else retrieval failed for some reason
				else {
					console.error("HTTP-Error:" + twitchResult.status); // Log error
				}
			}

			// Choose a random stream
			let randomStreamIndex = getRandomInt(0, streamPool.length); // Get a random stream
			streamURLElement.value = `https://twitch.tv/${streamPool[randomStreamIndex].user_name}`; // Set the stream URL input
			streamURLElement.disabled = false; // Enable the stream URL input

			updateStreamFrame(); // Update the stream frame
			updatePlayer(); // Update the player URL based on user input
		}
		// Else if there is no auth token hash
		else {
			// Send the user to get an auth token
			document.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${clientID}&redirect_uri=${
				window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
					? "http://localhost:5500"
					: "https://" + window.location.hostname
			}&response_type=token&scope=analytics:read:games`;
		}
	});

	initializePlayer(); // Update the player based on the stream URL if present
});
