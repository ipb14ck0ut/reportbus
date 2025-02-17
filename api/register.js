const mongoose = require('mongoose');

const mongo_pass = process.env.MONGO_PASS;

mongoose.connect(`mongodb+srv://extrapublicbus:${mongo_pass}@cluster0.8otpg.mongodb.net/`, { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('users', new mongoose.Schema({
  username: String,
  password: String
}));

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const newUser = new User({ username, password });
      await newUser.save();

      return res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
};
