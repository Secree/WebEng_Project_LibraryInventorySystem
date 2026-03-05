import { useState, useEffect, useMemo } from 'react';
import { getAllResources, reserveResource, updateResource } from '../../services/api';
import styles from './Inventory.module.css';
import SearchToolbar from '../../components/inventory/SearchToolbar/SearchToolbar';
import ResourceGrid from '../../components/inventory/ResourceGrid';
import CheckoutModal from '../../components/inventory/CheckoutModal';
import MultiCheckoutModal from '../../components/inventory/MultiCheckoutModal';
import CartOverviewModal from '../../components/inventory/CartOverviewModal';
import type {
  MultiReservationFailureItem,
  MultiReservationReceipt,
  MultiReservationReceiptItem,
  Resource,
  ReservationReceipt,
} from '../../components/inventory/types';

interface InventoryProps {
  userRole?: string;
}

type FilterTab = 'All' | 'Books' | 'Modules' | 'Equipment';

const FILTER_TABS: FilterTab[] = ['All', 'Books', 'Modules', 'Equipment'];
const MAX_BORROW_DURATION_DAYS = 14;

const parseDateValue = (dateValue: string) => {
  const direct = new Date(dateValue);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const fallback = new Date(`${dateValue}T00:00:00`);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
};

const getDueDateFromBorrowDate = (borrowDate: string) => {
  const parsedDate = parseDateValue(borrowDate);
  if (!parsedDate) {
    return borrowDate;
  }

  const dueDate = new Date(parsedDate);
  dueDate.setDate(dueDate.getDate() + MAX_BORROW_DURATION_DAYS);
  return dueDate.toISOString();
};

const mapResourceToTab = (resource: Resource): Exclude<FilterTab, 'All'> => {
  // Use category (actual material type from CSV) if available, otherwise fall back to type
  const cat = (resource.category || resource.type || '').toLowerCase();

  if (
    cat.includes('laboratory') ||
    cat.includes('equipment') ||
    cat.includes('measuring') ||
    cat.includes('weighing') ||
    cat.includes('safety') ||
    cat.includes('energy') ||
    cat.includes('anatomical') ||
    cat.includes('model')
  ) {
    return 'Equipment';
  }

  if (cat.includes('reading') || cat.includes('learning') || cat.includes('book')) {
    return 'Books';
  }

  return 'Modules';
};

