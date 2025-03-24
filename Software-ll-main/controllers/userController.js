const User = require('../models/userModel');
const Favorite = require('../models/favoriteModel');
const Movie = require('../models/movieModel');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.render('users', { title: 'Usuarios Registrados', users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los usuarios');
    }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    const { name, email, password, age, role } = req.body;
    try {
        // Validar que todos los campos requeridos estén presentes
        if (!name || !email || !password || !age) {
            return res.render('users/create', {
                title: 'Crear Usuario',
                error: 'Todos los campos son obligatorios'
            });
        }

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('users/create', {
                title: 'Crear Usuario',
                error: 'El email ya está registrado'
            });
        }

        const newUser = new User({ name, email, password, age, role });
        await newUser.save();
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.render('users/create', {
            title: 'Crear Usuario',
            error: 'Error al crear el usuario'
        });
    }
};

// Obtener el formulario de edición de un usuario
exports.getEditUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.render('editUser', { title: 'Editar Usuario', user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener el usuario para editar');
    }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, age, role } = req.body;
    try {
        // Validar que todos los campos requeridos estén presentes
        if (!name || !email || !password || !age) {
            return res.render('users/edit', {
                title: 'Editar Usuario',
                user: { _id: id, name, email, age, role },
                error: 'Todos los campos son obligatorios'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { name, email, password, age, role }, 
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.render('users/edit', {
            title: 'Editar Usuario',
            user: { _id: id, name, email, age, role },
            error: 'Error al actualizar el usuario'
        });
    }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.redirect('/users'); // Redirige a la lista de usuarios
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el usuario');
    }
};


exports.getUserFavorites = async (req, res) => {
    const { id } = req.params;

    try {
        const favorites = await Favorite.find({ user: id }).populate('movie').exec();
        res.render('users/favorites', { title: 'Mis Favoritos', favorites, user: req.session.user || null });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener las películas favoritas');
    }
};