
const statusSteps = ["starting", "movingFile", "updatingDb", "done", "error"];
export default function getPercent(status) {
  const idx = statusSteps.indexOf(status);
  if (idx === -1) return 0;
  if (status === "error") return 0;
  return Math.round(((idx + 1) / (statusSteps.length - 1)) * 100);
}
