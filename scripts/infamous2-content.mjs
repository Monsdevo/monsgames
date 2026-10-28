// Add screenshots by section, then npm run build and commit the generated index.html.
// Each file has original PNG + 1600×900 and 800×450 WebP previews in assets/infamous2-ios.
// Titles serve accessible links and the full-size viewer; no visible photo labels.
export const captures = [
  { file: 'ios-opening-pier', section: 'STATUS', title: 'Opening waterfront', alt: 'Cole on the opening waterfront beneath an orange sky' },
  { file: 'ios-opening-encounter', section: 'RUNTIME', title: 'Opening encounter', alt: 'Cole and the Beast during the opening encounter' },
  { file: 'ios-cinematic-effects', section: 'METAL', title: 'Cinematic rendering', alt: 'Electrical effects and the Beast during an in-engine cinematic' },
  { file: 'ios-gameplay-performance-hud', section: 'PERFORMANCE', title: 'Gameplay with performance HUD', alt: 'Cole in the opening gameplay area with FPS, frame-time, CPU, GPU, memory and thermal readings visible' },
];

// Newest first. An optional date must be verified YYYY-MM-DD. Keep titles factual.
export const updates = [
  { state: 'Comparison pending', title: 'RSX state-processing change', body: 'The first change to reduce redundant legacy RSX state updates is implemented, checked locally and installed on iPhone. Its on-device performance comparison is pending.' },
  { state: 'Integrated and tested', title: 'Metal lighting and SSAO', body: 'Both paths are integrated and tested on the phone. Separate short comparisons showed gains against the SPU references; broader visual-equivalence and stability testing remains necessary.' },
  { state: 'Confirmed', title: 'Standalone iOS application and first gameplay', body: 'The game boots and reaches the first controllable scene on iPhone 15 Pro, using local game data, audio output and physical controller input, including DualSense testing.' },
];
