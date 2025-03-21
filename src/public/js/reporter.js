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
        const canvas = document.getElementById('event-strength-chart');
        if (!canvas) {
            console.error('Canvas element not found: event-strength-chart');
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
        
        // Process data for event characteristics (novelty, disruption, ordinariness)
        const dates = data.map(item => new Date(item.submitTime));
        const noveltyValues = data.map(item => parseInt(item.novelty || 0));
        const disruptionValues = data.map(item => parseInt(item.disruption || 0));
        const extraordinarinessValues = data.map(item => parseInt(item.ordinariness || 0));
        
        // Create the event characteristics chart
        try {
            window.dailyEventsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Novelty',
                            data: noveltyValues,
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            borderWidth: 2,
                            pointRadius: 5
                        },
                        {
                            label: 'Disruption',
                            data: disruptionValues,
                            borderColor: 'rgb(54, 162, 235)',
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            borderWidth: 2,
                            pointRadius: 5
                        },
                        {
                            label: 'Extraordinariness',
                            data: extraordinarinessValues,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.1)',
                            borderWidth: 2,
                            pointRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            min: 0,
                            max: 7,
                            title: {
                                display: true,
                                text: 'Event Strength (1-7)'
                            },
                            ticks: {
                                stepSize: 1
                            }
                        },
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
            
            // Display total events count
            const totalEventsElement = document.getElementById('total-events-count');
            if (totalEventsElement) {
                totalEventsElement.textContent = data.length;
            }
            
            // Create event descriptions summary
            createEventDescriptionsSummary(data);
            
        } catch (chartError) {
            console.error('Error creating event strength chart:', chartError);
            
            // Create a fallback display
            const container = canvas.parentElement;
            const fallbackDiv = document.createElement('div');
            
            // Calculate averages
            const avgNovelty = calculateMean(noveltyValues);
            const avgDisruption = calculateMean(disruptionValues);
            const avgExtraordinariness = calculateMean(extraordinarinessValues);
            
            fallbackDiv.innerHTML = `
                <h4>Daily Events Summary:</h4>
                <p>Total events recorded: ${data.length}</p>
                <ul>
                    <li>Average Novelty: ${avgNovelty.toFixed(2)} / 7</li>
                    <li>Average Disruption: ${avgDisruption.toFixed(2)} / 7</li>
                    <li>Average Extraordinariness: ${avgExtraordinariness.toFixed(2)} / 7</li>
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
    console.log('Generating reporter PDF');
    
    // Get the user ID from the URL or use "anonymous"
    const userId = getUserIdFromUrl() || 'anonymous';
    
    // Use our new enhanced printable report approach
    generateEnhancedPrintableReport(userId);
}

function loadJsPDF(userId) {
    const jsPdfScript = document.createElement('script');
    jsPdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jsPdfScript.onload = function() {
        console.log('jsPDF loaded successfully, continuing with PDF generation');
        generatePDFWithLibrary(userId);
    };
    jsPdfScript.onerror = function(error) {
        console.error('Failed to load jsPDF:', error);
        alert('Failed to load PDF generation library. Please check your internet connection and try again.');
    };
    document.head.appendChild(jsPdfScript);
}

function generatePDFWithLibrary(userId) {
    try {
        console.log('Generating PDF with library');
        
        // Make sure jsPDF is available
        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error("jsPDF is not available");
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add header
        doc.setFillColor(220, 220, 220);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Leader-Follower Identity Tracker', 105, 15, { align: 'center' });
        
        // Add user ID and date
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`User ID: ${userId}`, 20, 30);
        doc.text(`Report generated: ${new Date().toLocaleDateString()}`, 20, 40);
        
        let yPos = 55;
        
        // No longer ask for text-only report - we'll attempt to generate the visual report first
        // and only fall back to text-only if needed
        
        // Define sections and their information
        const sections = [
            {
                title: 'Leader and Follower Identity Trajectory',
                chartId: 'identity-trajectory-chart',
            },
            {
                title: 'General Identity and Equilibrium',
                chartId: 'general-identity-chart',
            },
            {
                title: 'Distribution of Identity Types',
                chartId: 'identity-switch-pie-chart',
            },
            {
                title: 'Day-to-Day Identity Dynamics',
                chartId: 'identity-switches-chart',
            },
            {
                title: 'Daily Events',
                chartId: 'event-strength-chart',
            }
        ];
        
        // Improved function to capture chart using html2canvas with better error handling
        const captureChart = async (chartElement) => {
            if (typeof html2canvas === 'undefined') {
                console.error("html2canvas library not loaded");
                return null; // Return null to handle gracefully later
            }
            
            try {
                // Force repaint to ensure chart is visible
                chartElement.style.visibility = 'visible';
                chartElement.style.opacity = '1';
                
                // Add a longer delay to ensure chart is fully rendered
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Try with more conservative settings first
                const canvas = await html2canvas(chartElement, {
                    scale: 2, // Higher quality
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    allowTaint: true, // Try to allow tainted canvases
                    foreignObjectRendering: false, // Disable for better compatibility
                    removeContainer: true, // Cleanup after capture
                    imageTimeout: 15000, // Longer timeout for images
                });
                
                return canvas.toDataURL('image/png');
            } catch (err) {
                console.error("Error capturing chart with html2canvas:", err);
                
                // Try a second approach with different settings
                try {
                    console.log("Trying alternative html2canvas configuration");
                    const canvas = await html2canvas(chartElement, {
                        scale: 1, // Lower quality but more reliable
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        allowTaint: false, // Be more strict
                        foreignObjectRendering: false,
                    });
                    return canvas.toDataURL('image/png');
                } catch (secondError) {
                    console.error("Second html2canvas attempt failed:", secondError);
                    
                    // Last resort: try native canvas toDataURL if it's a canvas element
                    if (chartElement.tagName.toLowerCase() === 'canvas') {
                        try {
                            return chartElement.toDataURL('image/png');
                        } catch (canvasError) {
                            console.error("Native canvas toDataURL failed:", canvasError);
                            return null; // Couldn't capture this chart
                        }
                    }
                    
                    return null; // Couldn't capture this chart
                }
            }
        };
        
        // Process charts one by one with promises
        const processCharts = async () => {
            try {
                // Track if any charts were captured successfully
                let capturedChartCount = 0;
                let failedChartCount = 0;
                
                for (const section of sections) {
                    const chartElement = document.getElementById(section.chartId);
                    if (!chartElement) {
                        console.warn(`Chart element ${section.chartId} not found in DOM`);
                        continue;
                    }
                    
                    // Add section title
                    doc.setFont('helvetica', 'bold');
                    doc.text(section.title, 20, yPos);
                    yPos += 10;
                    
                    // Try to capture the chart
                    try {
                        let chartImg = await captureChart(chartElement);
                        
                        if (chartImg) {
                            capturedChartCount++;
                            doc.addImage(chartImg, 'PNG', 20, yPos, 170, 85);
                            yPos += 95;
                        } else {
                            failedChartCount++;
                            throw new Error("Chart capture returned empty result");
                        }
                    } catch (imgError) {
                        console.error(`Failed to capture image for ${section.chartId}:`, imgError);
                        
                        // Add text description instead
                        doc.setFont('helvetica', 'normal');
                        doc.text(`[Chart image could not be captured]`, 20, yPos);
                        yPos += 10;
                    }
                    
                    // Add description
                    doc.setFont('helvetica', 'normal');
                    const description = getChartDescription(section.chartId);
                    if (description) {
                        const splitText = doc.splitTextToSize(description, 170);
                        doc.text(splitText, 20, yPos);
                        yPos += splitText.length * 7 + 10;
                    }
                    
                    // Add page break if needed
                    if (yPos > 250 && section !== sections[sections.length - 1]) {
                        doc.addPage();
                        yPos = 20;
                    }
                }
                
                // Check if we failed to capture all charts
                if (capturedChartCount === 0 && failedChartCount > 0) {
                    console.warn("Failed to capture any charts. Switching to text-only report");
                    // Only show alert if all charts failed to capture
                    generateTextOnlyPDF(new jsPDF(), userId, 55);
                    return;
                }
                
                // Add identity variability data
                doc.setFont('helvetica', 'bold');
                doc.text('Day-to-Day Identity Variability:', 20, yPos);
                yPos += 10;
                
                doc.setFont('helvetica', 'normal');
                const leaderVariability = document.getElementById('leader-variability');
                const followerVariability = document.getElementById('follower-variability');
                
                if (leaderVariability && followerVariability) {
                    doc.text(`Leader identity variability: ${leaderVariability.textContent}`, 30, yPos);
                    yPos += 7;
                    doc.text(`Follower identity variability: ${followerVariability.textContent}`, 30, yPos);
                    yPos += 15;
                } else {
                    doc.text('Variability data not available', 30, yPos);
                    yPos += 15;
                }
                
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
                console.log('PDF generation completed successfully');
                
                // Hide loading indicator after successful generation
                const loadingIndicator = document.getElementById('loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                
            } catch (processError) {
                console.error('Error in chart processing:', processError);
                
                // Final fallback - switch to text-only mode
                console.log('Switching to text-only report due to error:', processError.message);
                generateTextOnlyPDF(new jsPDF(), userId, 55);
            }
        };
        
        // Start processing charts
        processCharts().catch(error => {
            console.error('Fatal error in chart processing:', error);
            
            // Hide loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            // Final fallback
            alert(`Error generating PDF. Switching to text-only version.`);
            generateTextOnlyPDF(new jsPDF(), userId, 55);
        });
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        alert(`Error generating PDF report: ${error.message}. Please try again.`);
    }
}

// Text-only PDF generation as a fallback
function generateTextOnlyPDF(doc, userId, startY) {
    try {
        console.log('Generating text-only PDF report');
        
        // Check if we need to update the loading indicator text
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator && loadingIndicator.style.display === 'block') {
            loadingIndicator.querySelector('p').textContent = 'Generating text-only PDF report...';
        }
        
        // Make sure we have a valid jsPDF instance
        let pdfDoc;
        try {
            // Use the provided document if possible
            pdfDoc = doc instanceof Object && typeof doc.addPage === 'function' ? doc : null;
        } catch (e) {
            console.warn('Invalid jsPDF document provided:', e);
            pdfDoc = null;
        }
        
        // Create a new jsPDF instance if needed
        if (!pdfDoc) {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                throw new Error("jsPDF library is not available");
            }
            pdfDoc = new window.jspdf.jsPDF();
        }
        
        // Add header
        pdfDoc.setFillColor(220, 220, 220);
        pdfDoc.rect(0, 0, 210, 20, 'F');
        pdfDoc.setFontSize(16);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text('Leader-Follower Identity Tracker - Text Report', 105, 15, { align: 'center' });
        
        // Add user ID and date
        pdfDoc.setFontSize(12);
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.text(`User ID: ${userId}`, 20, 30);
        pdfDoc.text(`Report generated: ${new Date().toLocaleDateString()}`, 20, 40);
        
        let yPos = startY || 55;
        
        // Get data from the DOM
        const leaderVariability = document.getElementById('leader-variability');
        const followerVariability = document.getElementById('follower-variability');
        
        // Section 1: Identity Trajectory
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text('Leader and Follower Identity Trajectory', 20, yPos);
        yPos += 10;
        
        pdfDoc.setFont('helvetica', 'normal');
        const description1 = getChartDescription('identity-trajectory-chart');
        if (description1) {
            const splitText = pdfDoc.splitTextToSize(description1, 170);
            pdfDoc.text(splitText, 20, yPos);
            yPos += splitText.length * 7 + 10;
        }
        
        // Extract identity information text
        try {
            // Use the reported leader and follower variability to provide some data
            pdfDoc.text('Your Identity Data Summary:', 20, yPos);
            yPos += 10;
            
            if (leaderVariability && followerVariability) {
                pdfDoc.text(`• Leader identity variability: ${leaderVariability.textContent}`, 30, yPos);
                yPos += 7;
                pdfDoc.text(`• Follower identity variability: ${followerVariability.textContent}`, 30, yPos);
                yPos += 10;
                
                // Add some general interpretation
                const variabilityText = "Your identity data shows how your sense of being a leader and follower changes over time. The variability scores indicate how much these identities fluctuate day to day.";
                const splitVarText = pdfDoc.splitTextToSize(variabilityText, 170);
                pdfDoc.text(splitVarText, 30, yPos);
                yPos += splitVarText.length * 7 + 10;
            } else {
                pdfDoc.text('Detailed identity data not available in text-only report', 30, yPos);
                yPos += 10;
            }
        } catch (dataError) {
            console.error('Error extracting identity data:', dataError);
            pdfDoc.text('Error extracting identity data details', 30, yPos);
            yPos += 10;
        }
        
        // Add page break if needed
        if (yPos > 250) {
            pdfDoc.addPage();
            yPos = 20;
        }
        
        // Section 2: Variability and Interpretation
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text('Day-to-Day Identity Variability', 20, yPos);
        yPos += 10;
        
        pdfDoc.setFont('helvetica', 'normal');
        const variabilityInfo = `
        Identity variability measures how much your leader and follower identities change from day to day. Higher values indicate more significant changes in how you see yourself.
        
        Interpretation:
        • 0-10: Low variability - Your identity is relatively stable
        • 10-20: Moderate variability - You experience regular changes in identity
        • >20: High variability - Your identity fluctuates significantly
        
        High variability means you felt very much like a leader on some days and not at all on others. Low variability means your feelings of being a leader or follower were more consistent.
        `;
        
        const splitVarInfo = pdfDoc.splitTextToSize(variabilityInfo.trim(), 170);
        pdfDoc.text(splitVarInfo, 20, yPos);
        yPos += splitVarInfo.length * 7 + 10;
        
        // Add page break if needed
        if (yPos > 250) {
            pdfDoc.addPage();
            yPos = 20;
        }
        
        // Section 3: Events Summary
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text('Daily Events Summary', 20, yPos);
        yPos += 10;
        
        pdfDoc.setFont('helvetica', 'normal');
        const eventsInfo = `
        Your daily experiences influence how you see yourself as a leader or follower. The events you recorded were rated on three dimensions:
        
        • Novelty: How new or familiar the event was
        • Disruption: How much the event disrupted your routine
        • Extraordinariness: How ordinary or extraordinary the event was
        
        More novel, disruptive, and extraordinary events tend to have a stronger impact on your leader-follower identity.
        `;
        
        const splitEventsInfo = pdfDoc.splitTextToSize(eventsInfo.trim(), 170);
        pdfDoc.text(splitEventsInfo, 20, yPos);
        yPos += splitEventsInfo.length * 7 + 10;
        
        // Add footer
        const pageCount = pdfDoc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdfDoc.setPage(i);
            pdfDoc.setFontSize(10);
            pdfDoc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            pdfDoc.text('Leader-Follower Identity Tracker (LFIT) - Text Report', 105, 285, { align: 'center' });
        }
        
        // Save the PDF
        pdfDoc.save(`LFIT_Report_${userId}.pdf`);
        console.log('Text-only PDF generation completed successfully');
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error generating text-only PDF:', error);
        alert(`Error generating PDF: ${error.message}. Please try again.`);
        
        // Hide loading indicator on error
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

// Helper functions for text-only PDF
function extractTrajectoryData() {
    try {
        // This is a simplified extraction - in a real implementation,
        // you would get this data from your chart.js instances
        return [
            { date: 'Recent data', leader: 'See chart for values', follower: 'See chart for values' }
        ];
    } catch (err) {
        console.error('Error extracting trajectory data:', err);
        return [];
    }
}

function calculateMeanForElement(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.textContent : 'N/A';
}

function calculateIdentityDistribution() {
    // In a real implementation, you would calculate this from your data
    return {
        leader: 'See chart for values',
        follower: 'See chart for values',
        balanced: 'See chart for values'
    };
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
        // Create the event summary element if it doesn't exist
        const eventsTab = document.getElementById('events-tab');
        if (eventsTab) {
            const newEventSummary = document.createElement('div');
            newEventSummary.id = 'event-summary';
            eventsTab.appendChild(newEventSummary);
            console.log('Created event-summary element');
        } else {
            console.error('Cannot create event-summary, events-tab not found');
            return;
        }
    }
    
    // Sort data by date
    data.sort((a, b) => new Date(a.submitTime) - new Date(b.submitTime));
    
    // Create event summary HTML
    let summaryHTML = '<h4>Event Descriptions by Date</h4>';
    summaryHTML += '<div class="event-descriptions">';
    
    // Check if we have any data
    if (data.length === 0) {
        summaryHTML += '<p>No event data found for this user.</p>';
    } else {
        for (const item of data) {
            const date = new Date(item.submitTime).toLocaleDateString();
            summaryHTML += `
                <div class="event-entry">
                    <div class="event-date">${date}</div>
                    <div class="event-metrics">
                        <span class="badge badge-primary">Novelty: ${item.novelty || 'N/A'}</span>
                        <span class="badge badge-info">Disruption: ${item.disruption || 'N/A'}</span>
                        <span class="badge badge-success">Extraordinariness: ${item.ordinariness || 'N/A'}</span>
                    </div>
                    <div class="event-text">${item.eventDescription || 'No description provided'}</div>
                </div>
            `;
        }
    }
    
    summaryHTML += '</div>';
    
    // Get the event summary element again (might have been created)
    const updatedEventSummaryElement = document.getElementById('event-summary');
    if (updatedEventSummaryElement) {
        updatedEventSummaryElement.innerHTML = summaryHTML;
    }
    
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

/**
 * Generates an enhanced printable view for PDF export
 * This approach uses the browser's built-in print functionality
 * which is more reliable than jsPDF for complex charts
 */
function generateEnhancedPrintableReport(userId) {
    console.log('Generating enhanced printable report');
    
    // Open a new window for the report
    const reportWindow = window.open('', '_blank');
    
    // Get current date formatted
    const currentDate = new Date().toLocaleDateString();
    
    // Get the charts HTML content
    const trajectoryChart = document.getElementById('identity-trajectory-chart');
    const pieChart = document.getElementById('identity-switches-pie-chart');
    const dynamicsChart = document.getElementById('day-to-day-dynamics-chart');
    const eventsChart = document.getElementById('event-strength-chart');
    
    // Get metrics data
    const metrics = getReportMetrics();
    
    // Write a professionally styled document
    reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Leadership Identity Report</title>
            <style>
                /* Professional print styling */
                @page {
                    size: letter;
                    margin: 2cm;
                }
                
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    color: #333;
                    line-height: 1.5;
                    margin: 0;
                    padding: 0;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .report-header {
                    text-align: center;
                    padding: 1cm 0 2cm 0;
                    border-bottom: 1px solid #ddd;
                    margin-bottom: 1.5cm;
                }
                
                .logo {
                    max-width: 150px;
                    margin-bottom: 0.5cm;
                }
                
                h1 {
                    font-size: 24pt;
                    color: #2c3e50;
                    margin-bottom: 0.5cm;
                }
                
                h2 {
                    font-size: 18pt;
                    color: #3498db;
                    margin-top: 1.5cm;
                    margin-bottom: 0.5cm;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 0.3cm;
                    page-break-after: avoid;
                }
                
                h3 {
                    font-size: 14pt;
                    color: #2c3e50;
                    margin-top: 1cm;
                    margin-bottom: 0.3cm;
                }
                
                .chart-container {
                    page-break-inside: avoid;
                    margin: 1cm 0 1.5cm 0;
                    text-align: center;
                }
                
                .chart-container img {
                    max-width: 100%;
                    height: auto;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                .description {
                    font-style: italic;
                    color: #555;
                    margin: 0.5cm 0 1cm 0;
                    line-height: 1.4;
                }
                
                .metrics-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1cm;
                    margin: 1cm 0 2cm 0;
                }
                
                .metric-card {
                    border: 1px solid #eee;
                    padding: 0.8cm;
                    border-radius: 0.3cm;
                    page-break-inside: avoid;
                    background-color: #f9f9f9;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }
                
                .metric-card h3 {
                    margin-top: 0;
                    color: #3498db;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 0.3cm;
                    margin-bottom: 0.5cm;
                }
                
                .metric-card p {
                    font-size: 14pt;
                    margin: 0.5cm 0;
                }
                
                .summary-section {
                    margin-top: 2cm;
                    padding-top: 1cm;
                    page-break-before: always;
                }
                
                .footer {
                    text-align: center;
                    font-size: 9pt;
                    color: #7f8c8d;
                    margin-top: 3cm;
                    padding-top: 0.5cm;
                    border-top: 1px solid #eee;
                }
                
                .print-button {
                    display: block;
                    margin: 2cm auto;
                    padding: 0.5cm 1cm;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 0.2cm;
                    font-size: 12pt;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                
                .print-button:hover {
                    background: #2980b9;
                }
                
                .citation {
                    font-size: 8pt;
                    margin-top: 0.5cm;
                    color: #555;
                    line-height: 1.4;
                }
                
                .no-data {
                    font-style: italic;
                    color: #777;
                    padding: 1cm;
                    border: 1px dashed #ddd;
                    text-align: center;
                    margin: 1cm 0;
                }
                
                @media print {
                    .print-button { display: none; }
                    
                    /* Fix for page breaks */
                    h2, h3 { page-break-after: avoid; }
                    .chart-container { page-break-inside: avoid; }
                    .metric-card { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <img src="/images/logo.png" alt="LFIT Logo" class="logo" onerror="this.style.display='none'">
                <h1>Leadership Identity Report</h1>
                <p>Prepared on ${currentDate}</p>
                <p>User ID: ${userId}</p>
            </div>
            
            <h2>Identity Trajectory Overview</h2>
            <p class="description">This chart shows your leader and follower identity strength over time, highlighting your identity trajectory patterns.</p>
            <div class="chart-container">
                ${trajectoryChart ? 
                  `<img src="${convertCanvasToImage(trajectoryChart)}" alt="Identity Trajectory Chart">` : 
                  '<div class="no-data">Identity trajectory data not available</div>'}
            </div>
            
            <h2>Identity Distribution</h2>
            <p class="description">This pie chart shows the distribution of your different identity types throughout the recorded period.</p>
            <div class="chart-container">
                ${pieChart ? 
                  `<img src="${convertCanvasToImage(pieChart)}" alt="Identity Distribution Chart">` : 
                  '<div class="no-data">Identity distribution data not available</div>'}
            </div>
            
            <h2>Day-to-Day Dynamics</h2>
            <p class="description">This chart visualizes how your identities change from day to day, showing patterns in your identity fluctuations.</p>
            <div class="chart-container">
                ${dynamicsChart ? 
                  `<img src="${convertCanvasToImage(dynamicsChart)}" alt="Day-to-Day Dynamics Chart">` : 
                  '<div class="no-data">Day-to-day dynamics data not available</div>'}
            </div>
            
            <h2>Daily Events</h2>
            <p class="description">This chart shows the characteristics of daily events that may have influenced your identity changes.</p>
            <div class="chart-container">
                ${eventsChart ? 
                  `<img src="${convertCanvasToImage(eventsChart)}" alt="Daily Events Chart">` : 
                  '<div class="no-data">Event data not available</div>'}
            </div>
            
            <div class="summary-section">
                <h2>Key Metrics Summary</h2>
                <div class="metrics-grid">
                    ${renderMetricsCards(metrics)}
                </div>
                
                <h3>Understanding Your Results</h3>
                <p>This report provides insights into how your leader and follower identities fluctuate over time. Your leader-follower identity dynamics reflect natural variations in how you see yourself in different contexts and situations.</p>
                
                <p>Key patterns to look for:</p>
                <ul>
                    <li><strong>Identity Balance:</strong> How balanced are your leader and follower identities over time?</li>
                    <li><strong>Switching Patterns:</strong> How frequently do you switch between dominant identities?</li>
                    <li><strong>Event Impacts:</strong> Do significant events trigger identity changes?</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} Leadership Identity Framework | Generated via LFIT.me</p>
                <p class="citation">Nieberle, K. W., Acton, B. P., Fu, Y. A., Lord, R. G., & Braun, S. (2024). Lead Today, Follow Tomorrow? How to Manage the Ebb and Flow of Leader and Follower Identities. In S. Braun, T. Hansbrough, G. A. Ruark, R. G. Lord, R. J. Hall & O. Epitropaki (Eds.), Navigating Leadership: Evidence-Based Strategies for Leadership Development (pp. 9-35). Routledge.</p>
            </div>
            
            <button class="print-button" onclick="window.print()">Save as PDF / Print Report</button>
            
            <script>
                // Auto-open print dialog after content is fully loaded
                window.onload = function() {
                    // Give a slight delay to ensure everything is rendered
                    setTimeout(function() {
                        // Uncomment this line if you want the print dialog to open automatically
                        // window.print();
                    }, 1000);
                };
            </script>
        </body>
        </html>
    `);

    // Helper function to convert canvas to image data URL
    function convertCanvasToImage(canvas) {
        // If canvas is null or not a valid canvas element
        if (!canvas || !canvas.toDataURL) {
            console.error('Invalid canvas element:', canvas);
            return '';
        }
        
        try {
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error('Error converting canvas to image:', e);
            return '';
        }
    }

    // Helper function to render metric cards
    function renderMetricsCards(metrics) {
        if (!metrics || Object.keys(metrics).length === 0) {
            return '<div class="no-data" style="grid-column: span 2;">No metric data available</div>';
        }
        
        return Object.entries(metrics).map(([key, value]) => `
            <div class="metric-card">
                <h3>${formatMetricName(key)}</h3>
                <p>${value}</p>
            </div>
        `).join('');
    }

    // Helper function to format metric names
    function formatMetricName(key) {
        return key.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

/**
 * Gets metrics data for the report
 */
function getReportMetrics() {
    try {
        // Try to get metric values from the DOM elements first
        const leaderAvg = document.getElementById('leader-avg')?.textContent || 'N/A';
        const followerAvg = document.getElementById('follower-avg')?.textContent || 'N/A';
        const leaderVariability = document.getElementById('leader-variability')?.textContent || 'N/A';
        const followerVariability = document.getElementById('follower-variability')?.textContent || 'N/A';
        
        // Get metrics from charts if available
        const distribution = getIdentityTypesFromChart();
        
        return {
            'leader_identity_average': `${leaderAvg}`,
            'follower_identity_average': `${followerAvg}`,
            'leader_identity_variability': `${leaderVariability}`,
            'follower_identity_variability': `${followerVariability}`,
            'most_common_identity': distribution.mostCommon || 'N/A',
            'identity_switching_frequency': distribution.switchFrequency || 'N/A',
            'data_collection_period': `${distribution.days || 'N/A'} days`,
        };
    } catch (e) {
        console.error('Error getting report metrics:', e);
        // Return fallback metrics with placeholder values
        return {
            'leader_identity_average': 'N/A',
            'follower_identity_average': 'N/A',
            'leader_identity_variability': 'N/A',
            'follower_identity_variability': 'N/A',
            'most_common_identity': 'N/A',
            'identity_switching_frequency': 'N/A',
            'data_collection_period': 'N/A'
        };
    }
}

/**
 * Gets identity types distribution from chart data
 */
function getIdentityTypesFromChart() {
    try {
        // Try to extract data from the pie chart if it exists
        const pieChart = window.identitySwitchesPieChart;
        
        if (pieChart && pieChart.data && pieChart.data.labels) {
            const labels = pieChart.data.labels;
            const data = pieChart.data.datasets[0].data;
            
            // Find most common identity type
            let maxIndex = 0;
            for (let i = 1; i < data.length; i++) {
                if (data[i] > data[maxIndex]) {
                    maxIndex = i;
                }
            }
            
            const mostCommon = labels[maxIndex];
            const totalDays = data.reduce((sum, val) => sum + val, 0);
            
            // Calculate switch frequency if we have access to switches data
            let switchFrequency = 'N/A';
            if (window.identitySwitchesChart) {
                // This is a simplification - the actual calculation would depend on your data structure
                switchFrequency = 'See chart for details';
            }
            
            return {
                mostCommon,
                days: totalDays,
                switchFrequency
            };
        }
        
        // Fallback: check DOM for identity information
        const identityTypeElements = document.querySelectorAll('.identity-type-count');
        if (identityTypeElements.length > 0) {
            let maxCount = 0;
            let maxType = 'N/A';
            let totalDays = 0;
            
            identityTypeElements.forEach(el => {
                const count = parseInt(el.textContent, 10);
                const type = el.previousElementSibling?.textContent || 'Unknown';
                
                totalDays += count;
                if (count > maxCount) {
                    maxCount = count;
                    maxType = type;
                }
            });
            
            return {
                mostCommon: maxType,
                days: totalDays,
                switchFrequency: 'See chart for details'
            };
        }
        
    } catch (e) {
        console.error('Error extracting identity types:', e);
    }
    
    // Return default values if we couldn't extract anything
    return {
        mostCommon: 'N/A',
        days: 'N/A',
        switchFrequency: 'N/A'
    };
}

/**
 * Gets user ID from URL
 * This extracts the user ID from the URL query parameters
 */
function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId') || document.getElementById('reporter-user-id')?.value || null;
}