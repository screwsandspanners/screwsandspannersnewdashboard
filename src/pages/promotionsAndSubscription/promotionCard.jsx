export default function PromotionCard({ promo }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-sm">{promo.name || "Promotion"}</h3>
          <p className="text-xs text-gray-500">{promo.type}</p>
        </div>
        <button className="text-gray-400">⋮</button>
      </div>

      {/* Discount Value */}
      <div className="bg-red-50 text-red-500 rounded-lg py-4 text-center my-4">
        <p className="text-xs">Discount Value</p> 
        <p className="text-xl font-bold">
          {promo.description}{promo.amount}
        </p>
      </div>

      {/* Dates */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>📅 Effective Date: {new Date(promo.effectiveDate).toLocaleDateString()}</p>
      </div>

      {/* Status */}
      <div className="flex gap-2 mt-4">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            promo.status === "active"
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {promo.status}
        </span>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
          All Subscriptions
        </span>
      </div>
    </div>
  );
}
