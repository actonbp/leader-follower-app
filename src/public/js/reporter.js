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

    const ctx = document.getElementById('general-identity-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Leader Identity', 'Follower Identity', 'Liminality'],
            datasets: [{
                label: 'Percentage',
                data: [avgLeader, avgFollower, liminality],
                backgroundColor: ['blue', 'red', 'green']
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'General Identity and Equilibrium'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 100
                    }
                }]
            }
        }
    });
}

function createDayToDayDynamics(data) {
    const leaderVariations = data.map((d, i, arr) => i === 0 ? 0 : Math.abs(d.leaderScore - arr[i - 1].leaderScore));
    const followerVariations = data.map((d, i, arr) => i === 0 ? 0 : Math.abs(d.followerScore - arr[i - 1].followerScore));

    const leaderSwitches = leaderVariations.filter(v => v > 20).length;
    const followerSwitches = followerVariations.filter(v => v > 20).length;

    const ctx = document.getElementById('identity-variation-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.submitTime),
            datasets: [{
                label: 'Leader Identity Variation',
                data: leaderVariations,
                backgroundColor: 'blue'
            }, {
                label: 'Follower Identity Variation',
                data: followerVariations,
                backgroundColor: 'red'
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Day-to-Day Identity Variation'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 100
                    }
                }]
            }
        }
    });

    const totalEntries = data.length;
    const leaderEntries = data.filter(d => parseFloat(d.leaderScore) > parseFloat(d.followerScore)).length;
    const followerEntries = totalEntries - leaderEntries;
    const liminalEntries = totalEntries - leaderEntries - followerEntries;

    const pieCtx = document.getElementById('identity-pie-chart').getContext('2d');
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Leader', 'Follower', 'Liminal'],
            datasets: [{
                data: [leaderEntries, followerEntries, liminalEntries],
                backgroundColor: ['blue', 'red', 'green']
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Proportion of Days in Each Identity'
            }
        }
    });
}

function createDailyEventsSummary(data) {
    const ctx = document.getElementById('event-strength-chart').getContext('2d');
    const averageEventStrength = data.map(d => (parseFloat(d.novelty) + parseFloat(d.disruption) + parseFloat(d.ordinariness)) / 3);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.submitTime),
            datasets: [{
                label: 'Average Event Strength',
                data: averageEventStrength,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Average Event Strength'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 5
                    }
                }]
            }
        }
    });

    const eventSummary = document.getElementById('event-summary');
    eventSummary.innerHTML = `
        <table>
            <tr>
                <th>Date</th>
                <th>Event Description</th>
                <th>Event Strength</th>
            </tr>
            ${data.map(d => `
                <tr>
                    <td>${d.submitTime}</td>
                    <td>${d.eventDescription}</td>
                    <td>${((parseFloat(d.novelty) + parseFloat(d.disruption) + parseFloat(d.ordinariness)) / 3).toFixed(2)}</td>
                </tr>
            `).join('')}
        </table>
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
    const generalIdentityChart = document.getElementById('general-identity-chart');
    doc.addImage(generalIdentityChart.toDataURL('image/png'), 'PNG', 20, 40, 170, 100);
    
    // Add Day-to-Day Dynamics
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.text('Day-to-Day Identity Dynamics', 105, 20, { align: 'center' });
    const variationChart = document.getElementById('identity-variation-chart');
    doc.addImage(variationChart.toDataURL('image/png'), 'PNG', 10, 30, 190, 100);
    doc.setFont('helvetica', 'normal');
    const pieChart = document.getElementById('identity-pie-chart');
    doc.addImage(pieChart.toDataURL('image/png'), 'PNG', 20, 140, 170, 100);
    
    // Add Daily Events Summary
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.text('Average Event Strength', 105, 20, { align: 'center' });
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
