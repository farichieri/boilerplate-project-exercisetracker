const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

app.use(express.urlencoded());

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const users = [];

app.post('/api/users', (req, res) => {
  const user = req.body.username;

  const findIndex = users.indexOf(user);

  if (findIndex < 0) {
    const newUserId = uuidv4();
    const newUser = {
      username: user,
      _id: newUserId,
      exercises: [],
    };
    users.push(newUser);

    return res.json({ username: newUser.username, _id: newUser._id });
  }
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, date, duration } = req.body;
  const { _id } = req.params;

  const findUser = users.find((user) => user._id === _id);

  let result = {
    _id: _id,
    username: findUser.username,
    date: date
      ? new Date(date).toDateString()
      : new Date(Date.now()).toDateString(),
    duration: Number(duration),
    description: description,
  };

  return res.json(result);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;

  console.log({ users });
  console.log(_id);

  const findUser = users.find((user) => user._id === _id);

  console.log({ findUser });

  return res.json({
    _id: _id,
    username: findUser.username,
    count: findUser.exercises.length,
    logs: findUser.exercises,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
