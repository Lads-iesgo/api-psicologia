import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mysql from "mysql2/promise";

import userRoutes from "./user.routes";
import clientRoutes from "./paciente.routes";
import perfilRoutes from "./perfil.routes";
import consultaRoutes from "./consulta.routes";
import horarioRoutes from "./horario.routes";
import authRoutes from "./auth.routes";
import registerRoutes from "./register.routes";
import indisponibilidadeRoutes from "./indisponibilidade.routes"

import { authMiddleware } from "../middleware/authMiddleware";
import { readOnlyForStudents, checkRole, applyConsultaDataIsolation } from "../middleware/rbacMiddleware";

if (!process.env.JWT_SECRET) {
  throw new Error("A variável de ambiente JWT_SECRET não está definida.");
}
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_DATABASE || !process.env.DB_PORT) {
  throw new Error("As variáveis de ambiente do banco de dados não estão configuradas corretamente.");
}

const app = express();

app.use(express.json());
app.use(cors());

// Adiciona uma rota para a raiz
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "API Fisioterapia está funcionando!" });
});

// Rotas públicas (sem autenticação)
app.use("/auth", authRoutes);
app.use("/register", registerRoutes);

// Rotas protegidas (com autenticação e RBAC)
app.use("/usuario", authMiddleware, readOnlyForStudents, userRoutes);
app.use("/paciente", authMiddleware, readOnlyForStudents, clientRoutes);
app.use("/perfil", authMiddleware, checkRole("professor", "coordenador", "admin"), perfilRoutes);
app.use("/consulta", authMiddleware, readOnlyForStudents, applyConsultaDataIsolation, consultaRoutes);
app.use("/horario", authMiddleware, readOnlyForStudents, horarioRoutes);
app.use("/indisponibilidade", authMiddleware, indisponibilidadeRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({ message: err.message || "Internal Server Error" });
});

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: Number(process.env.DB_PORT),
    });
    console.log("Conexão com o banco de dados bem-sucedida!");
    connection.end();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao conectar ao banco de dados:", error.message);
    } else {
      console.error("Erro ao conectar ao banco de dados:", error);
    }
    process.exit(1);
  }
})();

export default app;
