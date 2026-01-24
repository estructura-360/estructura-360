import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  profitMargin: decimal("profit_margin").default("20.0"),
  laborCostPerM2: decimal("labor_cost_per_m2").default("0.0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calculations = pgTable("calculations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull(),
  area: decimal("area").notNull(),
  specs: jsonb("specs").notNull(),
  results: jsonb("results").notNull(),
});

export const scheduleTasks = pgTable("schedule_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  priority: text("priority").default("medium"),
  dependencies: integer("dependencies").array(),
  status: text("status").default("pending"),
});

export const constructionLogs = pgTable("construction_logs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === RELATIONS ===
export const projectsRelations = relations(projects, ({ many }) => ({
  calculations: many(calculations),
  tasks: many(scheduleTasks),
  logs: many(constructionLogs),
}));

export const calculationsRelations = relations(calculations, ({ one }) => ({
  project: one(projects, {
    fields: [calculations.projectId],
    references: [projects.id],
  }),
}));

export const scheduleTasksRelations = relations(scheduleTasks, ({ one }) => ({
  project: one(projects, {
    fields: [scheduleTasks.projectId],
    references: [projects.id],
  }),
}));

export const constructionLogsRelations = relations(constructionLogs, ({ one }) => ({
  project: one(projects, {
    fields: [constructionLogs.projectId],
    references: [projects.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertCalculationSchema = createInsertSchema(calculations).omit({ id: true });
export const insertTaskSchema = createInsertSchema(scheduleTasks).omit({ id: true });
export const insertLogSchema = createInsertSchema(constructionLogs).omit({ id: true, timestamp: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Calculation = typeof calculations.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type ScheduleTask = typeof scheduleTasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type ConstructionLog = typeof constructionLogs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

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
