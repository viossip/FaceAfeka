
//var errorLbl = null;

//  Runs when the user clicks the sign in button.
function loginClicked(event){
	//if(errorLbl){
	//	errorLbl.hide();
	//}
	
	var userTxt = $('form input[id=email]');
	var pswTxt = $('form input[id=password]');

	var user = userTxt.val();

	var psw = pswTxt.val();

    event.preventDefault();
    //event.stopPropagation();

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
		var signInStatus = $('.signin-result');
		signInStatus.html("<h4 style='color: red; text-align: center; font-weight: bold;'>" + error.status + " " + error.statusText + "</h4>");
		signInStatus.fadeOut(2000, function() {
			signInStatus.html("");
			signInStatus.fadeIn();
		});
		//if(errorLbl){
		//	errorLbl.show();
		//	return;
		//}
		//errorLbl = $("<div>Login failure</div>").insertAfter(".separator").css('color','red').css('text-align','center').css('font-weight', 'bold');
	});

}

$(document).ready(function() {
    //  Attach event handler to the form (sign in button)
    $('form').submit(loginClicked);

    //  Attach event handler to the register button.
    $('.btn-register').click(function(event) {
		event.preventDefault();
		event.stopPropagation();
		
        window.location = "http://" + window.location.host + "/register";
        console.log(window.location);
    });
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