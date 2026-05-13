# 🚀 Citizen Resolver System - Feature Testing Guide

## Live Server

Your app is running on **http://127.0.0.1:5178/**

---

## ✨ **Feature 1: Prominent Heading**

**Where to see it:** Home page

- Large "Citizen Resolver System" heading with gradient background
- Enhanced typography and spacing
- Professional branding with ✓ icon in navbar
- Try: Click "Home" button in navigation

---

## 📍 **Feature 2: Location Selection (City > Block > Area)**

**Where to use it:** Login/Signup page

### How it works:

1. Go to **"Login / Signup"** tab
2. Fill in your details
3. You'll see **3 new dropdown fields:**
   - **City** - Select from "Mysore" or "Bangalore"
   - **Block** - Appears only after city selection
   - **Area** - Appears only after block selection

### Example flow:

```
Mysore → Vijayanagar → Stage 1 (or Stage 2, 3, 4, 5)
Mysore → Jayanagar → East (or West, North, South)
Bangalore → Whitefield → Phase 1 (or Phase 2, 3)
```

Try: Select Mysore → Vijayanagar → Stage 2, then login

---

## ✅ **Feature 3: Authentication Validation & Error/Success Messages**

**Where to see it:** Login/Signup page

### Success Message:

1. Go to **"Login / Signup"**
2. Click **"Admin demo"** button (auto-fills admin email)
3. Select location: Mysore → Vijayanagar → Stage 1
4. Role should be set to "admin"
5. Click **"Continue"**
6. ✅ **Green success box** appears: "Welcome! Signed in successfully"

### Error Message:

1. Go to **"Login / Signup"**
2. Leave **Area** empty (don't select it)
3. Click **"Continue"**
4. ❌ **Red error box** appears: "Location details are required"
5. Another validation shows at the bottom of the form

Try both:

- Missing name on signup
- Missing email
- Missing location selection

---

## 📬 **Feature 4: Notification Box (Bottom-Right)**

**Where to see it:** Appears when you:

- Successfully login/signup
- See validation errors during auth
- Submit an issue
- Receive system updates

The notification box:

- Slides in from bottom-right
- Shows colored background (green for success, red for error)
- Has an X button to close manually
- Auto-dismisses after interaction

Try: Login successfully and watch the notification appear!

---

## 👤 **Feature 5: Citizen Dashboard (Read-Only)**

**How to access:** Login as a citizen and click "Dashboard"

1. Go to **"Login / Signup"**
2. Click **"Citizen demo"** button
3. Select location: Mysore → Vijayanagar → Stage 1
4. Role: "citizen"
5. Click **"Continue"**
6. Click **"Dashboard"** in the top navigation

### What you'll see:

- **4 stat cards:** Total Issues, Pending, In Progress, Resolved
- **"My Issues"** section: Shows only YOUR reported issues
- **"Latest Updates"** sidebar: Shows notifications/updates for your issues
- Click any notification to mark it as read
- **Read-only view** - You can't edit anything, just view your issues

---

## 👨‍💼 **Feature 6: Admin Dashboard (Full Control)**

**How to access:** Login as admin and click "Dashboard"

1. Go to **"Login / Signup"**
2. Click **"Admin demo"** button
3. Select location: Mysore → Vijayanagar → Stage 1
4. Role: "admin"
5. Click **"Continue"**
6. Click **"Dashboard"** in the top navigation

### What you can do:

- **Analytics:** View system-wide stats (Pending, Active, Resolved, Urgent)
- **Issue Queue:** See ALL issues in a table with:
  - Issue ID and title
  - Area and Department
  - Current Status
  - Assigned labour
  - Last updated date
- **Update Assignment:**
  - Select an issue from dropdown
  - Change department
  - Assign labour worker
  - Change status
  - Add admin notes
  - Click "Save update"

- **Manage Master Data:**
  - Add new areas with zone info
  - Add new departments with lead info
  - Add new labour with department assignment

---

## 🔄 **Feature 7: Dynamic Dashboard Navigation**

**Where to see it:** The "Dashboard" button in navigation

The dashboard automatically shows:

- **Citizen view** if you're logged in as a citizen (read-only)
- **Admin view** if you're logged in as an admin (full control)

Try: Login as citizen, go to dashboard. Then logout and login as admin - notice the dashboard changes!

---

## 📋 **How to Test Everything in Sequence**

### Test Flow 1: New Citizen Journey

```
1. Home page → See prominent "Citizen Resolver System" heading
2. Login/Signup → Fill form with location selection
3. See success notification
4. Dashboard → View your dashboard (citizen view)
5. Report Issue → Submit a new issue
6. My Issues → See your reported issues
```

### Test Flow 2: Admin Management

```
1. Home page
2. Login → Select admin account + location
3. See success notification
4. Dashboard → See admin controls
5. Update an issue status
6. Assign labour to an issue
7. Add a new area (master data)
```

### Test Flow 3: Location Validation

```
1. Login/Signup
2. Try selecting:
   - Just city (block dropdown disabled)
   - City + block (area dropdown disabled)
   - All three (fully enabled)
3. Try submitting with incomplete location (see error)
```

---

## 🎯 **Key Testing Scenarios**

| Scenario                     | Expected Result                                |
| ---------------------------- | ---------------------------------------------- |
| Select city without block    | Block dropdown shows but is disabled           |
| Select block without area    | Area dropdown shows but is disabled            |
| Submit form without location | Red error: "Location details are required"     |
| Successful citizen login     | Green success notification + citizen dashboard |
| Successful admin login       | Green success notification + admin dashboard   |
| Click notification X button  | Notification disappears                        |
| View citizen dashboard       | See only personal issues + read-only interface |
| View admin dashboard         | See all issues + full management controls      |
| Update issue as admin        | Issue status updates in the queue              |

---

## 💡 **Tips**

- The **demo buttons** on the login page auto-fill the email field for quick testing
- The **location selectors are cascading** - you must select in order: City → Block → Area
- **Citizens see only their issues**, admins see all
- **Success/error messages** appear in both the main container AND as floating notifications
- All **form validation** is real-time and prevents submission of incomplete forms

---

## 📝 **Demo Accounts**

- **Citizen Account:** aarav@example.com (role: citizen)
- **Admin Account:** admin@helpline.local (role: admin)
- **Location:** Can select any: Mysore or Bangalore, any block, any area

Enjoy! 🎉
