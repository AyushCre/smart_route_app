/**
 * Format date/time to Indian Standard Time (IST, UTC+5:30)
 * Returns format: "24 Nov 2025 08:30:45 AM"
 */
export function formatIST(date: Date | string | null | undefined, includeTime = true): string {
  if (!date) return "-";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "-";
  
  // Convert to IST (UTC+5:30)
  const istDate = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000) - (dateObj.getTimezoneOffset() * 60 * 1000));
  
  // Format: "24 Nov 2025"
  const day = istDate.getUTCDate().toString().padStart(2, "0");
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
    istDate.getUTCMonth()
  ];
  const year = istDate.getUTCFullYear();
  const dateStr = `${day} ${month} ${year}`;
  
  if (!includeTime) return dateStr;
  
  // Format: "08:30:45 AM"
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes().toString().padStart(2, "0");
  const seconds = istDate.getUTCSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = (hours % 12 || 12).toString().padStart(2, "0");
  const timeStr = `${displayHours}:${minutes}:${seconds} ${ampm}`;
  
  return `${dateStr} ${timeStr}`;
}

/**
 * Format only time to IST
 * Returns format: "08:30:45 AM"
 */
export function formatISTTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "-";
  
  // Convert to IST (UTC+5:30)
  const istDate = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000) - (dateObj.getTimezoneOffset() * 60 * 1000));
  
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes().toString().padStart(2, "0");
  const seconds = istDate.getUTCSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = (hours % 12 || 12).toString().padStart(2, "0");
  
  return `${displayHours}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Format only date to IST
 * Returns format: "24 Nov 2025"
 */
export function formatISTDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "-";
  
  // Convert to IST (UTC+5:30)
  const istDate = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000) - (dateObj.getTimezoneOffset() * 60 * 1000));
  
  const day = istDate.getUTCDate().toString().padStart(2, "0");
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
    istDate.getUTCMonth()
  ];
  const year = istDate.getUTCFullYear();
  
  return `${day} ${month} ${year}`;
}
