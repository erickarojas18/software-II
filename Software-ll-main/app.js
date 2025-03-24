const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const session = require('express-session');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const movieRouter = require('./routes/movieRoutes'); 
const reviewRouter = require('./routes/reviewRoutes');
const favoriteRouter = require('./routes/favoriteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { isAuthenticated, isAdmin } = require('./middleware/authMiddleWare');
const apiUserRoutes = require('./routes/api/userRoutes');

dotenv.config();

const app = express();
const port = 3002;

// Configuración de express-session
app.use(session({
    secret: process.env.SESSION_SECRET || 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Middleware para pasar el usuario a todas las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayout);
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Agregar middleware para procesar JSON
app.use(express.static(path.join(__dirname, 'css')));
app.use(methodOverride('_method'));

// Conectar a MongoDB
mongoose.connect(process.env.MONGOD_URI)
    .then(() => console.log("Conectado a MongoDB Atlas"))
    .catch((error) => console.error("Error al conectar a MongoDB Atlas: ", error));

// Rutas públicas (no requieren autenticación)
app.use('/auth', authRouter);

// Rutas de API (requieren autenticación)
app.use('/api/users', isAuthenticated, apiUserRoutes);

// Redirigir la ruta principal al login si no está autenticado
app.get('/', (req, res) => {
    if (!req.session.user) {
        res.redirect('/auth/login');
    } else {
        res.render('index', { title: 'Bienvenido' });
    }
});

// Rutas protegidas (requieren autenticación)
app.use('/users', isAuthenticated, userRouter);
app.use('/movies', isAuthenticated, movieRouter); 
app.use('/reviews', isAuthenticated, reviewRouter);
app.use('/favorites', isAuthenticated, favoriteRouter);
app.use('/admin', isAuthenticated, isAdmin, adminRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
    // Si la ruta comienza con /api, devolver error 404 en formato JSON
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    // Para otras rutas, redirigir al login
    res.redirect('/auth/login');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});