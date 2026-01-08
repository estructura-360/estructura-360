import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useProjects, useProject, useDeleteCalculation } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Trash2, FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, type Calculation } from "@shared/routes";

export default function BudgetPage() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [profitMargin, setProfitMargin] = useState(20);
  
  const { data: projectDetails, isLoading: isLoadingDetails } = useProject(selectedProjectId ? parseInt(selectedProjectId) : null);
  const deleteCalculation = useDeleteCalculation();
  const { toast } = useToast();

  const budgetItems = useMemo(() => {
    if (!projectDetails?.calculations) return [];
    
    return projectDetails.calculations.map((calc: any) => {
      // Mock pricing logic for demonstration
      const unitPrice = calc.type === 'slab' ? 450 : 320; // Base price per m2
      const baseCost = parseFloat(calc.area) * unitPrice;
      const profit = baseCost * (profitMargin / 100);
      const total = baseCost + profit;
      
      return {
        ...calc,
        unitPrice,
        baseCost,
        total
      };
    });
  }, [projectDetails, profitMargin]);

  const totalBudget = budgetItems.reduce((acc, item) => acc + item.total, 0);

  const handleShareWhatsApp = () => {
    if (!projectDetails) return;
    
    const message = `
*Presupuesto ESTRUCTURA 360*
Cliente: ${projectDetails.clientName}
Total: $${totalBudget.toLocaleString('es-MX', { minimumFractionDigits: 2 })}

Detalles:
${budgetItems.map(item => `- ${item.type === 'slab' ? 'Losa' : 'Muro'} (${item.area}m²): $${item.total.toLocaleString()}`).join('\n')}

_Generado automáticamente por Estructura 360_
    `.trim();

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDelete = async (id: number) => {
    if (!selectedProjectId) return;
    try {
      await deleteCalculation.mutateAsync({ id, projectId: parseInt(selectedProjectId) });
    } catch (e) {
      // handled in hook
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Generador de Presupuestos</h1>
          <p className="text-muted-foreground mt-2">Gestiona costos y exporta cotizaciones formales.</p>
        </div>
        <div className="w-[300px]">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isLoadingProjects}>
            <SelectTrigger className="w-full bg-white shadow-sm border-primary/20">
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
        </div>
      </div>

      {!selectedProjectId ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-muted/10 rounded-3xl border-2 border-dashed border-muted-foreground/20">
          <FileDown className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg text-muted-foreground font-medium">Selecciona un proyecto para generar presupuesto</p>
        </div>
      ) : isLoadingDetails ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Desglose de Materiales</CardTitle>
              <CardDescription>Items calculados en el proyecto actual.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio U.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay cálculos guardados en este proyecto.
                      </TableCell>
                    </TableRow>
                  ) : (
                    budgetItems.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.type === 'slab' ? 'Losa Vigueta y Bovedilla' : 'Muro Panel Estructural'}
                          <span className="block text-xs text-muted-foreground font-normal">
                            {item.type === 'slab' ? (item.specs as any).beamDepth : (item.specs as any).wallType}
                          </span>
                        </TableCell>
                        <TableCell>{item.area} m²</TableCell>
                        <TableCell>${item.unitPrice}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteCalculation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Resumen Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-sm opacity-70">Subtotal Costo</span>
                  <span className="text-xl font-medium">
                    ${(totalBudget / (1 + profitMargin/100)).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Margen de Utilidad</span>
                    <span className="font-bold text-accent">{profitMargin}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={profitMargin} 
                    onChange={(e) => setProfitMargin(parseInt(e.target.value))}
                    className="w-full accent-accent h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <span className="block text-sm opacity-70 mb-1">Precio Final</span>
                  <span className="block text-4xl font-display font-bold text-white">
                    ${totalBudget.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="block text-xs opacity-50 mt-1">Moneda Nacional (MXN)</span>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0"
                  onClick={handleShareWhatsApp}
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Enviar por WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}
