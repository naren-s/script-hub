document.addEventListener('DOMContentLoaded', function () {
    fetchDocumentData();
});

// Function to submit the form
async function submitForm() {
    const title = document.getElementById('title').value.trim();
    const module = document.getElementById('module').value.trim();
    const approval = document.getElementById('approval').value === 'true'; // Ensure it's boolean
    const scriptLink = document.getElementById('scriptLink').value.trim();

    // Validate that all required fields are filled
    if (!title || !module || !scriptLink) {
        Swal.fire('Warning', 'Please fill in all required fields.', 'warning');
        return; // Stop further execution
    }

    try {
        // Ensure the user is authenticated by using the token
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire('Error', 'You must be logged in to submit the form.', 'error');
            return;
        }

        // Send the form data to the server
        const response = await fetch('http://localhost:3000/documents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include token for authorization
            },
            body: JSON.stringify({ title, module, approval, scriptLink }) // Pass form data
        });

        // Handle the server response
        if (response.ok) {
            Swal.fire('Success', 'Document submitted successfully!', 'success');
            document.getElementById('documentForm').reset(); // Reset the form fields
        } else {
            const errorData = await response.json();
            Swal.fire('Error', errorData.message || 'Failed to submit document.', 'error');
        }
    } catch (error) {
        console.error('Error submitting document:', error);
        Swal.fire('Error', 'Failed to submit document due to a network error.', 'error');
    }
}
