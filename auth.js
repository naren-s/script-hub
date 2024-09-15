async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validate inputs
    if (!username || !password) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Username and password cannot be empty.',
            confirmButtonText: 'OK'
        });
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'You will be redirected shortly',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = 'display.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: data.message,
                confirmButtonText: 'Try Again'
            });
        }
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: 'Unable to login. Please try again later.',
            confirmButtonText: 'OK'
        });
    }
}

async function signup() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validate inputs
    if (!username || !email || !password) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'All fields are required.',
            confirmButtonText: 'OK'
        });
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: 'You can now log in.',
                confirmButtonText: 'OK'
            }).then(() => {
                document.getElementById('signupForm').reset();
                window.location.href = 'index.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Signup Failed',
                text: data.message,
                confirmButtonText: 'Try Again'
            });
        }
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: 'Unable to sign up. Please try again later.',
            confirmButtonText: 'OK'
        });
    }
}
