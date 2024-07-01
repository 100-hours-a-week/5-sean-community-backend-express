const fs = require('fs').promises;
const path = require('path');
const filePath = path.join(__dirname, '../data/comment.json');
const commentDAO = require('../model/commentDAO');
const userDAO = require('../model/userDAO'); // 사용자 정보를 가져오기 위한 DAO


function formatDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function getUserNickname(userId) {
    return new Promise((resolve, reject) => {
        userDAO.getUserById(userId, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0 ? results[0].nickname : null);
            }
        });
    });
}

module.exports.getComment = async (req, res, next) => {
    commentDAO.getAllComments((error, results) => {
        if (error) {
            console.error('Error fetching comments:', error);
            res.status(500).json({ message: "서버에서 댓글을 불러오는 중 오류가 발생했습니다." });
        } else {
            res.json(results);
        }
    });
};


module.exports.createComment = async (req, res, next) => {
    const userId = req.session.userId; // 세션에서 사용자 ID 가져오기

    if (!userId) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    try {
        const nickname = await getUserNickname(userId);

        if (!nickname) {
            return res.status(404).json({ message: "사용자의 닉네임을 찾을 수 없습니다." });
        }

        const newComment = {
            postId: req.body.postId,
            userId: userId,
            nickname: nickname,
            createtime: formatDate(),
            content: req.body.content
        };

        commentDAO.createComment(newComment, (error, results) => {
            if (error) {
                console.error('Error creating comment:', error);
                res.status(500).json({ message: "서버에서 오류가 발생했습니다.", error: error.message });
            } else {
                res.status(201).json({ message: "댓글이 성공적으로 등록되었습니다.", comment: newComment });
            }
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: "서버에서 오류가 발생했습니다.", error: error.message });
    }
};
// 댓글 수정
module.exports.updateComment = async (req, res, next) => {
    const commentId = parseInt(req.params.id);
    const newContent = req.body.content;
    const userId = req.session.userId;

    console.log("commentId", commentId)
    console.log("newContent", newContent)
    console.log("userId", userId)

    commentDAO.getCommentById(commentId, (error, results) => {
        if (error) {
            console.error('Error fetching comment:', error);
            return res.status(500).json({ message: "서버에서 오류가 발생했습니다." });
        }

        if (results.length === 0 || results[0].userId !== userId) {
            return res.status(403).json({ message: "수정 권한이 없습니다." });
        }

        commentDAO.updateComment(commentId, newContent, (error, results) => {
            if (error) {
                console.error('Error updating comment:', error);
                res.status(500).json({ message: "서버에서 오류가 발생했습니다.", error: error.message });
            } else {
                res.status(200).json({ message: "댓글이 성공적으로 수정되었습니다." });
            }
        });
    });
};

// 댓글 삭제
module.exports.deleteComment = async (req, res, next) => {
    const commentId = parseInt(req.params.id);
    const userId = req.session.userId; // 세션에서 가져온 userId

    commentDAO.getCommentById(commentId, (error, results) => {
        if (error) {
            console.error('Error fetching comment:', error);
            return res.status(500).json({ message: "서버에서 오류가 발생했습니다." });
        }

        if (results.length === 0 || results[0].userId !== userId) {
            return res.status(403).json({ message: "삭제 권한이 없습니다." });
        }

        commentDAO.deleteComment(commentId, userId, (error, results) => {
            if (error) {
                console.error('Error deleting comment:', error);
                res.status(500).json({ message: "서버에서 오류가 발생했습니다.", error: error.message });
            } else {
                res.status(200).json({ message: "댓글이 성공적으로 삭제되었습니다." });
            }
        });
    });
};
