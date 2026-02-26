import { useState, useEffect, useMemo } from 'react';
import { getAllResources } from '../../services/api';
import styles from './Inventory.module.css';
import SearchToolbar from '../../components/inventory/SearchToolbar/SearchToolbar';
import ResourceGrid from '../../components/inventory/ResourceGrid';
import CheckoutModal from '../../components/inventory/CheckoutModal';
import CartOverviewModal from '../../components/inventory/CartOverviewModal';
import type { Resource } from '../../components/inventory/types';

interface InventoryProps {
  userRole?: string;
}

type FilterTab = 'All' | 'Books' | 'Modules' | 'Equipment';

const FILTER_TABS: FilterTab[] = ['All', 'Books', 'Modules', 'Equipment'];

const mapResourceToTab = (resource: Resource): Exclude<FilterTab, 'All'> => {
  const type = resource.type.toLowerCase();

  if (
    type.includes('laboratory') ||
    type.includes('equipment') ||
    type.includes('measuring') ||
    type.includes('weighing') ||
    type.includes('safety') ||
    type.includes('energy')
  ) {
    return 'Equipment';
  }

  if (type.includes('reading') || type.includes('learning') || type.includes('book')) {
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
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch resources on mount
  useEffect(() => {
    fetchResources();
  }, []);

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

  const handleConfirmSingleCheckout = (resourceId: string) => {
    alert(`Checkout submitted for resource: ${resourceId}`);
    handleCloseCheckoutModal();
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

    alert(`Checkout submitted for ${availableItems.length} item(s).`);
    setCartResourceIds((prev) =>
      prev.filter((id) => !availableItems.some((item) => item.id === id))
    );
    setIsCartModalOpen(false);
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
        <h1>📚 Find Your Resources</h1>
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
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        resource={checkoutResource}
        onClose={handleCloseCheckoutModal}
        onConfirm={handleConfirmSingleCheckout}
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
