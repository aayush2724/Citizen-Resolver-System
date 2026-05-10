import React from 'react';

export default function App() {
  return (
    <div className="font-body-md text-on-surface bg-[#F9F7F2] h-screen overflow-hidden">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-gutter py-unit max-w-container-max mx-auto bg-surface-container-low dark:bg-surface-dim rounded-full mt-4 w-[95%] shadow-sm">
        <div className="font-display-lg text-headline-md font-extrabold text-on-surface dark:text-inverse-on-surface">
          Citizen Resolver System
        </div>
        <nav className="hidden md:flex items-center space-x-2">
          <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary px-6 py-2 transition-colors font-label-bold text-label-md" href="#">Home</a>
          <a className="bg-surface-container-highest dark:bg-secondary text-on-surface dark:text-on-secondary rounded-full px-6 py-2 font-bold font-label-bold text-label-md" href="#">Report Issue</a>
          <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary px-6 py-2 transition-colors font-label-bold text-label-md" href="#">My Issues</a>
          <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary px-6 py-2 transition-colors font-label-bold text-label-md" href="#">Public Issues</a>
          <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary px-6 py-2 transition-colors font-label-bold text-label-md" href="#">Report Bug</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high transition-all p-2 rounded-full">notifications</button>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-primary overflow-hidden">
            <img alt="Citizen User Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkJz3HtgGpyIqW6xLnd5T15WV477wsVHiN6-OEhlM-jofpG6d5lHr_SSj45DDEbD2nXsMc7CTe2ABFZ4ZL8KvoFJ3Wd7hUzCBLOlyz1tF2MYmHB7t8zhoNs9PjQ82KtvD9_dANbVo5wgje0nxzGz6L2IEJVMlJ-TKXVI53YdFlSG2VtmU6IYAYr0SOcn7gJ5ZZH-QkKQyw_9cEU_QTqUlxaaKFMZ2GvXxqv7pf6AbBZqyuyQos0aKOHlERWxU62-reHY3AqbBceoc"/>
          </div>
        </div>
      </header>

      {/* Main Content Canvas (Fixed 100vh) */}
      <main className="relative h-screen pt-32 pb-12 px-margin-desktop max-w-container-max mx-auto bento-grid-bg flex items-center justify-center">
        {/* Decorative Background Elements */}
        <div className="absolute top-[20%] -left-20 w-64 h-80 bg-white rounded-lg shadow-xl -rotate-12 z-0 overflow-hidden border-8 border-white">
          <img className="w-full h-full object-cover grayscale opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHIZtu-aKcB1SQ6PWtrUkHzkIdKY7NJVj75rlIF_qM-9qzPAHR99u7REhz3e10163dZ3HuY7gj6y6Buea0Lza7Jd_Df5PfEGmghkaDpVl1EqRpVDhStXlCT3by2nZcxKV52NuV59_FmZUIKSQRroxyodmXhtJ9YO4MvGHNJB9pfsIV97WfbRlhU_N85GkT0CmhpCAiwx-tXKNbRHLizqQSWB95lx4hrsdxSIYJRFS1CLldSc5HnCvirCPKY7hPxG_W3QL7hA95O74"/>
        </div>
        <div className="absolute bottom-[10%] -right-16 w-72 h-56 bg-white rounded-lg shadow-xl rotate-6 z-0 overflow-hidden border-8 border-white">
          <img className="w-full h-full object-cover grayscale opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA85rjydlD00ZZ8FfqEqYrLakMG5AMdQBuwSQ28FdGcpo-e1LT9sznh2yjoM6VgJLS7GeEZo9UC8QnFbPXv4_8AxWu7LN0bwkLJJHM7CBmP1v87p7MwwOmGVYJkN031sdLFOS5dlSE9CWI3QnRxvmUyGBQxqxD9jfer7wCh30QuEKc4lWCgG6WIUPs1UYNd2nZeGNWqx1Shu4D8VvJgM6v6G0P7DeD5kRlGEhFLq25zXnl8q9viewg2RwPcQv2bF7U7ZO0svLd0ozo"/>
        </div>

        <div className="grid grid-cols-12 gap-gutter w-full h-full max-h-[800px] relative z-10">
          {/* Left Column: Multi-step Form */}
          <div className="col-span-7 bg-white rounded-lg shadow-sm p-margin-desktop flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-unit">
                <span className="bg-primary-container text-on-primary-container px-4 py-1 rounded-full font-label-bold text-label-md">Step 2 of 4</span>
                <h1 className="font-display-lg text-headline-lg text-on-surface">Describe the Issue</h1>
              </div>
              <p className="text-on-surface-variant font-body-md mb-gutter">Provide as much detail as possible to help our team resolve the matter efficiently.</p>
              
              <div className="space-y-6 mt-8">
                <div>
                  <label className="block font-label-bold text-label-md text-on-surface mb-2">Issue Title</label>
                  <input className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface" type="text" defaultValue="Pothole on Maple Street" readOnly />
                </div>
                <div>
                  <label className="block font-label-bold text-label-md text-on-surface mb-2">Category</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary-container text-on-primary-container border-2 border-primary transition-all">
                      <span className="material-symbols-outlined">road</span>
                      <span className="font-label-bold text-label-md">Infrastructure</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-all">
                      <span className="material-symbols-outlined">lightbulb</span>
                      <span className="font-label-bold text-label-md">Utilities</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-all">
                      <span className="material-symbols-outlined">nature_people</span>
                      <span className="font-label-bold text-label-md">Environment</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-label-bold text-label-md text-on-surface mb-2">Detailed Description</label>
                  <textarea className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface" placeholder="Describe what happened, where exactly, and any hazards..." rows="4"></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-gutter border-t border-outline-variant">
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-bold transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
              <button className="bg-primary hover:bg-primary-container text-white hover:text-on-primary-container px-10 py-4 rounded-full font-label-bold text-label-md shadow-md transition-all active:scale-95 flex items-center gap-2">
                Continue to Location
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Right Column: Case Preview */}
          <div className="col-span-5 flex flex-col gap-gutter">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
              <div className="h-48 relative">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJaRQtiqytfOOEaRpMxj_OYEVX4ieA1vjyxay23VVUEv7EUtRgmaGyZT7fZNMCYzIwS__7wjvaU9l5J7MdycZL0nlmJviCN35yNp8P1WXp-WHactlTf0ikGjowcKShZV7WpL6PkSE3RgtOJb_9kGAQDX72iQ02zW4gR4Wr_KLhmxHXosfWe4px1VvlhvNp3w6smVUTYv6ZdvNsqhk-uNS9WWG3TIUChLAl9rntHQ_cys5LTsJnehtawoeHY0htlmSVAegYMzl1jhc"/>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span className="font-label-bold text-label-md text-primary uppercase">Draft Preview</span>
                </div>
              </div>

              <div className="p-gutter flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Pothole on Maple Street</h3>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-md mt-1">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      422 Maple St, Downtown
                    </div>
                  </div>
                  <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-bold text-[12px] uppercase">Urgent</span>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="p-4 bg-surface-container-low rounded-lg">
                    <span className="block font-label-bold text-[12px] text-on-surface-variant uppercase mb-1">Impact Summary</span>
                    <p className="text-body-md text-on-surface leading-relaxed">Large pothole obstructing the right lane, causing vehicles to swerve. Potential hazard for cyclists.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-outline-variant rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">engineering</span>
                      <div>
                        <span className="block font-label-bold text-[12px] text-on-surface-variant uppercase">Dept</span>
                        <span className="block font-body-md text-on-surface">Public Works</span>
                      </div>
                    </div>
                    <div className="p-4 border border-outline-variant rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">schedule</span>
                      <div>
                        <span className="block font-label-bold text-[12px] text-on-surface-variant uppercase">Est. Response</span>
                        <span className="block font-body-md text-on-surface">24 Hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-gutter pt-gutter border-t border-outline-variant">
                  <div className="flex justify-between text-label-md font-label-bold mb-2">
                    <span className="text-on-surface-variant">Completion Progress</span>
                    <span className="text-primary">45%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container w-[45%] rounded-full transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Helper Tip Card */}
            <div className="bg-surface-container-low p-6 rounded-lg flex items-start gap-4">
              <div className="bg-white p-2 rounded-full shadow-sm text-primary">
                <span className="material-symbols-outlined">tips_and_updates</span>
              </div>
              <div>
                <h4 className="font-label-bold text-on-surface mb-1">Quick Tip</h4>
                <p className="text-label-md text-on-surface-variant">Adding clear photos from multiple angles helps our teams identify the specific tools needed for repair before they arrive.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low dark:bg-surface-dim border-t border-outline-variant dark:border-outline py-4">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center px-margin-desktop">
          <p className="font-body-md text-body-md text-on-surface-variant">© 2024 Citizen Resolver System. Empowering communities through transparency.</p>
          <div className="flex gap-8">
            <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md" href="#">Terms of Service</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md" href="#">Contact Support</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-body-md" href="#">Admin Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}