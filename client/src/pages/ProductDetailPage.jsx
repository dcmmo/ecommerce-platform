import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    const response = await api.get(`/products/${id}`);
    setProduct(response.data);
  }

  if (!product) {
    return <p>Loading product...</p>;
  }

  async function handleAddToCart() {
    if (!user) {
      setMessage('Log in to add items to your cart.');
      return;
    }

    try {
      await addToCart(product.id, 1);
      setMessage('Added to cart.');
    } catch {
      setMessage('Unable to add item to cart.');
    }
  }

  return (
    <section className="detail-layout">
      <img className="detail-image" src={product.imageUrl} alt={product.name} />
      <div className="detail-panel">
        <span className="category-chip">{product.category?.name || 'General'}</span>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p className="price">${(product.price / 100).toFixed(2)}</p>
        <p>{product.stock} items available</p>
        {message && <p className="status-message">{message}</p>}
        <button className="primary-button" onClick={handleAddToCart} disabled={!product.stock}>
          {product.stock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>
    </section>
  );
}
