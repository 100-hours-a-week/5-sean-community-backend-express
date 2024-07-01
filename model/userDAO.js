const db = require('../config/mysql').init();

module.exports = {
    getAllUsers: function(callback) {
        db.query('SELECT * FROM users', callback);
    },
    getUserById: function(userId, callback) {
        db.query('SELECT * FROM users WHERE userid = ?', [userId], callback);
    },
    createUser: function(user, callback) {
        db.query('INSERT INTO users SET ?', user, callback);
    },
    updateUser: function(userId, user, callback) {
        db.query('UPDATE users SET ? WHERE userid = ?', [user, userId], callback);
    },
    updateUserPassword: function(userId, password, callback) {
        db.query('UPDATE users SET password = ? WHERE userid = ?', [password, userId], callback);
    },
    deleteUser: function(userId, callback) {
        db.query('DELETE FROM users WHERE userid = ?', [userId], callback);
    },
    getUserByEmailAndPassword: function(email, password, callback) {
        db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], callback);
    }
};