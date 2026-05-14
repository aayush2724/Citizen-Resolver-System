const fallbackImage = "/images/QA.jpg";

const storagePrefix = "crs:image";

const imagePools = {
  Roads: [
    "/images/Roads/Roads.jpg",
    "/images/Roads/Potholes.jpg",
    "/images/Roads/images.jpg",
    "/images/Roads/images (1).jpg",
    "/images/Roads/images (2).jpg",
    "/images/Roads/images (3).jpg",
  ],
  Sanitation: [
    "/images/Sanitation/Sanitation.jpg",
    "/images/Sanitation/download.jpg",
    "/images/Sanitation/essential-lens-garbage-overflowing-garbage-bin-fig4043.jpg",
    "/images/Sanitation/images.jpg",
    "/images/Sanitation/images (1).jpg",
  ],
  "Street Lights": [
    "/images/StreetLights/StreetLights.jpg",
    "/images/StreetLights/637498620644970000.jpg",
    "/images/StreetLights/images (2).jpg",
    "/images/StreetLights/istockphoto-1290085267-612x612.jpg",
    "/images/StreetLights/istockphoto-1510574006-612x612.jpg",
  ],
  "Water Supply": [
    "/images/WaterSupply/WaterSupply.jpg",
    "/images/WaterSupply/images.jpg",
    "/images/WaterSupply/images (1).jpg",
    "/images/WaterSupply/images (2).jpg",
    "/images/WaterSupply/istockphoto-2231516196-612x612.jpg",
  ],
  Drainage: [
    "/images/Drainage/Drainage.jpg",
    "/images/Drainage/images.jpg",
    "/images/Drainage/images (1).jpg",
    "/images/Drainage/images (2).jpg",
    "/images/Drainage/lateral-drainage-system.jpg",
  ],
  "Public Parks": [
    "/images/PublicParks/PublicParks.jpg",
    "/images/PublicParks/images.jpg",
    "/images/PublicParks/images (1).jpg",
    "/images/PublicParks/images (2).jpg",
    "/images/PublicParks/images (3).jpg",
  ],
  default: [fallbackImage]
};

const departmentAliases = {
  roads: "Roads",
  road: "Roads",
  sanitation: "Sanitation",
  streetlights: "Street Lights",
  "street lights": "Street Lights",
  streetlight: "Street Lights",
  "street light": "Street Lights",
  watersupply: "Water Supply",
  "water supply": "Water Supply",
  water: "Water Supply",
  drainage: "Drainage",
  drain: "Drainage",
  publicparks: "Public Parks",
  "public parks": "Public Parks",
  "public park": "Public Parks",
  park: "Public Parks",
  parks: "Public Parks",
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

const normalizeDepartment = (department = "") => {
  const normalized = String(department).trim().toLowerCase().replace(/[_-]+/g, " ");
  if (!normalized) return "";

  const compact = normalized.replace(/\s+/g, "");
  return departmentAliases[normalized] || departmentAliases[compact] || "";
};

const inferDepartmentFromText = (text = "") => {
  if (!text) return "";
  if (text.includes("pothole") || text.includes("road") || text.includes("street")) return "Roads";
  if (text.includes("light") || text.includes("electric") || text.includes("power")) return "Street Lights";
  if (text.includes("garbage") || text.includes("waste") || text.includes("trash")) return "Sanitation";
  if (text.includes("water") || text.includes("pipe")) return "Water Supply";
  if (text.includes("drain") || text.includes("sewage")) return "Drainage";
  if (text.includes("park") || text.includes("tree") || text.includes("garden")) return "Public Parks";
  return "";
};

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
  const resolvedDepartment = normalizeDepartment(department) || inferDepartmentFromText(text);
  const departmentCandidates = uniqueImages(imagePools[resolvedDepartment] || imagePools.default);
  const potholeCandidates =
    resolvedDepartment === "Roads" && text.includes("pothole")
      ? uniqueImages([...customPotholeImages, "/images/Roads/Potholes.jpg"])
      : [];

  const candidates = uniqueImages([...potholeCandidates, ...departmentCandidates, fallbackImage]);

  const issueKey = variant || `${title}|${description}`;
  const useRoundRobin = typeof variant === "string" && variant.startsWith("card:");

  if (useRoundRobin) {
    return chooseRoundRobinImage(department, departmentCandidates.length ? departmentCandidates : candidates, issueKey) || fallbackImage;
  }

  const seed = `${title}|${description}|${department}|${variant}`;
  return candidates[hashString(seed) % candidates.length] || fallbackImage;
}

export { fallbackImage };