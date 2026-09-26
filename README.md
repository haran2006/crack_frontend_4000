# Smart Crack Detection

AI-powered infrastructure inspection frontend — upload images, run crack
detection, review results, with placeholder sections for the upcoming
Digital Twin and Predictive Maintenance modules.

## 1. Project structure

```
app/
  layout.tsx        Fonts, metadata, root shell
  page.tsx           Assembles all sections
  globals.css         Tailwind + glass/blueprint utilities
components/
  Navbar.tsx
  Hero.tsx
  FeatureOverview.tsx
  CrackDetection.tsx      Section orchestrating upload → processing → results
  UploadGuide.tsx         First-visit onboarding modal (localStorage)
  UploadZone.tsx          Drag-and-drop + file previews
  ProcessingState.tsx     Animated scanning/progress state
  DetectionResults.tsx    Run summary bar + result grid + inspection summary
  ResultCard.tsx          Original vs. prediction, stats, compare toggle
  ComparisonSlider.tsx    Draggable before/after slider
  RegionOverlay.tsx       Renders crack bounding boxes over an image
  ImageViewer.tsx         Fullscreen zoom/next/prev viewer
  InspectionSummary.tsx
  DigitalTwin.tsx         Coming-soon section
  PredictiveMaintenance.tsx  Coming-soon section
  Workflow.tsx
  Footer.tsx
lib/
  crackDetection.ts   Detection service abstraction (mock now, real API later)
  utils.ts
types/
  detection.ts        Shared types for results/summary
```

## 2. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. No API key or backend is required — the app
runs in demo mode with realistic mock detections out of the box.

## 3. Deploy to Vercel

1. Push this project to a Git repository.
2. Import it in Vercel (framework preset: **Next.js**, detected automatically).
3. Add the `NEXT_PUBLIC_API_URL` environment variable in the Vercel project
   settings if you're connecting a real inference API (leave it unset to
   keep demo mode in production).
4. Deploy — no build configuration changes are needed.

## 4. Connecting your real crack-detection model

All detection calls go through one function: `detectCracks()` in
`lib/crackDetection.ts`. It already contains the real-API code path — set
`NEXT_PUBLIC_API_URL` and it will `POST` uploaded files to
`${NEXT_PUBLIC_API_URL}/detect` as `multipart/form-data` and expect a JSON
body matching the `DetectionRun` type in `types/detection.ts`. If that
request fails (or the variable isn't set), the app quietly falls back to
mock data instead of breaking the page.

**Important:** your existing Streamlit script runs the YOLO model directly
in a Streamlit process, which Vercel can't host (Vercel only runs
serverless/edge functions and static assets, not a long-running Python
server). To connect your real model:

1. Wrap your existing `model.predict(...)` logic in a small **FastAPI**
   (or Flask) app with a `POST /detect` endpoint that accepts image files
   and returns the JSON shape in `DetectionRun`.
2. Deploy that API somewhere that supports persistent Python processes and,
   ideally, a GPU — e.g. Render, Railway, Fly.io, or a Hugging Face Space.
   (A lightweight CPU model could also run as a Vercel Python serverless
   function, but YOLO segmentation models are usually too large/slow for
   that tier.)
3. Point `NEXT_PUBLIC_API_URL` at that API's base URL.

## 5. Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | Base URL of your inference API. Omit to run fully in demo mode. |

## 6. Assumptions made

- No backend was built — the frontend is fully functional against mock
  data, matching the "demo mode" requirement in the brief.
- `shadcn/ui` was skipped in favor of a small set of hand-built,
  dependency-light components (modal, upload zone, slider) to keep the
  project easy to audit and modify without a component-library build step.
- "Prediction" images reuse the uploaded image with crack regions drawn as
  an overlay (`RegionOverlay.tsx`), rather than a server-rendered annotated
  image — this is what a real API's bounding-box/segmentation response
  would typically drive.
- Confidence, severity, and crack-length values are clearly generated in
  `lib/crackDetection.ts` and are labeled "Demo Mode" in the results model
  name until a real API is connected.
