import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useProjects, useCreateProject, useAddCalculation } from "@/hooks/use-projects";
import { SlabSpecsSchema, WallSpecsSchema } from "@shared/schema";
import { Plus, Save, ArrowRight, Loader2, Layers, BrickWall } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Form Schemas
const slabFormSchema = z.object({
  area: z.coerce.number().min(1, "El área debe ser mayor a 0"),
  beamDepth: z.enum(["P-15", "P-20", "P-25"]),
  density: z.coerce.number().min(10).max(25),
});

const wallFormSchema = z.object({
  length: z.coerce.number().min(1, "La longitud debe ser mayor a 0"),
  height: z.coerce.number().min(1, "La altura debe ser mayor a 0"),
  type: z.enum(["load-bearing", "partition", "ceiling", "retaining"]),
});

export default function CalculatorPage() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const createProject = useCreateProject();
  const addCalculation = useAddCalculation();
  const { toast } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  // Slab Form
  const slabForm = useForm<z.infer<typeof slabFormSchema>>({
    resolver: zodResolver(slabFormSchema),
    defaultValues: {
      area: 0,
      beamDepth: "P-15",
      density: 12,
    },
  });

  // Wall Form
  const wallForm = useForm<z.infer<typeof wallFormSchema>>({
    resolver: zodResolver(wallFormSchema),
    defaultValues: {
      length: 0,
      height: 0,
      type: "load-bearing",
    },
  });

  // Auto-select latest project if created
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      // Typically sort by ID desc or created_at desc
      const sorted = [...projects].sort((a, b) => b.id - a.id);
      setSelectedProjectId(sorted[0].id.toString());
    }
  }, [projects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const newProj = await createProject.mutateAsync({ clientName: newProjectName, profitMargin: "20.0" });
      setSelectedProjectId(newProj.id.toString());
      setNewProjectName("");
      setIsProjectDialogOpen(false);
    } catch (e) {
      // Error handled in hook
    }
  };

  const onSlabSubmit = async (values: z.infer<typeof slabFormSchema>) => {
    if (!selectedProjectId) {
      toast({ title: "Proyecto requerido", description: "Por favor selecciona o crea un proyecto primero.", variant: "destructive" });
      return;
    }

    // Mock Calculation Logic (Backend normally handles detailed logic, but we send raw values)
    // Here we just simulate some basic result structure to match schema requirements
    const projectId = parseInt(selectedProjectId);
    const specs = { beamDepth: values.beamDepth, polystyreneDensity: values.density };
    
    // Simulate savings for display later
    const concreteSaved = values.area * 0.08; // approx 0.08 m3 saved per m2
    const weightReduced = values.area * 120; // approx 120kg saved per m2
    
    await addCalculation.mutateAsync({
      projectId,
      type: "slab",
      area: values.area.toString(),
      specs,
      results: {
        materials: { beams: Math.ceil(values.area / 0.7), vaults: Math.ceil(values.area * 6) },
        comparison: {
          concreteSaved,
          weightReduced,
          timeSaved: Math.ceil(values.area / 20), // 1 day saved per 20m2
          energySaved: values.area * 15, // arbitrary unit
        }
      }
    });
    
    slabForm.reset({ ...values, area: 0 }); // Reset area only for next input
  };

  const onWallSubmit = async (values: z.infer<typeof wallFormSchema>) => {
    if (!selectedProjectId) {
      toast({ title: "Proyecto requerido", description: "Por favor selecciona o crea un proyecto primero.", variant: "destructive" });
      return;
    }

    const projectId = parseInt(selectedProjectId);
    const area = values.length * values.height;
    const specs = { wallType: values.type };

    await addCalculation.mutateAsync({
      projectId,
      type: "wall",
      area: area.toString(),
      specs,
      results: {
        materials: { panels: Math.ceil(area / 2.97) }, // panel is usually 1.22x2.44 ~ 2.97m2
        comparison: {
          concreteSaved: area * 0.05,
          weightReduced: area * 80,
          timeSaved: Math.ceil(area / 15),
          energySaved: area * 25,
        }
      }
    });

    wallForm.reset({ ...values, length: 0, height: 0 });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Calculadora de Materiales</h1>
          <p className="text-muted-foreground mt-2">Configura los parámetros técnicos para losa y muro.</p>
        </div>

        <Card className="min-w-[300px] border-l-4 border-l-accent shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proyecto Activo</Label>
              <div className="flex gap-2">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isLoadingProjects}>
                  <SelectTrigger className="w-full">
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
                
                <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="secondary" className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuevo Proyecto</DialogTitle>
                      <DialogDescription>Ingresa el nombre del cliente o identificador del proyecto.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Input 
                        placeholder="Nombre del Cliente / Obra" 
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateProject} disabled={createProject.isPending}>
                        {createProject.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Crear Proyecto
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="slab" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-auto p-1 bg-muted/50 rounded-2xl">
          <TabsTrigger value="slab" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="font-semibold">Losa (Vigueta y Bovedilla)</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="wall" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2">
              <BrickWall className="w-4 h-4" />
              <span className="font-semibold">Muro (Panel Estructural)</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slab">
          <Card className="border-0 shadow-xl shadow-primary/5 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-accent w-full" />
            <CardHeader className="bg-muted/10 pb-8">
              <CardTitle className="text-2xl">Configuración de Losa</CardTitle>
              <CardDescription>
                Calcula viguetas, bovedillas y malla electrosoldada según la superficie.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <Form {...slabForm}>
                <form onSubmit={slabForm.handleSubmit(onSlabSubmit)} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                      control={slabForm.control}
                      name="beamDepth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peralte de Vigueta</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Seleccionar peralte" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="P-15">P-15 (Claros cortos)</SelectItem>
                              <SelectItem value="P-20">P-20 (Claros medios)</SelectItem>
                              <SelectItem value="P-25">P-25 (Claros largos)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Determina la capacidad de carga según el claro.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={slabForm.control}
                      name="density"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Densidad de Bovedilla (kg/m³): {field.value}</FormLabel>
                          <div className="pt-2 px-2">
                            <Slider
                              min={10}
                              max={25}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="py-4"
                            />
                          </div>
                          <FormDescription className="flex justify-between text-xs">
                            <span>Ligero (10kg)</span>
                            <span>Térmico (25kg)</span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={slabForm.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Superficie Total (m²)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              className="pl-4 h-14 text-lg font-medium"
                            />
                            <div className="absolute right-4 top-4 text-muted-foreground font-medium">m²</div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="bg-accent hover:bg-accent/90 text-white px-8 rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                      disabled={addCalculation.isPending}
                    >
                      {addCalculation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                      Guardar Cálculo
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wall">
          <Card className="border-0 shadow-xl shadow-primary/5 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-accent to-primary w-full" />
            <CardHeader className="bg-muted/10 pb-8">
              <CardTitle className="text-2xl">Configuración de Muro</CardTitle>
              <CardDescription>
                Calcula paneles, mallas de unión y anclajes según dimensiones lineales.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <Form {...wallForm}>
                <form onSubmit={wallForm.handleSubmit(onWallSubmit)} className="space-y-8">
                  <FormField
                    control={wallForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Aplicación</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="load-bearing">Muro de Carga</SelectItem>
                            <SelectItem value="partition">Muro Divisorio</SelectItem>
                            <SelectItem value="ceiling">Plafón / Losa Cubierta</SelectItem>
                            <SelectItem value="retaining">Muro de Contención</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                      control={wallForm.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitud Lineal (m)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" placeholder="0.00" {...field} className="h-14 text-lg" />
                              <div className="absolute right-4 top-4 text-muted-foreground font-medium">m</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={wallForm.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Altura Promedio (m)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" placeholder="0.00" {...field} className="h-14 text-lg" />
                              <div className="absolute right-4 top-4 text-muted-foreground font-medium">m</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="bg-accent hover:bg-accent/90 text-white px-8 rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                      disabled={addCalculation.isPending}
                    >
                      {addCalculation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                      Guardar Cálculo
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
