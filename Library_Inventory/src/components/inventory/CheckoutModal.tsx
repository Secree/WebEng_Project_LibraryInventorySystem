import styles from '../../pages/Inventory/Inventory.module.css';
import type { Resource } from './types';

interface CheckoutModalProps {
  isOpen: boolean;
  resource: Resource | null;
  onClose: () => void;
  onConfirm: (resourceId: string) => void;
}

function CheckoutModal({ isOpen, resource, onClose, onConfirm }: CheckoutModalProps) {
  if (!isOpen || !resource) return null;

  const borrowDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

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
          <button type="button" className={styles.modalCloseButton} onClick={onClose}>
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
              <span className={styles.modalDateLabel}>Borrow:</span>
              <span className={styles.modalDateValue}>{borrowDate.toDateString()}</span>
            </div>
            <div>
              <span className={styles.modalDateLabel}>Due:</span>
              <span className={styles.modalDateValue}>{dueDate.toDateString()}</span>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalSecondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.modalPrimaryButton}
            onClick={() => onConfirm(resource.id)}
          >
            Confirm Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;
