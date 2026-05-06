const fallbackImage =
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80";

export function getRelevantImage(title = "", description = "", department = "") {
  const text = `${title} ${description} ${department}`.toLowerCase();

  if (text.includes("light") || text.includes("electric") || text.includes("power")) {
    return "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80";
  }

  if (text.includes("pothole") || text.includes("road") || text.includes("street")) {
    return "https://images.unsplash.com/photo-1604357209793-fca5dca89f97?auto=format&fit=crop&w=900&q=80";
  }

  if (text.includes("garbage") || text.includes("waste") || text.includes("sanitation") || text.includes("trash")) {
    return "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80";
  }

  if (text.includes("water") || text.includes("drain") || text.includes("pipe")) {
    return "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=900&q=80";
  }

  return fallbackImage;
}

export { fallbackImage };