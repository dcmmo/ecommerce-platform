import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
  categoryId: ''
};

function dollarsToCents(value) {
  const amount = Number(value);
  if (Number.isNaN(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}

function centsToDollars(value) {
  return value ? (value / 100).toFixed(2) : '';
}

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const formTitle = useMemo(() => (editingId ? 'Edit product' : 'Add product'), [editingId]);

  async function fetchData() {
    try {
      const [productRes, orderRes, categoryRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
        api.get('/products/categories')
      ]);

      setProducts(productRes.data);
      setOrders(orderRes.data);
      setCategories(categoryRes.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load admin data.');
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: centsToDollars(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId ? String(product.categoryId) : ''
    });
    setMessage('Editing existing product.');
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const payload = new FormData();
    payload.append('image', file);

    try {
      const response = await api.post('/uploads/image', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((current) => ({ ...current, imageUrl: response.data.imageUrl }));
      setMessage('Image uploaded.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleSaveProduct(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const payload = {
      ...form,
      price: dollarsToCents(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId ? Number(form.categoryId) : null
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage('Product updated.');
      } else {
        await api.post('/products', payload);
        setMessage('Product created.');
      }
      resetForm();
      await fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
      if (editingId === id) {
        resetForm();
      }
      setMessage('Product deleted.');
      await fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete product.');
    }
  }

  async function handleStatusUpdate(orderId, status) {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setMessage('Order status updated.');
      await fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update order.');
    }
  }

  return (
    <section className="admin-layout">
      <div className="form-card">
        <div className="section-heading">
          <div>
            <h2>{formTitle}</h2>
            <p>Use an image URL or upload a local image.</p>
          </div>
          {editingId && (
            <button className="secondary-button" type="button" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>

        {message && <p className="status-message">{message}</p>}

        <form onSubmit={handleSaveProduct} className="stack">
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <textarea
            className="input"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <input
            className="input"
            placeholder="Price in dollars"
            inputMode="decimal"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
          />
          <input
            className="input"
            placeholder="Stock"
            inputMode="numeric"
            value={form.stock}
            onChange={(event) => setForm({ ...form, stock: event.target.value })}
          />
          <input
            className="input"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
          />

          <label className="upload-field">
            <span>{uploading ? 'Uploading image...' : 'Upload image'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>

          {form.imageUrl && (
            <img className="admin-preview" src={form.imageUrl} alt="Product preview" />
          )}

          <select
            className="input"
            value={form.categoryId}
            onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button className="primary-button" type="submit" disabled={saving || uploading}>
            {saving ? 'Saving...' : editingId ? 'Update product' : 'Save product'}
          </button>
        </form>
      </div>

      <div className="stack">
        <div className="card">
          <div className="section-heading">
            <h2>Products</h2>
            <span>{products.length} total</span>
          </div>
          {!products.length && <p>No products yet.</p>}
          {products.map((product) => (
            <div className="admin-row" key={product.id}>
              <div className="admin-product-meta">
                <strong>{product.name}</strong>
                <span>${(product.price / 100).toFixed(2)} · Stock {product.stock}</span>
              </div>
              <div className="button-group">
                <button className="secondary-button" onClick={() => startEdit(product)}>
                  Edit
                </button>
                <button
                  className="secondary-button"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-heading">
            <h2>Orders</h2>
            <span>{orders.length} total</span>
          </div>
          {!orders.length && <p>No orders yet.</p>}
          {orders.map((order) => (
            <div className="admin-order" key={order.id}>
              <div>
                <strong>Order #{order.id}</strong>
                <p>{order.user?.email}</p>
                <span>${(order.totalAmount / 100).toFixed(2)}</span>
              </div>
              <select
                className="input compact-input"
                value={order.status}
                onChange={(event) => handleStatusUpdate(order.id, event.target.value)}
              >
                <option value="PAID">PAID</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELED">CANCELED</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
