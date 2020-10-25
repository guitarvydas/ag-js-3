function TimeoutTimer (id) {
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

    /* 
       transition[0] == start ball to IDLE (default entry)
       transition[1] == IDLE to TIMING on "start"
       transition[2] == TIMING to IDLE on "stop"
       transition[3] == TIMING to IDLE on "timeout"
       transition[4] == TIMING to TIMING on "start"
       transition[5] == IDLE to IDLE on "stop"
    */

    this.transitionArray = [
	/* 0 */ () => { this.entry = "IDLE"; },
	/* 1 */ () => { this.time = this.event.data; this.entry = "TIMING"; },
        /* 2 */ () => { this.killTimer (); this.entry = "IDLE";},
	/* 3 */ () => { kernel.send(this, {pin: "timeout", data: true}); this.entry = "IDLE";},
	/* 4 */ () => { this.killTimer (); this.entry = "TIMING"; },
	/* 5 */ () => { this.entry = "IDLE"; }
    ];

    this.exitArray = {
	state : "IDLE", code: function () {},
	state : "TIMING", code: function () {}
    };

    this.entryArray {
	state : "IDLE", code: function () { kernel.send (this, {pin: "sync", data: true}); this.state = "IDLE"; },
	state : "TIMING", code: function () { this.startTimer (); this.state = "TIMING"; }
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
	this.event = null;
    };
    
    this.sendTimeout = () => { kernel.send (this, {pin: "timeout", data: true;})};
    this.sendSync = () => { kernel.send (this, {pin: "sync", data: true;}) };
    this.killTimer = () => {};
    this.startTimer = () => { setTimeout, () => { this.react ({pin: "timeout", data: true;})}};

};
