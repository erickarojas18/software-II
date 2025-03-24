const Favorite = require('../models/favoriteModel');
const Movie = require('../models/movieModel');

exports.getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.session.user.id })
            .populate('movie')
            .exec();
        
        res.render('users/favorites', { 
            title: 'Mis Películas Favoritas', 
            favorites,
            user: req.session.user || null 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los favoritos');
    }
};

exports.addFavorite = async (req, res) => {
    try {
        const { movieId } = req.body;
        
        // Verificar si la película existe
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).send('Película no encontrada');
        }

        // Crear nuevo favorito
        const favorite = new Favorite({
            user: req.session.user.id,
            movie: movieId
        });

        await favorite.save();
        res.redirect('/favorites');
    } catch (error) {
        if (error.code === 11000) { // Error de duplicado
            res.redirect('/favorites');
        } else {
            console.error(error);
            res.status(500).send('Error al agregar a favoritos');
        }
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        
        const favorite = await Favorite.findOneAndDelete({
            _id: id,
            user: req.session.user.id
        });

        if (!favorite) {
            return res.status(404).send('Favorito no encontrado');
        }

        res.redirect('/favorites');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar de favoritos');
    }
};