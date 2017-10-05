var searchResults = [];

$(document).ready(function() {
    navbarRelPath();
    $('.btn-signout').click(function(event) {
        deleteCookie("session");
        authLogout(function() {
            window.location.reload();
        });
    });

    $("#userSearch").on("input", function(event) {
        var searchText = $(this).val();
        searchUserPrefix(searchText, function(userList) {
            searchResults = userList;
            $("#userSearch").autocomplete({
                source: searchResults,
                select: function(event, ui) {
                    window.location = "/profile?id=" + ui.item.id;
                }
            });
        });
    });
});

var deleteCookie = function(name) {
	document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

function navbarRelPath() {
    $(".navbar-nav").find("a").each(function() {
        var elem = $(this);
        var path = elem.attr("href");
        elem.attr("href", window.location.origin + "/" + path);
    });
}

