import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed.');
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        className="input"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
      />
      <input
        className="input"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
      />
      <button className="primary-button" type="submit">
        Sign in
      </button>
    </form>
  );
}
