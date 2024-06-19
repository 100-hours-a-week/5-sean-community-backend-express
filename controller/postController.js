const fs = require('fs').promises;
const fs2 = require('fs');  // 기본 fs 모듈 사용
const path = require('path');
const multer = require('multer');
const filePath = path.join(__dirname, '../data/post.json');


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

module.exports.getPost = async (req, res, next) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading the file:', error);
        res.status(500).json({ message: "서버에서 파일을 읽는 중 오류가 발생했습니다." });
    }
};

module.exports.postPost = async (req, res, next) => {
    const { title, content, image } = req.body;

    try {

        const data = await fs.readFile(filePath, 'utf8');
        const posts = JSON.parse(data);
        const imageData = image.split(';base64,').pop();  // Base64 데이터 추출

        const uploadsDir = '/Users/junho/Desktop/startupcode/git/grulla79/5-sean-kim-kks-community/back/uploads';
        
        if (!fs2.existsSync(uploadsDir)) {
            fs2.mkdirSync(uploadsDir);
        }

        const newImageName = `post-${Date.now()}.png`;  // 새 이미지 파일 이름
        const imagePath = path.join(uploadsDir, newImageName); // 상대 경로로 저장 경로 변경

        await fs.writeFile(imagePath, imageData, {encoding: 'base64'}).catch(err => {
            console.error('Error writing the image file:', err);  // 에러 로깅 추가
        });
        const newPost = {
            id: posts.length > 0 ? posts[posts.length - 1].id + 1 : 1,
            title: title,
            content: content,
            image: `/uploads/${newImageName}`, // 웹 접근 가능 경로
            createtime: formatDate(),
            views: 0,
            nickname: "익명",
            profile_image: "/images/free-icon-whale-1045140.png",
            likes: 0,
            comments: 0,
        };
        
        posts.push(newPost);
        await fs.writeFile(filePath, JSON.stringify(posts, null, 2), 'utf8');
        
        res.status(201).send({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error creating post' });
    }
};

module.exports.deletePost = async (req, res, next) => {
    const postId = parseInt(req.params.id);
    const isDeleted = await deletePostById(postId);

    if (isDeleted) {
        res.status(200).send({ message: "Post deleted successfully" });
    } else {
        res.status(404).send({ message: "Post not found" });
    }
};

module.exports.updatePost = async(req, res, next) => {
    const postId = parseInt(req.params.id);
    const { title, content } = req.body;

    try {
        const data = await fs.readFile(filePath, 'utf8');
        let posts = JSON.parse(data);

        const postIndex = posts.findIndex(post => post.id == postId);
        if (postIndex !== -1) {
            posts[postIndex].title = title;
            posts[postIndex].content = content;

            await fs.writeFile(filePath, JSON.stringify(posts, null, 2));
            res.status(200).send('Post updated');
        } else {
            return res.status(404).send('Post not found');
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error processing your request');
    }
};

//postid로 포스트 삭제
async function deletePostById(postId) {
    try {
        const data = await fs.readFile(filePath, 'utf8'); // 파일 읽기
        let posts = JSON.parse(data);

        const postIndex = posts.findIndex(post => post.id === postId);
        if (postIndex === -1) {
            return false; // 포스트를 찾지 못한 경우
        }
        posts.splice(postIndex, 1); // 포스트 삭제

        await fs.writeFile(filePath, JSON.stringify(posts, null, 2)); // 변경된 데이터를 파일에 쓰기
        console.log("The post has been deleted.");
        return true;
    } catch (err) {
        throw err; // 에러 처리
    }
};