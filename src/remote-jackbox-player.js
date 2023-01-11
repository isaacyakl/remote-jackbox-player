// search source of a Twitch category for "/ttv-boxart/"
// and you will find "<game_id>-<width>x<height>.jpg"
// directly following. That is an easy way to grab
// game ids without needing to CURL.
const gameIds = {
	twitch: [
		{
			game_name: "Jackbox Party Packs",
			game_id: "493174",
		},
		{
			game_name: "Drawful 2",
			game_id: "492935",
		},
		{
			game_name: "Quiplash",
			game_id: "490414",
		},
		{
			game_name: "Fibbage",
			game_id: "476477",
		},
	],
};
const clientIds = {
	"twitch-client-id": "0h2wo7u731sh7c2r3st47cf6dtpnn9",
};

const rJP = () => {
	// Element variables
	let playerElement = document.getElementById("player"); // Main container

	playerElement.style.height = `${window.innerHeight}px`;
	window.addEventListener("resize", () => {
		playerElement.style.height = `${window.innerHeight}px`;
	});

	let streamPaneElement = document.getElementById("streamPane"); // Stream pane for all stream related elements
	let unknownStreamElement = document.getElementById("unknownStream"); // Unknown stream iframe
	let twitchStreamElement = document.getElementById("twitchStream"); // Twitch stream div
	let howToElement = document.getElementById("howTo"); // How-To div
	let gamePaneElement = document.getElementById("gamePane"); // Game pane for all game related elements
	let gameFrameElement = document.getElementById("gameFrame"); // Game iframe
	let streamURLBarElement = document.getElementById("streamURLBar"); // Stream url input
	let streamURLElement = document.getElementById("streamURL"); // Stream url input
	let menuItemsElement = document.getElementById("menuItems"); // Menu div
	let menuButtonElement = document.getElementById("menuButton"); // Menu button
	let swapViewButtonElements = document.querySelectorAll(".swapViewButton"); // Swap view buttons
	let swapViewButtonWrapperElements = document.querySelectorAll(".swapViewButtonWrapper"); // Swap view button wrappers
	const revokeTwitchBtnElement = document.getElementById("revokeTwitchBtn");

	// Data variables
	let activeView = "default"; // Variable for active view
	let documentTitle = "Remote Jackbox Player"; // Variable holding the official app title
	let playerURL = null; // Variable for the player URL used for link sharing
	let streamURL = ""; // Variable to hold the stream URL value
	let peekUITimeoutID; // Variable to hold the timeout used in peekUI()
	let twitchAuthToken = ""; // Variable to hold Twitch auth token
	let twitchGameIds = Array.from(gameIds.twitch); // Variable for array of Twitch game ids

	let twitchClientID = clientIds["twitch-client-id"]; // Variable for Twitch Client ID

	// Channel id/names
	let twitchChannelId = ""; // Variable to hold Twitch channel id

	const defaultStreamURL = ""; // Default stream URL
	const defaultGameURL = "https://jackbox.tv"; // Default game URL
	const defaultPlayerClasses = playerElement.getAttribute("class"); // Default classes for #player from index.html
	const defaultStreamPaneClasses = streamPaneElement.getAttribute("class"); // Default classes for #streamPane from index.html
	const defaultGamePaneClasses = gamePaneElement.getAttribute("class"); // Default classes for #gamePane from index.html
	const defaultSwapViewButtonWrappersClasses = swapViewButtonWrapperElements.item(0).getAttribute("class"); // Default classes for .swapViewButton's from index.html

	const peekTimeMs = 1250; // Time in milliseconds for UI to peek when called by functions like peekUI()

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

	// Function for swapping which frame is in front
	function swapView() {
		// If the stream pane is hidden
		if (streamPaneElement.classList.contains("z-10")) {
			// Show stream pane
			streamPaneElement.classList.add("z-20");
			streamPaneElement.classList.remove("z-10");

			// Hide game pane
			gamePaneElement.classList.add("z-10");
			gamePaneElement.classList.remove("z-20");
		}
		// Else assume game pane is hidden
		else {
			// Show game pane
			gamePaneElement.classList.add("z-20");
			gamePaneElement.classList.remove("z-10");

			// Hide stream pane
			streamPaneElement.classList.add("z-10");
			streamPaneElement.classList.remove("z-20");
		}
	}

	// Bind any game-pane-btn class element to swap views if it is clicked
	document.querySelectorAll(".game-pane-btn").forEach((e) => {
		e.addEventListener("click", () => {
			if (activeView === "swap") {
				swapView();
			}
		});
	});

	// Function for setting the view
	function setView(view) {
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
			if (streamPaneElement.classList.contains("z-10")) {
				streamPaneElement.setAttribute("class", "absolute z-10 w-full h-full"); // Configure the stream pane to fill the screen and keep it hidden
				gamePaneElement.setAttribute("class", "absolute z-20 w-full h-full"); // Configure the game pane to fill the screen
			}
			// Else hide the game pane
			else {
				streamPaneElement.setAttribute("class", "absolute z-20 w-full h-full"); // Configure the stream pane to fill the screen
				gamePaneElement.setAttribute("class", "absolute z-10 w-full h-full"); // Configure the game pane to fill the screen and hide it
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

		// If default view is requested
		if (view === "default") {
			setupDefaultView(); // Set default view
		}
		// Else if split view is requested
		else if (view === "split") {
			setupSplitView(); // Set split view
		}
		// Else if swap view is requested
		else if (view === "swap") {
			setupSwapView(); // Set swap view
		}
		// Else if scroll view is requested
		else if (view === "scroll") {
			setupScrollView(); // Set scroll view
		}
		// Else if swipe view is requested
		else if (view === "swipe") {
			setupSwipeView(); // Set swipe view
		}

		// Save view preference
		localStorage.setItem("rjp-activeView", view);
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

	// Function for getting a player URL param
	// Based on: https://blog.bitscry.com/2018/08/17/getting-and-setting-url-parameters-with-javascript/
	function getURLParam(param) {
		let parameter = param;
		parameter = parameter.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		let regex = new RegExp("[\\?|&]" + parameter + "=([^&#]*)");
		let results = regex.exec("?" + playerURL.toString().split("?")[1]);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, "%20"));
	}

	// Function for pulling hash parameters from the URL
	function getURLHashParam(query) {
		let parameter = query;
		parameter = parameter.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		let regex = new RegExp("[\\#|&]" + parameter + "=([^&#]*)");
		let results = regex.exec("#" + playerURL.toString().split("#")[1]);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, "%20"));
	}

	// Function for updating the player's state based on new user input. Always call after calling updateStreamFrame()
	function updatePlayer() {
		// If the stream URL input is different than the last saved one and is not just "https://" (which is 8 chars long)
		if (streamURLElement.value !== streamURL && streamURLElement.value.toString().length > 8) {
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
		// Else if it is part of "https://" make sure the streamURL param is not there
		else if (streamURLElement.value.toString().length < 9) {
			document.title = `${documentTitle}`; // Update document title
			playerURL.searchParams.delete("streamURL"); // Delete streamURL param from the player URL
			window.history.pushState(null, null, "/"); // Remove the streamURL param and log in history
		}
	}

	// Function for initializing the player based on a new URL
	function initializePlayer() {
		playerURL = new URL(document.location.href.toString()); // Grab current URL
		streamURL = getURLParam("streamURL"); // Get stream URL from player URL param

		// If there is a Twitch auth token saved from a previous session
		if (localStorage.getItem("rjp-twitchAuthToken") !== null) {
			twitchAuthToken = localStorage.getItem("rjp-twitchAuthToken"); // Get twitchAuthToken
			console.log(`Twitch Auth Token: ${twitchAuthToken}`);
			revokeTwitchBtnElement.classList.remove("hidden");
		}

		// If an auth token was included with the URL update the stored one
		if (getURLHashParam("access_token") !== "") {
			twitchAuthToken = getURLHashParam("access_token"); // Get the access token

			// Store it for future requests
			localStorage.setItem("rjp-twitchAuthToken", twitchAuthToken);

			console.log(`New Twitch Auth Token: ${twitchAuthToken}`);
			revokeTwitchBtnElement.classList.remove("hidden");

			// Clear hashes
			window.history.pushState(null, null, window.location.pathname + window.location.search);
		}

		// If there is an error param from Twitch auth attempt
		if (getURLParam("error") !== "") {
			// If it was because the user denied access
			if (getURLParam("error_description") === "The user denied you access") {
				// If the afterAuthAction is "random"
				if (localStorage.getItem("rjp-afterAuthAction") === "random") {
					localStorage.removeItem("rjp-afterAuthAction"); // Remove that action
				}
			}
			// Else it may be because of an expired token
			else {
				// Clear token
				localStorage.removeItem("rjp-twitchAuthToken");

				// Send them to get an auth token
				redirectForTwitchAuthToken("stream");
			}
		}

		// If there is an action saved which needs to be performed
		if (localStorage.getItem("rjp-afterAuthAction") !== null) {
			// If the afterAuthAction is "random"
			if (localStorage.getItem("rjp-afterAuthAction") === "random") {
				document.getElementById("randomStreamButton").click(); // Click the random button again
			}
			// Assume it is a stream URL
			else {
				streamURL = localStorage.getItem("rjp-afterAuthAction"); // Set the streamURL to the saved afterAuthAction
			}
			console.log(`After Twitch Auth Action: ${localStorage.getItem("rjp-afterAuthAction")}`);
			localStorage.removeItem("rjp-afterAuthAction"); // Remove that action
		}

		// If stream URL param of the player URL is not blank
		if (streamURL != "") {
			streamURLElement.value = streamURL; // Set the stream URL input element to the stream URL
			document.title = `${documentTitle} - ${streamURL}`; // Update document title
			updateStreamFrame(); // Show the stream
			peekUI(); // Briefly show UI
		}
		// Else it is empty
		else {
			document.title = `${documentTitle}`; // Update document title

			// If this is a small screen
			if (window.innerWidth < 768) {
				setUIState("open"); // Open all UI

				// After peekTimeMs seconds
				setTimeout(() => {
					setMenuElementState("close"); // Close menu
				}, peekTimeMs);
			}
			// Else is is large enough to keep everything open
			else {
				setUIState("open"); // Open all UI
			}
		}
	}

	// Hide how-to
	function hideHowTo() {
		howToElement.classList.add("hidden"); // Hide how-to
	}

	// Show appropriate stream type
	function showStreamFrameElement(type) {
		// Hide unknown Stream Element
		function hideUnknownStream() {
			unknownStreamElement.classList.add("hidden"); // Hide unknown stream element
			unknownStreamElement.src = ""; // Clear unknown stream element
		}

		// Hide Twitch Stream Element
		function hideTwitchStream() {
			twitchStreamElement.classList.add("hidden"); // Hide Twitch stream element
			twitchStreamElement.innerHTML = ""; // Clear Twitch stream element
			twitchChannelId = ""; // Clear Twitch channel id
		}

		// If type equals Twitch
		if (type == "twitch") {
			// Display Twitch stream element
			twitchStreamElement.classList.remove("hidden");

			hideHowTo(); // Hide how-to
			hideUnknownStream(); // Hide unknown stream
		}
		// If type equals how-to
		else if (type == "howTo") {
			// Display how-to element
			howToElement.classList.remove("hidden");

			// Bring the stream frame into view
			streamPaneElement.scrollIntoView(true);

			hideUnknownStream(); // Hide unknown stream
			hideTwitchStream(); // Hide twitch
			setStreamURLBarElementState("open"); // Show stream URL bar
		}
		// Else use unknown stream element
		else {
			// Display unknown stream element
			unknownStreamElement.classList.remove("hidden");

			hideHowTo(); // Hide how-to
			hideTwitchStream(); // Hide Twitch stream
		}
	}

	// Function for clearing channel id/name variables
	function clearChannelIds() {
		twitchChannelId = ""; // Clear Twitch channel Id
		unknownStreamElement.src = ""; // Clear unknown stream src
	}

	// Function for navigating stream frame
	function updateStreamFrame() {
		// If the stream URL field is not blank
		if (streamURLElement.value != "") {
			/////////////////////////////
			// Clean up URL formatting //
			/////////////////////////////

			// If the user has not typed part of "https://"
			if (!"https://".startsWith(streamURLElement.value.toString())) {
				streamURLElement.value = streamURLElement.value.toString().replace(/http:\/\//g, ""); // Remove any "http://""'s
				streamURLElement.value = streamURLElement.value.toString().replace(/https:\/\//g, ""); // Remove any "https://""'s
				streamURLElement.value = `https://${streamURLElement.value.toString()}`; // Add secure protocol
			}

			/////////////////////////////
			//   Setup stream element  //
			/////////////////////////////

			// If the stream URL is this web app
			if (streamURLElement.value.toString().includes("remote-jackbox-player")) {
				// Block inception...
				// Click the how-to button instead
				document.getElementById("howToButton").click();
			}
			// Else if the stream URL is for Twitch
			else if (streamURLElement.value.toString().includes("twitch.tv")) {
				// If Twitch channel id is blank or has changed
				if (twitchChannelId === "" || twitchChannelId !== streamURLElement.value.toString().split("/")[3]) {
					// Update the Twitch channel id
					twitchChannelId = streamURLElement.value.toString().split("/")[3];

					// Show Twitch stream
					showStreamFrameElement("twitch");

					// TTV configuration
					let ttvConfig = () => {
						try {
							var embed = new Twitch.Embed("twitchStream", {
								allowfullscreen: false,
								width: "100%",
								height: "100%",
								channel: twitchChannelId,
								theme: "dark",
								layout: "video-with-chat",
								autoplay: true,
							});

							embed.addEventListener(Twitch.Embed.VIDEO_READY, () => {
								var player = embed.getPlayer();
								player.play();
							});
						} catch (error) {
							console.error("Twitch embed setup error: \n%o", error); // Log error
						}
					};

					// If the Twitch embed script has not previously been loaded
					if (document.getElementById("ttvEmbedScript") == null || document.getElementById("ttvEmbedScript") == undefined) {
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
	function setStreamURLBarElementState(state) {
		// Else if the requested stream URL bar state is open
		if (state == "open") {
			// Increase opacity of stream URL bar
			setOpacityStreamURLBar("1.0");

			// Set active styling
			streamURLBarElement.classList.add("w-full");
			streamURLBarElement.classList.remove("w-0");

			setTimeout(() => {
				// For each titleHelpText within #streamURLBarTitleHelpText
				document.querySelectorAll("#streamURLBarTitleHelpText > .titleHelpText").forEach((e) => {
					// Show it
					e.classList.add("opacity-100");
					e.classList.remove("opacity-0");

					window.setTimeout((e) => {
						e.classList.remove("hidden");
					}, 500);
				});
			}, peekTimeMs / 3);
		}
		// Else if the requested stream URL bar state is close
		else if (state == "close") {
			// Blur stream URL input
			streamURLElement.blur();

			// For each titleHelpText within #streamURLBarTitleHelpText
			document.querySelectorAll("#streamURLBarTitleHelpText > .titleHelpText").forEach((e) => {
				// Hide it
				e.classList.add("opacity-0");
				e.classList.remove("opacity-100");

				window.setTimeout((e) => {
					e.classList.add("hidden");
				}, 500);
			});

			setTimeout(() => {
				// Set inactive styling
				streamURLBarElement.classList.add("w-0");
				streamURLBarElement.classList.remove("w-full");
			}, peekTimeMs / 3);
		}
	}

	// Function for updating the state of the menu
	function setMenuElementState(state) {
		const closedMenuIcon = `<i class="fas fa-times" aria-hidden="true"></i>`;
		const menuIcon = `<i class="fas fa-bars" aria-hidden="true"></i>`;

		// If the request state is open
		if (state == "open") {
			menuButtonElement.innerHTML = closedMenuIcon; // Change the icon to the close button
			menuItemsElement.classList.remove("w-0");
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

					window.setTimeout((e) => {
						e.classList.remove("hidden");
					}, 500);
				});

				// For each titleHelpText for a control
				document.querySelectorAll(".control > .titleHelpText").forEach((e) => {
					// Show it
					e.classList.add("opacity-100");
					e.classList.remove("opacity-0");

					window.setTimeout((e) => {
						e.classList.remove("hidden");
					}, 500);
				});
			}, peekTimeMs / 3);
		}
		// Else if the request state is close
		else if (state == "close") {
			// For each titleHelpText for a menuItem
			document.querySelectorAll(".menuItem > .titleHelpText").forEach((e) => {
				// Hide it
				e.classList.add("opacity-0");
				e.classList.remove("opacity-100");

				window.setTimeout((e) => {
					e.classList.add("hidden");
				}, 500);
			});

			// For each titleHelpText for a control
			document.querySelectorAll(".control > .titleHelpText").forEach((e) => {
				// Hide it
				e.classList.add("opacity-0");
				e.classList.remove("opacity-100");

				window.setTimeout((e) => {
					e.classList.add("hidden");
				}, 500);
			});

			setTimeout(() => {
				menuButtonElement.innerHTML = menuIcon; // Change the icon to the menu button
				menuItemsElement.classList.remove("h-0");
				menuItemsElement.style.height = "0rem"; // Close the menu
				menuButtonElement.title = "Open menu"; // Set title

				window.setTimeout(() => {
					menuItemsElement.classList.add("w-0");
				}, 1000);

				// Set inactive styling
				menuButtonElement.classList.remove("bg-teal-300");
				menuButtonElement.classList.remove("shadow-inner");
				menuButtonElement.classList.remove("rounded-br");
				menuButtonElement.classList.add("bg-white");
				menuButtonElement.classList.add("rounded-r");
			}, peekTimeMs / 3);
		}
	}

	// Function for setting the UI state
	function setUIState(state) {
		setStreamURLBarElementState(state);
		setMenuElementState(state);
	}

	// Function for peeking UI
	function peekUI() {
		setUIState("open"); // Open the UI

		// Hide UI
		peekUITimeoutID = setTimeout(() => {
			setUIState("close"); // Close the UI
		}, peekTimeMs);
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
		setView("split"); // Setup split view
	});

	// Add event listeners to the swap view buttons
	swapViewButtonElements.forEach((e) => {
		e.addEventListener("click", () => {
			// If the active view is not already swap view (this should never happen if the UI controls are setup correctly)
			if (activeView != "swap") {
				setView("swap"); // Setup swap view
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
			setView("swap"); // Setup swap view
		}
	});

	// Add event listener to the setup scroll view button
	document.getElementById("setupScrollViewButton").addEventListener("click", () => {
		setView("scroll"); // Setup scroll view
	});

	// Add event listener to the setup swipe view button
	document.getElementById("setupSwipeViewButton").addEventListener("click", () => {
		setView("swipe"); // Setup swipe view
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
		generateFollowedStreamsList(); // Update the followed streams list

		// Show followed streams wrapper
		document.getElementById("followedStreamsListWrapper").classList.remove("scale-y-0");
	});

	// Add event listener for when the URL input field blurs
	streamURLElement.addEventListener("blur", () => {
		updateStreamFrame(); // Update the stream frame
		updatePlayer(); // Update the player URL based on user input

		window.setTimeout(() => {
			// Hide followed streams wrapper
			document.getElementById("followedStreamsListWrapper").classList.add("scale-y-0");
		}, 3000);
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
		stopPeekUI(); // Stop menus from hiding after peekUI()

		// Copy URL to clipboard
		copyToClipboard(playerURL.toString().replace(playerURL.hash, ""));

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
			setMenuElementState("close"); // Hide the menu
			showStreamFrameElement("howTo"); // Show how-to element
		} else {
			updateStreamFrame(); // Update the stream frame
			updatePlayer(); // Update the player URL based on user input
		}
	});

	// Function for prompting unload confirmation dialog
	function confirmUnload(e) {
		// Prompt always shown in Mozilla Firefox
		// Prompt only show in Chrome if user interacted with the page

		// Cancel the default event
		e.preventDefault();

		// Chrome requires returnValue to be set
		e.returnValue = "";
	}

	// Add event listener for when the page is reloaded in order to confirm that session will be lost
	if (window.location.hostname.includes("localhost") === false && window.location.hostname.includes("127.0.0.1") === false) {
		window.addEventListener("beforeunload", confirmUnload);
	}

	// Add event listener to the stream reload button
	document.getElementById("reloadStreamButton").addEventListener("click", () => {
		clearChannelIds(); // Clear channel info so that stream pane will reload
		updateStreamFrame(); // Update stream pane
	});

	// Add event listener to the game reload button
	document.getElementById("reloadGameButton").addEventListener("click", () => {
		let result = false; // Result for user prompt
		result = window.confirm("Reload the game?\nYou may lose your spot in the lobby."); // Check if the user really wants to reload their game

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

			// This checks if the current device is not mobile
			if (!/Android|iPhone/i.test(navigator.userAgent)) {
				setTimeout(() => {
					streamURLElement.focus(); // Focus on stream URL input
				}, 1000); // After 1 sec
			}
		}
		// Else if the menu is open
		else if (menuButtonElement.title.includes("Close")) {
			setUIState("close"); // Close UI
			streamURLElement.blur(); // Blur stream URL input
		}
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

	// Function for redirecting user to get a new Twitch auth toke
	// Accepts an action string to perform when it receives a response from Twitch
	function redirectForTwitchAuthToken(action) {
		// If the action is "random"
		if (action === "random") {
			localStorage.setItem("rjp-afterAuthAction", "random"); // Set afterAuthAction to "random"
		}
		// Else if it is stream
		else if (action === "stream") {
			localStorage.setItem("rjp-afterAuthAction", streamURL); // Set afterAuthAction to the current stream URL
		} // Otherwise ignore action value

		// Remove event listener for when the page is reloaded in order to stop the confirmUnload dialog
		if (window.location.hostname.includes("localhost") === false && window.location.hostname.includes("127.0.0.1") === false) {
			window.removeEventListener("beforeunload", confirmUnload);
		}

		// Send the user to get an auth token
		document.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${twitchClientID}&redirect_uri=${window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? encodeURI("http://localhost:5500/public/") : encodeURI(window.location.origin + window.location.pathname)}&response_type=token`;
	}

	// Add event listener for random stream button
	document.getElementById("randomStreamButton").addEventListener("click", async () => {
		// Function for getting a random integer
		function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
		}

		streamURLElement.disabled = true; // Disable the stream URL input
		streamURLElement.value = "Searching..."; // Indicate to the user that searching is in progress

		// If there is a twitchAuthToken already set and twitchGameIds is not undefined
		if (twitchAuthToken !== "" && twitchGameIds !== undefined) {
			let streamPool = []; // Array of possible streams to choose from
			let currentGameIDPool = []; // Array of streams gathered` thus far for a given game id
			let twitchCursor = ""; // Variable for holding the results cursor

			// Retrieve top 30 streams (based on view count) using a game id
			for (let i = 0; i < twitchGameIds.length; ) {
				// For this game id fetch top 30 streams
				let twitchResult = await fetch(`https://api.twitch.tv/helix/streams?language=en&first=30&game_id=${twitchGameIds[i].game_id}&after=${twitchCursor}`, {
					headers: {
						"Client-ID": twitchClientID,
						Authorization: `Bearer ${twitchAuthToken}`,
					},
				});

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
					// If the client was denied access
					if (twitchResult.status === 401) {
						// End execution and send user to get a Twitch auth token
						return redirectForTwitchAuthToken("random");
					}
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
		else if (twitchAuthToken === "") {
			redirectForTwitchAuthToken("random"); // Go get a Twitch auth token
		}
	});

	// Function for generating a list of the user's followed streams playing Jackbox games
	async function generateFollowedStreamsList() {
		let followedStreamsListElement = document.getElementById("followedStreamsList");
		let followedStreamsListStatusElement = document.getElementById("followedStreamsListStatus");

		// If there is a twitchAuthToken already set and twitchGameIds is not undefined
		if (twitchAuthToken !== "" && twitchGameIds !== undefined) {
			// Show the streams list status element
			followedStreamsListStatusElement.classList.remove("hidden");

			// If no streams have been generated yet
			if (followedStreamsListElement.innerHTML === "") {
				// Let the user know a list is being generated
				followedStreamsListStatusElement.innerHTML = `Generating list...`;
			}
			// Let the user know the list is updating
			else {
				// Let the user know a list is being generated
				followedStreamsListStatusElement.innerHTML = `Updating list...`;
			}

			// Fetch user object
			let usersResult = await fetch(`https://api.twitch.tv/helix/users`, {
				headers: {
					"Client-ID": twitchClientID,
					Authorization: `Bearer ${twitchAuthToken}`,
				},
			});

			// The user object was successfully fetched
			if (usersResult.ok) {
				let userObject = await usersResult.json(); // Get user id

				let followedStreamsPlayingJG = []; // Array of followed streams which are playing Jackbox games
				let twitchCursor = ""; // Variable for holding the results cursor

				// Iterate through each page of query results
				do {
					//Followed streams in the current query
					let currentPageOfFollowedStreams = await fetch(`https://api.twitch.tv/helix/users/follows?from_id=${userObject.data[0].id}&first=30&after=${twitchCursor}`, {
						headers: {
							"Client-ID": twitchClientID,
							Authorization: `Bearer ${twitchAuthToken}`,
						},
					});

					let currentPageOfFollowedStreamsJSON = await currentPageOfFollowedStreams.json(); // Convert query result to json object
					let userIdParamString = ""; // Variable user ids parameters

					// If the user is following at least one stream
					if (currentPageOfFollowedStreamsJSON.data.length > 0) {
						// Add each user from the current page to the userIdParamString
						for (let u = 0; u < currentPageOfFollowedStreamsJSON.data.length; u++) {
							userIdParamString += "user_id=";
							userIdParamString += currentPageOfFollowedStreamsJSON.data[u].to_id;

							// If this is not the last param append an "&" after
							if (u + 1 < currentPageOfFollowedStreamsJSON.data.length) {
								userIdParamString += "&";
							}
						}

						// Fetch stream status info of the current page
						let streamInfo = await fetch(`https://api.twitch.tv/helix/streams?${userIdParamString}`, {
							headers: {
								"Client-ID": twitchClientID,
								Authorization: `Bearer ${twitchAuthToken}`,
							},
						});

						userIdParamString = ""; // Clear param string

						// Add each user from the current page to the userIdParamString
						for (let u = 0; u < currentPageOfFollowedStreamsJSON.data.length; u++) {
							userIdParamString += "id=";
							userIdParamString += currentPageOfFollowedStreamsJSON.data[u].to_id;

							// If this is not the last param append an "&" after
							if (u + 1 < currentPageOfFollowedStreamsJSON.data.length) {
								userIdParamString += "&";
							}
						}

						// Fetch user info of the current page
						let userInfo = await fetch(`https://api.twitch.tv/helix/users?${userIdParamString}`, {
							headers: {
								"Client-ID": twitchClientID,
								Authorization: `Bearer ${twitchAuthToken}`,
							},
						});

						// If fetch successfully got stream status and user info for the current page
						if (streamInfo.ok && userInfo.ok) {
							let streamInfoJSON = await streamInfo.json(); // Convert query result to json object
							let userInfoJSON = await userInfo.json(); // Convert query result to json object

							// Iterate through each stream result
							for (let s = 0; s < streamInfoJSON.data.length; s++) {
								// Iterate through each game id
								for (let g = 0; g < twitchGameIds.length; g++) {
									// If the stream is playing a game matching one from the list of game ids
									if (twitchGameIds[g].game_id === streamInfoJSON.data[s].game_id) {
										let tempObject = streamInfoJSON.data[s]; // Copy current stream to a temp object

										// Iterate through all the user info to find the matching profile image
										for (let p = 0; p < userInfoJSON.data.length; p++) {
											// If the user info id matches the stream info user id
											if (userInfoJSON.data[p].id === streamInfoJSON.data[s].user_id) tempObject.profile_image_url = userInfoJSON.data[p].profile_image_url; // Copy profile image from user info
										}
										followedStreamsPlayingJG.push(tempObject); // Push the stream object
									}
								}
							}
						}
					}

					// If there are more query pages
					if (currentPageOfFollowedStreamsJSON.pagination.cursor !== undefined) {
						twitchCursor = currentPageOfFollowedStreamsJSON.pagination.cursor; // Save the cursor
					}
					// Else there are no more query pages
					else {
						twitchCursor = ""; // Empty the cursor
					}
				} while (twitchCursor !== "");

				// If at least one stream is playing a valid game id
				if (followedStreamsPlayingJG.length > 0) {
					// If more than one stream
					if (followedStreamsPlayingJG.length > 1) {
						// sort based on view count
					}

					followedStreamsListElement.innerHTML = ""; // Clear followedStreamsList

					// For each stream add it to the dropdown list
					followedStreamsPlayingJG.forEach((s) => {
						let gameName = ""; // Variable for holding game name

						// Iterate through game ids
						for (let g = 0; g < twitchGameIds.length; g++) {
							// If the game id matches the stream's game id
							if (twitchGameIds[g].game_id === s.game_id) {
								gameName = twitchGameIds[g].game_name; // Grab the game name
							}
						}

						// Create a stream list component
						followedStreamsListElement.innerHTML += `
							<div 
								class="followedStream flex flex-row flex-no-wrap p-2 text-center align-middle cursor-pointer border-b border-solid border-gray-400 hover:bg-teal-100" 
								title="${s.user_name + " playing " + gameName + " for " + (s.viewer_count === 1 ? s.viewer_count + " viewer" : s.viewer_count === 0 ? "no one." : s.viewer_count.toLocaleString() + " viewers.")}" 
								data-stream-name="${s.user_name}"
							>
								<div class="flex-initial w-4/12 text-left truncate">
									<img src="${s.profile_image_url}" class="inline w-6 rounded">
									<span class="font-bold">${s.user_name}</span>
								</div>
								<div class="flex-grow text-left truncate">
									<span class="underline">${gameName}</span>
								</div>
								<div class="flex-initial w-3/12 text-right">
									${s.viewer_count === 1 ? s.viewer_count + " viewer" : s.viewer_count === 0 ? "No viewers" : s.viewer_count.toLocaleString() + " viewers"}
								</div>
							</div>
						`;
					});

					// Add event listener to each stream component
					document.querySelectorAll(".followedStream").forEach((e) => {
						e.addEventListener("click", () => {
							streamURLElement.value = `https://twitch.tv/${e.getAttribute("data-stream-name")}`; // Set the stream URL input
							updateStreamFrame(); // Update the stream frame
							updatePlayer(); // Update the player URL based on user input
						});
					});
				}
				// No followed streams are playing a valid game id
				else {
					// Let the user know
					followedStreamsListElement.innerHTML = `
						<div class="p-2 text-center">
							Sorry, none of your followed streams are playing a Jackbox game.
						</div>
					`;
				}
			}
			// Failed to fetch the user object from Twitch (probably the user revoked access)
			else {
				// Set followedStreamsList innerHTML to a notice
				followedStreamsListElement.innerHTML = `
					<div class="p-2 text-center">
						Want to see which of your followed Twitch streams are playing Jackbox
						games?<br />
						<button
							id="authorizeTwitchAccessButton"
							class="bg-purple-500 text-white rounded mt-1 px-4 py-1 hover:bg-purple-600"
						>
							Authorize <i class="fab fa-twitch"></i> access
						</button>
					</div>
				`;
			}

			// Hide the streams list status element
			followedStreamsListStatusElement.classList.add("hidden");
		}
		// Else let the user know
		else {
			// Set followedStreamsList innerHTML to a notice
			followedStreamsListElement.innerHTML = `
				<div class="p-2 text-center">
					Want to see which of your followed Twitch streams are playing Jackbox
					games?<br />
					<button
						id="authorizeTwitchAccessButton"
						class="bg-purple-500 text-white rounded mt-1 px-4 py-1 hover:bg-purple-600"
					>
						Authorize <i class="fab fa-twitch"></i> access
					</button>
				</div>
			`;

			// Add event listener for authorizeTwitchAccessButton
			document.getElementById("authorizeTwitchAccessButton").addEventListener("click", () => {
				redirectForTwitchAuthToken("stream"); // Send the user to get a Twitch auth token
			});
		}
	}

	// allows the user to quickly disconnect from Twitch and reauth if there is some sort of reason to
	revokeTwitchBtnElement.addEventListener("click", async () => {
		{
			if (twitchAuthToken != "") {
				const twitchResult = await fetch(`https://id.twitch.tv/oauth2/revoke`, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: `client_id=${twitchClientID}&token=${twitchAuthToken}`,
				});
				if (twitchResult.ok) {
					console.log(`Revoked Twitch access token: ${localStorage.getItem("rjp-twitchAuthToken")}`);
					twitchAuthToken = "";
					localStorage.removeItem("rjp-twitchAuthToken");

					const tempInnerHTML = revokeTwitchBtnElement.innerHTML;
					revokeTwitchBtnElement.disabled = true;
					revokeTwitchBtnElement.innerHTML = '<i class="fas fa-check"></i> Done';
					window.setTimeout(() => {
						revokeTwitchBtnElement.classList.add("hidden");
						revokeTwitchBtnElement.disabled = false;
						revokeTwitchBtnElement.innerHTML = tempInnerHTML;
					}, 3000);
				}
			}
		}
	});

	console.group("Remote Jackbox Player Settings Restored");
	// If there is an active view saved from a previous session
	if (localStorage.getItem("rjp-activeView") !== null) {
		setView(localStorage.getItem("rjp-activeView")); // Get and set view back to what it was
		console.log(`View: ${localStorage.getItem("rjp-activeView")}`);
	} else {
		localStorage.setItem("rjp-activeView", activeView); // Save the default view as the active view
	}
	initializePlayer(); // Update the player based on the stream URL if present
	console.groupEnd("Remote Jackbox Player Settings Restored");
};
document.addEventListener("DOMContentLoaded", rJP);
