const express = require('express');
const router = express.Router();
const dao = require('../dao/test.dao');

// Usuarios
router.get('/users/:id', dao.getUserById);
router.get('/users', dao.getAllUsers);
router.post('/users', dao.createUser);

// Tareas
router.get('/tasks/:id', dao.getTaskById);
router.get('/tasks', dao.getAllTasks);
router.post('/tasks', dao.createTask);

// Materias
router.get('/subjects/:id', dao.getSubjectById);
router.get('/subjects', dao.getAllSubjects);
router.post('/subjects', dao.createSubject);

// Relaciones
router.get('/relations/:subjectId/:taskId', dao.getRelationById);
router.get('/relations', dao.getAllRelations);
router.post('/relations', dao.createRelation);

// ETL
router.post('/etl', dao.runETL);

module.exports = router;