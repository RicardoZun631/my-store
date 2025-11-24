// src/App.jsx
import { useEffect, useState } from "react";
import "./App.css";
import AddProductForm from "./components/AddProductForm";
import ProductList from "./components/ProductList";
import { API_URL } from "./config";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) {
        throw new Error("Error fetching products");
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductAdded = () => {
    fetchProducts(); // refresh table after add
  };

  const handleProductChanged = () => {
    fetchProducts(); // refresh after delete
  };

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Store Product Management System
          </h1>
          <p className="text-gray-600">
            Add, view, update and delete products using your own backend API.
          </p>
        </header>

        <AddProductForm onProductAdded={handleProductAdded} />

        {loading && <p className="text-center">Loading products...</p>}
        {error && (
          <p className="text-center text-red-600 font-semibold">{error}</p>
        )}

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
