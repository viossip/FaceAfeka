var userId = window.location.href.split('=')[1];

$(document).ready(function() {
    $(".navbar-nav li:nth-child(2)").addClass("active");

    updateFriendList();
});

//  Updates the friends list in the middle of the screen (friends page).
function updateFriendList() {
    getUserFriends(userId, function(friends) {
        //  Empty the ui friends list
        var friendListElement = $(".members").html("");
        
        friends.forEach(function(friend) {
            //  Check if the requesting user is friends with this friend object.
            checkFriends(friend.id, function(result) {
                var addRemoveFriendElem = "";
                //  If they're friends, add a "remove friend" button.
                if (result.friends) 
                    addRemoveFriendElem = "<a href='#' class='btn btn-danger btn-block add-remove-btn_" + friend.id + "'><i class='fa fa-users'></i>Remove Friend</a>";
                //  Else, add "add friend" button.
                else 
                    addRemoveFriendElem = "<a href='#' class='btn btn-success btn-block add-remove-btn_" + friend.id + "'><i class='fa fa-users'></i>Add Friend</a>";
                
                //  Add the friend elemet..
                friendListElement.append("<div class='row member-row'>" +
                                            "<div class='col-md-3'>" + 
                                                "<img src='/getImage/" + friend.image + "' class='img-thumbnail'>" + 
                                                "<div class='text-center'>" + friend.firstname + " " + friend.lastname + "</div>" + 
                                            "</div>" + 
                                            "<div class='col-md-3'>" +
                                                "<p>" + addRemoveFriendElem + "</p>" +
                                            "</div>" + 
                                            "<div class='col-md-3'>" +
                                                "<p><a href ='http://" + window.location.host + "/profile?id=" + friend.id + "' class='btn btn-primary btn-block'><i class='fa fa-edit'></i> View Profile</a></p>" + 
                                            "</div>" +
                                        "</div>");
                //  Friend add/remove button event handler.
                $(".add-remove-btn_" + friend.id).click(function(event) {
                    event.preventDefault();
                    event.stopPropagation();

                    if (result.friends)
                        removeFriend(friend.id, function() {}, function() {});
                    else 
                        addFriend(friend.id, function() {}, function() {});
            
                    location.reload();

                });
            });
        });
    }, function(err) {
        
    });
}