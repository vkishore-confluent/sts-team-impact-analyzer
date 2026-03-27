/**
 * Team Impact Wins - Frontend JavaScript
 *
 * This script:
 * 1. Fetches data from Google Sheets
 * 2. Renders impact win cards
 * 3. Handles filtering and sorting
 */

// ==================== CONFIGURATION ====================
// Replace these values after setting up Google Sheets API
const CONFIG = {
    // Option 1: Using Google Sheets API (recommended)
    // SHEET_ID: 'YOUR_SHEET_ID_HERE',
    // API_KEY: 'YOUR_API_KEY_HERE',
    // SHEET_NAME: 'Form Responses 1', // Adjust if your sheet has a different name

    // Option 2: Using published CSV (simpler, but less real-time)
    // Get this URL from: File > Share > Publish to web > CSV
    // CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5sZft2FHfga3jGebFyIRwoqxPu2VvpO9LVUOmBIzBmT5Z30jeJo9TD0XKsgGUBrpuiDJgdNLG5IS1/pub?output=csv'
};

// ==================== STATE ====================
let allWins = [];
let filteredWins = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    try {
        // Fetch data from Google Sheets
        await fetchData();

        // Set up event listeners
        setupEventListeners();

        // Initial render
        applyFiltersAndSort();

    } catch (error) {
        console.error('Error initializing app:', error);
        showError();
    }
}

// ==================== DATA FETCHING ====================
async function fetchData() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');

    loadingState.style.display = 'block';
    errorState.style.display = 'none';

    try {
        // Using Google Sheets API
        if (CONFIG.API_KEY && CONFIG.SHEET_ID && CONFIG.API_KEY !== 'YOUR_API_KEY_HERE') {
            allWins = await fetchFromSheetsAPI();
        }
        // Using published CSV
        else if (CONFIG.CSV_URL) {
            allWins = await fetchFromCSV();
        }
        // Using sample data for demo
        else {
            console.warn('No API key or CSV URL configured. Using sample data.');
            allWins = getSampleData();
        }

        loadingState.style.display = 'none';

    } catch (error) {
        console.error('Error fetching data:', error);
        loadingState.style.display = 'none';
        throw error;
    }
}

async function fetchFromSheetsAPI() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${CONFIG.SHEET_NAME}?key=${CONFIG.API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    return parseSheetData(data.values);
}

async function fetchFromCSV() {
    const response = await fetch(CONFIG.CSV_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }

    const csvText = await response.text();
    return parseCSVData(csvText);
}

function parseSheetData(rows) {
    if (!rows || rows.length < 2) {
        return [];
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    return dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.toLowerCase().replace(/ /g, '_')] = row[index] || '';
        });

        // Parse timestamp
        if (obj.timestamp) {
            obj.timestamp = new Date(obj.timestamp);
        }

        // Parse impact score
        if (obj.impact_score) {
            obj.impact_score = parseInt(obj.impact_score) || 0;
        }

        return obj;
    });
}

function parseCSVData(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
    const dataRows = lines.slice(1);

    return dataRows
        .filter(line => line.trim())
        .map(line => {
            const values = parseCSVLine(line);
            const obj = {};

            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });

            // Parse timestamp
            if (obj.timestamp) {
                obj.timestamp = new Date(obj.timestamp);
            }

            // Parse impact score
            if (obj.impact_score) {
                obj.impact_score = parseInt(obj.impact_score) || 0;
            }

            return obj;
        });
}

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());

    return values;
}

