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
    
    // Add title
    doc.setFontSize(18);
    doc.text('LFIT Reporter Summary', 105, 15, { align: 'center' });
    
    // Add user ID
    doc.setFontSize(12);
    doc.text(`User ID: ${document.getElementById('reporter-user-id').value}`, 20, 30);
    
    // Add charts
    const charts = document.querySelectorAll('canvas');
    let yOffset = 40;
    charts.forEach((chart, index) => {
        const imgData = chart.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, yOffset, 190, 100);
        yOffset += 110;
        
        if (index < charts.length - 1) {
            doc.addPage();
            yOffset = 10;
        }
    });
    
    // Add summaries
    doc.addPage();
    doc.text(document.getElementById('identity-summary').innerText, 10, 10);
    doc.text(document.getElementById('switching-summary').innerText, 10, 40);
    doc.text(document.getElementById('event-summary').innerText, 10, 70);
    
    // Save the PDF
    doc.save('LFIT_Reporter_Summary.pdf');
}

// Add event listener for the export button
document.getElementById('export-reporter-pdf-btn').addEventListener('click', generateReporterPDF);
