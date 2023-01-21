import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import { z } from "zod";
import dayjs from "dayjs";

export async function appRoutes(app: FastifyInstance) {

  // Criação de um hábito
  app.post('/habits', async (request) => {
    /*
      const habits = await prisma.habit.findMany(); // Fazendo um Select no BD, utilizando o Prisma
      return habits; // retornando objetos(tabelas do BD) na tela após o select
    */
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6))
    });

    const { title, weekDays } = createHabitBody.parse(request.body);
    const today = dayjs().startOf('day').toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map(weekDay => {
            return {
              week_day: weekDay,
            }
          })
        }

      }
    })

  });

  app.get('/day', async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date()
    })

    const { date } = getDayParams.parse(request.query);

    const parsedDate = dayjs(date).startOf('day')
    const weekDay = parsedDate.get('day');

    // todos hábitos possiveis daquele dia
    // hábitos ja completados

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date, //Menor ou igual, a data atual
        },
        weekDays: {
          some: {
            week_day: weekDay
          }
        }
      }
    })

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true
      }

    })

    const completedHabits = day?.dayHabits.map(dayHabit => {
      return dayHabit.habit_id
    })
    return {
      possibleHabits, completedHabits
    }
  })

  // Completar / nao completar um Hábito
  app.patch('/habits/:id/toggle', async (request) => {
    // : => route param => paramêtro de identificação

    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = toggleHabitParams.parse(request.params);
    const today = dayjs().startOf('day').toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      }
    })

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        }
      })
    }

    // Fazendo busca no banco de dados para ver se o Hábito ja foi concluido naquele dia
    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id
        }
      }
    })

    // Verificação da busca no banco de dados
    if (dayHabit) {
      //remover a marcaçao de completo
      await prisma.dayHabit.delete({
        where :{
          id: dayHabit.id
        }
      })
    } else {
      //Completar o Hábito
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id
        }
      })
    }
  })

  // Retornando informações dentro de uma Lista (Dia, Habitos Disponiveis, Habitos Completos)
  app.get('/summary', async () =>{
    // Query mais complexa, mais condições, relacionamentos => SQL na mão (RAW)
    // Prisma ORM: RAW SQL => SQLite

    const summary = await prisma.$queryRaw`
      SELECT /* Query Principal para selecionar todos os dias */ 
        D.id, 
        D.date,
        ( 
          SELECT /* Sub Query que seleciona todos os registros da tabela dos Habitos que foram completados, onde o dia em ambos sejam iguais */
            cast(count(*) as float) /* Convertendo para float */
          FROM day_Habits DH
          WHERE DH.day_id = D.id
        ) as completed, /* Nome do retorno da Query */
        (
          SELECT /* */
            cast(count(*) as float)
          FROM habit_week_days HWD
          JOIN habits H
            ON H.id = HWD.habit_id
          WHERE
            HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int) /* Convertendo formato da data atual, para formato Epoch Timestamp */
            AND H.created_at <= D.date
        ) as amount
      FROM days D
    `
    return summary;
  })
}
