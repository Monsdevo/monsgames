// Add a capture here, then run npm run build and commit the generated index.html.
// Supply the original PNG plus 1600×900 and 800×450 WebP previews in assets/infamous2-ios.
export const captures = [
  { file: "ios-opening-pier", title: "The first steps. A different machine.", label: "Opening waterfront", alt: "Cole on the waterfront beneath an orange sky, rendered by the experimental iPhone build", featured: true },
  { file: "ios-opening-encounter", title: "The opening encounter", label: "In-engine sequence", alt: "Cole suspended above the pier beside an enormous burning enemy in the iPhone build" },
  { file: "ios-cinematic-effects", title: "Every spark, on device.", label: "Cinematic effects", alt: "Cole channels electricity into an enormous enemy during an in-engine cinematic on iPhone" },
  { file: "ios-gameplay-performance-hud", title: "Inside the experimental build", label: "Gameplay & profiling", alt: "Cole in the first gameplay area with the iPhone performance, memory and thermal overlay visible", featured: true },
];

// Newest first. Add an optional ISO date only when the milestone date is verified.
export const updates = [
  { state: "Testing next", title: "Less work between frames.", body: "A change to reduce redundant legacy RSX state updates has been implemented, checked locally and installed on the phone. The on-device performance comparison is pending." },
  { state: "Integrated · testing continues", title: "Lighting and SSAO move to Metal.", body: "Both Metal paths have been integrated and tested on iPhone. Short, separate comparisons showed improvements over their SPU reference paths; broader visual-equivalence and stability testing continues." },
  { state: "Reached on device", title: "From boot to real gameplay.", body: "The standalone iOS app reaches the first controllable scene on iPhone 15 Pro, with local game data, audio output and physical controller input, including DualSense testing." },
];
