// Utility to ensure all required tables exist on backend startup
import { ensureTablesExist as ensureAuthTables } from './controllers/authController.js';
import { ensurePackagesTable } from './models/Package.js';

const ensureAllTables = async () => {
  await ensureAuthTables();
  await ensurePackagesTable();
};

export default ensureAllTables;
