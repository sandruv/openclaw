# ThreadBubble Component

This folder contains the refactored Thread component, now organized into modular sub-components for better maintainability and separation of concerns.

## Structure

```
ThreadBubble/
├── index.tsx                    # Main entry point - Thread component with ThreadBubble
├── types.ts                     # TypeScript interfaces and types
├── utils.ts                     # Utility functions (isClientMessage, getClientDisplayInfo, shouldUseNextImage)
├── ImageDialog.tsx              # Full-screen image viewer dialog
├── ClickableImage.tsx           # Reusable clickable image component
├── ContentErrorBoundary.tsx     # Error boundary for content parsing failures
├── ThreadAvatar.tsx             # Avatar display for agent/client/user
├── ThreadHeader.tsx             # Header with name, activity type, and status badges
├── ThreadTimestamp.tsx          # Timestamp and time elapsed display
├── ThreadContent.tsx            # HTML content parser with image handling
└── ThreadAttachments.tsx        # File attachments display
```

## Component Hierarchy

```
Thread (index.tsx)
├── ImageDialog
└── ThreadBubble (for each activity)
    ├── ThreadAvatar
    ├── ThreadHeader
    ├── ThreadTimestamp
    ├── ThreadContent
    │   ├── ContentErrorBoundary
    │   └── ClickableImage (for images in content)
    └── ThreadAttachments
```

## Key Features

### 1. **Modular Design**
- Each sub-component handles a specific part of the thread display
- Easy to modify individual sections without affecting others
- Improved testability and maintainability

### 2. **Shared Utilities** (`utils.ts`)
- **`isClientMessage(activity, taskUserEmail)`** - Determines if activity is from client
  - Checks activity type ID (ClientResponse = 4)
  - Compares 'from' field with task user email
  - Detects non-yanceyworks email addresses
- **`getClientDisplayInfo(activity, taskUserEmail, taskUserFirstName, taskUserLastName)`** - Gets client display info
  - Returns client name and initials
  - Uses task user info when available
  - Falls back to generic "Client" display
- **`shouldUseNextImage(src)`** - Determines image rendering strategy
  - Returns `false` for CID references (email attachments)
  - Returns `false` for data URLs (base64 images)
  - Returns `true` for HTTP/HTTPS URLs

### 3. **Type Safety**
- Centralized TypeScript interfaces in `types.ts`
- Consistent prop types across all components

### 4. **Image Handling**
- **ClickableImage Component**: Reusable image component with click handling
  - Supports HTTP/HTTPS URLs, data URLs, and CID references
  - Smart rendering: Next.js Image for URLs, regular img for CID/data
  - Hover effects and responsive sizing (max 600px width, 300px height)
  - Click handler for full-screen viewing
- **ImageDialog Component**: Full-screen image viewer
  - Modal dialog with backdrop blur
  - Close button and click-outside-to-close
  - Proper image scaling with object-contain
  - Dark mode support

### 5. **Error Handling**
- **ContentErrorBoundary**: React error boundary for content parsing
  - Catches HTML parsing errors gracefully
  - Displays user-friendly error message
  - Shows error details in expandable section
  - Prevents entire component from crashing
  - Dark mode compatible error UI

### 6. **Principal Request Support**
- For tickets with `ticket_source_id=5` (Principal Request), `ticket_type_id=4` (Project), and `user.client_id=1`
- The **first activity** (oldest) displays the user's avatar and name instead of the agent's
- User avatar uses the user's own color (via `getAvatarColor(userId)`)
- Automatically detected and applied in the Thread component
- Controlled by `useUserInfoForDisplay` prop

## Usage

Import from the main entry point:

```tsx
import { Thread } from '@/components/task-details/thread/sections/ThreadBubble'

// Use in your component
<Thread />
```

The Thread component is self-contained and automatically:
- Fetches task data from `useTaskDetailsStore`
- Applies compact mode from `useSettingsStore`
- Sorts activities by date (newest first)
- Detects Principal Request tickets
- Handles image dialog state

## Props Flow

### Thread (index.tsx)
- Manages image dialog state
- Sorts activities
- Detects Principal Request tickets
- Provides task context to ThreadBubble components

### ThreadBubble (internal component in index.tsx)
- Receives activity data and display settings
- Orchestrates layout and sub-components
- Handles client vs agent vs user message styling

### Sub-components Props

Each component receives only the props it needs:

- **ThreadAvatar**
  - `activity`: ActivityData
  - `taskUserEmail`: string (optional)
  - `taskUserFirstName`: string (optional)
  - `taskUserLastName`: string (optional)
  - `taskUserId`: number (optional)
  - `useUserInfoForDisplay`: boolean

- **ThreadHeader**
  - `activity`: ActivityData
  - `compactMode`: boolean
  - `taskUserEmail`: string (optional)
  - `taskUserFirstName`: string (optional)
  - `taskUserLastName`: string (optional)
  - `useUserInfoForDisplay`: boolean

- **ThreadTimestamp**
  - `activity`: ActivityData

- **ThreadContent**
  - `activity`: ActivityData
  - `onImageClick`: (src: string, alt: string) => void

