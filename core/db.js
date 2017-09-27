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
	storage : './database.sqlite',
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

//  Adds the attribute postId to images.
//Post.hasMany(Image, { as: 'PostImages' });

//  Creates a new model called PostImage that has foreign keys userId and imageId
Post.belongsToMany(Image, {through: 'PostImage'});
Image.belongsToMany(Post, {through: 'PostImage'});

//  Adds the attribute postId to comments.
Post.hasMany(Comment, { as: 'PostComments' });

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
User.belongsToMany(User, { as: 'friends', through: 'UserFriends' } );

//  Creates a new table called UserPostLikes which stores the ids of users and posts.
User.belongsToMany(Post, { as: 'PostLikes', through: 'UserPostLikes' });

//  Creates a new table called UserCommentLikes which stores the ids of users and comments.
User.belongsToMany(Comment, { as: 'CommentLikes', through: 'UserCommentLikes' });

//  Adds the attribute ProfileImageId to users.
//User.hasOne(Image, { as: 'ProfileImage'} );

//  Creates a new model called UserImage that has foreign keys userId and imageId
Image.belongsToMany(User, {through: 'UserImage'});
User.belongsToMany(Image, {through: 'UserImage'});

//  Adds the attribute userId to posts.
User.hasMany(Post, { as: 'Posts' });

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

//  Generates a random string and an encrypted sha512 string as a password, given a password string.
function generateSHA512Pass(password, randomString, onResult) {
    var passObj = {};
    passObj.randomString = randomString;
    if (!randomString)
        passObj.randomString = crypto.randomBytes(16).toString('hex');
    passObj.hash = crypto.pbkdf2Sync(password, passObj.randomString, 100000, 512, 'sha512').toString('hex');        
    onResult(passObj);
}

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

//  Retrieves a given user's posts.
module.exports.getUserPosts = function(user, onResult) {
    user.getPosts().then(onResult(posts));
};

//  Retrieves a given user's comments.
module.exports.getUserComments = function(user, onResult) {
    user.getComments().then(onResult(comments));
};

//  Retrieves a given user's friends.
module.exports.getUserFriends = function(user, onResult) {
    user.getUsers().then(onResult(friends));
};

//  Adds a post to the DB.
module.exports.addPost = function(post, onResult) {
	Post.create(post).then(function(postDB) {
		onResult(postDB);
	}, function(error) {
		onResult(null, error);
	});
};

//  Retrieves a given post's comments.
module.exports.getPostComments = function(post, onResult) {
    post.getComments().then(onResult(comments));
};

//  Retrieves a given post's images.
module.exports.getPostImages = function(post, onResult) {
    post.getImages().then(onResult(images));
};

//  Retrieves a given post's likes.
module.exports.getPostLikes = function(post, onResult) {
    post.getUsers().then(onResult(users));
};

//  Adds a comment to the DB.
module.exports.addComment = function(comment, onResult) {
	Comment.create(comment).then(function(commentDB) {
		onResult(commentDB);
	}, function(error) {
		onResult(null, error);
	});
};

//  Retrieves a given comment's images.
module.exports.getCommentImages = function(comment, onResult) {
    comment.getImages().then(onResult(images));
};

//  Retrieves a given comment's likes.
module.exports.getCommentLikes = function(comment, onResult) {
    comment.getUsers().then(onResult(users));
};

//  Adds an image to the DB.
module.exports.addImage = function(image, onResult) {
	Image.create(image).then(function(imageDB) {
		onResult(imageDB);
	}, function(error) {
		onResult(null, error);
	});
};