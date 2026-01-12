import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { SlabSpecsSchema, WallSpecsSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Projects
  app.get(api.projects.list.path, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.post(api.projects.create.path, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.projects.get.path, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const calculations = await storage.getCalculationsByProject(project.id);
    res.json({ ...project, calculations });
  });

  app.put(api.projects.update.path, async (req, res) => {
    try {
      const input = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(Number(req.params.id), input);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      res.json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Calculations
  app.post(api.calculations.create.path, async (req, res) => {
    try {
      const input = api.calculations.create.input.parse(req.body);
      
      // PERFROM CALCULATION LOGIC HERE
      const area = Number(input.area);
      let results: any = {};
      
      if (input.type === 'slab') {
        const specs = input.specs as any; 
        const beamDepth = specs.beamDepth || 'P-15';
        const density = specs.polystyreneDensity || 15;
        const climate = specs.climate || 'Caluroso';

        // Constants
        const beamsPerM2 = 1.2; 
        const vaultsPerM2 = 8.5; 
        const meshPerM2 = 1.1; 

        // Comparison Baselines (Traditional Slab)
        const tradConcrete = 0.12 * area; 
        const tradWeight = 300 * area; 
        const tradTime = 14; 

        // Vigueta & Bovedilla stats
        const sysConcrete = 0.05 * area; 
        const sysWeight = 180 * area; 
        const sysTime = 7; 
        
        const energyScore = density * 4; 
        const seismicSaving = tradWeight - sysWeight;

        // Thermal simulation (arbitrary but illustrative logic)
        // Polystyrene vs concrete-sand vault
        const thermalConfort = climate === 'Caluroso' ? 85 + (density/5) : 80 + (density/5);

        results = {
          materials: {
            beams: Math.ceil(area * beamsPerM2),
            vaults: Math.ceil(area * vaultsPerM2),
            mesh: Math.ceil(area * meshPerM2),
            concrete: sysConcrete.toFixed(2)
          },
          comparison: {
            concreteSaved: (tradConcrete - sysConcrete).toFixed(2),
            weightReduced: seismicSaving.toFixed(0),
            timeSaved: tradTime - sysTime,
            energyEfficiency: energyScore,
            thermalConfort: thermalConfort.toFixed(0)
          }
        };

      } else if (input.type === 'wall') {
        const specs = input.specs as any;
        // Panel logic
        const panelsPerM2 = 1 / (1.22 * 2.44); // ~0.33
        
        results = {
          materials: {
            panels: Math.ceil(area * panelsPerM2),
            mortar: (area * 0.02).toFixed(2) // 2cm thickness approx
          },
          comparison: {
            weightReduced: (area * 50).toFixed(0), // vs block
            timeSaved: 5,
            energyEfficiency: 85
          }
        };
      }

      // Merge calculated results into the input before saving
      const finalCalculation = {
        ...input,
        results: results
      };

      const calculation = await storage.createCalculation(finalCalculation);
      res.status(201).json(calculation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.calculations.delete.path, async (req, res) => {
    await storage.deleteCalculation(Number(req.params.id));
    res.status(204).send();
  });

  // Schedule Tasks
  app.get('/api/projects/:projectId/tasks', async (req, res) => {
    const tasks = await storage.getTasksByProject(Number(req.params.projectId));
    res.json(tasks);
  });

  app.post('/api/projects/:projectId/tasks', async (req, res) => {
    const task = await storage.createTask(req.body);
    res.status(201).json(task);
  });

  app.patch('/api/projects/:projectId/tasks/:id', async (req, res) => {
    const task = await storage.updateTask(Number(req.params.id), req.body);
    res.json(task);
  });

  app.delete('/api/projects/:projectId/tasks/:id', async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  // Construction Logs
  app.get('/api/projects/:projectId/logs', async (req, res) => {
    const logs = await storage.getLogsByProject(Number(req.params.projectId));
    res.json(logs);
  });

  app.post('/api/projects/:projectId/logs', async (req, res) => {
    const log = await storage.createLog(req.body);
    res.status(201).json(log);
  });

  // Seed Data
  const projects = await storage.getProjects();
  if (projects.length === 0) {
    const project = await storage.createProject({
      clientName: "Cliente Ejemplo (Constructora A)",
      profitMargin: "25.0",
    });
    
    // Add slab calculation
    await storage.createCalculation({
      projectId: project.id,
      type: "slab",
      area: "150",
      specs: { beamDepth: "P-20", polystyreneDensity: 15 },
      results: {
        materials: { beams: 180, vaults: 1275, mesh: 165, concrete: "7.50" },
        comparison: { concreteSaved: "10.50", weightReduced: "18000", timeSaved: 7, energyEfficiency: 60 }
      }
    });

    // Add wall calculation
    await storage.createCalculation({
      projectId: project.id,
      type: "wall",
      area: "80",
      specs: { wallType: "load-bearing" },
      results: {
        materials: { panels: 27, mortar: "1.60" },
        comparison: { weightReduced: "4000", timeSaved: 5, energyEfficiency: 85 }
      }
    });
  }

  return httpServer;
}
