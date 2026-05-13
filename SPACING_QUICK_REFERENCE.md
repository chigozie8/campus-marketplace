# Quick Spacing Reference - Copy This For Your Team

## Button Spacing Cheat Sheet

### WhatsApp CTA Button Sizes
```
SIZE    HEIGHT  PADDING         GAP     USE CASE
─────────────────────────────────────────────────
sm      h-10    px-4            gap-2.5 Small/secondary
md      h-12    px-6            gap-3   Standard
lg      h-14    px-7            gap-3.5 Primary action
xl      h-16    px-10 sm:px-14  gap-4   Hero/emphasis
```

### Button Element Order
1. WhatsApp Icon (flex-shrink-0) → 0.05s delay
2. Text (font-bold) → 0.10s delay
3. Arrow Icon (flex-shrink-0) → 0.15s delay

---

## Footer Structure

```
┌─ Footer (py-16 sm:py-20 lg:py-24)
│
├─ Brand (col-span-2)
│  ├─ Logo (w-9 h-9, gap-2.5)
│  ├─ Description (max-w-xs)
│  └─ Contact Info (space-y-3)
│
├─ Marketplace Links (gap-3, mb-5)
├─ Seller Links (gap-3, mb-5)
├─ Company Links (gap-3, mb-5)
│
├─ Divider (border-t, my-8 sm:my-10)
│
└─ Bottom Section
   ├─ Copyright
   └─ Platform Badges (gap-2.5 inside each pill)
```

---

## Component Spacing Standards

### Cards
```
SIZE        PADDING      GAP      ICONS
─────────────────────────────────────────
Small card  p-6          gap-3    w-10 h-10
Medium card p-7 sm:p-8   gap-4    w-12 h-12
Large card  p-8 sm:p-10  gap-6    w-14 h-14
```

### Sections
```
SECTION         TOP/BOTTOM      MARGIN-BOTTOM    GRID-GAP
──────────────────────────────────────────────────────────
Hero            py-12-16        mb-8             gap-4
Features        py-24           mb-16-20         gap-5 sm:gap-6
CTA             py-24-36        mb-14            gap-4-5
Footer          py-16-24        mb-8 sm:mb-10    gap-8-12
```

---

## Responsive Breakpoints

```
DEVICE          WIDTH   GRID-COLS   GAP-SCALING
──────────────────────────────────────────────────
Mobile          <640px  1-2 cols    gap-3-4
Tablet          640-1024px  2-3 cols    gap-4-5
Desktop         1024px+     3-5 cols    gap-5-6
```

---

## Animation Timing

```
ELEMENT         DELAY   DURATION    EASING
───────────────────────────────────────────
Button icon     0.05s   0.4s        ease-out
Button text     0.10s   0.3s        ease-out
Button arrow    0.15s   0.3s        ease-out
Card entrance   varies  0.5s        [0.22, 1, 0.36, 1]
Hover effect    -       0.3s        spring
```

---

## Color Badges (Footer Platforms)

```
PLATFORM    BACKGROUND          BORDER              TEXT
────────────────────────────────────────────────────────
WhatsApp    bg-green-50         border-green-200    text-green-700
            dark:bg-green-950/20 dark:border-green-900/50
Instagram   bg-pink-50          border-pink-200     text-pink-700
            dark:bg-pink-950/20 dark:border-pink-900/50
Facebook    bg-blue-50          border-blue-200     text-blue-700
            dark:bg-blue-950/20 dark:border-blue-900/50
```

---

## DO's & DON'Ts

### ✅ DO
- Use consistent gap values (2.5, 3, 3.5, 4, 5, 6)
- Increase spacing on larger screens
- Maintain 44x44px minimum touch targets
- Use staggered animations (25ms delays)
- Apply flex-shrink-0 to icons in flex containers

### ❌ DON'T
- Mix arbitrary spacing values
- Use same gaps on mobile and desktop
- Make buttons smaller than h-10
- Overlap elements without intention
- Animate too many things at once

---

## Common Component Updates

### Adding a New Button
```tsx
<WhatsAppCtaButton
  text="Your Text Here"
  href="/destination"
  size="lg"              // sm | md | lg | xl
  showArrow={true}       // true | false
/>
```

### Adding a Card
```tsx
<div className="rounded-3xl border border-border bg-card p-7 sm:p-8 flex flex-col gap-4">
  {/* Content with consistent 4-unit gap */}
</div>
```

### Adding Footer Links
```tsx
<li>
  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200">
    Link Text
  </Link>
</li>
```

---

## Typography with Spacing

```
ELEMENT         SIZE                    MARGIN-BOTTOM
──────────────────────────────────────────────────────
Main heading    text-4xl sm:text-5xl    mb-6-8
Subheading      text-lg                 mb-4-6
Body text       text-base               mb-3-4
Small text      text-sm                 mb-2-3
```

---

## Testing Checklist

- [ ] Mobile view (360px) - buttons stack properly
- [ ] Tablet view (768px) - spacing transitions smoothly
- [ ] Desktop view (1920px) - maximum spacing applied
- [ ] All button sizes clickable on touch devices
- [ ] Hover animations smooth and not jerky
- [ ] No text overlap or clipping
- [ ] Footer mobile vs desktop looks good
- [ ] Icons all properly aligned and sized

---

## Questions? Reference Files

1. **Detailed Guide**: `SPACING_REDESIGN_GUIDE.md`
2. **Full Summary**: `SPACING_IMPROVEMENTS_SUMMARY.md`
3. **Component Files**:
   - `components/whatsapp-cta-button.tsx`
   - `components/landing/footer.tsx`
   - `components/landing/hero-section.tsx`
   - `components/landing/features.tsx`
   - `components/landing/cta-section.tsx`

---

**Version**: 1.0 | **Last Updated**: 2024
