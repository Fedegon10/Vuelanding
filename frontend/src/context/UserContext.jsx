import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  writeBatch,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  arrayUnion,
  arrayRemove,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setInvitations([]);
        setLoadingProfile(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        if (!firestoreData.email && currentUser.email) {
          updateDoc(userDocRef, { email: currentUser.email });
        }
        setUserProfile({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          ...firestoreData,
        });
      } else {
        const newUserProfile = {
          email: currentUser.email,
          displayName: currentUser.displayName,
          createdAt: Timestamp.now(),
          currentMode: "individual",
          collaborativeSpaceId: null,
        };
        setDoc(userDocRef, newUserProfile);
      }
      setLoadingProfile(false);
    });
    return () => unsubscribeProfile();
  }, [currentUser]);

  useEffect(() => {
    if (!userProfile || !userProfile.email) {
      setInvitations([]);
      return;
    }
    const invitationDocRef = doc(db, "invitations", userProfile.email);
    const unsubscribeInvites = onSnapshot(invitationDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().invites) {
        setInvitations(
          docSnap.data().invites.filter((inv) => inv.status === "pending")
        );
      } else {
        setInvitations([]);
      }
    });
    return () => unsubscribeInvites();
  }, [userProfile]);

  const createUsername = async (username) => {
    if (!currentUser) throw new Error("No estás autenticado.");
    const batch = writeBatch(db);
    const userDocRef = doc(db, "users", currentUser.uid);
    const usernameDocRef = doc(db, "usernames", username);
    const usernameDoc = await getDoc(usernameDocRef);
    if (usernameDoc.exists()) {
      throw new Error("El nombre de usuario ya está en uso.");
    }
    batch.update(userDocRef, { username });
    batch.set(usernameDocRef, { uid: currentUser.uid });
    await batch.commit();
  };

  const switchMode = async (mode) => {
    if (!currentUser) throw new Error("No estás autenticado.");
    const userDocRef = doc(db, "users", currentUser.uid);
    await updateDoc(userDocRef, { currentMode: mode });
  };

  const sendInvitation = async (inviteeIdentifier) => {
    if (!inviteeIdentifier || typeof inviteeIdentifier !== "string") {
      throw new Error("Por favor, ingresa un nombre de usuario válido.");
    }
    if (!userProfile || !userProfile.username) {
      throw new Error("Debes crear un nombre de usuario para invitar.");
    }

    let usernameToFind = inviteeIdentifier.trim();
    if (usernameToFind.startsWith("@")) {
      usernameToFind = usernameToFind.substring(1);
    }
    usernameToFind = usernameToFind.toLowerCase();

    const q = query(
      collection(db, "users"),
      where("username", "==", usernameToFind)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Usuario no encontrado.");
    }

    const inviteeProfile = {
      uid: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    };

    if (!inviteeProfile.email) {
      throw new Error("Este usuario no tiene un email configurado.");
    }
    if (inviteeProfile.uid === currentUser.uid) {
      throw new Error("No puedes invitarte a ti mismo.");
    }
    if (inviteeProfile.collaborativeSpaceId) {
      throw new Error("Este usuario ya está en otro viaje colaborativo.");
    }

    const batch = writeBatch(db);
    let spaceId;

    if (userProfile.collaborativeSpaceId) {
      const existingSpaceRef = doc(
        db,
        "collaborativeSpaces",
        userProfile.collaborativeSpaceId
      );
      const spaceSnap = await getDoc(existingSpaceRef);
      if (spaceSnap.exists() && spaceSnap.data().members.length < 2) {
        spaceId = userProfile.collaborativeSpaceId;
        batch.update(existingSpaceRef, { status: "pending" });
      } else {
        throw new Error("Ya estás en un viaje colaborativo con alguien.");
      }
    } else {
      const newSpaceRef = doc(collection(db, "collaborativeSpaces"));
      spaceId = newSpaceRef.id;
      // === CORRECCIÓN FINAL: Añadir al creador a la lista de miembros ===
      batch.set(newSpaceRef, {
        ownerId: currentUser.uid,
        members: [currentUser.uid], // <-- ESTA LÍNEA ES LA CLAVE
        status: "pending",
        createdAt: Timestamp.now(),
      });
      const inviterRef = doc(db, "users", currentUser.uid);
      batch.update(inviterRef, {
        currentMode: "collaborative",
        collaborativeSpaceId: spaceId,
      });
    }

    const invitationRef = doc(db, "invitations", inviteeProfile.email);
    const newInvitation = {
      fromUid: currentUser.uid,
      fromUsername: userProfile.username,
      spaceId: spaceId,
      status: "pending",
      createdAt: Timestamp.now(),
    };
    batch.set(
      invitationRef,
      { invites: arrayUnion(newInvitation) },
      { merge: true }
    );

    await batch.commit();
  };

  const handleInvitation = useCallback(
    async (invitation, action) => {
      if (!currentUser || !userProfile?.email) return;
      const invitationRef = doc(db, "invitations", userProfile.email);
      const batch = writeBatch(db);

      if (action === "accept") {
        if (userProfile?.collaborativeSpaceId) {
          alert(
            "Ya estás en un viaje. Sal de él para poder aceptar una nueva invitación."
          );
          return;
        }
        const spaceRef = doc(db, "collaborativeSpaces", invitation.spaceId);
        const userRef = doc(db, "users", currentUser.uid);
        batch.update(spaceRef, {
          status: "active",
          members: arrayUnion(currentUser.uid),
        });
        batch.update(userRef, {
          currentMode: "collaborative",
          collaborativeSpaceId: invitation.spaceId,
        });
      }

      batch.update(invitationRef, { invites: arrayRemove(invitation) });
      await batch.commit();
    },
    [currentUser, userProfile]
  );

  const acceptInvitation = (invitation) =>
    handleInvitation(invitation, "accept");
  const declineInvitation = (invitation) =>
    handleInvitation(invitation, "decline");

  // src/context/UserContext.jsx

  // src/context/UserContext.jsx

  const leaveCollaborativeSpace = async () => {
    if (!currentUser || !userProfile?.collaborativeSpaceId) return;

    const spaceId = userProfile.collaborativeSpaceId;

    // --- PASO 1: Arreglar tu perfil (siempre se ejecuta) ---
    // Esta es la operación más importante para "desatascarte".
    const selfRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(selfRef, {
        currentMode: "individual",
        collaborativeSpaceId: null,
      });
      console.log("Perfil de usuario reseteado a modo individual.");
    } catch (error) {
      console.error(
        "Error MUY GRAVE al intentar resetear el perfil del usuario:",
        error
      );
      // Si esto falla, hay un problema mayor, pero no debería.
      return;
    }

    // --- PASO 2: Intentar limpiar el espacio colaborativo (puede fallar sin problema) ---
    // Esto se ejecuta en un bloque try/catch separado.
    const spaceRef = doc(db, "collaborativeSpaces", spaceId);
    try {
      // No necesitamos comprobar si existe. Simplemente intentamos la actualización.
      // Si el documento no existe, updateDoc fallará y el catch lo manejará silenciosamente.
      await updateDoc(spaceRef, { members: arrayRemove(currentUser.uid) });
      console.log("Usuario eliminado de la lista de miembros del espacio.");
    } catch (error) {
      // Este error es esperado si el documento fue borrado. Lo ignoramos de forma segura.
      console.warn(
        "No se pudo actualizar el espacio colaborativo (probablemente ya no existe):",
        error.message
      );
    }
  };

  const value = {
    userProfile,
    loadingProfile,
    createUsername,
    switchMode,
    invitations,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    leaveCollaborativeSpace,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
