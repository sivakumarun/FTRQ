// Configuration
const DATA_ENTRY_SHEET_NAME = "Sheet1";
const MASTER_DATA_SHEET_NAME = "Sheet2";
const TIME_STAMP_COLUMN_NAME = "Timestamp";
const MATCH_STATUS_COLUMN_NAME = "MatchStatus";

var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var sheet1 = spreadsheet.getSheetByName(DATA_ENTRY_SHEET_NAME);
var sheet2 = spreadsheet.getSheetByName(MASTER_DATA_SHEET_NAME);

/**
 * Handle GET requests - for PAN validation and data retrieval
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'validatePAN') {
      return validatePAN(e.parameter.pan);
    } else if (action === 'getMasterData') {
      return getMasterData(e.parameter.pan);
    } else if (action === 'getSubmissionData') {
      return getSubmissionData(e.parameter.applicationNo);
    }
    
    return createJSONResponse({
      success: false,
      message: 'Invalid action'
    });
  } catch (error) {
    return createJSONResponse({
      success: false,
      message: error.toString()
    });
  }
}

/**
 * Handle POST requests - for form submission
 */
function doPost(request = {}) {
  try {
    const { postData: { contents, type } = {} } = request;
    var data = parseFormData(contents);
    
    // Try to validate PAN and calculate match status (optional)
    const panValidation = validatePANInternal(data.pan);
    if (panValidation.success) {
      // PAN found - calculate match status
      const matchResult = calculateMatchStatus(data, panValidation.data);
      data[MATCH_STATUS_COLUMN_NAME] = matchResult.score + '%';
    } else {
      // PAN not found - still save data but mark as not validated
      data[MATCH_STATUS_COLUMN_NAME] = 'Not Validated';
    }
    
    // Always append to Sheet1 (regardless of PAN validation)
    appendToGoogleSheet(data);
    
    return createJSONResponse({
      success: true,
      message: 'Form submitted successfully',
      panValidated: panValidation.success,
      matchScore: panValidation.success ? data[MATCH_STATUS_COLUMN_NAME] : 'N/A'
    });
  } catch (error) {
    return createJSONResponse({
      success: false,
      message: error.toString()
    });
  }
}

/**
 * Validate PAN and return master data (for external calls)
 */
function validatePAN(pan) {
  const result = validatePANInternal(pan);
  return createJSONResponse(result);
}

/**
 * Internal PAN validation function
 */
function validatePANInternal(pan) {
  if (!pan || pan.trim() === '') {
    return {
      success: false,
      message: 'PAN is required'
    };
  }
  
  const panUpper = pan.toUpperCase().trim();
  const data = sheet2.getDataRange().getValues();
  const headers = data[0];
  
  // Find PAN column index
  const panIndex = headers.indexOf('pan');
  if (panIndex === -1) {
    return {
      success: false,
      message: 'PAN column not found in master data'
    };
  }
  
  // Search for PAN in Sheet2
  for (let i = 1; i < data.length; i++) {
    if (data[i][panIndex] && data[i][panIndex].toString().toUpperCase().trim() === panUpper) {
      // Found! Return the master data
      const masterRecord = {};
      headers.forEach((header, index) => {
        masterRecord[header] = data[i][index];
      });
      
      return {
        success: true,
        data: masterRecord,
        message: 'PAN found in master data'
      };
    }
  }
  
  // Not found
  return {
    success: false,
    message: 'PAN details not found / No customer records found'
  };
}

/**
 * Get master data for a specific PAN
 */
function getMasterData(pan) {
  const result = validatePANInternal(pan);
  return createJSONResponse(result);
}

/**
 * Get submission data for a specific application number
 */
