// src/components/AddProductForm.jsx
import React, { useState } from "react";
import { API_URL } from "../config";

/* eslint-disable react/prop-types */
export default function AddProductForm({ onProductAdded }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [newId, setNewId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result; // "data:image/png;base64,AAAA..."
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setNewId(null);
    setLoading(true);

    try {
      if (!title.trim() || !price) {
        setMessage("Name and price are required.");
        setLoading(false);
        return;
      }

      let imageBase64 = null;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      const payload = {
        name: title.trim(),
        price: Number(price),
        description: description.trim() || null,
        category: category.trim() || null,
        image: imageBase64,
      };

      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error creating product");
      }

      const created = await res.json(); // { id, name, ... }

      setMessage("Product successfully added!");
      setNewId(created.id);

      // clear form
      setTitle("");
      setPrice("");
      setDescription("");
      setCategory("");
      setImageFile(null);
      setImagePreview(null);

      // notify parent so it can re-fetch products
      if (onProductAdded) {
        onProductAdded(created);
      }

      // If for some reason state wiring is off, this *forces* a refresh:
      // window.location.reload();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

      {message && (
        <p className="mb-2 text-sm text-blue-700 font-medium">
          {message} {newId && <>ID: {newId}</>}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded p-2"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="12.99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short product description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Electronics, Shoes, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Image Upload (optional)
          </label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 h-32 object-cover rounded border"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Submitting..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
