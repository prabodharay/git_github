import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const signAccessToken = ({ uid, role, sessionId }) =>
  jwt.sign({ uid, role, sessionId, type: 'access' }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessTtl
  });

export const signRefreshToken = ({ uid, role, sessionId }) =>
  jwt.sign({ uid, role, sessionId, type: 'refresh' }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

export const generateSessionId = () => crypto.randomUUID();
