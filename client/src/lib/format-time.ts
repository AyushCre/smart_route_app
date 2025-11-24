/**
 * Format date/time to Indian Standard Time (IST, UTC+5:30)
 * Returns format: "24 Nov 2025 08:30:45 AM"
 */
export function formatIST(date: Date | string | null | undefined, includeTime = true): string {
  if (!date) return "-";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "-";
  
  // Convert to IST using Intl API for accurate timezone handling
  const istFormatter = new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  if (!includeTime) {
    const parts = istFormatter.formatToParts(dateObj);
    const date = parts.find((p) => p.type === "day")?.value || "";
    const month = parts.find((p) => p.type === "month")?.value || "";
    const year = parts.find((p) => p.type === "year")?.value || "";
    return `${date} ${month} ${year}`;
  }

  // Format: "24 Nov 2025 08:30:45 AM"
  const formatted = istFormatter.format(dateObj);
  // The format from Intl is: "24/11/2025, 08:30:45 am"
  // We need to convert it to: "24 Nov 2025 08:30:45 AM"
  
  const parts = istFormatter.formatToParts(dateObj);
  const day = parts.find((p) => p.type === "day")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const year = parts.find((p) => p.type === "year")?.value || "";
  const hour = parts.find((p) => p.type === "hour")?.value || "";
  const minute = parts.find((p) => p.type === "minute")?.value || "";
  const second = parts.find((p) => p.type === "second")?.value || "";
  const ampm = parts.find((p) => p.type === "dayPeriod")?.value?.toUpperCase() || "";

  return `${day} ${month} ${year} ${hour}:${minute}:${second} ${ampm}`;
}

/**
 * Format only time to IST
 * Returns format: "08:30:45 AM"
 */
export function formatISTTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "-";
  
  const istFormatter = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const parts = istFormatter.formatToParts(dateObj);
  const hour = parts.find((p) => p.type === "hour")?.value || "";
  const minute = parts.find((p) => p.type === "minute")?.value || "";
  const second = parts.find((p) => p.type === "second")?.value || "";
  const ampm = parts.find((p) => p.type === "dayPeriod")?.value?.toUpperCase() || "";

  return `${hour}:${minute}:${second} ${ampm}`;
}

/**
 * Format only date to IST
 * Returns format: "24 Nov 2025"
 */
export function formatISTDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "-";
  
  const istFormatter = new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const parts = istFormatter.formatToParts(dateObj);
  const day = parts.find((p) => p.type === "day")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const year = parts.find((p) => p.type === "year")?.value || "";

  return `${day} ${month} ${year}`;
}
