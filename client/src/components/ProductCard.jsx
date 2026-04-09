import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  async function handleAddToCart() {
    if (!user) {
      alert('Log in to add items to your cart.');
      return;
    }

    await addToCart(product.id, 1);
    alert('Added to cart.');
  }

  return (
    <div className="card product-card">
      <img
        className="product-image"
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
      />
      <div className="card-body">
        <div className="product-meta">
          <span className="category-chip">{product.category?.name || 'General'}</span>
          <span>{product.stock} in stock</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-footer">
          <strong>${(product.price / 100).toFixed(2)}</strong>
          <div className="button-group">
            <Link className="secondary-button" to={`/products/${product.id}`}>
              View
            </Link>
            <button className="primary-button" onClick={handleAddToCart}>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
