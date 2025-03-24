// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleWare');

router.use(isAuthenticated);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id/edit', userController.getEditUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id/favorites', userController.getUserFavorites);

module.exports = router;
