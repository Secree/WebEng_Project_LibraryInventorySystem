import { useMemo, useState } from 'react';
import styles from '../../pages/Inventory/Inventory.module.css';
import type { Resource } from './types';

const MAX_RESERVATION_WINDOW_DAYS = 30;

interface CheckoutModalProps {
  isOpen: boolean;
  resource: Resource | null;
  onClose: () => void;
  onConfirm: (resourceId: string, borrowDate: string) => void;
}

function CheckoutModal({ isOpen, resource, onClose, onConfirm }: CheckoutModalProps) {
  const [borrowDate, setBorrowDate] = useState('');

  if (!isOpen || !resource) return null;

  const dueDateText = useMemo(() => {
    if (!borrowDate) return 'Select a borrow date first';

    const [year, month, day] = borrowDate.split('-').map(Number);
    if (!year || !month || !day) return 'Select a valid borrow date';

    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return 'Select a valid borrow date';

    date.setDate(date.getDate() + 14);
    return date.toDateString();
  }, [borrowDate]);

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const maxBorrowDate = new Date(today);
  maxBorrowDate.setDate(maxBorrowDate.getDate() + MAX_RESERVATION_WINDOW_DAYS);
  const maxBorrowDateString = `${maxBorrowDate.getFullYear()}-${String(maxBorrowDate.getMonth() + 1).padStart(2, '0')}-${String(maxBorrowDate.getDate()).padStart(2, '0')}`;

  const isBorrowDateValid = useMemo(() => {
    if (!borrowDate) return false;

    const [year, month, day] = borrowDate.split('-').map(Number);
    if (!year || !month || !day) return false;

    const selected = new Date(year, month - 1, day);
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const maxDate = new Date(maxBorrowDate.getFullYear(), maxBorrowDate.getMonth(), maxBorrowDate.getDate());

    return !Number.isNaN(selected.getTime()) && selected >= minDate && selected <= maxDate;
  }, [borrowDate, maxBorrowDate, today]);

  const handleClose = () => {
    setBorrowDate('');
    onClose();
  };

  const handleConfirm = () => {
    if (!isBorrowDateValid) return;
    onConfirm(resource.id, borrowDate);
    setBorrowDate('');
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Review & Set Dates</h2>
            <p className={styles.modalSubtitle}>
              Please review the item details and set your borrow period.
            </p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <div className={styles.modalSection}>
          <h3 className={styles.modalSectionTitle}>Material</h3>
          <div className={styles.modalCard}>
            <p className={styles.modalItemTitle}>{resource.title}</p>
            <p className={styles.modalMeta}>{resource.type}</p>
            <p className={styles.modalMeta}>Quantity available: {resource.quantity}</p>
            {resource.suggestedTopics && (
              <p className={styles.modalDescription}>
                {resource.suggestedTopics.split('\n').slice(0, 2).join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className={styles.modalSection}>
          <h3 className={styles.modalSectionTitle}>Borrow Period</h3>
          <div className={styles.modalDateRow}>
            <div>
              <label htmlFor="single-borrow-date" className={styles.modalDateLabel}>Borrow:</label>
              <input
                id="single-borrow-date"
                type="date"
                className={styles.modalDateInput}
                value={borrowDate}
                min={todayString}
                max={maxBorrowDateString}
                onChange={(event) => setBorrowDate(event.target.value)}
              />
            </div>
            <div>
              <span className={styles.modalDateLabel}>Due:</span>
              <span className={styles.modalDateValue}>{dueDateText}</span>
            </div>
          </div>
        </div>

        {!isBorrowDateValid && borrowDate && (
          <p className={styles.modalWarning}>
            Borrow date must be between today and the next {MAX_RESERVATION_WINDOW_DAYS} days.
          </p>
        )}

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalSecondaryButton} onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.modalPrimaryButton}
            onClick={handleConfirm}
            disabled={!isBorrowDateValid}
          >
            Confirm Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;
