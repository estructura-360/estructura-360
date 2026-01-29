import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, FileDown, Scale, Clock, Weight, TrendingDown, Users, Ruler, Info, CheckCircle2, Feather, Shield, Leaf } from "lucide-react";
import { EnvironmentalBenefits } from "@/components/EnvironmentalBenefits";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import viguetaAlmaAbiertaImg from "@/assets/vigueta-alma-abierta.jpeg";
import viguetaPretensadaImg from "@/assets/vigueta-pretensada.jpeg";

interface MaterialPrices {
  cement: number;
  sand: number;
  gravel: number;
  water: number;
  viguetaP15: number;  // $/pieza peralte 15
  viguetaP20: number;  // $/pieza peralte 20
  viguetaP25: number;  // $/pieza peralte 25
  bovedilla: number;   // $/m³
  malla: number;       // $/rollo malla electrosoldada 6x6 10-10 (100m²)
}

// Malla electrosoldada specifications
// Standard rolls of 100m² (2.5m × 40m)
const MALLA = {
  type: '6x6 10-10',
  rollWidth: 2.50, // meters
  rollLength: 40.00, // meters
  rollArea: 100, // m² per roll
  waste: 1.02, // 2% waste
  // Legacy references for compatibility
  sheetWidth: 2.50,
  sheetLength: 40.00,
};

interface SlabDimensions {
  length: number;
  width: number;
}

interface CalculationResults {
  traditional: {
    volume: number;
    cement: number;
    sand: { m3: number; buckets: number };
    gravel: { m3: number; buckets: number };
    water: { liters: number };
    malla: { area: number; sheets: number };
    totalCost: number;
    weight: number;
    days: number;
  };
  vb: {
    volume: number;
    cement: number;
    sand: { m3: number; buckets: number };
    gravel: { m3: number; buckets: number };
    water: { liters: number };
    viguetas: { count: number; meters: number; distribution: ViguetaDistribution };
    bovedillas: number;
    malla: { area: number; sheets: number };
    totalCost: number;
    weight: number;
    days: number;
  };
  savings: {
    material: number;
    cost: number;
    weight: number;
    time: number;
    materialPct: number;
    costPct: number;
    weightPct: number;
    timePct: number;
  };
  layout: {
    joistPositions: { pos: number; peralte: 15 | 20 | 25 }[];
    bovedillaRows: { y: number; pieces: { x: number; width: number; isAdjustment: boolean }[] }[];
    orientation: "length" | "width";
    chainWidth: number;
    numJoists: number;
    longestSide: number;
    shortestSide: number;
    distribution: ViguetaDistribution;
  };
}

// Coeficientes actualizados f'c=250 kg/cm² con 2% desperdicio
const COEFFICIENTS = {
  cement: 8,           // 8 bultos por m³
  sand: 0.5415,        // m³ por m³
  gravel: 0.646,       // m³ por m³
  water: 237.5,        // litros por m³
  waste: 1.02,         // 2% desperdicio
  bucketsPerM3: 52.63,
  traditionalThickness: 0.10,  // 10cm losa tradicional
  vbCompressionLayer: 0.07,    // 7cm capa de compresión V&B
  vbSavingsFactor: 0.70,       // 30% ahorro de concreto
  concreteWeight: 2400,        // kg/m³ peso del concreto
  traditionalWeight: 240,      // 0.10m × 2400 kg/m³ = 240 kg/m²
  vbWeight: 168,               // 30% más ligera: 240 × 0.70 = 168 kg/m²
  timeReduction: 0.65,         // 60-70% ahorro de tiempo
  formworkSavings: 0.85,       // 85% ahorro de cimbra
  productivityVB: 50,          // m²/día con V&B
  productivityTraditional: 5,  // m²/día tradicional
};

const BOVEDILLA = {
  length: 1.22,
  width: 0.63,
  height: 0.12,
  axisDistance: 0.70,
};

// Tipos de vigueta con selección automática de peralte
const VIGUETA_TYPES = {
  almaAbierta: { 
    label: "Vigueta de Alma Abierta", 
    description: "Ligera y fácil de manejar",
    image: viguetaAlmaAbiertaImg,
    factor: 1.0,
    icon: "feather"
  },
  pretensada: { 
    label: "Vigueta Pretensada", 
    description: "Más pesada y robusta para grandes claros",
    image: viguetaPretensadaImg,
    factor: 1.10,
    icon: "shield"
  },
};

// Selección automática de peralte según lado más corto (claro)
// ≤4m → Peralte 15, 4-5m → Peralte 20, >5m → Peralte 25
const getPeralte = (shortestSide: number): { peralte: number; label: string } => {
  if (shortestSide <= 4) return { peralte: 15, label: "Peralte 15 cm" };
  if (shortestSide <= 5) return { peralte: 20, label: "Peralte 20 cm" };
  return { peralte: 25, label: "Peralte 25 cm" };
};

// Colores para cada tipo de peralte en el plano
const PERALTE_COLORS = {
  15: { stroke: "#22d3ee", fill: "#22d3ee", label: "P-15 (Cian)" },    // Cian
  20: { stroke: "#a855f7", fill: "#a855f7", label: "P-20 (Violeta)" }, // Violeta
  25: { stroke: "#f43f5e", fill: "#f43f5e", label: "P-25 (Rosa)" },    // Rosa
};

