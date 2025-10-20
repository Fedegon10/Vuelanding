import React, { createContext, useState, useEffect, useContext } from "react";
import { db, auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { useUser } from "./UserContext";
import {
  fetchCountries,
  fetchDestinationCoverImage,
  fetchItineraryCoverImage,
} from "../services/apiService";

export const DestinationsContext = createContext();

/* ==========================================================
   🔹 UTILIDADES
   ========================================================== */
const sanitizeData = (data) => {
  if (data instanceof Timestamp) return data.toDate().toISOString();
  if (Array.isArray(data)) return data.map((item) => sanitizeData(item));
  if (data !== null && typeof data === "object") {
    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = sanitizeData(value);
      return acc;
    }, {});
  }
  return data;
};

const removeNulls = (obj) => {
  if (Array.isArray(obj))
    return obj.map(removeNulls).filter((v) => v !== null && v !== undefined);
  if (obj !== null && typeof obj === "object") {
    const cleaned = {};
    for (const key in obj) {
      if (
        Object.prototype.hasOwnProperty.call(obj, key) &&
        obj[key] !== null &&
        obj[key] !== undefined
      ) {
        cleaned[key] = removeNulls(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
};

const sanitizeDestinationCountry = (dest) => {
  let countryName = dest.country;
  let countryCode = dest.countryCode;
  if (typeof dest.country === "object" && dest.country !== null) {
    countryName =
      dest.country.translations?.spa?.common ||
      dest.country.name?.common ||
      dest.country.name ||
      "";
  }
  if (!countryCode && typeof dest.country === "object") {
    countryCode = dest.country.cca2?.toLowerCase() || "";
  }
  return { ...dest, country: countryName, countryCode };
};

/* ==========================================================
   🔹 PROVIDER PRINCIPAL
   ========================================================== */
export const DestinationsProvider = ({ children }) => {
  const [destinations, setDestinations] = useState([]);
  const [personalDocs, setPersonalDocs] = useState([]);
  const [personalNotes, setPersonalNotes] = useState([]);
  const [personalNoteTags, setPersonalNoteTags] = useState([]);
  const [countriesWithFlags, setCountriesWithFlags] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const { userProfile } = useUser();

  /* ======================= AUTH ======================= */
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setDestinations([]);
        setPersonalDocs([]);
        setPersonalNotes([]);
        setPersonalNoteTags([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  /* ======================= SNAPSHOTS ======================= */
  useEffect(() => {
    if (!currentUser || !userProfile) {
      setLoading(false);
      return;
    }

    setDestinations([]);
    setPersonalDocs([]);
    setPersonalNotes([]);
    setPersonalNoteTags([]);
    setLoading(true);

    const currentMode = userProfile.currentMode || "individual";
    const collaborativeSpaceId = userProfile.collaborativeSpaceId || null;

    const basePath =
      currentMode === "collaborative" && collaborativeSpaceId
        ? `collaborativeSpaces/${collaborativeSpaceId}`
        : `users/${currentUser.uid}`;

    if (currentMode === "collaborative" && !collaborativeSpaceId) {
      setLoading(false);
      return;
    }

    console.log(`🎧 Listening to data from: ${basePath}`);

    const unsubDest = onSnapshot(
      collection(db, basePath, "destinations"),
      (snapshot) => {
        const userDests = snapshot.docs.map((doc) =>
          sanitizeDestinationCountry({
            id: doc.id,
            ...sanitizeData(doc.data()),
          })
        );
        setDestinations(userDests);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener destinos:", error);
        setLoading(false);
      }
    );

    const unsubDocs = onSnapshot(
      collection(db, basePath, "personalDocs"),
      (snapshot) => {
        setPersonalDocs(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...sanitizeData(doc.data()),
          }))
        );
      }
    );

    const unsubNotes = onSnapshot(
      collection(db, basePath, "personalNotes"),
      (snapshot) => {
        setPersonalNotes(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...sanitizeData(doc.data()),
          }))
        );
      }
    );

    const unsubTags = onSnapshot(
      collection(db, basePath, "personalNoteTags"),
      (snapshot) => {
        setPersonalNoteTags(snapshot.docs.map((doc) => doc.id));
      }
    );

    return () => {
      unsubDest();
      unsubDocs();
      unsubNotes();
      unsubTags();
    };
  }, [currentUser, userProfile]);

  /* ======================= BASE PATH ======================= */
  const getBasePath = () => {
    const mode = userProfile?.currentMode || "individual";
    const spaceId = userProfile?.collaborativeSpaceId || null;
    if (mode === "collaborative" && spaceId) {
      return `collaborativeSpaces/${spaceId}`;
    }
    return `users/${currentUser.uid}`;
  };

  /* ==========================================================
     🔹 CRUD DESTINOS
     ========================================================== */
  const addDestination = async (formData) => {
    if (!currentUser) return;
    const basePath = getBasePath();
    const {
      country: countryObj,
      city,
      startDate,
      endDate,
      color,
      lat,
      lng,
    } = formData;

    const countryName =
      typeof countryObj === "object"
        ? countryObj.translations?.spa?.common || countryObj.name?.common || ""
        : countryObj;
    const countryCode =
      typeof countryObj === "object"
        ? countryObj.cca2?.toLowerCase() || ""
        : "";

    const newId = Date.now().toString();
    const [destinationImageUrl, itineraryImageUrl] = await Promise.all([
      fetchDestinationCoverImage(city, countryName),
      fetchItineraryCoverImage(city, countryName),
    ]);

    const newDestination = {
      city,
      country: countryName,
      countryCode,
      startDate,
      endDate,
      color,
      lat: lat || null,
      lng: lng || null,
      destinationImageUrl,
      itineraryImageUrl,
      notes: [],
      files: [],
      expenses: [],
      events: [],
    };

    await setDoc(
      doc(db, basePath, "destinations", newId),
      removeNulls(newDestination)
    );
    return newId;
  };

  const updateDestination = async (id, updates) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", id);
    await updateDoc(ref, removeNulls(updates));
  };

  const deleteDestination = async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, getBasePath(), "destinations", id));
  };

  /* ==========================================================
     🔹 GASTOS
     ========================================================== */
  const addExpense = async (destinationId, expenseData) => {
    if (!currentUser) return null;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("El destino no existe.");
    const { expenses = [] } = snap.data();

    const newExpense = {
      ...removeNulls(expenseData),
      id: Date.now().toString(),
    };
    const updatedExpenses = [...expenses, newExpense];
    await updateDoc(ref, { expenses: updatedExpenses });
    return newExpense;
  };

  const updateExpense = async (destinationId, expenseId, updates) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Destino no encontrado");
    const { expenses = [] } = snap.data();

    const updatedExpenses = expenses.map((exp) =>
      String(exp.id) === String(expenseId)
        ? { ...exp, ...removeNulls(updates) }
        : exp
    );
    await updateDoc(ref, { expenses: updatedExpenses });
  };

  const addOrUpdateExpense = async (destinationId, expenseData) => {
    if (expenseData?.id) {
      await updateExpense(destinationId, expenseData.id, expenseData);
      return expenseData;
    }
    return await addExpense(destinationId, expenseData);
  };

  const deleteExpense = async (destinationId, expenseId) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const { expenses = [] } = snap.data();
    const filtered = expenses.filter(
      (ex) => String(ex.id) !== String(expenseId)
    );
    await updateDoc(ref, { expenses: filtered });
  };

  /* ==========================================================
     🔹 ARCHIVOS (por destino)
     ========================================================== */
  const addFile = async (destinationId, fileData) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Destino no encontrado");
    const { files = [] } = snap.data();

    const newFile = { ...fileData, id: Date.now().toString() };
    const updatedFiles = [...files, newFile];
    await updateDoc(ref, { files: updatedFiles });
  };

  const updateFile = async (destinationId, fileId, updates) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const { files = [] } = snap.data();
    const updatedFiles = files.map((f) =>
      String(f.id) === String(fileId) ? { ...f, ...updates } : f
    );
    await updateDoc(ref, { files: updatedFiles });
  };

  const deleteFile = async (destinationId, fileId) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const { files = [] } = snap.data();
    const updatedFiles = files.filter((f) => String(f.id) !== String(fileId));
    await updateDoc(ref, { files: updatedFiles });
  };

  /* ==========================================================
     🔹 EVENTOS
     ========================================================== */
  const addOrUpdateEventWithFile = async (destinationId, eventData) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Destino no encontrado");
    const dest = snap.data();
    const { events = [], files = [] } = dest;

    let updatedEvents;
    let savedEvent;

    if (eventData.id) {
      updatedEvents = events.map((ev) =>
        String(ev.id) === String(eventData.id)
          ? { ...ev, ...removeNulls(eventData) }
          : ev
      );
      savedEvent = eventData;
    } else {
      savedEvent = { ...removeNulls(eventData), id: Date.now().toString() };
      updatedEvents = [...events, savedEvent];
    }

    let updatedFiles = files;
    if (eventData.fileUrl && eventData.fileName) {
      const newFile = {
        id: Date.now().toString(),
        name: eventData.fileName,
        url: eventData.fileUrl,
        eventId: savedEvent.id,
        destinationId,
      };
      updatedFiles = [
        ...files.filter((f) => String(f.eventId) !== String(savedEvent.id)),
        newFile,
      ];
    }

    await updateDoc(ref, { events: updatedEvents, files: updatedFiles });
  };

  const deleteEvent = async (destinationId, eventId) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const dest = snap.data();
    const updatedEvents = (dest.events || []).filter(
      (e) => String(e.id) !== String(eventId)
    );
    const updatedFiles = (dest.files || []).filter(
      (f) => String(f.eventId) !== String(eventId)
    );
    await updateDoc(ref, { events: updatedEvents, files: updatedFiles });
  };

  const toggleEventComplete = async (destinationId, eventId) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const { events = [] } = snap.data();
    const updatedEvents = events.map((ev) =>
      String(ev.id) === String(eventId)
        ? { ...ev, completed: !ev.completed }
        : ev
    );
    await updateDoc(ref, { events: updatedEvents });
  };

  /* ==========================================================
     🔹 NOTAS (por destino)
     ========================================================== */
  const addNote = async (destinationId, noteData) => {
    if (!currentUser) return null;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Destino no encontrado");
    const { notes = [] } = snap.data();

    const newNote = { ...removeNulls(noteData), id: Date.now().toString() };
    const updatedNotes = [...notes, newNote];
    await updateDoc(ref, { notes: updatedNotes });
  };

  const updateNote = async (destinationId, noteId, updates) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const { notes = [] } = snap.data();

    const updatedNotes = notes.map((note) =>
      String(note.id) === String(noteId)
        ? { ...note, ...removeNulls(updates) }
        : note
    );
    await updateDoc(ref, { notes: updatedNotes });
  };

  const deleteNote = async (destinationId, noteId) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const { notes = [] } = snap.data();
    const updatedNotes = notes.filter((n) => String(n.id) !== String(noteId));
    await updateDoc(ref, { notes: updatedNotes });
  };

  const toggleNoteComplete = async (destinationId, noteId) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "destinations", destinationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const { notes = [] } = snap.data();
    const updatedNotes = notes.map((note) =>
      String(note.id) === String(noteId)
        ? { ...note, completed: !note.completed }
        : note
    );
    await updateDoc(ref, { notes: updatedNotes });
  };

  /* ==========================================================
     🔹 NOTAS PERSONALES
     ========================================================== */
  const addPersonalNote = async (noteData) => {
    if (!currentUser) return;
    const id = Date.now().toString();
    await setDoc(
      doc(db, getBasePath(), "personalNotes", id),
      removeNulls({ ...noteData, id, completed: false })
    );
  };

  const updatePersonalNote = async (noteId, updates) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "personalNotes", noteId);
    await updateDoc(ref, removeNulls(updates));
  };

  const deletePersonalNote = async (noteId) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, getBasePath(), "personalNotes", noteId));
  };

  const togglePersonalNoteComplete = async (noteId) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "personalNotes", noteId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const note = snap.data();
      await updateDoc(ref, { completed: !note.completed });
    }
  };

  const addPersonalNoteTag = async (tag) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "personalNoteTags", tag);
    await setDoc(ref, { createdAt: new Date().toISOString() });
  };

  const deletePersonalNoteTag = async (tag) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, getBasePath(), "personalNoteTags", tag));
  };

  /* ==========================================================
     🔹 DOCUMENTOS PERSONALES
     ========================================================== */
  const addPersonalDoc = async (docData) => {
    if (!currentUser) return;
    const id = Date.now().toString();
    await setDoc(
      doc(db, getBasePath(), "personalDocs", id),
      removeNulls({ ...docData, id, createdAt: new Date().toISOString() })
    );
    return id;
  };

  const updatePersonalDoc = async (docId, updates) => {
    if (!currentUser) return;
    const ref = doc(db, getBasePath(), "personalDocs", docId);
    await updateDoc(ref, removeNulls(updates));
  };

  const deletePersonalDoc = async (docId) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, getBasePath(), "personalDocs", docId));
  };

  /* ==========================================================
     🔹 PAISES
     ========================================================== */
  useEffect(() => {
    const loadCountryData = async () => {
      setLoadingCountries(true);
      try {
        const data = await fetchCountries();
        setCountriesWithFlags(data);
      } catch (e) {
        console.error("Error al cargar países:", e);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountryData();
  }, []);

  /* ==========================================================
     🔹 EXPORT CONTEXT
     ========================================================== */
  const value = {
    destinations,
    personalDocs,
    personalNotes,
    personalNoteTags,
    currentUser,
    loading,
    countriesWithFlags,
    loadingCountries,

    // Destinos
    addDestination,
    updateDestination,
    deleteDestination,

    // Gastos
    addExpense,
    updateExpense,
    addOrUpdateExpense,
    deleteExpense,

    // Archivos
    addFile,
    updateFile,
    deleteFile,

    // Eventos
    addOrUpdateEventWithFile,
    deleteEvent,
    toggleEventComplete,

    // Notas (por destino)
    addNote,
    updateNote,
    deleteNote,
    toggleNoteComplete,

    // Notas personales
    addPersonalNote,
    updatePersonalNote,
    deletePersonalNote,
    togglePersonalNoteComplete,
    addPersonalNoteTag,
    deletePersonalNoteTag,

    // Documentos personales
    addPersonalDoc,
    updatePersonalDoc,
    deletePersonalDoc,
  };

  return (
    <DestinationsContext.Provider value={value}>
      {children}
    </DestinationsContext.Provider>
  );
};

export const useDestinations = () => useContext(DestinationsContext);
