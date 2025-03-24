// controllers/authController.js
const User = require('../models/userModel');

exports.getLoginForm = (req, res) => {
    res.render('auth/login', { title: 'Iniciar Sesión' });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        
        if (!user || user.password !== password) {
            return res.render('auth/login', {
                title: 'Iniciar Sesión',
                error: 'Email o contraseña incorrectos'
            });
        }

        req.session.user = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('auth/login', {
            title: 'Iniciar Sesión',
            error: 'Error al iniciar sesión'
        });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/auth/login');
    });
};

exports.getRegisterForm = (req, res) => {
    res.render('auth/register', { 
        title: 'Registro',
        error: null
    });
};

exports.register = async (req, res) => {
    const { name, email, password, age } = req.body;

    try {
        // Validaciones básicas
        if (!name || !email || !password || !age) {
            return res.render('auth/register', {
                title: 'Registro',
                error: 'Todos los campos son obligatorios'
            });
        }

        // Validar edad
        if (age < 0 || age > 120) {
            return res.render('auth/register', {
                title: 'Registro',
                error: 'La edad debe estar entre 0 y 120 años'
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.render('auth/register', {
                title: 'Registro',
                error: 'Por favor, ingrese un email válido'
            });
        }

        // Validar contraseña
        if (password.length < 6) {
            return res.render('auth/register', {
                title: 'Registro',
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar si el email ya está registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('auth/register', {
                title: 'Registro',
                error: 'El correo ya está registrado'
            });
        }

        // Crear nuevo usuario
        const newUser = new User({
            name,
            email,
            password,
            age: parseInt(age),
            role: 'usuario' // Rol por defecto
        });

        await newUser.save();

        // Redirigir al login con mensaje de éxito
        res.render('auth/login', {
            title: 'Iniciar Sesión',
            success: 'Registro exitoso. Por favor, inicie sesión.'
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.render('auth/register', {
            title: 'Registro',
            error: 'Error al registrar el usuario. Por favor, intente nuevamente.'
        });
    }
};