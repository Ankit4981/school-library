/**
 * Google Apps Script: Export Google Drive PDF Books for Viraj School Library
 * 
 * How to use:
 * 1. Open Google Drive (drive.google.com).
 * 2. Click "New" > "More" > "Google Apps Script" (or go to script.google.com and click "New Project").
 * 3. Delete any default code, paste this entire file into the editor.
 * 4. Replace FOLDER_ID below with your Google Drive folder's ID.
 *    (From URL: https://drive.google.com/drive/folders/YOUR_FOLDER_ID)
 * 5. Click the "Run" button at the top (select function 'exportBooksForLibrary').
 * 6. Copy the output printed in the "Execution Log", or open the newly created Google Doc "Library_Books_Import_List".
 * 7. In your School Library app -> Librarian Portal -> click "🚀 Batch Import Drive Links",
 *    paste the list, and click "Run Batch Import"!
 */

function exportBooksForLibrary() {
  // 1. Replace with your Google Drive folder ID:
  var FOLDER_ID = "PASTE_YOUR_FOLDER_ID_HERE";
  
  // Default metadata for these books
  var DEFAULT_AUTHOR = "Educational Press";
  var DEFAULT_CATEGORY = "General"; // e.g. "Academics", "Novels", "Short Stories", "Comics"

  var folder = DriveApp.getFolderById(FOLDER_ID);
  var lines = [];
  
  Logger.log("Scanning folder: " + folder.getName());
  processFolder(folder, lines, DEFAULT_AUTHOR, DEFAULT_CATEGORY);
  
  var resultText = lines.join("\n");
  Logger.log("\n=== FOUND " + lines.length + " BOOKS ===\n");
  Logger.log(resultText);
  
  // Also create a Google Doc with the list so it's easy to copy
  var doc = DocumentApp.create("Library_Books_Import_List_" + folder.getName());
  doc.getBody().setText(resultText);
  Logger.log("Export complete! You can also copy from the Google Doc: " + doc.getUrl());
}

function processFolder(folder, lines, defaultAuthor, defaultCategory) {
  var files = folder.getFilesByType(MimeType.PDF);
  while (files.hasNext()) {
    var file = files.next();
    
    // Ensure file is accessible via link
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
      // Permission might be managed by organization
    }
    
    var fileName = file.getName();
    // Clean up filename: remove .pdf extension and clean dashes/underscores
    var cleanTitle = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim();
    var viewUrl = "https://drive.google.com/file/d/" + file.getId() + "/view";
    
    // Format: Title | Link | Author | Category
    lines.push(cleanTitle + " | " + viewUrl + " | " + defaultAuthor + " | " + defaultCategory);
  }
  
  // Recursively process any subfolders
  var subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    var sub = subfolders.next();
    // Subfolder name can optionally be used as the Category!
    var category = sub.getName() || defaultCategory;
    processFolder(sub, lines, defaultAuthor, category);
  }
}
