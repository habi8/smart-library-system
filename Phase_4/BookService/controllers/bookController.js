const mongoose = require('mongoose');
const Book = require('../models/bookModel');

exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json({
      _id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      copies: book.copies,
      created_at: book.created_at,
    });
  } catch (error) {
    console.error('Book creation error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid book_id format' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(200).json({
      _id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      copies: book.copies,
      available_copies: book.available_copies,
      created_at: book.created_at,
    });
  } catch (error) {
    console.error('Error fetching book:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid book_id format' });
    }
    //const { title, author, genre, copies } = req.body;
   const book = await Book.findByIdAndUpdate(req.params.id)
    book.available_copies -=1;
    book.save();
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
   // await book.save();
    res.status(200).json({
      _id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      copies: book.copies,
      available_copies: book.available_copies,
      created_at: book.created_at,
      updated_at: book.updated_at,
    });
  } catch (error) {
    console.error('Error updating book:', error.message);
    res.status(400).json({ error: 'Server error: ' + error.message });
  }
};

exports.updateBookforReturns = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid book_id format' });
    }
    //const { title, author, genre, copies } = req.body;
   const book = await Book.findByIdAndUpdate(req.params.id)
    book.available_copies +=1;
    book.save();
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
   // await book.save();
    res.status(200).json({
      _id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      copies: book.copies,
      available_copies: book.available_copies,
      created_at: book.created_at,
      updated_at: book.updated_at,
    });
  } catch (error) {
    console.error('Error updating book:', error.message);
    res.status(400).json({ error: 'Server error: ' + error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid book_id format' });
    }
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting book:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};