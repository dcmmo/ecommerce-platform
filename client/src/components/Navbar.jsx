import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        ShopStack
      </Link>

      <nav className="nav-links">
        <NavLink to="/">Products</NavLink>
        {user && <NavLink to="/orders">Orders</NavLink>}
        <NavLink to="/cart">Cart ({items.length})</NavLink>
        {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="welcome">Hi, {user.name}</span>
            <button className="secondary-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="secondary-button" to="/login">
              Login
            </Link>
            <Link className="primary-button" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
