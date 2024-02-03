import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database";

export async function checkSessionIdExists(
	req: FastifyRequest,
	res: FastifyReply
) {
	const sessionId = req.cookies.sessionId;

	const user = await knex("users")
		.where({
			sessionId,
		})
		.first();

	if (!user) {
		return res.status(401).send({
			error: "Unauthorizied",
		});
	}

	req.user = user;
}
