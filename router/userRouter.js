const express = require("express");
const router = express.Router();
const userPath = require("../controller/userController");

const cors = require('cors');

router.get('/session', (req, res) => {
    if (req.session && req.session.userId) {
        res.status(200).json({ result: req.session.userId });
    } else {
        res.status(401).json({ message: "로그인이 필요합니다." });
    }
});

router.get('/', userPath.getAllUserdata);  // 모든 사용자 데이터를 가져오는 라우트 추가
router.get('/:userId', userPath.getUserdataById);
router.post('/signin', userPath.loginUser);
router.post('/signup', userPath.createUserdata);
router.patch('/:userId', userPath.updateUserdata);
router.patch('/:userId/password', userPath.updateUserPassword);
router.delete('/:userId', userPath.deleteUserdata);

module.exports = router;


