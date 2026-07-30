import { useContext } from "react";
import { PrivacyPreferencesContext } from "./PrivacyPreferencesContext";

export const usePrivacyPreferences = () => {
  const context = useContext(PrivacyPreferencesContext);

  if (!context) {
    throw new Error(
      "usePrivacyPreferences must be used within PrivacyPreferencesProvider",
    );
  }

  return context;
};
