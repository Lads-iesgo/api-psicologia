import { waitForDebugger } from "node:inspector";
import prisma from "../config/db";
import { PerfilInterface } from "../interfaces/types";
import { Request, Response, NextFunction } from "express";

export const getPerfil = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todos_perfis = await prisma.perfil.findMany();
    res.status(200).json(todos_perfis);
  } catch (error) {
    next(error);
  }
};

export const getPerfilById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const busca_id_perfil = await prisma.perfil.findFirst({
      where: {id}
    })

    if (!busca_id_perfil) {
      res.status(404).json({ message: "Perfil não encontrado" });
      return;
    }

    res.status(200).json(busca_id_perfil);
  } catch (error) {
    next(error);
  }
};

export const createPerfil = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nome }: PerfilInterface = req.body;

    const criar_perfil = await prisma.perfil.create({
      data: { nome: nome }
    });

    res.status(201).json(criar_perfil);
  } catch (error) {
    next(error);
  }
};

export const updatePerfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nome } = req.body;

    if (!nome) {
      res
        .status(400)
        .json({ message: "O campo nome é obrigatório para atualização." });
      return;
    }

    const atualizar_perfil = await prisma.perfil.update({
      where: {id},
      data: { nome: nome as string}
    });

    if (!atualizar_perfil) {
      res.status(404).json({ message: "Perfil não encontrado" });
      return;
    }

    res.status(200).json({ id, nome });
  } catch (error) {
    next(error);
  }
};
