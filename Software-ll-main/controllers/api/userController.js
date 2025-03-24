const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
const Favorite = require('../../models/favoriteModel');
const Movie = require('../../models/movieModel');

// Obtener perfil 
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id)
            .select('-password'); 

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil del usuario' });
    }
};

// Actualizar perfil 
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, age } = req.body;
        const userId = req.session.user.id;

        // Verificar si el email ya está 
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está en uso' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, age },
            { new: true, select: '-password' }
        );

        res.json(updatedUser);
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error al actualizar el perfil' });
    }
};

// Obtener reseñas
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.session.user.id })
            .populate({
                path: 'movie',
                select: 'title director releaseYear'
            })
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        res.status(500).json({ message: 'Error al obtener las reseñas' });
    }
};

// Obtener películas favoritas 
exports.getUserFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.session.user.id })
            .populate({
                path: 'movie',
                select: 'title director releaseYear rating'
            });

        res.json(favorites);
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({ message: 'Error al obtener los favoritos' });
    }
};

// Agregar película a favoritos
exports.addToFavorites = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.session.user.id;

        
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Película no encontrada' });
        }

        // Verificar si ya está en favoritos
        const existingFavorite = await Favorite.findOne({ user: userId, movie: movieId });
        if (existingFavorite) {
            return res.status(400).json({ message: 'La película ya está en favoritos' });
        }

        const favorite = new Favorite({ user: userId, movie: movieId });
        await favorite.save();

        res.status(201).json(favorite);
    } catch (error) {
        console.error('Error al agregar a favoritos:', error);
        res.status(500).json({ message: 'Error al agregar a favoritos' });
    }
};

// Eliminar película de favoritos
exports.removeFromFavorites = async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.session.user.id;

        const favorite = await Favorite.findOneAndDelete({ user: userId, movie: movieId });
        if (!favorite) {
            return res.status(404).json({ message: 'Favorito no encontrado' });
        }

        res.json({ message: 'Película eliminada de favoritos' });
    } catch (error) {
        console.error('Error al eliminar de favoritos:', error);
        res.status(500).json({ message: 'Error al eliminar de favoritos' });
    }
};

// Crear una reseña
exports.createReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        const userId = req.session.user.id;

        // Verificar si ya existe una reseña
        const existingReview = await Review.findOne({ user: userId, movie: movieId });
        if (existingReview) {
            return res.status(400).json({ message: 'Ya has reseñado esta película' });
        }

        const review = new Review({ user: userId, movie: movieId, rating, comment });
        await review.save();

        // Actualizar rating promedio de la película
        const movie = await Movie.findById(movieId);
        const reviews = await Review.find({ movie: movieId });
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        await Movie.findByIdAndUpdate(movieId, { rating: averageRating });

        res.status(201).json(review);
    } catch (error) {
        console.error('Error al crear reseña:', error);
        res.status(500).json({ message: 'Error al crear la reseña' });
    }
};

// Actualizar una reseña
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.session.user.id;

        const review = await Review.findOne({ _id: id, user: userId });
        if (!review) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }

        review.rating = rating;
        review.comment = comment;
        await review.save();

        const movieReviews = await Review.find({ movie: review.movie });
        const averageRating = movieReviews.reduce((sum, review) => sum + review.rating, 0) / movieReviews.length;
        await Movie.findByIdAndUpdate(review.movie, { rating: averageRating });

        res.json(review);
    } catch (error) {
        console.error('Error al actualizar reseña:', error);
        res.status(500).json({ message: 'Error al actualizar la reseña' });
    }
};

// Eliminar una reseña
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user.id;

        const review = await Review.findOne({ _id: id, user: userId });
        if (!review) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }

        await review.deleteOne();

        const movieReviews = await Review.find({ movie: review.movie });
        if (movieReviews.length > 0) {
            const averageRating = movieReviews.reduce((sum, review) => sum + review.rating, 0) / movieReviews.length;
            await Movie.findByIdAndUpdate(review.movie, { rating: averageRating });
        } else {
            await Movie.findByIdAndUpdate(review.movie, { rating: 0 });
        }

        res.json({ message: 'Reseña eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar reseña:', error);
        res.status(500).json({ message: 'Error al eliminar la reseña' });
    }
}; 