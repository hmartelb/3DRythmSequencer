var AUDIO = {
	
	soundNames: ["kick.mp3", 
				"snare.mp3", 
				"hihat.mp3", 
				"note_a.mp3", 
				"note_b.mp3", 
				"note_c.mp3", 
				"note_d.mp3",
				"note_e.mp3",
				"note_f.mp3",
				"note_g.mp3"],
	sounds: [],
	metronome: {},

	preload: function(){
		for (var i = 0; i < this.soundNames.length; i++) {
			var temp = new Audio('sound/' + this.soundNames[i]);
			this.sounds.push(temp);
		}
	},

	init: function(){
		this.preload();
		this.metronome = new PassiveMetronome("metro-1k.mp3","metro-500.mp3");
		this.metronome.setVolume(0.25);
	},

	getSound: function( type ){
		var i = 0;
		while(this.soundNames[i] != type && i < this.soundNames.length){ i++; }
		return this.sounds[i];
	},

	todB: function(linear, ref){
		return 10*Math.log10(linear/ref);
	},
};

/////////////////////////
// 		METRONOME
/////////////////////////
function PassiveMetronome(firstTick, otherTick){
	this.firstTick = new Audio('sound/' + firstTick);
	this.otherTick = new Audio('sound/' + otherTick);
	this.times = 0;
	this.isActive = true;
}
PassiveMetronome.prototype.reset = function() {
	this.times = 0;
};
PassiveMetronome.prototype.setActive = function(active) {
	this.isActive = active;
};
PassiveMetronome.prototype.setTimes = function(n) {
	this.times = n;
};
PassiveMetronome.prototype.setVolume = function(vol) {
	this.firstTick.volume = vol;
	this.otherTick.volume = vol;
};
PassiveMetronome.prototype.tick = function(timeIndex) {
	if(this.isActive){
		if(timeIndex === undefined) timeIndex = this.times;
		if(timeIndex % 4 == 0) this.firstTick.play();
		else this.otherTick.play();
		this.times++;
	}
};

/////////////////////////
// 		SOUND OBJECT
/////////////////////////
function SoundObject( angle, radius, type, key, pitch ){
	if(key == undefined) key = "default";
	if(pitch == undefined) pitch = 0; 
	
	this.audio = AUDIO.getSound(type + ".mp3");
	this.key = key;
	this.type = type;
	this.setPitch(pitch);
	this.angle = angle;
	this.radius = radius;
	this.setVolumeFromRadius(this.radius);
}
SoundObject.prototype.play = function() {
	this.audio.currentTime = 0;
	this.setVolumeFromRadius(this.radius);
	
	this.audio.play();
};
SoundObject.prototype.playbackFromPitch = function(pitch) {
	var semitoneRatio = Math.pow(2, (pitch/12));
	this.audio.playbackRate = semitoneRatio;
};
SoundObject.prototype.setPitch = function(pitch) {
	this.pitch = pitch;
	this.playbackFromPitch(pitch);
};
SoundObject.prototype.setVolume = function(vol){
	this.audio.volume = vol;
};
SoundObject.prototype.setVolumeFromRadius = function(radius, max) {
	if(max == undefined) max = 100;
	var vol = radius/max;
	this.audio.volume = vol; 
};