import Book from '../models/Books.js';
import mongoose from 'mongoose';

export const addBook = async (req, res) => {
  try {
    const { title, author, isbn, genre, copies } = req.body;
    const book = new Book({
      title,
      author,
      isbn,
      genre: genre || "",
      copies,
      available_copies: copies,
    });
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const searchBooks = async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};

    if (genre) {
      query.genre = { $regex: genre, $options: "i" };
    }

    if (search) {
      const searchQuery = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
          { genre: { $regex: search, $options: "i" } },
        ],
      };
      query = { ...query, ...searchQuery };
    }

    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { title, author, isbn, genre, copies, available_copies } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, isbn, genre, copies, available_copies, updated_at: Date.now() },
      { new: true }
    );
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: "Invalid book_id format" });
    }

    const book = await Book.findByIdAndDelete(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting book:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

// Helper methods for other controllers
export const getBookById = async (bookId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      throw new Error("Invalid book_id format");
    }
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error("Book not found");
    }
    return book;
  } catch (error) {
    throw error;
  }
};

export const updateBookById = async (bookId, updates) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      throw new Error("Invalid book_id format");
    }
    const book = await Book.findByIdAndUpdate(
      bookId,
      { ...updates, updated_at: Date.now() },
      { new: true }
    );
    if (!book) {
      throw new Error("Book not found");
    }
    return book;
  } catch (error) {
    throw error;
  }
};

export const getAllBooksCount = async () => {
  try {
    const count = await Book.countDocuments();
    return count;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getTotalAvailableCopies = async () => {
  try {
    const books = await Book.aggregate([{ $group: { _id: null, total: { $sum: "$available_copies" } } }]);
    return books[0]?.total || 0;
  } catch (error) {
    throw new Error(error.message);
  }
};