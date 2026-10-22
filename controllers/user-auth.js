const { container } = require("../container");
const { sendSuccess, sendCreated } = require("../utils/response");

// ----------------------------- Register -------------------------------- \\
const register = async (req, res) => {
  const authService = container.getAuthService();
  const { name, email, password } = req.body;

  const result = await authService.register({ name, email, password });

  return sendCreated(res, {
    message: "Registration successful",
    data: {
      user: result.user,
      token: result.token,
    },
    extra: {
      user: result.user,
      token: result.token,
    },
  });
};

// ----------------------------- Login -------------------------------- \\
const login = async (req, res) => {
  const authService = container.getAuthService();
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  return sendSuccess(res, {
    message: "Login successful",
    data: {
      user: result.user,
      token: result.token,
    },
    extra: {
      user: result.user,
      token: result.token,
    },
  });
};

// ----------------------------- Logout (Single Device) -------------------------------- \\
const logout = async (req, res) => {
  const authService = container.getAuthService();
  const result = await authService.logout(req.user.id, req.token);

  return sendSuccess(res, {
    message: result.message,
  });
};

// ----------------------------- Logout All Devices -------------------------------- \\
const logoutFromAll = async (req, res) => {
  const authService = container.getAuthService();
  const result = await authService.logoutFromAll(req.user.id);

  return sendSuccess(res, {
    message: result.message,
  });
};

// ----------------------------- Profile -------------------------------- \\
const profile = async (req, res) => {
  const authService = container.getAuthService();
  const user = await authService.getProfile(req.user.id);

  return sendSuccess(res, {
    message: "Profile retrieved successfully",
    data: { user },
    extra: { user },
  });
};

// ----------------------------- Dashboard -------------------------------- \\
const dashboard = async (req, res) => {
  const userDTO = req.user.toDTO ? req.user.toDTO() : req.user;
  return sendSuccess(res, {
    message: `Welcome back, ${req.user.name}!`,
    data: { user: userDTO },
    extra: { user: userDTO },
  });
};

// ----------------------------- Forget Password -------------------------------- \\
const forgetPasswordRequest = async (req, res) => {
  const authService = container.getAuthService();
  const result = await authService.requestPasswordReset(req.body.email);

  return sendSuccess(res, {
    message: result.message,
  });
};

// ----------------------------- Update Password -------------------------------- \\
const updatePasswordRequest = async (req, res) => {
  const authService = container.getAuthService();
  const { oldPassword, newPassword } = req.body;

  const result = await authService.updatePassword(req.user.id, {
    oldPassword,
    newPassword,
  });

  return sendSuccess(res, {
    message: result.message,
  });
};

module.exports = {
  login,
  dashboard,
  register,
  logout,
  logoutFromAll,
  profile,
  forgetPasswordRequest,
  updatePasswordRequest,
};
