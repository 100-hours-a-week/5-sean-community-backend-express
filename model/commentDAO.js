const db = require('../config/mysql').init();

module.exports = {
    getAllComments: function(callback) {
        db.query('SELECT * FROM comments', callback);
    },
    getCommentById: function(commentId, callback) {
        db.query('SELECT * FROM comments WHERE commentId = ?', [commentId], callback);
    },
    getCommentsByPostId: function(postId, callback) {
        db.query('SELECT * FROM comments WHERE postId = ?', [postId], callback);
    },
    createComment: function(comment, callback) {
        db.query('INSERT INTO comments SET ?', comment, callback);
    },
    updateComment: function(commentId, content, callback) {
        db.query('UPDATE comments SET content = ? WHERE commentId = ?', [content, commentId], callback);
    },
    deleteComment: function(commentId, userId, callback) {
        db.query('DELETE FROM comments WHERE commentId = ? AND userId = ?', [commentId, userId], callback);
    }
};
