const botUsername = "bot@bot.com", botPassword = "bot";
//  Enter hashtag: "#hashtag" or "from:username"
var botQuery = '#love';
//var botQuery = '#sportlive, #livesport, #sportevent, #sport';

var twit = require('twit');  
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var GoogleImages = require('google-images');

//var config = require('./bot_config.js');
var config = require('./configs.js');
//var fs = require('fs');
var botRestApi = require('./bot_rest_api.js');
const FormData = require('form-data');

var Twitter = new twit(config.twitterConfig); 
var WatsonAnalyzer = new NaturalLanguageUnderstandingV1(config.watsonConfig); 
var GoogleSearch = new GoogleImages(config.googleConfig.CSE_ID, config.googleConfig.API_KEY);

var retweetInterval = {};
var loginInterval = {};

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
        	if (data && data.statuses[0]){
        		//	The tweet's id
                var tweetId = data.statuses[0].id_str;
                //  The tweet's author username.
                var tweetUsername = data.statuses[0].user.screen_name;
                //  The tweet's text.
                var tweetText = data.statuses[0].text;
                console.log("tweet text: " + tweetText);

                WatsonAnalyzer.analyze(
                    {   'text': tweetText,
                        'features': { 
                            'keywords': { 'limit': 2 },
                            'entities':{ }
                        }
                    },  
                    function(err, res){
                        if (err)
                            console.log('error:', err);
                        else{
                        //take the first keyword and the first person and create a query for the callback
                            if(res.keywords[0] && res.entities[0]){
                                console.log("+++++++++++++++++!!!!!!!!!!+++++++++++++++++++++++++++++ " + JSON.stringify(res.keywords));
                                console.log("+++++++++++++++++!!!!!!!!!!+++++++++++++++++++++++++++++ " + JSON.stringify(res.entities));
                                var queryToSearch = keywords+" "+entities;
                                console.log("+++++++++++++++++!!!!!!!!!!+++++++++++++++++++++++++++++"+  queryToSearch);

                                //GoogleSearch.search('query :'+ queryToSearch)
                                GoogleSearch.search(queryToSearch, {size: 'Medium'})
                                .then( function (images) {
                                    console.log("--------------------IMAGES:::::::::::::::::::::::::::::::: "+JSON.stringify(images));
                                    //TODO: Transfer imgs to faceAfeka here...Download and Transfer or transfer links...???
                                })
                                .catch(function (err) {
                                console.log("Search error: "+JSON.stringify(err))
                                })
                            }
                        }
                    });


                uploadPost(tweetText, false, 4, 4);
                //  USING IBM SERVICES CAN COST MONEY ITS ON MY ACCOUNT! **************************************************************
/*                  nlu.analyze({
                    'html': tweetText, // Buffer or String
                    'features': {
                      'concepts': {},
                      'keywords': {},
                    }
                  }, function(err, response) {
                       if (err)
                         console.log('error:', err);
                       else
                         console.log(JSON.stringify(response, null, 2));
                });  */
            	//postTweet(retweetId, retweetUsername, botComment); 
        	}         	
        }
        //	If an error has occured.    
        else { 
          console.log('Something went wrong while SEARCHING...');
        }
    });
};

function botLogin() {
    botRestApi.login(botUsername, botPassword, function(user){
        console.log("Bot logged in.");
	}, function(error) {
        console.log("Bot couldn't log in! error: " + error);
    });
}

function uploadPost(postText, privacy, userId, writtenTo) {
    
        //var data = new FormData();
        //data.append("postText", postText);
        //data.append("privacy", privacy);
        //data.append("userId", userId);
        var data = {
            postText: postText,
            privacy: privacy,
            userId: userId,
            writtenTo: writtenTo
        };
    
        botRestApi.uploadPost(data, function(object) {
            console.log("post uploaded");
        }, function(error) {
            console.log("post not uploaded: " + error);
        });
}

//  Start the retweeting interval.
retweetInterval = setInterval(retweet, 10000);

//  Login the first time.
botLogin();

//  Start the login interval (login every 10 minutes).
loginInterval = setInterval(botLogin, 60000 * 10);

