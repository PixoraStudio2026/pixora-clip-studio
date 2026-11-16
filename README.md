# Pixora Studio — Starter Edition

A responsive, browser-based creator workspace built with:
- HTML for structure
- CSS for visual design and responsive layouts
- JavaScript for interactive tools and local planner storage

## Run locally
Open `index.html` in a modern browser. For development, you can also use a local static server.

## Deploy on Vercel
1. Keep `index.html`, `style.css`, and `script.js` in the repository root.
2. Import the GitHub repository into Vercel.
3. Choose **Other** / no framework preset if asked.
4. Leave the build command empty.
5. Set the output directory to `.` (root), if the interface asks.
6. Deploy.

## Current limitations
This starter uses built-in templates. It does not call an external AI model, connect to YouTube/Instagram/TikTok, publish posts, or process payments. Planner entries are saved in the current browser's local storage.

C++ is intentionally not included in this first version: a normal website does not need C++ for its interface. If a future feature needs intensive processing, a C++ module can be compiled to WebAssembly and connected to the JavaScript app.
