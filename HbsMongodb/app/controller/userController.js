const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/todo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a schema for the todo item
const todoSchema = new mongoose.Schema({
  title: String,
  content: String,
  status: {
    type: Boolean,
    default: false,
  },
  due_date: Date,
});

// Create a model for the todo item
const Todo = mongoose.model('Todo', todoSchema);

// Parse the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define the API routes
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/todos', async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    content: req.body.content,
    status: req.body.status || false,
    due_date: req.body.due_date,
  });

  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/todos/:id', getTodo, (req, res) => {
  res.json(res.todo);
});

app.patch('/todos/:id', getTodo, async (req, res) => {
  if (req.body.title != null) {
    res.todo.title = req.body.title;
  }

  if (req.body.content != null) {
    res.todo.content = req.body.content;
  }

  if (req.body.status != null) {
    res.todo.status = req.body.status;
  }

  if (req.body.due_date != null) {
    res.todo.due_date = req.body.due_date;
  }

  try {
    const updatedTodo = await res.todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/todos/:id', getTodo, async (req, res) => {
  try {
    await res.todo.remove();
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get a todo by ID
async function getTodo(req, res, next) {
  try {
    const todo = await Todo.findById(req.params.id);
    if (todo == null) {
      return res.status(404).json({ message: 'Cannot find todo' });
    }
    res.todo = todo;
    next();
  } catch (err) {
    return res.status(500)
