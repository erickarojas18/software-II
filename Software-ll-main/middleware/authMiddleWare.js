// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {


    if (req.session.user) {
        next(); // El usuario está autenticado, continuar
    } else {
        console.log("Usuario no autenticado. Redirigiendo al login...");
        res.redirect('/auth/login'); // Redirigir al login si no está autenticado
    }
};
module.exports = { isAuthenticated };

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'administrador') {
        next(); // Permite el acceso
    } else {
        res.status(403).send('Acceso denegado'); // O redirige a una página de error
    }
};

// Exportar ambos middlewares
module.exports = { isAuthenticated, isAdmin };