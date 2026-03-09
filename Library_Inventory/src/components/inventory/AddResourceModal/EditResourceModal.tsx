import { useEffect, useRef, useState } from 'react';
import styles from './AddResourceModal.module.css';
import type { Resource } from '../types';

interface EditableResource extends Resource {
  imageUrl?: string;
}

interface EditResourceModalProps {
  isOpen: boolean;
  resource: EditableResource | null;
  onClose: () => void;
  onSave: (resourceId: string, resourceData: any) => Promise<void>;
}

const normalizeCategoryValue = (category?: string, fallbackType?: string) => {
  const normalized = (category || fallbackType || '').toLowerCase();

  if (!normalized) {
    return '';
  }

  if (
    normalized.includes('equipment') ||
    normalized.includes('laboratory') ||
    normalized.includes('measuring') ||
    normalized.includes('weighing') ||
    normalized.includes('safety') ||
    normalized.includes('energy') ||
    normalized.includes('anatomical') ||
    normalized.includes('model')
  ) {
    return 'Equipment';
  }

  if (
    normalized.includes('books') ||
    normalized.includes('book') ||
    normalized.includes('reading') ||
    normalized.includes('learning')
  ) {
    return 'Books';
  }

  return 'Modules';
};

const getFormDataFromResource = (resource: EditableResource | null) => ({
  title: resource?.title || '',
  category: normalizeCategoryValue(resource?.category, resource?.type),
  quantity: resource?.quantity ?? 1,
  suggestedTopics: resource?.suggestedTopics || '',
  keywords: resource?.keywords || '',
});

function EditResourceModal({ isOpen, resource, onClose, onSave }: EditResourceModalProps) {
  const [formData, setFormData] = useState(getFormDataFromResource(resource));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  void imageFile;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(getFormDataFromResource(resource));
    setImagePreview(resource?.pictureUrl || resource?.imageUrl || '');
    setImageFile(null);
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [isOpen, resource]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? (value ? parseInt(value, 10) : '') : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
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

    if (!resource) {
      return;
    }

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
        status: Number(formData.quantity) > 0 ? 'available' : 'reserved',
      };

      await onSave(resource.id, resourceData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update resource');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !resource) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Resource</h2>
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
                  min="0"
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
                placeholder="Keywords for searching"
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditResourceModal;
