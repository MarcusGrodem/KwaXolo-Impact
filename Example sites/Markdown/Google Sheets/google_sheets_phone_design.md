# Google Sheets — Phone UI Design Reference

## Overview
Google Sheets is a spreadsheet app for creating, editing, and sharing tables on Android phones. This reference focuses on the Android mobile app flow from fresh install to making a first spreadsheet, with simple touch-based actions suitable for beginner learners.

## Brand Colours
- Primary: #0F9D58
- Background: #FFFFFF
- Text: #202124

## Key Screens

**Home screen** — starting point for recent files and creating new sheets  
- Google Sheets logo/title  
- Search field: **Search apps & games** is for Play Store only; in Sheets use in-app search if shown  
- **+** button for creating files  
- File list with spreadsheet names  
- Menu icons such as **More options**

**Google Sheets home** — app landing screen after opening Sheets  
- **+** create button  
- Recent documents list  
- Folder/file rows with spreadsheet names  
- Top app bar with Google Sheets title  
- Overflow menu: **More options**

**New spreadsheet** — choose a blank file to start data entry  
- Option label: **New spreadsheet**  
- Template/creation menu from the **+** button  
- Back arrow  
- File creation area  
- Confirmation that a new spreadsheet opens automatically

**Blank spreadsheet** — empty sheet for first entry  
- Default title: **Untitled spreadsheet**  
- Grid cells with row numbers and column letters  
- Top toolbar with formatting/edit controls  
- **More options** (three-dot menu)  
- Sheet area ready for typing

**Spreadsheet grid** — main editing view for entering data  
- Tappable cells in the grid  
- Formula/input bar when a cell is selected  
- Toolbar buttons for edit and format actions  
- Row and column headers  
- **Done** when finishing text or formula entry

**Sheet tabs** — switch between worksheets in the same file  
- Bottom or lower-area tab labels for sheets  
- Current sheet highlighted  
- Add new sheet control if present  
- Scrollable tab strip  
- Sheet name labels such as **Summary sheet**

**Summary sheet** — second sheet for totals and results  
- Sheet tab label: **Summary sheet**  
- Cells for summary labels and values  
- Formula entry area for calculations  
- Grid with selected cell highlight  
- Back navigation to return to the file list

## First-Time User Flow
1. **android_home** — open the phone home screen.
2. **play_store_search** — tap **Search apps & games**.
3. **play_store_app** — choose **Google Sheets** from results.
4. **play_store_app** — tap **Install** or open the app after install.
5. **generic** — open **Google Sheets** home.
6. **generic** — tap **+**.
7. **generic** — select **New spreadsheet**.
8. **sheets_blank** — first blank spreadsheet opens.
9. **generic** — rename the file from the default title if needed.
10. **sheets_data** — tap a cell and enter data.
11. **generic** — use **More options** or **Sheet tabs** to move between sheets.
12. **sheets_blank** — create/open **Summary sheet**.
13. **sheets_data** — enter a formula or total and confirm with **Done**.

## Common UI Patterns
- **+** button: create a new spreadsheet
- **More options**: three-dot overflow menu for extra actions
- Sheet tabs: switch between sheets such as **Summary sheet**
- Grid layout: row numbers and column letters for cell navigation
- Tap-to-edit cells: select a cell to type data or formulas
- Top app bar: file title and action icons
- Back arrow: return to previous screen
- **Done**: confirm text, number, or formula entry