const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  book_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  issue_date: { type: Date, default: Date.now },
  due_date: { type: Date, required: true },
  status: { type: String, enum: ['active', 'returned'], default: 'active' },
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan; 