var clientId = null;
var contId = null;

var currUser = null;

var eventListeners = [];
var binaryListener = null;

var pollerId = Math.random();
/*
function notifyEventListeners(data){
	$.each(eventListeners, function(idx, listener) {

		try{

			if(Array.isArray(data)){

				$.each(data,function(idx, event){
					if (listener.unitId && listener.unitId !== event.unitId) {
						return;
					}

					if (listener.type	&& listener.type !== event.type) {
						return;
					}

					listener.cb(event);	
				});

			}else{
				var event = data;

				if (listener.unitId && listener.unitId !== event.unitId) {
					return;
				}

				if (listener.type	&& listener.type !== event.type) {
					return;
				}

				listener.cb(event);	
			}
		}catch(e){
			console.log(e.stack);
		}
	});
}

var updatesSocket = null;

function reconnectUpdates(){

	var wsPrefix = "ws:";

	if(window.location.protocol === "https:"){
		wsPrefix = "wss:";
	}

	updatesSocket = new WebSocket(wsPrefix+"//"+location.host+"/async","relay_protocol");

	updatesSocket.binaryType = "arraybuffer";

	updatesSocket.onmessage = function (event) {

		if(event.data instanceof ArrayBuffer){
			if(binaryListener){
				binaryListener(event.data);
			}
		}else{

			var data = JSON.parse(event.data);

			notifyEventListeners(data);

		}
	};	

	updatesSocket.onopen = function (event) {
		console.log("Opened updates websocket "+event);
		if(clientId){
			updatesSocket.send(JSON.stringify({clientId:clientId+"_"+pollerId}));
		}
	};

	updatesSocket.onerror = function(){

		//setTimeout(reconnectUpdates, 2000);

	};

	updatesSocket.onclose = function(){

		setTimeout(reconnectUpdates, 2000);

	};
}

if(!useProxy){

	reconnectUpdates();

}else{

	$(document).ready(function(){

		$(".icon-cloud > span").css("background-position","-940px -275px");

	});

}

//proxy polling

var proxyEventListeners = {};

var currProxyAjax = null, currContAjax = null;

var relaySocket = null;


setInterval(function(){

	for(var reqId in proxyEventListeners){
		try{
			var handler = proxyEventListeners[reqId];

			var ts = parseInt(reqId.split("_")[1]);

			if(new Date().getTime() - ts > 10000){
				delete proxyEventListeners[reqId];
				if(handler.onFailure){
					showMessageDialog(nls.string1 || "Error", nls.string26 || "Failed to load data", function(){
						logout();
					});
					handler.onFailure();
				}	
			}

		}catch(e){

		}

	}

},10000);

function reconnectRelay(){
	var wsPrefix = "ws:";

	if(window.location.protocol === "https:"){
		wsPrefix = "wss:";
	}
	relaySocket = new WebSocket(wsPrefix+"//"+PROXY_ADDRESS+"/client_relay","relay_protocol");

	relaySocket.onopen = function (event) {
		console.log("Opened websocket "+event); 
	};

	relaySocket.onerror = function(){

		//setTimeout(reconnectRelay, 1000);

	};

	relaySocket.onclose = function(){

		setTimeout(reconnectRelay, 1000);

	};

	relaySocket.onmessage = function (event) {

		var data = JSON.parse(event.data);

		if(data.async){
			notifyEventListeners(data);
			return;
		}

		var requestHandler = proxyEventListeners[data.url + "_" + data.requestId];

		if(requestHandler){

			try{
				var dataObj = JSON.parse(data.data);
				requestHandler.onSuccess(dataObj);
			}catch(err){
				requestHandler.onSuccess(data.data);
			}

			delete proxyEventListeners[data.url + "_" + data.requestId];
		}

	};

}

reconnectRelay();
*/

function login(user, pass, onSuccess, onFailure) {
	get("/auth/login?user=" + user + "&pass=" + pass, function(user){
		//contId = user.controllers[0];
		//clientId = user.login;
		//currUser = user;
		//if(user.role !== "ADMIN"){
		//	hideAdminOptions();
		//}
		onSuccess(user);

	}, onFailure);
}


