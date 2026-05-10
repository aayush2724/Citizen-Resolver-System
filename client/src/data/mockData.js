export const roles = {
  citizen: "citizen",
  admin: "admin",
};

export const locations = [
  {
    city: "Mysore",
    blocks: [
      {
        name: "Vijayanagar",
        areas: ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5", "Stage 6", "Hinkal", "Bogadi"],
      },
      {
        name: "Jayanagar",
        areas: ["East", "West", "North", "South", "Ashokapuram"],
      },
      {
        name: "Kuvempunagar",
        areas: ["M-Block", "N-Block", "K-Block", "Udayagiri"],
      },
      {
        name: "Saraswathipuram",
        areas: ["1st Main", "Fire Brigade", "Swimming Pool Rd", "Kamakshi Hospital Rd"],
      },
      {
        name: "Gokulam",
        areas: ["1st Stage", "2nd Stage", "3rd Stage", "Vani Vilas Mohalla"],
      },
      {
        name: "Hebbal",
        areas: ["Industrial Area", "Surya Bakery", "Lokanayakanagar"],
      }
    ],
  },
  {
    city: "Bangalore",
    blocks: [
      {
        name: "Whitefield",
        areas: ["Phase 1", "Phase 2", "Phase 3", "EPIP Zone", "ITPL"],
      },
      {
        name: "Indiranagar",
        areas: ["100 Feet Road", "12th Main", "6th Main", "Double Road", "CMH Road"],
      },
      {
        name: "Koramangala",
        areas: ["1st Block", "3rd Block", "5th Block", "6th Block", "Sony World Jnc"],
      },
      {
        name: "Jayanagar",
        areas: ["4th Block", "9th Block", "1st Block", "South End Circle"],
      },
      {
        name: "Malleswaram",
        areas: ["8th Cross", "18th Cross", "Margosa Road", "Sampige Road"],
      }
    ],
  },
  {
    city: "Delhi",
    blocks: [
      {
        name: "South Delhi",
        areas: ["Hauz Khas", "Saket", "Vasant Kunj", "Greater Kailash", "Green Park"]
      },
      {
        name: "Central Delhi",
        areas: ["Connaught Place", "Paharganj", "Karol Bagh", "Rajendra Nagar"]
      },
      {
        name: "North Delhi",
        areas: ["Civil Lines", "Model Town", "Mukherjee Nagar", "Kamla Nagar"]
      },
      {
        name: "East Delhi",
        areas: ["Preet Vihar", "Laxmi Nagar", "Mayur Vihar", "Shahdara"]
      },
      {
        name: "West Delhi",
        areas: ["Rajouri Garden", "Punjabi Bagh", "Janakpuri", "Patel Nagar"]
      }
    ]
  },
  {
    city: "Mumbai",
    blocks: [
      {
        name: "Western Suburbs",
        areas: ["Bandra", "Andheri", "Borivali", "Goregaon", "Juhu"]
      },
      {
        name: "South Mumbai",
        areas: ["Colaba", "Malabar Hill", "Nariman Point", "Fort"]
      },
      {
        name: "Eastern Suburbs",
        areas: ["Kurla", "Ghatkopar", "Powai", "Vikhroli"]
      },
      {
        name: "Navi Mumbai",
        areas: ["Vashi", "Nerul", "Belapur", "Kharghar"]
      },
      {
        name: "Thane",
        areas: ["Majiwada", "Ghodbunder Road", "Vartak Nagar", "Kopri"]
      }
    ]
  },
  {
    city: "Chennai",
    blocks: [
      {
        name: "Central Chennai",
        areas: ["T Nagar", "Nungambakkam", "Alwarpet", "Mylapore"]
      },
      {
        name: "South Chennai",
        areas: ["Adyar", "Velachery", "Besant Nagar", "Thiruvanmiyur"]
      },
      {
        name: "North Chennai",
        areas: ["Royapuram", "Tondiarpet", "Perambur", "Washermanpet"]
      },
      {
        name: "East Coast Road",
        areas: ["Palavakkam", "Neelankarai", "Injambakkam", "Akkarai"]
      },
      {
        name: "OMR",
        areas: ["Sholinganallur", "Thoraipakkam", "Perungudi", "Navalur"]
      }
    ]
  },
  {
    city: "Hyderabad",
    blocks: [
      {
        name: "Cyberabad",
        areas: ["HITEC City", "Madhapur", "Gachibowli", "Kondapur"]
      },
      {
        name: "Central Zone",
        areas: ["Banjara Hills", "Jubilee Hills", "Ameerpet", "Punjagutta"]
      },
      {
        name: "Secunderabad",
        areas: ["Begumpet", "Tarnaka", "Marredpally", "Bowenpally"]
      },
      {
        name: "Old City",
        areas: ["Charminar", "Shalibanda", "Falaknuma", "Chandrayangutta"]
      },
      {
        name: "East Zone",
        areas: ["Dilsukhnagar", "LB Nagar", "Uppal", "Ramanthapur"]
      }
    ]
  },
  {
    city: "Kolkata",
    blocks: [
      {
        name: "South Kolkata",
        areas: ["Ballygunge", "Alipore", "Tollygunge", "Gariahat"]
      },
      {
        name: "North Kolkata",
        areas: ["Shyam Bazar", "Bagbazar", "Dum Dum", "Cossipore"]
      },
      {
        name: "Salt Lake",
        areas: ["Sector 1", "Sector 2", "Sector 3", "Sector 5"]
      },
      {
        name: "East Kolkata",
        areas: ["Rajarhat", "New Town", "Phoolbagan", "Kankurgachi"]
      },
      {
        name: "Howrah",
        areas: ["Shibpur", "Bally", "Liluah", "Salkia"]
      }
    ]
  },
  {
    city: "Pune",
    blocks: [
      {
        name: "West Pune",
        areas: ["Kothrud", "Baner", "Aundh", "Hinjewadi"]
      },
      {
        name: "East Pune",
        areas: ["Koregaon Park", "Kalyani Nagar", "Viman Nagar", "Magarpatta"]
      },
      {
        name: "Central Pune",
        areas: ["Shivajinagar", "Camp", "Deccan Gymkhana", "Swargate"]
      },
      {
        name: "South Pune",
        areas: ["Kondhwa", "Wanowrie", "NIBM Road", "Katraj"]
      },
      {
        name: "Pimpri-Chinchwad",
        areas: ["Pimpri", "Chinchwad", "Wakad", "Nigdi"]
      }
    ]
  },
  {
    city: "Ahmedabad",
    blocks: [
      {
        name: "West Zone",
        areas: ["Navrangpura", "Paldi", "Satellite", "Vastrapur"]
      },
      {
        name: "East Zone",
        areas: ["Bapunagar", "Maninagar", "Naroda", "Odhav"]
      },
      {
        name: "New West Zone",
        areas: ["SG Highway", "Bodakdev", "Thaltej", "Makarba"]
      },
      {
        name: "North Zone",
        areas: ["Sabarmati", "Chandkheda", "Motera", "Nava Wadaj"]
      },
      {
        name: "South Zone",
        areas: ["Isanpur", "Vatva", "Ghodasar", "Maninagar South"]
      }
    ]
  }
];

