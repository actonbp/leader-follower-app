document.addEventListener('DOMContentLoaded', () => {
    const pages = ['welcome-page', 'grid-page', 'questions-page', 'completion-page'];
    let currentPage = 0;
    let userData = {};

    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        document.getElementById(pageId).style.display = 'block';
    }

    // Main Welcome Page
    document.getElementById('reflector-btn').addEventListener('click', () => {
        document.getElementById('main-welcome-page').style.display = 'none';
        document.getElementById('reflector-section').style.display = 'block';
        showPage('welcome-page');
    });

    document.getElementById('reporter-btn').addEventListener('click', () => {
        document.getElementById('main-welcome-page').style.display = 'none';
        showPage('reporter-section');
    });

    // Reflector Section
    document.getElementById('start-btn').addEventListener('click', () => {
        const userId = document.getElementById('user-id').value;
        if (userId) {
            userData.userId = userId;
            userData.startTime = new Date().toISOString();
            showPage('grid-page');
        } else {
            alert('Please enter your ID');
        }
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
        showPage('questions-page');
    });

    document.getElementById('questions-submit-btn').addEventListener('click', () => {
        userData.novelty = document.getElementById('novelty').value;
        userData.disruption = document.getElementById('disruption').value;
        userData.ordinariness = document.getElementById('ordinariness').value;
        userData.eventDescription = document.getElementById('event-description').value;

        fetch('/submit-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                showPage('completion-page');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('There was an error submitting your data. Please try again.');
            });
    });

    document.getElementById('new-rating-btn').addEventListener('click', () => {
        userData = { userId: userData.userId };
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

    // Reporter Section
    document.getElementById('load-data-btn').addEventListener('click', () => {
        const userId = document.getElementById('reporter-user-id').value;
        if (userId) {
            fetch(`/get-user-data/${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        document.getElementById('charts-container').style.display = 'block';
                        createCharts(data);
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

    function createCharts(data) {
        // Identity Chart
        const identityCtx = document.getElementById('identity-chart').getContext('2d');
        new Chart(identityCtx, {
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
                    text: 'Leader-Follower Identity Over Time'
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
                }
            }
        });

        // Event Chart
        const eventCtx = document.getElementById('event-chart').getContext('2d');
        new Chart(eventCtx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.submitTime),
                datasets: [{
                    label: 'Novelty',
                    data: data.map(d => d.novelty),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }, {
                    label: 'Disruption',
                    data: data.map(d => d.disruption),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }, {
                    label: 'Ordinariness',
                    data: data.map(d => d.ordinariness),
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Event Characteristics Over Time'
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
                            max: 5
                        }
                    }]
                }
            }
        });
    }
});