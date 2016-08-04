import express from 'express';
let router = express.Router();
import api from './api';
import usersApi from './users';

router.use('/api', api);
router.use('/api/users', usersApi);

export default router;
