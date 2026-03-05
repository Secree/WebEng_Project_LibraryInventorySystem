import express from 'express';
import reservationController from '../controllers/reservation.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware.verifyToken, reservationController.getAllReservations);
router.get('/mine', authMiddleware.verifyToken, reservationController.getMyReservations);
router.get('/:id', authMiddleware.verifyToken, reservationController.getReservationById);
router.post('/', authMiddleware.verifyToken, reservationController.createReservation);
router.patch('/:id/cancel', authMiddleware.verifyToken, reservationController.cancelReservation);
router.put('/:id', authMiddleware.verifyToken, reservationController.updateReservation);
router.delete('/:id', authMiddleware.verifyToken, reservationController.deleteReservation);

export default router;
