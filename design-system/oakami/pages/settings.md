# Design System: Settings/Reports Page Overrides

## Context
Settings and Reports pages include form-heavy UI for configuring report schedules, notification preferences, and organization settings. These pages prioritize clarity and task completion over data visualization.

## Page-Specific Overrides

### Form Sections
- **Max-width:** 600px (centered on desktop)
- **Section Spacing:** 32px between sections
- **Field Spacing:** 20px between inputs
- **Group Spacing:** 16px (for related fields)

### Form Fields (All Types)
- **Label Styling:**
  - Font size: 14px (0.875rem), medium weight, gray-900
  - Margin below: 8px
  - Required indicator: Red asterisk (*) with `aria-label="required"`
  - Screen reader text: Not hidden, visual only
- **Input Height:** 44px (touch target)
- **Padding:** 12px horizontal, 10px vertical
- **Border:** 1px solid gray-300
- **Focus Style:** 2px outline sky-500, 2px offset
- **Disabled:** `opacity-50`, `cursor-not-allowed`
- **Error State:**
  - Border: 1px solid red-500
  - Error message: Below field, 12px red-600, `role="alert"`
  - Icon: Small red warning icon inline with message

### Form Buttons
- **Primary (Submit):** `bg-sky-600 text-white` hover `bg-sky-700`
- **Secondary (Cancel):** `bg-gray-200 text-gray-900` hover `bg-gray-300`
- **Destructive (Delete):** `bg-red-600 text-white` hover `bg-red-700`
- **All buttons:** 44px height minimum, 16px padding horizontal
- **Loading State:** Show spinner icon, disable interaction, `aria-busy="true"`
- **Focus:** 2px outline with 2px offset (use color-appropriate outline)

### Schedule Form (ReportSchedulePanel)
- **Frequency Toggle:** 
  - 3 radio buttons or dropdown (DAILY / WEEKLY / MONTHLY)
  - Uncontrolled labels with click handlers
  - Change reveals conditional fields below (progressive disclosure)
- **Time Input:**
  - Native time picker (24-hour format)
  - Label: "Time (24-hour format)" for clarity
  - On mobile: Full-width, larger touch target
- **Day of Week (WEEKLY only):**
  - Dropdown with day names (Sunday–Saturday)
  - Appears only when frequency === WEEKLY
  - Default: Monday (1)
- **Day of Month (MONTHLY only):**
  - Number input, min=1, max=31
  - Appears only when frequency === MONTHLY
  - Default: 1
  - Help text: "1-31"
- **Email Recipients:**
  - Textarea or text input (comma-separated)
  - Placeholder: "user@example.com, another@example.com"
  - Help text below: "Separate multiple addresses with commas"
  - Validation: Email regex on blur
- **Description:**
  - Optional textarea, 2-3 rows
  - Placeholder: "e.g., Weekly operations summary"
- **Enable Toggle:**
  - Checkbox (not toggle switch for accessibility)
  - Label: "Enable this schedule"
  - Larger checkbox (20px) for touch
  - Gap between checkbox and label: 8px

### Notification/Filter Preferences
- **Checkbox Groups:**
  - Checkboxes stacked vertically, 8px gap
  - Each checkbox: 20px size, 8px gap to label
  - Group title: 14px, medium weight, gray-900
  - Group margin-bottom: 24px
- **Toggle Switches (if used):**
  - Height: 24px, width: 48px
  - Thumb: 20px square
  - On-color: `bg-green-600`, Off-color: `bg-gray-300`
  - Animated transition 200ms (respect prefers-reduced-motion)
  - Label always visible (not icon-only)

### Form Validation
- **Real-time vs. On-blur:**
  - Inline feedback: Show on blur (not keystroke)
  - Error icon: Small red circle with "!" or SVG
  - Error message: 12px gray-600 or red-600
  - Link suggestions: "Did you mean...?" for common typos
- **Success State:**
  - Green checkmark (✓) in green-600
  - Green left border on field (2px)
  - Optional: Small "saved" label with 2s fade-out

### Table (if listing settings/schedules)
- **Header:** Sticky, `bg-gray-50`, 44px height
- **Rows:** 48-56px (more spacious than dashboard tables)
- **Columns:** Limit to 4-5 columns
- **Actions:** Last column, right-aligned, 44px buttons
- **Hover:** Subtle `hover:bg-gray-50`
- **Empty State:** Icon + text, 100px from top

