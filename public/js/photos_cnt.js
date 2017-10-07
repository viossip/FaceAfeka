var userId = window.location.href.split('=')[1];

$(document).ready(function() {

    $(".navbar-nav li:nth-child(3)").addClass("active");

    if (userId) {
        $(".add-image-label").hide();
        $(".add-image-input").prop("disabled", true);
    }
    
    updateUserFriends(userId);

    $(".add-image-input").change(addAlbumImage);

    getUserAlbumImages(userId, updateAlbumImages, function (error) {
        
    });
});

function addAlbumImage(event) {
    var files = {};
    
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        files = event.target.files;
    }

    var data = new FormData();
    if (typeof files !== "undefined") {
        $.each(files, function(key, value) {
            data.append(key, value);
        });
    }

    uploadAlbumImage(data, updateAlbumImages);
}

//  Album photo remove button event handler.
function removeAlbumImageClicked(event) {
    var imageId = event.target.id;
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    removeAlbumImage(imageId.split("_").pop(), function() {
        $("#" + imageId).parent().remove();
    }, function(err) {

    });
}