const fs = require('fs').promises;
const path = require('path');
const filePath = path.join(__dirname, '../data/userdata.json');
const userDAO = require('../model/userDAO');

module.exports.getUserdataById = async (req, res) => {
    const userId = parseInt(req.params.userId); // 사용자의 ID를 정수로 파싱
    userDAO.getUserById(userId, (err, results) => {
        if (err) {
            console.error('Error in getUserdataById:', err);
            res.status(500).send("Server Error");
        } else if (results.length === 0) {
            res.status(404.).json({ message: "User not found" });
        } else {
            res.status(200).json(results[0]);
        }
    });
};

module.exports.createUserdata = async (req, res) => {
    const { email, password, nickname, image } = req.body;
    const uploadsDir = path.join(__dirname, '../uploads/user');
    const imageName = `${nickname}-${Date.now()}.png`;
    const imagePath = path.join(uploadsDir, imageName);
    const imageUrl = `/uploads/user/${imageName}`;

    try {
        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.writeFile(imagePath, image, { encoding: 'base64' });

        const newUser = {
            email: email,
            password: password,
            nickname: nickname,
            profile_image: imageUrl
        };
        userDAO.createUser(newUser, (err, results) => {
            if (err) {
                console.error('Error in createUserdata:', err);
                res.status(500).send("Server error occurred");
            } else {
                newUser.userid = results.insertId;
                res.status(201).json({ message: "User data created successfully", user: newUser });
            }
        });
    } catch (error) {
        console.error('Error in createUserdata:', error);
        res.status(500).send("Server error occurred");
    }
};

module.exports.getAllUserdata = async (req, res) => {
    userDAO.getAllUsers((err, results) => {
        if (err) {
            console.error('Error in getAllUserdata:', err);
            res.status(500).send("Server Error");
        } else {
            res.status(200).json(results);
        }
    });
};

module.exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    userDAO.getUserByEmailAndPassword(email, password, (err, results) => {
        if (err) {
            console.error('Error in loginUser:', err);
            res.status(500).json({ success: false, message: "Server Error" });
        } else if (results.length === 0) {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        } else {
            req.session.userId = results[0].userid;
            res.json({ success: true, message: "Login successful" });
        }
    });
};

module.exports.updateUserdata = async (req, res) => {
    const { nickname, image } = req.body;
    const userId = parseInt(req.params.userId);

    try {
        const updatedUser = { nickname: nickname };
        if (image) {
            const imageName = `${nickname}-${Date.now()}.png`;
            const imagePath = path.join(__dirname, `../uploads/user/${imageName}`);
            await fs.writeFile(imagePath, image, { encoding: 'base64' });
            updatedUser.profile_image = `/uploads/user/${imageName}`;
        }
        userDAO.updateUser(userId, updatedUser, (err) => {
            if (err) {
                console.error('Error in updateUserdata:', err);
                res.status(500).send("Server Error");
            } else {
                res.status(200).json({ message: "User data updated successfully" });
            }
        });
    } catch (error) {
        console.error('Error in updateUserdata:', error);
        res.status(500).send("Server Error");
    }
};

module.exports.updateUserPassword = async (req, res) => {
    const { password } = req.body;
    const userId = parseInt(req.params.userId);

    userDAO.updateUserPassword(userId, password, (err) => {
        if (err) {
            console.error('Error in updateUserPassword:', err);
            res.status(500).send("Server Error");
        } else {
            res.status(200).json({ message: "User password updated successfully" });
        }
    });
};

module.exports.deleteUserdata = async (req, res) => {
    const userId = parseInt(req.params.userId);
    userDAO.deleteUser(userId, (err) => {
        if (err) {
            console.error('Error in deleteUserdata:', err);
            res.status(500).send("Server Error");
        } else {
            res.status(200).json({ message: "User data deleted successfully" });
        }
    });
};