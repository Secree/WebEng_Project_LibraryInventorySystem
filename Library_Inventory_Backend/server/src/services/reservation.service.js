// Reservation service
import Reservation from '../models/Reservation.js';

const reservationService = {
  // Get all reservations
  getAllReservations: async () => {
    try {
      const reservations = await Reservation.find({}).lean();
      return reservations.map(res => ({
        id: res._id.toString(),
        ...res,
        _id: undefined
      }));
    } catch (error) {
      throw new Error(`Failed to fetch reservations: ${error.message}`);
    }
  },

  // Get reservation by ID
  getReservationById: async (id) => {
    try {
      const reservation = await Reservation.findById(id).lean();
      if (!reservation) {
        throw new Error('Reservation not found');
      }
      return { id: reservation._id.toString(), ...reservation, _id: undefined };
    } catch (error) {
      throw new Error(`Failed to fetch reservation: ${error.message}`);
    }
  },

  // Create new reservation
  createReservation: async (reservationData) => {
    try {
      const reservation = new Reservation({
        ...reservationData,
        status: 'pending'
      });
      await reservation.save();
      return { 
        id: reservation._id.toString(), 
        ...reservation.toObject(),
        _id: undefined
      };
    } catch (error) {
      throw new Error(`Failed to create reservation: ${error.message}`);
    }
  },

  // Update reservation
  updateReservation: async (id, reservationData) => {
    try {
      const reservation = await Reservation.findByIdAndUpdate(
        id,
        reservationData,
        { new: true, runValidators: true }
      ).lean();
      
      if (!reservation) {
        throw new Error('Reservation not found');
      }
      
      return { id: reservation._id.toString(), ...reservation, _id: undefined };
    } catch (error) {
      throw new Error(`Failed to update reservation: ${error.message}`);
    }
  },

  // Delete reservation
  deleteReservation: async (id) => {
    try {
      const result = await Reservation.findByIdAndDelete(id);
      if (!result) {
        throw new Error('Reservation not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete reservation: ${error.message}`);
    }
  }
};

export default reservationService;
