function TextComponent_2 (id) {
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

    this.react = function (AGevent) {
	if ('setText' == AGevent.pin) {
	    var data = AGevent.data;
	    document.getElementById(id).innerHTML =
		"FILE REQUESTED: " + data.filename +
		"<BR>FILE CONTENTS (example2):<BR>" + data.content;
	}
    }; // default

};
