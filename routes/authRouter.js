const express = require("express");
const router = express.Router();
const { login, dashboard, register } = require("../controllers/user-auth");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/dashboard", authMiddleware, dashboard);

module.exports = router;
