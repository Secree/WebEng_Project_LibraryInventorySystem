import { useState, useEffect } from 'react';
import { getAllResources } from '../../services/api';
import styles from './Inventory.module.css';

interface Resource {
  id: string;
  title: string;
  type: string;
  quantity: number;
  suggestedTopics: string;
  keywords: string;
  pictureUrl: string;
  status: string;
}

interface InventoryProps {
  userRole?: string;
}

function Inventory({ userRole }: InventoryProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch resources on mount
  useEffect(() => {
    fetchResources();
  }, []);

  // Filter resources when search or type changes
  useEffect(() => {
    filterResources();
  }, [searchQuery, selectedType, resources]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getAllResources();
      setResources(data);
      setFilteredResources(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load inventory. Please try again.');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(query) ||
        resource.type.toLowerCase().includes(query) ||
        resource.keywords.toLowerCase().includes(query) ||
        resource.suggestedTopics.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (selectedType !== 'All') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  };

  // Get unique types for filter dropdown
  const getUniqueTypes = () => {
    const types = resources.map(r => r.type);
    return ['All', ...Array.from(new Set(types)).sort()];
  };

  const handleReserve = (resourceId: string) => {
    // TODO: Implement reservation logic
    alert(`Reservation feature coming soon for resource: ${resourceId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📚 Library Inventory</h1>
        <p className={styles.subtitle}>Browse and search instructional materials</p>
      </div>

      {/* Search and Filter Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="🔍 Search by title, keywords, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterBar}>
          <label htmlFor="typeFilter">Filter by Type:</label>
          <select
            id="typeFilter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={styles.filterSelect}
          >
            {getUniqueTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className={styles.resultsCount}>
          Showing {filteredResources.length} of {resources.length} items
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Resources Grid */}
      <div className={styles.resourcesGrid}>
        {filteredResources.length === 0 ? (
          <div className={styles.noResults}>
            <p>No materials found matching your search.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedType('All'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <div key={resource.id} className={styles.resourceCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.resourceTitle}>{resource.title}</h3>
                <span className={`${styles.typeBadge} ${styles[resource.type.replace(/\s+/g, '')]}`}>
                  {resource.type}
                </span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Quantity:</span>
                  <span className={styles.value}>
                    {resource.quantity} {resource.quantity === 1 ? 'item' : 'items'}
                  </span>
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
                      {resource.keywords.split('\n')
                        .filter(k => k.trim())
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
                  <button 
                    className={styles.reserveButton}
                    onClick={() => handleReserve(resource.id)}
                    disabled={resource.status !== 'available' || resource.quantity === 0}
                  >
                    {resource.status === 'available' ? 'Reserve Item' : 'Not Available'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Inventory;
