# Design System: Dashboard Page Overrides

## Context
The Dashboard is the main hub for waste intelligence data visualization. It displays real-time KPIs, prediction cards, trend charts, and notification summaries for restaurant operations staff.

## Page-Specific Overrides

### Layout & Grid
- **Density Override:** Use 9/10 (dashboard-tight) with 8-16px gaps between sections
- **Max-width:** No constraint—use full viewport width to maximize data visibility
- **Column Structure:** 
  - Mobile (375px): Single column for all sections
  - Tablet (768px): 2-column grid for KPI cards, full-width for charts
  - Desktop (1024px): 3-4 column grid for KPIs, 2-column for charts
  - Large (1440px): 5-column grid for KPIs, 3-column for charts

### KPI Cards
- **Container:** `w-full md:w-1/3 lg:w-1/4 xl:w-1/5` with consistent gutter
- **Height:** Fixed height (120-140px) for alignment
- **Color Coding:**
  - Background: `bg-white` with light gray border (`border-gray-200`)
  - Accent bar: Left border in semantic color (green for healthy, yellow for warning, red for critical)
- **Typography:**
  - Label: Body text, 14px, medium weight, gray-600
  - Value: Heading, 28px, bold, gray-900
  - Change indicator: Small, 12px, in-line with trend (↑ green / ↓ red)
- **No shadow** on cards—use border instead to preserve flat data-dense aesthetic
- **Hover:** Subtle background color shift (`hover:bg-gray-50`), maintain border
- **Touch:** Minimum height 64px on mobile for tappable interaction

### Prediction Cards Section
- **Section Title:** "AI Predictions" with optional refresh button (↻) aligned right
- **Grid:** 1-5 columns (responsive based on viewport)
- **Card Size:** 140-160px wide, 120px tall
- **Confidence Badge:** Top-right corner with color scale:
  - >= 0.8: `text-green-600` (high confidence)
  - 0.6-0.79: `text-yellow-600` (medium)
  - < 0.6: `text-red-600` (low, show cautionary icon)
- **Icon:** 32px centered at top (use SVG, not emoji)
- **No shadow**—use subtle `border-l-4` accent bar with severity color
- **Recommendation Text:** 10px gray-600, line-clamp-2 to prevent overflow
- **Action:** Click card to navigate to prediction detail or scroll to related KPI

### Charts (Trend, Category, Supplier)
- **Container:** Full-width responsive with aspect ratio maintained
- **Legend:** Below chart (not overlay), horizontal on desktop, stacked on mobile
- **Tooltip:** On hover with 150ms fade-in, show precise values
- **Colors:** Use semantic palette (not rainbow)—up to 5 series max per chart
- **No 3D effects** or decorative chart types—stick to Line, Bar, Pie
- **Y-axis labels:** Right-aligned, 12px gray-600
- **X-axis labels:** 12px gray-600, rotated if needed on mobile

### Tables (Waste Records, Inventory, etc.)
- **Header Row:** Sticky, `bg-gray-50`, 44px height for touch
- **Data Rows:** 44px height (min) for touch targets
- **Alternating Rows:** No background color—use `hover:bg-gray-50` only
- **Action Buttons:** 44x44px minimum, right-aligned in last column
- **Virtualization:** If > 50 rows, implement windowing (e.g., react-window)
- **Sorting Indicator:** Up/down caret on header hover, no color change
- **Empty State:** Center text message with icon, 200px from top

### Notification Banner
- **Position:** Top of page, below header
- **Height:** 44-56px (must not shift layout on appear/disappear)
- **Colors:**
  - Info: `bg-sky-50` border-sky-200
  - Warning: `bg-yellow-50` border-yellow-200
  - Critical: `bg-red-50` border-red-200
- **Animation:** Slide in from top (200ms), respect prefers-reduced-motion
- **Auto-dismiss:** 5 seconds for success, user-closeable for errors
- **Icon:** SVG 20x20px left-aligned, text mid-aligned

### Filters & Controls (if sidebar or top bar)
- **Button Size:** 44px height minimum
- **Spacing:** 8px between buttons (use flexbox gap)
- **Focus:** Visible 2px outline with 2px offset
- **Active State:** `bg-sky-600` text-white
- **Disabled State:** `opacity-50` cursor-not-allowed
- **Mobile:** Full-width filter buttons (except in <375px—then 2-column)

### Dark Mode Overrides
- **Background:** `bg-gray-950` (darker than light mode's F8FAFC)
- **Card Background:** `bg-gray-900` with `border-gray-800`
- **Text:** `text-gray-50` for primary, `text-gray-400` for secondary
- **Chart Colors:** Auto-invert via CSS filter or use explicit dark palette
- **Hover:** `hover:bg-gray-800` for cards

## Performance & Accessibility Checklist
- [ ] CLS < 0.05 (use skeleton loaders, reserve space for charts)
- [ ] FCP < 1.5s (lazy-load charts, inline critical CSS)
- [ ] LCP < 2.5s (preload top 5 KPI APIs)
- [ ] Contrast 4.5:1 on all text (especially predictions)
- [ ] Focus rings visible on all interactive elements
- [ ] Keyboard nav: Tab through filters → Charts → Tables
- [ ] Screen reader: Section landmarks, aria-live for real-time updates
- [ ] Reduced motion: No animations > 100ms without prefers-reduced-motion check
- [ ] Touch: All buttons/inputs >= 44x44px, 8px+ gaps

## Color Overrides (if different from MASTER)
None—use primary dashboard colors from MASTER.md:
- Semantic Alerts: green-600 (success), yellow-600 (warning), red-600 (critical)
- Accent: sky-600 (interactive), navy-900 (text)

## Motion & Transitions
- **KPI Cards:** 150ms fade-in on load (stagger 50ms each)
- **Charts:** 300ms entrance slide-up, ease-out
- **Tooltips:** 150ms fade-in on hover (not anticipation)
- **Filter Toggle:** 150ms height/opacity change
- **All animations:** Respect prefers-reduced-motion → 0ms

## Typography Notes
- **Headlines:** Use Fira Code for numeric display (matches "technicality" of dashboards)
- **Body:** Fira Sans for descriptions and labels
- **Font Sizes:**
  - KPI Labels: 14px (0.875rem)
  - KPI Values: 28px (1.75rem)
  - Chart Axis: 12px (0.75rem)
  - Table Body: 14px (0.875rem)
  - Section Headers: 18px (1.125rem)

## Example Component Structure
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-3">
  {/* KPI Cards */}
  <KPICard title="Total Waste" value="$1,234.56" trend="+12%" />
  
  {/* Predictions Section */}
  <div className="md:col-span-full">
    <h3 className="font-semibold text-gray-900 mb-3">AI Predictions</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {predictions.map(p => <PredictionCard key={p.id} {...p} />)}
    </div>
  </div>
  
  {/* Charts */}
  <div className="md:col-span-full">
    <DailyWasteTrendChart />
  </div>
</div>
```

## Do's & Don'ts

### Do ✓
- Use consistent spacing (8px multiples)
- Maintain 44px touch targets
- Add loading states with skeletons
- Use semantic color for status
- Respect user motion preferences
- Show data-density without clutter

### Don't ✗
- Add decorative animations
- Use only color to convey meaning (add icons/text)
- Nest >3 levels of interactive elements
- Use emojis as icons
- Disable zoom or impose fixed viewport
- Create horizontal scroll on any breakpoint

