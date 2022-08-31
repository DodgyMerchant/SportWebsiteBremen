//TODO: <br /> between verein listed

//#region DATA

/**
 * a location object
 */
class SportLocation {
	/**
	 * Tietel des Vereins
	 * @type {String}
	 */
	titel;
	/**
	 * Adresse des Vereins
	 * @type {String}
	 */
	adresse;
	/**
	 * Ansprechpartner des Vereins
	 * @type {String}
	 */
	ansprechpartner;
	/**
	 * Telefon des Vereins
	 * @type {String}
	 */
	telefon;
	/**
	 * Email Adresse des Vereins
	 * @type {String}
	 */
	eMail;
	/**
	 * "Mitgliedschaft" Email Adresse des Vereins
	 * @type {String}
	 */
	typ;
	/**
	 * coordinat obj with long, lat properties
	 * @type {google.maps.LatLng}
	coordinate;
	/**
	 * link to icon used
	 * @type {string}
	 */
	iconLink;
	/**
	 * link to picture used
	 * @type {string}
	 */
	bildLink;
	/**
	 * eeeeee
	 * @type {Verein[]}
	 */
	vereine;
	/**
	 * sportarten array
	 * @type {String[]}
	 */
	sportarten;

	/**
	 * @param {String} titel Tietel des Vereins
	 * @param {String} adresse Adresse des Vereins
	 * @param {String} ansprechpartner Ansprechpartner des Vereins
	 * @param {String} telefon Telefon des Vereins
	 * @param {String} eMail Email Adresse des Vereins
	 * @param {String} typ "Mitgliedschaft" Email Adresse des Vereins
	 * @param {google.maps.LatLng} coordinate coordinat obj with long, lat properties
	 * @param {string} bildLink link to image used
	 * @param {string} iconLink link to icon used
	 * @param {Verein[]} vereine
	 * @param {String} sportarten portarten als string auflistung
	 */
	constructor(
		titel,
		adresse,
		ansprechpartner,
		telefon,
		eMail,
		typ,
		coordinate,
		bildLink,
		iconLink,
		vereine,
		sportarten
	) {
		this.titel = titel;
		this.adresse = adresse;
		this.ansprechpartner = ansprechpartner;
		this.telefon = telefon;
		this.eMail = eMail;
		this.typ = typ;
		this.coordinate = coordinate;
		this.bildLink = bildLink;
		this.iconLink = iconLink;
		this.vereine = vereine;
		this.sportarten = sportarten;
	}
}

/**
 *  a verein object
 */
class Verein {
	/**
	 * @type {String}
	 */
	name;
	/**
	 * @type {String}
	 */
	link;

	/**
	 * @type {String[]}s
	 */
	sportarten;

	/**
	 *
	 * @param {String} name
	 * @param {String} link
	 * @param {String[]} sportarten
	 */
	constructor(name, link, sportarten) {
		this.name = name;
		this.link = link;
		this.sportarten = sportarten;
	}
}

/**
 * @type {Verein[]}
 */
const vereinListe = [];
/**
 * @type {SportLocation[]}
 */
const locationListe = [];

//#endregion DATA
//#region phases
/*
These steps must happen in this order and have prerequisites from previus steps
1- Map Created
2- Vereine Data processed
3- SportLocation Data processed  | needs Data_Ver
4- Create Map Markers       | needs Map, Data_Ver, Data_Loc
*/
/**
 * @typedef {number} Phase a number representing a phase of a process.
 */
const Phase_notDone = 0;
const Phase_ready = 1;
const Phase_processing = 2;
const Phase_done = 3;

/**
 * a tracker for a phase.
 */
class PhaseTracker {
	/**
	 * @type {Phase} the phase im tracking
	 */
	phase;
	constructor(phase = Phase_notDone) {
		this.phase = phase;
	}

	__fromTo(from, to, timeout, limit = 1) {
		if (this.phase == from) {
			this.phase = to;
			return true;
		}
		//cant switch
		// if (timeout && limit > 0) {
		// 	console.log("timeout: ", timeout);
		// 	setTimeout(__fromTo, timeout, from, to, timeout - 1);
		// }
		return false;
	}

	/**
	 * sets the phase to ready if the phase is notDone
	 * @param timeout timeout in milliseconds taken if phase could be set
	 * @param limit limit of times to wait, default 1
	 * @returns {boolean} if it was successful
	 */
	ready(timeout, limit) {
		return this.__fromTo(Phase_notDone, Phase_ready, timeout, limit);
	}
	/**
	 * sets the phase to processing if the phase is ready
	 * @param timeout timeout in milliseconds taken if phase could be set
	 * @param limit limit of times to wait, default 1s
	 * @returns {boolean} if it was successful
	 */
	start(timeout, limit) {
		return this.__fromTo(Phase_ready, Phase_processing, timeout, limit);
	}
	/**
	 * sets the phase to done if the phase is processing
	 * @param timeout timeout in milliseconds taken if phase could be set
	 * @param limit limit of times to wait, default 1
	 * @returns {boolean} if it was successful
	 */
	done(timeout, limit) {
		return this.__fromTo(Phase_processing, Phase_done, timeout, limit);
	}

