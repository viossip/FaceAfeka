var userId = window.location.href.split('=')[1];

$(document).ready(function() {
    if (userId) {
        $(".add-image-label").hide();
        $(".add-image-input").prop("disabled", true);
    }
    
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

    uploadAlbumImage(data, updateImages);
}