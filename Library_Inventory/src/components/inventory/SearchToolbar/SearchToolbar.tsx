import styles from './SearchToolbar.module.css';
import { Search, Grid3X3, BookOpen, Box, Wrench, SquareCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  const typeIcons: Record<string, LucideIcon> = {
    All: Grid3X3,
    Books: BookOpen,
    Modules: Box,
    Equipment: Wrench,
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrap}>
            <Search className={styles.searchIcon} size={16} strokeWidth={2} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by keyword, subject, or title..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            type="button"
            className={styles.searchButton}
            onClick={() => onSearchChange(searchQuery)}
          >
            Search
          </button>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.typeTabs}>
            {types.map((type) => {
              const TabIcon = typeIcons[type] ?? Grid3X3;

              return (
                <button
                  key={type}
                  type="button"
                  className={`${styles.typeTab} ${selectedType === type ? styles.activeTypeTab : ''}`}
                  onClick={() => onTypeChange(type)}
                >
                  <TabIcon className={styles.tabIcon} size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{type}</span>
                  <span className={styles.typeCounts}>({typeCounts[type] ?? 0})</span>
                </button>
              );
            })}
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
                  <SquareCheck className={styles.selectIcon} size={14} strokeWidth={2} aria-hidden="true" />
                  Select Multiple
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.resultsCount}>
          Showing {filteredCount} results
          {searchQuery ? ` (from ${totalCount})` : ''}
        </div>
      </div>
    </div>

  );
}

export default SearchToolbar;
