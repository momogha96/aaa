import { config } from './config.js';

let currentUser = null;
let currentBranch = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
    loadBranchData();
    
    // Only try to populate services table if we're on the services view
    const servicesTableBody = document.getElementById('servicesTableBody');
    if (servicesTableBody) {
        config.services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.name}</td>
                <td>${service.price}</td>
                <td>${service.status}</td>
                <td>${service.description}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit">تعديل</button>
                        <button class="btn-action btn-delete">حذف</button>
                    </div>
                </td>
            `;
            servicesTableBody.appendChild(row);
        });
    }
});

function initializeApp() {
    // Clear any existing classes on page load
    document.body.classList.remove('logged-in', 'admin-role', 'branch-role');
    
    // Setup navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (link.dataset.view) {
                showView(link.dataset.view);
            }
        });
    });

    // Setup forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Add form handlers
    document.getElementById('addPatientForm')?.addEventListener('submit', handleAddPatient);
    document.getElementById('addDoctorForm')?.addEventListener('submit', handleAddDoctor);
    document.getElementById('addAppointmentForm')?.addEventListener('submit', handleAddAppointment);
    document.getElementById('addPaymentForm')?.addEventListener('submit', handleAddPayment);
    
    // Show login view by default
    showView('login');
}

function setupEventListeners() {
    // Add event listeners for various interactions
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById(`${viewName}View`).classList.remove('hidden');
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.querySelector('input[type="text"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    try {
        const user = config.users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            alert('بيانات الدخول غير صحيحة');
            return;
        }

        currentUser = user;
        currentBranch = user.branchId;
        document.body.classList.add('logged-in');
        
        // Set role-specific classes and initial view
        if (user.role === 'admin') {
            document.body.classList.add('admin-role');
            document.body.classList.remove('branch-role');
            showView('central');
        } else {
            document.body.classList.add('branch-role');
            document.body.classList.remove('admin-role');
            showView('patients');
        }
        
        updateUserInfo();
        loadBranchData();
    } catch (error) {
        alert('خطأ في تسجيل الدخول');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    // Implement registration logic here
    alert('تم تسجيل المستخدم بنجاح');
    showView('login');
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    currentBranch = null;
    document.body.classList.remove('logged-in');
    document.body.classList.remove('admin-role');
    document.body.classList.remove('branch-role');
    showView('login');
    updateUserInfo();
}

function updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    if (currentUser) {
        userInfo.innerHTML = `
            <div class="user-name">${currentUser.name}</div>
            <div class="user-name">${currentUser.username}</div>
        `;
    } else {
        userInfo.innerHTML = `<div class="guest">زائر</div>`;
    }
}

function checkAuthStatus() {
    // Check if user is logged in
    if (!currentUser) {
        showView('login');
    }
}

function loadBranchData() {
    if (!currentUser) return;
    
    // For admin, show all data. For branch users, filter by branch
    const branchFilter = currentUser.role === 'admin' ? null : currentBranch;
    
    const branchPatients = (config.patients || []).filter(p => 
        !branchFilter || p.branchId === branchFilter
    );
    const branchAppointments = (config.appointments || []).filter(a => 
        !branchFilter || a.branchId === branchFilter
    );
    const branchSessions = (config.sessions || []).filter(s => 
        !branchFilter || s.branchId === branchFilter
    );
    const branchPayments = (config.payments || []).filter(p => 
        !branchFilter || p.branchId === branchFilter
    );

    // Update stats and tables based on role
    if (currentUser.role === 'admin') {
        updateDashboardStats(branchPatients, branchAppointments, branchSessions, branchPayments);
    }
    
    // Update tables that exist in the current view
    const tables = {
        patients: document.getElementById('patientsTable'),
        appointments: document.getElementById('appointmentsTable'),
        payments: document.getElementById('paymentsTable')
    };
    
    if (tables.patients) populatePatientsList(branchPatients);
    if (tables.appointments) populateAppointmentsList(branchAppointments);
    if (tables.payments) populatePaymentsList(branchPayments);
}

function updateDashboardStats(patients, appointments, sessions, payments) {
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;

    statsGrid.innerHTML = `
        <div class="stat-card">
            <h3>إجمالي المرضى</h3>
            <p>${patients.length}</p>
        </div>
        <div class="stat-card">
            <h3>المواعيد اليوم</h3>
            <p>${appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}</p>
        </div>
        <div class="stat-card">
            <h3>الجلسات هذا الشهر</h3>
            <p>${sessions.filter(s => s.date.startsWith(new Date().toISOString().slice(0, 7))).length}</p>
        </div>
        <div class="stat-card">
            <h3>إجمالي المدفوعات</h3>
            <p>${payments.reduce((sum, p) => sum + p.amount, 0)} ريال</p>
        </div>
    `;
}

function populatePatientsList(patients) {
    const tbody = document.querySelector('#patientsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.fileNumber}</td>
            <td>${patient.name}</td>
            <td>${patient.phone}</td>
            <td>${config.branches.find(b => b.id === patient.branchId)?.name || ''}</td>
            <td>${patient.status}</td>
        </tr>
    `).join('');
}

