import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import "./ModeSwitcher.css";

/* --- Íconos SVG --- */
const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const UserIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

/* --- Componente principal --- */
function ModeSwitcher() {
  const { userProfile, switchMode } = useUser();
  const [partnerProfile, setPartnerProfile] = useState(null);

  useEffect(() => {
    const fetchPartnerData = async () => {
      if (userProfile?.collaborativeSpaceId) {
        const spaceRef = doc(
          db,
          "collaborativeSpaces",
          userProfile.collaborativeSpaceId
        );
        const spaceSnap = await getDoc(spaceRef);

        if (spaceSnap.exists()) {
          const data = spaceSnap.data();
          const partnerUid = data.members?.find(
            (uid) => uid !== userProfile.uid
          );

          if (partnerUid) {
            const userRef = doc(db, "users", partnerUid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) setPartnerProfile(userSnap.data());
          } else {
            setPartnerProfile(null);
          }
        }
      } else {
        setPartnerProfile(null);
      }
    };

    fetchPartnerData();
  }, [userProfile]);

  if (!userProfile) return null;

  const currentMode = userProfile.currentMode || "individual";
  const isCollaborative = currentMode === "collaborative";

  return (
    <div className="mode-switcher">
      {/* --- Espacio Personal --- */}
      <div
        className={`mode-option ${!isCollaborative ? "active" : ""}`}
        onClick={() => switchMode("individual")}
      >
        <div className="mode-option-content">
          <UserIcon />
          <div className="mode-option-texts">
            <h4>Espacio Personal</h4>
            <small>{userProfile.username || userProfile.email}</small>
          </div>
        </div>

        <AnimatePresence>
          {!isCollaborative && (
            <motion.div
              className="checkmark"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <CheckIcon />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Viaje Colaborativo --- */}
      {userProfile.collaborativeSpaceId && (
        <div
          className={`mode-option ${isCollaborative ? "active" : ""}`}
          onClick={() => switchMode("collaborative")}
        >
          <div className="mode-option-content">
            <UsersIcon />
            <div className="mode-option-texts">
              <h4>Viaje Colaborativo</h4>
              <small>
                {partnerProfile
                  ? `con @${partnerProfile.username}`
                  : "Solo tú en este viaje"}
              </small>
            </div>
          </div>

          <AnimatePresence>
            {isCollaborative && (
              <motion.div
                className="checkmark"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <CheckIcon />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default ModeSwitcher;
