import reservationService from '../services/reservation.service.js';

const reservationController = {
  getAllReservations: async (req, res) => {
    try {
      const reservations = await reservationService.getAllReservations(req.user);
      res.status(200).json(reservations);
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  },

  getAdminReservations: async (req, res) => {
    try {
      const reservations = await reservationService.getAllReservations(req.user);
      res.status(200).json(reservations);
    } catch (error) {
      res.status(403).json({ error: error.message });
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
      if (req.params.id === 'admin') {
        const reservations = await reservationService.getAllReservations(req.user);
        return res.status(200).json(reservations);
      }

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
      const result = await reservationService.requestCancellation(req.params.id, req.user);
      res.status(200).json({
        message: 'Cancellation request submitted',
        ...result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  approveReservation: async (req, res) => {
    try {
      const result = await reservationService.approveReservation(req.params.id, req.user);
      res.status(200).json({
        message: 'Reservation approved successfully',
        ...result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  adminCancelApprovedReservation: async (req, res) => {
    try {
      const result = await reservationService.adminCancelApprovedReservation(req.params.id, req.user);
      res.status(200).json({
        message: 'Approved reservation cancelled by admin',
        ...result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  confirmCancelReservation: async (req, res) => {
    try {
      const result = await reservationService.confirmCancelAndDelete(req.params.id, req.user);
      res.status(200).json({
        message: 'Cancellation confirmed and reservation deleted',
        ...result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  purgeCancelledReservations: async (req, res) => {
    try {
      const result = await reservationService.purgeCancelledReservations(req.user);
      res.status(200).json({
        message: 'Cancelled reservations purged successfully',
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
