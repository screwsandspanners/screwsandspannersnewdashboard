import { useState } from "react";
import { api_subscription } from "@/api/client_subscription";
import { PROMO_PATH } from "@/constants";
import { AddPromo } from "@/types/api";

interface HeaderProps {
  isOpen: boolean;
  onClose: Function;
  onSuccess: Function
}

export default function AddPromotionModal({isOpen, onClose, onSuccess}:Readonly<HeaderProps>) {
  interface AddPromoType{
    status: string;
    type: string;
    amount: string;
    effectiveDate: string;
    description: string;
  }

  const [formData, setFormData] = useState<AddPromoType>({status:"active", type:"", amount:"", effectiveDate:"", description:""});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string|null>(null);

  if (!isOpen) return null;

  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api_subscription.post<AddPromo>(PROMO_PATH, formData);
      onSuccess(response);
      onClose();
    } catch (err:any) {
      setError(`Failed to add promotion: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Add New Promotion</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <output className="block text-sm font-medium text-gray-700">
              Type
            </output>
            <input
              type="text"
              name="type"
              value={formData?.type}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="e.g. PERCENTAGE"
              required
            />
          </div>

          <div>
            <output className="block text-sm font-medium text-gray-700">
              Amount
            </output>
            <input
              type="text"
              name="amount"
              value={formData?.amount}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="e.g. 10"
              required
            />
          </div>

          <div>
            <output className="block text-sm font-medium text-gray-700">
              Effective Date
            </output>
            <input
              type="date"
              name="effectiveDate"
              value={formData?.effectiveDate}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <output className="block text-sm font-medium text-gray-700">
              Description
            </output>
            <input
              type="text"
              name="description"
              value={formData?.description}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="Short description"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              // onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Add Promotion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
