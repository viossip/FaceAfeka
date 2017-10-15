const botUsername = "bot@bot.com", botPassword = "bot";

//  Enter hashtag: "#hashtag" or "from:username"
const botQuery = '#love';
const botTweetInterval = 5000;
const botLoginInterval = 60000 * 10;

var twit = require('twit');  
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var GoogleImages = require('google-images');

var config = require('./configs.js');

var botRestApi = require('./bot_rest_api.js');
const FormData = require('form-data');
const concat = require("concat-stream");
var path = require('path');
var fs = require("fs");

const tempImgFolder = "./tempImgs";

var Twitter = new twit(config.twitterConfig); 
var nlu = new NaturalLanguageUnderstandingV1(config.watsonNLUConfig);
var GoogleSearch = new GoogleImages(config.googleConfig.CSE_ID, config.googleConfig.API_KEY);

var retweetInterval = {};
var loginInterval = {};
var lastTwit = "";
// Retweet a tweet according the query 'q' in params
var retweet = function() {  
    
    var params = {
        //	Search query.
        q: botQuery,
        result_type: 'recent'
    };

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
                if(lastTwit.includes(tweetText)) return; // Prevent repeating posts.
                else
                {
                    lastTwit = tweetText; // Save last tweet, to check repeating.
                    nlu.analyze({
                        text: tweetText,
                        features: {
                            keywords: {
                                emotion: true,
                                limit: 10
                            }
                        }
                    }, function(err, response) {
                        analyzeLang(err, response, function(processedText) {
                            if (processedText == null || processedText == undefined)
                                processedText = "whatever";
                            try {
                                GoogleSearch.search(processedText).then(function(images) {
                                    console.log("Found " + images.length + " images.");
                                    var chosenImage = images[Math.floor(Math.random() * images.length)];
                                    console.log("Image chosen: " + JSON.stringify(chosenImage));
                                    //  Save the image found using google.
                                    botRestApi.downloadImg(chosenImage.url, chosenImage.type, function (result) {
                                        var outputFile = path.join(__dirname, tempImgFolder) + "/" + chosenImage.url.split("/").pop();
                                        //  Write the image to disk temporarly
                                        fs.writeFileSync(outputFile, result.data);
                                        uploadPost(tweetText, false, 4, 4, outputFile, function(result) {
                                            //  Remove the image after uploading the post.
                                            fs.unlink(outputFile, function() {
                                            });
                                        });
                                    },
                                    function (error) {
                                        console.log("There was an error while downloading the image: " + error);
                                    });
                                });
                            } catch (error) {
                                console.log("Google-Images TypeError." + error.name);
                            }
                            
                        });
                    });
                }
        	}         	
        }
        //	If an error has occured.    
        else { 
          console.log('Something went wrong while searching tweets.');
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

function uploadPost(postText, privacy, userId, writtenTo, filePath, onResult) {
    
    var data = new FormData();

    data.append("0", fs.createReadStream(filePath));

    data.append("postText", postText);
    data.append("privacy", privacy);
    data.append("userId", userId);
    data.append("writtenTo", writtenTo);
    
    botRestApi.uploadPost(data, function(object) {
        console.log("post uploaded");
        onResult(true);
    }, function(error) {
        console.log("post not uploaded: " + error);
        onResult(false);
    });
}

//  Natural Language Understanding response callback function.
//  err stands for error, response is the tone analyzer response object.
function analyzeLang(err, response, onResult) {
    if (err) {
        console.log('error:', err);
        onResult({});        
    }
    else {
        var keywords = response.keywords;
        var chosenKeyword = {
            relevance: 0
        };
        var chosenEmotion = {
            emotion: "someEmotion",
            relevance: 0
        };

        //  Iterate over the keywords and choose the most relevant one (ignore keywords that hold links, if there are more than 1 results).
        for (var keyword of keywords) {
            if (keyword.relevance > chosenKeyword.relevance && keyword.text.indexOf("http") < 0)
                chosenKeyword = keyword;
        }

        var emotionsMap = chosenKeyword.emotion;

        //  Iterate over the emotions in the selected keyword and choose the most relevant one.
        for(var emotion in emotionsMap) {
            if (emotionsMap[emotion] > chosenEmotion.relevance) {
                chosenEmotion.emotion = emotion;
                chosenEmotion.relevance = emotionsMap[emotion];
            }
        }
        var finalResultText = chosenKeyword.text + " " + chosenEmotion.emotion;

        //  If no keyword or emotion were found, generate a "random" one
        if (chosenKeyword.relevance == 0 || chosenEmotion.relevance == 0) {
            var textArr = ["frish mish", "kill it when its small", "copy pasta", "hi micha"];
            //  "Fear is the path to the dark side. Fear leads to anger. Anger leads to hate. Hate leads to suffering."
            var emotionArr = ["fear", "anger", "hate", "suffering"];
            finalResultText = textArr[Math.floor(Math.random() * textArr.length)] + " " + emotionArr[Math.floor(Math.random() * emotionArr.length)];
        }
        
        console.log("Final result: " + finalResultText);
        onResult(finalResultText);
    }
}

//  Start the retweeting interval.
retweetInterval = setInterval(retweet, botTweetInterval);

//  Login the first time.
botLogin();

//  Start the login interval (login every 10 minutes).
loginInterval = setInterval(botLogin, botLoginInterval);

