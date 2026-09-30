# Prompt-to-3D Studio

AI-powered text-to-3D web application that converts natural-language prompts into 3D models.

## Overview

Prompt-to-3D Studio uses a two-step generation pipeline:

```text
Text prompt
    ↓
Text-to-image generation
    ↓
Image-to-3D generation
    ↓
GLB model
    ↓
Interactive 3D viewer
```

The application is built with Next.js and React Three Fiber, with GLB as the output format.

## Tech Stack

* Next.js
* TypeScript
* React
* Tailwind CSS
* React Three Fiber
* Three.js
* `@react-three/drei`
* Hugging Face Spaces
* GLB / glTF

## Current Features

* Text-to-image generation
* Image-to-3D generation
* GLB model output
* Interactive 3D viewer
* Orbit rotation
* Zoom
* Pan
* Reset view
* Auto-rotate
* Model loading fallback
* Model loading error boundary

## Architecture

The application follows a client-orchestrated, stateless two-step pipeline.

The provider layer is kept behind an adapter-oriented structure so generation providers can be changed without redesigning the application.

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application is then available through the local development server.

## Status

The initial 3D viewer foundation is implemented and verified.

Current milestone:

* P0.3 — Pipeline verification: complete
* P1.1 — 3D libraries: complete
* P1.2 — Bare 3D viewer: complete
* P1.3 — Orbit controls: complete
* P1.4 — Reset, auto-rotate, and error boundary: complete
