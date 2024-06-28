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

    function showCompletionPage() {
        showPage('completion-page');
        document.getElementById('export-pdf-btn').style.display = 'inline-block';
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
            showCompletionPage();
            // Make sure userData is up-to-date here
            userData = data; // Update userData with the latest submission data
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

    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('LFIT Reflector Report', 105, 15, { align: 'center' });
        
        // Add user ID
        doc.setFontSize(12);
        doc.text(`User ID: ${userData.userId}`, 20, 30);
        
        // Add Leader-Follower scores
        doc.text(`Leader Score: ${userData.leaderPercent}%`, 20, 40);
        doc.text(`Follower Score: ${userData.followerPercent}%`, 20, 50);
        
        // Add event details
        doc.text('Event Details:', 20, 70);
        doc.text(`Novelty: ${userData.novelty}`, 30, 80);
        doc.text(`Disruption: ${userData.disruption}`, 30, 90);
        doc.text(`Ordinariness: ${userData.ordinariness}`, 30, 100);
        
        // Add event description
        doc.text('Event Description:', 20, 120);
        const splitText = doc.splitTextToSize(userData.eventDescription, 170);
        doc.text(splitText, 20, 130);
        
        // Save the PDF
        doc.save('LFIT_Reflector_Report.pdf');
    }

    // Add event listener for the export button
    document.getElementById('export-pdf-btn').addEventListener('click', generatePDF);
});