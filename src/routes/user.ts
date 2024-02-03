import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function UserRoutes(app: FastifyInstance) {
	app.post("/register", async (req, res) => {
		const createDietRegisterReqSchema = z.object({
			username: z.string(),
			email: z.string(),
		});

		const { email, username } = createDietRegisterReqSchema.parse(req.body);

		const userByEmail = await knex("users").where({ email }).first();

		if (userByEmail) {
			return res.status(400).send({ message: "User already exists" });
		}

		await knex("users").insert({
			id: randomUUID(),
			username,
			email,
		});
	});

	app.post("/login", async (req, res) => {
		const createDietRegisterReqSchema = z.object({
			username: z.string(),
			email: z.string(),
		});

		const { email, username } = createDietRegisterReqSchema.parse(req.body);
		let sessionId = randomUUID();
		res.cookie("sessionId", sessionId, {
			path: "/",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		const user = await knex("users")
			.where({
				username,
				email,
			})
			.update({
				sessionId,
			});

		if (!user) {
			return res.status(400).send({ message: "User not exists" });
		}
	});
}
