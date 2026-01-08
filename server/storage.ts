import {
  projects,
  calculations,
  type Project,
  type InsertProject,
  type Calculation,
  type InsertCalculation,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;

  // Calculations
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  getCalculationsByProject(projectId: number): Promise<Calculation[]>;
  deleteCalculation(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Projects
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.createdAt);
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  // Calculations
  async createCalculation(calculation: InsertCalculation): Promise<Calculation> {
    const [newCalc] = await db.insert(calculations).values(calculation).returning();
    return newCalc;
  }

  async getCalculationsByProject(projectId: number): Promise<Calculation[]>;
  async getCalculationsByProject(projectId: number): Promise<Calculation[]> {
    return await db
      .select()
      .from(calculations)
      .where(eq(calculations.projectId, projectId));
  }

  async deleteCalculation(id: number): Promise<void> {
    await db.delete(calculations).where(eq(calculations.id, id));
  }
}

export const storage = new DatabaseStorage();
