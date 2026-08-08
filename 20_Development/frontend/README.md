# Oakami OS V1 - Frontend

## Overview
React 18+ single-page application for Oakami OS V1. Provides managers with a UI to:
- View and manage restaurant reviews
- Review AI-generated replies
- Approve/reject replies before posting
- View analytics and reports
- Manage platform integrations

## Quick Start
```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Technology Stack
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios
- **Routing**: React Router v6
- **Data Fetching**: React Query

## Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Page layout wrapper
│   ├── ReviewCard/     # Review display component
│   ├── ReviewList/     # Reviews grid/list
│   ├── ReplyEditor/    # Reply edit form
│   └── ...
├── pages/              # Page components (routes)
│   ├── Dashboard.jsx
│   ├── ReviewInbox.jsx
│   ├── ReviewDetail.jsx
│   ├── ManagerApproval.jsx
│   ├── Reports.jsx
│   ├── Settings.jsx
│   └── Login.jsx
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   ├── useReviews.js
│   └── useApi.js
├── stores/             # Zustand state stores
│   ├── authStore.js
│   ├── reviewStore.js
│   └── uiStore.js
├── services/           # API client functions
│   ├── reviewsAPI.js
│   ├── repliesAPI.js
│   ├── authAPI.js
│   └── ...
├── utils/              # Utility functions
│   ├── formatters.js
│   ├── validators.js
│   └── ...
├── App.jsx             # Root component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Main overview page |
| `/login` | Login | Authentication page |
| `/reviews` | ReviewInbox | List all reviews |
| `/reviews/:id` | ReviewDetail | Single review + AI reply |
| `/approve` | ManagerApproval | Approval workflow |
| `/reports` | Reports | Analytics & metrics |
| `/settings` | Settings | Configuration & integrations |

## Component Examples

### ReviewCard Component
```jsx
<ReviewCard
  review={review}
  onViewDetails={() => navigate(`/reviews/${review.id}`)}
  onApproveReply={() => handleApprove(review.id)}
/>
```

### ReplyEditor Component
```jsx
<ReplyEditor
  reviewId={reviewId}
  initialContent={generatedReply}
  onSave={handleSaveReply}
  onGenerate={handleGenerateNewReply}
/>
```

## State Management (Zustand)

### Auth Store
```javascript
import { useAuthStore } from '@/stores/authStore'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore()
  return <div>{user?.email}</div>
}
```

### Review Store
```javascript
import { useReviewStore } from '@/stores/reviewStore'

function ReviewList() {
  const { reviews, loading, fetchReviews } = useReviewStore()
  
  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])
  
  return reviews.map(r => <ReviewCard key={r.id} review={r} />)
}
```

## API Integration

### Custom Hook Pattern
```javascript
// hooks/useReviews.js
export function useReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  
  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const data = await reviewsAPI.getAll()
      setReviews(data)
    } finally {
      setLoading(false)
    }
  }, [])
  
  return { reviews, loading, fetchReviews }
}
```

### Service Layer
```javascript
// services/reviewsAPI.js
export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  getOne: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.patch(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  sync: () => api.post('/reviews/sync'),
}
```

## Styling with Tailwind

### Component Classes
Components use Tailwind utilities for styling:
```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-2xl font-bold text-neutral-900">Reviews</h2>
  <button className="btn-primary">New Review</button>
</div>
```

### Responsive Design
Built-in responsive classes for mobile-first design:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
</div>
```

### Custom Components (index.css)
Tailwind @layer for reusable component classes:
```css
@layer components {
  .btn-primary { @apply px-4 py-2 bg-primary text-white rounded-md; }
  .card { @apply bg-white rounded-lg shadow p-6; }
  .input { @apply w-full px-3 py-2 border border-neutral-300 rounded-md; }
}
```

## Development Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # Production build
npm run preview   # Preview production build locally
npm test          # Run tests
npm run lint      # Run ESLint
```

## Environment Variables
See `.env.example`:
```
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Oakami OS
VITE_ENVIRONMENT=development
```

## Design System
Implements design specifications from `FIGMA_DESIGN_GUIDE.md`:
- **Colors**: 5 semantic + 9 neutral
- **Typography**: Inter font, 8 sizes (xs-4xl)
- **Spacing**: 8px base unit (xs-3xl scales)
- **Components**: 30+ reusable components
- **Accessibility**: WCAG 2.1 AA compliant

## Best Practices
1. **Components**: Keep components small and focused
2. **State**: Use Zustand for global, hooks for local state
3. **Styling**: Use Tailwind classes, avoid inline styles
4. **API**: Use service layer, never call API from components directly
5. **Error Handling**: Use try-catch, show user-friendly messages
6. **Performance**: Memoize expensive computations, lazy load routes

## Testing
```bash
npm test              # Run all tests
npm run test:unit     # Unit tests
npm run test:e2e      # End-to-end tests
```

Test files colocated with components:
- `Component.jsx`
- `Component.test.jsx`

## Deployment
See `/docs/DEPLOYMENT.md` for production build and deployment:
- Build optimization
- Asset optimization
- Environment-specific configs
- Hosting options (Vercel, AWS, etc)

## Troubleshooting

### API requests 404
- Ensure backend is running on port 3001
- Check VITE_API_URL in .env

### Tailwind styles not applying
- Ensure `@tailwind` directives in index.css
- Rebuild if using production build

### State not persisting
- Use local storage in Zustand middleware
- Example: localStorage plugin for Zustand

## Performance Optimization
- Code splitting per route (React.lazy)
- Image optimization
- Gzip compression
- Caching strategies
- Bundle analysis

See `/docs/DEVELOPMENT_SETUP.md` for full setup guide.
