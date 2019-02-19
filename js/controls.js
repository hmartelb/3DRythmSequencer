var CONTROLS = {

	iconList: { 
		clearIcon: {},
		redoIcon: {},
		undoIcon: {},
		metroIcon: {},
		noteIcon: {},
		kickIcon: {},
		clapIcon:{},
		hihatIcon: {},
	},

	radiusSelector: {},
	noteSelector: {},
	notes: ["c","d","e","f","g","a","b"],
	
	init: function(){
		// Interface Icons
		this.iconList.clearIcon = document.getElementById("clear-icon");
		this.iconList.clearIcon.addEventListener('click', this.onAction.bind(this, "clear"));
		this.iconList.undoIcon = document.getElementById("undo-icon");
		this.iconList.undoIcon.addEventListener('click', this.onAction.bind( this, "undo" ));
		this.iconList.metroIcon = document.getElementById("metronome-icon");
		this.iconList.metroIcon.addEventListener('click', this.onAction.bind( this, "metro" ));
		this.iconList.noteIcon = document.getElementById("note-icon");
		this.iconList.noteIcon.addEventListener('click', this.onAction.bind( this, "addNote" ));
		this.iconList.kickIcon = document.getElementById("kick-icon");
		this.iconList.kickIcon.addEventListener('click', this.onAction.bind( this, "addKick" ));
		this.iconList.clapIcon = document.getElementById("clap-icon");
		this.iconList.clapIcon.addEventListener('click', this.onAction.bind( this, "addSnare" ));
		this.iconList.hihatIcon = document.getElementById("hihat-icon");
		this.iconList.hihatIcon.addEventListener('click', this.onAction.bind( this, "addHiHat" ));

		// Selectors
		this.noteSelector = document.getElementById("note-sel");
		this.radiusSelector = document.getElementById("radius-sel");

		//Icons container
		this.iconContainer = document.getElementById("icons-container");
		this.iconContainer.addEventListener('mouseover', this.onAction.bind(this, "disable"));

		//Canvas container
		this.canvasContainer = document.getElementById('mycanvas');
		this.canvasContainer.addEventListener('mouseover', this.onAction.bind(this, "enable"));

		//Chat container
		this.chatContainer = document.getElementById("chat-container");
		this.chatContainer.addEventListener('mouseover', this.onAction.bind(this, "disable"));		
	},

	getPitch: function(){
		return 0; ///
	},

	getNote: function(){
		return this.noteSelector.value;
	},

	getNoteIndex: function(){
		return this.notes.indexOf(this.getNote());
	},

	getRadius: function(){
		return this.radiusSelector.value;
	},

	onAction: function( action ){
		switch(action){
			case "addNote":
				DATA.insert("note_" + this.getNote(), CHAT.myId, this.getRadius());
				break;
			case "addKick":
				DATA.insert("kick", CHAT.myId, this.getRadius());
				break;
			case "addSnare":
				DATA.insert("snare", CHAT.myId, this.getRadius());
				break;
			case "addHiHat":
				DATA.insert("hihat", CHAT.myId, this.getRadius());
				break;
			case "clear":
				DATA.clear();
				break;
			case "metro":
				AUDIO.metronome.setActive( !AUDIO.metronome.isActive );
				break;
			case "undo":
				DATA.removeLast();
				break;
			case "enable":
				SCENE.orbit.enabled = true;
				break;
			case "disable":
				SCENE.orbit.enabled = false;
				break;
			default: 
				break;
		}
	},

	update: function(){
		// Clear & Undo Icons
		if(DATA.mySoundObjects.length > 0){
			this.iconList.clearIcon.src = "img/cancel-icon.png";
			this.iconList.undoIcon.src = "img/undo-arrow.png";
		} else {
			this.iconList.clearIcon.src = "img/cancel-icon_inactive.png";
			this.iconList.undoIcon.src = "img/undo-arrow_inactive.png";
		}
		// Metro Icon
		if(AUDIO.metronome.isActive) this.iconList.metroIcon.src = "img/metronome.png";
		else this.iconList.metroIcon.src = "img/metronome_inactive.png";
	},
}