function saveEmailPreferences() {
    const wantsReminders = document.getElementById('email-reminders').checked;
    const userEmail = document.getElementById('user-email').value;
    const userId = document.getElementById('user-id').value;
    const reminderTime = document.getElementById('reminder-time').value;

    fetch('/set-email-preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, wantsReminders, userEmail, reminderTime }),
    })
    .then(response => response.json())
    .then(data => {
        alert('Email preferences saved successfully');
        checkEmailStatus(userId);
        window.showPage('instructions-page');
        window.userData = window.userData || {};
        window.userData.userId = userId;
        window.userData.startTime = new Date().toISOString();
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('There was an error saving your email preferences');
    });
}

function checkEmailStatus(userId) {
    fetch(`/check-email-status/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.emailSent) {
                alert(`Welcome email sent successfully at ${data.sentAt}`);
            } else {
                alert(`Email not sent. Error: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error checking the email status');
        });
}

document.getElementById('save-email-preferences').addEventListener('click', saveEmailPreferences);