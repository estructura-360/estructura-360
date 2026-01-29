import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useProjects, useProject, useDeleteCalculation, useUpdateProject } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Trash2, FileDown, Loader2, FileText, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo-estructura360.png";
import { EnvironmentalBenefits } from "@/components/EnvironmentalBenefits";

export default function BudgetPage() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [profitMargin, setProfitMargin] = useState(20);
  
  const { data: projectDetails, isLoading: isLoadingDetails } = useProject(selectedProjectId ? parseInt(selectedProjectId) : null);
  const updateProject = useUpdateProject();
  const deleteCalculation = useDeleteCalculation();
  const { toast } = useToast();

  const budgetItems = useMemo(() => {
    if (!projectDetails?.calculations) return [];
    
    return projectDetails.calculations.map((calc: any) => {
      let materialCost = 0;
      let viguetaCost = 0;
      let bovedillaCost = 0;
      let mallaCost = 0;
      let panelCost = 0;
      let viguetaCount = 0;
      let bovedillaVolume = 0;
      let mallaSheets = 0;
      let panelCount = 0;
      
      if (calc.type === 'slab') {
        const specs = calc.specs as any;
        const results = calc.results as any;
        const prices = specs?.prices || {};
        
        viguetaCount = results?.materials?.beams || 0;
        const bovedillaCount = results?.materials?.vaultsWithWaste || results?.materials?.vaults || 0;
        
        // Get peralte height based on stored peralte or calculate from dimensions
        const peralteValue = specs?.peralte || 20;
        const peralteHeight = peralteValue === 15 ? 0.15 : peralteValue === 25 ? 0.25 : 0.20;
        const bovedillaPieceVolume = 1.22 * 0.63 * peralteHeight;
        
        // Use stored volume if available, otherwise calculate
        bovedillaVolume = results?.materials?.bovedillaVolume || (bovedillaCount * bovedillaPieceVolume);
        
        // Malla electrosoldada calculation
        const mallaData = results?.materials?.malla;
        mallaSheets = mallaData?.sheets || Math.ceil(parseFloat(calc.area) * 1.02 / (2.35 * 6.00));
        
        const viguetaUnitPrice = prices?.vigueta || 0;
        const bovedillaPricePerM3 = prices?.bovedilla || 0;
        const mallaPricePerSheet = prices?.malla || 0;
        
        viguetaCost = viguetaCount * viguetaUnitPrice;
        bovedillaCost = bovedillaVolume * bovedillaPricePerM3;
        mallaCost = mallaSheets * mallaPricePerSheet;
        materialCost = viguetaCost + bovedillaCost + mallaCost;
      } else if (calc.type === 'wall') {
        const specs = calc.specs as any;
        const results = calc.results as any;
        const prices = specs?.prices || {};
        
        // Panel structural calculation
        panelCount = results?.materials?.panelsWithWaste || results?.materials?.panels || 0;
        const panelUnitPrice = prices?.panelPrice || 0;
        panelCost = panelCount * panelUnitPrice;
        
        const linearCost = prices?.linearCost || 0;
        const heightCost = prices?.heightCost || 0;
        materialCost = prices?.totalCost || (panelCost + linearCost + heightCost);
        
        if (materialCost === 0) {
          materialCost = parseFloat(calc.area) * 320;
        }
      } else {
        materialCost = parseFloat(calc.area) * 320;
      }
      
      const baseCost = materialCost > 0 ? materialCost : parseFloat(calc.area) * (calc.type === 'slab' ? 450 : 320);
      const profit = baseCost * (profitMargin / 100);
      const total = baseCost + profit;
      
      return {
        ...calc,
        viguetaCost,
        bovedillaCost,
        mallaCost,
        panelCost,
        viguetaCount,
        bovedillaVolume,
        mallaSheets,
        panelCount,
        baseCost,
        total
      };
    });
  }, [projectDetails, profitMargin]);

  const totalArea = projectDetails?.calculations?.reduce((acc, curr) => acc + parseFloat(curr.area), 0) || 0;
  const totalMaterialCost = budgetItems.reduce((acc, item) => acc + item.baseCost, 0);
  const totalLaborCost = parseFloat(projectDetails?.laborCostPerM2 || "0") * totalArea;
  const subtotal = totalMaterialCost + totalLaborCost;
  const currentProfit = subtotal * (profitMargin / 100);
  const totalBudget = subtotal + currentProfit;

  const handleUpdateLabor = (value: string) => {
    updateProject.mutate({ id: parseInt(selectedProjectId), laborCostPerM2: value });
  };

  const handleDownloadPDF = async () => {
    if (!projectDetails) return;
    if (budgetItems.length === 0) {
      toast({
        title: "Sin cálculos",
        description: "Agrega cálculos de losa o muro antes de generar el presupuesto.",
        variant: "destructive"
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = 210;
    const margin = 15;
    
    // Load logo image
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };
    
    try {
      const logo = await loadImage(logoImg);
      
      // ====== PAGE 1: PRESUPUESTO (según formato oficial) ======
      
      // Header with logo and date/folio on right
      doc.addImage(logo, 'PNG', margin, 5, 70, 22);
      
      // Date and Folio on the right
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const dateStr = new Date().toLocaleDateString('es-MX', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(`Fecha: ${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}.`, pageWidth - margin, 12, { align: 'right' });
      doc.text(`Folio: #ENG${String(projectDetails.id).padStart(3, '0')}-001`, pageWidth - margin, 20, { align: 'right' });
      
      // Orange line separator
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 32, pageWidth, 2, 'F');
      
      // PRESUPUESTO title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("PRESUPUESTO", margin, 45);
      
      // Cliente
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${projectDetails.clientName}`, margin, 54);
      
      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 58, pageWidth - margin, 58);
      
      // Materials section header
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, 62, pageWidth - margin * 2, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DESGLOSE DE MATERIALES", margin + 3, 68);

      // Build table data with correct specs matching the template format
      const tableData: string[][] = [];
      
      budgetItems.forEach(item => {
        const specs = item.specs as any;
        
        if (item.type === 'slab') {
          const viguetaType = specs?.viguetaType || 'almaAbierta';
          const viguetaTypeLabel = viguetaType === 'pretensada' ? 'Vigueta Pretensada' : 'Vigueta de Alma Abierta';
          const viguetaPrice = specs?.prices?.vigueta || 0;
          const bovedillaPrice = specs?.prices?.bovedilla || 0;
          const mallaPrice = specs?.prices?.malla || 0;
          const dimensions = specs?.dimensions;
          const dimText = dimensions ? `(${dimensions.length}m × ${dimensions.width}m)` : '';
          
          // Get peralte from specs
          const peralte = specs?.peralte || 20;
          const peralteHeight = peralte === 15 ? 0.15 : peralte === 25 ? 0.25 : 0.20;
          const bovedillaDimensions = `1.22 × 0.63 × ${peralteHeight.toFixed(2)} m`;
          
          // Losa header row
          tableData.push([
            `Losa Vigueta Bovedilla EPS ${dimText}`,
            '',
            '',
            ''
          ]);
          
          // Vigueta row
          if (item.viguetaCount > 0) {
            const viguetaLabel = `${viguetaTypeLabel} Peralte ${peralte}`;
            tableData.push([
              `    ${viguetaLabel}`,
              `${item.viguetaCount} pzas`,
              `$${viguetaPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
              `$${item.viguetaCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
            ]);
          }
          
          // Bovedilla row
          if (item.bovedillaVolume > 0) {
            const bovedillaCount = Math.ceil(item.bovedillaVolume / (1.22 * 0.63 * peralteHeight));
            tableData.push([
              `    Bovedilla EPS 8 kg/m³ (${bovedillaDimensions})`,
              `${bovedillaCount} pzas`,
              `$${bovedillaPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
              `$${item.bovedillaCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
            ]);
          }
          
          // Malla electrosoldada row
          if (item.mallaSheets > 0) {
            tableData.push([
              `    Malla Electrosoldada 66-10-10`,
              `${item.mallaSheets} hojas`,
              `$${mallaPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
              `$${item.mallaCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
            ]);
          }
          
        } else if (item.type === 'wall') {
          const panelPrice = specs?.prices?.panelPrice || 0;
          const thickness = specs?.panelThickness || 3;
          
          tableData.push([
            `Panel Estructural EPS ${thickness}" (1.22 × 2.44 m)`,
            `${item.panelCount} pzas`,
            `$${panelPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
            `$${item.panelCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
          ]);
        }
      });

      autoTable(doc, {
        startY: 72,
        head: [['Concepto', 'Cantidad', 'Precio Unitario', 'Importe']],
        body: tableData,
        headStyles: { 
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 85 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          (doc as any).lastTableFinalY = data.cursor?.y;
        }
      });

      const finalY = (doc as any).lastTableFinalY || 140;

    // Environmental benefits box on the left
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(margin, finalY + 5, 85, 45, 3, 3, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("BENEFICIOS AMBIENTALES", margin + 5, finalY + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("• 30% menos uso de agua", margin + 5, finalY + 22);
    doc.text("• 70% menos cimbrado (madera)", margin + 5, finalY + 28);
    doc.text("• Menor huella de carbono", margin + 5, finalY + 34);
    doc.text("• EPS 100% reciclable", margin + 5, finalY + 40);
    doc.text("• Aislamiento térmico superior", margin + 5, finalY + 46);

    // Summary box on the right - calculate based on material cost only (matching template)
    const pdfSubtotalMateriales = totalMaterialCost;
    const pdfUtilidad = pdfSubtotalMateriales * (profitMargin / 100);
    const pdfSubtotal = pdfSubtotalMateriales + pdfUtilidad;
    const pdfIVA = pdfSubtotal * 0.16;
    const pdfTotal = pdfSubtotal + pdfIVA;
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(105, finalY + 5, 90, 50, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(105, finalY + 5, 90, 50, 3, 3, 'S');
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    let summaryY = finalY + 14;
    doc.text("Subtotal Materiales:", 110, summaryY);
    doc.text(`$${pdfSubtotalMateriales.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 190, summaryY, { align: 'right' });
    
    summaryY += 7;
    doc.text(`Utilidad (${profitMargin}%):`, 110, summaryY);
    doc.text(`$${pdfUtilidad.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 190, summaryY, { align: 'right' });
    
    summaryY += 7;
    doc.text("Subtotal:", 110, summaryY);
    doc.text(`$${pdfSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 190, summaryY, { align: 'right' });
    
    summaryY += 7;
    doc.text("IVA (16%):", 110, summaryY);
    doc.text(`$${pdfIVA.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 190, summaryY, { align: 'right' });
    
    // Total highlight
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(105, summaryY + 3, 90, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", 110, summaryY + 10);
    doc.text(`$${pdfTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 190, summaryY + 10, { align: 'right' });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Vigencia: 15 días naturales a partir de la fecha de emisión.", margin, 275);
    doc.text("Precios sujetos a cambio sin previo aviso. No incluye instalación eléctrica ni hidráulica.", margin, 280);
    doc.setFont("helvetica", "bold");
    doc.text("Generado por ESTRUCTURA 360 - www.estructura360.com", margin, 288);

    // Open PDF (single page budget - no floor plans)
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Presupuesto_${projectDetails.clientName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
      toast({
        title: "PDF Generado",
        description: "El presupuesto se abrió en una nueva pestaña.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (!projectDetails) return;
    
    const message = `
*PRESUPUESTO FORMAL - ESTRUCTURA 360*
------------------------------------
*Cliente:* ${projectDetails.clientName}
*Total:* $${(totalBudget * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })} (IVA Incluido)

*Resumen de Conceptos:*
${budgetItems.map(item => `- ${item.type === 'slab' ? 'Losa' : 'Muro'} (${item.area}m²): $${item.total.toLocaleString()}`).join('\n')}

_Le adjunto el PDF detallado con las especificaciones técnicas._
------------------------------------
_Generado por Estructura 360 Engineering_
    `.trim();

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDelete = async (id: number) => {
    if (!selectedProjectId) return;
    try {
      await deleteCalculation.mutateAsync({ id, projectId: parseInt(selectedProjectId) });
    } catch (e) {}
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary">Generador de Presupuestos</h1>
          <p className="text-muted-foreground mt-2">Gestiona costos y exporta cotizaciones formales.</p>
        </div>
        <div className="w-full sm:w-[300px]">
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
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            {item.type === 'slab' ? (item.specs as any).beamDepth : 
                              (item.specs as any).wallType === 'load-bearing' ? 'Muro de Carga' :
                              (item.specs as any).wallType === 'partition' ? 'Muro Divisorio' :
                              (item.specs as any).wallType === 'ceiling' ? 'Plafón / Losa' :
                              (item.specs as any).wallType === 'retaining' ? 'Muro de Contención' : (item.specs as any).wallType}
                          </span>
                          {item.type === 'wall' && (item.specs as any).prices?.totalCost > 0 && (
                            <div className="mt-1 text-xs space-y-0.5">
                              <div className="text-muted-foreground">
                                {(item.specs as any).dimensions?.length}m × {(item.specs as any).dimensions?.height}m
                              </div>
                              <div className="text-blue-600">
                                Lineal: {(item.specs as any).dimensions?.length}m × ${((item.specs as any).prices?.pricePerLinearMeter || 0).toLocaleString()} = ${((item.specs as any).prices?.linearCost || 0).toLocaleString()}
                              </div>
                              <div className="text-green-600">
                                Altura: {(item.specs as any).dimensions?.height}m × ${((item.specs as any).prices?.pricePerHeight || 0).toLocaleString()} = ${((item.specs as any).prices?.heightCost || 0).toLocaleString()}
                              </div>
                            </div>
                          )}
                          {item.type === 'slab' && item.viguetaCost > 0 && (
                            <div className="mt-1 text-xs space-y-0.5">
                              <div className="text-muted-foreground">
                                {(item.specs as any).viguetaTypeLabel || 'Vigueta'} • Densidad: {(item.specs as any).polystyreneDensity || 12}kg/m³
                              </div>
                              <div className="text-violet-600">Viguetas: {item.viguetaCount} pzas × ${((item.specs as any).prices?.vigueta || 0).toLocaleString()} = ${item.viguetaCost.toLocaleString()}</div>
                              <div className="text-orange-600">Bovedilla: {item.bovedillaVolume.toFixed(2)} m³ × ${((item.specs as any).prices?.bovedilla || 0).toLocaleString()} = ${item.bovedillaCost.toLocaleString()}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{item.area} m²</TableCell>
                        <TableCell>
                          {item.type === 'slab' && item.viguetaCost > 0 ? (
                            <span className="text-xs text-muted-foreground">Ver desglose</span>
                          ) : (
                            `$${(item.baseCost / parseFloat(item.area)).toFixed(0)}/m²`
                          )}
                        </TableCell>
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
                    ${subtotal.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Costo Mano de Obra (m²)</span>
                    <span className="font-bold text-accent">${projectDetails?.laborCostPerM2 || 0}</span>
                  </div>
                  <Input 
                    type="number" 
                    placeholder="Mano de obra p/m2"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    defaultValue={projectDetails?.laborCostPerM2 || ""}
                    onBlur={(e) => handleUpdateLabor(e.target.value)}
                  />
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

                <Button 
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 font-semibold py-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0"
                  onClick={handleDownloadPDF}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Descargar PDF Formal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <EnvironmentalBenefits variant="mini" maxItems={8} />
        </div>
        </>
      )}
    </Layout>
  );
}
