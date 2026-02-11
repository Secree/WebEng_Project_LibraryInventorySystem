// Reservation service
const { db } = require('../config/firebase');

const reservationService = {
  // Get all reservations
  getAllReservations: async () => {
    try {
      const snapshot = await db.collection('reservations').get();
      const reservations = [];
      snapshot.forEach(doc => {
        reservations.push({ id: doc.id, ...doc.data() });
      });
      return reservations;
    } catch (error) {
      throw new Error(`Failed to fetch reservations: ${error.message}`);
    }
  },

  // Get reservation by ID
  getReservationById: async (id) => {
    try {
      const doc = await db.collection('reservations').doc(id).get();
      if (!doc.exists) {
        throw new Error('Reservation not found');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to fetch reservation: ${error.message}`);
    }
  },

  // Create new reservation
  createReservation: async (reservationData) => {
    try {
      const docRef = await db.collection('reservations').add({
        ...reservationData,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      return { id: docRef.id, ...reservationData };
    } catch (error) {
      throw new Error(`Failed to create reservation: ${error.message}`);
    }
  },

  // Update reservation
  updateReservation: async (id, reservationData) => {
    try {
      await db.collection('reservations').doc(id).update({
        ...reservationData,
        updatedAt: new Date().toISOString()
      });
      return { id, ...reservationData };
    } catch (error) {
      throw new Error(`Failed to update reservation: ${error.message}`);
    }
  },

  // Delete reservation
  deleteReservation: async (id) => {
    try {
      await db.collection('reservations').doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete reservation: ${error.message}`);
    }
  }
};

module.exports = reservationService;
