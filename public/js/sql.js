import { seedActivityLogs, logActivity, getAllLogs, getLogsByUser, getLogsByAction, getRecentLogs } from '/dao/firebase.dao.js';

// ─── SEED al cargar la página ─────────────────────────────────────────────────
seedActivityLogs();

// ─── Estado de sesión ─────────────────────────────────────────────────────────
let currentUser = null;
let authToken = null;

// ─── Función genérica para renderizar listas ──────────────────────────────────
const renderList = (data, elementId) => {
    const list = document.getElementById(elementId);
    list.innerHTML = '';
    data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = JSON.stringify(item);
        list.appendChild(li);
    });
};

const renderLogs = (logs, elementId) => {
    const list = document.getElementById(elementId);
    list.innerHTML = '';
    if (logs.length === 0) {
        list.innerHTML = '<li>No hay logs registrados.</li>';
        return;
    }
    logs.forEach(log => {
        const li = document.createElement('li');
        const ts = log.timestamp?.toDate?.().toLocaleString() ?? 'Sin fecha';
        li.textContent = `[${ts}] ${log.action} | Usuario: ${log.user_email} | Entidad: ${log.entity_type} ID:${log.entity_id}`;
        list.appendChild(li);
    });
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
document.getElementById('registerBtn').onclick = async () => {
    const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            telephone: document.getElementById('regTelephone').value,
            password: document.getElementById('regPassword').value
        })
    });
    const data = await res.json();
    if (data.token) {
        authToken = data.token;
        currentUser = data.user;
        document.getElementById('registerResult').textContent =
            `${data.message} Bienvenido ${data.user.name}`;
        await logActivity(data.user.id_user, data.user.email, 'register', 'user', data.user.id_user, { success: true });
    } else {
        document.getElementById('registerResult').textContent = data.error;
    }
};

document.getElementById('loginBtn').onclick = async () => {
    const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        })
    });
    const data = await res.json();
    if (data.token) {
        authToken = data.token;
        currentUser = data.user;
        document.getElementById('loginResult').textContent =
            `${data.message} Bienvenido de nuevo, ${data.user.name}`;
        await logActivity(data.user.id_user, data.user.email, 'login', 'user', data.user.id_user, { success: true });
    } else {
        document.getElementById('loginResult').textContent = data.error;
    }
};

// ─── USUARIOS ─────────────────────────────────────────────────────────────────
document.getElementById('createUser').onclick = async () => {
    const name      = document.getElementById('name').value;
    const email     = document.getElementById('email').value;
    const telephone = document.getElementById('telephone').value;
    const res  = await fetch('/test/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, telephone })
    });
    const data = await res.json();
    await logActivity(data.id_user, email, 'register', 'user', data.id_user, { success: true });
    alert("Usuario Creado");
};

document.getElementById('getAllUsers').onclick = async () => {
    const res  = await fetch('/test/users');
    const data = await res.json();
    renderList(data, 'userResult');
};

document.getElementById('getUser').onclick = async () => {
    const id = document.getElementById('userId').value;
    if (!id) return alert("Ingresa un ID");
    try {
        const res  = await fetch(`/test/users/${id}`);
        const data = await res.json();
        document.getElementById('userResult').innerHTML = data.error
            ? `<li>${data.error}</li>`
            : `<li>ID: ${data.id_user} | Nombre: ${data.name} | Email: ${data.email} | Teléfono: ${data.telephone}</li>`;
    } catch (err) { console.error(err); }
};

// ─── TAREAS ───────────────────────────────────────────────────────────────────
document.getElementById('createTask').onclick = async () => {
    const description   = document.getElementById('description').value;
    const start_date    = document.getElementById('start_date').value;
    const delivery_date = document.getElementById('delivery_date').value;
    const final_note    = document.getElementById('final_note').value;
    const res  = await fetch('/test/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, start_date, deliviry_date: delivery_date, final_note })
    });
    const data = await res.json();
    const userEmail = currentUser?.email || 'unknown';
    await logActivity(currentUser?.id_user || null, userEmail, 'create_task', 'task', data.id_task, { description, delivery_date });
    alert("Tarea Creada");
};

document.getElementById('getAllTasks').onclick = async () => {
    const res  = await fetch('/test/tasks');
    const data = await res.json();
    renderList(data, 'taskResult');
};

document.getElementById('getTask').onclick = async () => {
    const id  = document.getElementById('taskId').value;
    const res = await fetch(`/test/tasks/${id}`);
    const data = await res.json();
    document.getElementById('taskResult').innerHTML = data.error
        ? `<li>${data.error}</li>`
        : `<li>ID: ${data.id_task} | Descripción: ${data.description} | Inicio: ${data.start_date} | Entrega: ${data.delivery_date} | Nota: ${data.final_note}</li>`;
};

