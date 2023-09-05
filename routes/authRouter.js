const express = require("express");
const router = express.Router();
const {
  login,
  dashboard,
  register,
  logout,
  logoutFromAll,
  profile,
  forgetPasswordRequest,
  updatePasswordRequest,
} = require("../controllers/user-auth");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", authMiddleware, logout);
router.get("/logout/all", authMiddleware, logoutFromAll);
router.get("/dashboard", authMiddleware, dashboard);
router.get("/profile", authMiddleware, profile);
router.post("/forget/password", forgetPasswordRequest);
router.post("/update/password", authMiddleware, updatePasswordRequest);

module.exports = router;
