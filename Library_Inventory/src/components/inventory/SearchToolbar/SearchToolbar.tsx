import styles from './SearchToolbar.module.css';

interface SearchToolbarProps {
  searchQuery: string;
  selectedType: string;
  types: string[];
  typeCounts: Record<string, number>;
  filteredCount: number;
  totalCount: number;
  showMultiSelectControls: boolean;
  isMultiSelectMode: boolean;
  selectedCount: number;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onToggleMultiSelectMode: () => void;
  onAddToCart: () => void;
  onCancelMultiSelect: () => void;
}

function SearchToolbar({
  searchQuery,
  selectedType,
  types,
  typeCounts,
  filteredCount,
  totalCount,
  showMultiSelectControls,
  isMultiSelectMode,
  selectedCount,
  onSearchChange,
  onTypeChange,
  onToggleMultiSelectMode,
  onAddToCart,
  onCancelMultiSelect,
}: SearchToolbarProps) {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="🔍 Search by title, keywords, or topics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterBar}>
          <div className={styles.typeTabs}>
            {types.map((type) => (
              <button
                key={type}
                type="button"
                className={`${styles.typeTab} ${selectedType === type ? styles.activeTypeTab : ''}`}
                onClick={() => onTypeChange(type)}
              >
                <div className={styles.typeButtons}>
                  <div className={styles.type}>
                    {type}
                  </div>
                  <div className={styles.typeCounts}>
                    ({typeCounts[type] ?? 0})
                  </div>
                </div>
              </button>
            ))}
          </div>

          {showMultiSelectControls && (
            <div className={styles.toolbarActions}>
              {isMultiSelectMode ? (
                <>
                  <button
                    type="button"
                    className={styles.cartButton}
                    onClick={onAddToCart}
                    disabled={selectedCount === 0}
                  >
                    Add to Cart ({selectedCount})
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onCancelMultiSelect}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.multiSelectButton}
                  onClick={onToggleMultiSelectMode}
                >
                  Select Multiple
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.resultsCount}>
          Showing {filteredCount} of {totalCount} items
        </div>
      </div>
    </div>

  );
}

export default SearchToolbar;
