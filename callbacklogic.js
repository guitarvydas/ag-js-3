// input pins = "file", "timeout"
// output pins = "good", "error" , "abort", "no response", "timer start", "timer stop"

// Interim version! This will be upgraded later!
// This version is already hard-to-read.  Later, we will compile diagrams into this code...

// In this version, the timer code is moved out of CallbackLogic and into a separate part (TimeoutTimer)
//  see discussion in PDF file and drawing.drawio

function CallbackLogic (id, name) {
    this.parent = null;
    this.id = id;
    if (name) { this.name = name } else { this.name = "CallbackLogic" };
    this.isSchematic = false;
    this.inputQueue = [];
    this.isReady = function () { return ( this.inputQueue.length > 0 ); };
    this.hasInputs = function () {
	return (0 < this.inputQueue.length);
    };
    this.consumeOneEventIfReady = function () {
	if (this.isReady()) {
	    var event = this.inputQueue.pop ();
	    this.react (event);
	}
    };

    this.transitionArray = [
	/* 0 */ () => { this.entry = "IDLE"; },
	/* 1 */ () => { this.entry = "TIMING"; },
        /* 2 */ () => { this.saveFile(); this.entry = "WAIT FOR START";},
	/* 3 */ () => { this.display(); this.entry = "IDLE" },
	/* 4 */ () => { this.saveFile(); this.entry = "WAIT FOR SYNC"; },
	/* 5 */ () => { this.entry = "IDLE"; },
	/* 6 */ () => { this.entry = "IDLE"; },
	/* 7 */ () => { this.entry = "IDLE"; }
    ];

    this.exitArray = {
    };

    this.entryArray = {
	state : "IDLE", code: function () { this.sendStopTimer(); this.state = "IDLE"; },
	state : "WAIT FOR ON", code: function () { this.setup (); this.state = "WAIT FOR ON"; }
    };


    this.transitionFunction = (n) => {
	this.exitArray[this.state] && this.exitArray[this.exit]();
	this.transitionArray[n] && this.transitionArray[n](); 
	this.entryArray[this.state] && this.entryArray[state]();
    };

    this.state = "";
    this.transitionFunction (0); /* take default transition */
    
    this.react = function (AGevent) {
	kernel.debug (this, AGevent);
	this.event = AGevent;
	if (this.state ==  "IDLE") {
	    if (AGevent.pin == "timer sync") {
		this.transitionFunction (1);
	    } else if (AGevent.pin == "file") {
		this.transitionFunction (4);
	    } else {
		throw "INTERNAL ERROR";
	    };
	} else if (this.state == "WAIT FOR START") {
	    if (AGevent.pin == "file") {
		this.transitionFunction (2);
	    } else {
		throw "INTERNAL ERROR";
	    };
	} else if (this.state == "WAIT FOR SYNC") {
	    if (AGevent.pin == "file") {
		this.transitionFunction (5);
	    } else {
		throw "INTERNAL ERROR";
	    };
	} else if (this.state == "WAIT FOR ON") {
	    if (AGevent.pin == "onload") {
		this.transitionFunction (3);
	    } else if (AGevent.pin == "onerror") {
		this.transitionFunction (6);
	    } else if (AGevent.pin == "onabort") {
		this.transitionFunction (7);
	    } else if (AGevent.pin == "timeout") {
		this.transitionFunction (8);
	    } else {
		throw "INTERNAL ERROR";
	    };
	} else if (this.state == "") {
	} else {
	    throw "INTERNAL ERROR";
	};
	this.event = null;
    };

    this.setup = () => { 
	this.reader = new FileReader();
	this.reader.onload = e => { this.react ({pin: "onload", data: e})};
	this.reader.onerror = e => { this.react ({pin: "onerror", data: reader}); };
	this.reader.onabort = e => { this.react ({pin: "onabort", data: reader}); };
	kernel.send(this, {pin: "timer start", data: 3000});
	this.reader.readAsText (this.file);
    };
    this.sendStopTimer = () => { kernel.send (this, {pin: "timer stop", data: true})};
    this.sendDisplay = () => { 
	kernel.send (this, {pin: "good", 
			    data: {filename: this.reader.value,
				   contents: this.reader.target.result}})};
    this.sendError = () => { kernel.send (this, {pin: "error", data: "ERROR"})};
    this.sendAbort = () => { kernel.send (this, {pin: "abort", data: "ABORT"})};
    this.sendTimeout = () => { kernel.send (this, {pin: "timeout", data: true})};
    this.saveFile = () => { this.file = this.event.data };
};