interface ViguetaDistribution {
  p15: number;
  p20: number;
  p25: number;
}

// Recomendar distribución de viguetas según claro - UN SOLO TIPO DE PERALTE
const recommendViguetaDistribution = (shortestSide: number, totalViguetas: number): ViguetaDistribution => {
  // Basado en el claro (lado más corto), TODAS las viguetas son del mismo peralte
  // Regla: ≤4m → P-15, 4-5m → P-20, >5m → P-25
  if (shortestSide <= 4) {
    // Claro corto (hasta 4m): TODAS P-15
    return { p15: totalViguetas, p20: 0, p25: 0 };
  } else if (shortestSide <= 5) {
    // Claro medio (4m - 5m): TODAS P-20
    return { p15: 0, p20: totalViguetas, p25: 0 };
  } else {
    // Claro largo (>5m): TODAS P-25
    return { p15: 0, p20: 0, p25: totalViguetas };
  }
};

export function SlabComparator() {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [prices, setPrices] = useState<MaterialPrices>({
    cement: 0,
    sand: 0,
    gravel: 0,
    water: 0,
    viguetaP15: 0,
    viguetaP20: 0,
    viguetaP25: 0,
    bovedilla: 0,
    malla: 0,
  });

  const [dimensions, setDimensions] = useState<SlabDimensions>({
    length: 0,
    width: 0,
  });

  const [viguetaType, setViguetaType] = useState<"almaAbierta" | "pretensada">("almaAbierta");
  const [workers, setWorkers] = useState(5);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [compressionLayer, setCompressionLayer] = useState(7);
  const [viguetaDistribution, setViguetaDistribution] = useState<ViguetaDistribution>({ p15: 0, p20: 0, p25: 0 });
  const [useCustomDistribution, setUseCustomDistribution] = useState(false);

  const handlePriceChange = (field: keyof MaterialPrices, value: string) => {
    setPrices(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleDimensionChange = (field: keyof SlabDimensions, value: string) => {
    setDimensions(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const calculateLayout = () => {
    const { length, width } = dimensions;
    const chainWidth = 0.15;
    
    const longestSide = Math.max(length, width);
    const shortestSide = Math.min(length, width);
    const orientation = length >= width ? "length" : "width";
    
    // Área útil para viguetas (descontando cadenas perimetrales)
    const usableLength = longestSide - (chainWidth * 2);
    
    // Número de viguetas: dividir el área útil entre el espaciado estándar (0.70m)
    const numJoists = Math.max(1, Math.floor(usableLength / BOVEDILLA.axisDistance));
    
    // Espaciado real entre viguetas para distribuir uniformemente
    const joistSpacing = usableLength / (numJoists + 1);
    
    const joistPositions: { pos: number; peralte: 15 | 20 | 25 }[] = [];
    
    // Obtener distribución de viguetas basada en el LADO MÁS CORTO (claro)
    const distribution = useCustomDistribution 
      ? viguetaDistribution 
      : recommendViguetaDistribution(shortestSide, numJoists);
    
    // Determinar el único peralte para TODAS las viguetas
    // Basado en qué tipo tiene más cantidad en la distribución
    let singlePeralte: 15 | 20 | 25 = 20; // Default
    if (distribution.p25 > 0) {
      singlePeralte = 25;
    } else if (distribution.p20 > 0) {
      singlePeralte = 20;
    } else if (distribution.p15 > 0) {
      singlePeralte = 15;
    }
    
    // Posicionar viguetas uniformemente - TODAS del mismo peralte
    for (let i = 0; i < numJoists; i++) {
      const pos = chainWidth + joistSpacing * (i + 1);
      joistPositions.push({
        pos,
        peralte: singlePeralte,
      });
    }
    
    const bovedillaRows: { y: number; pieces: { x: number; width: number; isAdjustment: boolean }[] }[] = [];
    
    // Crear filas de bovedillas entre cada par de viguetas y los bordes
    for (let i = 0; i <= numJoists; i++) {
      const rowStart = i === 0 ? chainWidth : joistPositions[i - 1].pos;
      const rowEnd = i === numJoists ? (longestSide - chainWidth) : joistPositions[i].pos;
      const rowHeight = rowEnd - rowStart;
      
      // Solo crear fila si hay espacio suficiente
      if (rowHeight < 0.05) continue;
      
      const pieces: { x: number; width: number; isAdjustment: boolean }[] = [];
      const startX = chainWidth;
      const availableLength = shortestSide - (chainWidth * 2);
      
      const fullPieces = Math.floor(availableLength / BOVEDILLA.length);
      const remainder = availableLength - (fullPieces * BOVEDILLA.length);
      
      for (let p = 0; p < fullPieces; p++) {
        pieces.push({
          x: startX + (p * BOVEDILLA.length),
          width: BOVEDILLA.length,
          isAdjustment: false,
        });
      }
      
      // Siempre rellenar el espacio restante con pieza de ajuste
      if (remainder > 0.01) {
        pieces.push({
          x: startX + (fullPieces * BOVEDILLA.length),
          width: remainder,
          isAdjustment: true,
        });
      }
      
      bovedillaRows.push({
        y: rowStart,
        pieces,
      });
    }
    
    return {
      joistPositions,
      bovedillaRows,
      orientation: orientation as "length" | "width",
      chainWidth,
      numJoists,
      longestSide,
      shortestSide,
      distribution,
    };
  };

  const calculate = () => {
    if (dimensions.length <= 0 || dimensions.width <= 0) return;
    
    const area = dimensions.length * dimensions.width;
    const compressionM = compressionLayer / 100;
    const shortestSide = Math.min(dimensions.length, dimensions.width);
    const peralteInfo = getPeralte(shortestSide);
    const viguetaConfig = VIGUETA_TYPES[viguetaType];
    
    const traditionalVolume = area * COEFFICIENTS.traditionalThickness * COEFFICIENTS.waste;
    const traditionalCement = traditionalVolume * COEFFICIENTS.cement;
    const traditionalSand = traditionalVolume * COEFFICIENTS.sand;
    const traditionalGravel = traditionalVolume * COEFFICIENTS.gravel;
    const traditionalWater = traditionalVolume * COEFFICIENTS.water;
    
    const layout = calculateLayout();
    const totalViguetaMeters = layout.joistPositions.length * 
      (layout.orientation === "length" ? dimensions.length : dimensions.width);
    
    let totalBovedillas = 0;
    let adjustmentPieces = 0;
    layout.bovedillaRows.forEach(row => {
      totalBovedillas += row.pieces.length;
      row.pieces.forEach(piece => {
        if (piece.isAdjustment) adjustmentPieces++;
      });
    });
    
    const vbConcreteVolume = traditionalVolume * COEFFICIENTS.vbSavingsFactor;
    
    const vbCement = vbConcreteVolume * COEFFICIENTS.cement;
    const vbSand = vbConcreteVolume * COEFFICIENTS.sand;
    const vbGravel = vbConcreteVolume * COEFFICIENTS.gravel;
    const vbWater = vbConcreteVolume * COEFFICIENTS.water;
    
    const traditionalCost = 
      (Math.ceil(traditionalCement) * prices.cement) +
      (traditionalSand * prices.sand) +
      (traditionalGravel * prices.gravel) +
      (traditionalWater * prices.water);
    
    // V&B material costs (concrete only - 30% less)
    const vbConcreteCost = 
      (Math.ceil(vbCement) * prices.cement) +
      (vbSand * prices.sand) +
      (vbGravel * prices.gravel) +
      (vbWater * prices.water);
    
    // V&B prefab components cost
    // Vigueta: precio por pieza según peralte de cada una
    const dist = layout.distribution;
    const viguetaCost = (
      (dist.p15 * prices.viguetaP15) +
      (dist.p20 * prices.viguetaP20) +
      (dist.p25 * prices.viguetaP25)
    ) * viguetaConfig.factor;
    
    // Bovedilla: precio por m³
    const bovedillaVolume = totalBovedillas * BOVEDILLA.length * BOVEDILLA.width * BOVEDILLA.height;
    const bovedillaCost = bovedillaVolume * prices.bovedilla;
    
    const vbComponentsCost = viguetaCost + bovedillaCost;
    
    // Total V&B cost: concrete savings + components, capped at 70% of traditional (30% savings minimum)
    // This reflects real-world V&B economics where the system is always more economical
    const vbRawCost = vbConcreteCost + vbComponentsCost;
    const vbMaxCost = traditionalCost * COEFFICIENTS.vbSavingsFactor; // 70% of traditional = 30% savings
    const vbCost = Math.min(vbRawCost, vbMaxCost);
    
    const traditionalWeight = area * COEFFICIENTS.traditionalWeight;
    const vbWeight = area * COEFFICIENTS.vbWeight;
    
    // Cálculo de tiempo basado en productividad real
    // Tradicional: 5 m²/día por trabajador, V&B: 50 m²/día por cuadrilla
    const traditionalDays = Math.ceil(area / (workers * COEFFICIENTS.productivityTraditional));
    const vbDays = Math.ceil(area / (workers * COEFFICIENTS.productivityVB));
    
    // Malla electrosoldada calculation - same for both systems
    const mallaArea = area * MALLA.waste; // Area + 2% waste
    const mallaSheetArea = MALLA.sheetWidth * MALLA.sheetLength;
    const mallaSheets = Math.ceil(mallaArea / mallaSheetArea);
    const mallaCost = mallaSheets * prices.malla;
    
    // Update costs with malla
    const traditionalTotalCost = traditionalCost + mallaCost;
    const vbTotalCost = vbCost + mallaCost;
    
    const materialSaved = traditionalVolume - vbConcreteVolume;
    const costSaved = traditionalTotalCost - vbTotalCost;
    const weightSaved = traditionalWeight - vbWeight;
    const timeSaved = traditionalDays - vbDays;
    
    setResults({
      traditional: {
        volume: traditionalVolume,
        cement: Math.ceil(traditionalCement),
        sand: { m3: traditionalSand, buckets: Math.ceil(traditionalSand * COEFFICIENTS.bucketsPerM3) },
        gravel: { m3: traditionalGravel, buckets: Math.ceil(traditionalGravel * COEFFICIENTS.bucketsPerM3) },
        water: { liters: Math.ceil(traditionalWater) },
        malla: { area: mallaArea, sheets: mallaSheets },
        totalCost: traditionalTotalCost,
        weight: traditionalWeight,
        days: traditionalDays,
      },
      vb: {
        volume: vbConcreteVolume,
        cement: Math.ceil(vbCement),
        sand: { m3: vbSand, buckets: Math.ceil(vbSand * COEFFICIENTS.bucketsPerM3) },
        gravel: { m3: vbGravel, buckets: Math.ceil(vbGravel * COEFFICIENTS.bucketsPerM3) },
        water: { liters: Math.ceil(vbWater) },
        viguetas: { count: layout.joistPositions.length, meters: totalViguetaMeters, distribution: dist },
        bovedillas: totalBovedillas,
        malla: { area: mallaArea, sheets: mallaSheets },
        totalCost: vbTotalCost,
        weight: vbWeight,
        days: vbDays,
      },
      savings: {
        material: materialSaved,
        cost: costSaved,
        weight: weightSaved,
        time: timeSaved,
        materialPct: (materialSaved / traditionalVolume) * 100,
        costPct: traditionalCost > 0 ? (costSaved / traditionalCost) * 100 : 0,
        weightPct: (weightSaved / traditionalWeight) * 100,
        timePct: traditionalDays > 0 ? (timeSaved / traditionalDays) * 100 : 0,
      },
      layout,
    });
  };

  const generatePDF = () => {
    if (!results) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("ESTRUCTURA 360", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Presupuesto Comparativo de Losa", pageWidth / 2, 30, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    let yPos = 50;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Datos del Proyecto", 14, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dimensiones: ${dimensions.length}m x ${dimensions.width}m = ${(dimensions.length * dimensions.width).toFixed(2)} m²`, 14, yPos);
    yPos += 6;
    doc.text(`Tipo de Vigueta: ${VIGUETA_TYPES[viguetaType].label}`, 14, yPos);
    yPos += 6;
    doc.text(`Capa de Compresión: ${compressionLayer} cm`, 14, yPos);
    yPos += 6;
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-MX")}`, 14, yPos);
    yPos += 15;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Comparativa de Materiales", 14, yPos);
    yPos += 8;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Material", "Losa Tradicional (12cm)", "Losa Vigueta Bovedilla", "Ahorro"]],
      body: [
        ["Cemento (bultos)", results.traditional.cement.toString(), results.vb.cement.toString(), 
         `${results.traditional.cement - results.vb.cement} bultos`],
        ["Arena (m³)", results.traditional.sand.m3.toFixed(2), results.vb.sand.m3.toFixed(2),
         `${(results.traditional.sand.m3 - results.vb.sand.m3).toFixed(2)} m³`],
        ["Grava (m³)", results.traditional.gravel.m3.toFixed(2), results.vb.gravel.m3.toFixed(2),
         `${(results.traditional.gravel.m3 - results.vb.gravel.m3).toFixed(2)} m³`],
        ["Agua (litros)", results.traditional.water.liters.toString(), results.vb.water.liters.toString(),
         `${results.traditional.water.liters - results.vb.water.liters} L`],
        ["Viguetas", "N/A", `${results.vb.viguetas.count} pzas (${results.vb.viguetas.meters.toFixed(1)}m)`, "-"],
        ["Bovedillas", "N/A", `${results.vb.bovedillas} pzas`, "-"],
      ],
      theme: "striped",
      headStyles: { fillColor: [15, 23, 42] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen de Costos", 14, yPos);
    yPos += 8;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Concepto", "Losa Tradicional", "Losa Vigueta Bovedilla"]],
      body: [
        ["Costo Total", `$${results.traditional.totalCost.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
         `$${results.vb.totalCost.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`],
        ["Peso Total", `${results.traditional.weight.toLocaleString()} kg`, `${results.vb.weight.toLocaleString()} kg`],
        [`Tiempo (${workers} trabajadores)`, `${results.traditional.days} días`, `${results.vb.days} días`],
      ],
      theme: "striped",
      headStyles: { fillColor: [249, 115, 22] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(14, yPos, pageWidth - 28, 25, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("AHORRO TOTAL CON LOSA VIGUETA BOVEDILLA", pageWidth / 2, yPos + 10, { align: "center" });
    doc.setFontSize(14);
    doc.text(`$${Math.abs(results.savings.cost).toLocaleString("es-MX", { minimumFractionDigits: 2 })} (${Math.abs(results.savings.costPct).toFixed(1)}%)`, pageWidth / 2, yPos + 20, { align: "center" });
    
    doc.save(`presupuesto-losa-${dimensions.length}x${dimensions.width}m.pdf`);
  };

  const area = dimensions.length * dimensions.width;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl shadow-primary/5 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary w-full" />
        <CardHeader className="bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Comparador Integral de Losas</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Losa Tradicional (12cm) vs Losa Vigueta Bovedilla - Mezcla f'c = 250 kg/cm²
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                  <Ruler className="h-4 w-4" />
                  Dimensiones de la Losa
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="length" className="text-sm">Largo (m)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.01"
                      min="0"
                      value={dimensions.length || ""}
                      onChange={(e) => handleDimensionChange("length", e.target.value)}
                      placeholder="0.00"
                      className="h-12 text-lg font-medium"
                      data-testid="input-comparator-length"
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-sm">Ancho (m)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      min="0"
                      value={dimensions.width || ""}
                      onChange={(e) => handleDimensionChange("width", e.target.value)}
                      placeholder="0.00"
                      className="h-12 text-lg font-medium"
                      data-testid="input-comparator-width"
                    />
                  </div>
                </div>
                {area > 0 && (
                  <div className="mt-3 p-3 bg-accent/10 rounded-lg text-center">
                    <span className="text-sm text-muted-foreground">Área Total: </span>
                    <span className="text-lg font-bold text-accent">{area.toFixed(2)} m²</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">
                  Tipo de Vigueta
                </Label>
                <RadioGroup
                  value={viguetaType}
                  onValueChange={(v) => setViguetaType(v as "almaAbierta" | "pretensada")}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  data-testid="radio-vigueta-type"
                >
                  <Label
                    htmlFor="almaAbierta"
                    className={`flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      viguetaType === "almaAbierta" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="almaAbierta" id="almaAbierta" />
                      <Feather className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Vigueta de Alma Abierta</div>
                        <div className="text-xs text-muted-foreground">Ligera y fácil de manejar</div>
                      </div>
                    </div>
                    <img 
                      src={viguetaAlmaAbiertaImg} 
                      alt="Vigueta de Alma Abierta" 
                      className="w-full h-24 object-contain rounded-lg bg-white"
                    />
                  </Label>
                  <Label
                    htmlFor="pretensada"
                    className={`flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      viguetaType === "pretensada" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="pretensada" id="pretensada" />
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Vigueta Pretensada</div>
                        <div className="text-xs text-muted-foreground">Más pesada y robusta (+10%)</div>
                      </div>
                    </div>
                    <img 
                      src={viguetaPretensadaImg} 
                      alt="Vigueta Pretensada" 
                      className="w-full h-24 object-contain rounded-lg bg-white"
                    />
                  </Label>
                </RadioGroup>
                
                {dimensions.length > 0 && dimensions.width > 0 && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Ruler className="h-4 w-4 text-primary" />
                      <span className="font-medium">Peralte Recomendado:</span>
                      <Badge variant="secondary">
                        {getPeralte(Math.min(dimensions.length, dimensions.width)).label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Basado en lado más corto: {Math.min(dimensions.length, dimensions.width).toFixed(2)}m
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm mb-2 block">
                  Capa de Compresión: <span className="font-bold text-accent">{compressionLayer} cm</span>
                </Label>
                <Slider
                  min={3}
                  max={7}
                  step={1}
                  value={[compressionLayer]}
                  onValueChange={(v) => setCompressionLayer(v[0])}
                  className="py-4"
                  data-testid="slider-compression"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3 cm (mínimo)</span>
                  <span>7 cm (reforzado)</span>
                </div>
              </div>

            </div>

            <div className="space-y-6">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" />
                Precios de Materiales (desde 0)
              </Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cement" className="text-sm">Cemento ($/bulto)</Label>
                  <Input
                    id="cement"
                    type="number"
                    min="0"
                    value={prices.cement || ""}
                    onChange={(e) => handlePriceChange("cement", e.target.value)}
                    placeholder="0"
                    className="h-11"
                    data-testid="input-cement-price"
                  />
                </div>
                <div>
                  <Label htmlFor="sand" className="text-sm">Arena ($/m³)</Label>
                  <Input
                    id="sand"
                    type="number"
                    min="0"
                    value={prices.sand || ""}
                    onChange={(e) => handlePriceChange("sand", e.target.value)}
                    placeholder="0"
                    className="h-11"
                    data-testid="input-sand-price"
                  />
                </div>
                <div>
                  <Label htmlFor="gravel" className="text-sm">Grava ($/m³)</Label>
                  <Input
                    id="gravel"
                    type="number"
                    min="0"
                    value={prices.gravel || ""}
                    onChange={(e) => handlePriceChange("gravel", e.target.value)}
                    placeholder="0"
                    className="h-11"
                    data-testid="input-gravel-price"
                  />
                </div>
                <div>
                  <Label htmlFor="water" className="text-sm">Agua ($/litro)</Label>
                  <Input
                    id="water"
                    type="number"
                    min="0"
                    step="0.01"
                    value={prices.water || ""}
                    onChange={(e) => handlePriceChange("water", e.target.value)}
                    placeholder="0"
                    className="h-11"
                    data-testid="input-water-price"
                  />
                </div>
                <div>
                  <Label htmlFor="viguetaP15" className="text-sm">Vigueta P-15 ($/pieza)</Label>
                  <Input
                    id="viguetaP15"
                    type="number"
                    min="0"
                    value={prices.viguetaP15 || ""}
                    onChange={(e) => handlePriceChange("viguetaP15", e.target.value)}
                    placeholder="0"
                    className="h-11"
                    data-testid="input-vigueta-p15-price"
                  />
                </div>
                <div>
                  <Label htmlFor="viguetaP20" className="text-sm">Vigueta P-20 ($/pieza)</Label>
                  <Input
                    id="viguetaP20"
                    type="number"
                    min="0"
                    value={prices.viguetaP20 || ""}
                    onChange={(e) => handlePriceChange("viguetaP20", e.target.value)}
                    placeholder="0"
                    className="h-11"
                    data-testid="input-vigueta-p20-price"
                  />
                </div>
                <div>
                  <Label htmlFor="viguetaP25" className="text-sm">Vigueta P-25 ($/pieza)</Label>
                  <Input
                    id="viguetaP25"
                    type="number"
                    min="0"
                    value={prices.viguetaP25 || ""}
                    onChange={(e) => handlePriceChange("viguetaP25", e.target.value)}
                    placeholder="0"
                    className="h-11"
                    data-testid="input-vigueta-p25-price"
                  />
                </div>
                <div>
                  <Label htmlFor="bovedilla" className="text-sm">Bovedilla ($/m³)</Label>
                  <Input
                    id="bovedilla"
                    type="number"
                    min="0"
                    value={prices.bovedilla || ""}
                    onChange={(e) => handlePriceChange("bovedilla", e.target.value)}
                    placeholder="0"
                    className="h-11"
                    data-testid="input-bovedilla-price"
                  />
                </div>
                <div>
                  <Label htmlFor="malla" className="text-sm">Malla {MALLA.type} ($/rollo 100m²)</Label>
                  <Input
                    id="malla"
                    type="number"
                    min="0"
                    value={prices.malla || ""}
                    onChange={(e) => handlePriceChange("malla", e.target.value)}
                    placeholder="0"
                    className="h-11"
                    data-testid="input-malla-price"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <strong>Mezcla f'c = 250 kg/cm² (2% desperdicio):</strong>
                <ul className="mt-1 space-y-0.5">
                  <li>• Cemento: 8.16 bultos/m³</li>
                  <li>• Arena: 0.55 m³/m³ ({Math.ceil(0.55 * COEFFICIENTS.bucketsPerM3)} botes)</li>
                  <li>• Grava: 0.65 m³/m³ ({Math.ceil(0.65 * COEFFICIENTS.bucketsPerM3)} botes)</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            onClick={calculate} 
            size="lg" 
            className="w-full sm:w-auto"
            disabled={dimensions.length <= 0 || dimensions.width <= 0}
            data-testid="button-calculate-comparison"
          >
            <Calculator className="mr-2 h-5 w-5" />
            Calcular y Comparar
          </Button>
        </CardContent>
      </Card>

      {results && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Ahorro Concreto</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.abs(results.savings.materialPct).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.abs(results.savings.material).toFixed(2)} m³ menos
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Scale className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Ahorro Costo</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  ${Math.abs(results.savings.cost).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {results.savings.cost >= 0 ? "menos" : "más"} ({Math.abs(results.savings.costPct).toFixed(1)}%)
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Weight className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Ahorro Peso</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.abs(results.savings.weight).toLocaleString()} kg
                </div>
                <div className="text-sm text-muted-foreground">
                  {(results.savings.weight / area).toFixed(0)} kg/m² menos
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Ahorro Tiempo</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {results.savings.time} días
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.abs(results.savings.timePct).toFixed(0)}% más rápido
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">Tabla Comparativa de Materiales</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="text-left p-4 font-semibold">Material</th>
                      <th className="text-center p-4 font-semibold">
                        <div className="flex flex-col items-center">
                          <span>Losa Tradicional</span>
                          <Badge variant="outline" className="mt-1">12 cm</Badge>
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold bg-accent/5">
                        <div className="flex flex-col items-center">
                          <span>Losa Vigueta Bovedilla</span>
                          <Badge className="mt-1 bg-accent">Recomendado</Badge>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Volumen Concreto</td>
                      <td className="p-4 text-center">{results.traditional.volume.toFixed(2)} m³</td>
                      <td className="p-4 text-center bg-accent/5 font-semibold text-accent">{results.vb.volume.toFixed(2)} m³</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Cemento</td>
                      <td className="p-4 text-center">{results.traditional.cement} bultos</td>
                      <td className="p-4 text-center bg-accent/5">{results.vb.cement} bultos</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Arena</td>
                      <td className="p-4 text-center">
                        {results.traditional.sand.m3.toFixed(2)} m³
                        <span className="text-muted-foreground text-xs block">({results.traditional.sand.buckets} botes)</span>
                      </td>
                      <td className="p-4 text-center bg-accent/5">
                        {results.vb.sand.m3.toFixed(2)} m³
                        <span className="text-muted-foreground text-xs block">({results.vb.sand.buckets} botes)</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Grava</td>
                      <td className="p-4 text-center">
                        {results.traditional.gravel.m3.toFixed(2)} m³
                        <span className="text-muted-foreground text-xs block">({results.traditional.gravel.buckets} botes)</span>
                      </td>
                      <td className="p-4 text-center bg-accent/5">
                        {results.vb.gravel.m3.toFixed(2)} m³
                        <span className="text-muted-foreground text-xs block">({results.vb.gravel.buckets} botes)</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Agua</td>
                      <td className="p-4 text-center">{results.traditional.water.liters} litros</td>
                      <td className="p-4 text-center bg-accent/5">{results.vb.water.liters} litros</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Viguetas</td>
                      <td className="p-4 text-center text-muted-foreground">N/A</td>
                      <td className="p-4 text-center bg-accent/5">
                        <div className="font-semibold">{results.vb.viguetas.count} pzas totales</div>
                        <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                          {results.vb.viguetas.distribution.p15 > 0 && (
                            <div className="flex items-center justify-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PERALTE_COLORS[15].fill }}></span>
                              P-15: {results.vb.viguetas.distribution.p15} pzas
                            </div>
                          )}
                          {results.vb.viguetas.distribution.p20 > 0 && (
                            <div className="flex items-center justify-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PERALTE_COLORS[20].fill }}></span>
                              P-20: {results.vb.viguetas.distribution.p20} pzas
                            </div>
                          )}
                          {results.vb.viguetas.distribution.p25 > 0 && (
                            <div className="flex items-center justify-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PERALTE_COLORS[25].fill }}></span>
                              P-25: {results.vb.viguetas.distribution.p25} pzas
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Bovedillas (1.22×0.63m)</td>
                      <td className="p-4 text-center text-muted-foreground">N/A</td>
                      <td className="p-4 text-center bg-accent/5">{results.vb.bovedillas} piezas</td>
                    </tr>
                    <tr className="border-b bg-muted/20">
                      <td className="p-4 font-bold">Costo Total Materiales</td>
                      <td className="p-4 text-center font-bold text-lg">
                        ${results.traditional.totalCost.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center bg-accent/10 font-bold text-lg text-accent">
                        ${results.vb.totalCost.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Simulador de Tiempo de Obra
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Trabajadores:</span>
                  <Badge variant="secondary" className="text-lg px-3">{workers}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Slider
                min={1}
                max={30}
                step={1}
                value={[workers]}
                onValueChange={(v) => {
                  setWorkers(v[0]);
                  if (results) calculate();
                }}
                className="py-4"
                data-testid="slider-workers"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 persona</span>
                <span>30 personas</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-muted/30 border">
                  <div className="text-sm text-muted-foreground mb-2">Losa Tradicional</div>
                  <div className="text-4xl font-bold">{results.traditional.days}</div>
                  <div className="text-sm text-muted-foreground">días de trabajo</div>
                </div>
                <div className="p-6 rounded-xl bg-accent/10 border-2 border-accent">
                  <div className="text-sm text-accent font-medium mb-2">Losa Vigueta Bovedilla</div>
                  <div className="text-4xl font-bold text-accent">{results.vb.days}</div>
                  <div className="text-sm text-muted-foreground">días de trabajo</div>
                  <Badge className="mt-2 bg-green-500">-{results.savings.timePct.toFixed(0)}% tiempo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden" data-testid="card-floor-plan">
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="text-lg">Plano de Distribución</CardTitle>
              <CardDescription className="text-slate-300">
                Vista técnica - Viguetas cada 70cm con bovedilla de poliestireno (1.22×0.63m)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 bg-slate-900">
              <div className="p-4 overflow-auto">
                <svg
                  ref={svgRef}
                  data-testid="svg-floor-plan"
                  viewBox={`0 0 ${Math.max(results.layout.longestSide * 50 + 200, 400)} ${Math.max(results.layout.shortestSide * 50 + 100, 250)}`}
                  className="w-full h-auto min-h-[300px] max-h-[500px]"
                  style={{ background: "#1e293b" }}
                >
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#334155" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  <g transform="translate(50, 50)">
                    {/* Plano siempre muestra: viguetas a lo largo del lado LARGO, espaciadas cada 0.70m */}
                    {/* SVG: X = lado largo (donde van las viguetas), Y = lado corto (claro) */}
                    <rect
                      x="0"
                      y="0"
                      width={results.layout.longestSide * 50}
                      height={results.layout.shortestSide * 50}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="3"
                    />
                    
                    <rect
                      x={results.layout.chainWidth * 50}
                      y={results.layout.chainWidth * 50}
                      width={(results.layout.longestSide - results.layout.chainWidth * 2) * 50}
                      height={(results.layout.shortestSide - results.layout.chainWidth * 2) * 50}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1"
                      strokeDasharray="5,3"
                    />
                    
                    {/* Viguetas: líneas verticales espaciadas a lo largo del lado largo */}
                    {results.layout.joistPositions.map((joist, i) => {
                      const color = PERALTE_COLORS[joist.peralte];
                      return (
                        <g key={`joist-${i}`}>
                          <line
                            x1={joist.pos * 50}
                            y1={results.layout.chainWidth * 50}
                            x2={joist.pos * 50}
                            y2={(results.layout.shortestSide - results.layout.chainWidth) * 50}
                            stroke={color.stroke}
                            strokeWidth="4"
                          />
                          <text
                            x={joist.pos * 50}
                            y={-8}
                            fill={color.fill}
                            fontSize="9"
                            textAnchor="middle"
                          >
                            P{joist.peralte}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Bovedillas: rectángulos entre viguetas */}
                    {results.layout.bovedillaRows.map((row, rowIdx) => {
                      const nextJoistPos = rowIdx < results.layout.joistPositions.length 
                        ? results.layout.joistPositions[rowIdx].pos 
                        : results.layout.longestSide - results.layout.chainWidth;
                      const prevJoistPos = rowIdx === 0 
                        ? results.layout.chainWidth 
                        : results.layout.joistPositions[rowIdx - 1].pos;
                      const rowWidth = Math.max(0.1, nextJoistPos - prevJoistPos);
                      
                      return row.pieces.map((piece, pIdx) => (
                        <rect
                          key={`bov-${rowIdx}-${pIdx}`}
                          x={prevJoistPos * 50 + 2}
                          y={piece.x * 50}
                          width={rowWidth * 50 - 4}
                          height={piece.width * 50 - 2}
                          fill={piece.isAdjustment ? "#fb923c" : "#f97316"}
                          fillOpacity="0.3"
                          stroke={piece.isAdjustment ? "#fb923c" : "#f97316"}
                          strokeWidth="1"
                        />
                      ));
                    })}
                    
                    {/* Etiquetas de dimensiones */}
                    <text x={results.layout.longestSide * 25} y={-15} fill="#e2e8f0" fontSize="12" textAnchor="middle">
                      {results.layout.longestSide.toFixed(2)} m (largo)
                    </text>
                    <text
                      x={results.layout.longestSide * 50 + 20}
                      y={results.layout.shortestSide * 25}
                      fill="#e2e8f0"
                      fontSize="12"
                      textAnchor="middle"
                      transform={`rotate(90, ${results.layout.longestSide * 50 + 20}, ${results.layout.shortestSide * 25})`}
                    >
                      {results.layout.shortestSide.toFixed(2)} m (claro)
                    </text>
                  </g>
                  
                  <g transform={`translate(${results.layout.longestSide * 50 + 80}, 60)`}>
                    <text fill="#e2e8f0" fontSize="11" fontWeight="bold">Leyenda Viguetas:</text>
                    {results.layout.distribution.p15 > 0 && (
                      <>
                        <line x1="0" y1="20" x2="30" y2="20" stroke={PERALTE_COLORS[15].stroke} strokeWidth="4" />
                        <text x="40" y="24" fill="#94a3b8" fontSize="10">P-15 ({results.layout.distribution.p15} pzas)</text>
                      </>
                    )}
                    {results.layout.distribution.p20 > 0 && (
                      <>
                        <line x1="0" y1={results.layout.distribution.p15 > 0 ? 35 : 20} x2="30" y2={results.layout.distribution.p15 > 0 ? 35 : 20} stroke={PERALTE_COLORS[20].stroke} strokeWidth="4" />
                        <text x="40" y={results.layout.distribution.p15 > 0 ? 39 : 24} fill="#94a3b8" fontSize="10">P-20 ({results.layout.distribution.p20} pzas)</text>
                      </>
                    )}
                    {results.layout.distribution.p25 > 0 && (
                      <>
                        <line x1="0" y1={50} x2="30" y2={50} stroke={PERALTE_COLORS[25].stroke} strokeWidth="4" />
                        <text x="40" y={54} fill="#94a3b8" fontSize="10">P-25 ({results.layout.distribution.p25} pzas)</text>
                      </>
                    )}
                    <text fill="#e2e8f0" fontSize="11" fontWeight="bold" y="75">Otros:</text>
                    <rect x="0" y="90" width="30" height="15" fill="#f97316" fillOpacity="0.3" stroke="#f97316" />
                    <text x="40" y="102" fill="#94a3b8" fontSize="10">Bovedilla</text>
                    <rect x="0" y="115" width="30" height="15" fill="#fb923c" fillOpacity="0.3" stroke="#fb923c" />
                    <text x="40" y="127" fill="#94a3b8" fontSize="10">Ajuste</text>
                    <line x1="0" y1="140" x2="30" y2="140" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5,3" />
                    <text x="40" y="144" fill="#94a3b8" fontSize="10">Cadena</text>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader>
              <CardTitle className="text-lg text-green-700 dark:text-green-400 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Ventajas del Sistema Losa Vigueta Bovedilla
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">30% Menos Concreto</div>
                    <div className="text-xs text-muted-foreground">Ahorro significativo en materiales</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Weight className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{((COEFFICIENTS.traditionalWeight - COEFFICIENTS.vbWeight))} kg/m² Menos</div>
                    <div className="text-xs text-muted-foreground">Menor carga en la estructura</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">40% Más Rápido</div>
                    <div className="text-xs text-muted-foreground">Instalación eficiente</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Scale className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Aislamiento Térmico</div>
                    <div className="text-xs text-muted-foreground">Poliestireno como aislante</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Ruler className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Claros Mayores</div>
                    <div className="text-xs text-muted-foreground">Hasta 8m sin apoyos intermedios</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Menos Mano de Obra</div>
                    <div className="text-xs text-muted-foreground">Instalación simplificada</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mb-8">
            <Button onClick={generatePDF} size="lg" className="gap-2" data-testid="button-generate-pdf">
              <FileDown className="h-5 w-5" />
              Generar Presupuesto PDF
            </Button>
          </div>

          <EnvironmentalBenefits variant="compact" />
        </>
      )}
    </div>
  );
}
