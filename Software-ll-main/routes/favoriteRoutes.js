const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { isAuthenticated } = require('../middleware/authMiddleWare');

// Todas las rutas requieren autenticación
router.use(isAuthenticated);

// Ver lista de favoritos
router.get('/', favoriteController.getFavorites);

// Agregar a favoritos
router.post('/', favoriteController.addFavorite);

// Eliminar de favoritos
router.delete('/:id', favoriteController.removeFavorite);

module.exports = router;