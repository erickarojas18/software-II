const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
    totalMovies: { type: Number, default: 0 },
    mostViewedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    topRatedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
}, { timestamps: true });

const DashboardStats = mongoose.model('DashboardStats', dashboardSchema);
module.exports = DashboardStats;
