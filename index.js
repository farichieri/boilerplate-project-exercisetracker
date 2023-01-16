const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const User = require('./models/user');
const { ObjectId } = require('mongodb');

app.use(express.urlencoded());

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

class Database {
  constructor() {
    this._connect();
  }
  _connect() {
    mongoose
      .connect(process.env['MONGO_URI'], {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('Database connection successful');
      })
      .catch((err) => {
        console.error('Database connection error');
      });
  }
}

new Database();

app.use((req, res, next) => {
  const { method, path, ip } = req;
  console.log(`${method} ${path} - ${ip}`);
  next();
});

const normalizeDate = (date) => {
  return new Date(
    new Date(date).getTime() +
      Math.abs(new Date(date).getTimezoneOffset() * 60000)
  );
};

app.post('/api/users', (req, res) => {
  const user = req.body.username;

  const newUser = new User({
    _id: new ObjectId(),
    username: user,
    exercises: [],
  });

  newUser
    .save()
    .then((doc) => {
      res.status(200).json({ username: doc.username, _id: doc._id });
    })
    .catch((err) => {
      res.status(400).json({ error: 'Error creating user' });
    });
});

app.get('/api/users', (req, res) => {
  User.find()
    .then((doc) => res.status(200).json(doc))
    .catch((err) => res.status(400).json({ error: 'Error finding users' }));
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, date, duration } = req.body;
  const { _id } = req.params;

  if (!description || !duration || !_id) {
    return res.json('Complete required fields: description, date, id');
  }

  const exercise = {
    description: description,
    duration: Number(duration),
    date: date
      ? new Date(
          new Date(date).getTime() +
            Math.abs(new Date(date).getTimezoneOffset() * 60000)
        ).toDateString()
      : new Date().toDateString(),
  };

  User.findById({
    _id: _id,
  }).then((doc) => {
    doc.exercises.push(exercise);
    doc
      .save()
      .then((docUpdated) => {
        res.status(200).json({
          _id: _id,
          username: docUpdated.username,
          date: exercise.date,
          duration: exercise.duration,
          description: exercise.description,
        });
      })
      .catch((err) =>
        res.status(400).json({ error: 'Error creating exercise' })
      );
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  let { from, to, limit } = req.query;

  from = from || new Date(1970);
  to = to || Date.now();
  limit = limit || Infinity;

  User.findById({
    _id: _id,
  })
    .then((doc) => {
      res.status(200).json({
        _id: doc._id,
        username: doc.username,
        from: from ? normalizeDate(from).toDateString() : '',
        to: to ? normalizeDate(to).toDateString() : '',
        count: doc.exercises.length,
        log: doc.exercises
          .filter(
            (exercise) =>
              new Date(exercise.date) >= normalizeDate(from) &&
              new Date(exercise.date) <= normalizeDate(to)
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, limit),
      });
    })
    .catch((err) => {
      res.status(400).json({ error: 'Error finding logs of user' });
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
