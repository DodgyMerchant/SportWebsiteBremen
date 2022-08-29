//setup
/**
 *
 * @param {HTMLElement} _el
 * @returns {String}
 */
function displaySetup(_el) {
	let _disp = _el.style.display;

	//no direct style set for display
	if (_disp == "") {
		//setting the var
		let _disp = window.getComputedStyle(_el).display;
		//saving display val to direct display
		displaySet(_el, _disp);
	}
	return _disp;
}
/**
 *
 * @param {HTMLElement} _el
 * @returns
 */
function displaySetupRemember(_el) {
	let _remdisp = _el.style.getPropertyValue("--rememberDisplay");
	let _disp = displayGet(_el);

	//if no rememberence is setup
	if (_remdisp == "") {
		let _give; //this val will be set as remember value
		if (_disp != "none") {
			//if computed style is not none
			_give = _disp; //sets current display value
		} else {
			/* prettier-ignore */
			let _custom = window.getComputedStyle(_el).getPropertyValue("--rememberDisplay");
			if (_custom != "")
				//looks for custom computed var
				_give = _custom;
			else {
				//use fallback value
				_give = "block";
			}
		}
		//set values
		displaySetRemember(_el, _give);
		_remdisp = _give;
	}

	return _remdisp;
}

//other
/**
 *
 * @param {HTMLElement} _el
 */
function displayToggle(_el) {
	/**
	 * toggles the display style of an element
	 * uses and saves used computed styles if there is one
	 *
	 * saves the original display in a custom attribute "--rememberDisplay"
	 * this attribute can also be predefined
	 * THis should be dome if the element is not supposed to be a block display
	 * but starts off in as none
	 */
	//get direct style custom value
	displaySetup(_el);
	let _remdisp = displayGetRemember(_el);

	displaySet(_el, _el.style.display == "none" ? _remdisp : "none");

	return _el.style.display;
}
/**
 * @param {HTMLElement} _el
 * @param {String | undefined} string
 */
function displayEnable(_el, _str) {
	displaySetup(_el);
	if (!_str) _str = displayGetRemember(_el);

	if (_el.style.display == "none") displaySet(_el, _str);
}
/**
 * @param {HTMLElement} _el
 * @param {String | undefined} string
 */
function displayDisable(_el) {
	displaySetupRemember(_el);

	if (_el.style.display != "none") displaySet(_el, "none");
}

/**
 *
 * @param {HTMLElement} _el
 * @returns {String}
 */
function displayGet(_el) {
	let _disp = displaySetup(_el);

	return _disp;
}
/**
 *
 * @param {HTMLElement} _el
 * @param {String} display
 */
function displaySet(_el, display) {
	_el.style.display = display;
}

/**
 *
 * @param {HTMLElement} _el
 * @returns {String}
 */
function displayGetRemember(_el) {
	let _rem = displaySetupRemember(_el);

	return _rem;
}
/**
 * does not setup
 * @param {HTMLElement} _el
 * @param {String} display
 */
function displaySetRemember(_el, display) {
	_el.style.setProperty("--rememberDisplay", display);
}

function getIdStyle(_id) {
	// returns a CSS Style Declaration, all values are named by html style names
	let _el = document.getElementById(_id);
	return window.getComputedStyle(_el);
}
