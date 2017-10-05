var Sequelize = require("sequelize");
var crypto = require('crypto');

/* ---------------- DATABASE DEFINITION ---------------- */

var sequelize = new Sequelize('database', 'root', 'pass', {
	host : 'localhost',
	dialect : 'sqlite',

	pool : {
		max : 10,
		min : 0,
		idle : 10000
	},

	// SQLite only
	storage : '../database.sqlite',
	logging: false
});

/* ---------------- MODEL DEFINITIONS ---------------- */


//  Image model.
const Image = sequelize.define('image', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    imagePath: {
        type: Sequelize.STRING,
        defaultValue: ""
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    //	Model table name will be the same as the model name
	freezeTableName : true
});

//  Comment model.
const Comment = sequelize.define('comment', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    postId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    text: {
        type: Sequelize.STRING,
        defaultValue: ""
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    //	Model table name will be the same as the model name
	freezeTableName : true
});

//  Post model.
const Post = sequelize.define('post', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    writtenBy: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    writtenTo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    text: {
        type: Sequelize.STRING,
        defaultValue: ""
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    privacy: {
        type: Sequelize.BOOLEAN,
        defaultValue: true   
    }

}, {
    //	Model table name will be the same as the model name
	freezeTableName : true
});

////////////////////////////////////////////////////////////////////////////////////
//  Adds the attribute postId to images.
//Post.hasMany(Image, { as: 'PostImages' });
////////////////////////////////////////////////////////////////////////////////////
/* //  Creates a new model called PostImage that has foreign keys postId and imageId*/
Post.belongsToMany(Image, { through: "PostImage"});
Image.belongsToMany(Post, { through: "PostImage"}); 

//  Adds the function getPostComments (and more functions) to Post which retrieves all comments
//  with postId field that equals to the post's id.
Post.hasMany(Comment, { as: 'PostComments', sourceKey: 'id', foreignKey: 'postId'});

//  User model.
const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
	firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
	lastName: {
        type: Sequelize.STRING,
        allowNull: false
    },
	login: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
	randomString: {
        type: Sequelize.STRING,
        allowNull: false
    },
    hash: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    //	Model table name will be the same as the model name
	freezeTableName : true

});

//  Creates a new table called UserFriends which stores the ids of the two users who are friends.
User.belongsToMany(User, { as: 'Friends', through: 'UserFriends' } );

//  Creates a new table called UserPostLikes which stores the ids of users and posts.
Post.belongsToMany(User, { as: 'PostLikes', through: 'UserPostLikes' });

//  Creates a new table called UserCommentLikes which stores the ids of users and comments.
User.belongsToMany(Comment, { as: 'CommentLikes', through: 'UserCommentLikes' });

//  Adds the attribute ProfileImageId to users.
//User.hasOne(Image, { as: 'ProfileImage'} );

//  Creates a new model called UserImage that has foreign keys userId and imageId
Image.belongsToMany(User, {through: 'UserImage'});
User.belongsToMany(Image, {through: 'UserImage'});

//  Adds the function getPostsWritten (and more functions) to User which retrieves all posts 
//  with writtenBy field that equals to the user's id.
User.hasMany(Post, { as: 'PostsWritten', sourceKey: 'id', foreignKey: 'writtenBy' });

//  Adds the function getPostsOnWall (and more functions) to User which retrieves all posts
//  with writtenTo field that equals to the user's id.
User.hasMany(Post, { as: 'PostsOnWall', sourceKey: 'id', foreignKey: 'writtenTo' });

//  Adds the attribute userId to comments.
User.hasMany(Comment, { as: 'Comments' } );

//  Converts Object to JSON object (when saving elements in the DB).
function convertJSONtoOBJ(object) {
    try {
        var jsonObj = JSON.parse(object);
        if (jsonObj)
            jsonObj = jsonObj.get({ plain: true });
    }
    catch(e) {

    }

    /*
    for (var field in jsonObj) {
        if (field && jsonObj.hasOwnProperty(field)) {
            try {
                console.log("before: " + field);
                jsonObj.field = JSON.parse(jsonObj.field);
                console.log("after: " + field);
            }
            catch (e) {
                console.log(e.stack);
            }
        }
    }*/
}

