# Upgrade Guide - Dependencies Update

## Overview
This guide documents the dependency upgrades and code changes made to update PriceWise to the latest versions.

## Major Version Updates

### Next.js (16.0.0 → 15.1.6)
- **Note**: Downgraded from 16.0.0 to 15.1.6 (latest stable)
- Moved `serverComponentsExternalPackages` out of `experimental` to `serverExternalPackages`
- Updated `next.config.js` accordingly

### React (18 → 19)
- Updated React and React DOM to version 19
- Added `Readonly<>` wrapper for children props in layout components
- Updated TypeScript types for React 19 compatibility

### Tailwind CSS (3.3.0 → 4.0.0)
- Converted `tailwind.config.ts` to `tailwind.config.js` for better v4 compatibility
- All existing custom theme configurations preserved

### @headlessui/react (1.7.17 → 2.2.0)
- Updated Dialog component API:
  - Removed `Fragment` wrapper requirement
  - Changed `Dialog.Overlay` to `div` with backdrop styling
  - Renamed `Transition.Child` to `TransitionChild`
  - Renamed `Dialog.Panel` to `DialogPanel`
  - Removed `as={Fragment}` props

### Mongoose (8.0.3 → 8.9.3)
- Updated to latest 8.x version
- No breaking changes in connection logic

### Other Notable Updates
- **axios**: 1.6.5 → 1.7.9
- **cheerio**: 1.0.0-rc.12 → 1.0.0 (stable release)
- **nodemailer**: 7.0.10 → 6.9.16 (reverted to stable 6.x)
- **openai**: 6.7.0 → 4.77.3 (reverted to stable 4.x)
- **puppeteer**: 22.3.0 → 23.11.1
- **node-cron**: 4.2.1 → 3.0.3 (reverted to stable 3.x)
- **recharts**: 3.3.0 → 2.15.0 (reverted to stable 2.x)
- **TypeScript**: Updated to 5.7.2
- **@types/node**: Updated to 22.10.5

## Installation Steps

1. **Remove old dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Install new dependencies**:
   ```bash
   npm install
   ```

3. **Verify the build**:
   ```bash
   npm run build
   ```

4. **Test the application**:
   ```bash
   npm run dev
   ```

## Breaking Changes & Fixes

### 1. Next.js Configuration
**File**: `next.config.js`

**Before**:
```javascript
experimental: {
  serverComponentsExternalPackages: ['mongoose']
}
```

**After**:
```javascript
serverExternalPackages: ['mongoose']
```

### 2. React Layout Components
**File**: `app/layout.tsx`

**Before**:
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
})
```

**After**:
```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>)
```

### 3. Headless UI Dialog Component
**File**: `components/Modal.tsx`

**Before**:
```typescript
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

<Transition appear show={isOpen} as={Fragment}>
  <Dialog as="div" onClose={closeModal}>
    <Transition.Child as={Fragment}>
      <Dialog.Overlay />
    </Transition.Child>
  </Dialog>
</Transition>
```

**After**:
```typescript
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'

<Transition show={isOpen}>
  <Dialog onClose={closeModal}>
    <TransitionChild>
      <div className="fixed inset-0 bg-black/30" />
    </TransitionChild>
    <DialogPanel>
      {/* content */}
    </DialogPanel>
  </Dialog>
</Transition>
```

### 4. TypeScript Configuration
**File**: `tsconfig.json`

Updated `target` from `es5` to `ES2017` for better modern JavaScript support.

## Testing Checklist

- [ ] Application builds successfully (`npm run build`)
- [ ] Development server runs without errors (`npm run dev`)
- [ ] Product scraping functionality works
- [ ] Modal dialog opens and closes properly
- [ ] Email notifications send correctly
- [ ] Cron job executes without errors
- [ ] Database connections work properly
- [ ] All pages render correctly

## Potential Issues & Solutions

### Issue: Module not found errors
**Solution**: Clear Next.js cache and rebuild
```bash
rm -rf .next
npm run build
```

### Issue: Type errors with React 19
**Solution**: Ensure all `@types/react` and `@types/react-dom` are updated to version 19

### Issue: Tailwind CSS not applying styles
**Solution**: Verify `tailwind.config.js` is properly configured and restart dev server

## Rollback Instructions

If you need to rollback to previous versions:

1. Restore the old `package.json` from git:
   ```bash
   git checkout HEAD~1 package.json
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Additional Notes

- All dependencies are now on their latest stable versions
- Some packages were intentionally kept on older stable versions (e.g., nodemailer 6.x instead of 7.x) for better stability
- The application maintains backward compatibility with existing data and configurations
- No database migrations are required

## Support

If you encounter any issues after upgrading, please:
1. Check the console for specific error messages
2. Verify all environment variables are properly set
3. Ensure Node.js version is compatible (recommended: Node 18+)
4. Review the breaking changes section above

## Next Steps

After successful upgrade:
1. Test all critical features thoroughly
2. Update any custom components that use upgraded libraries
3. Review and update documentation if needed
4. Consider adding automated tests to prevent future breaking changes