	/**
	 * compare of get the phase
	 * @param {Phase} phase if you want to compare the phase
	 * @returns {Phase | boolean} returns if phase supplied mathes the given, else retruns phase.
	 */
	check(phase) {
		if (phase) return this.phase == phase;
		else return this.phase;
	}
}

/**
 * check if phase tracker is ready
 * @param {PhaseTracker} phaseTracker the phase tracker
 * @returns {boolean} true if phase tracker is ready
 */
function phaseCheckReady(phaseTracker) {
	return phaseTracker.check(Phase_ready);
}
/**
 * check if phase tracker is processing
 * @param {PhaseTracker} phaseTracker the phase tracker
 * @returns {boolean} true if phase tracker is processing
 */
function phaseCheckProcessing(phaseTracker) {
	return phaseTracker.check(Phase_processing);
}
/**
 * check if phase tracker is done
 * @param {PhaseTracker} phaseTracker the phase tracker
 * @returns {boolean} true if phase tracker is done
 */
function phaseCheckDone(phaseTracker) {
	return phaseTracker.check(Phase_done);
}

/**
 *
 * @type {PhaseTracker}
 */
const PT_MAP_SETUP = new PhaseTracker(Phase_ready);
/**
 * phase variable:
 * 0 = not done;
 * 1 = ready;
 * 2 = done;
 * @type {PhaseTracker}
 */
const PT_DATA_Ver = new PhaseTracker(Phase_ready);
/**
 * phase variable:
 * 0 = not done;
 * 1 = ready;
 * 2 = done;
 * @type {PhaseTracker}
 */
const PT_DATA_Loc = new PhaseTracker();

//#endregion
//#region displaying information

const Template_Vereine = document.getElementById("template_vereine").content;

const target_infoBox = document.getElementById("mapInfoBox");
const target_info = document.getElementById("mapInfo");
const target_vereine = document.getElementById("info_Vereine");
const displayText_DATA_NOT_AVALABLE = "N.a.";
var info_markerCurrent = null;

//check for Template support
const supportsTemplate = document.createElement("Template").content;

//#region check compatability
//continue or exit
if (supportsTemplate) {
	console.log("Your browser supports Template!");
} else {
	console.log("Your browser does NOT support Template!!!");
	alert(
		"Your browser does not fully support this website!\n My portfolio projects won't be displayed currently."
	);
}
//#endregion

//#region Templates
/**
 *
 * @param {HTMLElement} template
 * @returns {HTMLElement} cloned html element
 */
function getTemplate(template) {
	return document.importNode(template, true);
}
/**
 *
 * @param {HTMLElement} parent
 * @param {String} className
 * @returns {HTMLElement}
 */
function getElementByClass(parent, className) {
	return parent.getElementsByClassName(className)[0];
}
/**
 * @param {Verein} verein eeeeeeee
 * @returns {HTMLElement} cloned formatted html element
 */
function createVereinHTML(verein) {
	let _newClone = getTemplate(Template_Vereine).firstElementChild;

	elementSetInner(_newClone, "verein replace name", verein.name);
	elementSetInner(
		_newClone,
		"verein replace sportarten",
		dataDispalySportarten(verein)
	);
	getElementByClass(_newClone, "verein text link").href = verein.link;

	return _newClone;
}

//#endregion Templates

/**
 * select given marker and disolay its location in the info panel
 * @param {any} newMarker map marker
 */
function markerSelect(newMarker) {
	if (newMarker != info_markerCurrent) {
		// old marker exists
		if (info_markerCurrent != null) {
			//deselect
			markerDeselect(info_markerCurrent);
		}

		info_markerCurrent = newMarker;
		updateInfo(newMarker.CUSTOM_location);

		//icon
		// let _w = 32;
		// let _h = (markerIcon.height / markerIcon.width) * _w;

		let _h = 37;
		let _w = (markerIcon.width / markerIcon.height) * _h;

		newMarker.setIcon({
			size: new google.maps.Size(markerIcon.width, markerIcon.height),
			scaledSize: new google.maps.Size(_w, _h),
			url: markerIcon.src,
			origin: new google.maps.Point(0, 0), // origin
			anchor: new google.maps.Point(_w / 2, _h), // anchor
		});

		// newMarker.setIcon(markerIconObj);
	}
}
/**
 *
 * @param {any} oldMarker map marker
 */
