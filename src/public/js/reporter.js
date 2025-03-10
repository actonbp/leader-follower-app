// This file contains exported functions for use in main.js

// Export the chart creation functions
export function createIdentityTrajectoryChart(data) {
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
        
        // Create the chart
        new Chart(ctx, {
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

export function createGeneralIdentitySummary(data) {
    try {
        const canvas = document.getElementById('general-identity-chart');
        if (!canvas) {
            console.error('Canvas element not found: general-identity-chart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Extract identity scores
        const leaderScores = data.map(item => parseFloat(item.leaderScore));
        const followerScores = data.map(item => parseFloat(item.followerScore));
        
        // Calculate statistics
        const leaderMean = calculateMean(leaderScores);
        const followerMean = calculateMean(followerScores);
        const leaderStdDev = calculateStdDev(leaderScores, leaderMean);
        const followerStdDev = calculateStdDev(followerScores, followerMean);
        
        // Create box plot
        new Chart(ctx, {
            type: 'boxplot',
            data: {
                labels: ['Leader Identity', 'Follower Identity'],
                datasets: [
                    {
                        label: 'Identity Scores',
                        backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'],
                        borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
                        borderWidth: 1,
                        outlierColor: '#999999',
                        padding: 10,
                        itemRadius: 0,
                        data: [
                            {
                                min: Math.max(0, Math.min(...leaderScores)),
                                q1: calculateQuantile(leaderScores, 0.25),
                                median: calculateQuantile(leaderScores, 0.5),
                                q3: calculateQuantile(leaderScores, 0.75),
                                max: Math.max(...leaderScores),
                                mean: leaderMean
                            },
                            {
                                min: Math.max(0, Math.min(...followerScores)),
                                q1: calculateQuantile(followerScores, 0.25),
                                median: calculateQuantile(followerScores, 0.5),
                                q3: calculateQuantile(followerScores, 0.75),
                                max: Math.max(...followerScores),
                                mean: followerMean
                            }
                        ]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
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
                        text: 'Distribution of Leader and Follower Identity Scores'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dataset = context.dataset;
                                const dataIndex = context.dataIndex;
                                const dataPoint = dataset.data[dataIndex];
                                
                                return [
                                    `Min: ${dataPoint.min.toFixed(1)}`,
                                    `Q1: ${dataPoint.q1.toFixed(1)}`,
                                    `Median: ${dataPoint.median.toFixed(1)}`,
                                    `Mean: ${dataPoint.mean.toFixed(1)}`,
                                    `Q3: ${dataPoint.q3.toFixed(1)}`,
                                    `Max: ${dataPoint.max.toFixed(1)}`
                                ];
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating general identity chart:', error);
    }
}

export function createIdentitySwitchesChart(data) {
    try {
        if (data.length < 2) {
            console.warn('Not enough data points to calculate identity switches');
            return;
        }
        
        const canvas = document.getElementById('identity-switches-chart');
        if (!canvas) {
            console.error('Canvas element not found: identity-switches-chart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Sort data by date
        data.sort((a, b) => new Date(a.submitTime) - new Date(b.submitTime));
        
        // Calculate identity switches and dates
        let switchDates = [];
        let switchValues = [];
        let totalSwitches = 0;
        
        for (let i = 1; i < data.length; i++) {
            const prevLeader = parseFloat(data[i-1].leaderScore);
            const prevFollower = parseFloat(data[i-1].followerScore);
            const currLeader = parseFloat(data[i].leaderScore);
            const currFollower = parseFloat(data[i].followerScore);
            
            const prevDominant = prevLeader > prevFollower ? 'leader' : 'follower';
            const currDominant = currLeader > currFollower ? 'leader' : 'follower';
            
            if (prevDominant !== currDominant) {
                totalSwitches++;
                switchDates.push(new Date(data[i].submitTime));
                switchValues.push(totalSwitches);
            }
        }
        
        // Create the chart
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Cumulative Identity Switches',
                    data: switchDates.map((date, index) => ({ x: date, y: switchValues[index] })),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    stepped: true
                }]
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
                        title: {
                            display: true,
                            text: 'Number of Switches'
                        },
                        stepSize: 1
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
    } catch (error) {
        console.error('Error creating identity switches chart:', error);
    }
}

export function createIdentitySwitchesPieChart(data) {
    try {
        if (data.length < 1) {
            console.warn('Not enough data points for identity pie chart');
            return;
        }
        
        const canvas = document.getElementById('identity-switch-pie-chart');
        if (!canvas) {
            console.error('Canvas element not found: identity-switch-pie-chart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Count days by dominant identity
        let leaderDominant = 0;
        let followerDominant = 0;
        let liminalState = 0;
        
        for (const item of data) {
            const leaderScore = parseFloat(item.leaderScore);
            const followerScore = parseFloat(item.followerScore);
            const difference = Math.abs(leaderScore - followerScore);
            
            if (difference < 10) {
                liminalState++;
            } else if (leaderScore > followerScore) {
                leaderDominant++;
            } else {
                followerDominant++;
            }
        }
        
        // Create the pie chart
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Leader Dominant', 'Follower Dominant', 'Liminal State'],
                datasets: [{
                    data: [leaderDominant, followerDominant, liminalState],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Identity Dominance Distribution'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating identity switches pie chart:', error);
    }
}

export function createDailyEventsSummary(data) {
    try {
        if (data.length < 1) {
            console.warn('Not enough data points for events chart');
            return;
        }
        
        const canvas = document.getElementById('event-strength-chart');
        if (!canvas) {
            console.error('Canvas element not found: event-strength-chart');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Extract dates and event metrics
        const dates = data.map(item => new Date(item.submitTime));
        const noveltyScores = data.map(item => parseInt(item.novelty));
        const disruptionScores = data.map(item => parseInt(item.disruption));
        const ordinarinessScores = data.map(item => parseInt(item.ordinariness));
        
        // Create the chart
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Novelty',
                        data: dates.map((date, index) => ({ x: date, y: noveltyScores[index] })),
                        borderColor: '#FF6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.1
                    },
                    {
                        label: 'Disruption',
                        data: dates.map((date, index) => ({ x: date, y: disruptionScores[index] })),
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.1
                    },
                    {
                        label: 'Extraordinariness',
                        data: dates.map((date, index) => ({ x: date, y: ordinarinessScores[index] })),
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
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
                        min: 1,
                        max: 7,
                        title: {
                            display: true,
                            text: 'Event Strength (1-7)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Daily Event Characteristics'
                    }
                }
            }
        });
        
        // Create event descriptions summary
        createEventDescriptionsSummary(data);
    } catch (error) {
        console.error('Error creating daily events chart:', error);
    }
}

export function createDayToDayDynamics(data) {
    try {
        if (data.length < 2) {
            console.warn('Not enough data points for day-to-day dynamics');
            return;
        }
        
        // Calculate day-to-day variability
        const leaderScores = data.map(item => parseFloat(item.leaderScore));
        const followerScores = data.map(item => parseFloat(item.followerScore));
        
        let leaderDifferences = [];
        let followerDifferences = [];
        
        for (let i = 1; i < data.length; i++) {
            leaderDifferences.push(Math.abs(leaderScores[i] - leaderScores[i-1]));
            followerDifferences.push(Math.abs(followerScores[i] - followerScores[i-1]));
        }
        
        const leaderVariability = calculateMean(leaderDifferences);
        const followerVariability = calculateMean(followerDifferences);
        
        // Display the variability in the table
        document.getElementById('leader-variability').textContent = leaderVariability.toFixed(2);
        document.getElementById('follower-variability').textContent = followerVariability.toFixed(2);
        
        // Display liminality information
        displayLiminalityInfo(data);
    } catch (error) {
        console.error('Error calculating day-to-day dynamics:', error);
    }
}

export function generateReporterPDF() {
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

export function addChartDescriptions() {
    addChartDescription('identity-switch-pie-chart', 'This pie chart shows the proportion of days you identified more strongly as a leader, follower, or were in a liminal state (balanced between the two).');
    addChartDescription('identity-trajectory-chart', 'This chart shows how your leader and follower identities have changed over time. Higher values indicate a stronger identification with that role.');
    addChartDescription('general-identity-chart', 'This box plot displays the distribution of your leader and follower identity scores. The box represents the middle 50% of scores, with the line inside showing the median. The diamond marker shows the mean. The whiskers extend to the minimum and maximum scores.');
    addChartDescription('identity-switches-chart', 'This chart shows the number of times your dominant identity switched between leader and follower.');
    addChartDescription('event-strength-chart', 'This chart displays the average strength of daily events you experienced. Higher values indicate more impactful events that may have influenced your leader-follower identity.');
}

export function addChartDescription(chartId, description) {
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