export function calculateRiskScore(density) {
    return Number(Math.min(1, density).toFixed(2));
}

export function getCoordinationLabel(score) {
    if (score > 80) return "Balanced Flow";
    if (score > 60) return "Moderate Load";
    return "System Imbalance";
}

export function sanitize(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[<>]/g, "");
}
