import { useEffect, useState } from 'react';
import api from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const response = await api.get('/orders');
    setOrders(response.data);
  }

  return (
    <section>
      <h2>Order history</h2>

      {!orders.length && <p>No orders yet.</p>}

      <div className="stack">
        {orders.map((order) => (
          <div className="card" key={order.id}>
            <div className="order-header">
              <div>
                <h3>Order #{order.id}</h3>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className="status-chip">{order.status}</span>
            </div>

            <ul className="order-list">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.product.name} x {item.quantity}
                </li>
              ))}
            </ul>

            <strong>Total: ${(order.totalAmount / 100).toFixed(2)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
