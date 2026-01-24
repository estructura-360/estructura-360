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
import { useProjects, useCreateProject, useAddCalculation, useDeleteProject } from "@/hooks/use-projects";
import { Plus, Save, Loader2, Layers, BrickWall, FileImage, Trash2, Scale, DollarSign } from "lucide-react";
import construccionLosaImg from "@assets/construccion-losa.jpeg";
import panelEstructuralImg from "@assets/panel-estructural.jpeg";
import { SlabComparator } from "@/components/SlabComparator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { calculateLayout, LayoutResult } from "@/lib/layoutPlanner";
import { SlabLayoutDiagram } from "@/components/SlabLayoutDiagram";

const slabFormSchema = z.object({
  length: z.coerce.number().min(1, "El largo debe ser mayor a 0"),
  width: z.coerce.number().min(1, "El ancho debe ser mayor a 0"),
  beamDepth: z.enum(["P-15", "P-20", "P-25"]),
  density: z.coerce.number().min(10).max(25),
  climate: z.enum(["Caluroso", "Frío"]),
  viguetaPrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  bovedillaPrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
});

const getPeralteFromClaro = (shortestSide: number): "P-15" | "P-20" | "P-25" => {
  if (shortestSide <= 4) return "P-15";
  if (shortestSide <= 5) return "P-20";
  return "P-25";
};

const wallFormSchema = z.object({
  length: z.coerce.number().min(1, "La longitud debe ser mayor a 0"),
  height: z.coerce.number().min(1, "La altura debe ser mayor a 0"),
  type: z.enum(["load-bearing", "partition", "ceiling", "retaining"]),
});

