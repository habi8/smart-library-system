import express from 'express';
import {
  addBook,
  searchBooks,
  getBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';

const router = express.Router();

// POST /api/books - Add a new book
router.post('/', addBook);

// GET /api/books - Search books by title, author, or genre
router.get('/', searchBooks);

// GET /api/books/:id - Get book details
router.get('/:id', getBook);

// PUT /api/books/:id - Update book information
router.put('/:id', updateBook);

// DELETE /api/books/:id - Remove a book
router.delete('/:id', deleteBook);

export default router; // Default export