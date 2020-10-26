function Wire (wobject) {
    this.sender = wobject.sender;
    this.receivers = wobject.receivers;
    this.isNC = wobject.isNC;
    this.senderPin = wobject.senderPin;
    this.lockReceivers = function () { // implement if using multi-tasking or bare-metal
	// disable preemption
	// this.receivers.forEach (lock);
	// enable preemption
    };
    this.unlockReceivers = function () { // implement if using multi-tasking or bare-metal
	// disable preemption
	// this.receivers.forEach (unlock);
	// enable preemption
    };
    this.deliver = function (data) {
	if (this.isNC) {
	    console.log("Part " + sender.name + " outputs " + data + " on pin " + senderPin);
	} else {
	    this.lockReceivers ();
	    this.receivers.forEach(
		function (r) {
		    var pin = r.pin;
		    r.part.inputQueue.push ( {pin, data} );
		})
	    this.unlockReceivers ();
	}
    };
};

function Kernel () {
    this.topPart = null;
    this.allParts = [];
    this.findWire = function (schematic, senderPart, senderPin) {
	var i;
	for (i = 0; i < schematic.wires.length ; i += 1) {
	    var sender = schematic.wires[i].sender;
	    if (sender.part == senderPart && sender.pin == senderPin) {
		return schematic.wires[i];
	    }
	}
	throw "can't find wire for {" + senderPart.name + ", " + senderPin + "} in " + schematic.name;
    };
    
    this.send = function (part, outputEvent) {
	var outputPin = outputEvent.pin; 
	var outputData = outputEvent.data;
	var parentSchematic = part.parent;
	var outputWire = this.findWire (part.parent, part, outputPin);
	outputWire.deliver (outputData);
    };
    
    this.io = function () {
	this.dispatch ();
    };

    this.dispatch = function () {
	while (this.topPart.hasInputs()) {
	    this.topPart.consumeOneEventIfReady();
	}
    };

    this.debug = function (part, event) {
	if (part.state) {
	    console.log (part.name + " [" + part.state + "] <-- " + event.pin);
	} else {
	    console.log (part.name + " <-- " + event.pin);
	}
    };

    this.initilialize = (topPart) => { this.top = topPart; };
};


