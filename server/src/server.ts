//Back-End : API - RESTfull
import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";

const app = Fastify(); // Criaçao da Aplicação para utilização de Rotas
const prisma = new PrismaClient(); // FrameWork para utilização do BD
app.register(cors); // Permissão para que o FrontEnd possa se comunicar com os dados do BD

// Função da Página principal da aplicação
app.get('/', async ()=>{
  const habits = await prisma.habit.findMany(); // Fazendo um Select no BD, utilizando o Prisma
  return habits; // retornando objetos(tabelas do BD) na tela após o select
});

// Função para manter o servidor na porta 3333
app.listen({
  port:3333,
}).then(()=>{
  console.log("HTTP Server running!")
})
