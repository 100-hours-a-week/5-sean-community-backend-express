const express = require("express");
const router = express.Router();
const commentPath = require("../controller/commentController");

router.get("/", commentPath.getComment);
router.post("/", commentPath.createComment);
router.delete("/:id", commentPath.deleteComment);
router.put("/:id", commentPath.updateComment);

module.exports = router;