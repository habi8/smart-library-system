import Loan from '../models/Loans.js';
import mongoose from 'mongoose';
import * as bookController from './bookController.js';
import * as userController from './userController.js';

export const createLoan = async (req, res) => {
  const { user_id, book_id, due_date } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "Invalid user_id format" });
    }
    if (!mongoose.Types.ObjectId.isValid(book_id)) {
      return res.status(400).json({ error: "Invalid book_id format" });
    }

    const user = await userController.getUserById(user_id, res);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const book = await bookController.getBookById(book_id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    if (book.available_copies <= 0) {
      return res.status(400).json({ error: "No copies available" });
    }

    const dueDate = new Date(due_date);
    if (isNaN(dueDate) || dueDate <= new Date()) {
      return res.status(400).json({ error: "Invalid or past due_date" });
    }

    const loan = new Loan({
      user_id,
      book_id,
      due_date: dueDate,
    });

    book.available_copies -= 1;
    await bookController.updateBookById(book_id, { available_copies: book.available_copies });

    await loan.save();

    res.status(201).json({
      _id: loan._id,
      user_id: loan.user_id,
      book_id: loan.book_id,
      issue_date: loan.issue_date,
      due_date: loan.due_date,
      return_date: loan.return_date,
      status: loan.status,
      extensions_count: loan.extensions_count,
      created_at: loan.created_at,
      updated_at: loan.updated_at,
    });
  } catch (error) {
    console.error("Loan creation error:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const getAllLoans = async (req = {}, res) => {
  try {
    const { status } = req.query || {};
    let query = {};

    if (status) {
      if (["ACTIVE", "RETURNED"].indexOf(status.toUpperCase()) === -1) {
        if (res) {
          return res.status(400).json({ error: "Invalid status value. Use 'ACTIVE' or 'RETURNED'" });
        }
        throw new Error("Invalid status value. Use 'ACTIVE' or 'RETURNED'");
      }
      query = { status: status.toUpperCase() };
    }

    const loans = await Loan.find(query).lean();

    const currentDate = new Date();
    const loansWithOverdue = loans.map(loan => ({
      ...loan,
      overdue: loan.status === "ACTIVE" && new Date(loan.due_date) < currentDate,
    }));

    if (res) {
      res.status(200).json(loansWithOverdue);
    } else {
      return loansWithOverdue;
    }
  } catch (error) {
    if (res) {
      console.error("Error fetching loans:", error.message);
      res.status(500).json({ error: "Server error: " + error.message });
    } else {
      throw new Error("Error fetching loans: " + error.message);
    }
  }
};

export const getLoan = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid loan_id format" });
    }
    const loan = await Loan.findById(req.params.id).lean();
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const currentDate = new Date();
    const overdue = loan.status === "ACTIVE" && new Date(loan.due_date) < currentDate;

    res.status(200).json({
      _id: loan._id,
      user_id: loan.user_id,
      book_id: loan.book_id,
      issue_date: loan.issue_date,
      due_date: loan.due_date,
      return_date: loan.return_date,
      status: loan.status,
      extensions_count: loan.extensions_count,
      created_at: loan.created_at,
      updated_at: loan.updated_at,
      overdue: overdue,
    });
  } catch (error) {
    console.error("Error fetching loan:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const returnLoan = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid loan_id format" });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    if (loan.status !== "ACTIVE") {
      return res.status(400).json({ error: "Loan already returned" });
    }

    const book = await bookController.getBookById(loan.book_id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    loan.status = "RETURNED";
    loan.return_date = new Date();
    loan.updated_at = new Date();
    await loan.save();

    book.available_copies += 1;
    await bookController.updateBookById(loan.book_id, { available_copies: book.available_copies });

    res.status(200).json({
      _id: loan._id,
      user_id: loan.user_id,
      book_id: loan.book_id,
      issue_date: loan.issue_date,
      due_date: loan.due_date,
      return_date: loan.return_date,
      status: loan.status,
      extensions_count: loan.extensions_count,
      created_at: loan.created_at,
      updated_at: loan.updated_at,
    });
  } catch (error) {
    console.error("Loan return error:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const getUserLoans = async (req, res) => {
  try {
    const userId = req.params.user_id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user_id format" });
    }

    const loans = await Loan.find({ user_id: userId }).lean();

    const currentDate = new Date();
    const formattedLoans = loans
      .filter((loan) => {
        return true;
      })
      .map((loan) => ({
        id: loan._id.toString(),
        book: { id: loan.book_id.toString() },
        issue_date: loan.issue_date.toISOString(),
        due_date: loan.due_date.toISOString(),
        return_date: loan.return_date ? loan.return_date.toISOString() : null,
        status: loan.status,
        overdue: loan.status === "ACTIVE" && new Date(loan.due_date) < currentDate,
      }));

    res.status(200).json(formattedLoans);
  } catch (error) {
    console.error("Error fetching user loans:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const extendLoan = async (req, res) => {
  try {
    const { extension_days } = req.body;

    if (!extension_days || typeof extension_days !== 'number' || !Number.isInteger(extension_days) || extension_days <= 0) {
      return res.status(400).json({ error: "extension_days must be a positive integer" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid loan_id format" });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    if (loan.status !== "ACTIVE") {
      return res.status(400).json({ error: "Only active loans can be extended" });
    }

    const currentDate = new Date();
    if (new Date(loan.due_date) < currentDate) {
      return res.status(400).json({ error: "Cannot extend an overdue loan" });
    }

    if (loan.extensions_count >= 2) {
      return res.status(400).json({ error: "Maximum extension limit (2) reached" });
    }

    const newDueDate = new Date(loan.due_date);
    newDueDate.setDate(newDueDate.getDate() + extension_days);

    if (newDueDate <= currentDate) {
      return res.status(400).json({ error: "New due date must be in the future" });
    }

    loan.due_date = newDueDate;
    loan.extensions_count += 1;
    loan.updated_at = new Date();
    await loan.save();

    res.status(200).json({
      _id: loan._id,
      user_id: loan.user_id,
      book_id: loan.book_id,
      issue_date: loan.issue_date,
      due_date: loan.due_date,
      return_date: loan.return_date,
      status: loan.status,
      extensions_count: loan.extensions_count,
      created_at: loan.created_at,
      updated_at: loan.updated_at,
    });
  } catch (error) {
    console.error("Loan extension error:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const getOverdueLoans = async (req, res) => {
  try {
    const currentDate = new Date();
    const overdueLoans = await Loan.find({
      status: 'ACTIVE',
      due_date: { $lt: currentDate },
    }).lean();

    const formattedLoans = await Promise.all(
      overdueLoans.map(async (loan) => {
        const user = await userController.getUserById(loan.user_id, res);
        if (!user || res.headersSent) return null;

        const book = await bookController.getBookById(loan.book_id);
        if (!book || res.headersSent) return null;

        const dueDate = new Date(loan.due_date);
        const timeDiff = currentDate - dueDate;
        const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        return {
          id: loan._id.toString(),
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          },
          book: {
            id: book._id.toString(),
            title: book.title,
            author: book.author,
          },
          issue_date: loan.issue_date.toISOString(),
          due_date: loan.due_date.toISOString(),
          days_overdue: daysOverdue >= 0 ? daysOverdue : 0,
        };
      })
    );

    const result = formattedLoans.filter(loan => loan !== null);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching overdue loans:", error.message, error.stack);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const getActiveLoansCount = async () => {
  try {
    const count = await Loan.countDocuments({ status: "ACTIVE" });
    return count;
  } catch (error) {
    throw new Error("Server error: " + error.message);
  }
};

export const getOverdueLoansCount = async () => {
  try {
    const count = await Loan.countDocuments({ status: "ACTIVE", due_date: { $lt: new Date() } });
    return count;
  } catch (error) {
    throw new Error("Server error: " + error.message);
  }
};

export const getLoansTodayCount = async (today) => {
  try {
    const count = await Loan.countDocuments({ issue_date: { $gte: today } });
    return count;
  } catch (error) {
    throw new Error("Server error: " + error.message);
  }
};

export const getReturnsTodayCount = async (today) => {
  try {
    const count = await Loan.countDocuments({ return_date: { $gte: today } });
    return count;
  } catch (error) {
    throw new Error("Server error: " + error.message);
  }
};

export const getUserBorrowStats = async () => {
  try {
    const loans = await getAllLoans(); // Fetch all loans without sending response
    const userStats = loans.reduce((acc, loan) => {
      acc[loan.user_id] = (acc[loan.user_id] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(userStats).map(([user_id, books_borrowed]) => ({ user_id, books_borrowed }));
  } catch (error) {
    throw new Error("Error fetching user borrow stats: " + error.message);
  }
};