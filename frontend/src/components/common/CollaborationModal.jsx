import React, { useState } from "react";
import Modal from "./Modal"; // Ahora la ruta a Modal es más simple: './Modal'
import CollaborationForm from "../home/CollaborationForm";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";

function CollaborationModal({ isOpen, onClose }) {
  const { userProfile, sendInvitation } = useUser();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendInvite = async (inviteeIdentifier) => {
    setError("");
    setLoading(true);
    try {
      await sendInvitation(inviteeIdentifier);
      toast.success("¡Invitación enviada con éxito!");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Ya que tu Modal.jsx es más avanzado, lo adaptamos para usarlo.
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Planifica un viaje con alguien"
    >
      <CollaborationForm
        onSubmit={handleSendInvite}
        error={error}
        userProfile={userProfile}
        isLoading={loading}
      />
    </Modal>
  );
}

export default CollaborationModal;
