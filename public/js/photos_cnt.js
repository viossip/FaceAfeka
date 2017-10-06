var userId = window.location.href.split('=')[1];

$(document).ready(function() {
    if (userId) {
        $(".add-image-label").hide();
        $(".add-image-input").prop("disabled", true);
    }
    
    $(".add-image-input").change(addAlbumImage);

    getUserAlbumImages(userId, updateImages, function (error) {
        
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

function updateImages(images) {
    var ulGalleryElem = $(".gallery-parent");
    images.forEach(function(image, index) {
        var imageName = image.imagePath.split("/").pop();
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