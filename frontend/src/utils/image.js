const fallbackImage = "/images/QA.jpg";

export function getRelevantImage(title = "", description = "", department = "") {
  // If department matches an image, use it directly
  if (department) {
    const formattedDept = department.replace(/\s+/g, "");
    const supportedDepts = ["Drainage", "PublicParks", "Roads", "Sanitation", "StreetLights", "WaterSupply"];
    if (supportedDepts.includes(formattedDept)) {
      return `/images/${formattedDept}.jpg`;
    }
  }

  // Fallback to text matching if department image isn't available
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("light") || text.includes("electric") || text.includes("power")) {
    return "/images/StreetLights.jpg";
  }

  if (text.includes("pothole") || text.includes("road") || text.includes("street")) {
    return "/images/Roads.jpg";
  }

  if (text.includes("garbage") || text.includes("waste") || text.includes("sanitation") || text.includes("trash")) {
    return "/images/Sanitation.jpg";
  }

  if (text.includes("water") || text.includes("drain") || text.includes("pipe")) {
    return "/images/Drainage.jpg";
  }

  if (text.includes("park") || text.includes("tree")) {
    return "/images/PublicParks.jpg";
  }

  return fallbackImage;
}

export { fallbackImage };