- **ThreadAttachments**
  - `activity`: ActivityData

- **ClickableImage**
  - `src`: string
  - `alt`: string
  - `width`: number (default: 400)
  - `height`: number (default: 200)
  - `onImageClick`: (src: string, alt: string) => void

- **ImageDialog**
  - `imageDialog`: ImageDialogState
  - `onClose`: () => void
  - `onOpenChange`: (open: boolean) => void

## Styling

### Message Types
- **Client messages**: Purple background (`bg-purple-100 dark:bg-purple-900/50`)
  - Left-aligned (`justify-start`)
  - Purple border in dark mode (`dark:border-purple-800/50`)
- **Agent/Internal messages**: Blue background (`bg-blue-50 dark:bg-blue-900/50`)
  - Right-aligned (`justify-end`)
  - Blue border in dark mode (`dark:border-blue-800/50`)

### Layout
- Message bubbles: 90% width, rounded corners, padding
- Border: Gray border with dark mode variants
- Responsive design with proper spacing
- Compact mode support for reduced UI

### Dark Mode
- Full dark mode support across all components
- Proper contrast ratios for accessibility
- Dark-compatible error states and dialogs

## TypeScript Interfaces

### ActivityData
```typescript
interface ActivityData {
  id: number
  content: string
  date_start: string
  date_end: string
  time_elapse: number | null
  from?: string
  agent: {
    id: number
    first_name: string
    last_name: string
  }
  activity_type: {
    id: number
    name: string
  }
  status?: {
    name: string
  }
  files?: any[]
}
```

### ImageDialogState
```typescript
interface ImageDialogState {
  open: boolean
  src: string
  alt: string
}
```

### ClientDisplayInfo
```typescript
interface ClientDisplayInfo {
  name: string
  initials: string
}
```

## Integration

The Thread component integrates with:
- **`useTaskDetailsStore`**: Fetches task and activities data
- **`useSettingsStore`**: Applies compact mode setting
- **`@/styles/thread-content.css`**: Custom CSS for HTML content styling
- **`@/lib/ticketTypeIdProvider`**: Activity type constants
- **`@/lib/utils`**: Utility functions (cn, getInitials, getAvatarColor)

## Benefits

### Maintainability
- **Separation of Concerns**: Each component has a single, well-defined responsibility
- **Easy to Modify**: Changes to one component don't affect others
- **Clear Structure**: Logical organization makes code easy to navigate

### Testability
- **Isolated Components**: Each sub-component can be tested independently
- **Mocked Props**: Easy to create test fixtures for specific scenarios
- **Error Boundaries**: Graceful failure handling prevents cascading errors

### Reusability
- **Shared Utilities**: Common functions extracted to utils.ts
- **Modular Components**: ClickableImage, ImageDialog can be reused elsewhere
- **Consistent Patterns**: Same approach can be applied to other features

### Performance
- **Optimized Rendering**: Only affected components re-render on state changes
- **Smart Image Loading**: Conditional Next.js Image usage for optimization
- **Efficient Sorting**: Activities sorted once at parent level

## Best Practices

### When Modifying Components

1. **Keep Components Focused**: Each component should do one thing well
2. **Use TypeScript**: Leverage type safety for props and state
3. **Handle Errors**: Use ContentErrorBoundary for risky operations
4. **Test Dark Mode**: Ensure all changes work in both light and dark themes
5. **Consider Compact Mode**: Respect the compact mode setting where applicable

### When Adding Features

1. **Extract to Utils**: If logic is reusable, add it to utils.ts
2. **Create New Components**: Don't bloat existing components with new features
3. **Update Types**: Add new interfaces to types.ts for type safety
4. **Document Changes**: Update this README when adding new components
5. **Maintain Consistency**: Follow existing patterns and naming conventions

### Common Pitfalls to Avoid

- ❌ Don't access stores directly in sub-components (pass props instead)
- ❌ Don't hardcode styles (use Tailwind classes and dark mode variants)
- ❌ Don't skip error handling (use try-catch and error boundaries)
- ❌ Don't forget accessibility (add proper ARIA labels and alt text)
- ❌ Don't ignore TypeScript errors (fix them, don't suppress them)

## Migration Notes

The original `Thread.tsx` file has been replaced by this modular structure. The import path has been updated in:
- `components/task-details/thread/MainThread.tsx`

No functionality has been changed - this is purely a structural refactoring for better code organization and maintainability.

## File Checklist

- ✅ `index.tsx` - Main Thread component with ThreadBubble
- ✅ `types.ts` - TypeScript interfaces
- ✅ `utils.ts` - Shared utility functions
- ✅ `ImageDialog.tsx` - Full-screen image viewer
- ✅ `ClickableImage.tsx` - Reusable clickable image
- ✅ `ContentErrorBoundary.tsx` - Error boundary for content
- ✅ `ThreadAvatar.tsx` - Avatar display
- ✅ `ThreadHeader.tsx` - Header with name and badges
- ✅ `ThreadTimestamp.tsx` - Timestamp display
- ✅ `ThreadContent.tsx` - HTML content parser
- ✅ `ThreadAttachments.tsx` - File attachments
- ✅ `README.md` - This documentation