// ==================== FILTERING AND SORTING ====================
function setupEventListeners() {
    document.getElementById('searchFilter').addEventListener('input', applyFiltersAndSort);
    document.getElementById('categoryFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('teamFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('dateFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('sortBy').addEventListener('change', applyFiltersAndSort);
}

function applyFiltersAndSort() {
    // Apply filters
    filteredWins = allWins.filter(win => {
        // Search filter
        const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
        if (searchTerm) {
            const searchableText = [
                win.impact_subject,
                win.impact_description,
                win.customer_account,
                win.ai_summary
            ].join(' ').toLowerCase();

            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter').value;
        if (categoryFilter && win.impact_category !== categoryFilter) {
            return false;
        }

        // Team member filter
        const teamFilter = document.getElementById('teamFilter').value;
        if (teamFilter) {
            const teamMembers = (win.team_assist || '').toLowerCase();
            if (!teamMembers.includes(teamFilter.toLowerCase())) {
                return false;
            }
        }

        // Date filter
        const dateFilter = parseInt(document.getElementById('dateFilter').value);
        if (dateFilter && dateFilter !== 'all') {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - dateFilter);
            if (win.timestamp < cutoffDate) {
                return false;
            }
        }

        return true;
    });

    // Apply sorting
    const sortBy = document.getElementById('sortBy').value;
    filteredWins.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return b.timestamp - a.timestamp;
            case 'date-asc':
                return a.timestamp - b.timestamp;
            case 'impact-desc':
                return (b.impact_score || 0) - (a.impact_score || 0);
            case 'impact-asc':
                return (a.impact_score || 0) - (b.impact_score || 0);
            default:
                return 0;
        }
    });

    // Update UI
    updateStats();
    updateFilterOptions();
    renderWins();
}

function updateFilterOptions() {
    // Update category filter
    const categories = [...new Set(allWins.map(w => w.impact_category).filter(Boolean))];
    const categoryFilter = document.getElementById('categoryFilter');
    const currentCategory = categoryFilter.value;

    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    categoryFilter.value = currentCategory;

    // Update team filter
    const teamMembers = new Set();
    allWins.forEach(win => {
        if (win.team_assist) {
            win.team_assist.split(',').forEach(email => {
                teamMembers.add(email.trim());
            });
        }
    });

    const teamFilter = document.getElementById('teamFilter');
    const currentTeam = teamFilter.value;

    teamFilter.innerHTML = '<option value="">All Team Members</option>';
    [...teamMembers].sort().forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        teamFilter.appendChild(option);
    });
    teamFilter.value = currentTeam;
}

// ==================== STATS CALCULATION ====================
function updateStats() {
    // Total wins
    document.getElementById('totalWins').textContent = allWins.length;

    // Average impact score
    const validScores = allWins.filter(w => w.impact_score > 0);
    const avgImpact = validScores.length > 0
        ? Math.round(validScores.reduce((sum, w) => sum + w.impact_score, 0) / validScores.length)
        : 0;
    document.getElementById('avgImpact').textContent = avgImpact;

    // Top category
    const categoryCounts = {};
    allWins.forEach(win => {
        if (win.impact_category) {
            categoryCounts[win.impact_category] = (categoryCounts[win.impact_category] || 0) + 1;
        }
    });

    const topCategory = Object.keys(categoryCounts).length > 0
        ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)
        : 'N/A';
    document.getElementById('topCategory').textContent = topCategory;

    // This month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthCount = allWins.filter(w => w.timestamp >= thisMonth).length;
    document.getElementById('thisMonth').textContent = thisMonthCount;
}

