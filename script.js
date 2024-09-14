document.addEventListener('DOMContentLoaded', function () {
    fetchDocumentData();
});

async function submitForm() {
    const title = document.getElementById('title').value;
    const module = document.getElementById('module').value;
    const approval = document.getElementById('approval').value === 'true'; // Matches backend
    const scriptLink = document.getElementById('scriptLink').value;

    if (title && module && scriptLink) {
        try {
            const response = await fetch('http://localhost:3000/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, module, approval, scriptLink }), // Matches backend
            });

            if (response.ok) {
                Swal.fire('Success', 'Document submitted successfully!', 'success');
                document.getElementById('documentForm').reset(); // Reset the form
            } else {
                Swal.fire('Error', 'Failed to submit document.', 'error');
            }
        } catch (error) {
            console.error('Error submitting document', error);
            Swal.fire('Error', 'Failed to submit document.', 'error');
        }
    } else {
        Swal.fire('Warning', 'Please fill in all required fields.', 'warning');
    }
}
