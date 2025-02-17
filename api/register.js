const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongo_pass = process.env.MONGO_PASS;

mongoose.connect(`mongodb+srv://extrapublicbus:${mongo_pass}@cluster0.8otpg.mongodb.net/`, { useNewUrlParser: true, useUnifiedTopology: true });

// הגדרת המודל של המשתמש
const User = mongoose.model('users', new mongoose.Schema({
  username: String,
  password: String
}));

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      // בדוק אם המשתמש כבר קיים
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // הצפן את הסיסמה לפני שמירתה
      const saltRounds = 10; // מספר הסיבובים להצפנה
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // צור משתמש חדש עם הסיסמה המוצפנת
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();

      return res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
};
