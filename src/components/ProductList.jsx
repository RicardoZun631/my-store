// src/components/ProductList.jsx
/* eslint-disable react/prop-types */
import { API_URL } from "../config";

function ProductList({ products, onProductChanged }) {
  const handleDelete = async (id) => {
    if (!window.confirm("Delete product?")) return;

    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete");
      }
      onProductChanged?.();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = async (product) => {
    const name = window.prompt("Name:", product.name);
    if (name === null) return;

    const priceStr = window.prompt("Price:", product.price);
    if (priceStr === null) return;
    const price = Number(priceStr);
    if (Number.isNaN(price)) return alert("Invalid price");

    const category = window.prompt("Category:", product.category || "");
    if (category === null) return;

    const description = window.prompt(
      "Description:",
      product.description || ""
    );
    if (description === null) return;

    try {
      const res = await fetch(`${API_URL}/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, category, description }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update");
      }
      onProductChanged?.();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="card">
      <h2 className="card-title">Products</h2>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th style={{ textAlign: "right" }}>Price</th>
              <th>Category</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length ? (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td style={{ textAlign: "right" }}>${p.price}</td>
                  <td>{p.category || "-"}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>{" "}
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "12px" }}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="card-grid-title">Card View</h3>
      <div className="card-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            {p.image && (
              <img
                src={`data:image/jpeg;base64,${p.image}`}
                alt={p.name}
              />
            )}
            <div className="product-name">{p.name}</div>
            <div className="product-meta">
              {p.category || "Uncategorized"}
            </div>
            <div className="product-price">${p.price}</div>
            <div className="product-desc">
              {p.description || "No description"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProductList;
