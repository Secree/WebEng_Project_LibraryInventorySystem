import { useState } from 'react';
import styles from '../../pages/Inventory/Inventory.module.css';
import type { Resource } from './types';

interface ResourceGridProps {
  resources: Resource[];
  userRole?: string;
  isMultiSelectMode: boolean;
  selectedResourceIds: string[];
  onReserve: (resourceId: string) => void;
  onToggleResourceSelection: (resourceId: string) => void;
  onClearFilters: () => void;
  onQuantityChange?: (resourceId: string, newQuantity: number) => void;
  pendingQuantityChanges?: Record<string, number>;
}

function ResourceGrid({
  resources,
  userRole,
  isMultiSelectMode,
  selectedResourceIds,
  onReserve,
  onToggleResourceSelection,
  onClearFilters,
  onQuantityChange,
  pendingQuantityChanges = {},
}: ResourceGridProps) {
  const [animatingQuantity, setAnimatingQuantity] = useState<{ [key: string]: 'up' | 'down' | null }>({});

  const handleQuantityChange = (resourceId: string, delta: number, currentQuantity: number) => {
    const newQuantity = Math.max(0, currentQuantity + delta);
    
    if (newQuantity === currentQuantity) return;
    
    // Trigger animation
    setAnimatingQuantity(prev => ({ ...prev, [resourceId]: delta > 0 ? 'up' : 'down' }));
    
    // Call the update function
    if (onQuantityChange) {
      onQuantityChange(resourceId, newQuantity);
    }
    
    // Clear animation after it completes
    setTimeout(() => {
      setAnimatingQuantity(prev => ({ ...prev, [resourceId]: null }));
    }, 400);
  };

  return (
    <div className={styles.resourcesGrid}>
      {resources.length === 0 ? (
        <div className={styles.noResults}>
          <p>No materials found matching your search.</p>
          <button onClick={onClearFilters}>Clear Filters</button>
        </div>
      ) : (
        resources.map((resource) => {
          const isSelected = selectedResourceIds.includes(resource.id);
          const isAvailable = resource.status === 'available' && resource.quantity > 0;

          return (
          <div
            key={resource.id}
            className={`${styles.resourceCard} ${isSelected ? styles.selectedCard : ''}`}
          >
            <div className={styles.cardImage}>
              {resource.pictureUrl ? (
                <img
                  src={resource.pictureUrl}
                  alt={resource.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span style={{ fontSize: '48px', color: '#ccc' }}>📦</span>
              )}
            </div>

            <div className={styles.cardHeader}>
              <h3 className={styles.resourceTitle}>{resource.title}</h3>
              <span className={`${styles.typeBadge} ${styles[resource.type.replace(/\s+/g, '')]}`}>
                {resource.type}
              </span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Quantity:</span>
                {userRole === 'admin' ? (
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleQuantityChange(resource.id, -1, pendingQuantityChanges[resource.id] ?? resource.quantity)}
                      disabled={(pendingQuantityChanges[resource.id] ?? resource.quantity) <= 0}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className={`${styles.quantityValue} ${
                      animatingQuantity[resource.id] === 'up' ? styles.quantityAnimateUp : 
                      animatingQuantity[resource.id] === 'down' ? styles.quantityAnimateDown : ''
                    } ${pendingQuantityChanges[resource.id] !== undefined ? styles.quantityPending : ''}`}>
                      {pendingQuantityChanges[resource.id] ?? resource.quantity} {(pendingQuantityChanges[resource.id] ?? resource.quantity) === 1 ? 'item' : 'items'}
                      {pendingQuantityChanges[resource.id] !== undefined && (
                        <span className={styles.pendingIndicator}>*</span>
                      )}
                    </span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleQuantityChange(resource.id, 1, pendingQuantityChanges[resource.id] ?? resource.quantity)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className={styles.value}>
                    {resource.quantity} {resource.quantity === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Status:</span>
                <span className={`${styles.status} ${styles[resource.status]}`}>
                  {resource.status === 'available' ? '✓ Available' : '⚠ Reserved'}
                </span>
              </div>

              {resource.suggestedTopics && (
                <div className={styles.topics}>
                  <span className={styles.label}>Topics:</span>
                  <p className={styles.topicsText}>
                    {resource.suggestedTopics.split('\n').slice(0, 3).join(', ')}
                    {resource.suggestedTopics.split('\n').length > 3 && '...'}
                  </p>
                </div>
              )}

              {resource.keywords && (
                <div className={styles.keywords}>
                  <span className={styles.label}>Keywords:</span>
                  <div className={styles.keywordTags}>
                    {resource.keywords
                      .split('\n')
                      .filter((k) => k.trim())
                      .slice(0, 4)
                      .map((keyword, idx) => (
                        <span key={idx} className={styles.keywordTag}>
                          {keyword.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {userRole === 'user' && (
              <div className={styles.cardFooter}>
                {isMultiSelectMode ? (
                  <button
                    className={`${styles.reserveButton} ${isSelected ? styles.inCartButton : ''}`}
                    onClick={() => onToggleResourceSelection(resource.id)}
                    disabled={!isAvailable && !isSelected}
                  >
                    {!isAvailable && !isSelected ? 'Not Available' : isSelected ? 'In Cart' : 'Add to Cart'}
                  </button>
                ) : (
                  <button
                    className={styles.reserveButton}
                    onClick={() => onReserve(resource.id)}
                    disabled={!isAvailable}
                  >
                    {isAvailable ? 'Reserve Item' : 'Not Available'}
                  </button>
                )}
              </div>
            )}
          </div>
          );
        })
      )}
    </div>
  );
}

export default ResourceGrid;
