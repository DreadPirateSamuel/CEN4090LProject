# CEN4090L Project Error Log and Issue Tracker
**Project:** Automated Sports Betting Service (ASBS)  
**Team Members:** Michael  Collins, Jett Hoffmeir, Samuel Yoder

---

## Repository Note  
Our team initially developed the system in a separate environment and only uploaded the project to this repository on **10/3/25**, which we acknowledge is ridiculously late. Because of this, issues and fixes from **9/15 through 10/2** were not logged in GitHub as they occurred. We did track and resolve problems during development sessions, but they were not formally recorded.  

**From this point forward, all features and bug fixes will be created and tracked in GitHub Issues and linked directly to commits. We once again apologize.**

---

## Overall Issue Summary (9/15 – 10/2)  

### Features Completed  
- Basic React + Vite frontend scaffold with navigation and landing page.  
- Sidebar + top navigation layout with responsive styling.  
- Dashboard, Lines, Hedge Center, and Jobs pages created.  
- Placeholder API routes.  
- Theming and consistent button styling across all pages.  

### Bugs Fixed  
1. Sidebar icons not rendering → fixed import paths.  
2. Tailwind styles not applying → updated `content` config.  
3. Page navigation triggered full reloads → corrected `BrowserRouter` setup.  
4. Dashboard cards overflowed on mobile → added responsive classes.  
5. Lines tab crashed with no data → added empty array fallback.  
6. Toast notifications not dismissing → added cleanup and auto-dismiss.  
7. Sidebar collapsed state not persisting → saved to `localStorage`.  
8. Footer links misaligned on mobile → fixed flexbox settings.  

---

## Current Status  
- Core UI is functional and styled.  
- Routing and placeholder data handling in place.  
- Ready to integrate sportsbook APIs and database layer in the next increment.  

---

## Future Logging Commitment  
As mentioned above, all future features and bugs will be logged as **GitHub Issues in this repository**, with direct commit links for full traceability across Iterations 2 and 3.  