### Card Layout (for settings groups)
- **Background:** `bg-white` with `border border-gray-200`
- **Padding:** 24px (larger than dashboard for breathing room)
- **Border-radius:** 8px
- **Shadow:** None (use border)
- **Title:** 16px, medium weight, gray-900
- **Description:** 13px gray-600, margin-top 4px
- **Content:** Margin-top 16px

### Loading & Saving States
- **Loading Skeleton:**
  - Show placeholder text blocks
  - Height: same as real content
  - Color: `bg-gray-200` with subtle animation
  - Duration: 500ms fade-in once loaded
- **Saving Indicator:**
  - Inline spinner in button during POST/PATCH
  - Button text changes to "Saving..." / "Creating..."
  - Disable button on submission to prevent double-click
- **Success Banner:**
  - Auto-dismiss after 5 seconds
  - Position: Top of form
  - Height reserve: 56px (prevent layout shift)

### Mobile Overrides
- **Form Width:** Full width with 16px padding left/right
- **Button Width:** Full width (not side-by-side on mobile)
- **Input Height:** Maintain 44px (not reduced)
- **Time/Date Picker:** Use native mobile widgets
- **Help Text:** Always visible, not hidden on small screens
- **Error Messages:** Show inline, not in tooltips

### Dark Mode
- **Background:** `bg-gray-900`
- **Card Background:** `bg-gray-800` with `border-gray-700`
- **Text:** `text-gray-50` (primary), `text-gray-400` (secondary)
- **Borders:** `border-gray-700`
- **Inputs:** `bg-gray-800` border-gray-600 text-gray-50
- **Hover:** `hover:bg-gray-700`
- **Error:** `text-red-400` border-red-500

## Accessibility Checklist
- [ ] All form fields have visible labels (not placeholder-only)
- [ ] Required fields marked with * and aria-required="true"
- [ ] Error messages linked with aria-describedby
- [ ] Form inputs have aria-label + aria-required as backup
- [ ] Buttons have aria-label and aria-busy (during submission)
- [ ] Keyboard navigation: Tab through all fields → Buttons
- [ ] Focus order: Top-to-bottom, left-to-right
- [ ] Contrast: Labels/text 4.5:1, helper text 3:1
- [ ] Help text uses aria-describedby and smaller font size
- [ ] Checkboxes/radios have 20px+ size for touch
- [ ] No auto-advance between fields (respect user pace)

## Do's & Don'ts

### Do ✓
- Use consistent field spacing
- Show required field indicators visually + with aria
- Validate on blur (not keystroke)
- Clear error messages with suggestions
- Disable submit buttons during loading
- Show success feedback
- Use progressive disclosure for conditional fields

### Don't ✗
- Use placeholder text as label
- Hide labels in tooltips
- Validate in real-time (too noisy)
- Use color-only error indication
- Auto-submit form changes
- Discard validation messages after blur
- Use emoji in form fields
- Create multi-column button rows on mobile

## Example Form Structure
```jsx
<form className="max-w-2xl mx-auto space-y-8">
  {/* Section 1: Schedule Basics */}
  <div className="space-y-6">
    <h2 className="text-lg font-semibold text-gray-900">Report Details</h2>
    
    <div>
      <label htmlFor="schedule-name" className="block text-sm font-medium text-gray-700 mb-2">
        Schedule Name
        <span aria-label="required" className="text-red-600 ml-1">*</span>
      </label>
      <input id="schedule-name" type="text" required />
    </div>
    
    <div>
      <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
        Frequency
      </label>
      <select id="frequency" onChange={onFrequencyChange}>
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
        <option value="MONTHLY">Monthly</option>
      </select>
    </div>
  </div>

  {/* Section 2: Recipients */}
  <div className="space-y-6">
    <h2 className="text-lg font-semibold text-gray-900">Recipients</h2>
    
    <div>
      <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-2">
        Email Addresses
        <span aria-label="required" className="text-red-600 ml-1">*</span>
      </label>
      <textarea id="emails" required />
      <p id="email-help" className="text-xs text-gray-500 mt-1">
        Separate multiple addresses with commas
      </p>
    </div>
  </div>

  {/* Buttons */}
  <div className="flex gap-2">
    <button type="submit" className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded">
      Save
    </button>
    <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded">
      Cancel
    </button>
  </div>
</form>
```

