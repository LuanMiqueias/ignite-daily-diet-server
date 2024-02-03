import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { z } from "zod";
import { randomUUID } from "crypto";
import { knex } from "../database";

export async function dietRegisterRoutes(app: FastifyInstance) {
	app.post(
		"/register",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, res) => {
			const createDietRegisterBodySchema = z.object({
				name: z.string(),
				description: z.string(),
				isInDiet: z.boolean(),
				registerTime: z.string(),
			});
			const { name, description, isInDiet, registerTime } =
				createDietRegisterBodySchema.parse(req.body);

			await knex("dietRegisters").insert({
				id: randomUUID(),
				name: name,
				description: description,
				isInDiet: isInDiet,
				registerTime: registerTime,
				userId: req.user?.id,
			});
			return res.status(201).send();
		}
	);

	app.patch(
		"/register/:id",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, res) => {
			const createDietRegisterBodySchema = z.object({
				name: z.string().optional(),
				description: z.string().optional(),
				isInDiet: z.boolean().optional(),
				registerTime: z.string().optional(),
			});
			const createDietRegisterParamsSchema = z.object({
				id: z.string().uuid(),
			});
			let { id } = createDietRegisterParamsSchema.parse(req.params);
			const dataBody = createDietRegisterBodySchema.parse(req.body);

			if (!dataBody) return res.status(400).send();

			let sessionId = req.cookies.sessionId;

			if (!sessionId) {
				sessionId = randomUUID();

				res.cookie("sessionId", sessionId, {
					path: "/",
					maxAge: 60 * 60 * 24 * 60, // 60 days
				});
			}

			await knex("dietRegisters")
				.where({
					id: id,
					userId: req.user?.id,
				})
				.update({
					...dataBody,
				});
			return res.status(200).send();
		}
	);

	app.get(
		"/",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, res) => {
			const list = await knex("dietRegisters").where({
				userId: req.user?.id,
			});
			return list;
		}
	);

	app.get(
		"/:id",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, res) => {
			const createDietRegisterParamsSchema = z.object({
				id: z.string().uuid(),
			});
			let { id } = createDietRegisterParamsSchema.parse(req.params);

			const list = await knex("dietRegisters").where({
				userId: req.user?.id,
				id: id,
			});
			return list;
		}
	);

	app.post(
		"/:id",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, res) => {
			const createDietRegisterParamsSchema = z.object({
				id: z.string().uuid(),
			});
			let { id } = createDietRegisterParamsSchema.parse(req.params);

			const list = await knex("dietRegisters")
				.where({
					userId: req.user?.id,
					id: id,
				})
				.delete();
			return list;
		}
	);

	app.get(
		"/stats/:id",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, res) => {
			const createDietRegisterParamsSchema = z.object({
				id: z.string().uuid(),
			});
			let { id } = createDietRegisterParamsSchema.parse(req.params);

			const list = await knex("dietRegisters")
				.where({
					userId: req.user?.id,
					id: id,
				})
				.orderBy("createdAt", "desc");

			const totalInDiet = await knex("dietRegisters")
				.where({
					isInDiet: true,
				})
				.count();

			const totalOutDiet = await knex("dietRegisters")
				.where({
					isInDiet: false,
				})
				.count();

			const { bestOnDietSequence } = list.reduce(
				(acc, meal) => {
					if (meal.isInDiet) {
						acc.currentSequence += 1;
					} else {
						acc.currentSequence = 0;
					}

					if (acc.currentSequence > acc.bestOnDietSequence) {
						acc.bestOnDietSequence = acc.currentSequence;
					}

					return acc;
				},
				{ bestOnDietSequence: 0, currentSequence: 0 }
			);

			return {
				total: list.length,
				totalInDiet: totalInDiet,
				totalOutDiet: totalOutDiet,
				bestOnDietSequence: bestOnDietSequence,
			};
		}
	);
}
