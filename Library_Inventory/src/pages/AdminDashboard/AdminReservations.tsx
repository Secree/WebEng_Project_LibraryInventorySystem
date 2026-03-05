import { useEffect, useMemo, useState } from 'react';
import {
  adminApproveReservation,
  adminCancelApprovedReservation,
  adminConfirmCancelReservation,
  getAdminReservations,
  type AdminReservation,
} from '../../services/api';
import styles from './AdminDashboard.module.css';

type ReservationFilter = 'all' | 'pending' | 'ongoing' | 'cancel_requests';

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const toStatusLabel = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === 'approved') {
    return 'Ongoing';
  }
  if (normalized === 'cancel_requested') {
    return 'Cancel Requested';
  }

  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
};

const statusClassName = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === 'pending') {
    return styles.reservationStatusPending;
  }
  if (normalized === 'approved') {
    return styles.reservationStatusApproved;
  }
  if (normalized === 'cancel_requested') {
    return styles.reservationStatusCancelRequested;
  }
  if (normalized === 'returned') {
    return styles.reservationStatusReturned;
  }

  return styles.reservationStatusRejected;
};

function AdminReservations() {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ReservationFilter>('all');
  const [confirmingId, setConfirmingId] = useState('');
  const [approvingId, setApprovingId] = useState('');
  const [adminCancellingId, setAdminCancellingId] = useState('');

  const fetchReservations = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminReservations();
      setReservations(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to fetch reservations.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const filteredReservations = useMemo(() => {
    if (filter === 'all') {
      return reservations;
    }

    if (filter === 'pending') {
      return reservations.filter((item) => item.status.toLowerCase() === 'pending');
    }

    if (filter === 'ongoing') {
      return reservations.filter((item) => item.status.toLowerCase() === 'approved');
    }

    return reservations.filter((item) => item.status.toLowerCase() === 'cancel_requested');
  }, [filter, reservations]);

  const handleConfirmDelete = async (reservationId: string) => {
    const shouldContinue = window.confirm(
      'Confirm cancellation and permanently delete this reservation?'
    );
    if (!shouldContinue) {
      return;
    }

    setConfirmingId(reservationId);

    try {
      await adminConfirmCancelReservation(reservationId);
      setReservations((prev) => prev.filter((reservation) => reservation.id !== reservationId));
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to confirm cancellation.';
      setError(message);
    } finally {
      setConfirmingId('');
    }
  };

  const handleApproveReservation = async (reservationId: string) => {
    const shouldContinue = window.confirm('Approve this pending reservation?');
    if (!shouldContinue) {
      return;
    }

    setApprovingId(reservationId);

    try {
      const result = await adminApproveReservation(reservationId);
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId
            ? {
                ...reservation,
                status: result.reservation.status,
                updatedAt: result.reservation.updatedAt,
              }
            : reservation
        )
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to approve reservation.';
      setError(message);
    } finally {
      setApprovingId('');
    }
  };

  const handleAdminCancelApproved = async (reservationId: string) => {
    const shouldContinue = window.confirm('Cancel this approved reservation now?');
    if (!shouldContinue) {
      return;
    }

    setAdminCancellingId(reservationId);

    try {
      await adminCancelApprovedReservation(reservationId);
      setReservations((prev) => prev.filter((reservation) => reservation.id !== reservationId));
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to cancel approved reservation.';
      setError(message);
    } finally {
      setAdminCancellingId('');
    }
  };

  return (
    <div className={styles.userManagementContainer}>
      <div className={styles.userManagementTable}>
        <div className={styles.userTitle}>
          <h2>Reservation Management</h2>
          <button onClick={fetchReservations} disabled={loading} className={styles.refreshBTN}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className={styles.reservationFilters}>
          <button
            type="button"
            className={`${styles.reservationFilterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`${styles.reservationFilterButton} ${filter === 'pending' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            type="button"
            className={`${styles.reservationFilterButton} ${filter === 'ongoing' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('ongoing')}
          >
            Ongoing
          </button>
          <button
            type="button"
            className={`${styles.reservationFilterButton} ${filter === 'cancel_requests' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('cancel_requests')}
          >
            Cancel Requests
          </button>
        </div>

        {error && (
          <p className={styles.adminReservationError}>
            {error}
          </p>
        )}

        {!loading && filteredReservations.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>
            No reservations found for this filter
          </p>
        ) : (
          <table className={styles.responsiveTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Resource</th>
                <th>Status</th>
                <th>Borrow</th>
                <th>Due</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td data-label="User">{reservation.userEmail}</td>
                  <td data-label="Resource">{reservation.resourceTitle}</td>
                  <td data-label="Status">
                    <span className={`${styles.roleSpan} ${statusClassName(reservation.status)}`}>
                      {toStatusLabel(reservation.status)}
                    </span>
                  </td>
                  <td data-label="Borrow">{formatDate(reservation.reservationDate)}</td>
                  <td data-label="Due">{formatDate(reservation.dueDate)}</td>
                  <td data-label="Submitted">{formatDate(reservation.createdAt)}</td>
                  <td data-label="Action">
                    {reservation.status.toLowerCase() === 'pending' ? (
                      <button
                        type="button"
                        className={styles.approveBtn}
                        onClick={() => handleApproveReservation(reservation.id)}
                        disabled={approvingId === reservation.id}
                      >
                        {approvingId === reservation.id ? 'Approving...' : 'Approve'}
                      </button>
                    ) : reservation.status.toLowerCase() === 'cancel_requested' ? (
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleConfirmDelete(reservation.id)}
                        disabled={confirmingId === reservation.id}
                      >
                        {confirmingId === reservation.id ? 'Confirming...' : 'Confirm Cancellation'}
                      </button>
                    ) : reservation.status.toLowerCase() === 'approved' ? (
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleAdminCancelApproved(reservation.id)}
                        disabled={adminCancellingId === reservation.id}
                      >
                        {adminCancellingId === reservation.id ? 'Cancelling...' : 'Admin Cancel'}
                      </button>
                    ) : (
                      <span className={styles.noActionText}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminReservations;
