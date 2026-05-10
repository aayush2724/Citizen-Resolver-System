import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { api } from './services/api';
import IssueCard from './components/IssueCard';
import IssueModal from './components/IssueModal';
import { Shield, MapPin, Search, Filter } from 'lucide-react';

// --- Components ---

const Header = ({ currentUser, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-gutter py-unit max-w-container-max mx-auto bg-surface-container-low dark:bg-surface-dim rounded-full mt-4 w-[95%] shadow-sm">
      <div className="font-display-lg text-headline-md font-extrabold text-on-surface dark:text-inverse-on-surface ml-6">
        Citizen Resolver System
      </div>
      <nav className="hidden md:flex items-center space-x-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `px-6 py-2 transition-colors font-label-bold text-label-md rounded-full ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary'}`
          }
        >
          Home
        </NavLink>
        <NavLink 
          to="/report" 
          className={({ isActive }) => 
            `px-6 py-2 transition-colors font-label-bold text-label-md rounded-full ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary'}`
          }
        >
          Report Issue
        </NavLink>
        <NavLink 
          to="/my-issues" 
          className={({ isActive }) => 
            `px-6 py-2 transition-colors font-label-bold text-label-md rounded-full ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary'}`
          }
        >
          My Issues
        </NavLink>
        <NavLink 
          to="/public-issues" 
          className={({ isActive }) => 
            `px-6 py-2 transition-colors font-label-bold text-label-md rounded-full ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary'}`
          }
        >
          Public Issues
        </NavLink>
        <NavLink 
          to="/report-bug" 
          className={({ isActive }) => 
            `px-6 py-2 transition-colors font-label-bold text-label-md rounded-full ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary'}`
          }
        >
          Report Bug
        </NavLink>
      </nav>
      <div className="flex items-center gap-4 mr-6">
        {currentUser && (
          <button 
            onClick={onLogout}
            className="material-symbols-outlined text-on-surface-variant hover:text-error transition-all p-2 rounded-full"
            title="Logout"
          >
            logout
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-primary overflow-hidden flex items-center justify-center">
          {currentUser?.avatar ? (
            <img alt="User Avatar" src={currentUser.avatar} />
          ) : (
            <span className="material-symbols-outlined text-primary">person</span>
          )}
        </div>
      </div>
    </header>
  );
};

const Footer = ({ onLogout }) => (
  <footer className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low dark:bg-surface-dim border-t border-outline-variant dark:border-outline py-4">
    <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center px-margin-desktop">
      <p className="font-body-md text-body-md text-on-surface-variant">© 2024 Citizen Resolver System. Empowering communities through transparency.</p>
      <div className="flex gap-8">
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md" href="#">Privacy Policy</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md" href="#">Terms of Service</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md" href="#">Contact Support</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md" href="/admin">Admin Portal</a>
      </div>
    </div>
  </footer>
);

const Home = ({ issues = [] }) => {
  const stats = {
    total: issues.length,
    resolved: issues.filter(i => i.status === 'Resolved' || i.status === 'Completed').length,
    pending: issues.filter(i => i.status === 'Pending').length,
    urgent: issues.filter(i => i.priority === 'Urgent').length
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (window.innerWidth / 2 - e.pageX) / 50,
        y: (window.innerHeight / 2 - e.pageY) / 50,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getParallaxStyle = (depth) => ({
    transform: `translate3d(${mousePos.x * depth * 12}px, ${mousePos.y * depth * 12}px, 0)`,
    transition: 'transform 0.1s ease-out'
  });

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-160px)] flex flex-col items-center justify-center overflow-hidden bg-[#F9F7F2] font-body-md py-12 md:py-20">
      {/* Parallax Background Layers - Hidden/Simplified on Mobile for Performance/UX */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] md:opacity-[0.12]" style={getParallaxStyle(0.1)}>
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="60" id="hero-grid" patternUnits="userSpaceOnUse" width="60">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#006c4f" strokeWidth="1.5"></path>
              </pattern>
            </defs>
            <rect fill="url(#hero-grid)" height="100%" width="100%"></rect>
          </svg>
        </div>
        
        {/* Decorative Blobs */}
        <div className="absolute top-1/4 left-10 w-32 md:w-40 h-32 md:h-40 rounded-full bg-[#00c896]/15 md:bg-[#00c896]/25 blur-xl" style={getParallaxStyle(0.6)}></div>
        <div className="absolute top-2/3 right-20 w-40 md:w-56 h-40 md:h-56 rounded-full bg-[#00c896]/10 md:bg-[#00c896]/20 blur-2xl" style={getParallaxStyle(0.3)}></div>
        <div className="absolute hidden lg:block top-1/3 right-1/4 w-32 h-32 border-4 border-[#00c896]/30 rounded-full" style={getParallaxStyle(0.8)}></div>

        {/* Tilted Photographic Accents - Spread to edges */}
        <div className="absolute top-[10%] -right-12 md:right-4 lg:right-12 w-48 md:w-80 h-36 md:h-60 rounded-xl overflow-hidden shadow-2xl border-4 border-white/50 rotate-6 opacity-40 md:opacity-80" style={getParallaxStyle(0.4)}>
          <img alt="Urban" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/ADBb0ug1b_le1O_J_vMNkoWJEIq2D5YegOVbio-fqDb9Rba16z3Ptn8ihTIAvKtEF9emCTs_m7h5uR5oOaiQAhD_8CISIB0JOXWgMu84iDdbddmdqipfSOHgx9p-9zTdZ37WMZE2krcgZECM6CfFN0PBKlKf0Gok2JilFdRKHhRqfu5Jq2KN4d3WvK8S28TOwIA4ojzESriHeTmY9C6Vg_zNIz49UdESJEBMnzVa__XjRv347HwmCceGvd5iMZ4"/>
        </div>
        <div className="absolute bottom-[10%] -left-12 md:left-4 lg:left-12 w-40 md:w-72 h-28 md:h-48 rounded-xl overflow-hidden shadow-2xl border-4 border-white/50 -rotate-12 opacity-40 md:opacity-80" style={getParallaxStyle(0.5)}>
          <img alt="City" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNWJKQ5ezgjD9-L54EIS7IMRA0mkM9xb_TThZ1HlUBtRbs7AXEpzbtdtcQTREczSitTIA0SnrGoK1WfqrRgU3N2e7_Qnf6QFAzULEH2SuRVPhypvkqGrQxAcfc_AMaOgmdoJhwGQkk4n9NGFgKKp2sMC8H3sFrGTYFVshV3W1v1NsERhPC5E3qpYrt7fTl9xR9IxnWRccdTXTm-Z1sPrabMKNLSBqG6vn4xUHNmBdE85tH4zpcLiV56UkW8f1W31sjMC3Y8YO2dFc"/>
        </div>
        <div className="absolute hidden xl:block top-[40%] -left-[2%] w-48 h-64 rounded-xl overflow-hidden shadow-2xl border-4 border-white/50 -rotate-3 opacity-60" style={getParallaxStyle(0.2)}>
          <img alt="Garden" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiu-OEPpSTjAZ2YHDYT-gQk9hJfOnycrXrIkaRxliUD80ty1LPtcA2asX4EiGbYe6Ol49akv2hbezVEsY6e3aI_xXeRL9oHkrTJojr6E91z0LG_kTJ2XFvImYSNl-Ud9aKnVoApsw7FJe-Qfib7pqoYS_K5-1Gr5geXvM0h97VjiLtRBCcAfFiELO8pYqYXGYQ7lKVkfi_v_on0W5jCPzudbsJwCQwEeF_y4Ojy6doHhm08J-nn6ortZWDPtr16pBkN9K_NQQWrs4"/>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-5xl overflow-y-auto max-h-full no-scrollbar">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e8f0e9] border border-[#6c7a72]/50 mb-4 md:mb-6 scale-75 md:scale-90">
          <span className="w-2 h-2 rounded-full bg-[#00c896] animate-pulse"></span>
          <span className="font-label-bold text-xs md:text-[14px] uppercase tracking-widest text-[#3c4a43]">Official Civic Platform</span>
        </div>

        <h1 className="font-display-lg text-[40px] md:text-[56px] lg:text-[80px] leading-[1.05] mb-4 md:mb-6 font-extrabold text-[#161d1a] animate-fade-in-up px-4">
          Citizen <span className="text-[#00c896]">Resolver</span> System
        </h1>

        <p className="font-body-lg text-[16px] md:text-[18px] text-[#3c4a43] max-w-2xl mx-auto mb-8 md:mb-10 opacity-80 leading-relaxed px-4">
          Bridging the gap between citizens and administration with unprecedented transparency and efficiency.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-12 w-full px-4">
          <NavLink to="/report" className="w-full sm:w-auto bg-[#00c896] text-[#004d38] font-label-bold text-sm md:text-[14px] px-8 md:px-10 py-4 md:py-5 rounded-full hover:shadow-lg hover:scale-105 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 hover:-translate-y-1">
            REPORT AN ISSUE
            <span className="material-symbols-outlined">arrow_forward</span>
          </NavLink>
          <NavLink to="/public-issues" className="w-full sm:w-auto bg-white text-[#161d1a] font-label-bold text-sm md:text-[14px] px-8 md:px-10 py-4 md:py-5 rounded-full hover:shadow-md border border-[#6c7a72]/30 transition-all active:scale-95 hover:-translate-y-1 hover:bg-[#e2eae4]">
            PUBLIC BOARD
          </NavLink>
        </div>

        {/* Stats Section - Stack on mobile, grid on desktop */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch px-4">
          <div className="bg-white/80 backdrop-blur-sm shadow-sm p-5 md:p-6 rounded-xl flex flex-col justify-center items-center group transition-all hover:shadow-xl border border-white/50 order-2 md:order-1">
            <div className="text-[32px] md:text-[42px] font-display-lg font-extrabold text-[#161d1a] leading-none mb-1">2.4k</div>
            <div className="font-label-bold text-[10px] md:text-[12px] text-[#3c4a43] uppercase tracking-widest">Solved Cases</div>
            <div className="mt-3 w-8 md:w-10 h-1 bg-[#00c896]/20 group-hover:w-16 transition-all duration-500 rounded-full"></div>
          </div>

          <div className="bg-[#00c896] shadow-xl p-6 md:p-8 rounded-xl flex flex-col justify-center items-center group hover:scale-[1.02] transition-all text-[#004d38] order-1 md:order-2">
            <div className="text-[48px] md:text-[64px] font-display-lg font-extrabold leading-none mb-1">{stats.total}</div>
            <div className="font-label-bold text-[10px] md:text-[12px] uppercase tracking-widest">Total Reports</div>
            <div className="mt-4 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-black/20"></span>
              <span className="w-2 h-2 rounded-full bg-black/20"></span>
              <span className="w-2 h-2 rounded-full bg-black/40"></span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-sm p-5 md:p-6 rounded-xl flex flex-col justify-center items-center group transition-all hover:shadow-xl border border-white/50 order-3 md:order-3">
            <div className="text-[32px] md:text-[42px] font-display-lg font-extrabold text-[#161d1a] leading-none mb-1">{stats.total - stats.resolved}</div>
            <div className="font-label-bold text-[10px] md:text-[12px] text-[#3c4a43] uppercase tracking-widest">Active Tasks</div>
            <div className="mt-3 w-8 md:w-10 h-1 bg-[#00c896]/20 group-hover:w-16 transition-all duration-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportIssue = ({ areas, departments, currentUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Normal',
    area: '',
    department: '',
    city: currentUser?.city || '',
    block: currentUser?.block || '',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createIssue(formData);
      alert('Issue reported successfully!');
      navigate('/my-issues');
    } catch (err) {
      alert(err.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-gutter w-full h-full max-h-[800px] relative z-10">
      <div className="col-span-12 lg:col-span-7 bg-white rounded-lg shadow-sm p-8 overflow-y-auto max-h-full scrollbar-hide">
        <div className="flex items-center gap-4 mb-6">
          <span className="bg-primary-container text-on-primary-container px-4 py-1 rounded-full font-label-bold text-label-md">Report</span>
          <h1 className="font-display-lg text-headline-lg text-on-surface">Submit New Issue</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block font-label-bold text-label-sm text-on-surface mb-1">Issue Title</label>
              <input 
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface" 
                placeholder="e.g., Pothole on Maple Street" 
              />
            </div>
            
            <div>
              <label className="block font-label-bold text-label-sm text-on-surface mb-1">Urgency / Priority</label>
              <select 
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block font-label-bold text-label-sm text-on-surface mb-1">Department</label>
              <select 
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface"
              >
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-label-bold text-label-sm text-on-surface mb-1">City</label>
              <input 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface"
                placeholder="City name"
              />
            </div>

            <div>
              <label className="block font-label-bold text-label-sm text-on-surface mb-1">Block / Sector</label>
              <input 
                name="block"
                value={formData.block}
                onChange={handleChange}
                className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface"
                placeholder="Block or Sector"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-label-bold text-label-sm text-on-surface mb-1">Area</label>
              <select 
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface"
              >
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block font-label-bold text-label-sm text-on-surface mb-1">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface"
                placeholder="Describe the issue in detail..."
              ></textarea>
            </div>

            <div className="col-span-2">
              <label className="block font-label-bold text-label-sm text-on-surface mb-1">Image URL (Optional)</label>
              <input 
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-container text-white hover:text-on-primary-container px-10 py-3 rounded-full font-label-bold text-label-md shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Preview Card */}
      <div className="hidden lg:flex col-span-5 flex-col gap-gutter">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full border border-outline-variant/30">
          <div className="h-40 relative bg-surface-container-highest">
            {formData.imageUrl ? (
              <img className="w-full h-full object-cover" src={formData.imageUrl} alt="Preview" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl">image</span>
                <span className="text-label-sm">Image Preview</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="font-label-bold text-label-sm text-primary uppercase">Live Preview</span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <h3 className="font-headline-md text-headline-sm text-on-surface truncate">{formData.title || 'Issue Title'}</h3>
            <div className="flex items-center gap-2 text-on-surface-variant font-label-sm mt-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {formData.area ? `${formData.area}, ${formData.block}, ${formData.city}` : 'Select an area...'}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full font-label-bold text-[10px] uppercase ${
                formData.priority === 'Urgent' ? 'bg-error-container text-on-error-container' : 
                formData.priority === 'High' ? 'bg-warning-container text-on-warning-container' : 
                'bg-primary-container text-on-primary-container'
              }`}>
                {formData.priority}
              </span>
              {formData.department && (
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-bold text-[10px] uppercase">
                  {formData.department}
                </span>
              )}
            </div>

            <div className="mt-4 p-4 bg-surface-container-low rounded-lg flex-1">
              <span className="block font-label-bold text-[10px] text-on-surface-variant uppercase mb-1">Description</span>
              <p className="text-body-sm text-on-surface line-clamp-4">
                {formData.description || 'Provide a description to see it here...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.login({ email, password, role: 'citizen' });
      // The portal-state-change event will trigger a refetch in App
    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 mt-12">
      <h2 className="text-headline-md font-display-lg text-on-surface mb-6 text-center">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-label-bold text-label-sm text-on-surface mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block font-label-bold text-label-sm text-on-surface mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface"
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-container text-white hover:text-on-primary-container py-3 rounded-full font-label-bold text-label-md shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [portalState, setPortalState] = useState({
    issues: [],
    areas: [],
    departments: [],
    labour: [],
    notifications: [],
    currentUser: null,
    loading: true,
    error: null
  });

  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const data = await api.getState();
        setPortalState({ ...data, loading: false, error: null });
      } catch (err) {
        setPortalState(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };

    fetchState();
    window.addEventListener("portal-state-change", fetchState);
    return () => window.removeEventListener("portal-state-change", fetchState);
  }, []);

  if (portalState.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary font-label-bold animate-pulse">Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (portalState.error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9F7F2] p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium p-10 text-center border border-error/10">
          <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">cloud_off</span>
          </div>
          <h2 className="text-headline-md font-display-lg text-on-surface mb-2">Connection Failed</h2>
          <p className="text-on-surface-variant mb-8 font-body-md">We couldn't connect to the civic infrastructure network. Please check your internet or try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-white py-4 rounded-full font-label-bold shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("citizen-user");
    window.dispatchEvent(new Event("portal-state-change"));
  };

  return (
    <Router>
      <div className="font-body-md text-on-surface bg-[#F9F7F2] min-h-screen flex flex-col">
        <Header currentUser={portalState.currentUser} onLogout={handleLogout} />

        <main className="relative flex-1 pt-24 md:pt-32 pb-24 w-full overflow-x-hidden">
          {/* Decorative Background Elements */}
          <div className="fixed top-[20%] -left-20 w-64 h-80 bg-white rounded-lg shadow-xl -rotate-12 -z-10 overflow-hidden border-8 border-white opacity-20 pointer-events-none">
            <img className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHIZtu-aKcB1SQ6PWtrUkHzkIdKY7NJVj75rlIF_qM-9qzPAHR99u7REhz3e10163dZ3HuY7gj6y6Buea0Lza7Jd_Df5PfEGmghkaDpVl1EqRpVDhStXlCT3by2nZcxKV52NuV59_FmZUIKSQRroxyodmXhtJ9YO4MvGHNJB9pfsIV97WfbRlhU_N85GkT0CmhpCAiwx-tXKNbRHLizqQSWB95lx4hrsdxSIYJRFS1CLldSc5HnCvirCPKY7hPxG_W3QL7hA95O74"/>
          </div>
          <div className="fixed bottom-[10%] -right-16 w-72 h-56 bg-white rounded-lg shadow-xl rotate-6 -z-10 overflow-hidden border-8 border-white opacity-20 pointer-events-none">
            <img className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA85rjydlD00ZZ8FfqEqYrLakMG5AMdQBuwSQ28FdGcpo-e1LT9sznh2yjoM6VgJLS7GeEZo9UC8QnFbPXv4_8AxWu7LN0bwkLJJHM7CBmP1v87p7MwwOmGVYJkN031sdLFOS5dlSE9CWI3QnRxvmUyGBQxqxD9jfer7wCh30QuEKc4lWCgG6WIUPs1UYNd2nZeGNWqx1Shu4D8VvJgM6v6G0P7DeD5kRlGEhFLq25zXnl8q9viewg2RwPcQv2bF7U7ZO0svLd0ozo"/>
          </div>

          {!portalState.currentUser ? (
            <div className="max-w-container-max mx-auto px-margin-desktop">
              <Login />
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home issues={portalState.issues} />} />
              <Route 
                path="/report" 
                element={
                  <div className="max-w-container-max mx-auto px-margin-desktop">
                    <ReportIssue 
                      areas={portalState.areas} 
                      departments={portalState.departments} 
                      currentUser={portalState.currentUser} 
                    />
                  </div>
                } 
              />
              <Route 
                path="/my-issues" 
                element={
                  <div className="max-w-container-max mx-auto px-margin-desktop">
                    <MyIssues 
                      issues={portalState.issues} 
                      currentUser={portalState.currentUser} 
                      onOpenIssue={setSelectedIssue}
                    />
                  </div>
                } 
              />
              <Route 
                path="/public-issues" 
                element={
                  <div className="max-w-container-max mx-auto px-margin-desktop">
                    <PublicIssues 
                      issues={portalState.issues} 
                      onOpenIssue={setSelectedIssue}
                    />
                  </div>
                } 
              />
              <Route path="/report-bug" element={
                <div className="max-w-container-max mx-auto px-margin-desktop">
                  <ReportBug />
                </div>
              } />
            </Routes>
          )}
        </main>

        <Footer onLogout={handleLogout} />

        <IssueModal 
          issue={selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
        />
      </div>
    </Router>
  );
}



const PublicIssues = ({ issues, onOpenIssue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredIssues = issues.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h2 className="text-headline-lg font-display-lg text-on-surface tracking-tighter">Public Issues</h2>
          <p className="text-body-md text-on-surface-variant">Browse issues reported by the community in your area.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input 
            type="text" 
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-outline-variant/30 rounded-full py-3 pl-12 pr-6 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {filteredIssues.length > 0 ? (
          filteredIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onOpen={onOpenIssue} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-outline-variant/20">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-on-surface-variant" size={32} />
            </div>
            <h3 className="text-headline-sm font-display-lg text-on-surface">No issues found</h3>
            <p className="text-body-md text-on-surface-variant">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MyIssues = ({ issues, currentUser, onOpenIssue }) => {
  const myIssues = issues.filter(i => i.citizenId === currentUser.id);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-headline-lg font-display-lg text-on-surface tracking-tighter">My Reported Issues</h2>
        <p className="text-body-md text-on-surface-variant">Track the progress of issues you've submitted.</p>
      </div>

      {myIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {myIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onOpen={onOpenIssue} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-outline-variant/20">
          <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-on-surface-variant" size={32} />
          </div>
          <h3 className="text-headline-sm font-display-lg text-on-surface">No reports yet</h3>
          <p className="text-body-md text-on-surface-variant mb-8">You haven't submitted any issues yet.</p>
          <NavLink to="/report" className="bg-primary text-white px-10 py-4 rounded-full font-label-bold shadow-lg hover:shadow-xl transition-all">
            Submit Your First Report
          </NavLink>
        </div>
      )}
    </div>
  );
};

const ReportBug = () => {
  const [formData, setFormData] = useState({ subject: '', category: 'ui', description: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.submitBugReport(formData);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || "Failed to submit bug report");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-12 text-center shadow-premium border border-outline-variant/20">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="text-primary" size={40} />
        </div>
        <h2 className="text-headline-md font-display-lg text-on-surface mb-4">Report Received!</h2>
        <p className="text-body-lg text-on-surface-variant mb-10">Thank you for helping us improve. Our technical team will review your report shortly.</p>
        <button onClick={() => setSubmitted(false)} className="bg-primary text-white px-12 py-4 rounded-full font-label-bold">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-premium border border-outline-variant/20 overflow-hidden">
      <div className="bg-primary p-10 text-white">
        <h2 className="text-headline-md font-display-lg tracking-tight">Report a System Bug</h2>
        <p className="opacity-80 font-body-md">Encountered a technical issue? Let us know and we'll squash it.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-10 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block font-label-bold text-label-sm text-on-surface mb-2">Subject</label>
            <input 
              required
              className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-body-md"
              placeholder="Brief summary of the issue"
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface mb-2">Category</label>
            <select 
              className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-body-md"
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="ui">User Interface</option>
              <option value="bug">Functional Bug</option>
              <option value="performance">Performance</option>
              <option value="feature">Feature Request</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block font-label-bold text-label-sm text-on-surface mb-2">Details</label>
            <textarea 
              required
              rows="5"
              className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-body-md"
              placeholder="Step by step instructions to reproduce the issue..."
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
        </div>
        <button type="submit" className="w-full bg-primary text-white py-5 rounded-full font-label-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all">
          Submit Bug Report
        </button>
      </form>
    </div>
  );
};