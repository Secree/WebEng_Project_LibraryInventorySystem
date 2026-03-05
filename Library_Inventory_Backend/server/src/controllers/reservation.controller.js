import reservationService from '../services/reservation.service.js';

const reservationController = {
  getAllReservations: async (req, res) => {
    try {
      const reservations = await reservationService.getAllReservations();
      res.status(200).json(reservations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getMyReservations: async (req, res) => {
    try {
      const reservations = await reservationService.getReservationsByUserId(req.user?.id);
      res.status(200).json(reservations);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getReservationById: async (req, res) => {
    try {
      if (req.params.id === 'mine') {
        const reservations = await reservationService.getReservationsByUserId(req.user?.id);
        return res.status(200).json(reservations);
      }

      const reservation = await reservationService.getReservationById(req.params.id);
      res.status(200).json(reservation);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  createReservation: async (req, res) => {
    try {
      const result = await reservationService.createReservation(req.body, req.user);
      res.status(201).json({
        message: 'Reservation created successfully',
        ...result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  cancelReservation: async (req, res) => {
    try {
      const result = await reservationService.cancelReservation(req.params.id, req.user);
      res.status(200).json({
        message: 'Reservation cancelled successfully',
        ...result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  updateReservation: async (req, res) => {
    try {
      const reservation = await reservationService.updateReservation(req.params.id, req.body);
      res.status(200).json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteReservation: async (req, res) => {
    try {
      await reservationService.deleteReservation(req.params.id);
      res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export default reservationController;
