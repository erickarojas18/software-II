const User = require('../models/userModel');
const Movie = require('../models/movieModel');
const Review = require('../models/reviewModel');
const Favorite = require('../models/favoriteModel');

// Obtener estadísticas del dashboard
const getDashboard = async (req, res) => {
    try {
        // Estadísticas generales
        const totalUsers = await User.countDocuments();
        const totalMovies = await Movie.countDocuments();
        // Solo contar reseñas de películas que existen
        const totalReviews = await Review.countDocuments({
            movie: { $in: await Movie.find().distinct('_id') }
        });

        console.log('Estadísticas generales:', { totalUsers, totalMovies, totalReviews });

        // Películas mejor valoradas (solo películas que existen)
        const topMovies = await Movie.find()
            .sort({ rating: -1 })
            .limit(5)
            .lean();

        console.log('Top películas encontradas:', topMovies);

        // Agregar conteo de reseñas válidas a cada película
        const moviesWithReviews = await Promise.all(topMovies.map(async (movie) => {
            const reviewCount = await Review.countDocuments({ movie: movie._id });
            return {
                ...movie,
                reviewCount
            };
        }));

        // Usuarios más activos (solo contar reseñas de películas existentes)
        const users = await User.find().lean();
        const usersWithActivity = await Promise.all(users.map(async (user) => {
            const reviewCount = await Review.countDocuments({
                user: user._id,
                movie: { $in: await Movie.find().distinct('_id') }
            });
            const favoriteCount = await Favorite.countDocuments({
                user: user._id,
                movie: { $in: await Movie.find().distinct('_id') }
            });
            return {
                name: user.name,
                email: user.email,
                reviewCount,
                favoriteCount
            };
        }));

        // Ordenar usuarios por actividad total y tomar los top 5
        const topUsers = usersWithActivity
            .sort((a, b) => (b.reviewCount + b.favoriteCount) - (a.reviewCount + a.favoriteCount))
            .slice(0, 5);

        // Actividad reciente (solo de películas que existen)
        const recentActivity = await Review.find({
            movie: { $in: await Movie.find().distinct('_id') }
        })
            .populate('user', 'name')
            .populate('movie', 'title')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const recentActivityFormatted = recentActivity.map(activity => ({
            type: 'review',
            date: activity.createdAt,
            description: `${activity.user?.name || 'Usuario eliminado'} calificó "${activity.movie?.title}" con ${activity.rating} estrellas`,
            user: activity.user?.name || 'Usuario eliminado'
        }));

        // Renderizar dashboard con los datos filtrados
        res.render('admin/dashboard', {
            title: 'Dashboard',
            stats: {
                totalUsers,
                totalMovies,
                totalReviews,
                topMovies: moviesWithReviews,
                topUsers,
                recentActivity: recentActivityFormatted
            }
        });
    } catch (error) {
        console.error('Error en el dashboard:', error);
        res.status(500).render('error', {
            message: 'Error al cargar el dashboard',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

module.exports = {
    getDashboard
};