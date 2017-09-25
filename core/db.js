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

//  User model.
var User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
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
        allowNull: false
    },
	randomString: {
        type: Sequelize.STRING,
        allowNull: false
    },
    hash: {
        type: Sequelize.STRING,
        allowNull: false
    },
    profileImgPath: {
        type: Sequelize.STRING,
        defaultValue: ""
    }
}, {
    //	Model table name will be the same as the model name
	freezeTableName : true

});

//  Post model.
var Post = sequelize.define('post', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
	userId:  {
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

//  Comment model.
var Comment = sequelize.define('comment', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
	userId:  {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    text: {
        type: Sequelize.STRING,
        defaultValue: ""
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

//  Post-Comment model.
var PostComment = sequelize.define('postComment', {
    postId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    commentId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    //	Model table name will be the same as the model name
	freezeTableName : true
});

//  Post-Image model.
var PostImage = sequelize.define('postImage', {
    postId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    imagePath: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    //	Model table name will be the same as the model name
	freezeTableName : true
});

//  Post-Like model.
var PostLike = sequelize.define('postLike', {
    postId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    //	Model table name will be the same as the model name
	freezeTableName : true
});

//  Comment-Like model.
var CommentLike = sequelize.define('commentLike', {
    commentId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    //	Model table name will be the same as the model name
	freezeTableName : true
});

//  Friends model.
var Friends = sequelize.define('friends', {
    user1Id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    user2Id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    //	Model table name will be the same as the model name
	freezeTableName : true
});