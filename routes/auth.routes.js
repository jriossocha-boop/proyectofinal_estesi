const express = require('express');
const router = express.Router();
const auth = require('../dao/auth.dao');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/profile', auth.verifyToken, auth.getProfile);

module.exports = router;