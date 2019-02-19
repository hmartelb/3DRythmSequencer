var CHAT = {
	//global variables
	myId: "",
	myName: "",
	roomsHistory: [],
	currentRoom: "",
	firstInRoom: "",
	usersList: {},
	picturesList: {},
	myPicture: "img/default.png",
	commands: ["/username", "/setimage", "/getscene", "/update_user", "/insert_sound", "/remove_sound", "/change_host", "/predefined_scene"],
	notificationSound: new Audio("sound/MSN_alert.mp3"),
	playSounds: true,
	chat: document.getElementById("chat-row"),
	logged: false,

	init: 	function(){
				var that = this;
				// Login
				this.onLoginClick();
				
				var chatIconButton = document.getElementById("chat-icon")
				
				chatIconButton.addEventListener("click", function(){
					this.style.display = "none";
					that.chat.style.display = "block";
				});

				var minusButton = document.getElementById("minus-button");
				
				minusButton.addEventListener("click", function(){
					$("#edit-users-button").popover("hide");
					$("#edit-nickname-button").popover("hide");
					that.chat.style.display = "none";
					chatIconButton.style.display = "block";
				});

				minusButton.addEventListener("mouseout", function(){
					this.style='color:\'\'';
				});
				
				minusButton.addEventListener("mouseover", function(){
					this.style='cursor:pointer; color:#13c8d9';
				});

				var sendButton = document.getElementById("send-button");
				
				sendButton.addEventListener("click", function(){
					that.sendMsg();
					});

				var textInput = document.getElementById("text-input");
				
				textInput.addEventListener("keyup", function(e){
					if(e.keyCode == 13){
						that.sendMsg();
					}
				});

				var listButton = document.getElementById("list-button");

				listButton.addEventListener("click", function(){
					this.className == "glyphicon glyphicon-th-list pull-right"? that.showConnectedUsers(this):that.hideConnectedUsers(this);
				});

				listButton.addEventListener("mouseover", function(){
					this.style = "cursor:pointer; color: #13c8d9";
				});

				listButton.addEventListener("mouseout", function(){
					this.style = "color: ''";
				});

				var soundOnButton = document.getElementById("sound-on-button");
				
				soundOnButton.addEventListener("click", function(){
					that.playSounds = false;
					this.style.display = "none";
					document.getElementById("sound-mute-button").style.display = "inline-block";
				});

				soundOnButton.addEventListener("mouseover", function(){
					$(this).addClass("buttonColor");
				});

				soundOnButton.addEventListener("mouseout", function(){
					$(this).css("color","");
				});

				var soundMuteButton = document.getElementById("sound-mute-button");
				
				soundMuteButton.addEventListener("click", function(){
					that.playSounds = true;
					this.style.display = "none";
					document.getElementById("sound-on-button").style = "display:inline-block;";
				});

				soundMuteButton.addEventListener("mouseover", function(){
					$(this).addClass("buttonColor");
				});

				soundMuteButton.addEventListener("mouseout", function(){
					$(this).css("color", "");
				});

				var editRoomsButton = document.getElementById("edit-rooms-button");
				$("#edit-rooms-button").addClass("buttonColor");
				
				var newRoom = '<input id="room-input" type="text"><button type="button" id="rooms-submit" onclick="CHAT.joinRoom(\'room-input\'); CHAT.hidePopover(\'#edit-rooms-button\');" class="btn btn-default">Ok</button> <button type="button" style="width:60%" onclick="CHAT.hidePopover(\'#edit-rooms-button\');" class="btn btn-default">Cancel</button>';
				
				$(editRoomsButton).popover({title: 'Join a new chatroom:', trigger:"manual", content:newRoom, html:true });
				
				editRoomsButton.addEventListener("click", function(){
					$("#edit-users-button").popover("hide");
					$("#edit-nickname-button").popover("hide");
					$(this).popover("show");
				});
				
				editRoomsButton.addEventListener("mouseout", function(){
					this.style='color:\'\'';
				});
				
				editRoomsButton.addEventListener("mouseover", function(){
					this.style='cursor:pointer; color:#13c8d9';
				});
		},

	//entering a room on login screen...

	onLoginClick: function(){			
					var loginName = document.getElementById("login-name").value;
					var loginRoom = document.getElementById("login-room").value;
					this.createRoom(loginRoom);
					this.myName = loginName;
					document.getElementById("UI-container").style.display = "block";
					document.getElementById("mycanvas").style.display = "block";
					document.getElementById("chat-icon").style.display = "block";
					document.getElementById("login-row").style.display = "none";
				},

	//function that checks if messages are commands...

	checkCommand: function(author_id, msg){
						var commandParams = msg.split(" ");
						if(this.commands.indexOf(commandParams[0].split("\n")[0]) < 0)
							return true;
						this.runCommand(author_id, commandParams);
						return false;
					},

	//if they are commands, then run them
	runCommand: function(author_id, commandParams){
					switch(commandParams[0]){
						case "/username":
							if(commandParams.length == 3)
								this.setName(author_id, commandParams[1], commandParams[2]);
							break;
						case "/setimage":
							if(commandParams.length == 3)
								this.setImage(author_id, commandParams[1], commandParams[2]);
							break;
						case "/update_user":
							if(commandParams.length == 2)
								SERVER.updateUser(author_id, commandParams[1]);
							break;
						case "/getscene":
							if(commandParams.length == 2){
								if(this.myId == this.firstInRoom){
									SERVER.server.sendMessage("/update_user " + JSON.stringify(DATA.soundObjects), [commandParams[1]]);
								}
							}
							break;
						case "/insert_sound":
							if(commandParams.length == 2){
								var soundObject = JSON.parse(commandParams[1]);
								DATA.insert(soundObject.type, author_id, soundObject.radius, soundObject.pitch, soundObject.angle);
							}
							break;
						case "/remove_sound":
							if(commandParams.length == 2){
								var soundObject = JSON.parse(commandParams[1]);
								DATA.remove(soundObject, author_id);
							}
							break;
						case "/change_host":
							if(commandParams.length == 2){
								DATA.hostObjects = JSON.parse(commandParams[1]);
							}
							break;
						case "/predefined_scene":
							if(CHAT.firstInRoom == CHAT.myId && commandParams.length == 2){
								SERVER.server.loadData(commandParams[1], function(data){
									SERVER.loadScene(data, CHAT.myId);
								});
							}
							break;
						default:
							return;
					}
				},

	setName: function(author_id, id, name){
					if(id == "me")
						id = this.myId;
					if( id == author_id ){
						SERVER.server.sendMessage("/username "+id +" "+name);
						this.usersList[id] = name.split("\n")[0];
						this.updateUsersList();
					}
				},

	setImage: function(author_id, id, url){
					if(id == "me")
						id = this.myId;
					if( id == author_id){
						SERVER.server.sendMessage("/setimage "+id +" "+ url);
						this.picturesList[id] = url.split("\n")[0];
						this.updateUsersList();
					}
				},

	//functions for managing right column bar (connected users list)

	showConnectedUsers: function(button){
							button.className = "glyphicon glyphicon-remove pull-right buttonColor";
							document.getElementById("right-row").style = "display:block";
							document.getElementById("roombox").style = "border-top-right-radius: 0px;"
						},

	hideConnectedUsers: function(button){
							$("#edit-nickname-button").popover("hide");
							$("#edit-users-button").popover("hide");
							button.className = "glyphicon glyphicon-th-list pull-right";
							document.getElementById("right-row").style = "display:none";
							document.getElementById("roombox").style = "border-top-right-radius: 5px;"
						},

	updateUsersList: function(){
						var keys = Object.keys(this.usersList);
						var connectedList = document.getElementById("user-list");
						while(connectedList.hasChildNodes())
							connectedList.removeChild(connectedList.childNodes[0]);
						this.appendUsers(this.myId, true);
						for (i = 0; i < keys.length; i++){
							if(this.myId != keys[i])
								this.appendUsers(keys[i], false);
						}
					},

	appendUsers: function(id, yourself){
		var connectedList = document.getElementById("user-list");
		var connectedElement = document.createElement("li")
		connectedElement.className = "connected-element";
		var userDiv = document.createElement("div");
		var userImg = document.createElement("img");
		var userName = document.createElement("h3");
		
	    connectedElement.id = "user-display-"+id;
	    
	    userImg.src = this.picturesList[id];
	    if(yourself){
	    	userName.id = "edit-nickname-button"
	    	userName.style = "padding-left: 3%; font-weight: 800"; 
	    	userName.innerText = this.usersList[id];
	    	var newName = '<input style="width:90%" id="name-input" type="text"></br><button type="button" id="name-submit" style="width:30%;" onclick="CHAT.hidePopover(\'#edit-nickname-button\');CHAT.editUserName(\'name-input\'); " class="btn btn-default">Ok</button> <button type="button" style="width:55%;" onclick="CHAT.hidePopover(\'#edit-nickname-button\');" class="btn btn-default">Cancel</button>';
	    	$(userName).popover({ title: 'Edit your username:', container: 'body', placement:"left",trigger:"manual", content:newName, html:true });
	    	userName.addEventListener("mouseover", function(){
	    		this.style = "color: grey; padding-left: 3%; font-weight: 800; cursor:pointer;"
	    	});
	    	userName.addEventListener("mouseout", function(){
	    		this.style = "color: black; padding-left: 3%; font-weight: 800; cursor:pointer;"
	    	});
	    	userName.addEventListener("click", function(){
	    		$("#edit-rooms-button").popover("hide");
	    		$("#edit-users-button").popover("hide");
	    		$(this).popover("show");
	    	});
	    	var editPicture = document.createElement("span");
	    	editPicture.style = "text-decoration: none;"
	    	editPicture.className = "glyphicon glyphicon-picture buttonColor";
	    	editPicture.id = "edit-users-button";
	    	
	    	editPicture.addEventListener("click", function(){
	    		$("#edit-rooms-button").popover("hide");
	    		$("#edit-nickname-button").popover("hide");
	    		$(this).popover("show");
	    	});
	    	var imgUrl = '<input id="photo-input" type="text"></br><button type="button" id="photo-submit" style="width:30%;" onclick="CHAT.hidePopover(\'#edit-users-button\');CHAT.getImageFromURL(\'photo-input\');" class="btn btn-default">Ok</button> <button type="button" style="width:55%" onclick="CHAT.hidePopover(\'#edit-users-button\');" class="btn btn-default">Cancel</button>';
	    	$(editPicture).popover({ title: 'Insert a valid image url:', container: 'body', placement:"left",trigger:"manual", content:imgUrl, html:true });
	    }else{
	    	userName.style = "padding-left:3%; font-weight: 400"
	    	userName.innerText = this.usersList[id];
		}
		userImg.style.maxWidth="50px";
	    userDiv.appendChild(userImg);
	    connectedElement.appendChild(userDiv);
	    connectedElement.appendChild(userName);
	    if(yourself)
	    	connectedElement.appendChild(editPicture);
	    connectedList.appendChild(connectedElement);
	},

	removeUser: function(id){
					$("user-display-"+id).remove();
					delete this.usersList[id];
					this.updateUsersList();
				},

	//functions for popovers..

	editUserName: function(inputId){
						if(document.getElementById(inputId).value != "")
							this.checkCommand(this.myId, "/username "+ this.myId +" "+document.getElementById(inputId).value);
					},

	getImageFromURL: function(inputId){
						if(document.getElementById(inputId).value != ""){
							this.myPicture =  document.getElementById(inputId).value;
							this.checkCommand(this.myId, "/setimage "+ this.myId +" "+ document.getElementById(inputId).value);
						}
					 },

	joinRoom: function(inputId){
					SERVER.server.close();
					SERVER.server = new SillyClient();
					this.createRoom(document.getElementById(inputId).value);
				},

	hidePopover: function(popoverId){
					$(popoverId).popover("hide");
				},

	//functions intended to send and update chat-logs

	sendMsg: function(){
				var textInput = document.getElementById("text-input");
				var inputString = textInput.value;
				textInput.value = "";
				if(inputString != "" && inputString[0] != "\n"){
					if(this.checkCommand(this.myId, inputString)){
						SERVER.server.sendMessage(inputString);
						this.manageMessage(inputString, "myself");
						document.getElementById("text-input").focus();
					}
				}
			},

	manageMessage: function(msg, userType){
		var chatContainer = document.getElementById("chat-logs");
		var user;
		if(userType == "myself"){
			user = {id: userType, cssClass: {msgContainerCss: "chat self", picContainerCss: "user-photo", textInputCss:"chat-message"}, img: this.picturesList[this.myId]};
		}else{
			user =  {id: userType, cssClass: {msgContainerCss: "chat friend", picContainerCss: "user-photo", textInputCss:"chat-message"}, img: this.picturesList[userType]};
			if(this.playSounds){this.notificationSound.play();}
		}
		this.insertMessage(msg, user);
	},

	insertMessage: function(msg, user){
		var chatContainer = document.getElementById("chat-logs");
		var msgContainer = document.createElement("div");
		msgContainer.className = user.cssClass.msgContainerCss;
		var picContainer = document.createElement("div");
		picContainer.className = user.cssClass.picContainerCss;
		var userImage = document.createElement("img");
		userImage.src = user.img;
		userImage.style.maxWidth = "50px";
		var textInput = document.createElement("p");
		textInput.className = user.cssClass.textInputCss;
		textInput.innerText = msg;
		var timestamp = document.createElement("p");
		timestamp.className = "time-stamp";
		if(user.id != "myself") 
			timestamp.innerText = this.usersList[user.id] + " - " + this.getTimeStamp();
		else {
			timestamp.innerText = this.getTimeStamp();
		}
		textInput.appendChild(timestamp);
		picContainer.appendChild(userImage);
		msgContainer.appendChild(picContainer);
		msgContainer.appendChild(textInput);
		chatContainer.appendChild(msgContainer);

		msgContainer.scrollIntoView();
	},

	getTimeStamp: function() {
	    var now = new Date();
	    return ((now.getDate() ) + '/' + 
	    		((now.getMonth() +1 < 10) ? ("0" + (now.getMonth()+1)): ((now.getMonth()+1))) + '/' +
	            now.getFullYear() + " " +
	            now.getHours() + ':' +
	            ((now.getMinutes() < 10) ? ("0" + now.getMinutes()): (now.getMinutes())) );
	},

	//functions for managing rooms...

	createRoom: function(roomName){
	 	if(this.currentRoom != "")
	  		document.getElementById("room-li-" + this.currentRoom).className = "";
	  	this.usersList = {};
	  	this.picturesList = {};
	  	this.myId = "";
		SERVER.server.connect("84.89.136.194:9000", roomName);
		this.currentRoom = roomName.split("\n")[0];
		this.addRoom(roomName);
		document.getElementById("room-title").innerHTML = roomName;
	},

	activeRoom: function(selectedRoom){
					if(this.currentRoom.split("\n")[0] != selectedRoom.innerText.split("\n")[0]){
						document.getElementById("room-li-"+ this.currentRoom.split("\n")[0]).className = "";
						this.currentRoom = selectedRoom.innerText.split("\n")[0];
						$(selectedRoom).addClass("active");
					}
				},

	addRoom: function(name){
				if(this.roomsHistory.indexOf(name) < 0){
					this.roomsHistory.push(name);
					var roomList = document.getElementById("room-list");
					var room = document.createElement("li");
					var roomName = document.createElement("a");
					roomName.href = "#";
					roomName.innerText = name;
					room.id = "room-li-" + name;
					room.setAttribute("data-toggle", "tab");
					room.className = "active"
					$(room).css("margin-left","4%");
					$(room).css("margin-top","2%");
					var lastRoom = document.getElementById("room-li-" + this.currentRoom);
					this.currentRoom = name;
					var chatLogs = document.getElementById("chat-logs");
					while(chatLogs.firstChild){
						chatLogs.removeChild(chatLogs.firstChild);
					}
					if(lastRoom != null){
						lastRoom.className = "";
					}
					room.appendChild(roomName);
					roomList.appendChild(room);
					room.addEventListener("click",function(){
						if(this.currentRoom.split("\n")[0] != this.innerText.split("\n")[0]){
							this.activeRoom(this);
							SERVER.server.close();
							SERVER.server = new SillyClient();
							var chatLogs = document.getElementById("chat-logs");
							while(chatLogs.firstChild){
								chatLogs.removeChild(chatLogs.firstChild);
							}
							this.createRoom(this.innerText.split("\n")[0]);
						}
					});
				}
			}
};