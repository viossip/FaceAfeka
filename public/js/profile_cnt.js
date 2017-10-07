
var userId = window.location.href.split('=')[1];

$(document).ready(function() {

    $(".navbar-nav li:nth-child(4)").addClass("active");

    if (userId) {
        checkFriends(userId, function(result) {

            //  If they are friends
            if (result.friends) {
                $(".friend-btn").removeClass("btn-success").addClass("btn-danger");
                $(".friend-btn").html("Remove Friend");
            }

            $(".friend-btn").show();
            $(".friend-btn").prop("disabled", false);

            //  Friend button event handler.
            $(".friend-btn").click(function(event) {
                friendBtnEventHandler(event, result.friends);
            });
        });
    }
    
    else {
        //  Show change profile image button
        $(".change-image-label").show();
        $(".change-image-input").prop("disabled", false);
    }

    updateUserFriends(userId);


    //  Change profile image button event handler.
    $(".change-image-input").change(changeProfilePic);

    //  View photos button event handler.
    $(".view-photos-btn").click(function(event) {
        changePageEventHandler(event, "/photos");
    });

    //  View friends button event handler.
    $(".view-friends-btn").click(function(event) {
        changePageEventHandler(event, "/friends");
    });


    getUserAlbumImages(userId, updateAlbumImages, function (error) {
        
    });
});

//  View photos and View friends buttons event handler func.
function changePageEventHandler(event, link) {
    event.stopPropagation();
    event.preventDefault();

    if (userId)
        link = link + "?id=" + userId;
        
    window.location = link;
}

//  Add friend button event handler.
function friendBtnEventHandler(event, areFriends) {
    event.stopPropagation();
    event.preventDefault();

    if (areFriends)
        removeFriend(userId, function() {}, function() {});
    else 
        addFriend(userId, function() {}, function() {});

    location.reload();
}

function changeProfilePic(event) {
    var files = {};

    if (event) {
        event.preventDefault();
        event.stopPropagation();
        files = event.target.files;
    }

    var data = new FormData();
	if(typeof files !== 'undefined') {
        $.each(files, function(key, value) {
            data.append(key, value);
        });
    }

    uploadProfileImage(data, function(imageObj) {
        $(".user-profile-image img").attr("src", "/getImage/" + imageObj.imageName);
    });
}