var SERVER = {
	server: new SillyClient(),
	init: function(){
			
			var that = this;

			window.onbeforeunload = function () {
				if(CHAT.myId == CHAT.firstInRoom){
		    		that.server.storeData(CHAT.currentRoom + "_soundObjects", JSON.stringify(DATA.soundObjects));
		    		that.server.sendMessage("/change_host " + JSON.stringify(DATA.mySoundObjects));
				}
    		}
			//this method is called when the server gives your ID
			this.server.on_ready = function(id){
				CHAT.myId = id;
				CHAT.usersList[CHAT.myId] = CHAT.myName;
				CHAT.picturesList[CHAT.myId] = CHAT.myPicture;
				that.server.getRoomInfo(CHAT.currentRoom, that.updateHost);
				that.server.sendMessage("/setimage " + CHAT.myId + " " + CHAT.picturesList[CHAT.myId]);
				that.server.sendMessage("/username "+ CHAT.myId + " " + CHAT.myName);
				CHAT.updateUsersList();
			};
			//this method receives messages from other users (author_id is an unique identifier per user)
			this.server.on_message = function( author_id, msg ){
				var commandParams = msg.split(" ");
				if(CHAT.checkCommand(author_id, msg)){
					document.getElementById("chat-row").style.display = "block";
					document.getElementById("chat-icon").style.display = "none";
					CHAT.manageMessage(msg, author_id);
				}
			};

			//this method is called when a new user is connected
			this.server.on_user_connected = function(msg){
				var id = msg.split("user_")[0];
				that.server.sendMessage("/setimage " + CHAT.myId + " " + CHAT.picturesList[CHAT.myId],[id]);
			    that.server.sendMessage("/username "+ CHAT.myId + " " + CHAT.usersList[CHAT.myId],[id]);
			    if(CHAT.myId == CHAT.firstInRoom)
			    	that.server.sendMessage("Welcome! I'm the room owner", [id]);
			};

			//this method is called when a user leaves the room
			this.server.on_user_disconnected = function(msg){
			    var id = msg.split("user_")[0];
			    if(CHAT.firstInRoom == id){
			    	that.server.getRoomInfo(CHAT.currentRoom, 
			    		that.refreshHost);
			    }
				CHAT.removeUser(id);
			};
		},

	updateHost: function(roomInfo){
	    			if(roomInfo.clients.length == 1){
						CHAT.firstInRoom = CHAT.myId.toString();
						SERVER.server.loadData(CHAT.currentRoom + "_soundObjects", SERVER.getSceneData);
	    			}
					else if(roomInfo.clients.length > 1){
						CHAT.firstInRoom = roomInfo.clients[0].toString();
						SERVER.server.sendMessage("/getscene " + CHAT.myId,[CHAT.firstInRoom]);
					}
	    		},
	refreshHost: function(roomInfo){
					if(roomInfo.clients.length == 1)
						CHAT.firstInRoom = CHAT.myId.toString();
					else if(roomInfo.clients.length > 1)
						CHAT.firstInRoom = roomInfo.clients[0].toString();
					if(CHAT.firstInRoom == CHAT.myId)
						DATA.mySoundObjects = DATA.mySoundObjects.concat(DATA.hostObjects);
				},

	getSceneData: function(data){
					if(typeof(data) != typeof(undefined))
						SERVER.loadScene(data, CHAT.myId);
				},

	loadScene: function(_objects, id){
					var objects = JSON.parse(_objects);
					for(var i = 0; i < objects.length; i++){
						DATA.insert(objects[i].type, id, objects[i].radius, objects[i].pitch, objects[i].angle);
					}
				},

	updateUser: function(author_id,_soundObjects){
					if(author_id == CHAT.firstInRoom)
						this.loadScene(_soundObjects, author_id);
				}
};