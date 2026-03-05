import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../server/src/config/mongodb.js';
import Reservation from '../server/src/models/Reservation.js';
import Resource from '../server/src/models/Resource.js';

dotenv.config();

const syncResourceStatusFromQuantity = (resource) => {
  resource.status = resource.quantity > 0 ? 'available' : 'reserved';
};

const run = async () => {
  await connectDB();

  const cancelledReservations = await Reservation.find({
    status: { $in: ['cancelled', 'cancel_requested'] }
  });

  if (cancelledReservations.length === 0) {
    console.log('No cancelled or cancel-requested reservations found.');
    await mongoose.disconnect();
    return;
  }

  const restoreByResource = new Map();

  cancelledReservations.forEach((reservation) => {
    const key = reservation.resourceId.toString();
    restoreByResource.set(key, (restoreByResource.get(key) || 0) + 1);
  });

  for (const [resourceId, restoreCount] of restoreByResource.entries()) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      continue;
    }

    resource.quantity = Math.max(0, resource.quantity + restoreCount);
    syncResourceStatusFromQuantity(resource);
    await resource.save();
  }

  const deleted = await Reservation.deleteMany({
    status: { $in: ['cancelled', 'cancel_requested'] }
  });

  console.log(`Deleted reservations: ${deleted.deletedCount}`);
  console.log(`Updated resources: ${restoreByResource.size}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Purge failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect error
  }
  process.exit(1);
});
