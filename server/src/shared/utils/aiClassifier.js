const DEPARTMENT_KEYWORDS = {
  Roads: ["pothole", "road", "street", "highway", "pavement", "crack", "asphalt", "traffic", "road damage", "road repair", "footpath", "sidewalk", "speed breaker", "divider"],
  Sanitation: ["garbage", "trash", "waste", "dumping", "littering", "sanitation", "rubbish", "smell", "odor", "sewage", "dirty", "filth", "open defecation", "solid waste"],
  "Water Supply": ["water", "pipe", "leak", "supply", "drinking", "tap", "shortage", "no water", "contaminated water", "water pipe", "borewell", "tanker"],
  "Street Lights": ["light", "lamp", "street light", "dark", "electricity", "power", "illumination", "bulb", "tube light", "darkness", "no light", "broken light"],
  Drainage: ["drain", "drainage", "blocked drain", "overflow", "waterlogging", "clog", "manhole", "open drain", "choked", "flooding", "stagnant water", "water logging"],
  "Public Parks": ["park", "garden", "tree", "playground", "bench", "grass", "greenery", "vegetation", "footpath in park", "broken bench", "encroachment in park"],
};

const PRIORITY_KEYWORDS = {
  Urgent: ["emergency", "dangerous", "accident", "injury", "urgent", "critical", "severe", "immediately", "fire", "flood", "collapse", "hazard", "life threatening"],
  High: ["serious", "major", "significant", "important", "bad", "terrible", "months", "weeks", "long time", "no response", "recurring"],
};

export function classifyIssue(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();

  let bestDept = null;
  let bestScore = 0;

  for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        score += kw.split(" ").length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestDept = dept;
    }
  }

  let priority = "Normal";
  outer: for (const [p, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        priority = p;
        break outer;
      }
    }
  }

  const confidence = bestScore > 0 ? Math.min(Math.round((bestScore / 3) * 100), 95) : 0;

  return {
    department: bestDept,
    confidence,
    priority,
  };
}
