import styles from './SearchToolbar.module.css';
import { Search, Grid3X3, BookOpen, Box, Wrench, SquareCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SearchToolbarProps {
  searchQuery: string;
  selectedCategory: string;
  categories: string[];
  categoryCounts: Record<string, number>;
  filteredCount: number;
  totalCount: number;
  showMultiSelectControls: boolean;
  isMultiSelectMode: boolean;
  selectedCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onToggleMultiSelectMode: () => void;
  onAddToCart: () => void;
  onCancelMultiSelect: () => void;
  onDeleteSelectedResources?: () => void;
  isDeleteActionLoading?: boolean;
  userRole?: string;
  onAddResourceClick?: () => void;
  onImportSpreadsheetClick?: () => void;
  isImportingSpreadsheet?: boolean;
}

function SearchToolbar({
  searchQuery,
  selectedCategory,
  categories,
  categoryCounts,
  filteredCount,
  totalCount,
  showMultiSelectControls,
  isMultiSelectMode,
  selectedCount,
  onSearchChange,
  onCategoryChange,
  onToggleMultiSelectMode,
  onAddToCart,
  onCancelMultiSelect,
  onDeleteSelectedResources,
  isDeleteActionLoading,
  userRole,
  onAddResourceClick,
  onImportSpreadsheetClick,
  isImportingSpreadsheet,
}: SearchToolbarProps) {
  const categoryIcons: Record<string, LucideIcon> = {
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
            {categories.map((category) => {
              const TabIcon = categoryIcons[category] ?? Grid3X3;

              return (
                <button
                  key={category}
                  type="button"
                  className={`${styles.typeTab} ${selectedCategory === category ? styles.activeTypeTab : ''}`}
                  onClick={() => onCategoryChange(category)}
                >
                  <div>
                    <TabIcon className={styles.tabIcon} size={14} strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div>
                    <span>{category}</span>
                  </div>
                  <div>
                    <span className={styles.typeCounts}>({categoryCounts[category] ?? 0})</span>
                  </div> 
                </button>
              );
            })}
          </div>

          {(showMultiSelectControls || userRole === 'admin') && (
            <div className={styles.toolbarActions}>
              {userRole === 'admin' ? (
                <>
                  <button
                    type="button"
                    className={styles.addResourceButton}
                    onClick={onAddResourceClick}
                  >
                    + Add New Resource
                  </button>

                  <button
                    type="button"
                    className={styles.importResourceButton}
                    onClick={onImportSpreadsheetClick}
                    disabled={isImportingSpreadsheet}
                  >
                    {isImportingSpreadsheet ? 'Importing...' : 'Import Excel'}
                  </button>

                  {isMultiSelectMode ? (
                    <>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={onDeleteSelectedResources}
                        disabled={selectedCount === 0 || isDeleteActionLoading}
                      >
                        {isDeleteActionLoading ? 'Deleting...' : `Delete (${selectedCount})`}
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
                      className={styles.deleteButton}
                      onClick={onToggleMultiSelectMode}
                    >
                      Delete
                    </button>
                  )}
                </>
              ) : isMultiSelectMode ? (
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
