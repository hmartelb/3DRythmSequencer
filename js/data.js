var DATA = {
	
	currentAngle: {},
	anglesList: {},
	delta: {},
	tempo: {},
	loopLength: {},
	subdivision: {},

	soundObjects: [],
	mySoundObjects: [],
	hostObjects:[],
	objCounter: {}, 

	init: function(){
		this.currentAngle = 0;
		this.tempo = 90;
		this.loopLength = 16;
		this.subdivision = 2;
		this.anglesList = this.anglesInLoop(0, 2*Math.PI);
		this.delta = this.tempoToFrequency(this.tempo)* 2*Math.PI;
		this.objCounter = 0;
		this.initialTime = performance.now(); 
	},

	update: function(){
		this.newTime = performance.now();
		for (var i = 0; i < this.anglesList.length; i++) {
			if(this.areClose(this.currentAngle, this.anglesList[i], this.delta/120)){
				AUDIO.metronome.setTimes(i/this.subdivision);
				if(i%this.subdivision == 0) AUDIO.metronome.tick();
				this.checkEvents(this.anglesList[i]);
				break;
			}
		}
		this.incrementAngle( this.delta * (this.newTime - this.initialTime)/1000);
		this.initialTime = this.newTime;
	},

	//////////////////////////////////////////////////////////////

	anglesInLoop: function(min, max){
		var angles = [];
		var inc = (max-min)/(this.loopLength*this.subdivision);
		for (var i = min; i < max; i+= inc) {
	    	angles.push(i);
		}
		return angles;
	},

	areClose: function(value1, value2, threshold){
		var mod = 2*Math.PI;
		value1 %= mod;
		value2 %= mod;
		var diff = Math.abs(Math.abs(value1) - Math.abs(value2));
		return diff < threshold || diff > mod-threshold; 
	},

	checkEvents: function(angle){
		for(var i = 0; i < this.soundObjects.length; i++){
			if(this.soundObjects[i].angle == angle){
				this.soundObjects[i].play();
			}
		}
	},

	clear: function(){
		while(this.mySoundObjects.length > 0){
			this.removeLast();
		}
	},

	findClosestAngle: function(){
		var diff = [];
		var min = 2*Math.PI;
		var index;
		for (var i = 0; i < this.anglesList.length; i++) {
			var value = Math.abs(this.anglesList[i] - this.currentAngle);
			diff.push(value);
			if(value < min){
				min = value;
				index = i;
			}
		}
		return this.anglesList[index];
	},

	incrementAngle: function( delta ){
		this.currentAngle += delta;
		this.currentAngle %= (2*Math.PI);
	},

	insert: function( type, id, radius, pitch, angle){
		if(pitch == undefined) pitch = 0;
		var key = id + type + this.objCounter;

		if(typeof(angle) != typeof(undefined))
			var soundObj = new SoundObject(angle, radius, type, key, pitch);
		else var soundObj = new SoundObject(this.findClosestAngle(), radius, type, key, pitch); 
		if(CHAT.myId == id)
			SERVER.server.sendMessage("/insert_sound " + JSON.stringify(soundObj));
		if(id == CHAT.myId) this.mySoundObjects.push( soundObj );
		this.soundObjects.push( soundObj );
		SCENE.insert(soundObj.angle, radius, type, soundObj.key);
		this.objCounter++;
	},

	remove: function( obj , id ){
		var index = -1;
		for(var i = 0; i < this.soundObjects.length; i++){
			if(this.soundObjects[i].key == obj.key){
				index = i;
				break;
			}
		}
		if(index > -1){ this.soundObjects.splice(index, 1); } // Remove the element
		if(id == CHAT.myId){ 
			var myIndex = this.mySoundObjects.indexOf( obj ); 
			this.mySoundObjects.splice( myIndex, 1);
		}
		// External calls to remove
		SCENE.remove(obj);
		this.objCounter--;
	},

	removeLast: function(){
		var len = this.mySoundObjects.length;
		if(len > 0){
			var obj = this.mySoundObjects[len-1];
			SERVER.server.sendMessage("/remove_sound " + JSON.stringify(obj));
			this.remove(obj, CHAT.myId);
		}
	},

	tempoToFrequency: function( tempo ){
		return tempo/(60 * this.loopLength);
	}, 
};