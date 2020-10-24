function CallbackLogic (id) {
    // input pins = "file"                            // ("timeout" will be added later)
    // output pins = "good", "error" , "abort", "no response", "fatal"

    // Interim version! This will be upgraded later!
    // In this version, the timer code is conflated with the Callbacklogic code,
    //   but, the timer should be a separate part.

    // N.B. note the absence of "throw"... (not needed, throw is just another form of data transfer)
    
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
	    this.var_timeout = setTimeout(
		() => { this.react ({pin: "timeout", data: reader});},
		1000);
	    reader.readAsText (AGevent.data);
	} else if (AGevent.pin == "fileOnload") {
	    clearTimeout(this.var_timeout);
	    kernel.send(this, 
			{pin: "good", 
			 data: {filename: AGevent.data.HTMLevent.data, 
				contents: AGevent.data.HTMLevent.target.result}});
	    kernel.io();
	} else if (AGevent.pin == "fileOnerror") {
	    clearTimeout(this.var_timeout);
	    kernel.send(this, {pin: "error", data: reader});
	    kernel.io();
	} else if (AGevent.pin == "fileOnabort") {
	    clearTimeout(this.var_timeout);
	    kernel.send(this, {pin: "abort", data: reader});
	    kernel.io();
	} else if (AGevent.pin == "timeout") {
	    clearTimeout(this.var_timeout);
	    reader && reader.abort ();
	    kernel.send(this, {pin: "no response", data: reader});
	    kernel.io();
	} else {
	    clearTimeout(this.var_timeout); 
	    reader && reader.abort ();
	    kernel.send (this, {pin: "fatal", data: "event not understood by CallbackLogic part: " + AGevent.pin});
	}
    }; // default
};
