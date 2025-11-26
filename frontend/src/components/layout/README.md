# PageLayout Component

## 📦 Universal Layout Wrapper

A global layout component that automatically handles spacing for `BottomNav` across all pages.

---

## 🎯 Purpose

Solves the problem of content being obscured by the fixed bottom navigation bar (64px height) by automatically adding appropriate padding-bottom to all pages.

---

## 🚀 Usage

### Basic Page (No Bottom Actions)

```jsx
import PageLayout from '../../../components/layout/PageLayout';

export default function MyPage() {
  return (
    <PageLayout className="bg-gray-50">
      {/* Your page content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1>My Page</h1>
        {/* ... */}
      </div>
    </PageLayout>
  );
}
```

**Result:** Adds `pb-20` (80px) = 64px (BottomNav) + 16px (spacing)

---

### Page with Fixed Bottom Actions

```jsx
import PageLayout from '../../../components/layout/PageLayout';

export default function StationDetailPage() {
  return (
    <PageLayout hasBottomActions className="bg-gray-50">
      {/* Your page content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1>Station Details</h1>
        {/* ... */}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white z-[999]">
        <button>Action 1</button>
        <button>Action 2</button>
      </div>
    </PageLayout>
  );
}
```

**Result:** Adds `pb-44` (176px) = 64px (BottomNav) + 72px (Actions) + 40px (spacing)

---

### Custom Styling

```jsx
<PageLayout className="bg-gradient-to-br from-blue-50 to-purple-50">
  {/* Your content */}
</PageLayout>
```

---

### No Padding (Full Control)

```jsx
<PageLayout noPadding>
  {/* You handle padding yourself */}
</PageLayout>
```

---

## 📐 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Page content |
| `hasBottomActions` | boolean | `false` | Set to `true` if page has fixed bottom actions |
| `className` | string | `''` | Additional CSS classes (e.g., background) |
| `noPadding` | boolean | `false` | Disable automatic padding-bottom |

---

## 🎨 Spacing Breakdown

### Without Bottom Actions (`hasBottomActions={false}`)
```
┌─────────────────────────────────────┐
│                                     │
│         Page Content                │
│         (pb-20 = 80px)              │
│                                     │
├─────────────────────────────────────┤ ← 16px spacing
│ [🏠] [📍] [🗺️] [🔔] [⚙️]           │ ← BottomNav (64px, z-1001)
└─────────────────────────────────────┘
```

### With Bottom Actions (`hasBottomActions={true}`)
```
┌─────────────────────────────────────┐
│                                     │
│         Page Content                │
│         (pb-44 = 176px)             │
│                                     │
├─────────────────────────────────────┤ ← 40px spacing
│ [Action 1] [Action 2]               │ ← Bottom Actions (72px, z-999)
├─────────────────────────────────────┤ ← bottom-16 (64px)
│ [🏠] [📍] [🗺️] [🔔] [⚙️]           │ ← BottomNav (64px, z-1001)
└─────────────────────────────────────┘
```

---

## ✅ Applied To

- ✅ `DashboardPage` - Home dashboard
- ✅ `ProfilePage` - User profile management
- ✅ `VehiclesPage` - Vehicle management
- ✅ `StationDetailPage` - Station details (with bottom actions)
- ❌ `MapPage` - Full-screen map (no padding needed)
- ❌ Auth pages - No BottomNav shown

---

## 🎯 Z-Index Hierarchy

```
z-[1001]  ← BottomNav (highest, always visible)
z-[999]   ← Bottom Actions (below BottomNav)
z-50      ← Sticky headers
z-40      ← Modals/overlays
```

---

## 🔧 Maintenance

If you need to adjust spacing:

1. **Change BottomNav height**: Update `pb-20` calculation
2. **Change Actions height**: Update `pb-44` calculation
3. **Add new spacing tier**: Add new prop like `hasLargeActions`

---

## 📝 Notes

- Always use `PageLayout` for pages that show `BottomNav`
- For full-screen pages (like Map), skip `PageLayout`
- Bottom actions should use `bottom-16` (64px) to sit above BottomNav
- Bottom actions should have `z-[999]` (below BottomNav's `z-[1001]`)

---

## 🎉 Benefits

- ✅ **Consistent spacing** across all pages
- ✅ **No more obscured content**
- ✅ **Easy to maintain** - change once, apply everywhere
- ✅ **Flexible** - supports custom styling and bottom actions
- ✅ **Type-safe** - clear prop interface

