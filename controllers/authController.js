import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  createOTP,
  dotsToHyphens,
  hyphensToDots,
  isEmail,
  isMobile,
} from "../helpers/helpers.js";
import { sendSMS } from "../utils/sendSMS.js";
import { AccountActivationEmail } from "../mails/AccountActivationEmail.js";
import { cloudUpload } from "../utils/cloudinary.js";

/**
 * @DESC User Login
 * @ROUTE /api/v1/auth/login
 * @method POST
 * @access public
 */
export const login = asyncHandler(async (req, res) => {
  const { auth, password } = req.body;

  // validation
  if (!auth || !password)
    return res.status(404).json({ message: "All fields are required" });

  // find login user
  let loginUserdata = null;

  if (isMobile(auth)) {
    // find login user by email
    loginUserdata = await User.findOne({ phone: auth });

    // user not found
    if (!loginUserdata)
      return res.status(404).json({ message: "User not found" });
  } else if (isEmail(auth)) {
    // find login user by email
    loginUserdata = await User.findOne({ email: auth });

    // user not found
    if (!loginUserdata)
      return res.status(404).json({ message: "User not found" });
  } else {
    return res
      .status(404)
      .json({ message: "Login user must have a mobile or email account" });
  }

  // password check
  const passwordCheck = await bcrypt.compare(password, loginUserdata.password);

  // password check
  if (!passwordCheck)
    return res.status(404).json({ message: "Wrong password" });

  // create access token
  const token = jwt.sign({ auth: auth }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN,
  });

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.APP_ENV == "Development" ? false : true,
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    token,
    user: loginUserdata,
    message: "User Login Successful",
  });
});

/**
 * @DESC User Login
 * @ROUTE /api/v1/auth/login
 * @method POST
 * @access public
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Logout successful" });
});

/**
 * @DESC Create new User
 * @ROUTE /api/v1/user
 * @method POST
 * @access public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, auth, password } = req.body;

  if (!name || !auth || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // auth value manage
  let authEmail = null;
  let authPhone = null;

  // create a access token for account activation
  const activationCode = createOTP();

  if (isMobile(auth)) {
    authPhone = auth;

    // check mobile exists or not
    const isMobileExists = await User.findOne({ phone: auth });

    if (isMobileExists) {
      return res.status(400).json({
        message: "Phone Number already exists",
      });
    }

    // create verification token
    const verifyToken = jwt.sign(
      { auth: auth },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("verifyToken", verifyToken);

    // send OTP to user mobile
    await sendSMS(
      auth,
      `Hello ${name}, Your account activation code is : ${activationCode}`
    );
  } else if (isEmail(auth)) {
    authEmail = auth;

    // check mobile exists or not
    const isEmailExists = await User.findOne({ email: auth });

    if (isEmailExists) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // create verification token
    const verifyToken = jwt.sign(
      { auth: auth },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("verifyToken", verifyToken);

    // activation link
    const activationLink = `http://localhost:3000/activation/${dotsToHyphens(
      verifyToken
    )}`;
    // send ativation link to email
    await AccountActivationEmail(auth, {
      name,
      code: activationCode,
      link: activationLink,
    });
  } else {
    return res.status(400).json({
      message: "Your must use mobile Number or Email address",
    });
  }

  // password hash
  const hashPass = await bcrypt.hash(password, 10);

  // create new user
  const user = await User.create({
    name,
    email: authEmail,
    phone: authPhone,
    password: hashPass,
    accessToken: activationCode,
  });

  res.status(200).json({
    user,
    message: "User Created successful",
  });
});

/**
 * @DESC Create new User
 * @ROUTE /api/v1/user
 * @method POST
 * @access public
 */
export const loggedInUser = asyncHandler(async (req, res) => {
  res.status(200).json(req.me);
});

/**
 * @DESC Create new User
 * @ROUTE /api/v1/user
 * @method POST
 * @access public
 */
export const makeHashPass = asyncHandler(async (req, res) => {
  const { password } = req.body;
  // password hash
  const hashPass = await bcrypt.hash(password, 10);
  res.status(200).json({ hashPass });
});

/**
 * Account activate by OTP
 */
export const accountActivateByOTP = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { otp } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token not found" });
  }

  if (!otp) {
    return res.status(400).json({ message: "OTP not found" });
  }

  const verifyToken = hyphensToDots(token);

  // verify token
  const tokenCheck = jwt.verify(verifyToken, process.env.ACCESS_TOKEN_SECRET);

  if (!tokenCheck) {
    return res.status(400).json({ message: "Invalid Activation request" });
  }

  // activate account now
  let activateUser = null;

  if (isMobile(tokenCheck.auth)) {
    activateUser = await User.findOne({ phone: tokenCheck.auth });

    if (!activateUser) {
      return res.status(400).json({ message: "Activate user not found" });
    }
  } else if (isEmail(tokenCheck.auth)) {
    activateUser = await User.findOne({ email: tokenCheck.auth });

    if (!activateUser) {
      return res.status(400).json({ message: "Activate user not found" });
    }
  } else {
    return res.status(400).json({ message: "Auth is undefined" });
  }

  // check otp
  if (otp !== activateUser.accessToken) {
    return res.status(400).json({ message: "Wrong OTP" });
  }

  // set access token null
  activateUser.accessToken = null;
  activateUser.save();

  // crear verify token
  res.clearCookie("verifyToken");

  return res
    .status(200)
    .json({ message: "User activation successful", user: activateUser });
});

/**
 * Account activate by OTP
 */
