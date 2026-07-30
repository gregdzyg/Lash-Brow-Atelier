import { useMemo, useState } from "react";
import { PrivacyPreferencesContext } from "./PrivacyPreferencesContext";

const PREFERENCES_KEY = "atelier_privacy_preferences_v2";
const ACCEPTED = "accepted";
const REJECTED = "rejected";

const readSavedConsent = () => {
  const savedConsent = localStorage.getItem(PREFERENCES_KEY);

  return savedConsent === ACCEPTED || savedConsent === REJECTED
    ? savedConsent
    : null;
};

const PrivacyPreferencesProvider = ({ children }) => {
  const [externalContentConsent, setExternalContentConsent] =
    useState(readSavedConsent);
  const [areSettingsOpen, setAreSettingsOpen] = useState(false);

  const saveConsent = (consent) => {
    localStorage.setItem(PREFERENCES_KEY, consent);
    setExternalContentConsent(consent);
    setAreSettingsOpen(false);
  };

  const value = useMemo(
    () => ({
      externalContentConsent,
      isExternalContentAllowed: externalContentConsent === ACCEPTED,
      areSettingsOpen,
      acceptExternalContent: () => saveConsent(ACCEPTED),
      rejectExternalContent: () => saveConsent(REJECTED),
      openPrivacySettings: () => setAreSettingsOpen(true),
      closePrivacySettings: () => setAreSettingsOpen(false),
    }),
    [areSettingsOpen, externalContentConsent],
  );

  return (
    <PrivacyPreferencesContext.Provider value={value}>
      {children}
    </PrivacyPreferencesContext.Provider>
  );
};

export default PrivacyPreferencesProvider;
