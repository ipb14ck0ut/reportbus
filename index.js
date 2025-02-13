const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

mongo_pass = process.env.MONGO_PASS;
// MongoDB connection
mongoose.connect(`mongodb+srv://extrapublicbus:${mongo_pass}@cluster0.8otpg.mongodb.net/`, { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String
}));

app.use(bodyParser.json());

// API endpoint for login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (user) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
