// FastifyRequestContext
import "fastify";

declare module "fastify" {
	export interface FastifyRequest {
		user?: {
			id: string;
			sessionId?: string;
			username: string;
			email: string;
			createdAt: string;
		};
	}
}
