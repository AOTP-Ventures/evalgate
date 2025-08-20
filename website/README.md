# EvalGate Frontend

A modern, responsive landing page for EvalGate - the deterministic, local-only evaluation tool for GitHub PR checks.

## Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Responsive design** that works on all devices
- **SEO optimized** with proper meta tags

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
```

### Deploying to Vercel

This project is configured to deploy automatically on Vercel. Simply connect your repository to Vercel and it will handle the deployment.

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main landing page
└── ...
```

## Landing Page Sections

The landing page includes the following sections:

1. **Header** - Navigation with logo and CTA button
2. **Hero Section** - Main value proposition and CTAs
3. **Features** - Core evaluation capabilities
4. **Target Audience** - Who EvalGate is built for
5. **How It Works** - 4-step process explanation
6. **Privacy & Security** - Local-only data handling
7. **CTA Section** - Final call-to-action
8. **Footer** - Company information

## Customization

The landing page is built with Tailwind CSS classes and can be easily customized by modifying the component in `src/app/page.tsx`.

## Technologies Used

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)

## License

© 2024 AOTP Ventures. All rights reserved.
