const db = require('../config/mysql').init();

module.exports = {
    getAllPosts: function(callback) {
        db.query('SELECT * FROM posts', callback);
    },
    getPostById: function(postId, callback) {
        db.query('SELECT * FROM posts WHERE id = ?', [postId], callback);
    },
    createPost: function(post, callback) {
        db.query('INSERT INTO posts SET ?', post, callback);
    },
    updatePost: function(postId, post, callback) {
        db.query('UPDATE posts SET ? WHERE id = ?', [post, postId], callback);
    },
    deletePost: function(postId, callback) {
        db.query('DELETE FROM posts WHERE id = ?', [postId], callback);
    }
};
