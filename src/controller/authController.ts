import prisma from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, senha } = req.body;

    // Verifica se o usuário existe no banco de dados e busca nome e o perfil linkado a ele
    const usuario = await prisma.usuario.findFirst({
      where: { email },
      include: {perfil: true}
    });

    if(!usuario){
      res.status(401).json({
        status: "error",
        messsage: "Usuário não encontrado, verifique se a senha ou o email estão corretos!" // Não devolve o campo errado por segunraça
      });
      return;
    };
    
    if (usuario.ativo === 0) {
			res.status(403).json({
				status: "error",
				message:
					"Sua conta foi desativada. Entre em contato com a coordenação.",
			});
			return;
		}
    
    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash!);
    if (!senhaValida) {
      res.status(401).json({
        status: "error",
        message: "Usuário ou senha inválido.",
      });
      return;
    }

    // Busca o nome do perfil (role)
    const nomePerfil = usuario.perfil?.nome ?? "Desconhecido";

    // Gera um token JWT com id e role
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET não está definido no .env!");
      // Resposta de erro genérica para evitar vazamento de informações
      // Evita expor detalhes técnicos ao usuário final
      res.status(500).json({
        status: "error",
        message: "Erro interno do servidor: configuração de autenticação ausente.",
      });
      return;
    }

    const tokenPayload = {
      id: usuario.id, // ID do usuário
      role: nomePerfil, // Nome do perfil (role) do usuário
    };

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: "1h", // Token expira em 1 hora
    });

    res.status(200).json({
      status: "success",
      message: "Login bem-sucedido!",
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome_completo, 
        perfil: nomePerfil,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error); // Log do erro para depuração
    // Evita passar o objeto de erro diretamente para o cliente em produção por segurança
    res.status(500).json({
        status: "error",
        message: "Ocorreu um erro durante o login. Por favor, tente novamente."
    });
    // Se você tiver um middleware de tratamento de erros configurado, pode usar next(error)
    // next(error); 
  }
};