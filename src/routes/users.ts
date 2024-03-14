import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const users = await knex("users").select();

    return { users };
  });

  app.get("/:id/meals", async (req) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getUserParamsSchema.parse(req.params);

    const userMeals = await knex("meals").where("user_id", id).select();

    return { userMeals };
  });

  app.get("/:id/meals/count", async (req) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getUserParamsSchema.parse(req.params);

    const totalMealsCount = await knex("meals")
      .where("user_id", id)
      .count("id", { as: "meals_qty" });

    return totalMealsCount;
  });

  app.get("/:id/meals/in-diet", async (req) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getUserParamsSchema.parse(req.params);

    const totalMealsCount = await knex("meals")
      .where({
        user_id: id,
        is_in_diet: true,
      })
      .count("is_in_diet", { as: "meals_in_diet" });

    return totalMealsCount;
  });

  app.get("/:id/meals/not-in-diet", async (req) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getUserParamsSchema.parse(req.params);

    const totalMealsCount = await knex("meals")
      .where({
        user_id: id,
        is_in_diet: false,
      })
      .count("is_in_diet", { as: "meals_not_in_diet" });

    return totalMealsCount;
  });

  app.get("/:id/best-streak", async (req) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getUserParamsSchema.parse(req.params);

    const bestStreak = await knex("users")
      .select("best_streak")
      .where("id", id);

    return bestStreak;
  });

  app.post("/", async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    });

    const { name } = createUserBodySchema.parse(req.body);

    await knex("users").insert({
      id: randomUUID(),
      name,
    });

    return res.status(201).send();
  });
}