export const areas = [
  { id: 1, name: "Central Ward", zone: "Zone A" },
  { id: 2, name: "Lake Road", zone: "Zone B" },
  { id: 3, name: "Market Street", zone: "Zone C" },
  { id: 4, name: "North Colony", zone: "Zone B" },
  { id: 5, name: "Station Area", zone: "Zone A" },
];

export const departments = [
  { id: 1, name: "Roads", lead: "Priya Menon" },
  { id: 2, name: "Sanitation", lead: "Vikram Rao" },
  { id: 3, name: "Water Supply", lead: "Anita Iyer" },
  { id: 4, name: "Street Lights", lead: "Farhan Khan" },
  { id: 5, name: "Drainage", lead: "Kavita Shah" },
];

export const labour = [
  {
    id: 1,
    name: "Ramesh Kumar",
    department: "Sanitation",
    status: "Available",
  },
  { id: 2, name: "Imran Ali", department: "Street Lights", status: "On Task" },
  { id: 3, name: "Sonal Patil", department: "Roads", status: "Available" },
  { id: 4, name: "Deepak Das", department: "Drainage", status: "On Task" },
  {
    id: 5,
    name: "Maya Singh",
    department: "Water Supply",
    status: "Available",
  },
];

export const users = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav@example.com",
    role: roles.citizen,
    city: "Mysore",
    block: "Vijayanagar",
    area: "Stage 1",
  },
  {
    id: 2,
    name: "Civic Admin",
    email: "admin@helpline.local",
    role: roles.admin,
    city: "Mysore",
    block: "Vijayanagar",
    area: "Stage 1",
  },
];

