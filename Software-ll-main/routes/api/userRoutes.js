const express = require('express');
const router = express.Router();
const userController = require('../../controllers/api/userController');
const { isAuthenticated } = require('../../middleware/authMiddleWare');

// Aplicar middleware de autenticación a todas las rutas
router.use(isAuthenticated);

// Rutas de perfil
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Rutas de reseñas
router.get('/reviews', userController.getUserReviews);
router.post('/reviews', userController.createReview);
router.put('/reviews/:id', userController.updateReview);
router.delete('/reviews/:id', userController.deleteReview);

// Rutas de favoritos
router.get('/favorites', userController.getUserFavorites);
router.post('/favorites', userController.addToFavorites);
router.delete('/favorites/:movieId', userController.removeFromFavorites);

module.exports = router; 