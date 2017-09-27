function postClicked(event){
	
	var postTextElement = $('form textarea[id=postText]');
	var postText = postTextElement.val();


    event.preventDefault();

	if(!postText || postText.length === 0){
		userTxt.attr('placeholder', "Write something here...").focus();
		return;
    }
    
    addPost({}, {}, function name(params) { }, function name(params) { });
}//

$(document).ready(function() {
    //  Attach event handler to the form (sign in button)
    $('form').submit(postClicked);

});