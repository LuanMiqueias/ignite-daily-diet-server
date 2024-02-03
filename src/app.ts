import fastify from "fastify";
import cookie from "@fastify/cookie";
import { dietRegisterRoutes } from "./routes/dietMeals";
import { UserRoutes } from "./routes/user";

export const app = fastify();

app.register(cookie);

app.register(dietRegisterRoutes, {
	prefix: "diet",
});

app.register(UserRoutes, {
	prefix: "users",
});