//  Converts JSON object to Object (when retrieving elements from the DB).
function convertOBJtoJSON(obj) {
    for (var field in obj) {
        if (field && obj.hasOwnProperty(field)) {
            try {
                obj.field = JSON.stringify(obj.field);
            }
            catch (e) {
                console.log(e.stack);
            }
        }
    }
}

User.beforeValidate(convertOBJtoJSON);
User.afterFind(convertJSONtoOBJ);

Post.beforeValidate(convertOBJtoJSON);
Post.afterFind(convertJSONtoOBJ);

Comment.beforeValidate(convertOBJtoJSON);
Comment.afterFind(convertJSONtoOBJ);

Image.beforeValidate(convertOBJtoJSON);
Image.afterFind(convertJSONtoOBJ);

//  Creates the models in the DB.
User.sync();
Post.sync();
Comment.sync();
Image.sync();

sequelize.sync();

/* ---------------- DATABASE FUNCTIONS ---------------- */

/* ---------------- GENERAL ---------------- */

//  Generates a random string and an encrypted sha512 string as a password, given a password string.
function generateSHA512Pass(password, randomString, onResult) {
    var passObj = {};
    passObj.randomString = randomString;
    if (!randomString)
        passObj.randomString = crypto.randomBytes(16).toString('hex');
    passObj.hash = crypto.pbkdf2Sync(password, passObj.randomString, 100000, 512, 'sha512').toString('hex');        
    onResult(passObj);
}

//  Resets the database and destroys all tables.
module.exports.reset = function() {
    User.destroy();
    Post.destroy();
    Comment.destroy();
    Image.destroy();
};

//  Returns the users count.
module.exports.countUsers = function(onResult) {
    User.count().then(onResult(count));
};

/* ---------------- USERS ---------------- */

//  Adds a user to the DB.
module.exports.addUser = function(user, password, onResult) {
    generateSHA512Pass(password, null, function(passObj) {
        user.randomString = passObj.randomString;
        user.hash = passObj.hash;
        User.create(user).then(function(userDB) {
            module.exports.addImage({}, function(image) {
                userDB.addImage(image);
                onResult(userDB);
            });
        }, function(error) {
            onResult(null, error);
        });
    });
};

//  Retrieve a user given it's id.
module.exports.getUserById = function(userId, onResult) {
    User.findOne({
        where: {
            id: userId
        }
    }).then(onResult);
};

//  Retrieves a user given it's login.
module.exports.getUserByLogin = function(userLogin, onResult) {
    User.findOne({
        where: {
            login: userLogin
        }
    }).then(onResult);
};

//  Checks a user's login.
module.exports.checkUserLogin = function(login, password, onResult) {
    module.exports.getUserByLogin(login, function(user) {
        if (!user) {
            console.log("db: No such user " + login);
            onResult(false);
        }
        else {
            console.log("db: Found user " + login);
            generateSHA512Pass(password, user.randomString, function(passObj) {
                onResult(user.hash === passObj.hash);
            });
        }
    });
};

//  Remove a user given it's id.
module.exports.removeUser = function(userId, onResult) {
    User.destroy({
        where: {
            id: userId
        }
    }).then(onResult);
};

//  Retrieves all users from the DB.
module.exports.getAllUsers = function(onResult) {
    User.findAll().then(onResult);
};

//  Get users whom names begin with the given string
module.exports.searchUserPrefix = function(prefix, onResult) {
    module.exports.getAllUsers(function(users) {
        var userList = [];
        users.forEach(function(user) { 
            var fullname = user.firstName + " " + user.lastName;
            if (fullname.indexOf(prefix) === 0) {
                console.log("found: " + fullname);
                userList.push({ label: fullname, id: user.id });
            }
        });
        onResult(userList);
    });
};

//  Retrieves a given user's friends.
module.exports.getUserFriends = function(user, onResult) {
    user.getUsers().then(onResult);
};

//  Add given friend to current user's friends list.
module.exports.addFriend = function(currUser, currFriendId, onResult) {
    UserFriends.create(
        { userId: currUser.id, friendId: currFriendId }).then(function(userFriendDb) {
            onResult(userFriendDb);
        }, function(error) {
            onResult(null, error);
        });
};

//  Remove given friend from current user's friends list.
module.exports.removeFriend = function(currUserId, currFriendId, onResult) {
    UserFriends.destroy({
		where: {
            userId: currUserId,
            friendId: currFriendId
		}
	}).then(onResult);
};

