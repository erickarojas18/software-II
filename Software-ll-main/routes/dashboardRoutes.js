const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/authMiddleWare');

// Proteger todas las rutas
router.use(isAuthenticated);

// Obtener estadísticas del dashboard
router.get('/', dashboardController.getDashboardStats);

module.exports = router;