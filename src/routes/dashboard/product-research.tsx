import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { theNewPRA } from "../api/the-new-pra";

/**
 * Dashboard for TheNewPRA – generic product research.
 * Allows the user to input any product URL and view the extracted title
 * and meta description.
 */
function ProductResearchDashboard() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await theNewPRA({ url });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch product data. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 space-y-4">
        <h1 className="text-3xl font-bold text-white text-center mb-4">Product Research Scout</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <label htmlFor="url" className="text-sm font-medium text-white">Product URL</label>
          <input
            id="url"
            type="url"
            placeholder="https://example.com/product"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="px-4 py-2 rounded bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Researching…" : "Run Research"}
          </button>
        </form>
        {error && (
          <div className="mt-3 p-2 bg-red-600/20 text-red-200 rounded">{error}</div>
        )}
        {result && (
          <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Results</h2>
            <p className="text-white"><strong>Title:</strong> {result.title || "(none)"}</p>
            <p className="text-white mt-2"><strong>Description:</strong> {result.description || "(none)"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/product-research")({
  component: ProductResearchDashboard,
  meta: {
    title: "Product Research Dashboard – TheNewPRA",
    description: "Enter any product URL to extract its title and description instantly."
  }
});
