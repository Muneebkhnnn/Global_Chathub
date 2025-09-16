import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { deleteFromCloudinary } from "../utils/Cloudinary.js";
import { Resend } from "resend";
import crypto from "crypto";
import { io } from "../socket/socket.js";

const SignUp = asyncHandler(async (req, res) => {
  const { fullName, username, password, gender, confirmPassword, email } =
    req.body;

  if (
    [username, fullName, password, gender, email].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingEmail = await User.findOne({ email });

  if (existingEmail && existingEmail.isVerified === true) {
    throw new ApiError(409, "User already exists with this email");
  }

  if (existingEmail && existingEmail.isVerified === false) {
    throw new ApiError(
      409,
      "Email already registered but not verified. Please verify yourself here",
      {
        code: "Email_not_verified",
        email: email,
      }
    );
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    throw new ApiError(409, "User already exists with this username");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const avatar =
    gender === "male"
      ? "https://img.icons8.com/?size=100&id=21441&format=png&color=000000"
      : "https://img.icons8.com/?size=100&id=23256&format=png&color=000000";

  // Create user
  const user = await User.create({
    fullName,
    username,
    password,
    gender,
    avatar,
    email,
  });

  const verificationtoken = crypto.randomBytes(32).toString("hex");

  user.verificationToken = verificationtoken;
  user.verificationTokenExpires = Date.now() + 10 * 60 * 1000; 
  await user.save();
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Please Verify your email",
      html: `
              <h2>Verify Email</h2>
              <p>Hello ${user.username},</p>
              <p>Click the button below to Verify your email:</p>
              <a href="${process.env.CLIENT_URL}/verify-email/${verificationtoken}" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                 Verify Email
              </a>
              <p>This link will expire in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            `,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new ApiError(
      500,
      "Something went wrong while sending email: " + error.message
    );
  }

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "user registered successfully", createdUser));
});

const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "invalid token");
  }

  const user = await User.findOne({ verificationToken: verificationToken });

  if (!user) {
    throw new ApiError(404, "Invalid or expired verification token");
  }

  if (
    user.verificationTokenExpires &&
    user.verificationTokenExpires < Date.now()
  ) {
    throw new ApiError(
      400,
      "Verification token has expired. Please request a new one."
    );
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "user verified successfully", {}));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  if (user.isVerified) {
    throw new ApiError(400, "User is already verified");
  }

  const verificationtoken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = verificationtoken;
  user.verificationTokenExpires = Date.now() + 15 * 60 * 1000; 
  await user.save();

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Please Verify your email",
      html: `
              <h2>Verify Email</h2>
              <p>Hello ${user.username},</p>
              <p>Click the button below to Verify your email:</p>
              <a href="${process.env.CLIENT_URL}/verify-email/${verificationtoken}" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                 Verify Email
              </a>
              <p>This link will expire in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            `,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new ApiError(
      500,
      "Something went wrong while sending email: " + error.message
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Verification email resent", {}));
});

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if ([identifier, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Username and password are required");
  }

  const isEmail = (str) => /\S+@\S+\.\S+/.test(str);

  let user;

  if (isEmail(identifier)) {
    user = await User.findOne({ email: identifier });
  } else {
    user = await User.findOne({ username: identifier });
  }

  if (!user) {
    throw new ApiError(404, "Please enter valid username/email or password");
  }

  const isPasswordMatched = await user.isPasswordCorrect(password);

  if (!isPasswordMatched) {
    throw new ApiError(404, "Please enter valid username or password");
  }

  if (!user.isVerified) {
    throw new ApiError(400, "Please verify yourself");
  }

  const tokenData = {
    _id: user._id,
  };

  const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d", 
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true, 
    secure: true, 
    sameSite: "None", 
  };

  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        token,
      })
    );
});

const getProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "User profile fetched successfully", req.user));
});

const logout = asyncHandler(async (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now()), 
    httpOnly: true, 
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("token", "", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully"));
});

const otherUsers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit);
  const skip = parseInt(req.query.skip);
  const myId = req.user._id;

  const users = await User.aggregate([
    { $match: { _id: { $ne: myId } } },

    {
      $lookup: {
        from: "conversations",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$userId", "$members"] },
                  { $in: [myId, "$members"] },
                ],
              },
            },
          },
          { $sort: { lastMessageAt: -1 } },
          { $limit: 1 },

          {
            $project: {
              lastMessageAt: 1,
              "lastMessage.text": 1 ,
              "lastMessage.senderId":1
            },
          },
        ],
        as: "conversation",
      },
    },
    {
      $addFields: {
        lastUpdated: {
          $ifNull: [
            { $arrayElemAt: ["$conversation.lastMessageAt", 0] },
            "$createdAt",
          ],
        },
        lastMessage: {
          $ifNull: [{ $arrayElemAt: ["$conversation.lastMessage.text", 0] }, ""],
        },
        lastMessageSenderId:{
          $ifNull: [{ $arrayElemAt: ["$conversation.lastMessage.senderId", 0] }, ""],
        }
      },
    },
    {
      $project: {
        fullName:1,
        username: 1,
        avatar: 1, 
        email: 1, 
        lastMessage: 1,
        lastMessageSenderId:1,
        lastUpdated: 1,
      },
    },
    { $sort: { lastUpdated: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  return res.status(200).json(new ApiResponse(200, null, users));
});

const editProfile = asyncHandler(async (req, res) => {
  const { username, fullName } = req.body;

  const avatarLocalPath = req.file?.path;
  let avatar;

  try {
    if ([username, fullName].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    const updatedData = { username, fullName };

    if (avatarLocalPath) {
      avatar = await uploadOnCloudinary(avatarLocalPath);
      updatedData.avatar = avatar.url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: updatedData,
      },
      { new: true }
    ).select("-password");
    
    io.emit('profileUpdated', user);
    
    return res
      .status(200)
      .json(new ApiResponse(200, "user details updated successfully", user));
  } catch (error) {
    if (avatar && avatar.public_id) {
      await deleteFromCloudinary(avatar.public_id);
    }

    throw new ApiError(500, "failed to update Profile");
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  const resetPasswordToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 
  await user.save();

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Forgot password",
      html: `
              <h2>Forgot Password</h2>
              <p>Hello ${user.username},</p>
              <p>Click the button below to Reset your password:</p>
              <a href="${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                 Reset Password
              </a>
              <p>This link will expire in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            `,
    });
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while sending email: " + error.message
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "If this email exist a reset link has been sent  ",
        {}
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { password, confirmPassword } = req.body;

  if (!resetPasswordToken) {
    throw new ApiError(400, "invalid token");
  }

  if (!password || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(404, "Inavlid Token");
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password Reset Successfull", {}));
});
export {
  SignUp,
  login,
  getProfile,
  logout,
  otherUsers,
  editProfile,
  verifyUser,
  resendVerificationEmail,
  forgetPassword,
  resetPassword,
};
