const Review = require('../models/reviewModel');
const Movie = require('../models/movieModel');

// Crear una nueva reseña
exports.createReview = async (req, res) => {
    const { movieId, rating, comment } = req.body;
    const userId = req.session.user.id;

    try {
        const existingReview = await Review.findOne({ user: userId, movie: movieId });
        if (existingReview) {
            return res.status(400).send('Ya has reseñado esta película');
        }

        const newReview = new Review({ user: userId, movie: movieId, rating, comment });
        await newReview.save();

        const movie = await Movie.findById(movieId);
        const reviews = await Review.find({ movie: movieId });
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        movie.rating = totalRating / reviews.length;
        await movie.save();

        res.redirect(`/movies/${movieId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear la reseña');
    }
};

// Obtener todas las reseñas (con filtro según rol)
exports.getAllReviews = async (req, res) => {
    try {
        let query = {};
        
        // Si no es administrador, solo mostrar las reseñas del usuario
        if (!req.session.user || req.session.user.role !== 'administrador') {
            query.user = req.session.user.id;
        }

        const reviews = await Review.find(query)
            .populate({
                path: 'user',
                select: 'name',
                options: { lean: true }
            })
            .populate({
                path: 'movie',
                select: 'title',
                options: { lean: true }
            })
            .sort({ createdAt: -1 });

        // Filtrar reseñas que tienen datos válidos
        const validReviews = reviews.filter(review => 
            review.movie && review.user && review.movie.title && review.user.name
        );
        
        // Ajustar el título según el rol
        const title = req.session.user.role === 'administrador' ? 
            'Gestión de Reseñas' : 'Mis Reseñas';

        res.render('reviews/index', { 
            title: title, 
            reviews: validReviews,
            user: req.session.user || null 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener las reseñas');
    }
};

// Eliminar una reseña
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).send('Reseña no encontrada');
        }

        // Verificar permisos: solo el admin o el dueño de la reseña pueden eliminarla
        if (req.session.user.role !== 'administrador' && review.user.toString() !== req.session.user.id) {
            return res.status(403).send('No tienes permiso para eliminar esta reseña');
        }

        await Review.findByIdAndDelete(id);

        if (review.movie) {
            const movieReviews = await Review.find({ movie: review.movie });
            if (movieReviews.length > 0) {
                const averageRating = movieReviews.reduce((acc, curr) => acc + curr.rating, 0) / movieReviews.length;
                await Movie.findByIdAndUpdate(review.movie, { rating: averageRating });
            } else {
                await Movie.findByIdAndUpdate(review.movie, { rating: 0 });
            }
        }

        res.redirect('/reviews');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar la reseña');
    }
};

// Ver detalles de una reseña
exports.getReviewDetails = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate({
                path: 'user',
                select: 'name',
                options: { lean: true }
            })
            .populate({
                path: 'movie',
                select: 'title director releaseYear',
                options: { lean: true }
            });

        if (!review) {
            return res.status(404).send('Reseña no encontrada');
        }

        if (!review.movie || !review.user) {
            return res.status(404).send('La reseña tiene datos faltantes');
        }

        // Verificar permisos: solo el admin o el dueño de la reseña pueden verla
        if (req.session.user.role !== 'administrador' && review.user._id.toString() !== req.session.user.id) {
            return res.status(403).send('No tienes permiso para ver esta reseña');
        }

        res.render('reviews/details', {
            title: 'Detalles de la Reseña',
            review,
            user: req.session.user || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los detalles de la reseña');
    }
};