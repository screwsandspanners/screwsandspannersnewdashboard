import { useEffect, useState } from "react";
import SubscriptionCard from "./subscriptionCard";
import SubscriptionHeader from "./subscriptionHeader";
import AddSubscriptionModal from "./addSubscriptionModal";

const SUBSCRIPTION_API_BASE_URL = "/subscription-api";
const SUBSCRIPTION_API_KEY = import.meta.env.VITE_SUBSCRIPTION_SERVICE_X_API_KEY;

const isPlanRecord = (value) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  ("duration" in value || "duration_days" in value || "durationDays" in value) &&
  ("amount" in value || "price" in value);

const normalizePlan = (plan) => ({
  ...plan,
  description: plan.description || plan.name || plan.title || "Subscription",
  duration: plan.duration ?? plan.duration_days ?? plan.durationDays ?? 0,
  amount: plan.amount ?? plan.price ?? 0,
});

const findPlanArray = (value, seen = new Set()) => {
  if (!value || typeof value !== "object" || seen.has(value)) return null;
  seen.add(value);

  if (Array.isArray(value)) {
    if (value.length && value.some(isPlanRecord)) return value.filter(isPlanRecord);
    for (const item of value) {
      const found = findPlanArray(item, seen);
      if (found) return found;
    }
    return null;
  }

  for (const child of Object.values(value)) {
    const found = findPlanArray(child, seen);
    if (found) return found;
  }

  return null;
};

const extractPlans = (result) => {
  const plans = findPlanArray(result);
  if (plans) return plans.map(normalizePlan);

  // Some service responses return a single plan object rather than a list.
  if (isPlanRecord(result?.data)) return [normalizePlan(result.data)];
  if (isPlanRecord(result)) return [normalizePlan(result)];
  return [];
};

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPlans = async () => {
    try {
      const options = {
        method: "GET",
        headers: {
          x_api_key: SUBSCRIPTION_API_KEY,
        },
      };

      const response = await fetch(
        `${SUBSCRIPTION_API_BASE_URL}/subscription/global-subscription-status-by-app`,
        options
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Fetched subscription plans:", result);

      setPlans(extractPlans(result));
      setError(null);
    } catch (err) {
      console.error("Error fetching subscription plans:", err);
      setError(`Failed to fetch subscription plans: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) return <p>Loading subscription plans...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <SubscriptionHeader onAdd={() => setShowModal(true)} />
      {/* <StatusFilter /> */}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <SubscriptionCard
            key={plan.id || plan._id || index}
            title={`${plan.description} Plan`}
            description={`Duration: ${plan.duration} days`}
            price={plan.amount}
            features={[
              `Duration: ${plan.duration} days`,
              `Amount: ₦${plan.amount}`,
            ]}
            subscribers={0} // API doesn’t return subscribers count
          />
        ))}
      </div>

      {plans.length === 0 && (
        <p className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
          No subscription plans were found in the service response. Check the browser console for the returned API data.
        </p>
      )}

      <AddSubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchPlans} // refresh list after adding
      />
    </div>
  );
}