/* function sendStrings(content, onSuccess, onFailure) {
	post("/configuration/sendStrings", content, onSuccess, onFailure);
} */

/* function getHolidays(onSuccess, onFailure) {
	get("/configuration/getHolidays", onSuccess, onFailure);
}
 */
function editUser(user, onSuccess, onFailure) {
	post("/auth/updateUser", user, onSuccess, onFailure);
}

function authLogout(onSuccess, onFailure) {
	get("/auth/logout", onSuccess, onFailure);
}

function getUser(id, onSuccess, onFailure) {
	get("/auth/getUser?id=" + id, onSuccess, onFailure);
}

function getUsers(onSuccess, onFailure) {
	get("/auth/getUsers", onSuccess, onFailure);
}

function checkLoginExists(user, onSuccess, onFailure) {
	get("/auth/checkLoginExists?user=" + user, onSuccess, onFailure);
}

function register(userObj, passwordStr, onSuccess, onFailure){
	post("/auth/register", { user: userObj, password: passwordStr }, onSuccess, onFailure);
}

//	Posts

function addPost(postObj, image, onSuccess, onFailure) {
	post("/posts/addPost", {}, onSuccess, onFailure);
}

//energy config
/* function getConfig(onSuccess, onFailure) {
	get("/configuration/getConfig", onSuccess,
			onFailure);
}

function saveConfig(config, onSuccess, onFailure) {
	post("/configuration/saveConfig", config, onSuccess,
			onFailure);
}

function internetStatus(onSuccess, onFailure) {
	get("/configuration/internetStatus", onSuccess,
			onFailure);
}

function scanWIFI(onSuccess, onFailure) {
	get("/configuration/scanWIFI", onSuccess,
			onFailure);
}
 */

