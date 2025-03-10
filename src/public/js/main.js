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

    function loadReporterData() {
        const userId = document.getElementById('reporter-user-id').value;
        if (userId) {
            console.log('Fetching data for user:', userId);
            fetch(`/get-user-data/${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Received data:', data);
                    if (data && Array.isArray(data) && data.length > 0) {
                        document.getElementById('reporter-content').style.display = 'block';
                        
                        // Show the identity tab by default
                        document.getElementById('identity-tab').style.display = 'block';
                        document.getElementById('identity-tab-btn').className += " active";
                        
                        createIdentityTrajectoryChart(data);
                        createGeneralIdentitySummary(data);
                        createIdentitySwitchesChart(data);
                        createDailyEventsSummary(data);
                        createDayToDayDynamics(data);
                        createIdentitySwitchesPieChart(data);

                        // Add a delay before adding chart descriptions
                        setTimeout(() => {
                            addChartDescriptions();
                        }, 500);

                        // Hide the load data button and show the generate PDF button
                        document.getElementById('load-data-btn').style.display = 'none';
                        document.getElementById('generate-pdf-btn').style.display = 'block';
                        document.getElementById('generate-pdf-btn').addEventListener('click', generateReporterPDF);
                    } else {
                        throw new Error('No data found for this user ID.');
                    }
                })
                .catch((error) => {
                    console.error('Error loading data:', error);
                    alert(`Error loading data: ${error.message}. Please try again.`);
                    document.getElementById('reporter-content').style.display = 'none';
                });
        } else {
            alert('Please enter your ID');
        }
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