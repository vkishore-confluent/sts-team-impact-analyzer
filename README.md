# Team Impact Wins Dashboard

An automated system to capture, analyze, and showcase your team's impactful wins using AI-powered analysis.

![Status](https://img.shields.io/badge/status-phase%201-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

This application automatically:
1. **Captures** impact data via Google Forms
2. **Analyzes** each submission using Claude AI to calculate impact scores
3. **Displays** wins in a beautiful, filterable dashboard

## Features

### 🤖 Automated AI Analysis
- **Impact Scoring (0-100)**: AI evaluates impact based on keywords, scale, urgency, and business value
- **Categorization**: Automatically classifies wins into categories (Revenue Impact, Customer Success, Efficiency Gain, Platform Stability, Strategic Win)
- **Smart Summaries**: Generates concise 2-3 sentence summaries highlighting key impact

### 📊 Interactive Dashboard
- **Card-based visualization** with impact scores and categories
- **Advanced filtering**: Search, filter by category, team member, date range
- **Flexible sorting**: Sort by date or impact score
- **Real-time stats**: Track total wins, average impact, top categories, monthly trends

### ⚡ Real-Time Processing
- Triggers automatically when Google Form is submitted
- Enriches data immediately with AI analysis
- Updates dashboard in real-time

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│ Google Form │─────▶│  Google Sheets   │─────▶│  Dashboard  │
└─────────────┘      └──────────────────┘      └─────────────┘
                             │
                             ▼
                     ┌──────────────────┐
                     │  Apps Script +   │
                     │   Claude API     │
                     └──────────────────┘
```

**Data Flow:**
1. User submits Google Form
2. Apps Script trigger activates on form submission
3. Script sends data to Claude API for analysis
4. Claude returns impact score, category, and summary
5. Script writes results back to Google Sheet
6. Dashboard fetches and displays enriched data

## Project Structure

```
team-impact-wins/
├── google-apps-script.js   # Backend automation (runs in Google Sheets)
├── index.html              # Dashboard UI
├── styles.css              # Dashboard styling
├── script.js               # Dashboard logic
├── SETUP.md                # Detailed setup instructions
├── CLAUDE.md               # Project documentation
├── config.template.js      # Configuration template (reference)
└── README.md               # This file
```

## Quick Start

### Prerequisites
- Google account (for Forms and Sheets)
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Basic knowledge of Google Apps Script (or just follow the guide!)

### Installation

**Full setup takes ~15-20 minutes. Follow the detailed guide:**

📖 **[Complete Setup Guide](SETUP.md)**

Quick overview:
1. Set up Google Sheet with form responses
2. Install Google Apps Script
3. Add Anthropic API key
4. Configure auto-trigger
5. Deploy webpage

## Current Implementation (Phase 1)

✅ Google Form data collection
✅ Automated AI impact analysis
✅ Impact scoring (0-100 scale)
✅ Category classification
✅ Interactive dashboard
✅ Filtering and sorting
✅ Stats dashboard

## Roadmap (Phase 2)

🔜 Salesforce integration
- Fetch account metrics (ACV, MRR, account tier)
- Enhanced impact scoring based on customer value
- Account tier classification
- Automatic SFDC link validation

## Impact Scoring Methodology

The AI analyzes submissions based on:

| Factor | Weight | Examples |
|--------|--------|----------|
| **Keywords** | High | revenue, critical, outage, executive, P0/P1 |
| **Scale** | High | User count, dollar amounts, time saved |
| **Customer Importance** | Medium | Enterprise vs SMB, strategic accounts |
| **Urgency** | Medium | Blockers, escalations, SLA breaches |
| **Business Impact** | High | Revenue protection, expansion, retention |

### Score Ranges
- **86-100**: Critical impact (exceptional wins, massive impact)
- **61-85**: High impact (major revenue/customer wins)
- **31-60**: Medium impact (significant improvements)
- **0-30**: Low impact (minor improvements)

## Categories

- **Revenue Impact**: Deals closed, expansion, upsell
- **Customer Success**: Retention, satisfaction, escalation resolution
- **Efficiency Gain**: Time saved, automation, process improvement
- **Platform Stability**: Outage prevention, performance, reliability
- **Strategic Win**: Executive visibility, competitive advantage, innovation

## Configuration

### Required Google Sheet Columns

Your Google Sheet must have these columns in this exact order:

| Column | Header |
|--------|--------|
| A | Timestamp |
| B | Email Address |
| C | What type of impactful event are you documenting? |
| D | Please provide a detailed description of the event, its impact, and why you are proud of it. |
| E | Which customer account was this related to? |
| F | Link to the Opportunity OR Streaming Project |
| G | Did anyone from the team assist you with this success? |
| H | Upload supporting evidence (e.g., screenshots of accolades, win confirmations, helpful screen grabs) |
| I | Impact Score *(added by script)* |
| J | AI Summary *(added by script)* |
| K | Impact Category *(added by script)* |

**Note:** Columns A-H are created automatically by your Google Form. Columns I-K are added by the Apps Script.

### API Keys

**Anthropic API Key** (required):
- Get it from: https://console.anthropic.com/
- Store in: Google Apps Script Properties
- Cost: ~$0.01-0.02 per analysis
- Add credits at: https://console.anthropic.com/settings/plans

**Google Sheets API Key** (optional, for dashboard):
- For real-time updates in the dashboard
- Alternative: Use published CSV (simpler, slight delay)
- See SETUP.md for detailed instructions

## Customization

### Adjust Impact Scoring
Edit the `buildAnalysisPrompt()` function in `google-apps-script.js` to:
- Modify scoring criteria and weight factors
- Change category definitions
- Add new scoring dimensions
- Adjust score ranges

### Customize UI
Edit `styles.css` to change:
- Color scheme (CSS variables in `:root`)
- Layout and grid structure
- Card design and spacing
- Fonts and typography

### Add Custom Filters
Edit `script.js` to add new filtering options or sorting methods.

## Tech Stack

**Backend**
- Google Apps Script (JavaScript runtime)
- Claude API (Anthropic)
- Google Sheets (database)

**Frontend**
- HTML5
- CSS3 (Grid, Flexbox)
- Vanilla JavaScript (no frameworks)

**Hosting Options**
- GitHub Pages
- Vercel
- Netlify
- Any static hosting

## Usage

### For Team Members
1. Fill out the Google Form when you achieve an impactful win
2. Submit the form
3. The system automatically analyzes your submission within seconds
4. View all team wins on the dashboard

### For Administrators

**Test the API connection:**
```javascript
// In Google Apps Script editor:
// 1. Select function: testClaudeAPI
// 2. Click Run button
// 3. Check execution logs for results
```

**Process existing form responses:**
```javascript
// In Google Apps Script editor:
// 1. Select function: setupHeaders (run once to add column headers)
// 2. Select function: processAllRows (analyzes all existing data)
// 3. Click Run button
```

**Monitor execution:**
- Apps Script logs: View > Execution log
- Dashboard errors: Browser console (F12)
- API usage: https://console.anthropic.com/

## Security Notes

⚠️ **Important Security Practices:**

- **Never commit API keys to version control**
- Store Anthropic API key in Google Apps Script Properties (not in code)
- Restrict Google Sheets API key to specific domains in production
- Review Google Sheet sharing settings carefully
- Consider who should have access to form submissions (PII/sensitive data)
- Use environment variables for production deployments

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "ANTHROPIC_API_KEY not found" | Add API key to Script Properties in Apps Script settings |
| "Credit balance too low" | Add credits at [console.anthropic.com](https://console.anthropic.com/settings/plans) |
| Trigger not firing | Verify trigger is set to "On form submit" (not "On change") |
| API call failing | Check API key is valid, check credit balance, view execution logs |
| Dashboard shows no data | Verify CONFIG in script.js, check Sheet ID and API key |
| CORS errors in dashboard | Serve via `python3 -m http.server` or deploy to hosting platform |
| Wrong columns analyzed | Verify COLUMNS mapping in google-apps-script.js matches your sheet |

**Detailed troubleshooting:** See the [Troubleshooting section](SETUP.md#troubleshooting) in SETUP.md.

## Deployment

The dashboard is a static site and can be deployed anywhere:

### GitHub Pages (Free)
1. Push code to GitHub repository
2. Go to Settings > Pages
3. Select main branch as source
4. Your site will be live at `https://username.github.io/repo-name/`

### Vercel (Free, Easy)
1. Go to https://vercel.com
2. Import your GitHub repository
3. Click Deploy
4. Site goes live instantly

### Netlify (Free)
1. Go to https://netlify.com
2. Drag and drop your folder (index.html, styles.css, script.js)
3. Site goes live immediately

### Local Development
```bash
# Serve locally with Python
python3 -m http.server 8000

# OR with Node.js
npx http-server

# Then open: http://localhost:8000
```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use and modify for your team.

## Support

- **Setup Help**: See [SETUP.md](SETUP.md)
- **Bug Reports**: Open an issue on GitHub
- **Feature Requests**: Open an issue with the "enhancement" label
- **Questions**: Check [CLAUDE.md](CLAUDE.md) for project documentation

## Acknowledgments

- Built with [Claude AI](https://www.anthropic.com/claude) by Anthropic
- Powered by Google Workspace (Forms, Sheets, Apps Script)
- Inspired by the need to celebrate and track team achievements

## FAQ

**Q: How much does this cost to run?**
A: ~$0.01-0.02 per form submission for Claude API. Google Sheets and Forms are free. Hosting is free on GitHub Pages/Vercel/Netlify.

**Q: Can I customize the scoring algorithm?**
A: Yes! Edit the `buildAnalysisPrompt()` function in google-apps-script.js to adjust scoring criteria.

**Q: What happens if the API call fails?**
A: The error is logged in Apps Script execution logs. You can re-run `processAllRows()` to analyze any missing entries.

**Q: Can I use this for multiple teams?**
A: Yes! Either create separate Google Forms/Sheets for each team, or add a "Team" field to the form and filter in the dashboard.

**Q: Is my data secure?**
A: Data is stored in your Google Sheet with your chosen permissions. API keys are stored in Apps Script properties. Claude API processes data but doesn't retain it.

---

**Ready to showcase your team's impact?** Start with the [Setup Guide](SETUP.md)!

**Made with ❤️ for teams who do amazing work**
