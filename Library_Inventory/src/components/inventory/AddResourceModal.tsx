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
    type: 'other',
    quantity: 1,
    description: '',
    suggestedTopics: '',
    keywords: '',
    author: '',
    publisher: '',
    isbn: '',
    yearPublished: '',
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
      [name]: name === 'quantity' || name === 'yearPublished' ? (value ? parseInt(value) : '') : value
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
        type: 'other',
        quantity: 1,
        description: '',
        suggestedTopics: '',
        keywords: '',
        author: '',
        publisher: '',
        isbn: '',
        yearPublished: '',
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
    <div className={styles.modalOverlay} onClick={onClose}>
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
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter resource title"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select category</option>
                <option value="Laboratory Equipment">Laboratory Equipment</option>
                <option value="Reading Materials">Reading Materials</option>
                <option value="Mathematical Manipulatives">Mathematical Manipulatives</option>
                <option value="Energy Kits">Energy Kits</option>
                <option value="Learning Materials">Learning Materials</option>
                <option value="Measuring Equipment">Measuring Equipment</option>
                <option value="Laboratory Measuring Tool">Laboratory Measuring Tool</option>
                <option value="Anatomical Model">Anatomical Model</option>
                <option value="Weighing Equipment">Weighing Equipment</option>
                <option value="Laboratory Safety Equipment">Laboratory Safety Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="other">Other</option>
                <option value="book">Book</option>
                <option value="journal">Journal</option>
                <option value="magazine">Magazine</option>
                <option value="digital">Digital</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="author">Author</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Author name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="publisher">Publisher</label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                placeholder="Publisher name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="isbn">ISBN</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                placeholder="ISBN number"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="yearPublished">Year Published</label>
              <input
                type="number"
                id="yearPublished"
                name="yearPublished"
                value={formData.yearPublished}
                onChange={handleInputChange}
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter resource description"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="suggestedTopics">Suggested Topics</label>
            <textarea
              id="suggestedTopics"
              name="suggestedTopics"
              value={formData.suggestedTopics}
              onChange={handleInputChange}
              rows={2}
              placeholder="Topics where this resource can be used"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="keywords">Keywords</label>
            <textarea
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              rows={2}
              placeholder="Keywords for searching (comma separated)"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="image">Image</label>
            <div className={styles.imageUpload}>
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
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
