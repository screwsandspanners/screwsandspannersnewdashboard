import { useEffect, useState } from "react";
import PromotionCard from "./promotionCard";

export default function PromotionsGrid() {
  const [promotions, setPromotions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const options = {
          method: "GET",
          headers: {
            x_api_key: "a4261bd2-e678-4552-a432-ab16431b6249",
          },
        };

        const response = await fetch(
          "https://subscriptions.sands.com.ng/api/v1/promo/?status=active",
          options,
        );


        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status} - ${response.statusText}`,
          );
        }

        const result = await response.json();
        console.log("Fetched promotions:", result);

        // Just log the data, but also set state if you want to render
        setPromotions(result.data?.docs || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        setError(`Failed to fetch promotions: ${error.message}`);
      }
    };

    fetchPromotions();
  }, []);

  if (error) {
    console.error("Fetch error:", error);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {promotions.map((promo) => (
        <PromotionCard key={promo._id || promo.id} promo={promo} />
      ))}
    </div>
  );
}
