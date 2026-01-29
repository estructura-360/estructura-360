import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useProjects, useProject, useDeleteCalculation, useUpdateProject } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Trash2, FileDown, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateLayout } from "@/lib/layoutPlanner";
import logoImg from "../assets/logo-estructura360.png";

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
      let viguetaCount = 0;
      let bovedillaVolume = 0;
      
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
        
        const viguetaUnitPrice = prices?.vigueta || 0;
        const bovedillaPricePerM3 = prices?.bovedilla || 0;
        
        viguetaCost = viguetaCount * viguetaUnitPrice;
        bovedillaCost = bovedillaVolume * bovedillaPricePerM3;
        materialCost = viguetaCost + bovedillaCost;
      } else if (calc.type === 'wall') {
        const specs = calc.specs as any;
        const prices = specs?.prices || {};
        
        const linearCost = prices?.linearCost || 0;
        const heightCost = prices?.heightCost || 0;
        materialCost = prices?.totalCost || (linearCost + heightCost);
        
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
        viguetaCount,
        bovedillaVolume,
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
      
      // ====== PAGE 1: PRESUPUESTO ======
      
      // Header with logo
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 35, pageWidth, 2, 'F');
      
      // Add logo
      doc.addImage(logo, 'PNG', margin, 5, 80, 25);
      
      // Date on the right
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin, 15, { align: 'right' });
      doc.text(`Folio: #E360-${projectDetails.id}-${new Date().getFullYear()}`, pageWidth - margin, 22, { align: 'right' });
      
      // Project info box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, 42, pageWidth - margin * 2, 20, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, 42, pageWidth - margin * 2, 20, 3, 3, 'S');
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("PRESUPUESTO", margin + 5, 52);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${projectDetails.clientName}`, margin + 5, 58);
      
      // Materials section header
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, 68, pageWidth - margin * 2, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DESGLOSE DE MATERIALES", margin + 3, 74);

      // Build table data with correct specs
      const tableData: string[][] = [];
      
      budgetItems.forEach(item => {
        const area = parseFloat(item.area) || 0;
        const specs = item.specs as any;
        const unitPrice = area > 0 ? item.baseCost / area : 0;
        
        if (item.type === 'slab') {
          const viguetaType = specs?.viguetaTypeLabel || specs?.viguetaType || 'Vigueta';
          const density = specs?.polystyreneDensity || 10;
          const viguetaPrice = specs?.prices?.vigueta || 0;
          const bovedillaPrice = specs?.prices?.bovedilla || 0;
          const dimensions = specs?.dimensions;
          const dimText = dimensions ? `${dimensions.length}m × ${dimensions.width}m` : '';
          
          tableData.push([
            `LOSA VIGUETA Y BOVEDILLA ${dimText}`,
            `${area.toFixed(2)} m²`,
            `$${unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
            `$${item.baseCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
          ]);
          
          if (item.viguetaCount > 0) {
            tableData.push([
              `    ${viguetaType}`,
              `${item.viguetaCount} pzas`,
              `$${viguetaPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/u`,
              `$${item.viguetaCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
            ]);
          }
          
          if (item.bovedillaVolume > 0) {
            tableData.push([
              `    Bovedilla EPS ${density} kg/m³`,
              `${item.bovedillaVolume.toFixed(2)} m³`,
              `$${bovedillaPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}/m³`,
              `$${item.bovedillaCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
            ]);
          }
        } else if (item.type === 'wall') {
          tableData.push([
            'MURO PANEL ESTRUCTURAL',
            `${area.toFixed(2)} m²`,
            `$${unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
            `$${item.baseCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
          ]);
        }
      });

      if (totalLaborCost > 0) {
        tableData.push([
          'MANO DE OBRA',
          `${totalArea.toFixed(2)} m²`,
          `$${parseFloat(projectDetails?.laborCostPerM2 || "0").toLocaleString('es-MX', { minimumFractionDigits: 2 })}/m²`,
          `$${totalLaborCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
        ]);
      }

      autoTable(doc, {
        startY: 78,
        head: [['Concepto', 'Cantidad', 'P. Unitario', 'Importe']],
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
          0: { cellWidth: 80 },
          1: { cellWidth: 35, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          (doc as any).lastTableFinalY = data.cursor?.y;
        }
      });

      const finalY = (doc as any).lastTableFinalY || 140;

    // Summary box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(105, finalY + 5, 90, 55, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(105, finalY + 5, 90, 55, 3, 3, 'S');
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    let summaryY = finalY + 15;
    doc.text("Subtotal Materiales:", 110, summaryY);
    doc.text(`$${totalMaterialCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 190, summaryY, { align: 'right' });
    
    if (totalLaborCost > 0) {
      summaryY += 6;
      doc.text("Mano de Obra:", 110, summaryY);
      doc.text(`$${totalLaborCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 190, summaryY, { align: 'right' });
    }
    
    summaryY += 6;
    doc.text(`Utilidad (${profitMargin}%):`, 110, summaryY);
    doc.text(`$${currentProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 190, summaryY, { align: 'right' });
    
    summaryY += 6;
    doc.text("Subtotal:", 110, summaryY);
    doc.text(`$${totalBudget.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 190, summaryY, { align: 'right' });
    
    summaryY += 6;
    doc.text("IVA (16%):", 110, summaryY);
    doc.text(`$${(totalBudget * 0.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 190, summaryY, { align: 'right' });
    
    // Total highlight
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(105, summaryY + 3, 90, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", 110, summaryY + 10);
    doc.text(`$${(totalBudget * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 190, summaryY + 10, { align: 'right' });

    // Environmental benefits box
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(margin, finalY + 5, 85, 30, 3, 3, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("BENEFICIOS AMBIENTALES", margin + 5, finalY + 14);
    doc.setFont("helvetica", "normal");
    doc.text("30% menos uso de agua", margin + 5, finalY + 22);
    doc.text("70% menos cimbrado (madera)", margin + 5, finalY + 28);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Vigencia: 15 días naturales a partir de la fecha de emisión.", margin, 275);
    doc.text("Precios sujetos a cambio sin previo aviso. No incluye instalación eléctrica ni hidráulica.", margin, 280);
    doc.setFont("helvetica", "bold");
    doc.text("Generado por ESTRUCTURA 360 - www.estructura360.com", margin, 288);
    
    // ====== PAGE 2: PLANO DE DISTRIBUCIÓN (if there are slab calculations) ======
    const slabItems = budgetItems.filter(item => item.type === 'slab');
    
    if (slabItems.length > 0) {
      doc.addPage();
      
      // Header for page 2
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 30, pageWidth, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("PLANO DE DISTRIBUCIÓN", margin, 20);
      
      let planoY = 40;
      
      slabItems.forEach((item, idx) => {
        const specs = item.specs as any;
        const length = parseFloat(specs?.dimensions?.length) || parseFloat(specs?.length) || 6;
        const width = parseFloat(specs?.dimensions?.width) || parseFloat(specs?.width) || 4;
        const layout = calculateLayout(length, width);
        
        const longestSide = Math.max(length, width);
        const shortestSide = Math.min(length, width);
        
        // Get vigueta type and density from specs
        const viguetaType = specs?.viguetaTypeLabel || specs?.viguetaType || 'Vigueta';
        const density = specs?.polystyreneDensity || 10;
        
        // Get peralte based on shortest side
        let peralte = 15;
        let peralteColor = { r: 34, g: 211, b: 238 }; // cyan
        if (shortestSide > 5) {
          peralte = 25;
          peralteColor = { r: 244, g: 63, b: 94 }; // rose
        } else if (shortestSide > 4) {
          peralte = 20;
          peralteColor = { r: 168, g: 85, b: 247 }; // violet
        }
        
        // Section title
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Losa ${idx + 1}: ${length.toFixed(2)}m x ${width.toFixed(2)}m = ${(length * width).toFixed(2)} m²`, margin, planoY);
        
        planoY += 7;
        
        // Technical specs - show vigueta type and density
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`${viguetaType} | Bovedilla EPS ${density} kg/m³ | Peralte P-${peralte}`, margin, planoY);
        
        planoY += 6;
        doc.text(`Viguetas: ${layout.joistCount} pzas | Bovedillas: ${layout.totalVaults} pzas`, margin, planoY);
        
        planoY += 10;
        
        // Draw floor plan
        const planAreaWidth = 120;
        const planAreaHeight = 90;
        const legendWidth = 55;
        const planX = margin;
        const planY = planoY;
        
        // Background for entire section
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(margin, planY, planAreaWidth + legendWidth + 10, planAreaHeight + 25, 3, 3, 'F');
        
        // Scale calculation - viguetas run along the longest side (largo)
        const largo = longestSide; // horizontal
        const claro = shortestSide; // vertical (span between supports)
        
        const scaleX = (planAreaWidth - 30) / largo;
        const scaleY = (planAreaHeight - 20) / claro;
        const scale = Math.min(scaleX, scaleY);
        
        const drawWidth = largo * scale;
        const drawHeight = claro * scale;
        const offsetX = planX + 20;
        const offsetY = planY + 20;
        
        // Dimension label at top - largo
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${largo.toFixed(2)} m (largo)`, offsetX + drawWidth / 2, offsetY - 8, { align: 'center' });
        
        // Bovedilla background - fill entire interior with salmon/orange color
        const chainMargin = 0.15 * scale;
        doc.setFillColor(180, 130, 100); // Salmon/tan color like the reference
        doc.rect(offsetX + chainMargin, offsetY + chainMargin, drawWidth - chainMargin * 2, drawHeight - chainMargin * 2, 'F');
        
        // Draw viguetas (VERTICAL lines) with labels at top
        // Use the joistCount from the layout calculation (consistent with stored data)
        const numJoists = layout.joistCount;
        const joistSpacing = (largo - 0.30) / numJoists; // Distribute evenly
        
        doc.setDrawColor(peralteColor.r, peralteColor.g, peralteColor.b);
        doc.setLineWidth(1.2);
        doc.setFontSize(6);
        
        for (let i = 0; i < numJoists; i++) {
          const joistX = offsetX + chainMargin + (joistSpacing * (i + 0.5)) * scale;
          if (joistX < offsetX + drawWidth - chainMargin) {
            // Draw vigueta line (vertical)
            doc.line(joistX, offsetY + chainMargin, joistX, offsetY + drawHeight - chainMargin);
            // Label at top
            doc.setTextColor(peralteColor.r, peralteColor.g, peralteColor.b);
            doc.text(`P${peralte}`, joistX, offsetY - 2, { align: 'center' });
          }
        }
        
        // Draw bovedilla grid lines (horizontal) between viguetas
        const bovedillaLength = 1.22; // 1.22m standard
        const numBovedillaRows = Math.ceil(claro / bovedillaLength);
        
        doc.setDrawColor(249, 115, 22);
        doc.setLineWidth(0.3);
        
        for (let row = 1; row < numBovedillaRows; row++) {
          const lineY = offsetY + chainMargin + row * bovedillaLength * scale;
          if (lineY < offsetY + drawHeight - chainMargin) {
            doc.line(offsetX + chainMargin, lineY, offsetX + drawWidth - chainMargin, lineY);
          }
        }
        
        // Adjustment row at bottom (different color)
        const adjustmentHeight = (claro % bovedillaLength) * scale;
        if (adjustmentHeight > 5) {
          doc.setFillColor(200, 150, 120); // Lighter color for adjustment
          doc.rect(offsetX + chainMargin, offsetY + drawHeight - chainMargin - adjustmentHeight, 
                   drawWidth - chainMargin * 2, adjustmentHeight, 'F');
          // Redraw viguetas over adjustment area
          doc.setDrawColor(peralteColor.r, peralteColor.g, peralteColor.b);
          doc.setLineWidth(1.2);
          for (let i = 0; i < numJoists; i++) {
            const joistX = offsetX + chainMargin + (joistSpacing * (i + 0.5)) * scale;
            if (joistX < offsetX + drawWidth - chainMargin) {
              doc.line(joistX, offsetY + drawHeight - chainMargin - adjustmentHeight, 
                       joistX, offsetY + drawHeight - chainMargin);
            }
          }
        }
        
        // Cadena perimetral (dashed line)
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.8);
        doc.setLineDashPattern([2, 2], 0);
        doc.rect(offsetX, offsetY, drawWidth, drawHeight);
        doc.setLineDashPattern([], 0);
        
        // Dimension label on left - claro (vertical)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${claro.toFixed(2)} m`, offsetX - 5, offsetY + drawHeight / 2, { align: 'right', angle: 90 });
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(`(claro)`, offsetX - 12, offsetY + drawHeight / 2, { align: 'right', angle: 90 });
        
        // Legend on the right side
        const legendX = offsetX + drawWidth + 15;
        let legendY = planY + 15;
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Leyenda Viguetas:", legendX, legendY);
        legendY += 8;
        
        // Vigueta legend item
        doc.setFillColor(peralteColor.r, peralteColor.g, peralteColor.b);
        doc.rect(legendX, legendY - 2, 15, 2, 'F');
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(`P-${peralte} (${numJoists} pzas)`, legendX + 18, legendY);
        legendY += 12;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("Otros:", legendX, legendY);
        legendY += 8;
        
        // Bovedilla legend
        doc.setFillColor(180, 130, 100);
        doc.setDrawColor(249, 115, 22);
        doc.setLineWidth(0.5);
        doc.rect(legendX, legendY - 3, 12, 6, 'FD');
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("Bovedilla", legendX + 16, legendY + 1);
        legendY += 10;
        
        // Ajuste legend
        doc.setFillColor(200, 150, 120);
        doc.rect(legendX, legendY - 3, 12, 6, 'FD');
        doc.text("Ajuste", legendX + 16, legendY + 1);
        legendY += 10;
        
        // Cadena legend
        doc.setDrawColor(148, 163, 184);
        doc.setLineDashPattern([2, 2], 0);
        doc.rect(legendX, legendY - 3, 12, 6);
        doc.setLineDashPattern([], 0);
        doc.text("Cadena", legendX + 16, legendY + 1);
        
        planoY += planAreaHeight + 35;
      });
      
      // Technical notes
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("NOTAS TÉCNICAS:", margin, planoY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const notes = [
        "• Viguetas separadas cada 70cm (eje a eje)",
        "• Bovedilla de poliestireno expandido: 1.22m × 0.63m × 0.12m",
        "• Apoyo mínimo de vigueta sobre muro/trabe: 5cm",
        "• Capa de compresión recomendada: 4-5cm con malla electrosoldada",
        "• NUNCA cortar el acero de las viguetas",
        "• Apuntalar ANTES de colocar bovedillas"
      ];
      
      notes.forEach((note, i) => {
        doc.text(note, margin, planoY + 8 + i * 5);
      });
      
      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.text("Este plano es una representación esquemática. Consulte con un ingeniero estructural para el proyecto ejecutivo.", margin, 285);
    }

    // Open PDF
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
        description: "El presupuesto con plano de distribución se abrió en una nueva pestaña.",
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
      )}
    </Layout>
  );
}
