// src/App.jsx
import { useEffect, useState } from "react";
import AddProductForm from "./components/AddProductForm";
import ProductList from "./components/ProductList";
import { API_URL } from "./config";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/products`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to load products");
      }

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductAdded = () => {
    fetchProducts();
  };

  const handleProductChanged = () => {
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold mb-2">Product Store System</h1>
          <p className="text-gray-600">
            Add, view, update and delete products using your backend API.
          </p>
        </header>

        {/* ONE Add form */}
        <AddProductForm onProductAdded={handleProductAdded} />

        {loading && <p className="text-center">Loading products...</p>}

        {error && (
          <p className="text-center text-red-600 font-semibold">{error}</p>
        )}

        {/* ONE Product list */}
        {!loading && !error && (
          <ProductList
            products={products}
            onProductChanged={handleProductChanged}
          />
        )}
      </div>
    </div>
  );
}

export default App;

