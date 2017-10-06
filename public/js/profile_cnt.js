
var userId = window.location.href.split('=')[1];

$(document).ready(function() {

    //updateUserFriends();

    if (userId) {
        $(".change-image-label").hide();
        $(".change-image-input").prop("disabled", true);
    }

    $(".change-image-input").change(changeProfilePic);
});

//  Retrieves friends from backend and inserts them to the friends box.
function updateUserFriends() {
    getUserFriends(userId, function(friends) {
        //  Empty the ui friends list
        var friendListElement = $("#friends-list").html("");

        friends.forEach(function(friend) {
            friendListElement.append("<li><a class='thumbnail' href='http://" + window.location.host + "profile?id=" + friend.id + "'><img src='../../img/user.png'></a>");
        });
    }, function(err) {
        
    });
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