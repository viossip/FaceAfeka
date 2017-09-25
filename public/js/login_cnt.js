
//var errorLbl = null;

//  Runs when the user clicks the sign in button.
function loginClicked(event){
	//if(errorLbl){
	//	errorLbl.hide();
	//}
	
	var userTxt = $('form input[name=email]');
	var pswTxt = $('form input[name=password]');

	var user = userTxt.val();

	var psw = pswTxt.val();

	event.preventDefault();

	if(!user || user.length === 0){
		userTxt.attr('placeholder', "Required Field").focus();
		return;
	}

	if(!psw || psw.length === 0){
		pswTxt.attr('placeholder', "Required Field").focus();
	}
	
	login(user, psw, function(cUser){
		console.log("Login success!!!");
		window.location = getUrlParameter("path") || "/";
		
	}, function(error){
		console.log("Login error!!!");
		//if(errorLbl){
		//	errorLbl.show();
		//	return;
		//}
		//errorLbl = $("<div>Login failure</div>").insertAfter(".separator").css('color','red').css('text-align','center').css('font-weight', 'bold');
	});

}

$(document).ready(function() {
    $('form').submit(loginClicked);	
});

var getUrlParameter = function(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
	sURLVariables = sPageURL.split('&'),
	sParameterName,
	i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};