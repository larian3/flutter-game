import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { initDatabase } from './config/database';
import { initRedis } from './config/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Initialize and start server
async function startServer() {
  try {
    // Inicializar banco de dados
    console.log('🔄 Inicializando banco de dados...');
    await initDatabase();

    // Inicializar Redis
    console.log('🔄 Conectando ao Redis...');
    await initRedis();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📝 API disponível em http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;

