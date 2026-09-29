// ✅ Utility function to format a given date into "HH:MM" (24-hour format)
export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit", // always show 2 digits for hours (e.g., 09, 17)
    minute: "2-digit", // always show 2 digits for minutes (e.g., 03, 45)
    hour12: false, // use 24-hour format (e.g., 17:30 instead of 5:30 PM)
  });
}

export function formatCallDuration(seconds) {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes) {
  const size = Number(bytes) || 0;
  if (size <= 0) return "Unknown size";

  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1);
  return `${rounded} ${units[unitIndex]}`;
}

export function extractUrls(text) {
  return String(text || "").match(/(?:https?:\/\/[^\s]+|www\.[^\s]+)/gi) || [];
}

export function normalizeUrl(url) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function getFileTypeLabel(file = {}) {
  const mimeType = String(file?.mimeType || "").toLowerCase();
  const extension = String(file?.extension || "").toUpperCase();

  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("word") || extension === "DOC" || extension === "DOCX") {
    return "DOC";
  }
  if (mimeType.includes("sheet") || extension === "XLS" || extension === "XLSX") {
    return "XLS";
  }
  if (mimeType.includes("presentation") || extension === "PPT" || extension === "PPTX") {
    return "PPT";
  }
  if (mimeType.includes("zip") || mimeType.includes("compressed") || extension === "ZIP") {
    return "ZIP";
  }
  if (extension) return extension;

  return "FILE";
}

export function formatDateLabel(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-GB");
}
