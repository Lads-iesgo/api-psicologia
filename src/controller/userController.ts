import prisma from "../config/db";
import { UserInterface } from "../interfaces/types";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

const saltRounds = 10; // Custo do processamento do hash da senha
// IMPORTANTE: Defina o ID correto para o perfil de Fisioterapeuta/Aluno
const PERFIL_ID_FISIOTERAPEUTA = [4, 5]; // <--- SUBSTITUA PELO ID CORRETO DO SEU BANCO DE DADOS

// Lista todos os usuários (sem a senha)
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todos_usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome_completo: true,
        email: true,
        telefone: true,
        cpf: true,
        semestre: true,
        perfil_id: true,
        ativo: true
      }
    });
    res.status(200).json(todos_usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    next(error);
  }
};

// Busca usuário por ID (sem a senha)
export const getUsersById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido fornecido." });
      return;
    }
    
    const busca_id_usuario = await prisma.usuario.findUnique({
      where: {id: id}
    });

    if (!busca_id_usuario) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }
    res.status(200).json(busca_id_usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error);
    next(error);
  }
};

// Cria um novo usuário
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      nome_completo,
      email,
      senha, // Senha em texto plano vinda do cliente
      telefone,
      cpf,
      semestre,
      perfil_id,
      ativo
    }: UserInterface = req.body;

    if (!nome_completo || !email || !senha || perfil_id === undefined) {
      res.status(400).json({
        message:
          "Campos nome_completo, email, senha e perfil_id são obrigatórios.",
      });
      return;
    }

    // Verifica se o email já existe
    const busca_email_usuario = await prisma.usuario.findFirst({where: {email}});
    if (busca_email_usuario) {
      res.status(409).json({ message: "Email já cadastrado." });
      return;
    }

    // Verifica se o CPF já existe (se fornecido)
    if (cpf) {
      const existe_cpf = await prisma.usuario.findFirst({where: {cpf}});
      if (existe_cpf) {
        res.status(409).json({ message: "CPF já cadastrado." });
        return;
      }
    }

    const senha_hash = await bcrypt.hash(senha, saltRounds);

    // Cria um novo usuário
    const criar_usuario = await prisma.usuario.create({
      data:{
        nome_completo: nome_completo as string,
        email: email as string,
        senha_hash: senha_hash as string,
        telefone: telefone as string,
        cpf: cpf as string,
        semestre: semestre as string,
        perfil_id: Number(perfil_id),
      },
      select: {
        nome_completo: true,
        email: true,
        senha_hash: true,
        telefone: true,
        cpf: true,
        semestre: true,
        perfil_id: true,
        ativo: true
      }
    });

    res.status(201).json(criar_usuario);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    // Adicionar tratamento para erros de chave única (email, cpf) se não tratados acima
    if ((error as any).code === "P2002") {
      res.status(409).json({
        message: "Erro: Email ou CPF já cadastrado."
      });
      return;
    }
    next(error);
  }
};

// Atualiza um usuário existente
// Nota: A atualização de senha geralmente é tratada em uma rota separada por segurança.
// Esta função não atualiza a senha.
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      nome_completo,
      email,
      telefone,
      cpf,
      semestre,
      perfil_id,
      ativo
    }: UserInterface = req.body;

    // Coleta os campos que foram fornecidos para atualização
    const campos_atualizados: any = {};

    if (nome_completo !== undefined) campos_atualizados.nome_completo = nome_completo;
    if (telefone !== undefined) campos_atualizados.telefone = telefone;
    if (semestre !== undefined) campos_atualizados.semestre = semestre;
    if (ativo !== undefined) campos_atualizados.ativo = Number(ativo);
    if (perfil_id !== undefined) campos_atualizados.perfil_id = Number(perfil_id);

    if (nome_completo !== undefined) {
      prisma.usuario.update({
        where: {id},
        data: { nome_completo }
      })
    }

    if (email !== undefined) {
      // Verifica se o novo email já existe para outro usuário
      const existe_email = await prisma.usuario.findFirst({ where: {email} });

      if (existe_email) {
        res
          .status(409)
          .json({ message: "Novo email já cadastrado para outro usuário." });
        return;
      }

      campos_atualizados.email = email;
    }

    if (cpf !== undefined) {
      // Verifica se o novo CPF já existe para outro usuário
      const existe_cpf = await prisma.usuario.findFirst({
        where: {cpf}
      });

      if (existe_cpf) {
        res
          .status(409)
          .json({ message: "Novo CPF já cadastrado para outro usuário." });
        return;
      }
      
      campos_atualizados.cpf = cpf;
    }

    if (!campos_atualizados) {
      res
        .status(400)
        .json({ message: "Nenhum dado fornecido para atualização." });
      return;
    }

    const atualiza_usuario = await prisma.usuario.update({
      where: { id },
      data: campos_atualizados,
      select: {
        id: true,
        nome_completo: true,
        email: true,
        telefone: true,
        cpf: true,
        semestre: true,
        perfil_id: true,
        ativo: true
      },
    });

    res.status(200).json(atualiza_usuario);

  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    if ((error as any)?.code === "P2002") {
      res.status(409).json({
        message: "Erro: Email ou CPF já cadastrado.",
        details: (error as any).sqlMessage,
      });
      return;
    }

    else if((error as any)?.error === "P2025"){
      res.status(404).json({ message: "Usuário não encontrado para atualização" });
      return;
    }
    next(error);
  }
};

// Busca todos os usuários que são Fisioterapeutas/Alunos
export const getFisioterapeutas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todos_fisioterapeutas = await prisma.usuario.findMany({
      where: { perfil_id: { in: PERFIL_ID_FISIOTERAPEUTA } },
      select: {
        id: true,
        nome_completo: true,
        email: true,
        telefone: true,
        cpf: true,
        semestre: true,
        perfil_id: true,
        ativo: true
      }
    });
    res.status(200).json(todos_fisioterapeutas);
  } catch (error) {
    console.error("Erro ao buscar fisioterapeutas:", error);
    next(error);
  }
};

// Deleta usuario 
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try{
    const id = parseInt(req.params.id, 10);
    const deleta_usuario = await prisma.usuario.delete({where: {id}})
    res.status(200).json({
      message: ("Usuário deletado com sucesso!")
    });
  } catch (error: any){
    console.error("Erro ao deletar usuário:", error);
    if (error.code === "P2025") {
      res.status(404).json({ message: "Consulta não encontrada." });
      return;
    };
    next(error);
  }
};
