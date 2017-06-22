const rdy = (fn) => {
	if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

rdy(function () {
	init();
});

let init = () => {
	//init
}