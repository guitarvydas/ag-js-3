function TimeoutTimer (parent) {
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

    this.state = "IDLE";
    this.entry = "IDLE";
    this.exit  = "";   

    this.sendSync = function () { kernel.send(this, {pin: "sync", data: true}) );

    /* 
       transition[0] == start ball to IDLE (default entry)
       transition[1] == IDLE to TIMING on "start"
       transition[2] == TIMING to IDLE on "stop"
       transition[3] == TIMING to IDLE on "timeout"
       transition[4] == TIMING to TIMING on "start"
       transition[5] == IDLE to IDLE on "stop"
    */

    this.transitionArray = [
	/* 0 */ () => { this.entry = "IDLE"; this.exit = ""; },
	/* 1 */ () => { this.time = this.event.data; this.entry = "TIMING"; this.exit = "IDLE"; },
        /* 2 */ () => { this.killTimer (); this.exit = "TIMING"; this.entry = "IDLE";},
	/* 3 */ () => { kernel.send(this, {pin: "timeout", data: true}); this.exit = "TIMING";},
	/* 4 */ () => { this.killTimer (); kernel.send (this, {pin: "sync", data: true}); },
	/* 5 */ () => { this.exit = ""; this.entry = "IDLE"; }
    ];

    this.exitArray = {
	state : "IDLE", code: function () {},
	state : "TIMING", code: function () {}
    };

    this.entryArray {
	state : "IDLE", code: function () { kernel.send (this, {pin: "sync", data: true}); this.state = "IDLE"; },
	state : "TIMING", code: function () { this.startTimer (); this.state = "TIMING"; }
    };

    this.transitionFunction = (n) => { this.transitionArray[n] && this.transitionArray[n](); };
    this.exitFunction = () => {this.exitArray[this.exit] && this.exitArray[this.exit](); this.exit = "";};
    this.entryFunction = () => {this.entryArray[this.entry] && this.entryArray[entry](); this.entry = "";};

    this.transitionFunction (0); /* take default transition */
    
    this.react = function (AGevent) {

	this.event = AGevent;
	
	this.exitFunction ();
	this.entryFunction ();

	switch (this.state) {
	case "IDLE":
	    switch (AGevent.pin) {
	    case "start": this.transitionFunction (1); break;
	    case "stop": this.transitionFunction (5); break;
	    default:
	    };
	    break;
	case "TIMING":
	    switch (AGevent.pin) {
	    case "stop": this.transitionFunction (2); break;
	    case "timeout": this.transitionFunction (3); break;
	    case "start": this.transitionFunction (4); break;
	    default:
	    };
	};
	
	this.sendTimeout = () => { kernel.send (this, {pin: "timeout", data: true;})};
	this.sendSync = () => { kernel.send (this, {pin: "sync", data: true;}) };
	this.killTimer = () => {};
	this.startTimer = () => { setTimeout, () => { this.react ({pin: "timeout", data: true;})};