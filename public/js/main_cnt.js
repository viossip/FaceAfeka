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
            console.log(JSON.stringify(searchResults));
            if (searchText === "*") {
                $("#userSearch").autocomplete({
                    search: "",
                    minLength: 0,
                    source: searchResults,
                    select: function(event, ui) {
                        window.location = "/profile?id=" + ui.item.id;
                    }
                });
            }
            else {
                $("#userSearch").autocomplete({
                    source: searchResults,
                    select: function(event, ui) {
                        window.location = "/profile?id=" + ui.item.id;
                    }
                });
            }
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

function updateAlbumImages(images) {
    var ulGalleryElem = $(".gallery-parent");
    images.forEach(function(image, index) {
        //  The image name, without path.
        var imageName = image.imagePath.split("/").pop();
        //  If the user is looking at his own photos page, add delete buttons to images.
        if (!userId && window.location.href.split("/").pop() === "photos") {
            ulGalleryElem.append("<li><a href='getImage/" + imageName + "' data-toggle='lightbox' data-parent='.gallery-parent' data-hover='tooltip' data-placement='top'><img src='getImage/" + imageName + "' class='img-thumbnail'></a><button id='albumImage_" + image.id + "'type='button' class='btn btn-danger btn-xs btn-delete-img'>X</button></li>");
            $("#albumImage_" + image.id).click(removeAlbumImageClicked);
        }
        else 
            ulGalleryElem.append("<li><a href='getImage/" + imageName + "' data-toggle='lightbox' data-parent='.gallery-parent' data-hover='tooltip' data-placement='top'><img src='getImage/" + imageName + "' class='img-thumbnail'></a></li>");
        if (images.length-1 === index)
            lightboxSetup();
    });
}

function lightboxSetup() {
    $(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });

    $(function () {
        $('[data-hover="tooltip"]').tooltip();
    });
}

//  Retrieves friends from backend and inserts them to the friends box.
function updateUserFriends(userId) {
    getUserFriends(userId, function(friends) {
        //  Empty the ui friends list
        var friendListElement = $("#friends-list").html("");

        friends.forEach(function(friend) {
            friendListElement.append("<li><a class='thumbnail' href='http://" + window.location.host + "/profile?id=" + friend.id + "'><img src='/getImage/" + friend.image + "'></a>");
        });
    }, function(err) {
        
    });
}
