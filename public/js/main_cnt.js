$(document).ready(function() {
    $('.btn-signout').click(function(event) {
        deleteCookie("session");
        authLogout(function() {
            window.location.reload();
        });
    });	
});

var deleteCookie = function(name) {
	document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};