// ==================== RENDERING ====================
function renderWins() {
    const winsGrid = document.getElementById('winsGrid');
    const emptyState = document.getElementById('emptyState');

    winsGrid.innerHTML = '';

    if (filteredWins.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    filteredWins.forEach(win => {
        const card = createWinCard(win);
        winsGrid.appendChild(card);
    });
}

function createWinCard(win) {
    const card = document.createElement('div');
    card.className = 'win-card';

    const impactScore = win.impact_score || 0;
    const scoreLevel = getScoreLevel(impactScore);

    const formattedDate = win.timestamp
        ? win.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Unknown date';

    card.innerHTML = `
        <div class="win-card-header">
            <h3 class="win-card-title">${escapeHtml(win.impact_subject || 'Untitled Impact')}</h3>
            <div class="win-card-meta">
                <span>📅 ${formattedDate}</span>
            </div>
        </div>

        <div class="win-card-body">
            <div class="impact-score-container">
                <div class="impact-score">
                    <div class="score-badge ${scoreLevel}">
                        ${impactScore}
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 0.875rem;">Impact Score</div>
                        <div class="score-label">${scoreLevel.toUpperCase()}</div>
                    </div>
                </div>
                ${win.impact_category ? `<span class="category-badge">${escapeHtml(win.impact_category)}</span>` : ''}
            </div>

            ${win.ai_summary ? `<div class="ai-summary">${escapeHtml(win.ai_summary)}</div>` : ''}

            ${win.customer_account ? `
                <div class="customer-info">
                    <span class="customer-icon">🏢</span>
                    <strong>${escapeHtml(win.customer_account)}</strong>
                </div>
            ` : ''}

            ${win.team_assist ? `
                <div class="team-info">
                    👥 ${escapeHtml(win.team_assist)}
                </div>
            ` : ''}
        </div>

        <div class="win-card-footer">
            ${win.sfdc_link && win.sfdc_link !== 'N/A' ? `
                <a href="${escapeHtml(win.sfdc_link)}" target="_blank" class="link-button">
                    SFDC Link
                </a>
            ` : '<span class="link-button disabled">No SFDC Link</span>'}

            ${win.evidence_link && win.evidence_link !== 'N/A' ? `
                <a href="${escapeHtml(win.evidence_link)}" target="_blank" class="link-button">
                    Evidence
                </a>
            ` : '<span class="link-button disabled">No Evidence</span>'}
        </div>
    `;

    return card;
}

function getScoreLevel(score) {
    if (score >= 86) return 'critical';
    if (score >= 61) return 'high';
    if (score >= 31) return 'medium';
    return 'low';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
}

// ==================== SAMPLE DATA (for demo purposes) ====================
function getSampleData() {
    return [
        {
            timestamp: new Date('2026-03-25'),
            email_address: 'john@company.com',
            impact_subject: 'Resolved critical database outage for Enterprise customer',
            impact_description: 'Fixed a P0 outage affecting 5000 users at Acme Corp. Issue was causing 100% failure rate on login. Implemented hot-fix and restored service within 45 minutes.',
            customer_account: 'Acme Corp',
            sfdc_link: 'https://salesforce.com',
            team_assist: 'john@company.com, jane@company.com',
            evidence_link: 'https://slack.com',
            impact_score: 92,
            ai_summary: 'Successfully resolved a critical P0 outage affecting 5000 users at our largest enterprise customer. The rapid response prevented potential contract cancellation and demonstrated strong incident management capabilities.',
            impact_category: 'Platform Stability'
        },
        {
            timestamp: new Date('2026-03-24'),
            email_address: 'sarah@company.com',
            impact_subject: 'Closed $500K expansion deal with existing customer',
            impact_description: 'After 3 months of technical consultation and POC work, successfully closed expansion deal with TechCorp for additional 1000 seats.',
            customer_account: 'TechCorp',
            sfdc_link: 'https://salesforce.com',
            team_assist: 'sarah@company.com, mike@company.com',
            evidence_link: 'https://docs.google.com',
            impact_score: 85,
            ai_summary: 'Secured a major expansion deal worth $500K ARR through dedicated technical consultation and successful proof of concept. This represents significant revenue growth from an existing customer.',
            impact_category: 'Revenue Impact'
        },
        {
            timestamp: new Date('2026-03-20'),
            email_address: 'mike@company.com',
            impact_subject: 'Automated deployment process saving 10 hours per week',
            impact_description: 'Implemented CI/CD pipeline automation that reduced manual deployment time from 2 hours to 5 minutes. Team of 5 engineers now saves 10 hours collectively per week.',
            customer_account: 'Internal',
            sfdc_link: 'N/A',
            team_assist: 'mike@company.com',
            evidence_link: 'https://github.com',
            impact_score: 72,
            ai_summary: 'Delivered significant efficiency gains by automating the deployment process. The new CI/CD pipeline reduces deployment time by 95% and saves the engineering team 10 hours per week.',
            impact_category: 'Efficiency Gain'
        }
    ];
}
