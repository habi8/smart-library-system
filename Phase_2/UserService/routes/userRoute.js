const express = require('express');
const router = express.Router();
const c = require('../controllers/userController');

router.post('/',c.createUser)

module.exports = router;