import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  profitMargin: decimal("profit_margin").default("20.0"), // Percentage
  createdAt: timestamp("created_at").defaultNow(),
});

export const calculations = pgTable("calculations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull(), // 'slab' | 'wall'
  area: decimal("area").notNull(), // m2 or linear meters
  
  // Specific inputs
  // Slab: beamDepth (P-15, P-20, P-25), polystyreneDensity (10-25)
  // Wall: usage (load-bearing, partition, etc)
  specs: jsonb("specs").notNull(),
  
  // Calculated results
  // materials: { beams: number, vaults: number, ... }
  // comparison: { concreteSaved: number, weightReduced: number, timeSaved: number, energySaved: number }
  results: jsonb("results").notNull(),
});

// === RELATIONS ===
export const projectsRelations = relations(projects, ({ many }) => ({
  calculations: many(calculations),
}));

export const calculationsRelations = relations(calculations, ({ one }) => ({
  project: one(projects, {
    fields: [calculations.projectId],
    references: [projects.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertCalculationSchema = createInsertSchema(calculations).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Calculation = typeof calculations.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;

// Inputs
export type CreateProjectRequest = InsertProject;
export type AddCalculationRequest = InsertCalculation;

// Specs Types for strict typing in frontend/backend logic
export const SlabSpecsSchema = z.object({
  beamDepth: z.enum(["P-15", "P-20", "P-25"]),
  polystyreneDensity: z.number().min(10).max(25),
});

export const WallSpecsSchema = z.object({
  wallType: z.enum(["load-bearing", "partition", "ceiling", "retaining"]),
});

export type SlabSpecs = z.infer<typeof SlabSpecsSchema>;
export type WallSpecs = z.infer<typeof WallSpecsSchema>;
