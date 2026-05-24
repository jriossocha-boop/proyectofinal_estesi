const db = require('../services/mysql.service');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'tasksphere_secret_key_2026';
const JWT_EXPIRES = '2h';

// ─── HASHING ──────────────────────────────────────────────────────────────────
// 1. Se genera un salt aleatorio de 32 bytes
// 2. Se concatena salt + password
// 3. Se aplica SHA-256 sobre la concatenación 10,000 veces (iteraciones)
// Esto hace el hash resistente a ataques de fuerza bruta
const generateSalt = () => {
    return crypto.randomBytes(32).toString('hex');
};

const hashPassword = (password, salt) => {
    let hash = salt + password;
    for (let i = 0; i < 10000; i++) {
        hash = crypto.createHash('sha256').update(hash).digest('hex');
    }
    return hash;
};

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, telephone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
        }

        const [existing] = await db.query('SELECT id_user FROM user WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado.' });
        }

        const salt = generateSalt();
        const password_hash = hashPassword(password, salt);

        const [result] = await db.query(
            'INSERT INTO user (name, email, telephone, password_hash, salt) VALUES (?, ?, ?, ?, ?)',
            [name, email, telephone, password_hash, salt]
        );

        // Generar token JWT al registrarse
        const token = jwt.sign(
            { id_user: result.insertId, email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente.',
            token,
            user: { id_user: result.insertId, name, email }
        });

    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
        }

        const [rows] = await db.query(
            'SELECT id_user, name, email, password_hash, salt FROM user WHERE email = ?',
            [email]
        );
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        const user = rows[0];
        const hash = hashPassword(password, user.salt);

        if (hash !== user.password_hash) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id_user: user.id_user, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        res.json({
            message: 'Login exitoso.',
            token,
            user: { id_user: user.id_user, name: user.name, email: user.email }
        });

    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── VERIFICAR TOKEN ──────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requerido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

// ─── PERFIL (ruta protegida de ejemplo) ───────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id_user, name, email, telephone FROM user WHERE id_user = ?',
            [req.user.id_user]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { register, login, verifyToken, getProfile };