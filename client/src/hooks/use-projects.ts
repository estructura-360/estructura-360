import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateProjectRequest, type Project, type Calculation, type AddCalculationRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useProjects() {
  return useQuery({
    queryKey: [api.projects.list.path],
    queryFn: async () => {
      const res = await fetch(api.projects.list.path);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return api.projects.list.responses[200].parse(await res.json());
    },
  });
}

export function useProject(id: number | null) {
  return useQuery({
    queryKey: [api.projects.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.projects.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch project details");
      return api.projects.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateProjectRequest) => {
      const res = await fetch(api.projects.create.path, {
        method: api.projects.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return api.projects.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
      toast({
        title: "Proyecto creado",
        description: `${data.clientName} ha sido guardado exitosamente.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<CreateProjectRequest>) => {
      const url = buildUrl(api.projects.update.path, { id });
      const res = await fetch(url, {
        method: api.projects.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return api.projects.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, data.id] });
      toast({
        title: "Proyecto actualizado",
        description: "Los cambios han sido guardados.",
      });
    },
  });
}

export function useAddCalculation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AddCalculationRequest) => {
      const res = await fetch(api.calculations.create.path, {
        method: api.calculations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add calculation");
      return api.calculations.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, data.projectId] });
      toast({
        title: "Cálculo agregado",
        description: "Se ha añadido el elemento al proyecto.",
      });
    },
    onError: () => {
      toast({
        title: "Error de cálculo",
        description: "Verifique los datos ingresados.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCalculation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: number; projectId: number }) => {
      const url = buildUrl(api.calculations.delete.path, { id });
      const res = await fetch(url, { method: api.calculations.delete.method });
      if (!res.ok) throw new Error("Failed to delete calculation");
      return projectId; // Return projectId to invalidate correct query
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, projectId] });
      toast({
        title: "Eliminado",
        description: "El cálculo ha sido removido del proyecto.",
      });
    },
  });
}