function markerDeselect(oldMarker) {
	//marker specific stuff
	cleanInfo();
	info_markerCurrent = null;
	oldMarker.setIcon(undefined);
}

/**
 * update information in info panel with location information.
 * maybe needs to be cleaned first
 * @param {SportLocation} location
 */
function updateInfo(location) {
	displayEnable(target_infoBox);
	setInfo(location);
}
/**
 *
 * @param {SportLocation} location
 */
function setInfo(location) {
	// target_info.getElementsByClassName("content-Text").innerText = entry.text;

	let img = target_info.getElementsByClassName("info location image")[0];
	img.src = location.bildLink;
	// img.alt = entry.imageAlt;

	elementSetInner(target_info, "info replace name", location.titel);
	elementSetInner(target_info, "info replace typ", location.typ);
	elementSetInner(
		target_info,
		"info replace sportarten",
		dataDispalySportarten(location)
	);
	elementSetInner(target_info, "info replace adresse", location.adresse);
	elementSetInner(
		target_info,
		"info replace ansprchP",
		location.ansprechpartner
	);
	elementSetInner(target_info, "info replace telefon", location.telefon);
	elementSetInner(target_info, "info replace email", location.eMail);

	//add vereine

	if (location.vereine && location.vereine.length != 0) {
		let leng = location.vereine.length;
		for (let i = 0; i < leng; i++) {
			target_vereine.appendChild(createVereinHTML(location.vereine[i]));
		}
	} else {
		target_vereine.innerHTML = displayText_DATA_NOT_AVALABLE;
	}
}
/**
 *
 * @param {HTMLElement} parent
 * @param {String} className
 * @param {any} data
 * @returns {HTMLElement}
 */
function elementSetInner(parent, className, data) {
	let target = getElementByClass(parent, className);

	if (target) {
		if (data) target.innerText = data;
		else target.innerText = displayText_DATA_NOT_AVALABLE;
		return target;
	} else {
		console.error("INFO - replace target not found: ", className);
		return null;
	}
}
function cleanInfo() {
	//remove added vereine
	while (target_vereine.firstChild != null) {
		target_vereine.removeChild(target_vereine.firstChild);
	}
}
/**
 * @param {Verein | SportLocation} obj eeeeeeee
 * @returns {return}
 */
function dataDispalySportarten(obj) {
	return obj.sportarten.join(", ");
}

// close button

function closeInfo() {
	markerDeselect(info_markerCurrent);
	//close info
	displayDisable(target_infoBox);
}

document
	.getElementById("mapInfoCloseButton")
	.addEventListener("click", closeInfo);

//#endregion
//#region map

/**
 * THE MAP
 * @type {any}
 */
var MAP;

const markerIcon = new Image();
markerIcon.src = "/img/marker.png";

// let _w = 32;
// let _h = (markerIcon.height / markerIcon.width) * _w;

// let _h = 37;
// let _w = (markerIcon.width / markerIcon.height) * _h;
// const markerIconObj = {
// 	size: new google.maps.Size(markerIcon.width, markerIcon.height),
// 	scaledSize: new google.maps.Size(_w, _h),
// 	url: markerIcon.src,
// 	origin: new google.maps.Point(0, 0), // origin
// 	anchor: new google.maps.Point(_w / 2, _h), // anchor
// };

function initMap() {
	mapSetup();
	getData();
	mapPopulate();
}

function mapSetup() {
	PT_MAP_SETUP.start();
	/**
	 * bremen coordinate
	 * @type {google.maps.LatLng} stuff
	 */
	const Loc_Bremen = new google.maps.LatLng(53.0793, 8.8017);

	MAP = new google.maps.Map(document.getElementById("map"), {
		zoom: 11,
		center: Loc_Bremen,
	});

	PT_MAP_SETUP.done();
}

async function mapPopulate() {
	if (phaseCheckDone(PT_DATA_Loc)) {
		let leng = locationListe.length;
		for (let i = 0; i < leng; i++) {
			addMarker(MAP, locationListe[i]);
		}
	} else {
		setTimeout(mapPopulate, 50);
	}
}

/**
 * add a marker to the map
 * @param {any} map
 * @param {SportLocation} location location object
 * @returns {any} google map marker
 */
function addMarker(map, location) {
	let marker = new google.maps.Marker({
		position: location.coordinate,
		map: map,
		title: location.titel,
	});
	marker.CUSTOM_location = location;
	marker.clickFunc = function () {
		markerSelect(this);
	};

	if (location.iconLink) {
		marker.setIcon(location.iconLink);
	}

	marker.addListener("click", marker.clickFunc, false);

	return marker;
}

