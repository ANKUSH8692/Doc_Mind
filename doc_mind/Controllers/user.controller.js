import express from "express"
import bcrypt from "bcrypt"
import JWT from "jsonwebtoken"

import user_model from "../models/user_model.js"
import authMidlleware from "./../Middleware/auth.middleware.js"

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const email_exists = await user_model.findOne({ email: email });
    if (email_exists) {
      res.json({
        message: "already exists",
        success: false
      })
    }
    const pass_hash = await bcrypt.hash(password, 10);

    const new_user = new user_model({
      name: name,
      email: email,
      password: pass_hash
    })

    await new_user.save();
    console.log("singup page");
    res.status(201).json({
      message: 'User created successfully',
      data: {
        new_user
      },
      success:true
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false
    });
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await user_model.findOne({ email }).select('+password');
    if (!user) {
      return res.json({
        message: "User Not Exists",
        success: false
      })
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.json({
        message: "Not a valid user",
        success: false
      })
    }

    const token = JWT.sign({ user_Id: user._id }, process.env.secret_key, { expiresIn: "1d" });

    res.json({
      message: " Sucessfully login",
      token: token,
      success: true
    })

  } catch (err) {
    res.status(400).send({
      message:  'Server Error: ' + err.message,
      success: false
    })
  }
});
router.get('/profile', authMidlleware, async (req, res) => {
  try {
    const User = await user_model.findById(req.user.id).select('-password');
    if (!User) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: User
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;