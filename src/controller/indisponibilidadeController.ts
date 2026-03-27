import prisma from "../config/db";
import { Request, Response, NextFunction } from "express";
import { IndisponibilidadeInterface } from "../interfaces/types";

// Funções de formatação:
// Eles convertem o DateTime que o Prisma retorna para o estilo "HH:MM"
function formatarData(valor: any): string {
  if (valor instanceof Date) {
    const a = valor.getUTCFullYear();
    const m = String(valor.getUTCMonth() + 1).padStart(2, "0");
    const d = String(valor.getUTCDate()).padStart(2, "0");
    return `${a}-${m}-${d}`;
  }
  if (typeof valor === "string") {
    return valor.substring(0, 10);
  }
  return String(valor ?? "");
}

function formatarHorario(valor: any): string | null {
  if (!valor) return null;
  if (valor instanceof Date) {
    const h = String(valor.getUTCHours()).padStart(2, "0");
    const m = String(valor.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
  if (typeof valor === "string") {
    return valor.substring(0, 5);
  }
  return String(valor);
}

function converterHorario(valor: string): Date {
  const [h, m] = valor.split(":").map(Number);
  const d = new Date(0);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

// Busca todos as datas de indisponibilidade
export const getIndisponibilidade = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const linhas = await prisma.indisponibilidade.findMany();
    const formatados = linhas.map((linha: typeof linhas[number]) => ({
      ...linha,
      data_indisponivel: formatarData(linha.data_indisponivel),
      hora_inicio: formatarHorario(linha.hora_inicio),
      hora_fim: formatarHorario(linha.hora_fim),
    }));
    res.status(200).json(formatados);
  } catch (erro) {
    next(erro);
  }
};

// Busca a data indisponível pelo id
export const getIndisponibilidadeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const linha = await prisma.indisponibilidade.findUnique({ where: { id } });

    if (!linha) {
      res.status(404).json({ message: "Registro de indisponibilidade não encontrado." });
      return;
    }

    res.status(200).json({
      ...linha,
      data_indisponivel: formatarData(linha.data_indisponivel),
      hora_inicio: formatarHorario(linha.hora_inicio),
      hora_fim: formatarHorario(linha.hora_fim),
    });
  } catch (erro) {
    next(erro);
  }
};

// Cria as datas indisponíveis
export const createIndisponibilidade = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data_indisponivel, descricao, hora_inicio, hora_fim }: IndisponibilidadeInterface = req.body;

    if (!data_indisponivel) {
      res.status(400).json({ message: "O campo data_indisponivel é obrigatório." });
      return;
    }

    const novaIndisponibilidade = await prisma.indisponibilidade.create({
      data: {
        data_indisponivel: new Date (data_indisponivel),
        descricao: descricao || null,
        hora_inicio: hora_inicio ? converterHorario(hora_inicio as string) : null,
        hora_fim: hora_fim ? converterHorario(hora_fim as string) : null,
      },
    });

    res.status(201).json({
      ...novaIndisponibilidade,
      data_indisponivel: formatarData(novaIndisponibilidade.data_indisponivel),
      hora_inicio: formatarHorario(novaIndisponibilidade.hora_inicio),
      hora_fim: formatarHorario(novaIndisponibilidade.hora_fim),
    });
  } catch (erro) {
    next(erro);
  }
};

export const updateIndisponibilidade = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { data_indisponivel, descricao, hora_inicio, hora_fim } = req.body;

    if (!data_indisponivel) {
      res.status(400).json({ message: "O campo data_indisponivel é obrigatório para atualização." });
      return;
    }

    const atualizado = await prisma.indisponibilidade.update({
      where: { id },
      data: {
        data_indisponivel: new Date(data_indisponivel),
        descricao: descricao !== undefined ? descricao : null,
        hora_inicio: hora_inicio ? converterHorario(hora_inicio as string) : null,
        hora_fim: hora_fim ? converterHorario(hora_fim as string) : null,
      },
    });

    res.status(200).json({
      ...atualizado,
      data_indisponivel: formatarData(atualizado.data_indisponivel),
      hora_inicio: formatarHorario(atualizado.hora_inicio),
      hora_fim: formatarHorario(atualizado.hora_fim),
    });
  } catch (erro: any) {
    if (erro?.code === "P2025") {
      res.status(404).json({ message: "Registro de indisponibilidade não encontrado." });
      return;
    }
    next(erro);
  }
};

export const deleteIndisponibilidade = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    await prisma.indisponibilidade.delete({
      where: { id },
    });

    res.status(200).json({ message: "Dia indisponível apagado com sucesso!"});
  } catch (erro: any) {
    if (erro?.code === "P2025") {
      res.status(404).json({ message: "Registro de indisponibilidade não encontrado." });
      return;
    }
    next(erro);
  }
};