import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed.');
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Create account</h2>
      <input
        className="input"
        placeholder="Name"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
      />
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
        Register
      </button>
    </form>
  );
}
