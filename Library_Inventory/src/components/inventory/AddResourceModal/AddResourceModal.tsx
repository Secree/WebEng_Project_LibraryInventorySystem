import { useState, useRef } from 'react';
import styles from './AddResourceModal.module.css';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resourceData: any) => Promise<void>;
}

function AddResourceModal({ isOpen, onClose, onSave }: AddResourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    quantity: 1,
    suggestedTopics: '',
    keywords: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent unused variable warning (kept for potential future file upload functionality)
  void imageFile;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? (value ? parseInt(value) : '') : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      setError('Title and Category are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resourceData = {
        ...formData,
        imageUrl: imagePreview || '',
        pictureUrl: imagePreview || '',
        availableQuantity: formData.quantity,
        status: 'available'
      };

      await onSave(resourceData);
      
      // Reset form
      setFormData({
        title: '',
        category: '',
        quantity: 1,
        suggestedTopics: '',
        keywords: '',
      });
      setImageFile(null);
      setImagePreview('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add New Resource</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Title *</label>
              <div className={styles.formInput}>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter resource title"
                  className={styles.inputText}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category *</label>
              <div className={styles.formInput}>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className={styles.inputSelect}
                >
                  <option value="">Select category</option>
                  <option value="Books">Books</option>
                  <option value="Modules">Modules</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="quantity">Quantity *</label>
              <div className={styles.formInput}>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className={styles.inputNumber}
                />
              </div>
            </div>

          </div>

          <div className={styles.formGroup}>
            <label htmlFor="suggestedTopics">Topics</label>
            <div className={styles.formInput}>
              <textarea
                id="suggestedTopics"
                name="suggestedTopics"
                value={formData.suggestedTopics}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter topics where this resource can be used"
                className={styles.inputText}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="keywords">Keywords</label>
            <div className={styles.formInput}>
              <textarea
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                rows={2}
                placeholder="Keywords for searching (comma separated)"
                className={styles.inputText}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="image">Image</label>
            <div className={styles.formInput}>
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
            </div>
            <div className={styles.formInput}>
              <div className={styles.imageFilePreviewContainer}>
                {imagePreview ? (
                  <div className={styles.imagePreviewContainer}>
                    <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                    <button type="button" onClick={handleRemoveImage} className={styles.removeImageBtn}>
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <span>📷</span>
                    <p>Click to upload image (max 5MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={loading}>
              {loading ? 'Saving...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddResourceModal;
