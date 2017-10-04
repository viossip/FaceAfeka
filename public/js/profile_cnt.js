var currUserId = -1;

$(document).ready(function() {
    //currUserId = window.location.substr(window.location.lastIndexOf("/"), window.location.length);
    console.log(currUserId);
    //updateUserDetails();

});

//  Updates the current user's details.
function updateUserDetails() {
    getUserById(currUserId, function(user) {
        $(".profile > h1").html("");
        $(".profile > h1").html(user.firstname + " " + user.lastname);
        $(".user-fullname").html("");
        $(".user-fullname").html(user.firstname + " " + user.lastname);
        $(".user-email").html("");
        $(".user-email").html(user.login);
        if (user.image !== "") 
            $(".profile img").attr("src", user.image);
    }, function(err) {

    });
}