export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case "Applied":
      return "bg-blue-100 text-blue-800";
    case "R1":
      return "bg-yellow-100 text-yellow-800";
    case "R2":
      return "bg-orange-100 text-orange-800";
    case "R3":
      return "bg-purple-100 text-purple-800";
    case "Approved":
      return "bg-green-100 text-green-800";
    case "Reject":
    case "R1 Reject":
    case "R2 Reject":
    case "R3 Reject":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
