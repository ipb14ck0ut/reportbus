const mongoose = require('mongoose');

const mongo_pass = process.env.MONGO_PASS;

mongoose.connect(`mongodb+srv://extrapublicbus:${mongo_pass}@cluster0.8otpg.mongodb.net/`, { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String
}));

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username, password });

      if (user) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
};
