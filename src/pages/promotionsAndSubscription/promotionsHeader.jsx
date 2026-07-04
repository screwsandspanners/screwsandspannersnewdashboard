import { useState } from "react";
import AddPromotionModal from "./addPromotionModal";

export default function PromotionsHeader() {
 const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Promotions</h2>
          <p className="text-sm text-gray-500">
            Manage promotions, subscription plans, and promo codes
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
         

          <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Add Promotion
      </button>
        </div>
      </div>

      {/* Modal */}
      <AddPromotionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(newPromo) => {
          console.log("New promo added:", newPromo);
          // refresh your promotions grid here
        }}
      />
    </>
  );
}