module.exports.changeProfilePic = function(user, images, onResult) {
    user.setImages([]).then(function() {
        if (images.length !== 0) {
            images.forEach(function(imageObj) {
                module.exports.addImage(imageObj, function(image){
                    user.addImage(image).then(onResult(image.imagePath));
                });
            });
        }
        else {
            onResult();
        }
    });
};

/* ---------------- POSTS ---------------- */

//  Retrieves posts written by the given user.
module.exports.getPostsByUser = function(userId, onResult) {
    module.exports.getUserById(userId, function(user) {
        user.getPostsWritten().then(onResult);
    });
};

//  Retrieves posts written to the given user's wall.
module.exports.getPostsToUser = function(userId, onResult) {
    module.exports.getUserById(userId, function(user) {
        user.getPostsOnWall().then(onResult);
    });
};

//  Adds a post to the DB.
module.exports.addPost = function(post, images, onResult) {    
	Post.create(post).then(function(postDB) {
        if (images.length !== 0) {
            images.forEach(function(imageObj) {              
                module.exports.addImage(imageObj, function(image){
                    postDB.addImage(image).then(onResult(postDB));
                });
            });
        }   
        else {
            onResult(postDB);
        }
	}, function(error) {
		onResult(null, error);
	});
};

module.exports.getAllPosts = function(onResult) {
    Post.findAll().then(onResult);
};

//  Retrieve a post given it's id.
module.exports.getPostById = function(postId, onResult) {
    Post.findOne({
        where: {
            id: postId
        }
    }).then(onResult);
};

//  Retrieves a given post's likes.
module.exports.getPostLikes = function(postId, onResult) {
    module.exports.getPostById(postId, function(post) {
        post.getPostLikes().then(onResult);
    });
};

//  "Create" a post like given the user and post ids.
module.exports.addPostLike = function(currUserId, currPostId, onResult) {
    UserPostLikes.create({ userId: currUserId, postId: currPostId }).then(function(userPostLikeDB) {
        onResult(userPostLikeDB);
    }, function(error) {
        onResult(null, error);
    });
};

//  Remove a post like given the user and post ids.
module.exports.removePostLike = function(currUserId, currPostId, onResult) {
    UserPostLikes.destory({
        where: {
            userId: currUserId,
            postId: currPostId
        }
    }).then(onResult);
};

/* ---------------- COMMENTS ---------------- */

//  Retrieves a given user's comments.
module.exports.getUserComments = function(user, onResult) {
    user.getComments().then(onResult(comments));
};

 //  Retrieves a given post's comments.
 module.exports.getPostComments = function(postId, onResult) {
    module.exports.getPostById(postId, function(post) {
        post.getPostComments().then(onResult);
    });
}; 

//  Adds a comment to the DB.
module.exports.addComment = function(comment, onResult) {
	Comment.create(comment).then(function(commentDB) {
		onResult(commentDB);
	}, function(error) {
		onResult(null, error);
	});
};

//  Retrieves a given comment's likes.
module.exports.getCommentLikes = function(comment, onResult) {
    comment.getUsers().then(onResult(users));
};

//  "Create" a comment like given the user and comment ids.
module.exports.addCommentLike = function(currUserId, currCommentId, onResult) {
    UserCommentLikes.create({ userId: currUserId, commentId: currCommentId }).then(function(userCommentLike) {
        onResult(userCommentLike);
    }, function(error) {
        onResult(null, error);
    });
};

//  Remove a comment like given the user and comment ids.
module.exports.removeCommentLike = function(currUserId, currCommentId, onResult) {
    UserCommentLikes.destory({
        where: {
            userId: currUserId,
            commentId: currCommentId
        }
    }).then(onResult);
};

/* ---------------- IMAGES ---------------- */

 //  Retrieves a given post's images.
 module.exports.getPostImages = function(postId, onResult) {
    module.exports.getPostById(postId, function(post) {
        post.getImages().then(onResult);
    });
}; 

//  Adds an image to the DB.
module.exports.addImage = function(image, onResult) {
	Image.create(image).then(function(imageDB) {
		onResult(imageDB);
	}, function(error) {
		onResult(null, error);
	});
};