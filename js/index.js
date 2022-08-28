/**
 * THE MAP
 * @type {any}
 */
var MAP;

function initMap() {
	/**
	 * bremen coordinate
	 * @type {Coordinate} stuff
	 */
	const Loc_Bremen = { lat: 53.0793, lng: 8.8017 };

	MAP = new google.maps.Map(document.getElementById("map"), {
		zoom: 11,
		center: Loc_Bremen,
	});
}
