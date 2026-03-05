import { useEffect, useState } from 'react';
import { cancelReservation, getMyReservations } from '../../services/api';
import type { UserReservation } from '../../services/api';
import styles from './UserDashboard.module.css';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatStatus = (status: string) => {
  if (!status) {
    return 'Pending';
  }

  if (status.toLowerCase() === 'cancel_requested') {
    return 'Cancellation Requested';
  }

  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
};

const getStatusClassName = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === 'approved') {
    return styles.reservationStatusApproved;
  }
  if (normalized === 'cancel_requested') {
    return styles.reservationStatusCancelRequested;
  }
  if (normalized === 'rejected' || normalized === 'cancelled') {
    return styles.reservationStatusRejected;
  }
  if (normalized === 'returned') {
    return styles.reservationStatusReturned;
  }

  return styles.reservationStatusPending;
};

const isCancellableStatus = (status: string) => {
  const normalized = (status || '').toLowerCase();
  return normalized === 'pending';
};

function MyReservations() {
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchReservations = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to load your reservations.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    const shouldContinue = window.confirm('Send cancellation request to admin?');
    if (!shouldContinue) {
      return;
    }

    setActionError('');
    setCancellingId(reservationId);

    try {
      const result = await cancelReservation(reservationId);
      setReservations((prev) =>
        prev.map((item) =>
          item.id === reservationId
            ? {
                ...item,
                status: result.reservation.status,
                updatedAt: result.reservation.updatedAt,
              }
            : item
        )
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to cancel reservation.';
      setActionError(message);
    } finally {
      setCancellingId('');
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className={styles.reservationsPanel}>
      <div className={styles.reservationsHeaderRow}>
        <h2 className={styles.reservationsTitle}>My Reservations</h2>
        <button
          type="button"
          className={styles.refreshReservationsButton}
          onClick={fetchReservations}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && <div className={styles.reservationState}>Loading your reservations...</div>}

      {!loading && error && <div className={styles.reservationError}>{error}</div>}

      {!loading && !error && actionError && <div className={styles.reservationError}>{actionError}</div>}

      {!loading && !error && reservations.length === 0 && (
        <div className={styles.reservationState}>No reservations yet. Reserve an item from Inventory.</div>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className={styles.reservationsGrid}>
          {reservations.map((reservation) => (
            <div key={reservation.id} className={styles.reservationCard}>
              <div className={styles.reservationCardHeader}>
                <p className={styles.reservationResourceTitle}>{reservation.resourceTitle}</p>
                <span className={`${styles.reservationStatus} ${getStatusClassName(reservation.status)}`}>
                  {formatStatus(reservation.status)}
                </span>
              </div>

              <p className={styles.reservationMeta}>Reference: {reservation.id}</p>
              <p className={styles.reservationMeta}>Requested quantity: {reservation.requestedQuantity}</p>
              <p className={styles.reservationMeta}>Borrow date: {formatDate(reservation.reservationDate)}</p>
              <p className={styles.reservationMeta}>Due date: {formatDate(reservation.dueDate)}</p>
              <p className={styles.reservationMeta}>Submitted: {formatDate(reservation.createdAt)}</p>

              {isCancellableStatus(reservation.status) && (
                <div className={styles.reservationCardActions}>
                  <button
                    type="button"
                    className={styles.cancelReservationButton}
                    onClick={() => handleCancelReservation(reservation.id)}
                    disabled={cancellingId === reservation.id}
                  >
                    {cancellingId === reservation.id ? 'Submitting...' : 'Request Cancellation'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReservations;
