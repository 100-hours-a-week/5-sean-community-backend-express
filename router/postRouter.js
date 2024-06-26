const express = require("express");
const router = express.Router();
const postPath = require("../controller/postController");
 // 파일을 저장할 디렉토리 설정

 //m

router.get("/", postPath.getPost);

router.get('/:id', postPath.getPostById);  // 특정 게시글 데이터를 가져오는 라우트 추가

router.post("/", postPath.postPost);

router.delete("/:id", postPath.deletePost);

router.put("/:id", postPath.updatePost); // 수정 요청을 처리할 PUT 엔드포인트 추가

module.exports = router;
