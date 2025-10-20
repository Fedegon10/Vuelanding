// utils/nlpParser.js

export function parseCommand(input) {
  const text = input.trim().toLowerCase();

  // === Detección de tipo ===
  const isNote = text.startsWith("nota") || text.includes("recordar");
  const isEvent =
    text.startsWith("evento") ||
    text.includes("agendar") ||
    text.includes("reunión") ||
    text.includes("reserva") ||
    text.includes("comida");

  // === Fecha y hora ===
  const now = new Date();
  let date = now.toISOString().split("T")[0];
  if (text.includes("mañana")) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    date = tomorrow.toISOString().split("T")[0];
  } else if (text.match(/\d{1,2}\/\d{1,2}/)) {
    const [day, month] = text.match(/\d{1,2}\/\d{1,2}/)[0].split("/");
    const year = now.getFullYear();
    date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const timeMatch = text.match(/\b\d{1,2}[:.]\d{2}\b/);
  const startTime = timeMatch ? timeMatch[0].replace(".", ":") : "";

  // === Título / contenido ===
  const title = text
    .replace(/(nota|recordar|evento|agendar|mañana|\d{1,2}\/\d{1,2}|\d{1,2}[:.]\d{2})/gi, "")
    .trim();

  return {
    type: isNote ? "note" : isEvent ? "event" : "unknown",
    title: title || "Nuevo recordatorio",
    date,
    startTime,
  };
}
