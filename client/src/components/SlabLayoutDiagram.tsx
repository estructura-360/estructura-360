import { LayoutResult } from "@/lib/layoutPlanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ruler, Layers, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SlabLayoutDiagramProps {
  layout: LayoutResult;
  length: number;
  width: number;
}

const PERALTE_COLORS = {
  15: { stroke: "#22d3ee", fill: "#22d3ee", label: "P-15 (Cian)" },
  20: { stroke: "#a855f7", fill: "#a855f7", label: "P-20 (Violeta)" },
  25: { stroke: "#f43f5e", fill: "#f43f5e", label: "P-25 (Rosa)" },
};

const getPeralte = (shortestSide: number): { peralte: 15 | 20 | 25; label: string } => {
  if (shortestSide <= 4) return { peralte: 15, label: "Peralte 15 cm" };
  if (shortestSide <= 5) return { peralte: 20, label: "Peralte 20 cm" };
  return { peralte: 25, label: "Peralte 25 cm" };
};

export function SlabLayoutDiagram({ layout, length: lengthProp, width: widthProp }: SlabLayoutDiagramProps) {
  const length = Number(lengthProp) || 1;
  const width = Number(widthProp) || 1;
  
  const longestSide = Math.max(length, width);
  const shortestSide = Math.min(length, width);
  const { peralte, label: peralteLabel } = getPeralte(shortestSide);
  const peralteColor = PERALTE_COLORS[peralte];
  
  const BOVEDILLA = {
    length: 1.22,
    width: 0.63,
  };
  
  const scale = 50;
  const padding = 80;
  const legendWidth = 180;
  const svgWidth = Math.max(longestSide * scale + padding * 2 + legendWidth, 500);
  const svgHeight = Math.max(shortestSide * scale + padding * 2, 350);
  
  const usableLength = longestSide - 0.30;
  const numJoists = Math.floor(usableLength / 0.70);
  const joistSpacing = usableLength / numJoists;
  
  const joistPositions: number[] = [];
  for (let i = 0; i < numJoists; i++) {
    joistPositions.push(0.15 + joistSpacing * (i + 0.5));
  }
  
  const usableWidth = shortestSide - 0.30;
  const numBovedillasPerRow = Math.ceil(usableWidth / BOVEDILLA.width);
  
  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-accent to-primary" />
      <CardHeader className="pb-4 bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
            <Layers className="h-5 w-5 text-cyan-400" />
            Plano de Distribución Automático
          </CardTitle>
          <Badge 
            className="w-fit text-white"
            style={{ backgroundColor: peralteColor.stroke }}
          >
            {peralteLabel}
          </Badge>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Vista técnica - Viguetas cada 70cm con bovedilla de poliestireno (1.22×0.63m)
        </p>
      </CardHeader>
      <CardContent className="p-0 bg-slate-900">
        <div className="p-4 overflow-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-h-[300px] max-h-[500px]"
            style={{ background: "#1e293b" }}
            data-testid="svg-floor-plan-losa"
          >
            <defs>
              <pattern id="grid-losa-peralte" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#334155" strokeWidth="0.5" />
              </pattern>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#grid-losa-peralte)" />
            
            <g transform={`translate(${padding}, ${padding})`}>
              <rect
                x="0"
                y="0"
                width={longestSide * scale}
                height={shortestSide * scale}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="3"
              />
              
              <rect
                x={0.15 * scale}
                y={0.15 * scale}
                width={(longestSide - 0.30) * scale}
                height={(shortestSide - 0.30) * scale}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1"
                strokeDasharray="5,3"
              />
              
              {joistPositions.map((xPos, i) => {
                const bovedillaX = i === 0 ? 0.15 : joistPositions[i - 1];
                const bovedillaWidth = xPos - bovedillaX;
                
                return (
                  <g key={`row-${i}`}>
                    {Array.from({ length: numBovedillasPerRow }).map((_, bIdx) => {
                      const yStart = 0.15 + bIdx * BOVEDILLA.width;
                      const remainingHeight = shortestSide - 0.30 - bIdx * BOVEDILLA.width;
                      const actualHeight = Math.min(BOVEDILLA.width, remainingHeight);
                      const isAdjustment = actualHeight < BOVEDILLA.width * 0.95;
                      
                      if (actualHeight <= 0) return null;
                      
                      return (
                        <rect
                          key={`bov-${i}-${bIdx}`}
                          x={bovedillaX * scale + 2}
                          y={yStart * scale + 2}
                          width={bovedillaWidth * scale - 4}
                          height={actualHeight * scale - 4}
                          fill={isAdjustment ? "#fb923c" : "#f97316"}
                          fillOpacity="0.3"
                          stroke={isAdjustment ? "#fb923c" : "#f97316"}
                          strokeWidth="1"
                        />
                      );
                    })}
                  </g>
                );
              })}
              
              {joistPositions.length > 0 && (() => {
                const lastJoistPos = joistPositions[joistPositions.length - 1];
                const lastBovedillaX = lastJoistPos;
                const lastBovedillaWidth = longestSide - 0.15 - lastJoistPos;
                
                return Array.from({ length: numBovedillasPerRow }).map((_, bIdx) => {
                  const yStart = 0.15 + bIdx * BOVEDILLA.width;
                  const remainingHeight = shortestSide - 0.30 - bIdx * BOVEDILLA.width;
                  const actualHeight = Math.min(BOVEDILLA.width, remainingHeight);
                  const isAdjustment = actualHeight < BOVEDILLA.width * 0.95;
                  
                  if (actualHeight <= 0) return null;
                  
                  return (
                    <rect
                      key={`bov-last-${bIdx}`}
                      x={lastBovedillaX * scale + 2}
                      y={yStart * scale + 2}
                      width={lastBovedillaWidth * scale - 4}
                      height={actualHeight * scale - 4}
                      fill={isAdjustment ? "#fb923c" : "#f97316"}
                      fillOpacity="0.3"
                      stroke={isAdjustment ? "#fb923c" : "#f97316"}
                      strokeWidth="1"
                    />
                  );
                });
              })()}
              
              {joistPositions.map((xPos, i) => (
                <g key={`joist-${i}`}>
                  <line
                    x1={xPos * scale}
                    y1={0.15 * scale}
                    x2={xPos * scale}
                    y2={(shortestSide - 0.15) * scale}
                    stroke={peralteColor.stroke}
                    strokeWidth="4"
                  />
                  <text
                    x={xPos * scale}
                    y={-8}
                    fill={peralteColor.stroke}
                    fontSize="9"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    P{peralte}
                  </text>
                </g>
              ))}
              
              <text x={longestSide * scale / 2} y={-20} fill="#e2e8f0" fontSize="12" textAnchor="middle">
                {longestSide.toFixed(2)} m (largo)
              </text>
              <text
                x={longestSide * scale + 20}
                y={shortestSide * scale / 2}
                fill="#e2e8f0"
                fontSize="12"
                textAnchor="middle"
                transform={`rotate(90, ${longestSide * scale + 20}, ${shortestSide * scale / 2})`}
              >
                {shortestSide.toFixed(2)} m (claro)
              </text>
            </g>
            
            <g transform={`translate(${longestSide * scale + padding + 40}, 60)`}>
              <text fill="#e2e8f0" fontSize="11" fontWeight="bold">Leyenda Viguetas:</text>
              <line x1="0" y1="20" x2="30" y2="20" stroke={peralteColor.stroke} strokeWidth="4" />
              <text x="40" y="24" fill="#94a3b8" fontSize="10">
                P-{peralte} ({numJoists} pzas)
              </text>
              
              <text fill="#e2e8f0" fontSize="11" fontWeight="bold" y="50">Otros:</text>
              <rect x="0" y="65" width="30" height="15" fill="#f97316" fillOpacity="0.3" stroke="#f97316" />
              <text x="40" y="77" fill="#94a3b8" fontSize="10">Bovedilla</text>
              <rect x="0" y="90" width="30" height="15" fill="#fb923c" fillOpacity="0.3" stroke="#fb923c" />
              <text x="40" y="102" fill="#94a3b8" fontSize="10">Ajuste</text>
              <line x1="0" y1="115" x2="30" y2="115" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5,3" />
              <text x="40" y="119" fill="#94a3b8" fontSize="10">Cadena</text>
            </g>
          </svg>
        </div>
        
        <div className="p-4 bg-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: peralteColor.stroke }}>{numJoists}</p>
            <p className="text-xs text-slate-400">Viguetas P-{peralte}</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{layout.totalVaults}</p>
            <p className="text-xs text-slate-400">Bovedillas</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{layout.adjustmentPieces}</p>
            <p className="text-xs text-slate-400">Piezas Ajuste</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${layout.wastePercentage > 15 ? 'text-red-400' : 'text-green-400'}`}>
              {layout.wastePercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-400">Desperdicio</p>
          </div>
        </div>
      </CardContent>
      
      <div className="p-4 space-y-2">
        {layout.recommendations.length > 0 && layout.recommendations.map((rec, i) => (
          <div key={i} className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 p-3 rounded-lg">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{rec}</span>
          </div>
        ))}
        
        {layout.wastePercentage <= 10 && (
          <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            <span>Distribución óptima con desperdicio mínimo</span>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
          <Ruler className="h-4 w-4" />
          <span>Claro: {shortestSide.toFixed(2)}m</span>
          <Badge 
            variant="outline" 
            className="font-medium border-2"
            style={{ borderColor: peralteColor.stroke, color: peralteColor.stroke }}
          >
            {peralteLabel}
          </Badge>
        </div>
        
        <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-center font-medium text-primary">
            Resistencia de concreto recomendada: f'c = 250 kg/cm²
          </p>
          <p className="text-xs text-center text-muted-foreground mt-1">
            Para Losa Vigueta Bovedilla con capa de compresión de 4-7 cm
          </p>
        </div>
      </div>
    </Card>
  );
}