window.initMap = initMap;

//#endregion
//#region map marker data

const sheet_id = "1a84t3igDkDMm4uQVVM-CDky5YGcmxiy7bB-gKQLq5kE";
const sheet_Loc_page = "Locations";
const sheet_Loc_range = "A2:P";
/** start index of the variable amount of content */
const sheet_Loc_variableIndex = 10;
const sheet_Ver_page = "Vereine";
const sheet_Ver_range = "A2:C";
const urlBase = `https://docs.google.com/spreadsheets/d/${sheet_id}/gviz/tq?tqx=out:json`;
const url_loc = `${urlBase}&sheet=${sheet_Loc_page}&range=${sheet_Loc_range}`;
const url_ver = `${urlBase}&sheet=${sheet_Ver_page}&range=${sheet_Ver_range}`;

// "${urlBase}&sheet=${sheetPage}range=${sheetRange}"
/**
 * google sheets fetch text to jason
 * @param {string} text
 * @returns {JSON}
 */
function GSFText_toJson(text) {
	//Remove additional text and extract only JSON:
	//remove function text in front and bracket in back
	return JSON.parse(text.substring(47).slice(0, -2));
}

/**
 * returns value from a cell obj
 * @param {Object} cellObj
 * @returns {any} null if empty
 */
function GSFJson_cellGet(cellObj) {
	if (cellObj != null)
		if (cellObj.v) return cellObj.v;
		else return cellObj.f;
	else return null;
}

/**
 * Finde ereins Objekt
 * @param {string} name name des vereins
 * @returns {Verein} vereins objekt
 */
function VereinGet(name) {
	let verein;
	let leng = vereinListe.length;
	for (let i = 0; i < leng; i++) {
		verein = vereinListe[i];
		if (verein.name == name) {
			return verein;
		}
	}
	return null;
}

function getData() {
	let url;

	//#region vereine

	fetch(url_ver)
		.then((res) => res.text())
		.then((rep) => {
			let jsonData = GSFText_toJson(rep);
			let rows = jsonData.table.rows;

			ProcessDataVereine(rows);
		});

	//#endregion vereine
	//#region locations

	fetch(url_loc)
		.then((res) => res.text())
		.then((rep) => {
			let jsonData = GSFText_toJson(rep);
			let rows = jsonData.table.rows;

			ProcessDataLocation(rows);
		});

	//#endregion locations
}
/**
 *
 * @param {JSON} rows
 */
function ProcessDataLocation(rows) {
	if (PT_DATA_Loc.start()) {
		let entries;
		/**
		 * @type {SportLocation}
		 */
		let location, verName, ver;
		let rowLeng = rows.length;
		for (let i = 0; i < rowLeng; i++) {
			entries = rows[i].c;

			location = new SportLocation(
				GSFJson_cellGet(entries[0]),
				GSFJson_cellGet(entries[1]),
				GSFJson_cellGet(entries[2]),
				GSFJson_cellGet(entries[3]),
				GSFJson_cellGet(entries[4]),
				GSFJson_cellGet(entries[5]),
				new google.maps.LatLng(
					GSFJson_cellGet(entries[6]),
					GSFJson_cellGet(entries[7])
				),
				GSFJson_cellGet(entries[8]),
				GSFJson_cellGet(entries[9]),
				[],
				[]
			);
			//link location and Vereine
			for (let ii = sheet_Loc_variableIndex; ii < entries.length; ii++) {
				verName = GSFJson_cellGet(entries[ii]);
				if (verName) {
					ver = VereinGet(verName);
					if (ver) {
						location.vereine.push(ver);
						location.sportarten.push(...ver.sportarten);
					}
				} else break;
			}

			locationListe.push(location);
		}

		PT_DATA_Loc.done();
		// console.log("locationListe: ", locationListe);
	} else {
		setTimeout(ProcessDataLocation, 100, rows);
	}
}
/**
 *
 * @param {JSON} rows
 */
function ProcessDataVereine(rows) {
	if (PT_DATA_Ver.start()) {
		let entries;
		let rowLeng = rows.length;
		for (let i = 0; i < rowLeng; i++) {
			entries = rows[i].c;

			//GSFJson_cellGet(entries[2])
			vereinListe.push(
				new Verein(
					GSFJson_cellGet(entries[0]),
					GSFJson_cellGet(entries[1]),
					GSFJson_cellGet(entries[2]).split(", ")
				)
			);
		}
		PT_DATA_Loc.ready();
		PT_DATA_Ver.done();
		// console.log("vereinListe: ", vereinListe);
	} else {
		setTimeout(ProcessDataVereine, 100, rows);
	}
}

//#endregion


