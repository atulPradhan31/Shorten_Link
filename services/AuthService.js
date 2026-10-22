const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomKey = require("random-key");
const CustomError = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");
const freelyEmail = require("../config/freelyEmail");
const WelcomeEmailTemplate = require("../template/WelcomeEmail");
const ForgetPassword = require("../template/ForgetPassword");
const { APP_NAME, APP_EMAIL, APP_DOMAIN } = require("../config");

class AuthService {
  /**
   * @param {Object} deps
   * @param {import("../repositories/contracts/IUserRepository")} deps.userRepository
   * @param {Object} [deps.config]
   */
  constructor({ userRepository, config = {} }) {
    if (!userRepository) {
      throw new Error("AuthService requires a userRepository instance.");
    }
    this.userRepository = userRepository;
    this.jwtSecret = config.jwtSecret || process.env.JWT_SECRET || "developmentSecretKey123!";
  }

  async _sendWelcomeEmail(name, email) {
    try {
      const emailBody = {
        recipient: email,
        app: APP_NAME,
        replyTo: APP_EMAIL,
        subject: `Welcome to ${APP_NAME}`,
        sender: APP_NAME,
        message: `Welcome ${name}! Thank you for joining ${APP_NAME}.`,
        HTMLfile: WelcomeEmailTemplate(APP_DOMAIN || "https://trimurl.online", name),
      };
      return await freelyEmail.sendEmail(emailBody);
    } catch (error) {
      console.error("Welcome email failed to send (non-fatal):", error.message);
      return null;
    }
  }

  async _sendForgetPassword(email, tempPassword) {
    try {
      const emailBody = {
        recipient: email,
        app: APP_NAME,
        replyTo: APP_EMAIL,
        subject: `Reset your ${APP_NAME} password`,
        sender: APP_NAME,
        message: `Your temporary password is: ${tempPassword}`,
        HTMLfile: ForgetPassword(tempPassword),
      };
      return await freelyEmail.sendEmail(emailBody);
    } catch (error) {
      console.error("Reset email failed to send (non-fatal):", error.message);
      return null;
    }
  }

  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new CustomError(
        "Please provide name, email, and password",
        StatusCodes.BAD_REQUEST
      );
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      throw new CustomError(
        "Name must be between 2 and 50 characters",
        StatusCodes.BAD_REQUEST
      );
    }

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      throw new CustomError("Please provide a valid email address", StatusCodes.BAD_REQUEST);
    }

    if (password.length < 6) {
      throw new CustomError("Password must be at least 6 characters long", StatusCodes.BAD_REQUEST);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new CustomError(
        "An account with this email address already exists. Please log in.",
        StatusCodes.BAD_REQUEST
      );
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await this.userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user.id }, this.jwtSecret, {
      expiresIn: "10d",
    });

    await this.userRepository.addToken(user.id, token);

    // Non-blocking welcome email
    this._sendWelcomeEmail(user.name, user.email).catch((err) =>
      console.error("Welcome email error:", err.message)
    );

    return {
      user: user.toDTO(),
      token,
    };
  }

  /**
   * Authenticate a user
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new CustomError(
        "Please provide both email and password",
        StatusCodes.BAD_REQUEST
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new CustomError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const token = jwt.sign({ userId: user.id }, this.jwtSecret, {
      expiresIn: "10d",
    });

    await this.userRepository.addToken(user.id, token);

    return {
      user: user.toDTO(),
      token,
    };
  }

  /**
   * Verify session token and retrieve user
   */
  async verifySession(userId, token) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError(
        "User not found or account deactivated.",
        StatusCodes.UNAUTHORIZED
      );
    }

    const hasActiveToken = await this.userRepository.hasToken(userId, token);
    if (!hasActiveToken) {
      throw new CustomError(
        "Session has expired or was logged out. Please log in again.",
        StatusCodes.UNAUTHORIZED
      );
    }

    return user;
  }

  /**
   * Logout from current device
   */
  async logout(userId, token) {
    await this.userRepository.removeToken(userId, token);
    return { success: true, message: "Successfully logged out from this device" };
  }

  /**
   * Logout from all devices
   */
  async logoutFromAll(userId) {
    await this.userRepository.clearTokens(userId);
    return { success: true, message: "Successfully logged out from all devices" };
  }

  /**
   * Handle forget password request
   */
  async requestPasswordReset(email) {
    if (!email) {
      throw new CustomError("Please enter a valid email address", StatusCodes.BAD_REQUEST);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      // Do not disclose whether email exists
      return {
        success: true,
        message: "If an account exists with this email, a temporary password has been dispatched.",
      };
    }

    const tempPassword = randomKey.generate(10);
    const newHashedPassword = await bcrypt.hash(tempPassword, 8);

    await this.userRepository.update(user.id, { password: newHashedPassword });
    await this.userRepository.clearTokens(user.id);

    await this._sendForgetPassword(normalizedEmail, tempPassword);

    return {
      success: true,
      message: "A temporary password has been dispatched to your email address.",
    };
  }

  /**
   * Update password for an authenticated user
   */
  async updatePassword(userId, { oldPassword, newPassword }) {
    if (!oldPassword || !newPassword) {
      throw new CustomError(
        "Please provide both your current password and new password",
        StatusCodes.BAD_REQUEST
      );
    }

    if (newPassword.length < 6) {
      throw new CustomError(
        "New password must be at least 6 characters long",
        StatusCodes.BAD_REQUEST
      );
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError("User not found", StatusCodes.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new CustomError("Current password is incorrect", StatusCodes.UNAUTHORIZED);
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 8);
    await this.userRepository.update(userId, { password: newHashedPassword });

    return { success: true, message: "Password updated successfully" };
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError("User not found", StatusCodes.NOT_FOUND);
    }
    return user.toDTO();
  }
}

module.exports = AuthService;
