import { useState } from "react";
import { OFFER } from "../config/offer";

export function useCheckout() {
  const [showToast, setShowToast] = useState(false);

  const handleBuyClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 9000);
    window.open(OFFER.checkoutUrl, "_blank");
  };

  return {
    showToast,
    handleBuyClick,
  };
}
