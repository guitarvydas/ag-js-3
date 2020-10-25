function CallbackLogic (id) {
    // input pins = "file", "timeout"
    // output pins = "good", "error" , "abort", "no response", "timer start", "timer stop"

    // Interim version! This will be upgraded later!
    // In this version, the timer code is moved out of CallbackLogic and into a separate part (TimeoutTimer)
    
    this.parent = null;
    this.id = id;
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

    this.var_timeout;
    
    this.react = function (AGevent) {
	var reader;
	// lots of gory details here
	// we are at the interface between HTML (the O/S) and AG, so there are lots of details, by definition...
	// we are converting HTML events into AG events...
	if (AGevent.pin == "file") {
	    // start the reader, set up callbacks, set timeout
	    // (this is interim code and will be upgraded later, e.g. timer will
	    //  moved to its own component)
	    reader = new FileReader();
	    reader.onload = e => { this.react ({pin: "fileOnload", 
						data: {reader: reader, HTMLevent: e}}); };
	    reader.onerror = e => { this.react ({pin: "fileOnerror", data: reader}); };
	    reader.onabort = e => { this.react ({pin: "fileOnabort", data: reader}); };
	    kernel.send(this, {pin: "timer start", data: 3000});
	    reader.readAsText (AGevent.data);
	} else if (AGevent.pin == "fileOnload") {
	    clearTimeout(this.var_timeout);
	    kernel.send(this, 
			{pin: "good", 
			 data: {filename: AGevent.data.HTMLevent.data, 
				contents: AGevent.data.HTMLevent.target.result}});
	    kernel.io();
	} else if (AGevent.pin == "fileOnerror") {
	    kernel.send(this, {pin: "timer stop", data: true});
	    kernel.send(this, {pin: "error", data: reader});
	    kernel.io();
	} else if (AGevent.pin == "fileOnabort") {
	    kernel.send(this, {pin: "timer stop", data: true});
	    kernel.send(this, {pin: "abort", data: reader});
	    kernel.io();
	} else if (AGevent.pin == "timeout") {
	    kernel.send(this, {pin: "timer stop", data: true});
	    reader && reader.abort ();
	    kernel.send(this, {pin: "no response", data: reader});
	    kernel.io();
	} else {
	    kernel.send(this, {pin: "timer stop", data: true});
	    reader && reader.abort ();
	    kernel.send (this, {pin: "fatal", data: "event not understood by CallbackLogic part: " + AGevent.pin});
	}
    }; // default
};




function CallbackLogic (id) {
    this.parent = null;
    this.id = id;
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
        /* 2 */ () => { this.entry = "WAIT FOR START";},
	/* 3 */ () => { this.display(); this.entry = "IDLE" },
	/* 4 */ () => { this.entry = "WAIT FOR SYNC"; },
	/* 5 */ () => { this.entry = "IDLE"; },
	/* 6 */ () => { this.entry = "IDLE"; },
	/* 7 */ () => { this.entry = "IDLE"; }
    ];

    this.exitArray = {
    };

    this.entryArray {
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
	this.event = AGevent;
	switch (this.state) {
	case "IDLE":
	    switch (AGevent.pin) {
	    case "timer sync": this.transitionFunction (1); break;
	    case "start": this.transitionFunction (4); break;
	    default:
	    };
	    break;
	case "WAIT FOR START":
	    switch (AGevent.pin) {
	    case "start": this.transitionFunction (2); break;	
	    default:
	    };
	case "WAIT FOR SYNC":
	    switch (AGevent.pin) {
	    case "start": this.transitionFunction (5); break;	
	    default:
	    };
	case "WAIT FOR ON":
	    switch (AGevent.pin) {
	    case "onload": this.transitionFunction (3); break;	
	    case "onerror": this.transitionFunction (6); break;
	    case "onabort": this.transitionFunction (7); break;
	    case "timeout": this.transitionFunction (8); break;
	    default:
	    };
	};
	this.event = null;
    };

    this.setup = () => { 
	this.reader = new FileReader();
	this.reader.onload = e => { this.react ({pin: "onload", data: e})};
	this.reader.onerror = e => { this.react ({pin: "onerror", data: reader}); };
	this.reader.onabort = e => { this.react ({pin: "onabort", data: reader}); };
	kernel.send(this, {pin: "timer start", data: 3000});
	this.reader.readAsText (AGevent.data);
    };
    this.sendStopTimer = () => { kernel.send (this, {pin: "timer stop", data: true;})};
    this.sendDisplay = () => { kernel.send (this, {pin: "good", data: {filename: ???, contents: ???}})};
    this.sendError = () => { kernel.send (this, {pin: "error", data: "ERROR";})};
    this.sendAbort = () => { kernel.send (this, {pin: "abort", data: "ABORT";})};
    this.sendTimeout = () => { kernel.send (this, {pin: "timeout", data: true;})};
    
};

