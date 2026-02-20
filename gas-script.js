/**
 * Google Apps Script - Backend API for SAR Credentials System
 * 
 * SETUP:
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this entire code into the script editor and click Save.
 * 4. Run the "setupSystem" function once to create the necessary sheets.
 * 5. Deploy > New Deployment > Web App (Execute as: Me, Access: Anyone).
 * 6. Copy the Web App URL and paste it into the 'GOOGLE_SHEET_API_ENDPOINT' variable in your frontend HTML file.
 */

const MAILJET_API_KEY = 'YOUR_MAILJET_API_KEY'; 
const MAILJET_SECRET_KEY = 'YOUR_MAILJET_SECRET_KEY'; 
const SENDER_EMAIL = 'your-verified-sender@example.com'; 
const API_URL = 'https://api.mailjet.com/v3.1/send';
const EXTERNAL_DATA_URL = 'https://bigdata.sukhothai2.go.th/tableSchoolID.php?op=1.5&id=';

function doPost(e) {
  const requestData = JSON.parse(e.postData.contents);
  const { action, data } = requestData;

  if (action === 'processRequest') {
    const result = processRequest(data.schoolId, data.email, data.name, data.phone, data.managerName);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const { action, schoolId } = e.parameter;

  if (action === 'getSchoolInfo') {
    const info = getSchoolInfo(schoolId);
    return ContentService.createTextOutput(JSON.stringify(info)).setMimeType(ContentService.MimeType.JSON);
  }

  // This is for the initial load, which we are not using in a standalone setup.
  // However, it's good to have a default response.
  return ContentService.createTextOutput(JSON.stringify({ message: 'API is active' })).setMimeType(ContentService.MimeType.JSON);
}


/**
 * Run this function ONCE to setup the Google Sheet automatically
 */
function setupSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup SAR_Data
  let dataSheet = ss.getSheetByName('SAR_Data');
  if (!dataSheet) {
    dataSheet = ss.insertSheet('SAR_Data');
    dataSheet.getRange('A1:F1').setValues([['Year', 'SchoolID', 'SchoolName', 'ManagerName', 'Username', 'Password']]);
    dataSheet.getRange('A1:F1').setBackground('#cfe2f3').setFontWeight('bold');
    dataSheet.setFrozenRows(1);
  }
  
  // 2. Setup Request_Logs
  let logSheet = ss.getSheetByName('Request_Logs');
  if (!logSheet) {
    logSheet = ss.insertSheet('Request_Logs');
    logSheet.getRange('A1:H1').setValues([['Timestamp', 'Year', 'SchoolID', 'RequesterName', 'ManagerName', 'Phone', 'Email', 'Status']]);
    logSheet.getRange('A1:H1').setBackground('#d9ead3').setFontWeight('bold');
    logSheet.setFrozenRows(1);
  }
  
  SpreadsheetApp.getUi().alert('ตั้งค่าระบบเรียบร้อยแล้ว! กรุณากรอกข้อมูลในชีท SAR_Data ก่อนใช้งาน');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ ตั้งค่าระบบ')
    .addItem('เริ่มตั้งค่าชีทอัตโนมัติ', 'setupSystem')
    .addToUi();
}

function getSchoolInfo(schoolId) {
  try {
    // 1. Try to get from Sheet first (Priority)
    const sheetInfo = getSchoolInfoFromSheet(schoolId);
    if (sheetInfo.manager) {
      // If manager exists in sheet, return it immediately
      return sheetInfo;
    }

    const response = UrlFetchApp.fetch(EXTERNAL_DATA_URL + schoolId);
    const html = response.getContentText();
    
    // 2. Extract School Name
    const nameRegex = new RegExp(schoolId + '\\s+([^<\\n\\r]+)', 'i');
    const nameMatch = html.match(nameRegex);
    let schoolName = nameMatch ? nameMatch[1].trim() : "";
    schoolName = schoolName.replace(/<[^>]*>/g, '').split(' ')[0];

    // 3. Extract Manager Name (Web Fallback)
    const managerRegex = new RegExp('<h3[^>]*>\\s*((?:นาย|นาง|นางสาว|น\\.ส\\.|ว่าที่ร\\.ต\\.|ดร\\.)[^<]+)</h3>', 'i');
    let managerMatch = html.match(managerRegex);
    let managerName = "";

    if (managerMatch) {
      managerName = managerMatch[1].trim();
    } else {
      const altManagerRegex = new RegExp('(?:นาย|นาง|นางสาว|น\\.ส\\.)\\s*[^<\\s]+\\s+[^<\\s]+(?=[^<]*<br>[^<]*ผู้อำนวยการ)', 'i');
      managerMatch = html.match(altManagerRegex);
      if (managerMatch) managerName = managerMatch[0].trim();
    }

    managerName = managerName.replace(/<[^>]*>/g, '').replace(/\\s+/g, ' ').trim(); 
    
    return { 
      name: schoolName || sheetInfo.name || "ไม่พบชื่อโรงเรียน", 
      manager: managerName 
    };
  } catch (e) {
    return getSchoolInfoFromSheet(schoolId);
  }
}

