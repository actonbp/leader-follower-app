// This file contains functions used in main.js - exposed globally

// Create the chart creation functions
function createIdentityTrajectoryChart(data) {
    try {
        const canvas = document.getElementById('identity-trajectory-chart');
        if (!canvas) {
            console.error('Canvas element not found: identity-trajectory-chart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Extract dates and identity scores
        const dates = data.map(item => new Date(item.submitTime));
        const leaderScores = data.map(item => parseFloat(item.leaderScore));
        const followerScores = data.map(item => parseFloat(item.followerScore));
        
        // Create the chart with explicit Chart constructor
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Destroy any existing chart
        if (window.identityTrajectoryChart) {
            window.identityTrajectoryChart.destroy();
        }
        
        // Create the chart
        window.identityTrajectoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Leader Identity',
                        data: dates.map((date, index) => ({ x: date, y: leaderScores[index] })),
                        borderColor: '#FF6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.1
                    },
                    {
                        label: 'Follower Identity',
                        data: dates.map((date, index) => ({ x: date, y: followerScores[index] })),
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            displayFormats: {
                                day: 'MMM d'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Identity Strength (%)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Leader and Follower Identity Trajectory'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating identity trajectory chart:', error);
    }
}

function createGeneralIdentitySummary(data) {
    try {
        const canvas = document.getElementById('general-identity-chart');
        if (!canvas) {
            console.error('Canvas element not found: general-identity-chart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Destroy any existing chart
        if (window.generalIdentityChart) {
            window.generalIdentityChart.destroy();
        }
        
        // Extract leader and follower scores
        const leaderScores = data.map(item => parseFloat(item.leaderScore));
        const followerScores = data.map(item => parseFloat(item.followerScore));
        
        // Calculate mean and standard deviation
        const leaderMean = calculateMean(leaderScores);
        const followerMean = calculateMean(followerScores);
        const leaderStdDev = calculateStdDev(leaderScores, leaderMean);
        const followerStdDev = calculateStdDev(followerScores, followerMean);
        
        // Display the variability in the table
        const leaderVariabilityElement = document.getElementById('leader-variability');
        const followerVariabilityElement = document.getElementById('follower-variability');
        
        if (leaderVariabilityElement) {
            leaderVariabilityElement.textContent = leaderStdDev.toFixed(2);
        }
        
        if (followerVariabilityElement) {
            followerVariabilityElement.textContent = followerStdDev.toFixed(2);
        }
        
        // Create a simple bar chart
        window.generalIdentityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Leader Identity', 'Follower Identity'],
                datasets: [{
                    label: 'Mean Score',
                    data: [leaderMean, followerMean],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)'
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Identity Score'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Leader and Follower Identity Scores'
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const stdDev = index === 0 ? leaderStdDev : followerStdDev;
                                return `Standard Deviation: ${stdDev.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
        
        // Add error bars manually after chart is created
        const drawErrorBars = function() {
            try {
                const meta = window.generalIdentityChart.getDatasetMeta(0);
                const ctx = window.generalIdentityChart.ctx;
                const errorBarColor = 'rgba(0, 0, 0, 0.5)';
                const errorBarWidth = 10;
                
                ctx.save();
                ctx.strokeStyle = errorBarColor;
                ctx.lineWidth = 2;
                
                for (let i = 0; i < meta.data.length; i++) {
                    const stdDev = i === 0 ? leaderStdDev : followerStdDev;
                    const mean = i === 0 ? leaderMean : followerMean;
                    
                    const bar = meta.data[i];
                    const x = bar.x;
                    const yScale = window.generalIdentityChart.scales.y;
                    
                    const yTop = yScale.getPixelForValue(Math.min(mean + stdDev, 100));
                    const yBottom = yScale.getPixelForValue(Math.max(mean - stdDev, 0));
                    
                    // Draw vertical line
                    ctx.beginPath();
                    ctx.moveTo(x, yTop);
                    ctx.lineTo(x, yBottom);
                    ctx.stroke();
                    
                    // Draw top cap
                    ctx.beginPath();
                    ctx.moveTo(x - errorBarWidth / 2, yTop);
                    ctx.lineTo(x + errorBarWidth / 2, yTop);
                    ctx.stroke();
                    
                    // Draw bottom cap
                    ctx.beginPath();
                    ctx.moveTo(x - errorBarWidth / 2, yBottom);
                    ctx.lineTo(x + errorBarWidth / 2, yBottom);
                    ctx.stroke();
                }
                
                ctx.restore();
            } catch (error) {
                console.error('Error drawing error bars:', error);
            }
        };
        
        // Draw error bars after animation completes
        if (window.generalIdentityChart.options.animation) {
            window.generalIdentityChart.options.animation.onComplete = drawErrorBars;
        } else {
            // If animation is disabled, draw immediately
            drawErrorBars();
        }
        
    } catch (error) {
        console.error('Error creating general identity summary:', error);
        
        // Create a fallback display if chart creation fails
        try {
            const container = document.getElementById('general-identity');
            if (container) {
                const fallbackDiv = document.createElement('div');
                fallbackDiv.innerHTML = `
                    <h4>General Identity Summary:</h4>
                    <table class="table">
                        <tr>
                            <th>Identity</th>
                            <th>Mean Score</th>
                            <th>Standard Deviation</th>
                        </tr>
                        <tr>
                            <td>Leader</td>
                            <td>${leaderMean.toFixed(2)}</td>
                            <td>${leaderStdDev.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Follower</td>
                            <td>${followerMean.toFixed(2)}</td>
                            <td>${followerStdDev.toFixed(2)}</td>
                        </tr>
                    </table>
                `;
                container.appendChild(fallbackDiv);
            }
        } catch (fallbackError) {
            console.error('Error creating fallback display:', fallbackError);
        }
    }
}

function createIdentitySwitchesChart(data) {
    try {
        const canvas = document.getElementById('identity-switches-chart');
        if (!canvas) {
            console.error('Canvas element not found: identity-switches-chart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Destroy any existing chart
        if (window.identitySwitchesChart) {
            window.identitySwitchesChart.destroy();
        }
        
        // Process data to count identity switches
        const dates = data.map(item => new Date(item.submitTime));
        const leaderScores = data.map(item => parseFloat(item.leaderScore));
        const followerScores = data.map(item => parseFloat(item.followerScore));
        
        // Determine dominant identity for each day
        const dominantIdentities = [];
        for (let i = 0; i < leaderScores.length; i++) {
            if (leaderScores[i] > followerScores[i]) {
                dominantIdentities.push('leader');
            } else if (followerScores[i] > leaderScores[i]) {
                dominantIdentities.push('follower');
            } else {
                dominantIdentities.push('equal');
            }
        }
        
        // Count switches
        let switchCount = 0;
        let cumulativeSwitches = [0];
        for (let i = 1; i < dominantIdentities.length; i++) {
            if (dominantIdentities[i] !== dominantIdentities[i-1] && 
                dominantIdentities[i] !== 'equal' && dominantIdentities[i-1] !== 'equal') {
                switchCount++;
            }
            cumulativeSwitches.push(switchCount);
        }
        
        // Create the chart
        try {
            window.identitySwitchesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Cumulative Identity Switches',
                        data: cumulativeSwitches,
                        borderColor: '#4BC0C0',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    day: 'MMM d'
                                }
                            },
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Switches'
                            },
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Cumulative Leader-Follower Identity Switches'
                        }
                    }
                }
            });
        } catch (chartError) {
            console.error('Error creating identity switches chart:', chartError);
            
            // Fallback to a simpler chart if needed
            window.identitySwitchesChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Total Switches'],
                    datasets: [{
                        label: 'Identity Switches',
                        data: [switchCount],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: '#4BC0C0',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total Leader-Follower Identity Switches'
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error creating identity switches chart:', error);
    }
}

function createIdentitySwitchesPieChart(data) {
    try {
        const canvas = document.getElementById('identity-switch-pie-chart');
        if (!canvas) {
            console.error('Canvas element not found: identity-switch-pie-chart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Destroy any existing chart
        if (window.identitySwitchesPieChart) {
            window.identitySwitchesPieChart.destroy();
        }
        
        // Process data to count identity types
        const leaderScores = data.map(item => parseFloat(item.leaderScore));
        const followerScores = data.map(item => parseFloat(item.followerScore));
        
        let leaderDominant = 0;
        let followerDominant = 0;
        let balanced = 0;
        
        for (let i = 0; i < data.length; i++) {
            if (leaderScores[i] > followerScores[i]) {
                leaderDominant++;
            } else if (followerScores[i] < leaderScores[i]) {
                followerDominant++;
            } else {
                balanced++;
            }
        }
        
        // Create the chart
        try {
            window.identitySwitchesPieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Leader Dominant', 'Follower Dominant', 'Balanced'],
                    datasets: [{
                        data: [leaderDominant, followerDominant, balanced],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Distribution of Identity Types'
                        },
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (chartError) {
            console.error('Error creating identity switches pie chart:', chartError);
            
            // Create a simpler fallback chart if needed
            const total = leaderDominant + followerDominant + balanced;
            const leaderPercent = Math.round((leaderDominant / total) * 100);
            const followerPercent = Math.round((followerDominant / total) * 100);
            const balancedPercent = Math.round((balanced / total) * 100);
            
            // Add text display as fallback
            const container = canvas.parentElement;
            const fallbackDiv = document.createElement('div');
            fallbackDiv.innerHTML = `
                <h4>Distribution of Identity Types:</h4>
                <ul>
                    <li>Leader Dominant: ${leaderDominant} days (${leaderPercent}%)</li>
                    <li>Follower Dominant: ${followerDominant} days (${followerPercent}%)</li>
                    <li>Balanced: ${balanced} days (${balancedPercent}%)</li>
                </ul>
            `;
            container.appendChild(fallbackDiv);
        }
    } catch (error) {
        console.error('Error creating identity switches pie chart:', error);
    }
}

function createDailyEventsSummary(data) {
    try {
        const canvas = document.getElementById('daily-events-chart');
        if (!canvas) {
            console.error('Canvas element not found: daily-events-chart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Destroy any existing chart
        if (window.dailyEventsChart) {
            window.dailyEventsChart.destroy();
        }
        
        // Process data to count events by type
        const eventCounts = {};
        let totalEvents = 0;
        
        for (const item of data) {
            if (item.events && item.events.length > 0) {
                const events = typeof item.events === 'string' ? JSON.parse(item.events) : item.events;
                
                for (const event of events) {
                    if (event && event.type) {
                        eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
                        totalEvents++;
                    }
                }
            }
        }
        
        // Sort event types by count (descending)
        const sortedEvents = Object.entries(eventCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Limit to top 10 events
        
        const labels = sortedEvents.map(item => item[0]);
        const counts = sortedEvents.map(item => item[1]);
        
        // Create the chart
        try {
            window.dailyEventsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Event Count',
                        data: counts,
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        borderColor: 'rgb(153, 102, 255)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Events'
                            },
                            ticks: {
                                stepSize: 1
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Event Type'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Daily Events Summary'
                        },
                        legend: {
                            display: false
                        }
                    }
                }
            });
            
            // Display total events count
            const totalEventsElement = document.getElementById('total-events-count');
            if (totalEventsElement) {
                totalEventsElement.textContent = totalEvents;
            }
            
            // Create event descriptions summary
            createEventDescriptionsSummary(data);
            
        } catch (chartError) {
            console.error('Error creating daily events chart:', chartError);
            
            // Create a fallback display
            const container = canvas.parentElement;
            const fallbackDiv = document.createElement('div');
            fallbackDiv.innerHTML = `
                <h4>Daily Events Summary:</h4>
                <p>Total events recorded: ${totalEvents}</p>
                <ul>
                    ${sortedEvents.map(event => `<li>${event[0]}: ${event[1]} occurrences</li>`).join('')}
                </ul>
            `;
            container.appendChild(fallbackDiv);
            
            // Still try to create the event descriptions summary
            try {
                createEventDescriptionsSummary(data);
            } catch (error) {
                console.error('Error creating event descriptions summary:', error);
            }
        }
    } catch (error) {
        console.error('Error creating daily events summary:', error);
    }
}

function createDayToDayDynamics(data) {
    try {
        const canvas = document.getElementById('day-to-day-dynamics-chart');
        if (!canvas) {
            console.error('Canvas element not found: day-to-day-dynamics-chart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Destroy any existing chart
        if (window.dayToDayDynamicsChart) {
            window.dayToDayDynamicsChart.destroy();
        }
        
        // Sort data by date
        data.sort((a, b) => new Date(a.submitTime) - new Date(b.submitTime));
        
        // Calculate day-to-day changes
        const dates = [];
        const leaderChanges = [];
        const followerChanges = [];
        
        for (let i = 1; i < data.length; i++) {
            const prevLeader = parseFloat(data[i-1].leaderScore);
            const prevFollower = parseFloat(data[i-1].followerScore);
            const currLeader = parseFloat(data[i].leaderScore);
            const currFollower = parseFloat(data[i].followerScore);
            
            const leaderChange = currLeader - prevLeader;
            const followerChange = currFollower - prevFollower;
            
            dates.push(new Date(data[i].submitTime));
            leaderChanges.push(leaderChange);
            followerChanges.push(followerChange);
        }
        
        // Create the chart
        try {
            window.dayToDayDynamicsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Leader Identity Change',
                            data: leaderChanges,
                            backgroundColor: 'rgba(255, 99, 132, 0.7)',
                            borderColor: 'rgb(255, 99, 132)',
                            borderWidth: 1
                        },
                        {
                            label: 'Follower Identity Change',
                            data: followerChanges,
                            backgroundColor: 'rgba(54, 162, 235, 0.7)',
                            borderColor: 'rgb(54, 162, 235)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    day: 'MMM d'
                                }
                            },
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Change in Identity Score'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Day-to-Day Identity Changes'
                        }
                    }
                }
            });
        } catch (chartError) {
            console.error('Error creating day-to-day dynamics chart:', chartError);
            
            // Create a fallback display
            const container = canvas.parentElement;
            const fallbackDiv = document.createElement('div');
            
            // Calculate average changes
            const avgLeaderChange = leaderChanges.reduce((sum, val) => sum + val, 0) / leaderChanges.length;
            const avgFollowerChange = followerChanges.reduce((sum, val) => sum + val, 0) / followerChanges.length;
            
            fallbackDiv.innerHTML = `
                <h4>Day-to-Day Identity Changes Summary:</h4>
                <p>Average daily change in Leader identity: ${avgLeaderChange.toFixed(2)}</p>
                <p>Average daily change in Follower identity: ${avgFollowerChange.toFixed(2)}</p>
            `;
            container.appendChild(fallbackDiv);
        }
    } catch (error) {
        console.error('Error creating day-to-day dynamics chart:', error);
    }
}

function generateReporterPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add header
        doc.setFillColor(220, 220, 220);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('LFIT Reporter Summary', 105, 15, { align: 'center' });
        
        // Add user ID and date
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const userId = document.getElementById('reporter-user-id').value;
        doc.text(`User ID: ${userId}`, 20, 30);
        doc.text(`Report generated: ${new Date().toLocaleDateString()}`, 20, 40);
        
        let yPos = 55;
        
        // Capture and add charts
        const charts = ['identity-trajectory-chart', 'identity-switches-chart', 'identity-switch-pie-chart', 'general-identity-chart', 'event-strength-chart'];
        
        for (const chartId of charts) {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const chartImg = canvas.toDataURL('image/png');
                doc.text(getChartTitle(chartId), 20, yPos);
                yPos += 10;
                doc.addImage(chartImg, 'PNG', 20, yPos, 170, 85);
                yPos += 95;
                
                // Add description
                const description = getChartDescription(chartId);
                if (description) {
                    const splitText = doc.splitTextToSize(description, 170);
                    doc.text(splitText, 20, yPos);
                    yPos += splitText.length * 7 + 10;
                }
                
                // Add page break if needed
                if (yPos > 250 && chartId !== charts[charts.length - 1]) {
                    doc.addPage();
                    yPos = 20;
                }
            }
        }
        
        // Add identity variability data
        doc.text('Day-to-Day Identity Variability:', 20, yPos);
        yPos += 10;
        doc.text(`Leader identity variability: ${document.getElementById('leader-variability').textContent}`, 30, yPos);
        yPos += 7;
        doc.text(`Follower identity variability: ${document.getElementById('follower-variability').textContent}`, 30, yPos);
        yPos += 15;
        
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Leader-Follower Identity Tracker (LFIT)', 105, 285, { align: 'center' });
        }
        
        // Save the PDF
        doc.save(`LFIT_Report_${userId}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF report. Please try again.');
    }
}

function addChartDescriptions() {
    addChartDescription('identity-switch-pie-chart', 'This pie chart shows the proportion of days you identified more strongly as a leader, follower, or were in a liminal state (balanced between the two).');
    addChartDescription('identity-trajectory-chart', 'This chart shows how your leader and follower identities have changed over time. Higher values indicate a stronger identification with that role.');
    addChartDescription('general-identity-chart', 'This box plot displays the distribution of your leader and follower identity scores. The box represents the middle 50% of scores, with the line inside showing the median. The diamond marker shows the mean. The whiskers extend to the minimum and maximum scores.');
    addChartDescription('identity-switches-chart', 'This chart shows the number of times your dominant identity switched between leader and follower.');
    addChartDescription('event-strength-chart', 'This chart displays the average strength of daily events you experienced. Higher values indicate more impactful events that may have influenced your leader-follower identity.');
}

function addChartDescription(chartId, description) {
    const chartContainer = document.getElementById(chartId)?.closest('.chart-container');
    if (chartContainer) {
        let descriptionElement = chartContainer.querySelector('.chart-description');
        if (!descriptionElement) {
            descriptionElement = document.createElement('p');
            descriptionElement.className = 'chart-description';
            descriptionElement.style.fontSize = '0.9em';
            descriptionElement.style.fontStyle = 'italic';
            descriptionElement.style.color = '#555';
            descriptionElement.style.marginTop = '5px';
            chartContainer.appendChild(descriptionElement);
        }
        descriptionElement.textContent = description;
    } else {
        console.warn(`Chart container for ${chartId} not found`);
    }
}

// Helper functions
function calculateMean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function calculateStdDev(arr, mean) {
    if (arr.length <= 1) return 0;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

function calculateQuantile(arr, q) {
    const sorted = [...arr].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
}

function createEventDescriptionsSummary(data) {
    const eventSummaryElement = document.getElementById('event-summary');
    if (!eventSummaryElement) {
        console.error('Element not found: event-summary');
        return;
    }
    
    // Sort data by date
    data.sort((a, b) => new Date(a.submitTime) - new Date(b.submitTime));
    
    // Create event summary HTML
    let summaryHTML = '<h4>Event Descriptions by Date</h4>';
    summaryHTML += '<div class="event-descriptions">';
    
    for (const item of data) {
        const date = new Date(item.submitTime).toLocaleDateString();
        summaryHTML += `
            <div class="event-entry">
                <div class="event-date">${date}</div>
                <div class="event-metrics">
                    <span class="badge badge-primary">Novelty: ${item.novelty}</span>
                    <span class="badge badge-info">Disruption: ${item.disruption}</span>
                    <span class="badge badge-success">Extraordinariness: ${item.ordinariness}</span>
                </div>
                <div class="event-text">${item.eventDescription || 'No description provided'}</div>
            </div>
        `;
    }
    
    summaryHTML += '</div>';
    eventSummaryElement.innerHTML = summaryHTML;
    
    // Add some CSS
    const style = document.createElement('style');
    style.textContent = `
        .event-descriptions {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
        }
        .event-entry {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        .event-date {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .event-metrics {
            margin-bottom: 5px;
        }
        .event-text {
            font-style: italic;
            color: #555;
        }
        .badge {
            display: inline-block;
            padding: 0.25em 0.4em;
            font-size: 75%;
            font-weight: 700;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: 0.25rem;
            margin-right: 5px;
        }
        .badge-primary {
            color: #fff;
            background-color: #007bff;
        }
        .badge-info {
            color: #fff;
            background-color: #17a2b8;
        }
        .badge-success {
            color: #fff;
            background-color: #28a745;
        }
    `;
    document.head.appendChild(style);
}

function displayLiminalityInfo(data) {
    try {
        if (data.length < 2) {
            console.warn('Not enough data points for liminality calculation');
            return;
        }
        
        // Calculate liminality score
        let liminalPeriods = 0;
        let totalPeriods = data.length - 1;
        
        for (let i = 1; i < data.length; i++) {
            const prevLeader = parseFloat(data[i-1].leaderScore);
            const prevFollower = parseFloat(data[i-1].followerScore);
            const currLeader = parseFloat(data[i].leaderScore);
            const currFollower = parseFloat(data[i].followerScore);
            
            if (Math.abs(currLeader - currFollower) <= 10 && Math.abs(prevLeader - prevFollower) <= 10) {
                liminalPeriods++;
            }
        }
        
        const liminalityScore = (liminalPeriods / totalPeriods) * 100;
        
        // Display liminality information
        const liminalitySection = document.getElementById('liminality-section');
        if (liminalitySection) {
            const liminalityText = `
                <h3>Identity Liminality</h3>
                <p>Identity liminality represents periods where leader and follower identities appear in a transitional or threshold state. This occurs when the difference between leader and follower identity scores is small (10% or less) for consecutive time points.</p>
                <p>Your liminality score: ${liminalityScore.toFixed(2)}%</p>
                <p>Interpretation:</p>
                <ul>
                    <li>0-20%: Low liminality - Your leader and follower identities are usually distinct.</li>
                    <li>21-40%: Moderate liminality - You experience some periods of identity transition.</li>
                    <li>41-60%: High liminality - Your identities are often in a state of flux.</li>
                    <li>61-100%: Very high liminality - Your leader and follower identities are frequently intertwined.</li>
                </ul>
            `;
            liminalitySection.innerHTML = liminalityText;
        } else {
            console.error('Element not found: liminality-section');
        }
    } catch (error) {
        console.error('Error displaying liminality info:', error);
    }
}

function getChartTitle(chartId) {
    const titles = {
        'identity-trajectory-chart': 'Leader and Follower Identity Trajectory',
        'identity-switches-chart': 'Cumulative Leader-Follower Identity Switches',
        'identity-switch-pie-chart': 'Identity Dominance Distribution',
        'general-identity-chart': 'Distribution of Leader and Follower Identity Scores',
        'event-strength-chart': 'Daily Event Characteristics'
    };
    return titles[chartId] || 'Chart';
}

function getChartDescription(chartId) {
    const descriptions = {
        'identity-trajectory-chart': 'This chart shows how your leader and follower identities have changed over time. Higher values indicate a stronger identification with that role.',
        'identity-switches-chart': 'This chart shows the number of times your dominant identity switched between leader and follower.',
        'identity-switch-pie-chart': 'This pie chart shows the proportion of days you identified more strongly as a leader, follower, or were in a liminal state (balanced between the two).',
        'general-identity-chart': 'This box plot displays the distribution of your leader and follower identity scores. The box represents the middle 50% of scores, with the line inside showing the median. The diamond marker shows the mean. The whiskers extend to the minimum and maximum scores.',
        'event-strength-chart': 'This chart displays the average strength of daily events you experienced. Higher values indicate more impactful events that may have influenced your leader-follower identity.'
    };
    return descriptions[chartId] || '';
}