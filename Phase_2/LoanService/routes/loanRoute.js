const express = require('express');
const router = express.Router();
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const {
  createLoan,
  getLoan,
  getAllLoans,
  returnLoan,
  getUserLoanHistory
} = require('../controllers/loanController');

router.post('/', createLoan);
router.get('/:id',getLoan);
router.get('/', getAllLoans);
router.post('/returns', returnLoan);
router.get('/user/:id', getUserLoanHistory)

// router.get('/ping-user', async (req, res) => {
// try {
// const r = await axios.get('http://localhost:3001/api/users');
// res.send(r.data);
// } catch (err) {
// res.status(503).json({ error: 'User Service unavailable', details: err.message });
// }
// });

module.exports = router;