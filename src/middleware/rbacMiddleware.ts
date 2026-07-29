import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
      dataIsolation?: { aluno_id: number };
    }
  }
}

// Nomes dos perfis (valores exatos do campo perfil.nome no banco)
const ROLES = {
	ADMIN: "admin",
	ALUNO: "aluno",
	COORDENADOR: "coordenador",
	PROFESSOR: "professor",
};

// Grupos de perfis com permissões equivalentes
const ROLE_GROUPS = {
	// Admin e Coordenador têm acesso irrestrito (CRUD completo)
	UNRESTRICTED: [ROLES.ADMIN, ROLES.COORDENADOR],
	// Professor tem CRUD completo (com restrição ao criar usuários)
	FULL_CRUD: [ROLES.PROFESSOR],
	// Aluno têm apenas leitura (GET)
	READ_ONLY: [ROLES.ALUNO],
};

// Verifica se o usuário tem um dos perfis permitidos
export const checkRole = (...allowedRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		if (!user) {
			res.status(401).json({ message: "Não autenticado." });
			return;
		}

		if (!allowedRoles.includes(user.role)) {
			res.status(403).json({
				message: "Acesso negado. Você não tem permissão para esta operação.",
			});
			return;
		}
		next();
	};
};

// Permite apenas GET para Aluno/Fisioterapeuta; outros passam livremente
export const readOnlyForStudents = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const user = req.user;
	if (!user) {
		res.status(401).json({ message: "Não autenticado." });
		return;
	}

	if (ROLE_GROUPS.READ_ONLY.includes(user.role) && req.method !== "GET") {
		res.status(403).json({
			message: "Sua função só permite operações de leitura.",
		});
		return;
	}
	next();
};

// Valida propriedade de Consulta para Aluno/Fisioterapeuta
export const checkConsultaOwnership = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const user = req.user!;

	// Unrestricted e Full CRUD não têm restrição de propriedade
	if (
		ROLE_GROUPS.UNRESTRICTED.includes(user.role) ||
		ROLE_GROUPS.FULL_CRUD.includes(user.role)
	) {
		next();
		return;
	}

	// Aluno e Fisioterapeuta têm isolamento de dados
	const consultaId = parseInt(req.params.id);
	if (isNaN(consultaId)) {
		next();
		return;
	} // listagem — filtro aplicado no controller

	const consulta = await prisma.consulta.findUnique({
		where: { id: consultaId },
	});
	if (!consulta) {
		res.status(404).json({ message: "Consulta não encontrada." });
		return;
	}

	if (consulta.aluno_id !== user.id) {
		res.status(403).json({
			message: "Você não tem acesso a esta consulta.",
		});
		return;
	}
	next();
};

// Restringe Professor a criar apenas usuários com perfis "aluno" ou "fisioterapeuta"
export const restrictProfessorUserCreation = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const user = req.user!;

	// Admin e Coordenador não têm restrição
	if (ROLE_GROUPS.UNRESTRICTED.includes(user.role)) {
		next();
		return;
	}

	if (user.role === ROLES.PROFESSOR) {
		const { perfil_id } = req.body;

		const perfilsPermitidos = await prisma.perfil.findMany({
			where: { nome: { in: [ROLES.ALUNO] } },
		});

		const idsPermitidos = perfilsPermitidos.map((p: { id: number }) => p.id);

		if (!idsPermitidos.includes(perfil_id)) {
			res.status(403).json({
				message:
					"Professores só podem criar usuários com perfil de Aluno ou Fisioterapeuta.",
			});
			return;
		}
	}
	next();
};

// Aplica isolamento de dados para leitura de Consultas para Aluno/Fisioterapeuta
export const applyConsultaDataIsolation = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const user = req.user!;

	// Se for Aluno ou Fisioterapeuta, armazena no req para o controller usar
	if (ROLE_GROUPS.READ_ONLY.includes(user.role)) {
		(req as any).dataIsolation = { aluno_id: user.id };
	}

	next();
};