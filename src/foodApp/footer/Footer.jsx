import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant/10 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mt-auto overflow-hidden relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">

          {/* Logo & Vision section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-on-primary text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              </div>
              <span className="font-headline text-xl sm:text-2xl font-black tracking-tighter text-on-surface truncate">Eat Well</span>
            </div>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-xs">
              Crafting gourmet experiences with health and taste in perfect harmony. Exceptional quality, delivered to your door.
            </p>
            <div className="flex gap-4">
              {[
                { name: 'facebook', path: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z' },
                { name: 'instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { name: 'twitter', path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' }
              ].map((platform) => (
                <a
                  key={platform.name}
                  href={`#${platform.name}`}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-high border border-outline-variant/10 flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-300 group"
                  aria-label={platform.name}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110"
                  >
                    <path d={platform.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-headline font-bold text-on-surface uppercase tracking-widest text-[10px] sm:text-xs">Explore</h4>
              <ul className="space-y-2 sm:space-y-3 font-body text-xs sm:text-sm text-on-surface-variant">
                <li><a href="#menu" className="hover:text-primary transition-colors">Our Menu</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#careers" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-headline font-bold text-on-surface uppercase tracking-widest text-[10px] sm:text-xs">Legal</h4>
              <ul className="space-y-2 sm:space-y-3 font-body text-xs sm:text-sm text-on-surface-variant">
                <li><a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#cookies" className="hover:text-primary transition-colors">Cookies Settings</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 font-label">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center sm:text-left">
            © {currentYear} NO BAIL & NO OIL. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-surface-container-highest border border-outline-variant/10">
            <span className="text-[10px] sm:text-xs font-bold text-on-surface">Designed by</span>
            <span className="font-headline text-xs sm:text-sm font-black text-primary italic">@AzarIbrahim</span>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/2"></div>
    </footer>
  );
};

export default Footer;
