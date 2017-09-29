var imgEvent;

function postClicked(event){
	
	var postTextElement = $('form textarea[id=postText]');
	var postText = postTextElement.val();

    event.preventDefault();

	if(!postText || postText.length === 0){
		postTextElement.attr('placeholder', "Write something here...").focus();
		return;
    }

    prepareUpload(imgEvent, uploadDone, function(){ });
}


function uploadDone(data){
    console.log("UploadDone: " + JSON.stringify(data));
    console.log("UploadDone: " + JSON.stringify(data.result));

    //  Clear the textField of post
    $('form textarea[id=postText]').val("");

    // Display the new uploaded post
    // TODO: 
}

$(document).ready(function() {
    //  Attach event handler to the form (sign in button)
    $('form').submit(postClicked);

    //  Attach event handler to the file input button.
    $('input[type=file]').on('change', function(event){
        imgEvent = event;
        if($("#images")[0].files.length > 3) // Limit of 3 imgs per post.
            alert("You can select only 3 images");
    });
});