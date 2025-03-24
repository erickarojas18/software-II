// routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { isAuthenticated } = require('../middleware/authMiddleWare');

router.use(isAuthenticated);

router.get('/', movieController.getAllMovies);
router.get('/add', movieController.getAddMovieForm);
router.post('/add', movieController.addMovie);
router.get('/:id', movieController.getMovieDetails);
router.get('/:id/edit', movieController.getEditMovieForm);
router.put('/:id', movieController.updateMovie);
router.delete('/:id', movieController.deleteMovie);

module.exports = router;