export const accountActivateByLink = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token not found" });
  }

  const verifyToken = hyphensToDots(token);

  // verify token
  const tokenCheck = jwt.verify(verifyToken, process.env.ACCESS_TOKEN_SECRET);

  if (!tokenCheck) {
    return res.status(400).json({ message: "Invalid Activation request" });
  }

  // activate account now
  let activateUser = null;

  if (isEmail(tokenCheck.auth)) {
    activateUser = await User.findOne({ email: tokenCheck.auth });

    if (!activateUser) {
      return res.status(400).json({ message: "Activate user not found" });
    }
  } else {
    return res.status(400).json({ message: "Auth is undefined" });
  }

  // set access token null
  activateUser.accessToken = null;
  activateUser.save();

  // crear verify token
  res.clearCookie("verifyToken");

  return res.status(200).json({ message: "User activation successful" });
});

/**
 *
 */
export const resendAccountActivation = asyncHandler(async (req, res) => {
  const { auth } = req.params;

  // create a access token for account activation
  const activationCode = createOTP();

  // auth value manage
  let authEmail = null;
  let authPhone = null;
  let authUser = null;

  if (isMobile(auth)) {
    authPhone = auth;

    // check mobile exists or not
    authUser = await User.findOne({ phone: auth });

    // create verification token
    const verifyToken = jwt.sign(
      { auth: auth },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("verifyToken", verifyToken);

    // send OTP to user mobile
    await sendSMS(
      auth,
      `Hello ${authUser.name}, Your account activation code is : ${activationCode}`
    );
  } else if (isEmail(auth)) {
    authEmail = auth;

    // check mobile exists or not
    authUser = await User.findOne({ email: auth });

    // create verification token
    const verifyToken = jwt.sign(
      { auth: auth },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("verifyToken", verifyToken);

    // activation link
    const activationLink = `http://localhost:3000/activation/${dotsToHyphens(
      verifyToken
    )}`;
    // send ativation link to email
    await AccountActivationEmail(auth, {
      name: authUser.name,
      code: activationCode,
      link: activationLink,
    });
  }

  authUser.accessToken = activationCode;
  authUser.save();

  res.status(200).json({
    message: "Activation code send successful",
  });
});

/**
 * Password Reset here
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { auth } = req.body;

  // create a access token for account activation
  const activationCode = createOTP();

  // reset User Data
  let resetUser = null;

  if (isMobile(auth)) {
    // check mobile exists or not
    resetUser = await User.findOne({ phone: auth });

    if (!resetUser) {
      return res.status(400).json({
        message: "No user found",
      });
    }

    // create verification token
    const verifyToken = jwt.sign(
      { auth: auth },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.cookie("verifyToken", verifyToken);

    // send OTP to user mobile
    await sendSMS(
      auth,
      `Hello ${resetUser.name}, Your Password reset code is : ${activationCode}`
    );
  } else if (isEmail(auth)) {
    // check mobile exists or not
    resetUser = await User.findOne({ email: auth });

    if (!resetUser) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // create verification token
    const verifyToken = jwt.sign(
      { auth: auth },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("verifyToken", verifyToken);

    // activation link
    const activationLink = `http://localhost:3000/activation/${dotsToHyphens(
      verifyToken
    )}`;

    // send ativation link to email
    await AccountActivationEmail(auth, {
      name: resetUser.name,
      code: activationCode,
      link: activationLink,
    });
  } else {
    return res.status(400).json({
      message: "Your must use mobile Number or Email address",
    });
  }

  resetUser.accessToken = activationCode;
  resetUser.save();
  res.status(200).json({
    message: "Now Reset your password",
  });
});

/**
 * Password reset waction
 */
export const resetPasswordAction = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword, confPassword, otp } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New Password is required" });
  }

  if (!confPassword) {
    return res.status(400).json({ message: "Confirm Password is required" });
  }

  if (!token) {
    return res.status(400).json({ message: "Token not found" });
  }

  if (!otp) {
    return res.status(400).json({ message: "OTP not found" });
  }

  if (newPassword !== confPassword) {
    return res.status(400).json({ message: "Confirm Password not match" });
  }

  const verifyToken = hyphensToDots(token);

  // verify token
  const tokenCheck = jwt.verify(verifyToken, process.env.ACCESS_TOKEN_SECRET);

  if (!tokenCheck) {
    return res.status(400).json({ message: "Invalid Activation request" });
  }

  // activate account now
  let resetUser = null;

  if (isMobile(tokenCheck.auth)) {
    resetUser = await User.findOne({ phone: tokenCheck.auth });

    if (!resetUser) {
      return res.status(400).json({ message: "User not found" });
    }
  } else if (isEmail(tokenCheck.auth)) {
    resetUser = await User.findOne({ email: tokenCheck.auth });

    if (!resetUser) {
      return res.status(400).json({ message: "Activate user not found" });
    }
  } else {
    return res.status(400).json({ message: "Auth is undefined" });
  }

  // check otp
  if (otp !== resetUser.accessToken) {
    return res.status(400).json({ message: "Wrong OTP" });
  }

  // password hash
  const hashPass = await bcrypt.hash(newPassword, 10);

  resetUser.password = hashPass;
  resetUser.accessToken = null;
  resetUser.save();
  return res.status(200).json({ message: "Password Reset Done" });
});

/**
 * Password reset waction
 */
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // upload file
  const file = await cloudUpload(req);

  // now find user
  const user = await User.findByIdAndUpdate(
    id,
    {
      photo: file.secure_url,
    },
    { new: true }
  );

  res.status(201).json({ message: "Profile Photo Updated", user });
});
