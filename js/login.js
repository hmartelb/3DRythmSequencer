var loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", function(){
	var loginName = document.getElementById("login-name").value;
	var roomName = document.getElementById("login-room").value;
	if(loginName != "" && !loginName.includes(" ") && roomName != ""){
		APP.init();
	} else {
		document.getElementById("login-warning").style.display = "block";
	}
});