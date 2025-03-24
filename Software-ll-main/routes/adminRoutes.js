const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const dashboardController = require('../controllers/dashboardController');

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'administrador') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// Aplicar el middleware isAdmin a todas las rutas
router.use(isAdmin);

// Rutas del dashboard
router.get('/dashboard', dashboardController.getDashboard);

// Rutas de gestión de usuarios
router.get('/users', userController.getAllUsers);
router.get('/users/create', (req, res) => {
    res.render('users/create', { title: 'Crear Usuario', error: null });
});
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getEditUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router; 