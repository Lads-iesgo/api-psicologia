import { PrismaClient } from "../../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";

dotenv.config(); // Carrega as variáveis de ambiente do .env

console.log(`Usuário do banco: ${process.env.DB_USER}`);

// Cria a conexão com o banco de dados
const adapter = new PrismaMariaDb(`${process.env.DATABASE_URL}`);
const prisma = new PrismaClient({adapter});

// Testa a conexão com o banco e devolve no console o resultado
async function testa_conexao(){
  try {
  await prisma.$connect()
  console.log("O prisma conectou com sucesso no banco de dados!");
  } catch (error) {
    const err = error as Error;
    console.error("O prisma não conseguiu se conectar ao banco de dados! Erro: ", err.message);
  }
};

testa_conexao();

export default prisma;
