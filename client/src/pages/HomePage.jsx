import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        params: {
          search,
          category: category || undefined
        }
      });
      setProducts(response.data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    const response = await api.get('/products/categories');
    setCategories(response.data);
  }

  return (
    <section>
      <div className="hero">
        <div>
          <h1>Build a portfolio-ready storefront.</h1>
          <p>
            This version includes product editing, local image upload support,
            stronger validation, admin workflows, and deployment files.
          </p>
        </div>
      </div>

      <div className="filters">
        <input
          className="input"
          placeholder="Search products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="input"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading products...</p>}

      {!loading && !products.length && (
        <div className="empty-state">
          <p>No products match your search yet.</p>
        </div>
      )}

      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
