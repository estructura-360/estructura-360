import {
  projects,
  calculations,
  scheduleTasks,
  constructionLogs,
  type Project,
  type InsertProject,
  type Calculation,
  type InsertCalculation,
  type ScheduleTask,
  type InsertTask,
  type ConstructionLog,
  type InsertLog,
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

  // Schedule
  getTasksByProject(projectId: number): Promise<ScheduleTask[]>;
  createTask(task: InsertTask): Promise<ScheduleTask>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<ScheduleTask>;
  deleteTask(id: number): Promise<void>;

  // Logs
  getLogsByProject(projectId: number): Promise<ConstructionLog[]>;
  createLog(log: InsertLog): Promise<ConstructionLog>;
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

  async getCalculationsByProject(projectId: number): Promise<Calculation[]> {
    return await db
      .select()
      .from(calculations)
      .where(eq(calculations.projectId, projectId));
  }

  async deleteCalculation(id: number): Promise<void> {
    await db.delete(calculations).where(eq(calculations.id, id));
  }

  // Schedule
  async getTasksByProject(projectId: number): Promise<ScheduleTask[]> {
    return await db.select().from(scheduleTasks).where(eq(scheduleTasks.projectId, projectId));
  }

  async createTask(task: InsertTask): Promise<ScheduleTask> {
    const taskWithDates = {
      ...task,
      startDate: typeof task.startDate === 'string' ? new Date(task.startDate) : task.startDate,
      endDate: typeof task.endDate === 'string' ? new Date(task.endDate) : task.endDate,
    };
    const [newTask] = await db.insert(scheduleTasks).values(taskWithDates).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<ScheduleTask> {
    const taskWithDates = {
      ...task,
      ...(task.startDate && { startDate: typeof task.startDate === 'string' ? new Date(task.startDate) : task.startDate }),
      ...(task.endDate && { endDate: typeof task.endDate === 'string' ? new Date(task.endDate) : task.endDate }),
    };
    const [updated] = await db.update(scheduleTasks).set(taskWithDates).where(eq(scheduleTasks.id, id)).returning();
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(scheduleTasks).where(eq(scheduleTasks.id, id));
  }

  // Logs
  async getLogsByProject(projectId: number): Promise<ConstructionLog[]> {
    return await db.select().from(constructionLogs).where(eq(constructionLogs.projectId, projectId));
  }

  async createLog(log: InsertLog): Promise<ConstructionLog> {
    const [newLog] = await db.insert(constructionLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
