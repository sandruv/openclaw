# Bookmark Page System

## Overview
Comprehensive bookmark management system with sidebar navigation integration and dedicated page view.

## Structure

### Components (`/components/dashboard/pages/bookmarks/components/`)
- **BookmarkIcon.tsx** - Renders bookmark icons (images, emojis, or default)
- **FolderCard.tsx** - Individual folder card with bookmarks
- **NewBookmarksSection.tsx** - Section for newly added bookmarks
- **AddFolderDialog.tsx** - Dialog for creating new folders
- **AddBookmarkDialog.tsx** - Dialog for creating new bookmarks

### Main Page (`/components/dashboard/pages/bookmarks/index.tsx`)
- Full bookmark management interface
- Staggered grid layout for folders
- Search functionality
- New bookmarks section
- Favorites section
- Folder highlighting via URL query param

### Route (`/app/dashboard/bookmarks/page.tsx`)
- Next.js page route for bookmarks at `/dashboard/bookmarks`
- Suspense wrapper with loading skeleton

## Features

### Dashboard Section (`/components/dashboard/sections/BookmarksSection.tsx`)
- Shows only **first 4 folders** and **first 5 bookmarks** per folder
- "View all bookmarks" link when more than 4 folders exist
- Quick access to favorites
- New bookmarks section

### Sidebar Integration (`/components/dashboard/layout/sidebar/sections/EssentialsSection.tsx`)
- Collapsible "Essentials" section
- Displays all bookmark folders
- Folders are clickable and link to bookmarks page
- Highlights selected folder on bookmarks page
- Section header links to main bookmarks page

### Bookmarks Page Features
- **Staggered Grid Layout** - Dynamic grid based on folder content
- **Search** - Filter across all folders and bookmarks
- **New Bookmarks** - Dedicated section with checkboxes
- **Favorites** - Quick access section
- **Folder Highlighting** - URL parameter-based highlighting (`?folder=ID`)
- **Add/Edit** - Dialogs for managing folders and bookmarks

## Navigation Flow

1. **Sidebar → Folder Name** → Opens `/dashboard/bookmarks?folder=ID` (highlighted)
2. **Dashboard Section** → "View all bookmarks" → Opens `/dashboard/bookmarks` page
3. **Bookmark Click** → Opens URL in new tab
4. **New Bookmarks** → Auto-marks as read on click

## URL Parameters

- `?folder=ID` - Highlights specific folder on page load

## Styling

- Uses theme colors from `useThemeColor()`
- Folder colors applied to folder names and borders
- Responsive grid: 1-5 columns based on screen size
- Dark mode support throughout
