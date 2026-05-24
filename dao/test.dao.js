const db = require('../services/mysql.service');

// USUARIOS 
const createUser = async (req, res) => {
    try {
        const { name, email, telephone } = req.body;
        const [result] = await db.query(
            'INSERT INTO user (name, email, telephone) VALUES (?, ?, ?)',
            [name, email, telephone]
        );
        res.status(201).json({ id_user: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id_user, name, email, telephone FROM user');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT id_user, name, email, telephone FROM user WHERE id_user = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// TAREAS 
const createTask = async (req, res) => {
    try {
        const { description, start_date, deliviry_date, final_note } = req.body;
        const [result] = await db.query(
            'INSERT INTO task (description, start_date, delivery_date, final_note) VALUES (?, ?, ?, ?)',
            [description, start_date, deliviry_date, final_note]
        );
        res.status(201).json({ id_task: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllTasks = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM task');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM task WHERE id_task = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// MATERIAS
const createSubject = async (req, res) => {
    try {
        const { subjectName, userId } = req.body;
        const [result] = await db.query(
            'INSERT INTO subject (name, user_id_user) VALUES (?, ?)',
            [subjectName, userId]
        );
        res.status(201).json({ id_subject: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subject');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM subject WHERE id_subject = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Materia no encontrada' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// RELACIONES 
const createRelation = async (req, res) => {
    try {
        const { subjectId, taskId, userId } = req.body;
        await db.query(
            'INSERT INTO subject_has_task (subject_id_subject, subject_user_id_user, task_id_task, pending_task, complete_task) VALUES (?, ?, ?, 1, 0)',
            [subjectId, userId, taskId]
        );
        res.status(201).json({ message: 'Relación creada' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllRelations = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                sht.subject_id_subject,
                sht.task_id_task,
                sht.pending_task,
                sht.complete_task,
                s.name AS subject_name,
                t.description AS task_description
            FROM subject_has_task sht
            JOIN subject s ON sht.subject_id_subject = s.id_subject
            JOIN task t ON sht.task_id_task = t.id_task
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getRelationById = async (req, res) => {
    try {
        const { subjectId, taskId } = req.params;
        const [rows] = await db.query(`
            SELECT 
                sht.subject_id_subject,
                sht.task_id_task,
                sht.pending_task,
                sht.complete_task,
                s.name AS subject_name,
                t.description AS task_description
            FROM subject_has_task sht
            JOIN subject s ON sht.subject_id_subject = s.id_subject
            JOIN task t ON sht.task_id_task = t.id_task
            WHERE sht.subject_id_subject = ? AND sht.task_id_task = ?
        `, [subjectId, taskId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Relación no encontrada' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ETL 
const runETL = async (req, res) => {
    try {
        const { initializeApp, getApps } = require('firebase/app');
        const { getFirestore, collection, getDocs } = require('firebase/firestore');

        const firebaseConfig = {
            apiKey: "AIzaSyBUTIKxh2N05Xmvzfa9fTkFTN_TTxvPTIA",
            authDomain: "tasksphere-2fb71.firebaseapp.com",
            projectId: "tasksphere-2fb71",
            storageBucket: "tasksphere-2fb71.firebasestorage.app",
            messagingSenderId: "146031809729",
            appId: "1:146031809729:web:eeec68ff2afbb836bcf040"
        };

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        const firestore = getFirestore(app);
        const snapshot = await getDocs(collection(firestore, 'activity_logs'));

        let inserted = 0;
        let skipped = 0;
        let invalid = 0;
        const insertedRecords = [];

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const firebaseId = doc.id;

            // VALIDACIÓN: campos obligatorios
            if (!data.action || !data.entity_type || !data.timestamp) {
                invalid++;
                continue;
            }

            // VALIDACIÓN: acción debe ser un valor conocido
            const validActions = ['register', 'login', 'create_task', 'create_subject', 'complete_task'];
            if (!validActions.includes(data.action)) {
                invalid++;
                continue;
            }

            // Verificar duplicado
            const [existing] = await db.query(
                'SELECT id FROM activity_logs WHERE firebase_id = ?',
                [firebaseId]
            );
            if (existing.length > 0) { skipped++; continue; }

            // TRANSFORMAR: timestamp Firestore → MySQL DATETIME
            const timestamp = data.timestamp?.toDate
                ? data.timestamp.toDate().toISOString().slice(0, 19).replace('T', ' ')
                : null;

            const metadata = JSON.stringify(data.metadata || {});

            // CARGAR en MySQL
            await db.query(
                `INSERT INTO activity_logs 
                (firebase_id, user_id, user_email, action, entity_type, entity_id, timestamp, platform, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [firebaseId, data.user_id || null, data.user_email || null,
                 data.action, data.entity_type, data.entity_id || null,
                 timestamp, data.platform || 'web', metadata]
            );

            insertedRecords.push({
                firebase_id: firebaseId,
                action: data.action,
                user_email: data.user_email,
                timestamp
            });
            inserted++;
        }

        res.json({
            message: `ETL completado exitosamente.`,
            resumen: {
                total_firebase: snapshot.docs.length,
                insertados: inserted,
                omitidos_duplicado: skipped,
                omitidos_invalidos: invalid
            },
            registros_insertados: insertedRecords
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createUser, getAllUsers, getUserById,
    createTask, getAllTasks, getTaskById,
    createSubject, getAllSubjects, getSubjectById,
    createRelation, getAllRelations, getRelationById,
    runETL
};