function getSchoolInfoFromSheet(schoolId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName('SAR_Data');
  if (!dataSheet) return { name: "", manager: "" };
  
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  const managerColIndex = headers.indexOf('ManagerName');
  
  const row = data.slice(1).find(r => String(r[1]) === String(schoolId));
  
  if (row) {
    return { 
      name: row[2], 
      manager: (managerColIndex !== -1 && row[managerColIndex]) ? row[managerColIndex] : "" 
    };
  }
  return { name: "", manager: "" };
}

function processRequest(schoolId, email, name, phone, managerName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName('SAR_Data');
  const logSheet = ss.getSheetByName('Request_Logs');
  
  if (!dataSheet || !logSheet) {
    return { success: false, message: 'ระบบยังไม่ได้ตั้งค่าชีท กรุณากดเมนู "ตั้งค่าระบบ" ใน Google Sheet' };
  }
  
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  const managerColIndex = headers.indexOf('ManagerName');
  
  const rows = data.slice(1);
  const matchIndex = rows.findIndex(row => String(row[1]) === String(schoolId));
  
  if (matchIndex === -1) {
    logSheet.appendRow([new Date(), '', schoolId, name, managerName, phone, email, 'NOT_FOUND']);
    return { success: false, message: 'ไม่พบรหัสโรงเรียน 8 หลักนี้ในระบบ' };
  }
  
  const matchedRow = rows[matchIndex];
  
  if (managerName && managerColIndex !== -1) {
    dataSheet.getRange(matchIndex + 2, managerColIndex + 1).setValue(managerName);
  }
  
  const year = matchedRow[0];
  const username = matchedRow[headers.indexOf('Username')];
  const password = matchedRow[headers.indexOf('Password')];
  
  try {
    const emailSent = sendEmailViaAPI(email, year, username, password);
    if (emailSent) {
      logSheet.appendRow([new Date(), year, schoolId, name, managerName, phone, email, 'SENT']);
      return { success: true, message: 'ระบบได้ส่ง Username และ Password ไปยังอีเมลของท่านแล้ว' };
    } else {
      logSheet.appendRow([new Date(), year, schoolId, name, managerName, phone, email, 'API_ERROR']);
      return { success: false, message: 'เกิดข้อผิดพลาดในการส่งอีเมล' };
    }
  } catch (error) {
    logSheet.appendRow([new Date(), year, schoolId, name, managerName, phone, email, 'ERROR: ' + error.toString()]);
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

function sendEmailViaAPI(recipientEmail, year, username, password) {
  const payload = {
    "Messages": [
      {
        "From": { "Email": SENDER_EMAIL, "Name": "ระบบ SAR" },
        "To": [{ "Email": recipientEmail }],
        "Subject": "Username และ Password ระบบ SAR ปีการศึกษา " + year,
        "TextPart": "ข้อมูลการเข้าใช้งานระบบ SAR ปีการศึกษา " + year + "\nUsername: " + username + "\nPassword: " + password,
        "HTMLPart": "<h3>ข้อมูลการเข้าใช้งานระบบ SAR ปีการศึกษา " + year + "</h3><p>Username: <strong>" + username + "</strong><br>Password: <strong>" + password + "</strong></p>"
      }
    ]
  };

  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': {
      'Authorization': 'Basic ' + Utilities.base64Encode(MAILJET_API_KEY + ':' + MAILJET_SECRET_KEY)
    },
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  const response = UrlFetchApp.fetch(API_URL, options);
  return response.getResponseCode() === 200;
}
