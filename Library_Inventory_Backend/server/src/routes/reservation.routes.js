// Reservation routes
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Reservation routes
router.get('/', authMiddleware.verifyToken, reservationController.getAllReservations);
router.get('/:id', authMiddleware.verifyToken, reservationController.getReservationById);
router.post('/', authMiddleware.verifyToken, reservationController.createReservation);
router.put('/:id', authMiddleware.verifyToken, reservationController.updateReservation);
router.delete('/:id', authMiddleware.verifyToken, reservationController.deleteReservation);

module.exports = router;
