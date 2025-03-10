function saveEmailPreferences() {
    const wantsReminders = document.getElementById('email-reminders').checked;
    const userEmail = document.getElementById('user-email').value;
    const userId = document.getElementById('user-id').value;
    const reminderTime = document.getElementById('reminder-time').value;

    if (!userId) {
        alert('User ID is required. Please enter your ID.');
        return;
    }

    if (wantsReminders && !userEmail) {
        alert('Email address is required when reminders are enabled.');
        return;
    }

    fetch('/set-email-preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, wantsReminders, userEmail, reminderTime }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Email preferences response:', data);
        
        if (data.note) {
            alert(`Email preferences saved successfully. Note: ${data.note}`);
        } else {
            alert('Email preferences saved successfully');
        }
        
        // Always move forward, even in demo mode
        // Make sure userData exists in both window and local scope
        if (typeof window.userData === 'undefined') {
            window.userData = {};
        }
        
        window.userData.userId = userId;
        window.userData.startTime = new Date().toISOString();
        
        // Show instructions page
        if (typeof window.showPage === 'function') {
            window.showPage('instructions-page');
        } else {
            console.error('showPage function not found in window scope');
            // Fallback to direct manipulation
            document.getElementById('email-preferences').style.display = 'none';
            document.getElementById('instructions-page').style.display = 'block';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('There was an error saving your email preferences: ' + error.message);
    });
}

function checkEmailStatus(userId) {
    fetch(`/check-email-status/${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Email status response:', data);
            
            if (data.demo) {
                console.log('Demo mode email status received');
                // Don't show any alerts for demo mode - it's handled in the main alert
            } else if (data.emailSent) {
                alert(`Welcome email sent successfully at ${data.sentAt}`);
            } else {
                alert(`Email not sent. Error: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Don't show alert - it's better to just silently fail this check
            // since we're already showing the main success alert
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save-email-preferences');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveEmailPreferences);
    } else {
        console.error('Element not found: save-email-preferences');
    }
    
    // Add validation for email field
    const emailCheckbox = document.getElementById('email-reminders');
    const emailField = document.getElementById('user-email');
    
    if (emailCheckbox && emailField) {
        emailCheckbox.addEventListener('change', () => {
            emailField.required = emailCheckbox.checked;
            if (emailCheckbox.checked) {
                emailField.setAttribute('placeholder', 'Enter your email (required)');
            } else {
                emailField.setAttribute('placeholder', 'Enter your email');
            }
        });
    }
});