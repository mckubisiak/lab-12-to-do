const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/todolist', async(req, res) => {
  try {
    const data = await client.query('SELECT * from todo_list');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});



// app.get('/api/todolist ', async(req, res) => {
//   try {
//     const data = await client.query('SELECT * from todo_list where owner_id=$1', [req.userId]);
    
//     res.json(data.rows);
//   } catch(e) {
    
//     res.status(500).json({ error: e.message });
//   }
// });


app.post('/todolist/', async(req, res) => {
  try {
    const data = await client.query(`
    INSERT INTO todo_list (todo, complete, owner_id)
    VALUES ($1, $2, 1)
    RETURNING *
  `, [
      req.body.todo, 
      req.body.complete, 
    ]);
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/todolist/:id', async(req, res) => {
  try {
    const data = await client.query(`
    UPDATE todo_list 
    SET 
      complete = true
      WHERE  id = $1
    RETURNING *
  `, [ 
      req.params.id
    ]);
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