// ─── MATERIAS ─────────────────────────────────────────────────────────────────
document.getElementById('createSubject').onclick = async () => {
    const subjectName = document.getElementById('subjectName').value;
    const userId      = document.getElementById('subjectUserId').value;
    const res  = await fetch('/test/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName, userId })
    });
    const data = await res.json();
    const userEmail = currentUser?.email || 'unknown';
    await logActivity(userId || null, userEmail, 'create_subject', 'subject', data.id_subject, { subject_name: subjectName });
    alert("Materia Creada");
};

document.getElementById('getSubject').onclick = async () => {
    const id  = document.getElementById('subjectId').value;
    const res = await fetch(`/test/subjects/${id}`);
    const data = await res.json();
    document.getElementById('subjectResult').innerHTML = data.error
        ? `<li>${data.error}</li>`
        : `<li>ID: ${data.id_subject} | Nombre: ${data.name} | Usuario ID: ${data.user_id_user}</li>`;
};

document.getElementById('getAllSubjects').onclick = async () => {
    const res  = await fetch('/test/subjects');
    const data = await res.json();
    renderList(data, 'subjectResult');
};

// ─── RELACIONES ───────────────────────────────────────────────────────────────
document.getElementById('createRelation').onclick = async () => {
    const subjectId = document.getElementById('relSubjectId').value;
    const taskId    = document.getElementById('relTaskId').value;
    const userId = currentUser?.id_user || document.getElementById('relUserId').value;
    await fetch('/test/relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, taskId, userId })
    });
    alert("Relación establecida");
};

document.getElementById('getRelation').onclick = async () => {
    const subjectId = document.getElementById('relGetSubjectId').value;
    const taskId    = document.getElementById('relGetTaskId').value;
    if (!subjectId || !taskId) return alert("Ingresa Subject ID y Task ID");
    const res  = await fetch(`/test/relations/${subjectId}/${taskId}`);
    const data = await res.json();
    document.getElementById('relationResult').innerHTML = data.error
        ? `<li>${data.error}</li>`
        : `<li>Materia: ${data.subject_name} | Tarea: ${data.task_description} | Pendiente: ${data.pending_task} | Completada: ${data.complete_task}</li>`;
};

document.getElementById('getAllRelations').onclick = async () => {
    const res  = await fetch('/test/relations');
    const data = await res.json();
    const list = document.getElementById('relationResult');
    list.innerHTML = '';
    data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `Materia: ${item.subject_name} | Tarea: ${item.task_description} | Pendiente: ${item.pending_task} | Completada: ${item.complete_task}`;
        list.appendChild(li);
    });
};

// ─── FIREBASE LOGS ────────────────────────────────────────────────────────────
document.getElementById('getFirebaseLogs').onclick = async () => {
    const logs = await getAllLogs();
    renderLogs(logs, 'firebaseResult');
};

// Query 2: filtrar por usuario
document.getElementById('getLogsByUser').onclick = async () => {
    const email = document.getElementById('filterEmail').value;
    if (!email) return alert("Ingresa un email");
    const logs = await getLogsByUser(email);
    renderLogs(logs, 'firebaseResult');
};

// Query 3: filtrar por acción
document.getElementById('getLogsByAction').onclick = async () => {
    const action = document.getElementById('filterAction').value;
    if (!action) return alert("Selecciona una acción");
    const logs = await getLogsByAction(action);
    renderLogs(logs, 'firebaseResult');
};

// Query 4: últimos N eventos
document.getElementById('getRecentLogs').onclick = async () => {
    const n = parseInt(document.getElementById('filterLimit').value) || 5;
    const logs = await getRecentLogs(n);
    renderLogs(logs, 'firebaseResult');
};

// ─── ETL ──────────────────────────────────────────────────────────────────────
document.getElementById('runETL').onclick = async () => {
    const res = await fetch('/test/etl', { method: 'POST' });
    const data = await res.json();
    if (data.resumen) {
        document.getElementById('etlResult').textContent = 
            `${data.message} | Total Firebase: ${data.resumen.total_firebase} | Insertados: ${data.resumen.insertados} | Duplicados omitidos: ${data.resumen.omitidos_duplicado} | Inválidos: ${data.resumen.omitidos_invalidos}`;
    } else {
        document.getElementById('etlResult').textContent = data.error;
    }
};