//rooms
/* function getRooms(onSuccess, onFailure) {
	get("/rooms/listRooms", onSuccess, onFailure);
}

function getRoom(id, onSuccess, onFailure) {
	get("/rooms/getRoomByID?id=" + id, onSuccess, onFailure);
}

function addRoom(room, onSuccess, onFailure) {
	post("/rooms/addRoom", room, onSuccess, onFailure);
}

function editRoom(room, onSuccess, onFailure) {
	post("/rooms/editRoom", room, onSuccess, onFailure);
}

function deleteRoom(id, onSuccess, onFailure) {
	get("/rooms/deleteRoom?id=" + id, onSuccess, onFailure);
}

function getGroups(onSuccess, onFailure) {
	get("/groups/listGroups", onSuccess, onFailure);
}

function getGroup(id, onSuccess, onFailure) {
	get("/groups/getGroupByID?id=" + id, onSuccess, onFailure);
}

function addGroup(group, onSuccess, onFailure) {
	post("/groups/addGroup", group, onSuccess, onFailure);
}

function editGroup(group, onSuccess, onFailure) {
	post("/groups/editGroup", group, onSuccess, onFailure);
}

function deleteGroup(id, onSuccess, onFailure) {
	get("/groups/deleteGroup?id=" + id, onSuccess, onFailure);
}

//units
function getUnits(onSuccess, onFailure) {
	get("/units/listUnits", onSuccess, onFailure);
}

function getUnit(id, onSuccess, onFailure) {
	get("/units/getUnitByID?id=" + id, onSuccess, onFailure);
}

function addUnit(unit, onSuccess, onFailure) {
	post("/units/addUnit", unit, onSuccess, onFailure);
}

function cancelAddUnit(data, onSuccess, onFailure){
	post("/units/cancelAddUnit", data, onSuccess, onFailure);
}

function editUnit(unit, onSuccess, onFailure) {
	post("/units/editUnit", unit, onSuccess, onFailure);
}

function deleteUnit(unit, onSuccess, onFailure) {
	post("/units/deleteUnit", unit, onSuccess, onFailure);
}

function forceRemoveUnit(unit, onSuccess, onFailure) {
	post("/units/forceRemoveUnit", unit, onSuccess, onFailure);
}

function getUnitGroups(unitId, onSuccess, onFailure){
	get("/units/getUnitGroups?unitId="+unitId, onSuccess, onFailure);
}

function getAllUnitGroups(onSuccess, onFailure){
	get("/groups/getAllUnitGroups", onSuccess, onFailure);
}

//scenarios
function getScenarios(onSuccess, onFailure) {
	get("/scenarios/listScenarios", onSuccess, onFailure);
}

function getScenario(id, onSuccess, onFailure) {
	get("/scenarios/getScenarioByID?id=" + id, onSuccess, onFailure);
}

function addScenario(scenario, onSuccess, onFailure) {
	post("/scenarios/addScenario", scenario, onSuccess, onFailure);
}

function editScenario(scenario, onSuccess, onFailure) {
	post("/scenarios/editScenario", scenario, onSuccess, onFailure);
}

function deleteScenario(id, onSuccess, onFailure) {
	get("/scenarios/deleteScenario?id=" + id, onSuccess, onFailure);
}

function activateScenario(id, activate, onSuccess, onFailure) {
	get("/scenarios/activateScenario?id=" + id+"&activate="+activate, onSuccess, onFailure);
}

function runScenario(id, onSuccess, onFailure) {
	get("/scenarios/runScenario?id="+id, onSuccess, onFailure);
}

function getUnitScenarios(unitId, onSuccess, onFailure){
	get("/scenarios/getUnitScenarios?unitId="+unitId, onSuccess, onFailure);
}

//units actions
function sendActionToUnit(settings, onSuccess, onFailure) {
	post("/units/action", settings, onSuccess, onFailure);
}

function remindPassword(login, onSuccess, onFailure){
	get("/configuration/remindPassword?login="+login, onSuccess, onFailure);
}

//settings actions
function updateZwaveNetwork(onSuccess, onFailure) {
	get("/configuration/updateZwaveNetwork", onSuccess, onFailure);
}

function resetZwaveNetwork(onSuccess, onFailure) {
	get("/configuration/resetZwaveNetwork", onSuccess, onFailure);
}


function addControllerEventListener(listener) {
	eventListeners.push(listener);
}

function removeControllerEventListener(listener) {
	eventListeners.splice(eventListeners.indexOf(listener, 1));
}

function removeAllListeners(){
	eventListeners = [];
	binaryListener = null;
}
 */

function post(url, data, onSuccess, onFailure, contentType, sync, direct) {

	var async = true;
	if (sync === true) {
		async = false;
	}

	if (url.indexOf("?") >= 0) {
		url += "&pc=" + new Date().getTime();
	} else {
		url += "?pc=" + new Date().getTime();
	}

	url += "&poller="+pollerId;

	$.ajax({
		url : url,
		data : data ? JSON.stringify(data) : null,
				contentType : contentType || 'application/json',
				type : 'POST',
				async : async,
				success : function(data) {
					onSuccess(data);
				},
				error : function(error) {

					if(error.status === 401){
						if(window.location.pathname.indexOf("login.html") < 0){
							window.location = "/login.html";
						}
					}

					if (onFailure) {
						onFailure(error);
					}
				}

	});
}

function get(url, onSuccess, onFailure, sync) {
    
	var async = true;
	if (sync === true) {
		async = false;
	}

	if (url.indexOf("?") >= 0) {
		url += "&pc=" + (new Date().getTime());
	} else {
		url += "?pc=" + (new Date().getTime());
	}

    url += "&poller="+pollerId;

	return $.ajax({
		url : url,
		contentType : 'application/json',
		dataType : "json",
		type : 'GET',
		async : async,
		success : function(data) {
			onSuccess(data);
		},
		error : function(error) {

			if(error.status === 401){
				if(window.location.pathname.indexOf("login.html") < 0){
					window.location = "/login.html";
				}
            }
            
			if (onFailure) {
				onFailure(error);
			}
		}
	});
}