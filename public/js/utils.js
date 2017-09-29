//Grab the files and set them to our variable
function prepareUpload(event, onSuccess, onFailure)
{
	files = event.target.files;
	uploadFiles(event, onSuccess, onFailure);
}

function uploadFiles(event, onSuccess, onFailure)
{
	event.stopPropagation(); // Stop stuff happening
	event.preventDefault(); // Totally stop stuff happening

	// Create a formdata object and add the files
	var data = new FormData();
    $.each(files, function(key, value) { data.append(key, value); });
    //  Append the post's text to transmitted data.
    data.append("postText", $('form textarea[id=postText]').val());

	$.ajax({
		url: '/posts/addPost',
        type: 'POST',
		data: data,
		cache: false,
		dataType: 'json',
		processData: false, // Don't process the files
		contentType: false, // Set content type to false as jQuery will tell the server its a query string request
		success: function(data, textStatus, jqXHR)
		{
			if(typeof data.error === 'undefined')
			{
				onSuccess(data);
			}
			else
			{
				console.log('ERRORS: ' + data.error);
			}
			$('input[type=file]').val('');
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			console.log('ERRORS: ' + textStatus);
			$('input[type=file]').val('');
			onFailure();
		}
    });
}