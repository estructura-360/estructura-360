import { LayoutResult } from "@/lib/layoutPlanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ruler, Layers, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SlabLayoutDiagramProps {
  layout: LayoutResult;
  length: number;
  width: number;
}

export function SlabLayoutDiagram({ layout, length: lengthProp, width: widthProp }: SlabLayoutDiagramProps) {
  const length = Number(lengthProp) || 1;
  const width = Number(widthProp) || 1;
  
  const BOVEDILLA = {
    length: 1.22,
    width: 0.63,
  };
  
  const scale = 50;
  const padding = 50;
  const svgWidth = Math.max(length * scale + padding * 2, 400);
  const svgHeight = Math.max(width * scale + padding * 2, 300);
  
  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-accent to-primary" />
      <CardHeader className="pb-4 bg-slate-900">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
          <Layers className="h-5 w-5 text-cyan-400" />
          Plano de Distribución Automático
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 bg-slate-900">
        <div className="p-4 overflow-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-h-[300px] max-h-[500px]"
            style={{ background: "#1e293b" }}
          >
            <defs>
              <pattern id="grid-losa" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#334155" strokeWidth="0.5" />
              </pattern>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#grid-losa)" />
            
            <g transform={`translate(${padding}, ${padding})`}>
              {/* Slab outline */}
              <rect
                x="0"
                y="0"
                width={length * scale}
                height={width * scale}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="3"
              />
              
              {/* Chain perimeter (dashed) */}
              <rect
                x={0.15 * scale}
                y={0.15 * scale}
                width={(length - 0.30) * scale}
                height={(width - 0.30) * scale}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1"
                strokeDasharray="5,3"
              />
              
              {/* Viguetas (cyan lines) */}
              {layout.joistPositions.map((pos, i) => (
                <g key={`joist-${i}`}>
                  {layout.orientation === 'horizontal' ? (
                    <>
                      <line
                        x1={0.15 * scale}
                        y1={pos * scale}
                        x2={(length - 0.15) * scale}
                        y2={pos * scale}
                        stroke="#22d3ee"
                        strokeWidth="4"
                      />
                      <text
                        x={-10}
                        y={pos * scale + 4}
                        fill="#22d3ee"
                        fontSize="10"
                        textAnchor="end"
                      >
                        V{i + 1}
                      </text>
                    </>
                  ) : (
                    <>
                      <line
                        x1={pos * scale}
                        y1={0.15 * scale}
                        x2={pos * scale}
                        y2={(width - 0.15) * scale}
                        stroke="#22d3ee"
                        strokeWidth="4"
                      />
                      <text
                        x={pos * scale}
                        y={-10}
                        fill="#22d3ee"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        V{i + 1}
                      </text>
                    </>
                  )}
                </g>
              ))}
              
              {/* Bovedillas (orange rectangles) */}
              {layout.bovedillaRows.map((row, rowIdx) => {
                const numJoists = layout.joistCount;
                const nextJoistPos = rowIdx < layout.joistPositions.length 
                  ? layout.joistPositions[rowIdx] 
                  : layout.longestSide - 0.15;
                const prevJoistPos = rowIdx === 0 
                  ? 0.15 
                  : layout.joistPositions[rowIdx - 1];
                const rowHeight = nextJoistPos - prevJoistPos;
                
                return row.pieces.map((piece, pIdx) => {
                  if (layout.orientation === 'horizontal') {
                    return (
                      <rect
                        key={`bov-${rowIdx}-${pIdx}`}
                        x={piece.x * scale}
                        y={prevJoistPos * scale + 2}
                        width={piece.width * scale - 2}
                        height={rowHeight * scale - 4}
                        fill={piece.isAdjustment ? "#fb923c" : "#f97316"}
                        fillOpacity="0.3"
                        stroke={piece.isAdjustment ? "#fb923c" : "#f97316"}
                        strokeWidth="1"
                      />
                    );
                  } else {
                    return (
                      <rect
                        key={`bov-${rowIdx}-${pIdx}`}
                        x={prevJoistPos * scale + 2}
                        y={piece.x * scale}
                        width={rowHeight * scale - 4}
                        height={piece.width * scale - 2}
                        fill={piece.isAdjustment ? "#fb923c" : "#f97316"}
                        fillOpacity="0.3"
                        stroke={piece.isAdjustment ? "#fb923c" : "#f97316"}
                        strokeWidth="1"
                      />
                    );
                  }
                });
              })}
              
              {/* Dimension labels */}
              <text x={length * scale / 2} y={-15} fill="#e2e8f0" fontSize="12" textAnchor="middle">
                {length.toFixed(2)} m
              </text>
              <text
                x={length * scale + 20}
                y={width * scale / 2}
                fill="#e2e8f0"
                fontSize="12"
                textAnchor="middle"
                transform={`rotate(90, ${length * scale + 20}, ${width * scale / 2})`}
              >
                {width.toFixed(2)} m
              </text>
            </g>
            
            {/* Legend */}
            <g transform={`translate(${length * scale + padding + 30}, 60)`}>
              <text fill="#e2e8f0" fontSize="11" fontWeight="bold">Leyenda:</text>
              <rect x="0" y="10" width="30" height="6" fill="#22d3ee" />
              <text x="35" y="17" fill="#94a3b8" fontSize="10">Viguetas ({layout.joistCount} pzas)</text>
              <rect x="0" y="30" width="30" height="12" fill="#f97316" fillOpacity="0.3" stroke="#f97316" />
              <text x="35" y="40" fill="#94a3b8" fontSize="10">Bovedillas ({layout.totalVaults} pzas)</text>
              {layout.adjustmentPieces > 0 && (
                <>
                  <rect x="0" y="50" width="30" height="12" fill="#fb923c" fillOpacity="0.3" stroke="#fb923c" />
                  <text x="35" y="60" fill="#94a3b8" fontSize="10">Ajuste ({layout.adjustmentPieces} pzas)</text>
                </>
              )}
              <rect x="0" y="70" width="30" height="6" fill="none" stroke="#fbbf24" strokeDasharray="5,3" />
              <text x="35" y="77" fill="#94a3b8" fontSize="10">Cadena Perimetral</text>
            </g>
          </svg>
        </div>
        
        {/* Metrics */}
        <div className="p-4 bg-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{layout.joistCount}</p>
            <p className="text-xs text-slate-400">Viguetas</p>
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
      
      {/* Recommendations */}
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
        
        {/* Orientation indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
          <Ruler className="h-4 w-4" />
          <span>Orientación: Viguetas en sentido </span>
          <Badge variant="outline" className="font-medium">
            {layout.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
          </Badge>
          <span>| Claro: {layout.joistLength.toFixed(2)}m</span>
        </div>
      </div>
    </Card>
  );
}
