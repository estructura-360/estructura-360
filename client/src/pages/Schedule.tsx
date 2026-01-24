import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useProjects } from "@/hooks/use-projects";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, GripVertical, Calendar, Loader2, Trash2, WifiOff, CloudOff, Clock, Flag, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useOfflineStatus } from "@/hooks/use-offline";
import { addToSyncQueue, initOfflineDB, generateOfflineId } from "@/lib/offlineStorage";

interface Task {
  id: number | string;
  projectId: number;
  title: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  priority?: string;
  status: string;
  dependencies: number[] | null;
  isOffline?: boolean;
}

// Offline tasks storage in IndexedDB
async function saveOfflineTask(task: Omit<Task, 'id' | 'isOffline'>): Promise<Task> {
  const db = await initOfflineDB();
  const offlineTask: Task = {
    ...task,
    id: generateOfflineId(),
    isOffline: true
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineTasks'], 'readwrite');
    const store = transaction.objectStore('offlineTasks');
    const request = store.add({ ...offlineTask, synced: false });
    
    request.onsuccess = () => resolve(offlineTask);
    request.onerror = () => reject(request.error);
  });
}

async function getOfflineTasks(projectId: number): Promise<Task[]> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineTasks'], 'readonly');
    const store = transaction.objectStore('offlineTasks');
    const index = store.index('projectId');
    const request = index.getAll(projectId);
    
    request.onsuccess = () => {
      const tasks = request.result.filter((t: any) => !t.synced).map((t: any) => ({ ...t, isOffline: true }));
      resolve(tasks);
    };
    request.onerror = () => reject(request.error);
  });
}

