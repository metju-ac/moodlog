# MoodLog

A simple and intuitive **mobile-first** mood tracking app designed to help you understand your emotional patterns and improve your well-being.

**🌐 Deployed at:** [https://metju-ac.github.io/moodlog](https://metju-ac.github.io/moodlog)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/metju-ac/moodlog
cd moodlog

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📱 Features

MoodLog provides three core functionalities:

### 1. Quick Entries

Capture your mood in seconds throughout the day:

- Describe what happened with a brief title
- Rate your mood on a scale from -10 (negative) to +10 (positive)
- Add context labels (School, Work, Free time, Sport, etc.)
- Include optional notes for additional thoughts

### 2. Daily Reflections

End each day with a comprehensive reflection:

- Rate sleep quality, physical activity, social interactions, and stress levels
- Add notes about your day
- View mood entries for that day in a graph
- Track lifestyle factors that affect your mood

### 3. Insights

Visualize your mood patterns over time:

- Interactive charts showing average mood trends
- Filter by time range (week, month, 3 months, year)
- Filter by context labels
- Identify patterns between activities and emotional state

### Additional Features

- **Custom Labels**: Create, edit, and delete your own context labels
- **Date Navigation**: Browse entries by date with an intuitive date picker
- **View/Edit Mode**: View entries in read-only mode, switch to edit when needed
- **Toast Notifications**: User feedback for all CRUD operations
- **About Page**: In-app help explaining how to use the app

## 🗂️ Data Model

The application uses the following data structures:

```typescript
// Mood Entry - Quick logs recorded throughout the day
interface MoodEntry {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  moodLevel: number; // -10 to +10
  date: Date;
}

// Reflection - Daily summary with lifestyle metrics
interface Reflection {
  id: string;
  date: Date;
  sleepQuality: number; // -10 to +10
  physicalActivity: number; // -10 to +10
  socialInteractions: number; // -10 to +10
  stress: number; // -10 to +10
  notes: string;
}

// Label - Context tags for categorizing entries
interface Label {
  id: string;
  name: string;
  icon: string;
}
```

## 🧪 Test Data

The application comes pre-seeded with **3 months of mock data**:

- **Mood Entries**: 3-7 random entries per day with varied times, titles, descriptions, mood levels, and labels
- **Reflections**: Sample reflections for every other day starting yesterday
- **Labels**: 4 default labels (School, Work, Free time, Sport)

Data is stored **client-side only** using Svelte 5 reactive stores. All data persists only during the browser session - refreshing the page resets to the seeded data.

## ✅ Implementation Status

### Currently Working (Core Workflows)

| Feature                 | Status      | Description                                                    |
| ----------------------- | ----------- | -------------------------------------------------------------- |
| Create Quick Entry      | ✅ Complete | Add new mood entries with title, mood level, labels, and notes |
| View/Edit Quick Entry   | ✅ Complete | View entries in read-only mode, edit when needed               |
| Delete Quick Entry      | ✅ Complete | Remove entries with confirmation dialog                        |
| Create Daily Reflection | ✅ Complete | Two-step wizard: sliders → notes → save                        |
| View/Edit Reflection    | ✅ Complete | View and modify existing reflections                           |
| Delete Reflection       | ✅ Complete | Remove reflections with confirmation                           |
| View Insights           | ✅ Complete | Charts showing different metrics with filtering filtering      |
| Manage Labels           | ✅ Complete | Create, edit, delete custom context labels                     |
| Date Navigation         | ✅ Complete | Navigate between days, date picker                             |
| Toast Notifications     | ✅ Complete | User feedback for all actions                                  |

### Out of Scope (Not Planned)

| Feature             | Reason                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| User Authentication | Out of scope - would require backend infrastructure                                             |
| Data Persistence    | Out of scope - would require backend/database                                                   |
| Social Features     | Deprioritized based on user research - users expressed privacy concerns about sharing mood data |

## 🏗️ Architecture

### Tech Stack

- **Framework**: SvelteKit with Svelte 5 (using runes: `$state`, `$derived`, `$effect`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Component Library**: shadcn
- **Charts**: LayerChart with D3 scales and shadcn
- **Icons**: Lucide Svelte

### Project Structure

```
src/
├── lib/
│   ├── components/      # Reusable UI components
│   │   ├── FloatingActionButton.svelte
│   │   ├── MoodSlider.svelte
│   │   ├── DatePicker.svelte
│   │   ├── Toast.svelte
│   │   └── ...
│   ├── stores/          # Svelte reactive stores
│   │   ├── moodEntries.svelte.ts
│   │   ├── reflections.svelte.ts
│   │   └── labels.svelte.ts
│   ├── types.ts         # TypeScript interfaces
│   └── utils.ts         # Utility functions
├── routes/
│   ├── +page.svelte           # Main page (mood entries list)
│   ├── add/                   # Create new entry
│   ├── entry/[id]/            # View/edit entry
│   ├── reflection/
│   │   ├── create/            # Create reflection (step 1)
│   │   ├── notes/             # Create reflection (step 2)
│   │   └── [id]/              # View/edit reflection
│   ├── insights/              # Mood insights & charts
│   ├── labels/                # Label management
│   └── about/                 # Help page
```

### State Management

All state is managed through Svelte 5 reactive stores:

- **moodEntryStore**: Manages mood entries with filtering by selected date
- **reflectionStore**: Manages daily reflections
- **labelStore**: Manages custom labels

### Navigation Flow

```
Main Page (Mood Entries)
├── + Button → Add Entry → Save → Back to Main
├── Entry Card → View Entry → Edit/Delete → Back to Main
├── Reflection Button → Create/View Reflection
├── Calendar → Date Picker → Select Date
├── Nav: Insights → Insights Page
├── Nav: Labels → Labels Management
└── Help Icon → About Page
```

## 🎨 Design Decisions

### Based on User Research

1. **No Social Features**: Initial user research revealed privacy concerns about sharing mood data. Users preferred a personal, private tracking experience.

2. **Quick Entry Focus**: Users wanted minimal friction for logging moods. The quick entry flow prioritizes speed (title → mood → optional labels → optional notes).

3. **Separate Reflection Flow**: Daily reflections are intentionally separate from quick entries to encourage end-of-day habit formation.

4. **View/Edit Mode Toggle**: Based on feedback, entries open in view mode by default to prevent accidental edits, with explicit edit action required.
