import re

with open('client/src/App.jsx', 'r') as f:
    content = f.read()

# We want to replace the entire ReportIssue component.
# Let's find its start and end.
start_idx = content.find("const ReportIssue = ({ areas = [], departments = [], currentUser }) => {")
end_idx = content.find("const Login = () => {", start_idx)

if start_idx == -1 or end_idx == -1:
    print("Could not find boundaries")
    exit(1)

# Find the end of the ReportIssue component (the closing brace before Login)
report_issue_end = content.rfind("};\n", start_idx, end_idx) + 3

replacement = """const ReportIssue = ({ areas = [], departments = [], currentUser }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Normal",
    department: "",
    area: "",
    city: currentUser?.city || "",
    block: currentUser?.block || "",
    imageUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const departmentImages = {
    "Roads": "/images/Roads/Roads.jpg",
    "Sanitation": "/images/Sanitation/Sanitation.jpg",
    "Street Lights": "/images/StreetLights/StreetLights.jpg",
    "Water Supply": "/images/WaterSupply/WaterSupply.jpg",
    "Drainage": "/images/Drainage/Drainage.jpg",
    "Public Parks": "/images/PublicParks/PublicParks.jpg"
  };

  const getDepartmentImageUrl = (department, title, description) => {
    if (!department) return "";
    const text = `${title} ${description}`.toLowerCase();
    if (department === "Roads" && text.includes("pothole")) return "/images/Roads/Potholes.jpg";
    return getRelevantImage(title || "", description || "", department, `preview:${department}:${title}:${description}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'city') {
        newData.block = "";
        newData.area = "";
      } else if (name === 'block') {
        newData.area = "";
      }
      
      if (name === 'department' || name === 'title' || name === 'description') {
        const autoImage = getDepartmentImageUrl(newData.department, newData.title, newData.description);
        if (autoImage) {
          newData.imageUrl = autoImage;
        } else if (`${newData.title} ${newData.description}`.toLowerCase().includes("pothole")) {
          newData.imageUrl = "/images/Roads/Potholes.jpg";
        }
      }
      
      return newData;
    });
  };

  const handleNextSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      setLoading(true);
      try {
        await api.createIssue(formData);
        setSubmitted(true);
        window.dispatchEvent(new Event("portal-state-change"));
      } catch (err) {
        alert(err.message || "Failed to report issue");
      } finally {
        setLoading(false);
      }
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-[#00c896] text-white rounded-full flex items-center justify-center mb-8 shadow-lg shadow-[#00c896]/20">
          <span className="material-symbols-outlined text-5xl">check</span>
        </div>
        <h2 className="text-display-lg text-[#161d1a] mb-4">Report Submitted!</h2>
        <p className="text-body-lg text-[#3c4a43] max-w-md mx-auto mb-10 opacity-70">
          Your case has been recorded. Our team will review and assign it to the appropriate department shortly.
        </p>
        <div className="flex gap-4">
          <button onClick={() => { setSubmitted(false); setStep(1); setFormData({...formData, title: "", description: "", imageUrl: ""}); }} className="bg-[#e8f0e9] text-[#006c4f] px-10 py-4 rounded-full font-label-bold hover:bg-[#00c896] hover:text-white transition-all">
            Submit Another
          </button>
          <button onClick={() => navigate('/my-issues')} className="bg-[#006c4f] text-white px-10 py-4 rounded-full font-label-bold hover:shadow-lg transition-all">
            View My Issues
          </button>
        </div>
      </div>
    );
  }

  const locationData = {
    "Bengaluru": { "North Bengaluru": ["Hebbal", "Yelahanka", "RT Nagar", "Sadahalli", "Jakkur"], "South Bengaluru": ["Jayanagar", "JP Nagar", "BTM Layout", "Banashankari", "Hulimavu"], "East Bengaluru": ["Whitefield", "Indiranagar", "Marathahalli", "KR Puram", "Domlur"], "West Bengaluru": ["Rajajinagar", "Vijayanagar", "Malleshwaram", "Magadi Road", "Yeshwanthpur"], "Central Bengaluru": ["MG Road", "Brigade Road", "Shivajinagar", "Cubbon Park", "Ulsoor"] },
    "Mysore": { "North Mysore": ["Hebbal", "Hootagalli", "Bogadi", "Vijayanagar 1st Stage", "Srirampura"], "South Mysore": ["Yadavagiri", "Kuvempunagar", "JP Nagar", "Chamundipuram", "Rajendranagar"], "East Mysore": ["Jayalakshmipuram", "Vidyaranyapuram", "Saraswathipuram", "Ramakrishnanagar", "Lakshmipuram"], "West Mysore": ["Hebbal Industrial Area", "Nanjangud Road", "Bannimantap", "Metagalli", "Ashokapuram"], "Central Mysore": ["Devaraja", "Nazarbad", "Krishnamurthypuram", "Gokulam", "Vontikoppal"] },
    "Mumbai": { "South Mumbai": ["Colaba", "Malabar Hill", "Worli", "Churchgate", "Nariman Point"], "Western Suburbs": ["Andheri", "Bandra", "Borivali", "Goregaon", "Malad", "Kandivali"], "Eastern Suburbs": ["Powai", "Ghatkopar", "Mulund", "Vikhroli", "Kurla", "Chembur"], "Navi Mumbai": ["Vashi", "Nerul", "Belapur", "Kharghar", "Panvel"] },
    "Delhi": { "North Delhi": ["Civil Lines", "Rohini", "Model Town", "Pitampura", "Burari"], "South Delhi": ["Saket", "Hauz Khas", "Greater Kailash", "Vasant Kunj", "Mehrauli"], "East Delhi": ["Laxmi Nagar", "Mayur Vihar", "Preet Vihar", "Vivek Vihar", "Shahdara"], "West Delhi": ["Dwarka", "Janakpuri", "Punjabi Bagh", "Tilak Nagar", "Palam"], "Central Delhi": ["Connaught Place", "Karol Bagh", "Paharganj", "Daryaganj", "Chandni Chowk"] },
    "Hyderabad": { "Secunderabad": ["Trimulgherry", "Marredpally", "Begumpet", "Bowenpally", "Karkhana"], "Cyberabad": ["Gachibowli", "Madhapur", "Kondapur", "Hitech City", "Nanakramguda"], "Old City": ["Charminar", "Falaknuma", "Mehdipatnam", "Malakpet", "Santoshnagar"], "East Hyderabad": ["LB Nagar", "Uppal", "Nacharam", "Hayathnagar", "Vanasthalipuram"] },
    "Chennai": { "North Chennai": ["Tondiarpet", "Perambur", "Kolathur", "Villivakkam", "Sembiam"], "South Chennai": ["Adyar", "Velachery", "Sholinganallur", "Perungudi", "Thoraipakkam"], "Central Chennai": ["T. Nagar", "Nungambakkam", "Anna Nagar", "Kilpauk", "Egmore"], "West Chennai": ["Porur", "Valasaravakkam", "Ramapuram", "Virugambakkam", "Ashok Nagar"] },
    "Pune": { "Central Pune": ["Shivajinagar", "Deccan", "FC Road", "Camp", "Koregaon Park"], "East Pune": ["Viman Nagar", "Kalyani Nagar", "Kharadi", "Hadapsar", "Magarpatta"], "West Pune": ["Baner", "Balewadi", "Aundh", "Wakad", "Pimple Saudagar"], "South Pune": ["Katraj", "Kondhwa", "Bibwewadi", "Sinhagad Road", "Dhayari"] }
  };

  const cities = Object.keys(locationData);
  const blocks = formData.city ? Object.keys(locationData[formData.city] || {}) : [];
  const areasList = (formData.city && formData.block) ? (locationData[formData.city][formData.block] || []) : [];

  return (
    <div className={`grid grid-cols-1 ${step > 1 ? 'lg:grid-cols-12' : ''} gap-8 w-full items-start animate-fade-in-up`}>
      {/* Form Section */}
      <section className={`${step > 1 ? 'lg:col-span-7' : 'max-w-4xl mx-auto w-full'} bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 shadow-premium border border-white/50`}>
        
        {/* Progress Bar */}
        <div className="mb-10 relative px-4">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#eef6ef] -z-10 rounded-full"></div>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#006c4f] -z-10 rounded-full transition-all duration-500" style={{ width: `calc(${((step - 1) / 2) * 100}% - ${step === 1 ? '0px' : step === 3 ? '48px' : '24px'})` }}></div>
          
          <div className="flex justify-between items-center w-full">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  step > s ? 'bg-[#00c896] text-white' : step === s ? 'bg-[#006c4f] text-white ring-4 ring-[#006c4f]/20' : 'bg-[#eef6ef] text-[#bbcac1]'
                }`}>
                  {step > s ? <span className="material-symbols-outlined text-[20px]">check</span> : s}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${
                  step >= s ? 'text-[#161d1a]' : 'text-[#bbcac1]'
                }`}>
                  {s === 1 ? 'Location' : s === 2 ? 'Details' : 'Review'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <span className="text-[#006c4f] font-label-bold text-[12px] uppercase tracking-widest mb-1 block">
            Step {step} of 3
          </span>
          <h1 className="font-display-lg text-[32px] md:text-[40px] text-[#161d1a]">
            {step === 1 ? "Where is the issue?" : step === 2 ? "Provide Issue Details" : "Review & Submit"}
          </h1>
        </div>
        
        <form onSubmit={handleNextSubmit} className="space-y-6">
          
          {/* STEP 1: Location */}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-6 animate-fade-in">
              <div className="space-y-1">
                <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">City</label>
                <div className="relative">
                  <select 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#161d1a] text-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12"
                  >
                    <option value="">Select city</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white opacity-80">expand_more</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Block</label>
                <div className="relative">
                  <select 
                    name="block"
                    value={formData.block}
                    onChange={handleChange}
                    required
                    disabled={!formData.city}
                    className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12 disabled:opacity-50"
                  >
                    <option value="">Select block</option>
                    {blocks.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a]">expand_more</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Area</label>
                <div className="relative">
                  <select 
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    disabled={!formData.block}
                    className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12 disabled:opacity-50"
                  >
                    <option value="">Select area</option>
                    {areasList.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a]">expand_more</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Issue Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Issue Title</label>
                <input 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md placeholder:text-[#bbcac1] transition-all"
                  placeholder="e.g. Major pothole on Sector 4 main road"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Department</label>
                  <div className="relative">
                    <select 
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12"
                    >
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d.id || d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a]">expand_more</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Priority Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { level: 'Normal', icon: 'check_circle', color: '#00c896', bgActive: 'bg-[#00c896]/10', borderActive: 'border-[#00c896]' },
                      { level: 'High', icon: 'warning', color: '#f97316', bgActive: 'bg-[#f97316]/10', borderActive: 'border-[#f97316]' },
                      { level: 'Urgent', icon: 'emergency', color: '#ef4444', bgActive: 'bg-[#ef4444]/10', borderActive: 'border-[#ef4444]' }
                    ].map((p) => {
                      const isSelected = formData.priority === p.level;
                      return (
                        <button
                          key={p.level}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, priority: p.level }))}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                            isSelected 
                              ? `${p.borderActive} ${p.bgActive}` 
                              : `border-transparent bg-[#eef6ef] hover:bg-[#e2eae4]`
                          }`}
                        >
                          <span 
                            className="material-symbols-outlined mb-1" 
                            style={{ color: isSelected ? p.color : '#6c7a72' }}
                          >
                            {p.icon}
                          </span>
                          <span 
                            className={`text-[12px] font-bold ${isSelected ? 'text-[#161d1a]' : 'text-[#6c7a72]'}`}
                          >
                            {p.level}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Description of Problem</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md placeholder:text-[#bbcac1] resize-none transition-all"
                  placeholder="Please provide specific landmarks and severity details..."
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Visual Evidence URL (Optional)</label>
                <div className="relative">
                  <input 
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12"
                    placeholder="https://image-url.com/photo.jpg"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#bbcac1]">link</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#eef6ef] p-6 rounded-2xl border border-outline-variant/30">
                <h3 className="font-label-bold text-[14px] text-[#006c4f] uppercase tracking-widest mb-4 border-b border-[#006c4f]/20 pb-2">Location Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><p className="text-[10px] uppercase font-bold text-[#6c7a72]">City</p><p className="text-[#161d1a] font-bold">{formData.city}</p></div>
                  <div><p className="text-[10px] uppercase font-bold text-[#6c7a72]">Block</p><p className="text-[#161d1a] font-bold">{formData.block}</p></div>
                  <div><p className="text-[10px] uppercase font-bold text-[#6c7a72]">Area</p><p className="text-[#161d1a] font-bold">{formData.area}</p></div>
                </div>
              </div>

              <div className="bg-[#eef6ef] p-6 rounded-2xl border border-outline-variant/30">
                <h3 className="font-label-bold text-[14px] text-[#006c4f] uppercase tracking-widest mb-4 border-b border-[#006c4f]/20 pb-2">Issue Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><p className="text-[10px] uppercase font-bold text-[#6c7a72]">Title</p><p className="text-[#161d1a] font-bold">{formData.title}</p></div>
                  <div><p className="text-[10px] uppercase font-bold text-[#6c7a72]">Department</p><p className="text-[#161d1a] font-bold">{formData.department}</p></div>
                  <div><p className="text-[10px] uppercase font-bold text-[#6c7a72]">Priority</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${
                      formData.priority === 'Urgent' ? 'bg-error/90' : formData.priority === 'High' ? 'bg-orange-500/90' : 'bg-[#00c896]/90'
                    }`}>{formData.priority}</span>
                  </div>
                </div>
                <div><p className="text-[10px] uppercase font-bold text-[#6c7a72]">Description</p><p className="text-[#161d1a] text-sm mt-1">{formData.description}</p></div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-[#bbcac1]/30 flex flex-col sm:flex-row justify-between gap-4">
            {step === 1 ? (
              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="px-8 py-4 rounded-full border border-[#6c7a72] text-[#3c4a43] font-label-bold hover:bg-[#f3fbf5] transition-all w-full sm:w-auto text-center"
              >
                Cancel
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => setStep(s => s - 1)}
                className="px-8 py-4 rounded-full border border-[#6c7a72] text-[#3c4a43] font-label-bold hover:bg-[#f3fbf5] transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back
              </button>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-4 rounded-full bg-[#00c896] text-[#004d38] font-label-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
            >
              {step < 3 ? "Next Step" : loading ? "Submitting..." : "Submit Report"}
              <span className="material-symbols-outlined text-lg">{step < 3 ? 'arrow_forward' : 'send'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Preview Section - Only visible on Step 2 and 3 */}
      {step > 1 && (
        <aside className="lg:col-span-5 flex flex-col gap-8 h-full animate-fade-in">
          <div className="bg-[#e8f0e9]/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 border border-white shadow-premium flex flex-col h-full">
            <div className="mb-6 flex justify-between items-center">
              <span className="text-[#3c4a43] font-label-bold text-[12px] uppercase tracking-widest">Case Preview</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#006c4f]/20"></div>
                <div className="w-2 h-2 rounded-full bg-[#006c4f]"></div>
                <div className="w-2 h-2 rounded-full bg-[#006c4f]/20"></div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col flex-grow">
              <div className="relative h-48 w-full bg-[#eef6ef] flex items-center justify-center overflow-hidden">
                {formData.imageUrl ? (
                  <img className="w-full h-full object-cover" src={formData.imageUrl} alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center text-[#bbcac1]">
                    <span className="material-symbols-outlined text-6xl">image</span>
                    <span className="text-[10px] uppercase font-bold mt-2">No Image Provided</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`backdrop-blur-md text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest ${
                    formData.priority === 'Urgent' ? 'bg-error/90' : formData.priority === 'High' ? 'bg-orange-500/90' : 'bg-[#00c896]/90'
                  }`}>
                    {formData.priority}
                  </span>
                </div>
              </div>
              <div className="p-8 space-y-4 flex-grow flex flex-col">
                <h3 className="font-display-lg text-2xl text-[#161d1a] leading-tight line-clamp-2">
                  {formData.title || "Report title will appear here"}
                </h3>
                <p className="text-[#3c4a43] text-sm leading-relaxed line-clamp-4 opacity-70 flex-grow">
                  {formData.description || "Enter details to see how your report will look to the administration."}
                </p>
                <div className="pt-6 border-t border-[#bbcac1]/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#eef6ef] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-[#006c4f]">location_on</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#6c7a72] uppercase tracking-wider">
                      {formData.city || "Location Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00c896] animate-pulse"></span>
                    <span className="text-[10px] font-bold text-[#00c896] uppercase tracking-wider text-right">Draft</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="mt-8 p-6 bg-white/40 rounded-2xl border border-dashed border-[#bbcac1] flex items-start gap-4">
              <span className="material-symbols-outlined text-[#006c4f] text-2xl">lightbulb</span>
              <p className="text-[13px] text-[#3c4a43] leading-relaxed">
                Adding a clear photo and precise location helps local authorities resolve your issue up to <b className="text-[#006c4f]">40% faster</b>.
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
"""

new_content = content[:start_idx] + replacement + content[report_issue_end:]

with open('client/src/App.jsx', 'w') as f:
    f.write(new_content)
print("Done")
