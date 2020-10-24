// inputs: "file descriptor"
// output: none

function Display (id) {
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
	if ("file descriptor" == AGevent.pin) {
	    var filename = AGevent.data.filename;
	    var contents = AGevent.data.contents;
	    var element = document.getElementById(this.id);
	    document.getElementById(this.id).innerHTML =
		"FILE REQUESTED: " + filename +
		"<BR>FILE CONTENTS (example2):<BR>" + contents;
	}
    }; // default

};
