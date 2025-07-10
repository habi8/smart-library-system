const mongoose = require('mongoose');
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const Loan = require('../models/loanModel');

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  shouldResetTimeout: true,
});
const axiosInstance = axios.create({
  timeout: 5000, 
});



exports.createLoan = async (req, res) => {
  try {
    const { user_id,  book_id, due_date } = req.body;

   
    try {
      await axiosInstance.get(`http://userservice:3001/api/users/${user_id}`);
    } catch (err) {
      if (err.response?.status === 404) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(503).json({ error: 'User Service unavailable' });
    }

   
    let bookResponse;
    try {
      bookResponse = await axiosInstance.get(`http://localhost:3002/api/books/${book_id}`);
    } catch (err) {
      if (err.response?.status === 404) {
        return res.status(404).json({ error: 'Book not found' });
      }
      return res.status(503).json({ error: 'Book Service unavailable' });
    }
    const book = bookResponse.data;
    if (book.available_copies <= 0) {
      return res.status(400).json({ error: 'No copies available' });
    }

    // Update Book Availability
    try {
      await axiosInstance.put(`http://localhost:3002/api/books/${book_id}`, {
        ...book,
        available_copies : bookResponse.available_copies
      });
    } catch (err) {
      return res.status(503).json({ error: 'Failed to update book availability' });
    }

    // Create Loan
    const loan = new Loan({ user_id, book_id, due_date });
    await loan.save();
    res.status(201).json({
      _id: loan._id,
      userId: loan.user_id,
      bookId: loan.book_id,
      issueDate: loan.issue_date,
      dueDate: loan.due_date,
      status: loan.status,
    });
  } catch (error) {
    console.error('Loan creation error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getLoan = async (req, res) => {
try {
const loan = await Loan.findById(req.params.id);
if (!loan) return res.status(404).json({ error: 'Loan not found' });
let user = {};
try {
  const userResp = await axios.get(`http://localhost:3001/api/users/${loan.user_id}`);
  user = {
    _id: userResp.data._id,
    name: userResp.data.name,
    email: userResp.data.email,
  };
} catch (err) {
  console.error('Error fetching user:', err.message);
  user = {
    _id: loan.user_id,
    error: 'User data unavailable',
  };
}

let book = {};
try {
  const bookResp = await axios.get(`http://localhost:3002/api/books/${loan.book_id}`);
  book = {
    _id: bookResp.data._id,
    title: bookResp.data.title,
    author: bookResp.data.author,
  };
} catch (err) {
  console.error('Error fetching book:', err.message);
  book = {
    _id: loan.book_id,
    error: 'Book data unavailable',
  };
}

res.json({
  id: loan._id,
  user,
  book,
  issue_date: loan.issue_date,
  due_date: loan.due_date,
  return_date: loan.return_date,
  status: loan.status,
});

} catch (err) {
console.error('Error fetching loan:', err.message);
res.status(500).json({ error: 'Internal server error' });
}
};



exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find();
    res.status(200).json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};


exports.returnLoan = async (req, res) => {
  try {
    const { loan_id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(loan_id)) {
      return res.status(400).json({ error: 'Invalid loan_id format' });
    }
    const loan = await Loan.findById(loan_id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    if (loan.status === 'returned') {
      return res.status(400).json({ error: 'Loan already returned' });
    }

    
    let bookResponse;
    try {
      bookResponse = await axiosInstance.get(`http://localhost:3002/api/books/${loan.book_id}`);
    } catch (err) {
      return res.status(503).json({ error: 'Book Service unavailable' });
    }
    const book = bookResponse.data;

    
    try {
      await axiosInstance.post(`http://localhost:3002/api/books/${loan.book_id}`, {
        ...book,
        available_copies: book.available_copies,
      });
    } catch (err) {
      return res.status(503).json({ error: 'Failed to update book availability' });
    }

    // Mark Loan as Returned
    loan.status = 'returned';
    await loan.save();
    res.status(200).json({
      _id: loan._id,
      userId: loan.user_id,
      bookId: loan.book_id,
      issueDate: loan.issue_date,
      dueDate: loan.due_date,
      status: loan.status,
    });
  } catch (error) {
    console.error('Error returning loan:', error.message);
    res.status(400).json({ error: error.message });
  }
};

//get loan history
exports.getUserLoanHistory = async (req, res) => {
const userId = req.params.id;

try {
const loans = await Loan.find({ user_id: userId });
const enrichedLoans = await Promise.all(loans.map(async (loan) => {
  let book = {};

  try {
    const bookResp = await axios.get(`http://localhost:3002/api/books/${loan.book_id}`);
    book = {
      id: bookResp.data._id,
      title: bookResp.data.title,
      author: bookResp.data.author,
    };
  } catch (err) {
    console.error(`Failed to fetch book ${loan.book_id}:`, err.message);
    book = {
      id: loan.book_id,
      error: 'Book data unavailable',
    };
  }

  return {
    id: loan._id,
    book,
    issue_date: loan.issue_date,
    due_date: loan.due_date,
    return_date: loan.return_date,
    status: loan.status,
  };
}));

res.json({
  loans: enrichedLoans,
  total: enrichedLoans.length,
});

} catch (error) {
console.error('Error fetching user loan history:', error.message);
res.status(500).json({ error: 'Internal server error' });
}
};