function Inventory({ userRole }: InventoryProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FilterTab>('All');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [cartResourceIds, setCartResourceIds] = useState<string[]>([]);
  const [checkoutResource, setCheckoutResource] = useState<Resource | null>(null);
  const [multiCheckoutResources, setMultiCheckoutResources] = useState<Resource[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isMultiCheckoutModalOpen, setIsMultiCheckoutModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [showFloatingCartActions, setShowFloatingCartActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingQuantityChanges, setPendingQuantityChanges] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch resources on mount
  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (!isMultiSelectMode) {
      setShowFloatingCartActions(false);
      return;
    }

    const handleScroll = () => {
      setShowFloatingCartActions(window.scrollY > 220);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMultiSelectMode]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getAllResources();
      setResources(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load inventory. Please try again.');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityUpdate = async (resourceId: string, newQuantity: number) => {
    try {
      // Optimistically update the UI
      setResources(prevResources =>
        prevResources.map(resource =>
          resource.id === resourceId
            ? { ...resource, quantity: newQuantity, status: newQuantity > 0 ? 'available' : 'reserved' }
            : resource
        )
      );

      // Update the backend
      const updatedResource = await updateResource(resourceId, { quantity: newQuantity });

      setResources(prevResources =>
        prevResources.map(resource =>
          resource.id === resourceId
            ? updatedResource
            : resource
        )
      );
    } catch (err: any) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity. Please try again.');
      // Revert on error
      fetchResources();
    }
  };

  const handleConfirmQuantityChanges = async () => {
    if (Object.keys(pendingQuantityChanges).length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(
        Object.entries(pendingQuantityChanges).map(([resourceId, quantity]) =>
          updateResource(resourceId, { quantity })
        )
      );
      setPendingQuantityChanges({});
      await fetchResources();
      setError('');
    } catch (err: any) {
      console.error('Error saving quantity changes:', err);
      setError('Failed to save quantity changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelQuantityChanges = () => {
    setPendingQuantityChanges({});
    fetchResources();
  };

  const searchMatchedResources = useMemo(() => {
    let filtered = [...resources];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((resource) =>
        resource.title.toLowerCase().includes(query) ||
        resource.type.toLowerCase().includes(query) ||
        resource.keywords.toLowerCase().includes(query) ||
        resource.suggestedTopics.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [resources, searchQuery]);

  const filteredResources = useMemo(() => {
    if (selectedType === 'All') {
      return searchMatchedResources;
    }

    return searchMatchedResources.filter((resource) => mapResourceToTab(resource) === selectedType);
  }, [searchMatchedResources, selectedType]);

  const typeCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = {
      All: searchMatchedResources.length,
      Books: 0,
      Modules: 0,
      Equipment: 0,
    };

    searchMatchedResources.forEach((resource) => {
      const tab = mapResourceToTab(resource);
      counts[tab] += 1;
    });

    return counts;
  }, [searchMatchedResources]);

  const cartResources = useMemo(() => {
    const cartSet = new Set(cartResourceIds);
    return resources.filter((resource) => cartSet.has(resource.id));
  }, [resources, cartResourceIds]);

  const handleReserve = (resourceId: string) => {
    const selectedResource = resources.find((resource) => resource.id === resourceId);
    if (!selectedResource) return;

    setCheckoutResource(selectedResource);
    setIsCheckoutModalOpen(true);
  };

  const handleToggleMultiSelectMode = () => {
    setIsMultiSelectMode((prev) => {
      if (prev) {
        setSelectedResourceIds([]);
      }
      return !prev;
    });
  };

  const handleToggleResourceSelection = (resourceId: string) => {
    setSelectedResourceIds((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleCancelMultiSelect = () => {
    setSelectedResourceIds([]);
    setIsMultiSelectMode(false);
  };

  const handleAddToCart = () => {
    if (selectedResourceIds.length === 0) {
      return;
    }

    setCartResourceIds((prev) => Array.from(new Set([...prev, ...selectedResourceIds])));
    setSelectedResourceIds([]);
    setIsMultiSelectMode(false);
    setIsCartModalOpen(true);
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutResource(null);
  };

  const handleConfirmSingleCheckout = async (
    resourceId: string,
    borrowDate: string,
    requestedQuantity: number,
  ): Promise<ReservationReceipt> => {
    try {
      const response = await reserveResource(resourceId, borrowDate, requestedQuantity);

      setResources((prevResources) =>
        prevResources.map((resource) =>
          resource.id === response.resource.id ? response.resource : resource
        )
      );
      setError('');

      const fallbackResourceTitle = resources.find((resource) => resource.id === resourceId)?.title || 'Resource';

      return {
        reservationId: response.reservation.id,
        resourceTitle: response.reservation.resourceTitle || fallbackResourceTitle,
        requestedQuantity: response.reservation.requestedQuantity || requestedQuantity,
        borrowDate: response.reservation.reservationDate || borrowDate,
        dueDate: response.reservation.dueDate || getDueDateFromBorrowDate(borrowDate),
        status: response.reservation.status || 'pending',
        submittedAt: response.reservation.createdAt || new Date().toISOString(),
      };
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to submit reservation. Please try again.';

      throw new Error(message);
    }
  };

  const handleRemoveFromCart = (resourceId: string) => {
    setCartResourceIds((prev) => prev.filter((id) => id !== resourceId));
  };

  const handleAddMoreMaterials = () => {
    setIsCartModalOpen(false);
    setIsMultiSelectMode(true);
  };

  const handleCheckoutAll = () => {
    const availableItems = cartResources.filter(
      (item) => item.status === 'available' && item.quantity > 0
    );

    if (availableItems.length === 0) {
      alert('No available materials to checkout.');
      return;
    }

    setMultiCheckoutResources(availableItems);
    setIsMultiCheckoutModalOpen(true);
    setIsCartModalOpen(false);
  };

  const handleCloseMultiCheckoutModal = () => {
    setIsMultiCheckoutModalOpen(false);
    setMultiCheckoutResources([]);
  };

  const handleConfirmMultiCheckout = async (
    borrowDate: string,
    requestedQuantities: Record<string, number>,
  ): Promise<MultiReservationReceipt> => {
    const selectedResources = [...multiCheckoutResources];
    const results = await Promise.allSettled(
      selectedResources.map((resource) =>
        reserveResource(resource.id, borrowDate, requestedQuantities[resource.id] ?? 1)
      )
    );

    const successfulItems: MultiReservationReceiptItem[] = [];
    const failedItems: MultiReservationFailureItem[] = [];
    const updatedResourcesById = new Map<string, Resource>();

    let resolvedBorrowDate = borrowDate;
    let resolvedDueDate = getDueDateFromBorrowDate(borrowDate);
    let resolvedSubmittedAt = new Date().toISOString();

    results.forEach((result, index) => {
      const currentResource = selectedResources[index];

      if (result.status === 'fulfilled') {
        const payload = result.value;

        successfulItems.push({
          reservationId: payload.reservation.id,
          resourceId: currentResource.id,
          resourceTitle: payload.reservation.resourceTitle || currentResource.title,
          requestedQuantity:
            payload.reservation.requestedQuantity || requestedQuantities[currentResource.id] || 1,
          status: payload.reservation.status || 'pending',
        });

        updatedResourcesById.set(payload.resource.id, payload.resource);

        if (payload.reservation.reservationDate) {
          resolvedBorrowDate = payload.reservation.reservationDate;
        }
        if (payload.reservation.dueDate) {
          resolvedDueDate = payload.reservation.dueDate;
        }
        if (payload.reservation.createdAt) {
          resolvedSubmittedAt = payload.reservation.createdAt;
        }

        return;
      }

      const reason =
        result.reason?.response?.data?.error ||
        result.reason?.response?.data?.message ||
        result.reason?.message ||
        'Failed to submit reservation.';

      failedItems.push({
        resourceId: currentResource.id,
        resourceTitle: currentResource.title,
        requestedQuantity: requestedQuantities[currentResource.id] || 1,
        reason,
      });
    });

    if (successfulItems.length === 0) {
      throw new Error(failedItems[0]?.reason || 'Failed to submit reservations. Please try again.');
    }

    setResources((prevResources) =>
      prevResources.map((resource) => updatedResourcesById.get(resource.id) || resource)
    );

    const successfulResourceIds = new Set(successfulItems.map((item) => item.resourceId));
    setCartResourceIds((prev) => prev.filter((id) => !successfulResourceIds.has(id)));
    setError('');

    return {
      borrowDate: resolvedBorrowDate,
      dueDate: resolvedDueDate,
      submittedAt: resolvedSubmittedAt,
      successfulItems,
      failedItems,
    };
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Loading inventory...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Find Your Resources</h1>
        <p className={styles.subtitle}>Search through our collection of books, modules, and equipment</p>
      </div>

      <SearchToolbar
        searchQuery={searchQuery}
        selectedType={selectedType}
        types={FILTER_TABS}
        typeCounts={typeCounts}
        filteredCount={filteredResources.length}
        totalCount={resources.length}
        showMultiSelectControls={userRole === 'user'}
        isMultiSelectMode={isMultiSelectMode}
        selectedCount={selectedResourceIds.length}
        onSearchChange={setSearchQuery}
        onTypeChange={(value) => setSelectedType(value as FilterTab)}
        onToggleMultiSelectMode={handleToggleMultiSelectMode}
        onAddToCart={handleAddToCart}
        onCancelMultiSelect={handleCancelMultiSelect}
      />

      {error && <div className={styles.error}>{error}</div>}

      <ResourceGrid
        resources={filteredResources}
        userRole={userRole}
        isMultiSelectMode={isMultiSelectMode}
        selectedResourceIds={selectedResourceIds}
        onReserve={handleReserve}
        onToggleResourceSelection={handleToggleResourceSelection}
        onClearFilters={clearFilters}
        onQuantityUpdate={userRole === 'admin' ? handleQuantityUpdate : undefined}
      />

      {userRole === 'admin' && Object.keys(pendingQuantityChanges).length > 0 && (
        <div className={styles.quantityConfirmationBar}>
          <div className={styles.confirmationContent}>
            <p className={styles.confirmationText}>
              {Object.keys(pendingQuantityChanges).length} item{Object.keys(pendingQuantityChanges).length > 1 ? 's' : ''} pending changes
            </p>
            <div className={styles.confirmationButtons}>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleConfirmQuantityChanges}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Confirm Changes'}
              </button>
              <button
                type="button"
                className={styles.cancelChangesButton}
                onClick={handleCancelQuantityChanges}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {userRole === 'user' && isMultiSelectMode && showFloatingCartActions && (
        <div className={styles.floatingCartBar}>
          <p className={styles.floatingCartText}>
            {selectedResourceIds.length > 0
              ? `${selectedResourceIds.length} item(s) selected`
              : 'Select materials to add to cart'}
          </p>
          <div className={styles.floatingCartButtons}>
            <button
              type="button"
              className={styles.floatingCartAddButton}
              onClick={handleAddToCart}
              disabled={selectedResourceIds.length === 0}
            >
              Add to Cart ({selectedResourceIds.length})
            </button>
            <button
              type="button"
              className={styles.floatingCartCancelButton}
              onClick={handleCancelMultiSelect}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        resource={checkoutResource}
        onClose={handleCloseCheckoutModal}
        onConfirm={handleConfirmSingleCheckout}
      />

      <MultiCheckoutModal
        isOpen={isMultiCheckoutModalOpen}
        resources={multiCheckoutResources}
        onClose={handleCloseMultiCheckoutModal}
        onConfirm={handleConfirmMultiCheckout}
      />

      <CartOverviewModal
        isOpen={isCartModalOpen}
        cartResources={cartResources}
        onClose={() => setIsCartModalOpen(false)}
        onRemoveItem={handleRemoveFromCart}
        onAddMore={handleAddMoreMaterials}
        onCheckoutAll={handleCheckoutAll}
      />
    </div>
  );
}

export default Inventory;
