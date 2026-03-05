import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';

const MAX_BORROW_DURATION_DAYS = 14;

const getStartOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const assertObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ${label}`);
  }
};

const ensureAdmin = (currentUser) => {
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Admin access required');
  }
};

const syncResourceStatusFromQuantity = (resource) => {
  if (!resource) {
    return;
  }

  resource.status = resource.quantity > 0 ? 'available' : 'reserved';
};

const normalizeReservation = (reservationDoc) => {
  const reservation = reservationDoc?.toObject ? reservationDoc.toObject() : reservationDoc;

  if (!reservation) {
    return reservation;
  }

  const { _id, __v, ...rest } = reservation;
  return {
    id: _id.toString(),
    ...rest
  };
};

const restoreResourceAndDeleteReservation = async (reservation) => {
  const resource = await Resource.findById(reservation.resourceId);
  if (resource) {
    resource.quantity = Math.max(0, resource.quantity + 1);
    syncResourceStatusFromQuantity(resource);
    await resource.save();
  }

  await reservation.deleteOne();

  return {
    deletedReservationId: reservation._id.toString(),
    resource: resource ? resource.toJSON() : null
  };
};

const deleteReservationWithoutRestoring = async (reservation) => {
  await reservation.deleteOne();

  return {
    deletedReservationId: reservation._id.toString(),
    resource: null
  };
};

const reservationService = {
  getAllReservations: async (currentUser) => {
    try {
      ensureAdmin(currentUser);

      const reservations = await Reservation.find({}).sort({ createdAt: -1 });
      return reservations.map((reservation) => normalizeReservation(reservation));
    } catch (error) {
      throw new Error(`Failed to fetch reservations: ${error.message}`);
    }
  },

  getReservationsByUserId: async (userId) => {
    try {
      if (!userId) {
        throw new Error('Authenticated user is required');
      }

      assertObjectId(userId, 'user id');

      const reservations = await Reservation.find({ userId }).sort({ createdAt: -1 });
      return reservations.map((reservation) => normalizeReservation(reservation));
    } catch (error) {
      throw new Error(`Failed to fetch user reservations: ${error.message}`);
    }
  },

  getReservationById: async (id) => {
    try {
      assertObjectId(id, 'reservation id');

      const reservation = await Reservation.findById(id);
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      return normalizeReservation(reservation);
    } catch (error) {
      throw new Error(`Failed to fetch reservation: ${error.message}`);
    }
  },

  createReservation: async (reservationData, currentUser) => {
    try {
      const { resourceId, reservationDate, notes } = reservationData || {};

      if (!currentUser?.id) {
        throw new Error('Authenticated user is required');
      }
      if (!resourceId) {
        throw new Error('Resource ID is required');
      }
      if (!reservationDate) {
        throw new Error('Borrow date is required');
      }

      assertObjectId(currentUser.id, 'user id');
      assertObjectId(resourceId, 'resource id');

      const [user, resource] = await Promise.all([
        User.findById(currentUser.id),
        Resource.findById(resourceId)
      ]);

      if (!user) {
        throw new Error('User not found');
      }
      if (!resource) {
        throw new Error('Resource not found');
      }
      if (resource.quantity <= 0 || resource.status !== 'available') {
        throw new Error('Resource is not available for reservation');
      }

      const borrowDate = getStartOfDay(new Date(reservationDate));
      if (Number.isNaN(borrowDate.getTime())) {
        throw new Error('Invalid borrow date');
      }

      const dueDate = addDays(borrowDate, MAX_BORROW_DURATION_DAYS);

      const reservation = new Reservation({
        userId: user._id,
        resourceId: resource._id,
        userEmail: user.email,
        resourceTitle: resource.title,
        reservationDate: borrowDate,
        dueDate,
        status: 'pending',
        notes: typeof notes === 'string' && notes.trim() ? notes.trim() : undefined
      });

      await reservation.save();

      return {
        reservation: normalizeReservation(reservation),
        resource: resource.toJSON()
      };
    } catch (error) {
      throw new Error(`Failed to create reservation: ${error.message}`);
    }
  },

  requestCancellation: async (id, currentUser) => {
    try {
      if (!currentUser?.id) {
        throw new Error('Authenticated user is required');
      }

      assertObjectId(id, 'reservation id');
      assertObjectId(currentUser.id, 'user id');

      const reservation = await Reservation.findById(id);
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.userId.toString() !== currentUser.id) {
        throw new Error('You are not allowed to cancel this reservation');
      }

      if (reservation.status === 'cancelled') {
        throw new Error('Reservation is already cancelled');
      }

      if (reservation.status === 'cancel_requested') {
        throw new Error('Cancellation request is already pending admin confirmation');
      }

      if (reservation.status !== 'pending') {
        throw new Error('Only pending reservations can request cancellation');
      }

      reservation.status = 'cancel_requested';
      await reservation.save();

      return {
        reservation: normalizeReservation(reservation),
        resource: null
      };
    } catch (error) {
      throw new Error(`Failed to request cancellation: ${error.message}`);
    }
  },

  adminCancelApprovedReservation: async (id, currentUser) => {
    try {
      ensureAdmin(currentUser);
      assertObjectId(id, 'reservation id');

      const reservation = await Reservation.findById(id);
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.status !== 'approved') {
        throw new Error('Only approved reservations can be cancelled by admin');
      }

      return restoreResourceAndDeleteReservation(reservation);
    } catch (error) {
      throw new Error(`Failed to cancel approved reservation: ${error.message}`);
    }
  },

  approveReservation: async (id, currentUser) => {
    try {
      ensureAdmin(currentUser);
      assertObjectId(id, 'reservation id');

      const reservation = await Reservation.findById(id);
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.status !== 'pending') {
        throw new Error('Only pending reservations can be approved');
      }

      const resource = await Resource.findById(reservation.resourceId);
      if (!resource) {
        throw new Error('Resource not found');
      }
      if (resource.quantity <= 0 || resource.status !== 'available') {
        throw new Error('Resource is no longer available for approval');
      }

      resource.quantity = Math.max(0, resource.quantity - 1);
      syncResourceStatusFromQuantity(resource);
      await resource.save();

      reservation.status = 'approved';
      await reservation.save();

      return {
        reservation: normalizeReservation(reservation)
      };
    } catch (error) {
      throw new Error(`Failed to approve reservation: ${error.message}`);
    }
  },

  confirmCancelAndDelete: async (id, currentUser) => {
    try {
      ensureAdmin(currentUser);
      assertObjectId(id, 'reservation id');

      const reservation = await Reservation.findById(id);
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.status !== 'cancel_requested') {
        throw new Error('Reservation is not awaiting cancellation confirmation');
      }

      return deleteReservationWithoutRestoring(reservation);
    } catch (error) {
      throw new Error(`Failed to confirm cancellation: ${error.message}`);
    }
  },

  purgeCancelledReservations: async (currentUser) => {
    try {
      ensureAdmin(currentUser);

      const cancellableReservations = await Reservation.find({
        status: { $in: ['cancelled', 'cancel_requested'] }
      });

      const results = [];

      for (const reservation of cancellableReservations) {
        const shouldRestore = reservation.status === 'approved' || reservation.status === 'cancelled';
        const result = shouldRestore
          ? await restoreResourceAndDeleteReservation(reservation)
          : await deleteReservationWithoutRestoring(reservation);
        results.push(result);
      }

      return {
        deletedCount: results.length,
        deletedReservationIds: results.map((item) => item.deletedReservationId),
      };
    } catch (error) {
      throw new Error(`Failed to purge cancelled reservations: ${error.message}`);
    }
  },

  updateReservation: async (id, reservationData) => {
    try {
      assertObjectId(id, 'reservation id');

      const reservation = await Reservation.findByIdAndUpdate(
        id,
        reservationData,
        { new: true, runValidators: true }
      );

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      return normalizeReservation(reservation);
    } catch (error) {
      throw new Error(`Failed to update reservation: ${error.message}`);
    }
  },

  deleteReservation: async (id) => {
    try {
      assertObjectId(id, 'reservation id');

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
