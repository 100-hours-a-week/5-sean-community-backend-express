const fs = require('fs').promises;
const path = require('path');
const postDAO = require('../model/postDAO');


function formatDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth()+ 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return year + "-" + month + "-" + day +" "+hours+":"+minutes+":"+seconds
}

module.exports.getPostById = async (req, res, next) => {
    const postId = parseInt(req.params.id);
    postDAO.getPostById(postId, (err, results) => {
        if (err) {
            console.error('Error in getPostById:', err);
            res.status(500).send("Server Error");
        } else if (results.length === 0) {
            res.status(404).json({ message: "Post not found" });
        } else {
            res.status(200).json(results[0]);
        }
    });
};

module.exports.getPost = async (req, res, next) => {
    postDAO.getAllPosts((err, results) => {
        if (err) {
            console.error('Error in getAllPosts:', err);
            res.status(500).send("Server Error");
        } else {
            res.status(200).json(results);
        }
    });
};

module.exports.postPost = async (req, res, next) => {
    const { title, content, image, userId, nickname, profileImage } = req.body;
    const createtime = formatDate();
    const views = 0;
    const likes = 0;
    const comments = 0;
    let imageUrl = null;

    if (image) {
        const imageData = image.split(';base64,').pop();
        const uploadsDir = path.join(__dirname, '../uploads');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        const newImageName = `post-${Date.now()}.png`;
        const imagePath = path.join(uploadsDir, newImageName);

        try {
            await fs.promises.writeFile(imagePath, imageData, { encoding: 'base64' });
            imageUrl = `/uploads/${newImageName}`;
        } catch (err) {
            console.error('Error writing the image file:', err);
            return res.status(500).json({ message: '이미지 저장 중 오류가 발생했습니다.' });
        }
    }

    const newPost = {
        title,
        content,
        image: imageUrl,
        createtime,
        views,
        likes,
        comments,
        userId,
        nickname,
        profile_image: profileImage
    };

    postDAO.createPost(newPost, (err, results) => {
        if (err) {
            console.error('Error inserting post:', err);
            res.status(500).json({ message: '게시글 작성 중 오류가 발생했습니다.' });
            return;
        }

        newPost.id = results.insertId;
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    });
};


module.exports.deletePost = async (req, res, next) => {
    const postId = parseInt(req.params.id);
    const userId = req.session.userId

    postDAO.getPostById(postId, (err, results) => {
        if (err) {
            console.error('Error in deletePost:', err);
            return res.status(500).send("Server Error");
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        const post = results[0];
        if (post.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }

        postDAO.deletePost(postId, (err) => {
            if (err) {
                console.error('Error in deletePost:', err);
                res.status(500).send("Server Error");
            } else {
                res.status(200).send({ message: "Post deleted successfully" });
            }
        });
    });
};

module.exports.updatePost = async (req, res) => {
    const { title, content, image } = req.body;
    const postId = parseInt(req.params.id);
    const userId = req.session.userId
    console.log('Session User ID:', userId);

    try {
        postDAO.getPostById(postId, async (err, results) => {
            if (err) {
                console.error('Error in updatePost:', err);
                return res.status(500).send("Server Error");
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Post not found" });
            }

            const post = results[0];
            console.log('Post User ID:', post.userId);

            if (post.userId !== userId) {
                return res.status(403).json({ message: "You are not authorized to edit this post" });
            }

            const updatedPost = { title: title, content: content };
            if (image) {
                const imageName = `post-${Date.now()}.png`;
                const imagePath = path.join(__dirname, `../uploads/posts/${imageName}`);
                await fs.writeFile(imagePath, image, { encoding: 'base64' });
                updatedPost.image = `/uploads/posts/${imageName}`;
            }

            postDAO.updatePost(postId, updatedPost, (err) => {
                if (err) {
                    console.error('Error in updatePost:', err);
                    res.status(500).send("Server Error");
                } else {
                    res.status(200).send({ message: 'Post updated successfully' });
                }
            });
        });
    } catch (error) {
        console.error('Error in updatePost:', error);
        res.status(500).send("Server Error");
    }
};
