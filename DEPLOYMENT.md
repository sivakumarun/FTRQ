# QDE Form Enhancement - Deployment Guide

## 🎯 Overview

This enhancement adds:
- ✅ User authentication (9-digit User ID + "Pass@123")
- ✅ PAN validation against Google Sheets master data
- ✅ User tracking in form submissions
- ✅ Accuracy report card with field-level comparison

## 📋 Prerequisites

1. Google Account with access to Google Sheets
2. The existing Google Sheets with your form data
3. Basic knowledge of Google Apps Script

## 🚀 Deployment Steps

### Step 1: Set Up Google Sheets

1. **Open your existing Google Sheets** that contains the form responses
2. **Verify Sheet1** has these columns (should already exist):
   - All your existing form fields
   - `leadRefNo`, `applicationNo`, `appCodeInput`, `Timestamp`, `MatchStatus`

3. **Create Sheet2** (Master Data):
   - Create a new sheet named exactly "Sheet2"
   - Add the same column headers as Sheet1, EXCEPT:
     - Do NOT include: `leadRefNo`, `applicationNo`, `appCodeInput`, `Timestamp`, `MatchStatus`, `userID`, `submissionTime`
   - Add your master data rows (50-100 test users)
   - **IMPORTANT**: Make sure the `pan` column has unique PAN numbers for each user

### Step 2: Deploy Google Apps Script

1. In your Google Sheets, click **Extensions** → **Apps Script**
2. **Delete any existing code** in the editor
3. **Copy the entire content** from `google-apps-script/Code.gs`
4. **Paste it** into the Apps Script editor
5. **Save** the project (Ctrl+S or File → Save)
6. Click **Deploy** → **New deployment**
7. Click the gear icon ⚙️ next to "Select type"
8. Choose **Web app**
9. Configure the deployment:
   - **Description**: "QDE Form API v1"
   - **Execute as**: Me
   - **Who has access**: Anyone
10. Click **Deploy**
11. **Authorize** the script (you may see a warning - click "Advanced" → "Go to [your project]")
12. **COPY THE WEB APP URL** - you'll need this!

### Step 3: Update Frontend Code

1. **Open `qdeform.html`** in your code editor
2. Find line 711 (near the top of the `<script>` section):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA29vURSVA7n5TTnlxxtC43tCEtotSoLDfmC3ZwM_YLcR6vUQkrbD49viZs4DBHjja/exec';
   ```
3. **Replace the URL** with your new Web App URL from Step 2
4. **Save the file**

5. **Open `reportcard.js`** in your code editor
6. Find line 2:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA29vURSVA7n5TTnlxxtC43tCEtotSoLDfmC3ZwM_YLcR6vUQkrbD49viZs4DBHjja/exec';
   ```
7. **Replace the URL** with your new Web App URL
8. **Save the file**

### Step 4: Test the Application

1. **Start your local server**:
   ```bash
   npm run start
   ```

2. **Test Login** (http://127.0.0.1:8080/index.html):
   - User ID: `123456789` (any 9 digits)
   - Password: `Pass@123`
   - ❌ Try wrong credentials to verify validation works

3. **Test PAN Validation**:
   - Navigate to the QDE form
   - Enter a PAN from your Sheet2 master data
   - Click "PAN Dedupe"
   - ✅ Should show success message with customer name
   - ❌ Try an invalid PAN to verify error handling

4. **Test Form Submission**:
   - Fill out the form completely
   - Make some intentional mistakes (wrong spelling, wrong data)
   - Submit the form
   - Should redirect to report card

5. **Test Report Card**:
   - Verify accuracy score is displayed
   - Check field comparison table
   - Verify mismatches are highlighted in red
   - Check that errors are listed

## 📊 Sample Master Data Format

Here's an example row for Sheet2:

| salutation | firstName | lastName | dob | pan | motherName | nationality | houseNo | locality | pinCode | mobileNumber | emailText | selectDomain | occupationType | ... |
|------------|-----------|----------|-----|-----|------------|-------------|---------|----------|---------|--------------|-----------|--------------|----------------|-----|
| ms | SIVAKUMAR | KOTIPATRUNI | 2025-06-23 | CYLPK1428D | KRISHNAVENI | indian | 4-46 | main road, kesavarao peta | 532402 | 9100060276 | sivakumarun | gmail.com | salaried | ... |

**Tips for Master Data**:
- Leave fields blank if you don't want them validated
- Only non-empty fields in master data will be compared
- Use exact spelling and formatting for best accuracy scores

## 🔧 Troubleshooting

### PAN Validation Not Working
- Check that Sheet2 exists and has the correct name
- Verify the `pan` column exists in Sheet2
- Check browser console for errors
- Verify Google Apps Script URL is correct

### Report Card Shows Error
- Check that the Google Apps Script is deployed as "Anyone" can access
- Verify the application number exists in Sheet1
- Check browser console for network errors

### Login Not Working
- User ID must be exactly 9 numeric digits
- Password must be exactly "Pass@123" (case-sensitive)
- Clear browser cache and try again

## 🎨 Customization

### Change Login Credentials
Edit `index.html`, line ~562:
```javascript
if (!/^\d{9}$/.test(userID)) {  // Change regex for different format
if (mpin !== 'Pass@123') {      // Change password here
```

### Modify Accuracy Scoring
Edit `google-apps-script/Code.gs`, function `calculateMatchStatus()` to adjust:
- Similarity threshold (currently 80%)
- Scoring algorithm
- Fields to exclude from comparison

### Customize Report Card Colors
Edit `reportcard.css` to change:
- Score circle colors (lines 88-95)
- Performance message colors (lines 160-180)
- Table styling (lines 220-260)

## 📝 Notes

- **User IDs**: Currently any 9-digit number works. For production, implement proper user management
- **Security**: The password is hardcoded. For production, use proper authentication
- **Performance**: Large datasets may slow down comparison. Consider pagination for Sheet2
- **Browser Support**: Tested on Chrome, Firefox, Edge. IE not supported.

## 🆘 Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check Google Apps Script execution logs
3. Verify all URLs are updated correctly
4. Ensure Sheet2 has the correct structure

## ✅ Verification Checklist

- [ ] Sheet2 created with master data
- [ ] Google Apps Script deployed
- [ ] Web App URL updated in `qdeform.html`
- [ ] Web App URL updated in `reportcard.js`
- [ ] Login works with 9-digit ID and Pass@123
- [ ] PAN validation works
- [ ] Form submission includes user ID
- [ ] Report card displays correctly
- [ ] Accuracy scoring works
- [ ] Field comparison table shows all fields

---

**Version**: 1.0  
**Last Updated**: January 2026
