<div align="center">

# #off-topic

A member directory for GEC Palakkad's tech community.

[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.3-purple?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

</div>

## About

#off-topic is a member directory showcasing students and alumni from GEC Palakkad. It features a beautiful card-based UI with interactive features like shuffling, filtering, and smooth animations.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/off-topic.git
cd off-topic

# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
# Create production build
npm run build
```

The output will be in the `dist` folder.

## Features

- Browse community members in an interactive card grid
- Filter by passout year and department
- Shuffle members with animations
- Responsive design for all devices
- Beautiful hover effects and transitions

## Project Structure

```
src/
├── app/              # Main app components
│   ├── App.tsx       # Root component
│   └── components/   # UI components
├── data/             # Member data (JSON)
├── styles/           # CSS and Tailwind config
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Adding Members

The member data is stored in `data/members.json`. This file is the heart of the application — without it, the directory will be empty.

### Data Schema

Each member object requires the following fields:

| Field         | Type   | Description                             |
| ------------- | ------ | --------------------------------------- |
| `id`          | string | Unique identifier (e.g., "john-doe")    |
| `name`        | string | Full name of the member                 |
| `passoutYear` | number | Year of graduation                      |
| `major`       | string | Department (CSE, IT, ECE, etc.)         |
| `role`        | string | Role (Student, Software Engineer, etc.) |
| `interests`   | string | Comma-separated interests               |
| `color`       | string | Hex color for the card accent           |
| `image`       | string | URL to member's photo                   |
| `bio`         | string | Short biography                         |
| `github`      | string | GitHub username                         |
| `linkedin`    | string | LinkedIn username                       |
| `twitter`     | string | Twitter username (optional)             |

### Example Entry

```json
{
  "id": "john-doe",
  "name": "John Doe",
  "passoutYear": 2026,
  "major": "CSE",
  "role": "Student",
  "interests": "Web Development, AI, Open Source",
  "color": "#FFB6C1",
  "image": "https://example.com/photo.jpg",
  "bio": "Passionate about building cool things on the web.",
  "github": "johndoe",
  "linkedin": "johndoe",
  "twitter": "johndoe"
}
```

### Tips

- Use consistent `passoutYear` values for filtering to work properly
- The `color` field controls the card accent — pick colors that contrast well with white
- For images, you can use any URL (hosted photos, Gravatar, DiceBear, etc.)
- Leave `twitter` as an empty string `""` if the member doesn't have one

## License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by the #off-topic community
