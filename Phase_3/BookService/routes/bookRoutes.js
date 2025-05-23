const express = require('express');
const router = express.Router();
const {
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
  updateBookforReturns
} = require('../controllers/bookController');

router.post('/', createBook);
router.get('/', getAllBooks);
router.get('/:id', getBook);
router.put('/:id', updateBook);
router.post('/:id', updateBookforReturns);
router.delete('/:id', deleteBook);

module.exports = router;