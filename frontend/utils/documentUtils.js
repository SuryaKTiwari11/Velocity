// Document utility functions

export const formatFileSize = (bytes) => {
  if (!bytes) return "Unknown";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

export const formatFileType = (type) => {
  const typeMap = {
    resume: "📄 Resume",
    certificate: "🏆 Certificate",
    id_proof: "🆔 ID Proof",
    other: "📋 Other",
  };
  return typeMap[type] || type;
};

export const getStatusColor = (status) => {
  switch (status) {
    case "uploaded":
      return "text-blue-600 bg-blue-50";
    case "processed":
      return "text-green-600 bg-green-50";
    case "error":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case "uploaded":
      return "📤";
    case "processed":
      return "✅";
    case "error":
      return "❌";
    default:
      return "📄";
  }
};

export const docTypes = [
  { value: "resume", label: "📄 Resume/CV" },
  { value: "certificate", label: "🏆 Certificate" },
  { value: "id_proof", label: "🆔 ID Proof" },
  { value: "other", label: "📋 Other" },
];
