import { useEffect, useMemo, useState } from 'react';
import styles from '../../pages/Inventory/Inventory.module.css';
import type { MultiReservationReceipt, Resource } from './types';

const MAX_RESERVATION_WINDOW_DAYS = 30;

interface MultiCheckoutModalProps {
  isOpen: boolean;
  resources: Resource[];
  onClose: () => void;
  onConfirm: (borrowDate: string) => Promise<MultiReservationReceipt>;
}

const formatDisplayDate = (value: string) => {
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct.toDateString();
  }

  const fallback = new Date(`${value}T00:00:00`);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback.toDateString();
  }

  return value;
};

function MultiCheckoutModal({ isOpen, resources, onClose, onConfirm }: MultiCheckoutModalProps) {
  const [borrowDate, setBorrowDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [receipt, setReceipt] = useState<MultiReservationReceipt | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setBorrowDate('');
    setIsSubmitting(false);
    setSubmitError('');
    setReceipt(null);
  }, [isOpen, resources.length]);

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
    setIsSubmitting(false);
    setSubmitError('');
    setReceipt(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!isBorrowDateValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await onConfirm(borrowDate);
      setReceipt(result);
      setSubmitError('');
    } catch (error: unknown) {
      if (error instanceof Error && error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Failed to submit reservations. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReceiptVisible = receipt !== null;

  if (!isOpen || resources.length === 0) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{isReceiptVisible ? 'Checkout Submitted' : 'Review & Set Dates'}</h2>
            <p className={styles.modalSubtitle}>
              {isReceiptVisible
                ? 'Your checkout request has been processed. Review the reservation overview below.'
                : 'Please review the selected materials and set your borrow period.'}
            </p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={handleClose}>
            ×
          </button>
        </div>

        {isReceiptVisible && receipt ? (
          <>
            <div className={styles.modalSection}>
              <div className={styles.modalGroupHeader}>
                <h3 className={styles.modalSectionTitle}>Overview</h3>
                <span className={styles.modalCount}>{receipt.successfulItems.length} reserved</span>
              </div>
              <div className={styles.modalDateRow}>
                <div>
                  <span className={styles.modalDateLabel}>Borrow:</span>
                  <span className={styles.modalDateValue}>{formatDisplayDate(receipt.borrowDate)}</span>
                </div>
                <div>
                  <span className={styles.modalDateLabel}>Due:</span>
                  <span className={styles.modalDateValue}>{formatDisplayDate(receipt.dueDate)}</span>
                </div>
                <div>
                  <span className={styles.modalDateLabel}>Submitted:</span>
                  <span className={styles.modalDateValue}>{formatDisplayDate(receipt.submittedAt)}</span>
                </div>
              </div>
            </div>

            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Reserved Materials</h3>
              {receipt.successfulItems.map((item) => (
                <div key={item.reservationId} className={styles.modalCard}>
                  <p className={styles.modalItemTitle}>{item.resourceTitle}</p>
                  <p className={styles.modalMeta}>Reference: {item.reservationId}</p>
                  <p className={styles.modalMeta}>Status: {item.status}</p>
                </div>
              ))}
            </div>

            {receipt.failedItems.length > 0 && (
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>Not Reserved</h3>
                {receipt.failedItems.map((item) => (
                  <div key={item.resourceId} className={styles.modalCard}>
                    <p className={styles.modalItemTitle}>{item.resourceTitle}</p>
                    <p className={styles.modalMeta}>{item.reason}</p>
                  </div>
                ))}
                <p className={styles.modalWarning}>
                  Some items could not be reserved and remain in your cart.
                </p>
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalPrimaryButton}
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.modalSection}>
              <div className={styles.modalGroupHeader}>
                <h3 className={styles.modalSectionTitle}>Materials</h3>
                <span className={styles.modalCount}>{resources.length} item(s)</span>
              </div>
              {resources.map((resource) => (
                <div key={resource.id} className={styles.modalCard}>
                  <p className={styles.modalItemTitle}>{resource.title}</p>
                  <p className={styles.modalMeta}>{resource.type}</p>
                  <p className={styles.modalMeta}>Quantity available: {resource.quantity}</p>
                  {resource.suggestedTopics && (
                    <p className={styles.modalDescription}>
                      {resource.suggestedTopics.split('\n').slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Borrow Period</h3>
              <div className={styles.modalDateRow}>
                <div>
                  <label htmlFor="multi-borrow-date" className={styles.modalDateLabel}>Borrow:</label>
                  <input
                    id="multi-borrow-date"
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

            {submitError && (
              <p className={styles.modalWarning}>{submitError}</p>
            )}

            <div className={styles.modalActions}>
              <button type="button" className={styles.modalSecondaryButton} onClick={handleClose}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalPrimaryButton}
                onClick={handleConfirm}
                disabled={!isBorrowDateValid || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Reservation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MultiCheckoutModal;