# Animation Implementation Guide - Performance & Testing

## Performance Optimization Checklist

### 1. GPU Acceleration
- ✅ All animations use `transform` and `opacity` only (no layout-triggering properties)
- ✅ `will-change` applied conditionally only during animations
- ✅ CSS transforms utilized for all motion properties
- ✅ Framer Motion with `LazyMotion` and `domAnimation` for optimized rendering

### 2. Frame Rate Management
- ✅ Target 60fps maintained through:
  - Animating only transform/opacity
  - Using `useMotionValue` for derived animations
  - Debouncing scroll listeners with passive event listeners
  - Staggering animations to spread load

### 3. Memory Management
- ✅ Event listeners properly cleaned up in hooks
- ✅ Intersection Observer cleanup in useInViewAnimation
- ✅ No event listener leaks on scroll/resize
- ✅ Component unmount cleanup implemented

### 4. Bundle Size
- ✅ Framer Motion lazy loading with domAnimation preset
- ✅ Custom hooks minimize code duplication
- ✅ Reusable animation variants in motion.ts
- ✅ Tree-shaking enabled for unused animations

## Accessibility Compliance

### 1. Prefers Reduced Motion
- ✅ All custom hooks check `useReducedMotionPref`
- ✅ Animations disabled when `prefers-reduced-motion: reduce` is set
- ✅ Content still accessible and functional without motion
- ✅ No core functionality depends on animation completion

### 2. Semantic HTML
- ✅ Interactive elements use proper button/link tags
- ✅ ARIA labels applied to animated icons
- ✅ Focus states maintained during animations
- ✅ Keyboard navigation not disrupted by motion

### 3. Color Contrast
- ✅ All animated text maintains WCAG AA contrast ratio (4.5:1)
- ✅ Animation doesn't reduce contrast during transitions
- ✅ Color transitions don't rely solely on hue (deuteranopia safe)

### 4. Motion Sensitivity
- ✅ No infinite loops that could trigger vestibular issues
- ✅ Animations under 2 seconds prefer or under 5 seconds for entrance
- ✅ No rapid flashing or flickering (>3Hz)
- ✅ Parallax effects use subtle speeds (0.3-0.5x)

## Testing Procedures

### 1. Visual Regression Testing
```bash
# Run before deployment to catch visual changes
npx playwright test --headed
```

### 2. Performance Profiling
In Chrome DevTools:
1. Open Performance tab
2. Record while scrolling through homepage
3. Look for:
   - Consistent 60fps (16.67ms per frame)
   - No long tasks (>50ms)
   - GPU acceleration indicator (green)

Lighthouse audit:
- Target: 90+ Performance score
- Target: 100 Accessibility score
- Command: `npx lighthouse https://vendoorx.vercel.app --view`

### 3. Accessibility Audit
```bash
# Automated accessibility testing
npx axe-core ./test

# Manual testing:
# 1. Test with keyboard only (Tab, Enter, Space, Arrows)
# 2. Test with screen reader (NVDA, JAWS)
# 3. Test with motion preferences disabled
# 4. Test on various zoom levels (100%, 125%, 200%)
```

### 4. Cross-Browser Testing
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 5. Device Testing
- Desktop (1920x1080, 2560x1440)
- Tablet (768x1024, 1024x1366)
- Mobile (375x667, 412x915, 540x720)
- Low-end devices (ensure animations stay smooth)

## Monitoring & Analytics

### Animation Performance Metrics
Add to your analytics:
```typescript
// Track animation performance
const trackAnimationMetric = (sectionName: string, duration: number) => {
  analytics.track('animation_duration', {
    section: sectionName,
    duration_ms: duration,
    timestamp: Date.now()
  })
}
```

### Core Web Vitals
Monitor these metrics:
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **FID (First Input Delay)**: Target < 100ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1

## Troubleshooting Guide

### Animation Jank/Stuttering
1. Check DevTools Performance profile
2. Verify only transform/opacity being animated
3. Reduce stagger delay if too many elements animating simultaneously
4. Consider reducing parallax speed

### Animation Not Triggering
1. Verify `whileInView` viewport settings
2. Check `useInViewAnimation` threshold values
3. Ensure element is actually scrollable into view
4. Check prefers-reduced-motion isn't overriding

### High CPU Usage
1. Reduce number of simultaneous animations
2. Increase stagger delays
3. Reduce animation duration
4. Use `will-change` more sparingly

### Mobile Performance Issues
1. Reduce parallax effects on mobile
2. Disable complex animations on low-end devices
3. Use `matchMedia` to detect device capability
4. Test on actual devices, not just emulation

## Best Practices Applied

1. **Progressive Enhancement**: Animation enhances but doesn't block core functionality
2. **Motion Intent**: Animations guide user attention to important elements
3. **Consistent Timing**: Standard durations (0.3s, 0.5s, 0.7s) throughout
4. **Easing Consistency**: Cubic-bezier `[0.22, 1, 0.36, 1]` creates premium feel
5. **Spring Physics**: Natural feel for micro-interactions (stiffness: 400, damping: 20)
6. **Accessibility First**: Reduced motion respected before any optimization

## Deployment Checklist

Before pushing to production:
- [ ] All animations tested on low-end device
- [ ] Lighthouse score 90+ performance
- [ ] Accessibility score 100
- [ ] No console errors or warnings
- [ ] Mobile viewport animations smooth (60fps)
- [ ] Prefers-reduced-motion tested and working
- [ ] All animations have meaningful delays/stagger
- [ ] No animations block user interaction
- [ ] Cross-browser tested
- [ ] Performance monitored in analytics

## Future Optimizations

- Consider FLIP animations for large layout shifts
- Add motion preferences detection per component
- Implement `requestAnimationFrame` batching for grouped animations
- Profile with WebPageTest for real-world device metrics
- A/B test animation intensity with users
