const fallbackImage = "/images/QA.jpg";

const storagePrefix = "crs:image";

const imagePools = {
  Roads: ["/images/Roads/Roads.jpg", "/images/Roads/Potholes.jpg", "/images/Drainage/Drainage.jpg", "/images/QA.jpg"],
  Sanitation: ["/images/Sanitation/Sanitation.jpg", "/images/QA.jpg", "/images/PublicParks/PublicParks.jpg", "/images/WaterSupply/WaterSupply.jpg"],
  "Street Lights": ["/images/StreetLights/StreetLights.jpg", "/images/QA.jpg", "/images/Roads/Roads.jpg", "/images/Drainage/Drainage.jpg"],
  "Water Supply": ["/images/WaterSupply/WaterSupply.jpg", "/images/Drainage/Drainage.jpg", "/images/QA.jpg", "/images/Sanitation/Sanitation.jpg"],
  Drainage: ["/images/Drainage/Drainage.jpg", "/images/Drainage/images.jpg", "/images/Drainage/images (1).jpg", "/images/Drainage/images (2).jpg", "/images/Drainage/lateral-drainage-system.jpg", "/images/QA.jpg"],
  "Public Parks": ["/images/PublicParks/PublicParks.jpg", "/images/QA.jpg", "/images/Sanitation/Sanitation.jpg", "/images/StreetLights/StreetLights.jpg"],
  default: ["/images/QA.jpg", "/images/Roads/Roads.jpg", "/images/Roads/Potholes.jpg", "/images/Sanitation/Sanitation.jpg"]
};

// Additional custom pothole images (place the provided images in client/public/images with these names)
const customPotholeImages = [
  "/images/pothole-1.jpg",
  "/images/pothole-2.jpg",
  "/images/pothole-3.jpg",
  "/images/pothole-4.jpg",
  "/images/pothole-accident.jpg"
];

const uniqueImages = (images = []) => [...new Set(images.filter(Boolean))];

const canUseLocalStorage = () => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

const departmentKey = (department = "default") => department || "default";

const cacheKeyForIssue = (department = "default", issueKey = "") =>
  `${storagePrefix}:cache:${departmentKey(department)}:${issueKey}`;

const pointerKeyForDepartment = (department = "default") =>
  `${storagePrefix}:pointer:${departmentKey(department)}`;

const chooseRoundRobinImage = (department, candidates, issueKey) => {
  if (!candidates.length) return fallbackImage;

  const safeDepartment = departmentKey(department);

  if (!issueKey || !canUseLocalStorage()) {
    return candidates[hashString(`${safeDepartment}|${issueKey}`) % candidates.length];
  }

  const cacheKey = cacheKeyForIssue(safeDepartment, issueKey);
  const cached = window.localStorage.getItem(cacheKey);
  if (cached && candidates.includes(cached)) {
    return cached;
  }

  const pointerKey = pointerKeyForDepartment(safeDepartment);
  const pointer = Number(window.localStorage.getItem(pointerKey) || 0);
  const choice = candidates[pointer % candidates.length];

  window.localStorage.setItem(pointerKey, String((pointer + 1) % candidates.length));
  window.localStorage.setItem(cacheKey, choice);

  return choice;
};

const hashString = (value = "") => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

export function getRelevantImage(title = "", description = "", department = "", variant = "") {
  const text = `${title} ${description}`.toLowerCase();
  const departmentCandidates = uniqueImages(imagePools[department] || imagePools.default);
  const keywordCandidates = uniqueImages([
    ...(text.includes("pothole") ? customPotholeImages : []),
    text.includes("pothole") ? "/images/Roads/Potholes.jpg" : null,
    text.includes("road") || text.includes("street") ? "/images/Roads/Roads.jpg" : null,
    text.includes("light") || text.includes("electric") || text.includes("power") ? "/images/StreetLights/StreetLights.jpg" : null,
    text.includes("garbage") || text.includes("waste") || text.includes("trash") ? "/images/Sanitation/Sanitation.jpg" : null,
    text.includes("water") || text.includes("pipe") ? "/images/WaterSupply/WaterSupply.jpg" : null,
    text.includes("drain") || text.includes("sewage") ? "/images/Drainage/Drainage.jpg" : null,
    text.includes("park") || text.includes("tree") || text.includes("garden") ? "/images/PublicParks/PublicParks.jpg" : null,
  ]);

  const candidates = uniqueImages([
    ...departmentCandidates,
    ...keywordCandidates,
    fallbackImage,
  ]);

  const issueKey = variant || `${title}|${description}`;
  const useRoundRobin = typeof variant === "string" && variant.startsWith("card:");

  if (useRoundRobin) {
    return chooseRoundRobinImage(department, departmentCandidates.length ? departmentCandidates : candidates, issueKey) || fallbackImage;
  }

  const seed = `${title}|${description}|${department}|${variant}`;
  return candidates[hashString(seed) % candidates.length] || fallbackImage;
}

export { fallbackImage };