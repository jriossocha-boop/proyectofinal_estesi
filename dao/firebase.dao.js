import { db } from "/env/firebaseConfig.js";
import {
    collection,
    addDoc,
    getDocs,
    Timestamp,
    query,
    orderBy,
    where,
    limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const activityLogsRef = collection(db, "activity_logs");

// SEED 
const seedDocuments = [
    {
        user_id: 1, user_email: "juan@gmail.com", action: "register",
        entity_type: "user", entity_id: 1,
        timestamp: Timestamp.fromDate(new Date("2026-05-23T09:00:00")),
        platform: "web", metadata: { success: true }
    },
    {
        user_id: 1, user_email: "juan@gmail.com", action: "create_subject",
        entity_type: "subject", entity_id: 1,
        timestamp: Timestamp.fromDate(new Date("2026-05-23T09:05:00")),
        platform: "web", metadata: { subject_name: "Bases de Datos" }
    },
    {
        user_id: 1, user_email: "juan@gmail.com", action: "create_task",
        entity_type: "task", entity_id: 1,
        timestamp: Timestamp.fromDate(new Date("2026-05-23T09:10:00")),
        platform: "web", metadata: { description: "Parcial de cálculo", delivery_date: "2026-06-01" }
    },
    {
        user_id: 2, user_email: "maria@gmail.com", action: "login",
        entity_type: "user", entity_id: 2,
        timestamp: Timestamp.fromDate(new Date("2026-05-23T10:00:00")),
        platform: "web", metadata: { success: true }
    },
    {
        user_id: 1, user_email: "juan@gmail.com", action: "complete_task",
        entity_type: "task", entity_id: 1,
        timestamp: Timestamp.fromDate(new Date("2026-05-23T11:00:00")),
        platform: "web", metadata: { description: "Parcial de cálculo", final_note: 4.5, days_taken: 7 }
    }
];

export const seedActivityLogs = async () => {
    try {
        const snapshot = await getDocs(activityLogsRef);
        if (!snapshot.empty) {
            console.log("La colección ya tiene datos, seed omitido.");
            return;
        }
        for (const doc of seedDocuments) {
            await addDoc(activityLogsRef, doc);
        }
        console.log("Seed completado: 5 documentos insertados en activity_logs.");
    } catch (err) {
        console.error("Error en seed:", err);
    }
};

// INSERTAR EVENTO 
export const logActivity = async (userId, userEmail, action, entityType, entityId, metadata = {}) => {
    try {
        await addDoc(activityLogsRef, {
            user_id: userId,
            user_email: userEmail,
            action: action,
            entity_type: entityType,
            entity_id: entityId,
            timestamp: Timestamp.now(),
            platform: "web",
            metadata: metadata
        });
    } catch (err) {
        console.error("Error al registrar actividad en Firebase:", err);
    }
};

// QUERY 1: Todos los logs ordenados por fecha
export const getAllLogs = async () => {
    try {
        const q = query(activityLogsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error("Error al obtener logs:", err);
        return [];
    }
};

//QUERY 2: Logs por usuario (filtrar por email) 
export const getLogsByUser = async (userEmail) => {
    try {
        const q = query(
            activityLogsRef,
            where("user_email", "==", userEmail),
            orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error("Error al obtener logs por usuario:", err);
        return [];
    }
};

// QUERY 3: Logs por tipo de acción 
export const getLogsByAction = async (action) => {
    try {
        const q = query(
            activityLogsRef,
            where("action", "==", action),
            orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error("Error al obtener logs por acción:", err);
        return [];
    }
};

// QUERY 4: Últimos N eventos 
export const getRecentLogs = async (n = 5) => {
    try {
        const q = query(
            activityLogsRef,
            orderBy("timestamp", "desc"),
            limit(n)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error("Error al obtener logs recientes:", err);
        return [];
    }
};