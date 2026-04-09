import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, total, updateCartItem, removeCartItem } = useCart();

  return (
    <section>
      <h2>Your cart</h2>

      {!items.length && (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link className="primary-button" to="/">
            Browse products
          </Link>
        </div>
      )}

      <div className="stack">
        {items.map((item) => (
          <div className="cart-row" key={item.id}>
            <img className="cart-image" src={item.product.imageUrl} alt={item.product.name} />
            <div className="cart-info">
              <h3>{item.product.name}</h3>
              <p>${(item.product.price / 100).toFixed(2)}</p>
            </div>
            <input
              className="input quantity-input"
              type="number"
              min="1"
              value={item.quantity}
              onChange={(event) =>
                updateCartItem(item.id, Number(event.target.value))
              }
            />
            <button
              className="secondary-button"
              onClick={() => removeCartItem(item.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {!!items.length && (
        <div className="checkout-summary">
          <h3>Total: ${(total / 100).toFixed(2)}</h3>
          <Link className="primary-button" to="/checkout">
            Proceed to checkout
          </Link>
        </div>
      )}
    </section>
  );
}
