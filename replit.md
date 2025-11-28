# Haajari App - Labour Attendance Manager

## Overview
A mobile-first Expo React Native application for managing labour attendance and payments at construction sites. The app supports multiple worker categories, daily attendance tracking with color-coded cells, payment calculations, and multi-language support (English and Hindi).

## Current State
- **Version:** 1.0.0
- **Status:** MVP Complete
- **Last Updated:** November 2025

## Tech Stack
- **Framework:** React Native with Expo SDK 54
- **Navigation:** React Navigation 7+
- **Storage:** AsyncStorage for offline data persistence
- **Styling:** React Native StyleSheet with custom theme system
- **Animations:** React Native Reanimated

## Key Features
1. **Authentication:** Email/password login with remember me functionality
2. **Worker Management:** Add, edit, delete workers with categories (Labour, Bai, Mistri, Bandkam, Plaster, Tiles, Sutar)
3. **Attendance Grid:** Spreadsheet-style grid with dates as columns and workers as rows
4. **Attendance Marking:** P (Present), A (Absent), 1/2 (Half Day), or custom amounts
5. **Color Coding:** Green=Present, Red=Absent, Yellow=Half Day, Blue=Amount
6. **Payment Summary:** Auto-calculation of days worked and total payment per worker
7. **Multi-Language:** English and Hindi support with easy switching
8. **Offline-First:** All data persisted locally with AsyncStorage

## Project Architecture

### Screens
- `LoginScreen.tsx` - Authentication with language selector
- `AttendanceScreen.tsx` - Main attendance grid with month selector
- `WorkersScreen.tsx` - Worker list with FAB for adding
- `AddWorkerScreen.tsx` - Add/Edit worker modal
- `SummaryScreen.tsx` - Monthly payment summary
- `SettingsScreen.tsx` - Language, profile, logout

### Navigation
- `RootNavigator.tsx` - Auth flow (Login vs Main)
- `MainTabNavigator.tsx` - Tab navigation + modal stack

### Data Storage
- `utils/storage.ts` - AsyncStorage wrapper for workers, attendance, settings

### Internationalization
- `constants/i18n/en.json` - English translations
- `constants/i18n/hi.json` - Hindi translations
- `hooks/useLanguage.ts` - Language context and hook

### Theme
- `constants/theme.ts` - Colors, spacing, typography, shadows
- Orange (#FF6B35) and Dark Blue (#1E3A5F) primary colors

## User Preferences
- Mobile-first responsive design
- Construction site theme with hard hat icon
- Touch-friendly 56dp cell sizes
- Haptic feedback on interactions

## Demo Credentials
- Any email with password length >= 4 characters works
- Example: admin@haajari.com / 1234