export const issues = [
  {
    id: "CHP-1001",
    citizenId: 1,
    citizenName: "Aarav Sharma",
    title: "Garbage not collected near lake gate",
    description:
      "Waste has been piled up for three days and is blocking the walking path near the morning market.",
    imageUrl:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80",
    area: "Lake Road",
    department: "Sanitation",
    status: "Assigned",
    priority: "High",
    assignedLabour: "Ramesh Kumar",
    createdAt: "2026-04-07",
    updatedAt: "2026-04-08",
    slaHours: 36,
    note: "Sanitation team assigned for evening pickup.",
  },
  {
    id: "CHP-1002",
    citizenId: 1,
    citizenName: "Aarav Sharma",
    title: "Street light not working outside clinic",
    description:
      "The pole light near shop number 18 has been off after sunset and the turn is difficult to see.",
    imageUrl:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
    area: "Market Street",
    department: "Street Lights",
    status: "In Progress",
    priority: "Normal",
    assignedLabour: "Imran Ali",
    createdAt: "2026-04-06",
    updatedAt: "2026-04-09",
    slaHours: 48,
    note: "Electrician is checking the wiring fault.",
  },
  {
    id: "CHP-1003",
    citizenId: 3,
    citizenName: "Neha Verma",
    title: "Large pothole near school crossing",
    description:
      "Vehicles are slowing suddenly and students cross this road every morning.",
    imageUrl:
      "https://images.unsplash.com/photo-1604357209793-fca5dca89f97?auto=format&fit=crop&w=900&q=80",
    area: "Central Ward",
    department: "Roads",
    status: "Pending",
    priority: "Urgent",
    assignedLabour: "Unassigned",
    createdAt: "2026-04-10",
    updatedAt: "2026-04-10",
    slaHours: 24,
    note: "Waiting for admin review.",
  },
  {
    id: "CHP-1004",
    citizenId: 4,
    citizenName: "Rahul Mehta",
    title: "Blocked drainage line beside bus stop",
    description:
      "Rain water is collecting beside the stop and flowing into nearby shops.",
    imageUrl:
      "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=900&q=80",
    area: "Station Area",
    department: "Drainage",
    status: "Resolved",
    priority: "High",
    assignedLabour: "Deepak Das",
    createdAt: "2026-04-02",
    updatedAt: "2026-04-04",
    slaHours: 72,
    note: "Drain cleared and final inspection completed.",
    feedback: { rating: 4, comment: "Resolved quickly after assignment." },
  },
];

export const notifications = [
  {
    id: 1,
    title: "CHP-1002 moved to In Progress",
    body: "Street Lights team has started repair work.",
    read: false,
    createdAt: "2026-04-09 10:30",
  },
  {
    id: 2,
    title: "CHP-1001 assigned",
    body: "Ramesh Kumar is assigned to the sanitation complaint.",
    read: false,
    createdAt: "2026-04-08 17:15",
  },
  {
    id: 3,
    title: "Feedback received",
    body: "Drainage issue CHP-1004 was rated 4 out of 5.",
    read: true,
    createdAt: "2026-04-04 12:20",
  },
];

export const schemaPreview = [
  "users(id, name, email, password_hash, role, area_id, created_at)",
  "areas(id, name, zone, is_active)",
  "departments(id, name, lead_user_id)",
  "labour(id, name, phone, department_id, availability_status)",
  "issues(id, citizen_id, area_id, department_id, title, description, image_url, status, priority)",
  "issue_assignments(id, issue_id, department_id, labour_id, assigned_by, assigned_at)",
  "feedback(id, issue_id, citizen_id, rating, comment)",
  "notifications(id, user_id, issue_id, title, body, read_at)",
];
