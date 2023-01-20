//Back-End : API - RESTfull
import Fastify from "fastify";
import cors from "@fastify/cors";
import { appRoutes } from "./routes";

export const app = Fastify(); // Criaçao da Aplicação para utilização de Rotas
app.register(cors); // Permissão para que o FrontEnd possa se comunicar com os dados do BD
app.register(appRoutes) //Utilizando um método do Fastify, para subdivisão do código
 

// Função para manter o servidor na porta 3333
app.listen({
  port:3333,
}).then(()=>{
  console.log("HTTP Server running!")
})
