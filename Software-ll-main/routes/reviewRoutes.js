const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController'); // Importa el controlador
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleWare');

// Rutas para ver reseñas (accesibles para usuarios autenticados)
router.get('/', isAuthenticated, reviewController.getAllReviews);
router.get('/:id', isAuthenticated, reviewController.getReviewDetails);

// Rutas protegidas (solo administradores)
router.delete('/:id', isAuthenticated, isAdmin, reviewController.deleteReview);

// Crear una reseña (usuarios autenticados)
router.post('/', isAuthenticated, reviewController.createReview);

// Eliminar una reseña
router.delete('/:reviewId', reviewController.deleteReview); // Asegúrate de que deleteReview esté definido

module.exports = router;