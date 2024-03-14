import { z } from "zod";
import { knex } from "../database";
import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const meals = await knex("meals").select();

    return { meals };
  });

  app.get("/:id", async (req) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getMealsParamsSchema.parse(req.params);

    const meals = await knex("meals").select().where("id", id);

    return { meals };
  });

  app.post("/", async (req, res) => {
    const createMealBodySchema = z.object({
      user_id: z.string(),
      description: z.string(),
      type: z.enum(["breakfast", "lunch", "dinner", "snack", "dessert"]),
      is_in_diet: z.boolean(),
    });

    const { user_id, description, type, is_in_diet } =
      createMealBodySchema.parse(req.body);

    await knex("meals").insert({
      id: randomUUID(),
      user_id,
      description,
      type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_in_diet,
    });

    if (is_in_diet) {
      const getUserStreakInfoSchema = z.object({
        current_streak: z.number(),
        best_streak: z.number(),
      });

      const userStreaks = await knex("users")
        .select("current_streak", "best_streak")
        .where("id", user_id);

      const { current_streak, best_streak } = getUserStreakInfoSchema.parse(
        userStreaks[0]
      );

      await knex("users").where("id", user_id).increment("current_streak", 1);
      current_streak + 1 > best_streak &&
        (await knex("users").where("id", user_id).increment("best_streak", 1));
    } else {
      await knex("users").where("id", user_id).update("current_streak", 0);
    }

    return res.status(201).send();
  });

  app.put("/:id", async (req, res) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getMealsParamsSchema.parse(req.params);

    const updateMealBodySchema = z.object({
      user_id: z.string().uuid(),
      description: z.string(),
      type: z.enum(["breakfast", "lunch", "dinner", "snack", "dessert"]),
      is_in_diet: z.boolean(),
    });

    const { user_id, description, type, is_in_diet } =
      updateMealBodySchema.parse(req.body);

    const updateResponse = await knex("meals")
      .where({
        id,
        user_id,
      })
      .update({
        description,
        type,
        updated_at: new Date().toISOString(),
        is_in_diet,
      });

    if (updateResponse === 0) {
      res.status(403).send();
    }

    return res.status(204).send();
  });

  app.delete("/:id", async (req, res) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getMealsParamsSchema.parse(req.params);

    const deleteMealBodySchema = z.object({
      user_id: z.string().uuid(),
    });

    const { user_id } = deleteMealBodySchema.parse(req.body);

    const deleteResponse = await knex("meals")
      .where({
        id,
        user_id,
      })
      .del();

    if (deleteResponse === 0) {
      return res.status(403).send();
    }

    return res.status(204).send();
  });
}
