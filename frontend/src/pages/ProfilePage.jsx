import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import { useUser } from "../context/UserContext";
import CreateUsernameForm from "../components/profile/CreateUsernameForm";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css"; // Crearemos este archivo CSS

function ProfilePage() {
  const { userProfile, loadingProfile, leaveCollaborativeSpace } = useUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  const handleLeaveSpace = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres salir de este viaje colaborativo? Perderás el acceso a sus datos."
      )
    ) {
      try {
        await leaveCollaborativeSpace();
      } catch (error) {
        console.error("Error al salir del espacio:", error);
        alert("Hubo un error al intentar salir del espacio.");
      }
    }
  };

  if (loadingProfile) {
    return <div className="page-container">Cargando perfil...</div>;
  }

  return (
    <div className="page-container profile-page">
      <header className="page-header">
        <h1>Mi Perfil</h1>
      </header>

      <div className="profile-content card">
        <div className="profile-info">
          <p>
            <strong>Email:</strong> {userProfile?.email}
          </p>

          {userProfile?.username ? (
            <p>
              <strong>Usuario:</strong> @{userProfile.username}
            </p>
          ) : (
            <CreateUsernameForm />
          )}
        </div>

        {userProfile?.currentMode === "collaborative" && (
          <div className="collaboration-management">
            <h3>Viaje Colaborativo</h3>
            <p>
              Actualmente estás en un espacio compartido. Puedes salir para
              unirte a otro o volver a tu modo individual.
            </p>
            <button onClick={handleLeaveSpace} className="btn-danger">
              Salir del viaje colaborativo
            </button>
          </div>
        )}

        <button onClick={handleSignOut} className="btn-secondary logout-button">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
