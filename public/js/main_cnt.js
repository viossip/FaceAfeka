$(document).ready(function() {
    navbarRelPath();
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

function navbarRelPath() {
    $(".navbar-nav").find("li").each(function(liElem) {
        var path = liElem.attr("href");
        liElem.attr("href", window.location.origin + path);
    });
}