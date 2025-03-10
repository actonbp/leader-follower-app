// Import statements moved to the top of the file
import { createIdentityTrajectoryChart, createGeneralIdentitySummary, createIdentitySwitchesChart, createDailyEventsSummary, createDayToDayDynamics, createIdentitySwitchesPieChart, addChartDescriptions, generateReporterPDF, addChartDescription } from './reporter.js';

// Define the showPage function in the global scope
function showPage(pageId) {
    console.log('showPage called with pageId:', pageId);
    try {
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        const element = document.getElementById(pageId);
        if (!element) {
            console.error(`Element with ID ${pageId} not found!`);
            return;
        }
        element.style.display = 'block';
    } catch (error) {
        console.error('Error in showPage function:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const pages = ['welcome-page', 'instructions-page', 'grid-page', 'event-reflection-page', 'event-rating-page', 'completion-page'];
    let currentPage = 0;
    let userData = {};

    function showCompletionPage() {
        showPage('completion-page');
    }

    // Main Welcome Page
    const reflectorBtn = document.getElementById('reflector-btn');
    if (reflectorBtn) {
        reflectorBtn.addEventListener('click', () => {
            try {
                console.log('Reflector button clicked');
                const mainPage = document.getElementById('main-welcome-page');
                if (!mainPage) {
                    console.error('main-welcome-page element not found');
                    return;
                }
                mainPage.style.display = 'none';
                
                const reflectorSection = document.getElementById('reflector-section');
                if (!reflectorSection) {
                    console.error('reflector-section element not found');
                    return;
                }
                reflectorSection.style.display = 'block';
                
                // Instead of using showPage, directly control the visibility
                // of the welcome-page within the reflector-section
                const welcomePage = document.getElementById('welcome-page');
                if (!welcomePage) {
                    console.error('welcome-page element not found');
                    return;
                }
                
                // Hide any other pages in the reflector section
                const reflectorPages = reflectorSection.querySelectorAll('.page');
                reflectorPages.forEach(page => {
                    page.style.display = 'none';
                });
                
                // Show the welcome page
                welcomePage.style.display = 'block';
            } catch (error) {
                console.error('Error in reflector button click handler:', error);
            }
        });
    } else {
        console.error('Reflector button not found in DOM');
    }

    const reporterBtn = document.getElementById('reporter-btn');
    if (reporterBtn) {
        reporterBtn.addEventListener('click', () => {
            try {
                console.log('Reporter button clicked');
                const mainPage = document.getElementById('main-welcome-page');
                if (!mainPage) {
                    console.error('main-welcome-page element not found');
                    return;
                }
                mainPage.style.display = 'none';
                
                showPage('reporter-section');
                
                // Clear previous data and reset UI
                const reporterContent = document.getElementById('reporter-content');
                if (!reporterContent) {
                    console.error('reporter-content element not found');
                } else {
                    reporterContent.style.display = 'none';
                }
                
                const reporterUserId = document.getElementById('reporter-user-id');
                if (!reporterUserId) {
                    console.error('reporter-user-id element not found');
                } else {
                    reporterUserId.value = '';
                }
            } catch (error) {
                console.error('Error in reporter button click handler:', error);
            }
        });
    } else {
        console.error('Reporter button not found in DOM');
    }

    // Reflector Section
    document.getElementById('start-btn').addEventListener('click', () => {
        const userId = document.getElementById('user-id').value;
        if (userId) {
            // Store userId in localStorage for recovery if needed
            localStorage.setItem('userId', userId);
            
            fetch(`/check-user/${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.isNewUser || !data.hasEmail) {
                        showPage('email-preferences');
                    } else {
                        userData.userId = userId;
                        userData.startTime = new Date().toISOString();
                        showPage('instructions-page');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('There was an error checking user status. Please try again.');
                });
        } else {
            alert('Please enter your ID');
        }
    });

    document.getElementById('next-to-grid-btn').addEventListener('click', () => {
        showPage('grid-page');
    });

    const grid = document.getElementById('grid');
    const point = document.getElementById('point');
    const gridSubmitBtn = document.getElementById('grid-submit-btn');

    grid.addEventListener('click', (e) => {
        const rect = grid.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = rect.bottom - e.clientY;

        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        userData.followerPercent = (x / rect.width * 100).toFixed(2);
        userData.leaderPercent = (y / rect.height * 100).toFixed(2);

        point.style.left = `${x}px`;
        point.style.top = `${rect.height - y}px`;
        point.style.display = 'block';

        gridSubmitBtn.disabled = false;
    });

    gridSubmitBtn.addEventListener('click', () => {
        showPage('event-reflection-page');
    });

    document.getElementById('next-to-rating-btn').addEventListener('click', () => {
        userData.eventDescription = document.getElementById('event-description').value;
        showPage('event-rating-page');
    });

    document.getElementById('questions-submit-btn').addEventListener('click', () => {
        userData.novelty = document.getElementById('novelty').value;
        userData.disruption = document.getElementById('disruption').value;
        userData.ordinariness = document.getElementById('ordinariness').value;

        // Ensure required fields are present before submission
        if (!userData.userId || !userData.startTime) {
            console.error('Missing required fields:', { userId: userData.userId, startTime: userData.startTime });
            userData.userId = userData.userId || localStorage.getItem('userId');
            userData.startTime = userData.startTime || new Date().toISOString();
            console.log('After recovery attempt:', { userId: userData.userId, startTime: userData.startTime });
            
            if (!userData.userId || !userData.startTime) {
                alert('Session data is missing. Please restart from the beginning.');
                document.getElementById('reflector-section').style.display = 'none';
                showPage('main-welcome-page');
                userData = {};
                return;
            }
        }

        fetch('/submit-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                showPage('completion-page');
                userData = data; // Update userData with the latest submission data
            })
            .catch((error) => {
                console.error('Error:', error);
                alert(`There was an error submitting your data: ${error.message}. Please try again.`);
            });
    });

    // Add event listeners for range inputs
    ['novelty', 'disruption', 'ordinariness'].forEach(id => {
        const input = document.getElementById(id);
        const valueSpan = document.getElementById(`${id}-value`);
        input.addEventListener('input', () => {
            valueSpan.textContent = input.value;
        });
    });

    document.getElementById('new-rating-btn').addEventListener('click', () => {
        // Preserve the userId or recover it from localStorage
        const currentUserId = userData.userId || localStorage.getItem('userId');
        if (!currentUserId) {
            alert('Session data is missing. Please restart from the beginning.');
            document.getElementById('reflector-section').style.display = 'none';
            showPage('main-welcome-page');
            userData = {};
            return;
        }
        
        userData = { userId: currentUserId };
        userData.startTime = new Date().toISOString();
        showPage('grid-page');
        point.style.display = 'none';
        gridSubmitBtn.disabled = true;
    });

    document.getElementById('finish-btn').addEventListener('click', () => {
        alert('Thank you for participating!');
        document.getElementById('reflector-section').style.display = 'none';
        showPage('main-welcome-page');
        userData = {};
    });

    function generateReflectorPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add header
        doc.setFillColor(220, 220, 220);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('LFIT Reflector Report', 105, 15, { align: 'center' });

        // Add user ID and date
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`User ID: ${userData.userId}`, 20, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 37);

        // Add Leader-Follower scores
        doc.setFont('helvetica', 'bold');
        doc.text('Identity Scores', 20, 50);
        doc.setFont('helvetica', 'normal');
        doc.text(`Leader Score: ${userData.leaderPercent}%`, 30, 57);
        doc.text(`Follower Score: ${userData.followerPercent}%`, 30, 64);

        // Add event details
        doc.setFont('helvetica', 'bold');
        doc.text('Event Details', 20, 80);
        doc.setFont('helvetica', 'normal');
        doc.text(`Novelty: ${userData.novelty}`, 30, 87);
        doc.text(`Disruption: ${userData.disruption}`, 30, 94);
        doc.text(`Ordinariness: ${userData.ordinariness}`, 30, 101);

        // Add event description
        doc.setFont('helvetica', 'bold');
        doc.text('Event Description', 20, 115);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(userData.eventDescription, 170);
        doc.text(splitText, 30, 122);

        // Add footer
        doc.setFontSize(10);
        doc.text('Leader-Follower Identity Tracker (LFIT) - Confidential', 105, 285, { align: 'center' });
        doc.text(`Page 1 of 1`, 105, 292, { align: 'center' });

        // Save the PDF
        doc.save('LFIT_Reflector_Report.pdf');
    }

    // Add event listener for the export button if it exists in the future
    // Currently, there's no export-reflector-pdf-btn in the HTML

    // Reporter functionality
    const loadDataBtn = document.getElementById('load-data-btn');
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', loadReporterData);
    }

    async function loadReporterData() {
        try {
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }
            
            // Get user ID from input
            const userIdInput = document.getElementById('reporter-user-id');
            if (!userIdInput) {
                console.error('User ID input element not found');
                alert('Error: Could not find the user ID input field.');
                return;
            }
            
            const userId = userIdInput.value.trim();
            if (!userId) {
                alert('Please enter a user ID');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                return;
            }
            
            // Store user ID in local storage
            localStorage.setItem('reporterUserId', userId);
            
            // Fetch user data - use the correct endpoint
            console.log(`Fetching data for user ID: ${userId}`);
            const response = await fetch(`/get-user-data/${userId}`);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            
            if (!data || data.length === 0) {
                alert('No data found for this user ID. Please check the ID and try again.');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                return;
            }
            
            // Show the reporter content
            const reporterContent = document.getElementById('reporter-content');
            if (reporterContent) {
                reporterContent.style.display = 'block';
            }
            
            // Show the identity tab by default
            const identityTab = document.getElementById('identity-tab');
            if (identityTab) {
                identityTab.style.display = 'block';
            }
            
            const identityTabBtn = document.getElementById('identity-tab-btn');
            if (identityTabBtn) {
                identityTabBtn.className += " active";
            }
            
            // Hide the load data button and show the generate PDF button
            const loadDataBtn = document.getElementById('load-data-btn');
            if (loadDataBtn) {
                loadDataBtn.style.display = 'none';
            }
            
            const generatePdfBtn = document.getElementById('generate-pdf-btn');
            if (generatePdfBtn) {
                generatePdfBtn.style.display = 'block';
            }
            
            // Make sure Chart.js is loaded
            if (typeof Chart === 'undefined') {
                console.error('Chart.js is not loaded. Attempting to load it dynamically.');
                await loadChartJsDynamically();
            }
            
            // Import the reporter module
            try {
                const reporter = await import('./reporter.js');
                console.log('Reporter module loaded successfully');
                
                // Set up PDF generation
                if (generatePdfBtn) {
                    generatePdfBtn.addEventListener('click', function() {
                        console.log('Generate PDF button clicked');
                        reporter.generateReporterPDF();
                    });
                }
                
                // Create charts with try/catch for each
                try {
                    reporter.createIdentityTrajectoryChart(data);
                    console.log('Identity trajectory chart created successfully');
                } catch (error) {
                    console.error('Error creating identity trajectory chart:', error);
                }
                
                try {
                    reporter.createGeneralIdentitySummary(data);
                    console.log('General identity summary created successfully');
                } catch (error) {
                    console.error('Error creating general identity summary:', error);
                }
                
                try {
                    reporter.createIdentitySwitchesChart(data);
                    console.log('Identity switches chart created successfully');
                } catch (error) {
                    console.error('Error creating identity switches chart:', error);
                }
                
                try {
                    reporter.createIdentitySwitchesPieChart(data);
                    console.log('Identity switches pie chart created successfully');
                } catch (error) {
                    console.error('Error creating identity switches pie chart:', error);
                }
                
                try {
                    reporter.createDailyEventsSummary(data);
                    console.log('Daily events summary created successfully');
                } catch (error) {
                    console.error('Error creating daily events summary:', error);
                }
                
                try {
                    reporter.createDayToDayDynamics(data);
                    console.log('Day-to-day dynamics created successfully');
                } catch (error) {
                    console.error('Error creating day-to-day dynamics:', error);
                }
                
                // Add chart descriptions
                try {
                    reporter.addChartDescriptions();
                    console.log('Chart descriptions added successfully');
                } catch (error) {
                    console.error('Error adding chart descriptions:', error);
                }
                
            } catch (importError) {
                console.error('Error importing reporter module:', importError);
                alert('Failed to load the reporting module. Please check the console for details.');
            }
            
        } catch (error) {
            console.error('Error loading reporter data:', error);
            alert(`Error loading data: ${error.message}`);
        } finally {
            // Hide loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }

    // Helper function to dynamically load Chart.js if needed
    async function loadChartJsDynamically() {
        return new Promise((resolve, reject) => {
            if (typeof Chart !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
            script.onload = () => {
                console.log('Chart.js loaded dynamically');
                
                // Also load the BoxPlot plugin
                const boxPlotScript = document.createElement('script');
                boxPlotScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-chart-box-and-violin-plot@3.0.0/build/Chart.BoxPlot.min.js';
                boxPlotScript.onload = () => {
                    console.log('BoxPlot plugin loaded dynamically');
                    resolve();
                };
                boxPlotScript.onerror = (error) => {
                    console.error('Failed to load BoxPlot plugin:', error);
                    // Continue anyway, as we have fallbacks
                    resolve();
                };
                document.head.appendChild(boxPlotScript);
            };
            script.onerror = (error) => {
                console.error('Failed to load Chart.js:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    function addChartDescriptions() {
        addChartDescription('identity-switch-pie-chart', 'This pie chart shows the proportion of days you identified more strongly as a leader, follower, or were in a liminal state (balanced between the two).');
        addChartDescription('identity-trajectory-chart', 'This chart shows how your leader and follower identities have changed over time. Higher values indicate a stronger identification with that role.');
        addChartDescription('general-identity-chart', 'This box plot displays the distribution of your leader and follower identity scores. The box represents the middle 50% of scores, with the line inside showing the median. The diamond marker shows the mean. The whiskers extend to the minimum and maximum scores.');
        addChartDescription('identity-switches-chart', 'This chart shows the number of times your dominant identity switched between leader and follower.');
        addChartDescription('event-strength-chart', 'This chart displays the average strength of daily events you experienced. Higher values indicate more impactful events that may have influenced your leader-follower identity.');
    }

    function calculateLiminality(data) {
        let liminalPeriods = 0;
        let totalPeriods = data.length - 1;
        
        for (let i = 1; i < data.length; i++) {
            let prevLeader = data[i-1].leaderIdentity;
            let prevFollower = data[i-1].followerIdentity;
            let currLeader = data[i].leaderIdentity;
            let currFollower = data[i].followerIdentity;
            
            if (Math.abs(currLeader - currFollower) <= 1 && Math.abs(prevLeader - prevFollower) <= 1) {
                liminalPeriods++;
            }
        }
        
        return (liminalPeriods / totalPeriods) * 100;
    }

    function displayLiminalityInfo(data) {
        const liminalityScore = calculateLiminality(data);
        const liminalityText = `
            <h3>Identity Liminality</h3>
            <p>Identity liminality represents periods where leader and follower identities appear in a transitional or threshold state. This occurs when the difference between leader and follower identity scores is small (1 or less) for consecutive time points.</p>
            <p>Your liminality score: ${liminalityScore.toFixed(2)}%</p>
            <p>Interpretation:</p>
            <ul>
                <li>0-20%: Low liminality - Your leader and follower identities are usually distinct.</li>
                <li>21-40%: Moderate liminality - You experience some periods of identity transition.</li>
                <li>41-60%: High liminality - Your identities are often in a state of flux.</li>
                <li>61-100%: Very high liminality - Your leader and follower identities are frequently intertwined.</li>
            </ul>
        `;
        document.getElementById('liminality-section').innerHTML = liminalityText;
    }

    // Tab functionality
    document.getElementById('identity-tab-btn').addEventListener('click', function(event) {
        // Hide all tab content
        document.querySelectorAll('.tabcontent').forEach(tab => {
            tab.style.display = 'none';
        });
        // Remove active class from all tab buttons
        document.querySelectorAll('.tablinks').forEach(btn => {
            btn.classList.remove('active');
        });
        // Show the selected tab and add active class to button
        document.getElementById('identity-tab').style.display = 'block';
        event.currentTarget.classList.add('active');
    });

    document.getElementById('events-tab-btn').addEventListener('click', function(event) {
        // Hide all tab content
        document.querySelectorAll('.tabcontent').forEach(tab => {
            tab.style.display = 'none';
        });
        // Remove active class from all tab buttons
        document.querySelectorAll('.tablinks').forEach(btn => {
            btn.classList.remove('active');
        });
        // Show the selected tab and add active class to button
        document.getElementById('events-tab').style.display = 'block';
        event.currentTarget.classList.add('active');
    });
});