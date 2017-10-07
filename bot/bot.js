var twit = require('twit');  
var config = require('./config.js'); 
var Twitter = new twit(config); 

var botComment = "Congratulations!";
var botCommentImg = require('fs').readFileSync('imgs/congrats.gif', { encoding: 'base64' });
var botQuery = '#sportlive';
//var botQuery = '#sportlive, #livesport, #sportevent, #sport';

// Retweet a tweet according the query 'q' in params
var retweet = function() {  
    
    var params = {
        //	Search query.
        q: botQuery,
        result_type: 'recent'
    }

    //	Searches for tweets using the given params.
    Twitter.get('search/tweets', params, function(err, data) {
        if (!err) {
			console.log("-------------------------------------------------------DATA: " + JSON.stringify(data) + "-------------------------------------------------");
        	if (data && data.statuses[0]){
        		//	Get tweet's information.
            	var retweetId = data.statuses[0].id_str;
            	var retweetUsername = data.statuses[0].user.screen_name;

            	//postTweet(retweetId, retweetUsername, botComment); 
        		}         	
        }       
        else { //	If an error has occured.
          console.log('Something went wrong while SEARCHING...');
        }
    });
}