import applicationConfig from './application/application.config';
import databaseConfig from './database/database.config';

export default () => ({
  app: applicationConfig(),
  db: databaseConfig(),
});