function getSubmissionData(applicationNo) {
  try {
    const data = sheet1.getDataRange().getValues();
    const headers = data[0];
    const appNoIndex = headers.indexOf('applicationNo');
    
    // Log for debugging
    Logger.log('Looking for applicationNo: ' + applicationNo);
    Logger.log('Headers: ' + headers.join(', '));
    Logger.log('applicationNo column index: ' + appNoIndex);
    
    if (appNoIndex === -1) {
      return createJSONResponse({
        success: false,
        message: 'applicationNo column not found. Available columns: ' + headers.join(', ')
      });
    }
    
    // Search for application number (convert to string for comparison)
    const searchAppNo = String(applicationNo);
    for (let i = data.length - 1; i >= 1; i--) { // Start from end to get latest
      const rowAppNo = String(data[i][appNoIndex]);
      
      if (rowAppNo === searchAppNo) {
        const submissionRecord = {};
        headers.forEach((header, index) => {
          submissionRecord[header] = data[i][index];
        });
        
        Logger.log('Found matching record at row ' + i);
        return createJSONResponse({
          success: true,
          data: submissionRecord
        });
      }
    }
    
    // Not found - return helpful debug info
    const allAppNos = [];
    for (let i = 1; i < Math.min(data.length, 6); i++) {
      allAppNos.push(String(data[i][appNoIndex]));
    }
    
    return createJSONResponse({
      success: false,
      message: 'Application number not found. Searched for: ' + searchAppNo + '. Recent entries: ' + allAppNos.join(', ')
    });
  } catch (error) {
    return createJSONResponse({
      success: false,
      message: error.toString()
    });
  }
}

/**
 * Calculate match status between submitted data and master data
 */
function calculateMatchStatus(submittedData, masterData) {
  const mismatches = [];
  let totalFields = 0;
  let matchedFields = 0;
  
  // Fields to exclude from comparison
  const excludeFields = ['leadRefNo', 'applicationNo', 'appCodeInput', 'Timestamp', 'MatchStatus', 'userID', 'submissionTime'];
  
  // Compare each field in master data
  for (const field in masterData) {
    // Skip excluded fields and empty master data fields
    if (excludeFields.includes(field) || !masterData[field] || masterData[field].toString().trim() === '') {
      continue;
    }
    
    totalFields++;
    const masterValue = normalizeValue(masterData[field]);
    const submittedValue = normalizeValue(submittedData[field]);
    
    if (masterValue === submittedValue) {
      matchedFields++;
    } else {
      // Calculate similarity for partial credit
      const similarity = calculateSimilarity(masterValue, submittedValue);
      if (similarity > 0.8) { // 80% similar gets partial credit
        matchedFields += similarity;
      }
      
      mismatches.push({
        field: field,
        expected: masterData[field],
        actual: submittedData[field] || '(empty)',
        similarity: Math.round(similarity * 100)
      });
    }
  }
  
  const score = totalFields > 0 ? Math.round((matchedFields / totalFields) * 100) : 0;
  
  return {
    score: score,
    totalFields: totalFields,
    matchedFields: Math.round(matchedFields),
    mismatches: mismatches
  };
}

/**
 * Normalize value for comparison
 */
function normalizeValue(value) {
  if (value === null || value === undefined) return '';
  return value.toString().trim().toLowerCase();
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Parse form data from POST request
 */
function parseFormData(postData) {
  var data = [];
  var parameters = postData.split('&');
  for (var i = 0; i < parameters.length; i++) {
    var keyValue = parameters[i].split('=');
    data[keyValue[0]] = decodeURIComponent(keyValue[1]);
  }
  return data;
}

/**
 * Append data to Google Sheet
 */
function appendToGoogleSheet(data) {
  if (TIME_STAMP_COLUMN_NAME !== "") {
    data[TIME_STAMP_COLUMN_NAME] = new Date();
  }
  
  var headers = sheet1.getRange(1, 1, 1, sheet1.getLastColumn()).getValues()[0];
  
  // Check if any new fields need to be added to headers
  var newHeaders = [];
  for (var key in data) {
    if (headers.indexOf(key) === -1) {
      // This is a new field, add it to headers
      newHeaders.push(key);
    }
  }
  
  // Add new headers if any
  if (newHeaders.length > 0) {
    var lastCol = sheet1.getLastColumn();
    for (var i = 0; i < newHeaders.length; i++) {
      sheet1.getRange(1, lastCol + i + 1).setValue(newHeaders[i]);
      headers.push(newHeaders[i]);
    }
    Logger.log('Added new headers: ' + newHeaders.join(', '));
  }
  
  // Map data to row based on headers
  var rowData = headers.map(headerFld => data[headerFld] || '');
  sheet1.appendRow(rowData);
}

/**
 * Create JSON response
 */
function createJSONResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
