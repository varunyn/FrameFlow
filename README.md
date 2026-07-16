# Frameflow

A local-first photo gallery for turning a folder of images into an immersive, interactive photo wall.

## Features

- Select an entire folder of photos from your device.
- Automatically generate lightweight thumbnails for smooth browsing.
- Preserve full-resolution images for the lightbox view.
- Persist the selected album in IndexedDB so it is available after a page reload.
- Use the selected folder name as the album title.
- Explore photos across a curved, multi-row 3D wall.
- Drag to rotate horizontally and move vertically through the gallery.
- Scroll to navigate, or use the arrow keys for keyboard navigation.
- Select any photo to open it in an animated lightbox.
- Close the lightbox with Escape or by clicking outside the image.
- Support fullscreen viewing, with album controls hidden for an unobstructed presentation.
- Respect the system’s reduced-motion preference.

## Getting started

### Requirements

- Node.js 20+
- pnpm
- A modern browser with folder upload and IndexedDB support

### Install and run

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite, choose a folder of images, and start exploring.

## Controls

| Action                         | Input                                  |
| ------------------------------ | -------------------------------------- |
| Rotate / move through the wall | Drag with the pointer                  |
| Navigate                       | Mouse wheel or trackpad scroll         |
| Rotate horizontally            | Shift + scroll, or horizontal scroll   |
| Navigate with keyboard         | Arrow keys                             |
| Open a photo                   | Click or press Enter on a photo        |
| Close the focused photo        | Escape, close button, or click outside |
| Enter fullscreen               | Full screen button                     |
| Select another album           | Change album button                    |

## Local storage

Photos and their generated thumbnails are stored locally in the browser using IndexedDB. Nothing is uploaded to a server. Selecting a new album replaces the previously stored album; using **Change album** clears the current album and its metadata.

## Development

```bash
pnpm test -- --run
pnpm run build
pnpm run preview
```

The project uses React, TypeScript, Vite, Motion, and Lucide icons.

## AI-assisted development

Frameflow was created with AI-assisted development using:

- OpenAI Codex 5.6
- OpenCode with DeepSeek V4 Flash and Kimi K2.7 Code
