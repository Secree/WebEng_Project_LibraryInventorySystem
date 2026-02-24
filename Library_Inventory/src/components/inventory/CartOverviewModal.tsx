import styles from '../../pages/Inventory/Inventory.module.css';
import type { Resource } from './types';

interface CartOverviewModalProps {
  isOpen: boolean;
  cartResources: Resource[];
  onClose: () => void;
  onRemoveItem: (resourceId: string) => void;
  onAddMore: () => void;
  onCheckoutAll: () => void;
}

function CartOverviewModal({
  isOpen,
  cartResources,
  onClose,
  onRemoveItem,
  onAddMore,
  onCheckoutAll,
}: CartOverviewModalProps) {
  if (!isOpen) return null;

  const grouped = cartResources.reduce<Record<string, Resource[]>>((acc, item) => {
    const key = item.type || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const unavailableCount = cartResources.filter(
    (item) => item.status !== 'available' || item.quantity === 0
  ).length;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Your Cart</h2>
            <p className={styles.modalSubtitle}>
              Review selected items, remove if needed, then checkout available materials.
            </p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          {Object.keys(grouped).length === 0 ? (
            <div className={styles.modalEmpty}>No items in cart.</div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group} className={styles.modalSection}>
                <div className={styles.modalGroupHeader}>
                  <h3 className={styles.modalSectionTitle}>{group}</h3>
                  <span className={styles.modalCount}>{items.length} item(s)</span>
                </div>

                {items.map((item) => {
                  const unavailable = item.status !== 'available' || item.quantity === 0;

                  return (
                    <div key={item.id} className={styles.modalCard}>
                      <div className={styles.modalCardHeader}>
                        <div>
                          <p className={styles.modalItemTitle}>{item.title}</p>
                          <p className={styles.modalMeta}>{item.type}</p>
                        </div>
                        <button
                          type="button"
                          className={styles.modalRemoveButton}
                          onClick={() => onRemoveItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <p className={styles.modalMeta}>
                        {unavailable ? 'Currently borrowed/unavailable' : 'Ready for checkout'}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalSecondaryButton} onClick={onAddMore}>
            Add More Materials
          </button>
          <button
            type="button"
            className={styles.modalPrimaryButton}
            onClick={onCheckoutAll}
            disabled={cartResources.length === 0 || unavailableCount === cartResources.length}
          >
            Checkout All
          </button>
        </div>

        {unavailableCount > 0 && (
          <p className={styles.modalWarning}>
            {unavailableCount} item(s) cannot be checked out because they are borrowed/unavailable.
          </p>
        )}
      </div>
    </div>
  );
}

export default CartOverviewModal;