function populateAppointmentsList(appointments) {
    const tbody = document.querySelector('#appointmentsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = appointments.map(appointment => `
        <tr>
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td>${config.patients.find(p => p.id === appointment.patientId)?.name || ''}</td>
            <td>${config.services.find(s => s.id === appointment.serviceId)?.name || ''}</td>
            <td>${appointment.status}</td>
        </tr>
    `).join('');
}

function populatePaymentsList(payments) {
    const tbody = document.querySelector('#paymentsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.date}</td>
            <td>${config.patients.find(p => p.id === payment.patientId)?.name || ''}</td>
            <td>${payment.amount} ${config.settings.currency}</td>
            <td>${payment.method}</td>
            <td>${payment.status}</td>
        </tr>
    `).join('');
}

window.initGoogleSheets = async function() {
    try {
        // Initialize Google Sheets API client
        await gapi.client.init({
            apiKey: config.googleSheetsConfig.apiKey,
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        });
        console.log('Google Sheets API initialized');
    } catch (error) {
        console.error('Error initializing Google Sheets:', error);
    }
};

async function updateGoogleSheet(data, range) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: config.googleSheetsConfig.spreadsheetId,
            range: range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [data]
            }
        });
        console.log('Data written to Google Sheet:', response);
    } catch (error) {
        console.error('Error writing to Google Sheet:', error);
    }
}

async function handleAddPatient(e) {
    e.preventDefault();
    const form = e.target;
    const newPatient = {
        id: config.patients.length + 1,
        name: form.querySelector('[name="patientName"]').value,
        fileNumber: `P${String(config.patients.length + 1).padStart(3, '0')}`,
        phone: form.querySelector('[name="phone"]').value,
        branchId: currentBranch,
        status: "نشط"
    };
    
    config.patients.push(newPatient);
    await exportToGoogleSheets(newPatient, 'Patients');
    loadBranchData();
    form.reset();
    alert('تم إضافة المريض بنجاح');
}

async function handleAddDoctor(e) {
    e.preventDefault();
    const form = e.target;
    const newDoctor = {
        id: config.doctors.length + 1,
        name: form.querySelector('[name="doctorName"]').value,
        specialty: form.querySelector('[name="specialty"]').value,
        phone: form.querySelector('[name="phone"]').value,
        branchId: currentBranch,
        status: "نشط"
    };
    
    config.doctors.push(newDoctor);
    await exportToGoogleSheets(newDoctor, 'Doctors');
    loadBranchData();
    form.reset();
    alert('تم إضافة الطبيب بنجاح');
}

async function handleAddAppointment(e) {
    e.preventDefault();
    const form = e.target;
    const newAppointment = {
        id: config.appointments.length + 1,
        patientId: parseInt(form.querySelector('[name="patientId"]').value),
        branchId: currentBranch,
        serviceId: parseInt(form.querySelector('[name="serviceId"]').value),
        date: form.querySelector('[name="date"]').value,
        time: form.querySelector('[name="time"]').value,
        status: "مؤكد"
    };
    
    config.appointments.push(newAppointment);
    await exportToGoogleSheets(newAppointment, 'Appointments');
    loadBranchData();
    form.reset();
    alert('تم إضافة الموعد بنجاح');
}

async function handleAddPayment(e) {
    e.preventDefault();
    const form = e.target;
    const newPayment = {
        id: config.payments.length + 1,
        patientId: parseInt(form.querySelector('[name="patientId"]').value),
        amount: parseFloat(form.querySelector('[name="amount"]').value),
        date: new Date().toISOString().split('T')[0],
        method: form.querySelector('[name="method"]').value,
        status: "مدفوع"
    };
    
    config.payments.push(newPayment);
    await exportToGoogleSheets(newPayment, 'Payments');
    loadBranchData();
    form.reset();
    alert('تم تسجيل الدفعة بنجاح');
}

async function exportToGoogleSheets(data, sheetName) {
    try {
        const formattedData = formatDataForExport(data, sheetName);
        
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: config.googleSheetsConfig.spreadsheetId,
            range: `${sheetName}!A:Z`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [formattedData]
            }
        });
        
        console.log(`Data exported to ${sheetName} successfully`);
    } catch (error) {
        console.error('Error exporting to Google Sheets:', error);
        alert('حدث خطأ أثناء تصدير البيانات');
    }
}

function formatDataForExport(data, type) {
    switch(type) {
        case 'Patients':
            return [
                data.fileNumber,
                data.name,
                data.phone,
                data.status,
                new Date().toISOString()
            ];
            
        case 'Appointments':
            return [
                data.date,
                data.time,
                config.patients.find(p => p.id === data.patientId)?.name || '',
                config.services.find(s => s.id === data.serviceId)?.name || '',
                data.status,
                new Date().toISOString()
            ];
            
        case 'Payments':
            return [
                data.date,
                config.patients.find(p => p.id === data.patientId)?.name || '',
                data.amount,
                data.method,
                data.status,
                new Date().toISOString()
            ];
            
        case 'Doctors':
            return [
                data.name,
                data.specialty,
                data.phone,
                data.status,
                new Date().toISOString()
            ];
            
        default:
            return [];
    }
}