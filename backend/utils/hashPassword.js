// utils/hashPassword.js
import bcrypt from 'bcrypt';
import logger from '../configs/logger.config' // jangan lupa import

const saltRounds = 10;
const password = 'admin123'; // Change this to your desired password

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  logger.info('Hashed password:', hash);
});