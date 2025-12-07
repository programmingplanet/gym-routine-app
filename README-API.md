# GymRoutine App - API & Data Storage

## Current Setup

The app currently stores data in **localStorage** (browser storage). This simulates a database but the data is only stored locally in your browser.

## JSON Files Created

I've created the following JSON files to simulate a real database:

- `/data/exercises.json` - Custom exercises
- `/data/routines.json` - Custom routines
- `/data/progress.json` - Workout progress

## Features Implemented

### ✅ Delete Exercise from Routine
- **Custom routines only**: You can delete exercises from custom routines
- **How**: Hover over an exercise card in a custom routine → Click the red trash button
- The exercise is removed from the routine but remains in the exercise catalog

### ✅ Delete Entire Routine
- **Custom routines only**: You can delete entire custom routines
- **How**: On the dashboard, hover over a custom routine card → Click the red trash button
- Default routines (Día 1-4) cannot be deleted

### ✅ Create Custom Exercises
- Go to Settings → Create new exercises with images and descriptions
- Custom exercises are stored in localStorage and appear in the exercise catalog

### ✅ Share Exercises
- In Settings, click the share button on your custom exercises
- Shared exercises appear with "Compartido por [Name]" badge for other users

## Data Storage Locations

### Current (LocalStorage)
All data is stored in browser localStorage:
- `customExercises` - Custom exercises created by users
- `customRoutines` - Custom routines created by users
- `progress` - Workout progress logs
- `completedRoutines` - Routine completion status
- `completedExercises` - Individual exercise completion status

### Optional API Server (Not Active)
I've created an Express.js API server (`/server/`) that can read/write to JSON files, but it's **not currently being used**.

To activate the API server:
1. Install dependencies: `npm install`
2. Run: `npm run dev:all` (runs both Next.js and the API server)
3. Set environment variable: `NEXT_PUBLIC_USE_API=true`

## How Data Flows

1. **Create Custom Exercise**:
   - Settings → New Exercise → Fill form → Save
   - Stored in `localStorage['customExercises']`

2. **Create Custom Routine**:
   - Dashboard → Nueva Rutina → Add exercises → Save
   - Stored in `localStorage['customRoutines']`

3. **Delete Exercise from Routine**:
   - Open custom routine → Hover over exercise → Click trash icon
   - Updates `localStorage['customRoutines']`

4. **Delete Routine**:
   - Dashboard → Hover over custom routine → Click trash icon
   - Removes from `localStorage['customRoutines']`

## Data Structure

### Custom Exercise
```json
{
  "id": "custom-ex-1234567890-0.123",
  "name": "My Exercise",
  "imageUrl": "https://...",
  "muscleGroup": "pecho",
  "description": "Exercise description",
  "equipment": ["Mancuernas", "Banco"],
  "createdBy": "1",
  "isShared": true,
  "sharedWith": ["2"],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Custom Routine
```json
{
  "id": "custom-routine-1234567890-0.123",
  "userId": "1",
  "dayNumber": 5,
  "dayName": "Día de Piernas",
  "isCustom": true,
  "exercises": [
    {
      "exerciseId": "ex-1",
      "sets": 4,
      "reps": "10-12",
      "order": 0
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## Future Migration to Real Database

When you're ready to use a real database (PostgreSQL, MongoDB, etc.), you only need to:

1. Update the functions in `/lib/api.ts`
2. Replace localStorage calls with fetch/axios calls to your backend
3. All the UI components will work the same

The code is already structured for easy migration!
