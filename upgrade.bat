@echo off
echo ========================================
echo PriceWise Dependency Upgrade Script
echo ========================================
echo.

echo Step 1: Backing up package-lock.json...
if exist package-lock.json (
    copy package-lock.json package-lock.json.backup
    echo Backup created: package-lock.json.backup
) else (
    echo No package-lock.json found to backup
)
echo.

echo Step 2: Removing old dependencies...
if exist node_modules (
    echo Removing node_modules folder...
    rmdir /s /q node_modules
    echo node_modules removed
) else (
    echo No node_modules folder found
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
    echo package-lock.json removed
)
echo.

echo Step 3: Installing new dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo.

echo Step 4: Clearing Next.js cache...
if exist .next (
    rmdir /s /q .next
    echo .next cache cleared
)
echo.

echo Step 5: Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Build failed!
    echo You may need to fix some issues before the app works.
    echo Check the error messages above.
    pause
    exit /b 1
)
echo.

echo ========================================
echo Upgrade completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Review UPGRADE_GUIDE.md for any breaking changes
echo 2. Test the application with: npm run dev
echo 3. Verify all features work correctly
echo.
echo To rollback, restore package-lock.json.backup and run npm install
echo.
pause
