# UtopiaHire - Next.js

A modern AI-powered career platform built with Next.js, React, and Tailwind CSS.

## Features

- **AI Resume Analysis** - Get detailed feedback on your resume
- **AI Interview Simulation** - Practice interviews with AI-powered simulations
- **Job Matching** - Find jobs that match your skills
- **Career Insights** - Get personalized career recommendations
- **Company Dashboard** - For HR teams to manage job postings and candidates

## Getting Started

### Prerequisites

- Node.js 18+ 
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

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

### Candidate Account
- Email: `candidate@demo.com`
- Password: `password`

### Company Account
- Email: `rh@demo.com`
- Password: `password`

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Candidate dashboard pages
│   ├── company/           # Company dashboard pages
│   └── layout.jsx          # Root layout
├── components/            # Reusable React components
│   ├── layout/            # Layout components
│   ├── ui/               # UI components
│   └── util/             # Utility components
├── context/              # React Context providers
├── layouts/             # Page layouts
├── pages/               # Page components (used by app router)
└── config/              # Configuration files
```

## Tech Stack

- **Next.js 14** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **Radix UI** - UI primitives

## Build

```bash
npm run build
```

## Branches

**main**  
The complete **CCConnect platform**.

**integration**  
Version 0 of the CCConnect platform.

**Reviewer-Rewriter-feature**  
An AI-powered CV reviewer and rewriter.

**interviewer_questioning**  
An AI interviewer that generates and evaluates interview questions.

**job_matcher**  
A job-matching module that matches CVs to job offers and jobs to CVs.

**latex_gen**  
A LaTeX generator that produces PDF reports based on predefined templates.


## License

MIT
