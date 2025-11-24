// src/components/ProductList.jsx
/* eslint-disable react/prop-types */
import { API_URL } from "../config";

function ProductList({ products, onProductDeleted }) {
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error deleting product");
      }

      if (onProductDeleted) onProductDeleted(id);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete product");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Products (Table View)</h2>

      <table className="border-collapse border border-gray-400">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-400 px-3 py-1">ID</th>
            <th className="border border-gray-400 px-3 py-1">Name</th>
            <th className="border border-gray-400 px-3 py-1">Price</th>
            <th className="border border-gray-400 px-3 py-1">Category</th>
            <th className="border border-gray-400 px-3 py-1">Description</th>
            <th className="border border-gray-400 px-3 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border border-gray-400 px-3 py-1">{p.id}</td>
              <td className="border border-gray-400 px-3 py-1">{p.name}</td>
              <td className="border border-gray-400 px-3 py-1">
                ${Number(p.price).toFixed(2)}
              </td>
              <td className="border border-gray-400 px-3 py-1">
                {p.category}
              </td>
              <td className="border border-gray-400 px-3 py-1">
                {p.description}
              </td>
              <td className="border border-gray-400 px-3 py-1">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {products.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="border border-gray-400 px-3 py-2 text-center"
              >
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;
