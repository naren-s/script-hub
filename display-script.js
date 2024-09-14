document.addEventListener('DOMContentLoaded', function () {
    fetchDocumentData();
    document.getElementById('searchInput').addEventListener('input', handleSearch);
});

const rowsPerPage = 8;
let currentPage = 1;
let allDocuments = []; // This will store all documents
let filteredDocuments = []; // This will hold the documents after filtering.

async function fetchDocumentData() {
    try {
        const response = await fetch('http://localhost:3000/documents');
        const documents = await response.json();
        allDocuments = documents; // Store the full document list
        filteredDocuments = documents; // Initially, no filtering is applied
        renderTable();
    } catch (error) {
        console.error('Error fetching document data', error);
        Swal.fire('Error', 'Failed to fetch document data.', 'error');
    }
}

function renderTable() {
    const tableBody = document.getElementById('dataTableBody');
    tableBody.innerHTML = ''; // Clear existing data

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedDocuments = filteredDocuments.slice(start, end);

    paginatedDocuments.forEach(doc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doc.title || 'N/A'}</td>
            <td>${doc.module || 'N/A'}</td>
            <td>${doc.approval ? 'Yes' : 'No'}</td>
            <td><a href="${doc.script_link || '#'}" target="_blank">${doc.script_link ? 'View Script' : 'N/A'}</a></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editDocument(${doc.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDocument(${doc.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('currentPage').innerText = currentPage;

    // Handle pagination button states
    document.getElementById('prevPage').parentElement.classList.toggle('disabled', currentPage === 1);
    document.getElementById('nextPage').parentElement.classList.toggle('disabled', end >= filteredDocuments.length);
}

function handleSearch() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    // If search input is empty, reset the filtered documents to the full list
    if (searchValue === '') {
        filteredDocuments = allDocuments; // Reset to the full list
    } else {
        filteredDocuments = allDocuments.filter(doc => doc.title.toLowerCase().includes(searchValue));
    }
    
    currentPage = 1; // Reset to first page when searching
    renderTable();
}

// Pagination controls
document.getElementById('prevPage').addEventListener('click', function (e) {
    e.preventDefault();
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

document.getElementById('nextPage').addEventListener('click', function (e) {
    e.preventDefault();
    const totalPages = Math.ceil(filteredDocuments.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
});

// The editDocument, updateDocument, and deleteDocument functions remain unchanged.

async function editDocument(id) {
    try {
        const response = await fetch(`http://localhost:3000/documents/${id}`);
        const documentData = await response.json();

        const { value: formValues } = await Swal.fire({
            title: 'Edit Document/Script',
            html:
                '<input id="title" class="swal2-input" placeholder="Title" value="' + documentData.title + '">' +
                '<input id="module" class="swal2-input" placeholder="Module" value="' + documentData.module + '">' +
                '<select id="approval" class="swal2-select">' +
                '<option value="true"' + (documentData.approval ? ' selected' : '') + '>Yes</option>' +
                '<option value="false"' + (!documentData.approval ? ' selected' : '') + '>No</option>' +
                '</select>' +
                '<input id="scriptLink" class="swal2-input" placeholder="Script Link" value="' + documentData.script_link + '">',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    title: document.getElementById('title').value,
                    module: document.getElementById('module').value,
                    approval: document.getElementById('approval').value === 'true',
                    scriptLink: document.getElementById('scriptLink').value
                }
            }
        });

        if (formValues) {
            await updateDocument(id, formValues);
        }
    } catch (error) {
        console.error('Error editing document', error);
        Swal.fire('Error', 'Failed to edit document.', 'error');
    }
}

async function updateDocument(id, formValues) {
    try {
        const response = await fetch(`http://localhost:3000/documents/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formValues),
        });

        if (response.ok) {
            Swal.fire('Success', 'Document updated successfully!', 'success');
            fetchDocumentData(); // Refresh the data
        } else {
            Swal.fire('Error', 'Failed to update document.', 'error');
        }
    } catch (error) {
        console.error('Error updating document', error);
        Swal.fire('Error', 'Failed to update document.', 'error');
    }
}

async function deleteDocument(id) {
    try {
        const response = await fetch(`http://localhost:3000/documents/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            Swal.fire('Deleted', 'Document deleted successfully!', 'success');
            fetchDocumentData(); // Refresh the data
        } else {
            Swal.fire('Error', 'Failed to delete document.', 'error');
        }
    } catch (error) {
        console.error('Error deleting document', error);
        Swal.fire('Error', 'Failed to delete document.', 'error');
    }
}
