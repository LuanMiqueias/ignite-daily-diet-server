import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("dietRegisters", (table) => {
		table.uuid("id").primary();
		table.uuid("userId").references("users.id").notNullable();
		table.text("name").notNullable();
		table.text("description").notNullable();
		table.boolean("isInDiet").notNullable();
		table.text("registerTime").notNullable();
		table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("dietRegisters");
}
