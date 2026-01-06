// Configuration
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoKZZQcjj-fEQLUQ1LQMp_3YtY80J-cTmmrRqoXbQ83Y9Kbb2mXq706EaVE1GLYlWQPA/exec';

// Field name mapping for better display
const FIELD_LABELS = {
    salutation: 'Salutation',
    firstName: 'First Name',
    middleName: 'Middle Name',
    lastName: 'Last Name',
    dob: 'Date of Birth',
    nameOnPan: 'Name on PAN',
    manualVip: 'Manual VIP Tag',
    pan: 'PAN Number',
    form60: 'Form 60',
    vvipCategory: 'VVIP Category',
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    nationality: 'Nationality',
    houseNo: 'House Number',
    locality: 'Locality/Society',
    addressLine2: 'Address Line 2',
    pinCode: 'PIN Code',
    oclPolicy: 'OCL Policy Deviation',
    residenceCity: 'Residence City',
    stdCode2: 'STD Code',
    mobileNumber: 'Mobile Number',
    residencePhone: 'Residence Phone',
    emailText: 'Email Text',
    selectDomain: 'Email Domain',
    ckycId: 'CKYC ID',
    occupationType: 'Occupation Type',
    companyName2: 'Company Name',
    designation2: 'Designation',
    officeEmail: 'Office Email',
    selectDocument: 'Document Type',
    selectBank: 'Bank Name',
    branchCode: 'Branch Code',
    qdeBank: 'QDE Bank Name',
    accountNumber: 'Account Number',
    selectZone: 'Zone',
    onBehalf: 'On Behalf Of',
    seCode: 'SE Code'
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', async function () {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const applicationNo = urlParams.get('applicationNo');
    const leadRefNo = urlParams.get('leadRefNo');
    const userID = urlParams.get('userID');

    // Validate parameters
    if (!applicationNo || !leadRefNo || !userID) {
        showError('Missing required parameters. Please submit the form again.');
        return;
    }

    // Display basic info
    document.getElementById('applicationNo').textContent = applicationNo;
    document.getElementById('userID').textContent = userID;

    // Fetch and compare data
    await fetchAndCompareData(applicationNo);
});

/**
 * Fetch submission and master data, then compare
 */
async function fetchAndCompareData(applicationNo) {
    try {
        // Fetch submission data
        const submissionResponse = await fetch(
            `${GOOGLE_SCRIPT_URL}?action=getSubmissionData&applicationNo=${encodeURIComponent(applicationNo)}`
        );
        const submissionResult = await submissionResponse.json();

        if (!submissionResult.success || !submissionResult.data) {
            showError('Unable to retrieve submission data. Please try again later.');
            return;
        }

        const submissionData = submissionResult.data;

        // Display submission time
        if (submissionData.Timestamp) {
            const timestamp = new Date(submissionData.Timestamp);
            document.getElementById('submissionTime').textContent = timestamp.toLocaleString();
        }

        // Fetch master data using PAN
        const pan = submissionData.pan;
        const masterResponse = await fetch(
            `${GOOGLE_SCRIPT_URL}?action=getMasterData&pan=${encodeURIComponent(pan)}`
        );
        const masterResult = await masterResponse.json();

        if (!masterResult.success || !masterResult.data) {
            showError('Unable to retrieve master data for comparison.');
            return;
        }

        const masterData = masterResult.data;

        // Compare data
        const comparison = compareData(submissionData, masterData);

        // Display results
        displayResults(comparison);

    } catch (error) {
        console.error('Error fetching data:', error);
        showError('An error occurred while loading the report. Please check your internet connection and try again.');
    }
}

/**
 * Compare submission data with master data
 */
