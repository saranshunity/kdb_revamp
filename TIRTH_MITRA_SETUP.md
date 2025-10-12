# Tirth Mitra Card System - Setup Guide

## Overview
A complete Tirth Mitra Card generation system has been implemented with three main screens:
1. **TirthMitraIntroScreen** - Introduction, terms, and instructions
2. **TirthMitraGeneratorScreen** - Form to collect user details
3. **TirthMitraCardScreen** - Display, download, and share the generated card

## Files Created

### 1. TirthMitra Screens
- `/src/screens/tirthMitra/TirthMitraIntroScreen.tsx`
- `/src/screens/tirthMitra/TirthMitraGeneratorScreen.tsx`
- `/src/screens/tirthMitra/TirthMitraCardScreen.tsx`

### 2. Navigation Updates
- Updated `/src/navigation/AppNavigator.tsx` with new routes and types
- Updated `/src/screens/main/ProfileScreen.tsx` to add entry point

## Required NPM Packages

Install these packages to enable full functionality:

```bash
# Required for checkbox
npm install @react-native-community/checkbox

# Required for capturing card as image
npm install react-native-view-shot

# Optional but recommended for full functionality:

# For image picking (photo upload)
npm install react-native-image-picker

# For PDF generation
npm install react-native-pdf react-native-html-to-pdf

# For sharing functionality
npm install react-native-share

# For saving to gallery
npm install @react-native-community/cameraroll
```

## Installation Commands

### iOS
```bash
cd ios
pod install
cd ..
```

### Android
No additional steps required after npm install.

## Features Implemented

### TirthMitraIntroScreen
✅ Hero section with app branding
✅ What is Tirth Mitra Card section
✅ Card validity information
✅ Issued authority details
✅ Benefits & facilities list
✅ Instructions for users
✅ Important notes/warnings
✅ Terms & conditions checkbox
✅ Continue button (enabled only when checkbox is checked)

### TirthMitraGeneratorScreen
✅ Photo upload section
✅ Personal information form
  - Full Name (required)
  - Father's/Husband's Name
  - Date of Birth
  - Gender selection (Male/Female/Other)
✅ Contact information
  - Phone Number (required, 10 digits)
  - Email Address (required, validated)
✅ Address information
  - Complete Address
  - City
  - State
  - Pincode
✅ Form validation
✅ Progress indicator (Step 2 of 3)
✅ Generate Card button

### TirthMitraCardScreen
✅ Success message with icon
✅ Digital card display with:
  - Card header with logo
  - User photo
  - Personal information
  - Auto-generated card number
  - Issue date and expiry date
  - QR code placeholder
  - KDB footer
✅ Download as PDF button
✅ Save as Image button
✅ Share Card button
✅ Next steps instructions

## Card Features

### Card Design
- **Header**: Tirth Mitra branding with logo
- **Photo Section**: User's uploaded photo
- **Information Section**:
  - Full Name
  - Father's/Husband's Name
  - Unique Card Number (format: TM########)
  - Contact Number
  - Issue Date (auto-generated)
  - Valid Until (1 year from issue)
- **Footer**: KDB authority stamp & QR code
- **Styling**: Professional card design with shadow effects

### Card Number Format
- Prefix: `TM` (Tirth Mitra)
- Unique ID: 8-digit timestamp-based number
- Example: `TM12345678`

### Validity
- **Duration**: 1 year from issue date
- **Renewal**: Can be renewed annually
- **Scope**: Valid across all 182 tirthas in Kurukshetra

## Navigation Flow

```
ProfileScreen (Tirth Mitra Tab)
    ↓
TirthMitraIntroScreen (Info + Checkbox)
    ↓ (Checkbox must be checked)
TirthMitraGeneratorScreen (Form)
    ↓ (Form validation)
TirthMitraCardScreen (Display Card)
    ↓
[Download PDF / Save Image / Share]
```

## TODO: Implementation Pending

### Photo Upload
- Integrate `react-native-image-picker`
- Update `handleSelectPhoto()` in TirthMitraGeneratorScreen
- Add image compression/resizing

### PDF Generation
- Integrate PDF library
- Implement `handleDownloadPDF()` in TirthMitraCardScreen
- Generate PDF from card view

### Share Functionality
- Integrate `react-native-share`
- Implement `handleShare()` in TirthMitraCardScreen
- Share card as image or PDF

### Save to Gallery
- Integrate camera roll permissions
- Implement `handleSaveToGallery()` in TirthMitraCardScreen
- Save captured card image

### Logo Asset
- Add actual logo to `/assets/logo.png`
- Update image source in TirthMitraCardScreen

### QR Code
- Generate unique QR code for each card
- Encode card number and validation data
- Display in card footer

## Testing Checklist

- [ ] Terms checkbox enables/disables continue button
- [ ] Form validation works correctly
- [ ] Phone number accepts only 10 digits
- [ ] Email validation works
- [ ] Card displays all information correctly
- [ ] Card number is unique for each generation
- [ ] Dates are formatted correctly
- [ ] All navigation flows work smoothly
- [ ] Photo upload works
- [ ] PDF download works
- [ ] Share functionality works
- [ ] Save to gallery works

## Design Specifications

### Colors
- Primary: AppColor (from theme)
- Success: Green (#4CAF50)
- Warning: Orange (#FF9800)
- Card Background: White (#FFFFFF)
- Card Header: AppColor

### Typography
- Font Family: Gilroy (Bold, SemiBold, Medium, Regular)
- Card Title: Bold, 16px
- Card Info: Regular, 12px
- Headers: Bold, 20-24px

### Card Dimensions
- Width: Full width - 40px margin
- Height: Auto (based on content)
- Border Radius: 16px
- Photo: 100x120px
- Shadow: elevation 8, opacity 0.2

## Support Information

### Helpline
- Number: 1800-XXX-XXXX (to be updated)

### Authority
- Issued by: Kurukshetra Development Board (KDB)
- Government of Haryana

## Next Steps

1. Install required npm packages
2. Add logo asset
3. Implement photo picker
4. Implement PDF generation
5. Implement share functionality
6. Implement save to gallery
7. Add QR code generation
8. Test complete flow
9. Add error handling
10. Add loading states

## Notes

- All screens are fully responsive
- Dark mode compatible (uses theme colors)
- Follows Material Design guidelines
- TypeScript types are properly defined
- No linting errors
- Navigation types are properly configured

