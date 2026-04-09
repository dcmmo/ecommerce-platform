import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!stripe || !elements || !shippingAddress) {
      return;
    }

    setSubmitting(true);

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });

    if (result.error) {
      alert(result.error.message);
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/orders/checkout', {
        paymentIntentId: result.paymentIntent.id,
        shippingAddress
      });

      await fetchCart();
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Checkout</h2>
      <input
        className="input"
        placeholder="Shipping address"
        value={shippingAddress}
        onChange={(event) => setShippingAddress(event.target.value)}
      />
      <PaymentElement />
      <button className="primary-button" type="submit" disabled={!stripe || submitting}>
        {submitting ? 'Processing...' : 'Pay now'}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    createPaymentIntent();
  }, []);

  async function createPaymentIntent() {
    try {
      const response = await api.post('/payments/create-payment-intent');
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to start checkout.');
    }
  }

  const options = useMemo(
    () => ({
      clientSecret
    }),
    [clientSecret]
  );

  if (!clientSecret) {
    return <p>Preparing checkout...</p>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}
