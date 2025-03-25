export const config = {
    // Reading data from مركز_فيزيو_كير_كامل.xlsx
    users: [
        {
            id: 1,
            username: "123", 
            password: "1234",
            name: "مدير النظام",
            role: "admin",
            branchId: null
        },
        {
            id: 2,
            username: "147",
            password: "4321", 
            name: "مدير الفرع الرئيسي",
            role: "branch",
            branchId: 1
        }
    ],
    branches: [
        {
            id: 1,
            name: "الفرع الرئيسي - الفيزيو",
            location: "الرياض", 
            manager: "د. عبدالله محمد",
            status: "نشط"
        }
    ],
    services: [
        {
            id: 1,
            name: "علاج طبيعي",
            price: "300",
            status: "متوفر",
            description: "جلسة علاج طبيعي كاملة"
        },
        {
            id: 2, 
            name: "تدليك علاجي",
            price: "200",
            status: "متوفر",
            description: "جلسة تدليك علاجي"
        },
        {
            id: 3,
            name: "تأهيل إصابات",
            price: "350",
            status: "متوفر",
            description: "برنامج تأهيل الإصابات"
        }
    ],
    doctors: [
        {
            id: 1,
            name: "د. عبدالله محمد",
            specialty: "علاج طبيعي",
            phone: "0501234567",
            branchId: 1,
            status: "نشط"
        },
        {
            id: 2,
            name: "د. محمد أحمد",
            specialty: "تأهيل إصابات",
            phone: "0507654321", 
            branchId: 1,
            status: "نشط"
        }
    ],
    patients: [
        {
            id: 1,
            fileNumber: "P001",
            name: "خالد العنزي",
            phone: "0512345678",
            branchId: 1,
            status: "نشط"
        },
        {
            id: 2,
            fileNumber: "P002",
            name: "محمد القحطاني",
            phone: "0523456789",
            branchId: 1,
            status: "نشط"
        }
    ],
    appointments: [
        {
            id: 1,
            patientId: 1,
            branchId: 1,
            serviceId: 1,
            date: "2024-01-20",
            time: "10:00",
            status: "مؤكد"
        },
        {
            id: 2,
            patientId: 2,
            branchId: 1,
            serviceId: 2,
            date: "2024-01-20",
            time: "11:30",
            status: "مؤكد"
        }
    ],
    payments: [
        {
            id: 1,
            patientId: 1,
            amount: 300,
            date: "2024-01-20",
            method: "بطاقة",
            status: "مدفوع"
        },
        {
            id: 2,
            patientId: 2,
            amount: 200,
            date: "2024-01-20",
            method: "نقدي",
            status: "مدفوع"
        }
    ],
    googleSheetsConfig: {
        apiKey: 'AIzaSyBdeVXHBZh-JXWBRg-JYYPsZNQXPdViMDw',
        spreadsheetId: '1-GcfdiiAk5FhQpVcTRIxMlOFWweXAj0L',
        ranges: {
            patients: 'Patients!A:E',
            appointments: 'Appointments!A:F',
            payments: 'Payments!A:F',
            doctors: 'Doctors!A:E'
        }
    }
};