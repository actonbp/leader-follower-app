// Add this to your existing main.js file or create a new reporter.js file

document.getElementById('load-data-btn').addEventListener('click', () => {
    const userId = document.getElementById('reporter-user-id').value;
    if (userId) {
        fetch(`/get-user-data/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    document.getElementById('reporter-content').style.display = 'block';
                    createIdentityTrajectoryChart(data);
                    createGeneralIdentitySummary(data);
                    createDayToDayDynamics(data);
                    createDailyEventsSummary(data);
                } else {
                    alert('No data found for this user ID.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('There was an error loading the data. Please try again.');
            });
    } else {
        alert('Please enter your ID');
    }
});

function createIdentityTrajectoryChart(data) {
    const ctx = document.getElementById('identity-trajectory-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.submitTime),
            datasets: [{
                label: 'Leader Identity',
                data: data.map(d => d.leaderScore),
                borderColor: 'blue',
                fill: false
            }, {
                label: 'Follower Identity',
                data: data.map(d => d.followerScore),
                borderColor: 'red',
                fill: false
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Leader-Follower Identity Trajectory'
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 100
                    }
                }]
            },
            animation: {
                onComplete: function () {
                    this.toBase64Image();
                }
            }
        }
    });
}

function createGeneralIdentitySummary(data) {
    const avgLeader = data.reduce((sum, d) => sum + parseFloat(d.leaderScore), 0) / data.length;
    const avgFollower = data.reduce((sum, d) => sum + parseFloat(d.followerScore), 0) / data.length;
    const liminality = Math.abs(avgLeader - avgFollower);

    const summary = document.getElementById('identity-summary');
    summary.innerHTML = `
        <p>Average Leader Identity: ${avgLeader.toFixed(2)}%</p>
        <p>Average Follower Identity: ${avgFollower.toFixed(2)}%</p>
        <p>Leader-Follower Identity Liminality: ${liminality.toFixed(2)}%</p>
    `;

    // Create a simple liminality meter
    const liminalityMeter = document.getElementById('liminality-meter');
    liminalityMeter.innerHTML = `
        <div style="width: 100%; background-color: #ddd;">
            <div style="width: ${liminality}%; height: 20px; background-color: #4CAF50;"></div>
        </div>
    `;
}

function createDayToDayDynamics(data) {
    const variations = data.map((d, i, arr) => {
        if (i === 0) return 0;
        const prevDay = arr[i - 1];
        return Math.abs(d.leaderScore - prevDay.leaderScore) + Math.abs(d.followerScore - prevDay.followerScore);
    });

    const ctx = document.getElementById('identity-variation-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.submitTime),
            datasets: [{
                label: 'Identity Variation',
                data: variations,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Day-to-Day Identity Variation'
            },
            animation: {
                onComplete: function () {
                    this.toBase64Image();
                }
            }
        }
    });

    const switchCount = variations.filter(v => v > 20).length; // Assuming a switch is a variation > 20
    const switchingSummary = document.getElementById('switching-summary');
    switchingSummary.innerHTML = `
        <p>Number of significant identity switches: ${switchCount}</p>
    `;
}

function createDailyEventsSummary(data) {
    const ctx = document.getElementById('event-strength-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.submitTime),
            datasets: [{
                label: 'Novelty',
                data: data.map(d => d.novelty),
                backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }, {
                label: 'Disruption',
                data: data.map(d => d.disruption),
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
            }, {
                label: 'Ordinariness',
                data: data.map(d => d.ordinariness),
                backgroundColor: 'rgba(255, 206, 86, 0.6)'
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Daily Event Characteristics'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 5
                    }
                }]
            },
            animation: {
                onComplete: function () {
                    this.toBase64Image();
                }
            }
        }
    });

    const eventSummary = document.getElementById('event-summary');
    eventSummary.innerHTML = `
        <p>Total number of events recorded: ${data.length}</p>
        <p>Average event novelty: ${(data.reduce((sum, d) => sum + parseFloat(d.novelty), 0) / data.length).toFixed(2)}</p>
        <p>Average event disruption: ${(data.reduce((sum, d) => sum + parseFloat(d.disruption), 0) / data.length).toFixed(2)}</p>
        <p>Average event ordinariness: ${(data.reduce((sum, d) => sum + parseFloat(d.ordinariness), 0) / data.length).toFixed(2)}</p>
    `;
}

function generateReporterPDF() {
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
    doc.text(`User ID: ${document.getElementById('reporter-user-id').value}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 37);
    
    // Add Identity Trajectory Chart
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.text('Leader-Follower Identity Trajectory', 105, 20, { align: 'center' });
    const trajectoryChart = document.getElementById('identity-trajectory-chart');
    doc.addImage(trajectoryChart.toDataURL('image/png'), 'PNG', 10, 30, 190, 100);
    
    // Add General Identity Summary
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.text('General Identity and Equilibrium', 105, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    const identitySummary = document.getElementById('identity-summary').innerText;
    doc.text(identitySummary, 20, 40);
    
    // Add Liminality Meter
    const liminalityMeter = document.getElementById('liminality-meter');
    doc.addImage(liminalityMeter.toDataURL('image/png'), 'PNG', 20, 80, 170, 20);
    
    // Add Day-to-Day Dynamics
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.text('Day-to-Day Identity Dynamics', 105, 20, { align: 'center' });
    const variationChart = document.getElementById('identity-variation-chart');
    doc.addImage(variationChart.toDataURL('image/png'), 'PNG', 10, 30, 190, 100);
    doc.setFont('helvetica', 'normal');
    const switchingSummary = document.getElementById('switching-summary').innerText;
    doc.text(switchingSummary, 20, 140);
    
    // Add Daily Events Summary
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Events', 105, 20, { align: 'center' });
    const eventChart = document.getElementById('event-strength-chart');
    doc.addImage(eventChart.toDataURL('image/png'), 'PNG', 10, 30, 190, 100);
    doc.setFont('helvetica', 'normal');
    const eventSummary = document.getElementById('event-summary').innerText;
    doc.text(eventSummary, 20, 140);
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text('Leader-Follower Identity Tracker (LFIT) - Confidential', 105, 285, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 105, 292, { align: 'center' });
    }
    
    // Save the PDF
    doc.save('LFIT_Reporter_Summary.pdf');
}

// Add event listener for the export button
document.getElementById('export-reporter-pdf-btn').addEventListener('click', generateReporterPDF);