export default function CalculatorPage() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const createProject = useCreateProject();
  const addCalculation = useAddCalculation();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [layoutResult, setLayoutResult] = useState<LayoutResult | null>(null);
  const [layoutDimensions, setLayoutDimensions] = useState<{ length: number; width: number } | null>(null);

  const slabForm = useForm<z.infer<typeof slabFormSchema>>({
    resolver: zodResolver(slabFormSchema),
    defaultValues: {
      length: 0,
      width: 0,
      beamDepth: "P-15",
      density: 12,
      climate: "Caluroso",
      viguetaPrice: 0,
      bovedillaPrice: 0,
    },
  });

  const wallForm = useForm<z.infer<typeof wallFormSchema>>({
    resolver: zodResolver(wallFormSchema),
    defaultValues: {
      length: 0,
      height: 0,
      type: "load-bearing",
    },
  });

  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
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

  const generateLayout = () => {
    const length = slabForm.getValues("length");
    const width = slabForm.getValues("width");
    
    if (length > 0 && width > 0) {
      const result = calculateLayout(length, width);
      setLayoutResult(result);
      setLayoutDimensions({ length, width });
      toast({ title: "Plano generado", description: "Se calculó la distribución óptima de viguetas y bovedillas." });
    } else {
      toast({ title: "Medidas requeridas", description: "Ingresa largo y ancho para generar el plano.", variant: "destructive" });
    }
  };

  const onSlabSubmit = async (values: z.infer<typeof slabFormSchema>) => {
    if (!selectedProjectId) {
      toast({ title: "Proyecto requerido", description: "Por favor selecciona o crea un proyecto primero.", variant: "destructive" });
      return;
    }

    const area = values.length * values.width;
    const projectId = parseInt(selectedProjectId);
    const layout = calculateLayout(values.length, values.width);
    
    const shortestSide = Math.min(values.length, values.width);
    const calculatedPeralte = getPeralteFromClaro(shortestSide);
    
    const specs = { 
      beamDepth: calculatedPeralte, 
      polystyreneDensity: values.density,
      climate: values.climate,
      dimensions: { length: values.length, width: values.width },
      prices: {
        vigueta: values.viguetaPrice,
        bovedilla: values.bovedillaPrice,
        peralte: calculatedPeralte
      }
    };
    
    const concreteSaved = area * 0.03;
    const weightReduced = area * 72;
    
    await addCalculation.mutateAsync({
      projectId,
      type: "slab",
      area: area.toString(),
      specs,
      results: {
        materials: { 
          beams: layout.joistCount, 
          vaults: layout.totalVaults,
          mesh: Math.ceil(area * 1.1)
        },
        comparison: {
          concreteSaved: concreteSaved.toFixed(2),
          weightReduced: weightReduced.toString(),
          timeSaved: Math.ceil(area / 20),
          energyEfficiency: Math.round(values.density * 4),
          thermalConfort: values.climate === 'Frío' ? 85 : 88
        },
        layout: {
          orientation: layout.orientation,
          joistLength: layout.joistLength,
          selectedBeamLength: layout.selectedBeamLength,
          wastePercentage: layout.wastePercentage,
          recommendations: layout.recommendations
        }
      }
    });
    
    setLayoutResult(layout);
    setLayoutDimensions({ length: values.length, width: values.width });
    toast({ title: "Cálculo guardado", description: "El cálculo se agregó al proyecto con el plano de distribución." });
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
        materials: { panels: Math.ceil(area / 2.97) },
        comparison: {
          timeSaved: Math.ceil(area / 15),
          weightReduced: (area * 80).toString(),
          energyEfficiency: 85
        }
      }
    });

    wallForm.reset({ ...values, length: 0, height: 0 });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary">Calculadora de Materiales</h1>
          <p className="text-muted-foreground mt-2">Configura los parámetros técnicos y genera planos automáticos.</p>
        </div>

        <Card className="w-full md:min-w-[300px] md:w-auto border-l-4 border-l-accent shadow-md">
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
                
                {selectedProjectId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10" data-testid="button-delete-project">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Proyecto</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente el proyecto y todos sus cálculos, tareas y registros. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => {
                            deleteProject.mutate(parseInt(selectedProjectId));
                            setSelectedProjectId("");
                          }}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comparator" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 h-auto p-1 bg-muted/50 rounded-xl sm:rounded-2xl">
          <TabsTrigger value="comparator" className="rounded-lg sm:rounded-xl py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300" data-testid="tab-comparator">
            <div className="flex items-center gap-1 sm:gap-2">
              <Scale className="w-4 h-4" />
              <span className="font-semibold text-xs sm:text-sm">Comparador</span>
              <span className="hidden lg:inline font-semibold text-sm">(Tradicional vs V&B)</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="slab" className="rounded-lg sm:rounded-xl py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300" data-testid="tab-slab">
            <div className="flex items-center gap-1 sm:gap-2">
              <Layers className="w-4 h-4" />
              <span className="font-semibold text-xs sm:text-sm">Losa</span>
              <span className="hidden lg:inline font-semibold text-sm">(Vigueta y Bovedilla)</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="wall" className="rounded-lg sm:rounded-xl py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300" data-testid="tab-wall">
            <div className="flex items-center gap-1 sm:gap-2">
              <BrickWall className="w-4 h-4" />
              <span className="font-semibold text-xs sm:text-sm">Muro</span>
              <span className="hidden lg:inline font-semibold text-sm">(Panel Estructural)</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparator" className="space-y-6">
          <SlabComparator />
        </TabsContent>

        <TabsContent value="slab" className="space-y-6">
          <Card className="border-0 shadow-xl shadow-primary/5 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-accent w-full" />
            <CardHeader className="bg-muted/10 pb-4">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">Configuración de Losa</CardTitle>
                  <CardDescription>
                    Ingresa las dimensiones para generar el plano de distribución automático.
                  </CardDescription>
                </div>
                <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden border shadow-md">
                  <img 
                    src={construccionLosaImg} 
                    alt="Sistema Vigueta y Bovedilla en construcción" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <Form {...slabForm}>
                <form onSubmit={slabForm.handleSubmit(onSlabSubmit)} className="space-y-8">
                  {/* Dimensions - NEW */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                      control={slabForm.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Largo de la Losa (m)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00" 
                                {...field} 
                                className="pl-4 h-14 text-lg font-medium"
                                data-testid="input-slab-length"
                              />
                              <div className="absolute right-4 top-4 text-muted-foreground font-medium">m</div>
                            </div>
                          </FormControl>
                          <FormDescription>Dimensión en la que correrán las viguetas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={slabForm.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ancho de la Losa (m)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00" 
                                {...field} 
                                className="pl-4 h-14 text-lg font-medium"
                                data-testid="input-slab-width"
                              />
                              <div className="absolute right-4 top-4 text-muted-foreground font-medium">m</div>
                            </div>
                          </FormControl>
                          <FormDescription>Dimensión perpendicular a las viguetas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dynamic Savings Preview */}
                  {slabForm.watch("length") > 0 && slabForm.watch("width") > 0 && (
                    <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-green-500/5 rounded-2xl p-6 border border-primary/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Área Total:</span>
                        <span className="text-2xl font-bold text-accent">
                          {(slabForm.watch("length") * slabForm.watch("width")).toFixed(2)} m²
                        </span>
                      </div>
                      
                      <div className="h-px bg-border" />
                      
                      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                        Estimación de Ahorro vs. Losa Tradicional
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                        <div className="text-center p-2 sm:p-3 bg-white/80 rounded-lg sm:rounded-xl border border-green-200">
                          <div className="text-sm sm:text-lg font-bold text-green-600">
                            -{((slabForm.watch("length") * slabForm.watch("width")) * 0.03).toFixed(1)}m³
                          </div>
                          <div className="text-xs text-muted-foreground">Concreto (30%)</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white/80 rounded-lg sm:rounded-xl border border-blue-200">
                          <div className="text-sm sm:text-lg font-bold text-blue-600">
                            -{((slabForm.watch("length") * slabForm.watch("width")) * 72 / 1000).toFixed(2)}ton
                          </div>
                          <div className="text-xs text-muted-foreground">Peso (30%)</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white/80 rounded-lg sm:rounded-xl border border-purple-200">
                          <div className="text-sm sm:text-lg font-bold text-purple-600">
                            -{Math.ceil((slabForm.watch("length") * slabForm.watch("width")) / 50)} días
                          </div>
                          <div className="text-xs text-muted-foreground">Tiempo (V&B 50m²/día)</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white/80 rounded-lg sm:rounded-xl border border-orange-200">
                          <div className="text-sm sm:text-lg font-bold text-orange-600">
                            $-{((slabForm.watch("length") * slabForm.watch("width")) * 85).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Costo Est.</div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center italic">
                        Valores estimados basados en comparación con losa tradicional de 10cm. Consulte presupuesto formal para cifras exactas.
                      </p>
                      
                      <div className="mt-3 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                        <p className="text-xs text-center font-medium text-primary">
                          Resistencia recomendada: f'c = 250 kg/cm² para Losa Vigueta Bovedilla
                        </p>
                      </div>
                      
                      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                        <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Precios para Presupuesto
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Peralte requerido: <span className="font-bold text-primary">
                            {getPeralteFromClaro(Math.min(slabForm.watch("length"), slabForm.watch("width")))}
                          </span> (basado en claro de {Math.min(slabForm.watch("length"), slabForm.watch("width")).toFixed(2)}m)
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={slabForm.control}
                            name="viguetaPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Vigueta {getPeralteFromClaro(Math.min(slabForm.watch("length"), slabForm.watch("width")))} ($/pieza)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    className="h-10"
                                    data-testid="input-vigueta-price"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={slabForm.control}
                            name="bovedillaPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Bovedilla ($/m³)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    className="h-10"
                                    data-testid="input-bovedilla-price"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <FormField
                      control={slabForm.control}
                      name="beamDepth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peralte de Vigueta</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12" data-testid="select-beam-depth">
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
                              data-testid="slider-density"
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

                  <div className="space-y-4">
                    <Label>Clima Predominante</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={slabForm.watch("climate") === "Caluroso" ? "default" : "outline"}
                        className="w-full h-12"
                        onClick={() => slabForm.setValue("climate", "Caluroso")}
                        data-testid="button-climate-hot"
                      >
                        Caluroso
                      </Button>
                      <Button
                        type="button"
                        variant={slabForm.watch("climate") === "Frío" ? "default" : "outline"}
                        className="w-full h-12"
                        onClick={() => slabForm.setValue("climate", "Frío")}
                        data-testid="button-climate-cold"
                      >
                        Frío
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <Button 
                      type="button"
                      variant="outline"
                      size="lg"
                      className="px-6 rounded-xl"
                      onClick={generateLayout}
                      data-testid="button-generate-layout"
                    >
                      <FileImage className="mr-2 h-5 w-5" />
                      Generar Plano
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="bg-accent hover:bg-accent/90 text-white px-8 rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                      disabled={addCalculation.isPending}
                      data-testid="button-save-slab"
                    >
                      {addCalculation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                      Guardar Cálculo
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Layout Diagram */}
          {layoutResult && layoutDimensions && (
            <SlabLayoutDiagram 
              layout={layoutResult} 
              length={layoutDimensions.length} 
              width={layoutDimensions.width} 
            />
          )}
        </TabsContent>

        <TabsContent value="wall">
          <Card className="border-0 shadow-xl shadow-primary/5 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-accent to-primary w-full" />
            <CardHeader className="bg-muted/10 pb-4">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">Configuración de Muro</CardTitle>
                  <CardDescription>
                    Calcula paneles, mallas de unión y anclajes según dimensiones lineales.
                  </CardDescription>
                </div>
                <div className="w-full md:w-48 h-56 rounded-xl overflow-hidden border shadow-md bg-slate-100">
                  <img 
                    src={panelEstructuralImg} 
                    alt="Panel estructural con malla de refuerzo" 
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </div>
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
                            <SelectTrigger className="h-12" data-testid="select-wall-type">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <FormField
                      control={wallForm.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitud Lineal (m)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" placeholder="0.00" {...field} className="h-14 text-lg" data-testid="input-wall-length" />
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
                              <Input type="number" placeholder="0.00" {...field} className="h-14 text-lg" data-testid="input-wall-height" />
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
                      data-testid="button-save-wall"
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
