const fs = require('fs').promises;
const path = require('path');
const filePath = path.join(__dirname, '../data/userdata.json');

module.exports.getUserdataById = async (req, res) => {
    const userId = parseInt(req.params.userId); // 사용자의 ID를 정수로 파싱
    try {
        const userData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const user = userData.find(u => u.userid === userId); // 사용자 ID를 기반으로 사용자 검색
        if (user) {
            res.status(200).json(user); // 사용자를 찾으면 200 상태 코드와 함께 사용자 데이터를 반환
        } else {
            res.status(404).json({ message: "User not found" }); // 사용자를 찾지 못하면 404 상태 코드 반환
        }
    } catch (error) {
        console.error('Error in getUserdataById:', error);
        res.status(500).send("Server Error");
    }
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

        let userData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const userId = userData.reduce((maxId, user) => user.userid > maxId ? user.userid : maxId, 0) + 1;
        const newUser = {
            userid: userId,
            email: email,
            password: password,
            nickname: nickname,
            image: imageUrl // 이미지 URL을 저장
        };
        userData.push(newUser);
        await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf8');

        res.status(201).json({ message: "User data created successfully", user: newUser });
    } catch (error) {
        console.error('Error in createUserdata:', error);
        res.status(500).send("Server error occurred");
    }
};

module.exports.getAllUserdata = async (req, res) => {
    try {
        const userData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        res.status(200).json(userData);
    } catch (error) {
        console.error('Error in getAllUserdata:', error);
        res.status(500).send("Server Error");
    }
};

module.exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            req.session.userId = user.userid; // 세션에 userId를 저장
            res.json({ success: true, message: "Login successful" });
        } else {
            // 로그인 실패시 JSON 형태로 명확한 오류 메시지 전달
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports.updateUserdata = async (req, res) => {
    const { nickname, image } = req.body;
    const userId = parseInt(req.params.userId);

    try {
        let userData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const userIndex = userData.findIndex(u => u.userid === userId);
        if (userIndex !== -1) {
            userData[userIndex].nickname = nickname;
            if (image) {
                const imageName = `${nickname || userData[userIndex].nickname}-${Date.now()}.png`;
                const imagePath = path.join(__dirname, `../uploads/user/${imageName}`);
                await fs.writeFile(imagePath, image, { encoding: 'base64' });
                userData[userIndex].image = `/uploads/user/${imageName}`; // 이미지 URL 설정
            }
            await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf8');
            res.status(200).json({ message: "User data updated successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error('Error in updateUserdata:', error);
        res.status(500).send("Server Error");
    }
};

module.exports.updateUserPassword = async (req, res) => {
    const { password } = req.body;
    const userId = parseInt(req.params.userId);

    try {
        let userData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const userIndex = userData.findIndex(u => u.userid === userId);
        if (userIndex !== -1) {
            userData[userIndex].password = password;
            await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf8');
            res.status(200).json({ message: "User password updated successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error('Error in updateUserPassword:', error);
        res.status(500).send("Server Error");
    }
};

module.exports.deleteUserdata = async (req, res) => {
    try {
        let userData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const userId = parseInt(req.params.userId);
        userData = userData.filter(u => u.userid !== userId);
        await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf8');
        res.status(200).json({ message: "User data deleted successfully" });
    } catch (error) {
        console.error('Error in deleteUserdata:', error);
        res.status(500).send("Server Error");
    }
};