function compareData(submissionData, masterData) {
    const mismatches = [];
    let totalFields = 0;
    let matchedFields = 0;
    let partialMatches = 0;

    // Fields to exclude from comparison
    const excludeFields = ['leadRefNo', 'applicationNo', 'appCode', 'Timestamp', 'MatchStatus', 'userID', 'submissionTime'];

    // Compare each field in master data
    for (const field in masterData) {
        // Skip excluded fields and empty master data fields
        if (excludeFields.includes(field) || !masterData[field] || masterData[field].toString().trim() === '') {
            continue;
        }

        totalFields++;
        const masterValue = normalizeValue(masterData[field]);
        const submittedValue = normalizeValue(submissionData[field]);

        if (masterValue === submittedValue) {
            matchedFields++;
            mismatches.push({
                field: field,
                fieldLabel: FIELD_LABELS[field] || field,
                expected: masterData[field],
                actual: submissionData[field] || '(empty)',
                status: 'match',
                similarity: 100
            });
        } else {
            // Calculate similarity for partial credit
            const similarity = calculateSimilarity(masterValue, submittedValue);
            const similarityPercent = Math.round(similarity * 100);

            if (similarity > 0.8) { // 80% similar gets partial credit
                matchedFields += similarity;
                partialMatches++;
            }

            mismatches.push({
                field: field,
                fieldLabel: FIELD_LABELS[field] || field,
                expected: masterData[field],
                actual: submissionData[field] || '(empty)',
                status: similarityPercent >= 80 ? 'partial' : 'mismatch',
                similarity: similarityPercent
            });
        }
    }

    const score = totalFields > 0 ? Math.round((matchedFields / totalFields) * 100) : 0;

    return {
        score: score,
        totalFields: totalFields,
        matchedFields: Math.floor(matchedFields),
        partialMatches: partialMatches,
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
 * Display results on the page
 */
function displayResults(comparison) {
    // Hide loading, show content
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('reportContent').style.display = 'block';

    // Display score
    document.getElementById('scoreValue').textContent = comparison.score + '%';
    document.getElementById('fieldsMatched').textContent =
        `${comparison.matchedFields} / ${comparison.totalFields}`;

    // Display grade with color
    const gradeElement = document.getElementById('grade');
    let gradeName = '';
    let gradeColor = '';

    if (comparison.score > 80) {
        gradeName = 'GREEN';
        gradeColor = '#28a745';
    } else if (comparison.score >= 60) {
        gradeName = 'AMBER';
        gradeColor = '#ff9800';
    } else {
        gradeName = 'RED';
        gradeColor = '#dc3545';
    }

    gradeElement.textContent = gradeName;
    gradeElement.style.color = gradeColor;
    gradeElement.style.fontWeight = '700';

    // Also color the score percentage to match the grade
    const scoreValueElement = document.getElementById('scoreValue');
    scoreValueElement.style.color = gradeColor;

    // Color code the score circle - Red/Amber/Green grading
    const scoreCircle = document.getElementById('scoreCircle');
    if (comparison.score > 80) {
        // Green - Excellent
        scoreCircle.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    } else if (comparison.score >= 60) {
        // Amber - Needs Improvement
        scoreCircle.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
    } else {
        // Red - Poor
        scoreCircle.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
    }

    // Display performance message
    const performanceMessage = document.getElementById('performanceMessage');
    if (comparison.score > 80) {
        performanceMessage.className = 'performance-message excellent';
        performanceMessage.textContent = '🟢 Excellent! Your data entry is highly accurate.';
    } else if (comparison.score >= 60) {
        performanceMessage.className = 'performance-message average';
        performanceMessage.textContent = '🟡 Needs Improvement. Please review the errors below.';
    } else {
        performanceMessage.className = 'performance-message poor';
        performanceMessage.textContent = '🔴 Poor Performance. Please carefully review all fields.';
    }

    // Populate comparison table - SHOW ALL FIELDS
    const tableBody = document.getElementById('comparisonTableBody');
    tableBody.innerHTML = '';

    comparison.mismatches.forEach(mismatch => {
        const row = document.createElement('tr');

        let statusBadge = '';
        let statusIcon = '';
        if (mismatch.status === 'match') {
            statusBadge = 'status-match';
            statusIcon = '✅ Match';
        } else if (mismatch.status === 'partial') {
            statusBadge = 'status-partial';
            statusIcon = '⚠️ Partial';
        } else {
            statusBadge = 'status-mismatch';
            statusIcon = '❌ Mismatch';
        }

        row.innerHTML = `
      <td class="field-name">${mismatch.fieldLabel}</td>
      <td class="expected-value">${mismatch.expected}</td>
      <td class="actual-value">${mismatch.actual}</td>
      <td><span class="status-badge ${statusBadge}">${statusIcon}</span></td>
      <td class="similarity-score">${mismatch.similarity}%</td>
    `;

        tableBody.appendChild(row);
    });

    // Show error summary if there are mismatches
    const errors = comparison.mismatches.filter(m => m.status === 'mismatch');
    if (errors.length > 0) {
        const errorSummary = document.getElementById('errorSummary');
        const errorList = document.getElementById('errorList');
        errorSummary.style.display = 'block';
        errorList.innerHTML = '';

        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = `${error.fieldLabel}: Expected "${error.expected}", but got "${error.actual}"`;
            errorList.appendChild(li);
        });
    }
}

/**
 * Show error message
 */
function showError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

/**
 * Toggle side menu
 */
function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    const menuIcon = document.getElementById('menuIcon');

    if (sideMenu.classList.contains('open')) {
        sideMenu.classList.remove('open');
        overlay.classList.remove('show');
        menuIcon.style.display = 'block';
    } else {
        sideMenu.classList.add('open');
        overlay.classList.add('show');
        menuIcon.style.display = 'none';
    }
}
