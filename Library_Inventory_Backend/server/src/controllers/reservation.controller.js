// Reservation controller
const reservationService = require('../services/reservation.service');

const reservationController = {
  // Get all reservations
  getAllReservations: async (req, res) => {
    try {
      const reservations = await reservationService.getAllReservations();
      res.status(200).json(reservations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get reservation by ID
  getReservationById: async (req, res) => {
    try {
      const reservation = await reservationService.getReservationById(req.params.id);
      res.status(200).json(reservation);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Create new reservation
  createReservation: async (req, res) => {
    try {
      const reservation = await reservationService.createReservation(req.body);
      res.status(201).json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update reservation
  updateReservation: async (req, res) => {
    try {
      const reservation = await reservationService.updateReservation(req.params.id, req.body);
      res.status(200).json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete reservation
  deleteReservation: async (req, res) => {
    try {
      await reservationService.deleteReservation(req.params.id);
      res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = reservationController;
