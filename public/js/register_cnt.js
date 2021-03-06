
//  Runs when the user clicks the sign in button.
function registerClicked(event){
    
    var fNameTxt = $('form input[id=firstname]');
    var lNameTxt = $('form input[id=lastname]');
	var loginTxt = $('form input[id=email]');
    var passTxt = $('form input[id=password]');
    var passTxt2 = $('form input[id=password2]');

    var firstname = fNameTxt.val();
    var lastname = lNameTxt.val();
	var userLogin = loginTxt.val();
    var password = passTxt.val();
    var password2 = passTxt2.val();

	event.preventDefault();

    if (!firstname || firstname.length === 0) {
        fNameTxt.attr('placeholder', "Required Field").focus();
		return;
    }

    if (!lastname || lastname.length === 0) {
        lNameTxt.attr('placeholder', "Required Field").focus();
		return;
    }

	if (!userLogin || userLogin.length === 0) {
		loginTxt.attr('placeholder', "Required Field").focus();
		return;
	}

	if (!password || password.length === 0) {
        passTxt.attr('placeholder', "Required Field").focus();
        return;
    }
    
    if (!password2 || password2.length === 0) {
        passTxt2.attr('placeholder', "Required Field").focus();
        return;
	}
    
    if (password !== password2) {
        passTxt.val("");
        passTxt2.val("");
        passTxt.attr('placeholder', "Passwords don't match").focus();
        passTxt2.attr('placeholder', "Passwords don't match").focus();
        return;
    }

	var user = { firstName: firstname, lastName: lastname, login: userLogin };
	
	register(user, password, function(cUser){
		window.location = getUrlParameter("path") || "/";
		
	}, function(error){
		var registerStatus = $('.register-result');
		registerStatus.html("<h4 style='color: red; text-align: center; font-weight: bold;'>" + error.status + " " + error.statusText + "</h4>");
		registerStatus.fadeOut(2000, function() {
			registerStatus.html("");
			registerStatus.fadeIn();
		});
	});

}

$(document).ready(function() {
    $('form').submit(registerClicked);	
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