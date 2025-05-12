import moment from 'moment';
import * as bookController from './bookController.js';
import * as userController from './userController.js';
import * as loanController from './loanController.js';

export const getPopularBooks = async (req, res) => {
  try {
    const loans = await loanController.getAllLoans();
    const popularBooks = Object.entries(
      loans.reduce((acc, loan) => {
        acc[loan.book_id] = (acc[loan.book_id] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([book_id, borrow_count]) => ({ book_id, borrow_count }))
      .sort((a, b) => b.borrow_count - a.borrow_count)
      .slice(0, 3)
      .map(async ({ book_id, borrow_count }) => {
        const book = await bookController.getBookById(book_id);
        return { book_id, title: book?.title, author: book?.author, borrow_count };
      });

    const resolvedBooks = await Promise.all(popularBooks);
    res.status(200).json(resolvedBooks.filter(book => book !== undefined));
  } catch (error) {
    console.error("Error fetching popular books:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const userStats = await loanController.getUserBorrowStats();
    const topUsers = userStats
      .sort((a, b) => b.books_borrowed - a.books_borrowed)
      .slice(0, 3)
      .map(async ({ user_id, books_borrowed }) => {
        const user = await userController.getUserById(user_id);
        return { user_id, name: user?.name, books_borrowed };
      });

    const resolvedUsers = await Promise.all(topUsers);
    res.status(200).json(resolvedUsers.filter(user => user !== undefined));
  } catch (error) {
    console.error("Error fetching active users:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const getOverviewStats = async (req, res) => {
  try {
    const totalBooks = await bookController.getAllBooksCount();
    const totalUsers = await userController.getAllUsersCount();
    const booksAvailable = await bookController.getTotalAvailableCopies();
    const booksBorrowed = await loanController.getActiveLoansCount();
    const overdueLoans = await loanController.getOverdueLoansCount();
    const today = moment().startOf("day").toDate();
    const loansToday = await loanController.getLoansTodayCount(today);
    const returnsToday = await loanController.getReturnsTodayCount(today);

    res.status(200).json({
      total_books: totalBooks,
      total_users: totalUsers,
      books_available: booksAvailable,
      books_borrowed: booksBorrowed,
      overdue_loans: overdueLoans,
      loans_today: loansToday,
      returns_today: returnsToday,
    });
  } catch (error) {
    console.error("Error fetching overview stats:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};