import "knex";

declare module "knex/types/tables" {
	export interface Tables {
		dietRegisters: {
			id: string;
			name: string;
			description: string;
			isInDiet: boolean;
			registerTime: string;
			createdAt: string;
			userId?: string;
		};
		users: {
			id: string;
			sessionId: string;
			username: string;
			email: string;
			createdAt: string;
		};
	}
}
