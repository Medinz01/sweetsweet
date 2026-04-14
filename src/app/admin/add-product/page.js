'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Button, DialogContentText, Snackbar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './add-product.css'; // New CSS file

const initialFormState = {
  id: null, name: '', slug: '', categoryId: '',
  pricePerKg: '', pricePerUnit: '', unitLabel: '',
  image: '', description: '', isAvailable: true,
};

export default function AddProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);const [form, setForm] = useState(initialFormState);
  const [productImageFile, setProductImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/product', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.map(p => ({ ...p, price: p.pricePerKg ?? p.pricePerUnit })));
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbarMessage(`Error fetching products: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/category', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbarMessage(`Error fetching categories: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setProductImageFile(null);
      setPreviewImage(null);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.categoryId) {
      setSnackbarMessage('Name, Slug, and Category are required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    let finalImageUrl = form.image;

    try {
      if (productImageFile) {
        const formData = new FormData();
        formData.append('image', productImageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(`Image upload failed: ${errorData.error || 'Unknown error'}`);
        }
        const uploadResult = await uploadRes.json();
        finalImageUrl = uploadResult.imageUrl;
      }

      const method = isEditing ? 'PUT' : 'POST';
      const url = '/api/product';
      const productDataToSave = { ...form, image: finalImageUrl };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productDataToSave),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(`Operation failed: ${data.error || 'Something went wrong'}`);
      }

      setSnackbarMessage(isEditing ? 'Product Updated' : 'Product Added');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setModalOpen(false);
      setProductImageFile(null);
      setPreviewImage(null);
      setForm(initialFormState);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setIsEditing(true);
      setForm({
        ...product,
        categoryId: product.category?.id || '',
        image: product.image || '',
      });
      setPreviewImage(product.image || null);
    } else {
      setIsEditing(false);
      setForm(initialFormState);
      setPreviewImage(null);
    }
    setProductImageFile(null);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setProductToDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmDeleteOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/product?id=${productToDeleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(`Deletion failed: ${data.message || 'Something went wrong'}`);
      }
      setSnackbarMessage('Product deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setProductToDeleteId(null);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
  <div className="products-container">
    <div className="products-header">
      <h2>Products ({products.length})</h2>
      <button onClick={() => handleOpenModal()}>
        <AddIcon fontSize="small" /> Add Product
        </button>
        </div>
        
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  <img
                  src={p.image || 'https://placehold.co/60x60/cccccc/000000?text=No+Img'}
                  alt={p.name}
                  className="product-list-image"
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.category?.name || '-'}</td>
                <td>₹{p.pricePerKg ?? p.pricePerUnit}</td>
                <td>{p.isAvailable ? 'Yes' : 'No'}</td>
                <td className="products-actions">
                  <button onClick={() => handleOpenModal(p)}><EditIcon fontSize="small" /></button>
                  <button onClick={() => handleDeleteClick(p.id)}><DeleteIcon fontSize="small" /></button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>

{/* Product Add/Edit Modal */}
<Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
<DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle>
<DialogContent dividers>
<TextField fullWidth label="Name" name="name" value={form.name || ''} onChange={handleChange} margin="normal" required />
<TextField fullWidth label="Slug" name="slug" value={form.slug || ''} onChange={handleChange} margin="normal" required />
<FormControl fullWidth margin="normal" required>
<InputLabel>Category</InputLabel>
<Select name="categoryId" value={form.categoryId || ''} onChange={handleChange} label="Category">
{categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
</Select>
</FormControl>
<TextField fullWidth label="Price Per Kg" name="pricePerKg" type="number" value={form.pricePerKg || ''} onChange={handleChange} margin="normal" />
<TextField fullWidth label="Price Per Unit" name="pricePerUnit" type="number" value={form.pricePerUnit || ''} onChange={handleChange} margin="normal" />
<TextField fullWidth label="Unit Label" name="unitLabel" value={form.unitLabel || ''} onChange={handleChange} margin="normal" />
          <Button variant="contained" component="label" fullWidth sx={{ mt: 2, mb: 1 }}>
            {productImageFile ? productImageFile.name : (previewImage ? 'Change Image' : 'Upload Image')}
            <input type="file" hidden name="image" onChange={handleImageFileChange} accept="image/*" />
          </Button>
          {previewImage && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <img src={previewImage} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px' }}/>
              <Button
                variant="outlined" color="error" size="small"
                onClick={() => {
                  setProductImageFile(null);
                  setPreviewImage(null);
                  setForm(prev => ({ ...prev, image: '' }));
                }}
                sx={{ ml: 2 }}
              >
                Remove
              </Button>
            </div>
          )}
<TextField fullWidth label="Description" name="description" value={form.description || ''} onChange={handleChange} multiline minRows={3} margin="normal" />
<FormControlLabel
control={<Switch checked={form.isAvailable} onChange={handleChange} name="isAvailable" />}
label="Is Available"
sx={{ mt: 2 }}
/>
</DialogContent>
<DialogActions className="dialog-actions">
<Button onClick={() => setModalOpen(false)} className="cancel-btn">Cancel</Button>
<Button onClick={handleSave} className="save-btn">Save</Button>
</DialogActions>
</Dialog>

<Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
<DialogTitle>Confirm Deletion</DialogTitle>
<DialogContent>
<DialogContentText>
Are you sure you want to delete this product? This action cannot be undone.
</DialogContentText>
</DialogContent>
<DialogActions>
<Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
<Button onClick={handleConfirmDelete} color="error">Delete</Button>
</DialogActions>
</Dialog>

<Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
<Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
{snackbarMessage}
</Alert>
</Snackbar>
</div>
);
}
