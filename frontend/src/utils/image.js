const fallbackImage = "/images/QA.jpg";

export function getRelevantImage(title = "", description = "", department = "") {
  // Direct department mapping
  const departmentMap = {
    "Roads": "/images/Roads.jpg",
    "Sanitation": "/images/Sanitation.jpg",
    "Street Lights": "/images/StreetLights.jpg",
    "Water Supply": "/images/WaterSupply.jpg",
    "Drainage": "/images/Drainage.jpg",
    "Public Parks": "/images/PublicParks.jpg"
  };

  if (department && departmentMap[department]) {
    // If it's a road issue but specifically mentions potholes, use Potholes.jpg
    const text = `${title} ${description}`.toLowerCase();
    if (department === "Roads" && text.includes("pothole")) {
      return "/images/Potholes.jpg";
    }
    return departmentMap[department];
  }

  // Fallback to keyword matching
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("pothole")) return "/images/Potholes.jpg";
  if (text.includes("road") || text.includes("street")) return "/images/Roads.jpg";
  if (text.includes("light") || text.includes("electric") || text.includes("power")) return "/images/StreetLights.jpg";
  if (text.includes("garbage") || text.includes("waste") || text.includes("trash")) return "/images/Sanitation.jpg";
  if (text.includes("water") || text.includes("pipe")) return "/images/WaterSupply.jpg";
  if (text.includes("drain") || text.includes("sewage")) return "/images/Drainage.jpg";
  if (text.includes("park") || text.includes("tree") || text.includes("garden")) return "/images/PublicParks.jpg";

  return fallbackImage;
}

export { fallbackImage };