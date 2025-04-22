const express = require('express');
const { SignOut, getCurrentUser, changePassword, edit } = require('../controllers/userController');

const router = express.Router();

router.get('/current', getCurrentUser);
router.post('/signout', SignOut);
router.put('/change-password', changePassword);
router.put('/', edit);

module.exports = router;
