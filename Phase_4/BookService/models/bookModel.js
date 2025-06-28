const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  genre: { type: String, required: false },
  copies: { type: Number, required: true, min: 0 },
  available_copies: { type: Number, required: true, default: 1 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;