export default function SchedulePage() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDays, setNewTaskDays] = useState(3);
  const [newTaskStartDate, setNewTaskStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTaskStartTime, setNewTaskStartTime] = useState("08:00");
  const [newTaskEndTime, setNewTaskEndTime] = useState("17:00");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("medium");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [offlineTasks, setOfflineTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const { isOffline } = useOfflineStatus();

  const { data: serverTasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['/api/projects', selectedProjectId, 'tasks'],
    enabled: !!selectedProjectId && !isOffline,
  });

  // Load offline tasks when project changes
  useEffect(() => {
    async function loadOfflineTasks() {
      if (selectedProjectId) {
        try {
          const offline = await getOfflineTasks(parseInt(selectedProjectId));
          setOfflineTasks(offline);
        } catch (e) {
          console.error('Error loading offline tasks:', e);
        }
      }
    }
    loadOfflineTasks();
  }, [selectedProjectId]);

  // Combine server and offline tasks
  const tasks = [...(serverTasks || []), ...offlineTasks].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const createTask = useMutation({
    mutationFn: async (data: { title: string; days: number; startDate: string; startTime: string; endTime: string; priority: string }) => {
      const startDate = new Date(data.startDate);
      const endDate = addDays(startDate, data.days);
      
      const taskData = {
        projectId: parseInt(selectedProjectId),
        title: data.title,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startTime: data.startTime,
        endTime: data.endTime,
        priority: data.priority,
        status: 'pending',
        dependencies: null
      };

      if (isOffline) {
        const offlineTask = await saveOfflineTask(taskData);
        
        await addToSyncQueue({
          type: 'task',
          action: 'create',
          endpoint: `/api/projects/${selectedProjectId}/tasks`,
          data: taskData
        });
        
        return offlineTask;
      } else {
        return apiRequest('POST', `/api/projects/${selectedProjectId}/tasks`, taskData);
      }
    },
    onSuccess: async () => {
      if (isOffline) {
        const offline = await getOfflineTasks(parseInt(selectedProjectId));
        setOfflineTasks(offline);
        toast({ 
          title: "Guardado localmente", 
          description: "Se sincronizará automáticamente cuando haya conexión." 
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProjectId, 'tasks'] });
        toast({ title: "Tarea creada", description: "La actividad se agregó al cronograma." });
      }
      setNewTaskTitle("");
      setNewTaskDays(3);
      setNewTaskStartDate(format(new Date(), 'yyyy-MM-dd'));
      setNewTaskStartTime("08:00");
      setNewTaskEndTime("17:00");
      setNewTaskPriority("medium");
      setDialogOpen(false);
    },
    onError: async () => {
      // If online request fails, save offline
      const startDate = new Date(newTaskStartDate);
      const endDate = addDays(startDate, newTaskDays);
      
      const taskData = {
        projectId: parseInt(selectedProjectId),
        title: newTaskTitle,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startTime: newTaskStartTime,
        endTime: newTaskEndTime,
        priority: newTaskPriority,
        status: 'pending',
        dependencies: null
      };
      
      await saveOfflineTask(taskData);
      await addToSyncQueue({
        type: 'task',
        action: 'create',
        endpoint: `/api/projects/${selectedProjectId}/tasks`,
        data: taskData
      });
      
      const offline = await getOfflineTasks(parseInt(selectedProjectId));
      setOfflineTasks(offline);
      
      setNewTaskTitle("");
      setNewTaskDays(3);
      setNewTaskStartDate(format(new Date(), 'yyyy-MM-dd'));
      setNewTaskStartTime("08:00");
      setNewTaskEndTime("17:00");
      setNewTaskPriority("medium");
      setDialogOpen(false);
      
      toast({ 
        title: "Guardado localmente", 
        description: "No se pudo conectar. Se sincronizará cuando haya conexión." 
      });
    }
  });

  const deleteTask = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/projects/${selectedProjectId}/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProjectId, 'tasks'] });
      toast({ title: "Tarea eliminada" });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, startDate, endDate }: { id: number; startDate: Date; endDate: Date }) => {
      return apiRequest('PATCH', `/api/projects/${selectedProjectId}/tasks/${id}`, { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProjectId, 'tasks'] });
    },
  });

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    if (!tasks?.length) return { start: new Date(), end: addDays(new Date(), 30), totalDays: 30 };
    
    const dates = tasks.flatMap(t => [new Date(t.startDate), new Date(t.endDate)]);
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    const totalDays = Math.max(differenceInDays(end, start) + 1, 14);
    
    return { start, end, totalDays };
  }, [tasks]);

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const left = (differenceInDays(taskStart, timelineBounds.start) / timelineBounds.totalDays) * 100;
    const width = ((differenceInDays(taskEnd, taskStart) + 1) / timelineBounds.totalDays) * 100;
    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` };
  };

  const getStatusColor = (status: string, isOffline?: boolean) => {
    if (isOffline) return 'bg-amber-500';
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-accent';
      default: return 'bg-primary';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary">Cronograma de Obra</h1>
          <p className="text-muted-foreground mt-2">
            Diagrama de Gantt dinámico para gestionar tus entregas.
            {isOffline && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-600">
                <WifiOff className="h-4 w-4" />
                Modo sin conexión
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isLoadingProjects}>
            <SelectTrigger className="w-full sm:w-[250px] bg-white shadow-sm border-primary/20">
              <SelectValue placeholder={isLoadingProjects ? "Cargando..." : "Seleccionar Proyecto"} />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedProjectId && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Tarea
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    Agregar Actividad
                    {isOffline && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-normal">
                        Sin conexión
                      </span>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label className="text-sm font-medium">Nombre de la Actividad</Label>
                    <Input
                      placeholder="Ej: Entrega de cemento"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="mt-1"
                      data-testid="input-task-title"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Fecha de Inicio
                      </Label>
                      <Input
                        type="date"
                        value={newTaskStartDate}
                        onChange={(e) => setNewTaskStartDate(e.target.value)}
                        className="mt-1"
                        data-testid="input-task-date"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duración</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          value={newTaskDays}
                          onChange={(e) => setNewTaskDays(parseInt(e.target.value) || 1)}
                          className="w-20"
                          data-testid="input-task-days"
                        />
                        <span className="text-sm text-muted-foreground">días</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Hora de Inicio
                      </Label>
                      <Input
                        type="time"
                        value={newTaskStartTime}
                        onChange={(e) => setNewTaskStartTime(e.target.value)}
                        className="mt-1"
                        data-testid="input-task-start-time"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Hora de Fin
                      </Label>
                      <Input
                        type="time"
                        value={newTaskEndTime}
                        onChange={(e) => setNewTaskEndTime(e.target.value)}
                        className="mt-1"
                        data-testid="input-task-end-time"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Flag className="h-3 w-3" />
                      Prioridad
                    </Label>
                    <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                      <SelectTrigger className="mt-1" data-testid="select-task-priority">
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">
                          <span className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Alta - Urgente
                          </span>
                        </SelectItem>
                        <SelectItem value="medium">
                          <span className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Media - Normal
                          </span>
                        </SelectItem>
                        <SelectItem value="low">
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Baja - Puede esperar
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => createTask.mutate({ 
                      title: newTaskTitle, 
                      days: newTaskDays,
                      startDate: newTaskStartDate,
                      startTime: newTaskStartTime,
                      endTime: newTaskEndTime,
                      priority: newTaskPriority
                    })}
                    disabled={!newTaskTitle || createTask.isPending}
                    data-testid="button-create-task"
                  >
                    {createTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isOffline ? "Guardar Localmente" : "Agregar al Cronograma"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {!selectedProjectId ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-muted/10 rounded-3xl border-2 border-dashed border-muted-foreground/20">
          <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg text-muted-foreground font-medium">Selecciona un proyecto para ver el cronograma</p>
        </div>
      ) : isLoadingTasks && !isOffline ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Diagrama de Gantt
            </CardTitle>
            <CardDescription>
              Arrastra las tareas para reajustar fechas automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Timeline Header */}
            <div className="flex border-b pb-2 mb-4">
              <div className="w-64 shrink-0 font-medium text-sm text-muted-foreground">Actividad</div>
              <div className="flex-1 flex justify-between text-xs text-muted-foreground">
                {Array.from({ length: Math.min(timelineBounds.totalDays, 14) }).map((_, i) => (
                  <span key={i} className="text-center">
                    {format(addDays(timelineBounds.start, i * Math.ceil(timelineBounds.totalDays / 14)), 'd MMM', { locale: es })}
                  </span>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {tasks?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No hay tareas programadas. Agrega la primera actividad.
                </div>
              ) : (
                tasks?.map((task) => {
                  const pos = getTaskPosition(task);
                  const getPriorityIcon = (priority?: string) => {
                    switch (priority) {
                      case 'high': return <AlertTriangle className="h-3 w-3 text-red-500" />;
                      case 'low': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
                      default: return <AlertCircle className="h-3 w-3 text-amber-500" />;
                    }
                  };
                  return (
                    <div key={task.id} className="flex items-center group">
                      <div className="w-64 shrink-0 flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                        {getPriorityIcon(task.priority)}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate flex items-center gap-1">
                            {task.title}
                            {task.isOffline && (
                              <CloudOff className="h-3 w-3 text-amber-500" />
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-2">
                            {task.startTime && task.endTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.startTime} - {task.endTime}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 relative h-8">
                        <div
                          className={`absolute h-full rounded-md ${getStatusColor(task.status, task.isOffline)} shadow-sm flex items-center px-3 text-white text-xs font-medium cursor-move transition-all`}
                          style={{ left: pos.left, width: pos.width, minWidth: '60px' }}
                        >
                          {differenceInDays(new Date(task.endDate), new Date(task.startDate)) + 1}d
                        </div>
                      </div>
                      {!task.isOffline && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive/50 hover:text-destructive"
                          onClick={() => deleteTask.mutate(task.id as number)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
