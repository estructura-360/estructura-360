import { LayoutResult } from "@/lib/layoutPlanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Ruler, Layers, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SlabLayoutDiagramProps {
  layout: LayoutResult;
  length: number;
  width: number;
}

export function SlabLayoutDiagram({ layout, length: lengthProp, width: widthProp }: SlabLayoutDiagramProps) {
  const length = Number(lengthProp) || 1;
  const width = Number(widthProp) || 1;
  
  const svgWidth = 400;
  const svgHeight = 300;
  const padding = 40;
  
  // Scale to fit
  const scaleX = (svgWidth - padding * 2) / length;
  const scaleY = (svgHeight - padding * 2) / width;
  const scale = Math.min(scaleX, scaleY);
  
  const scaledLength = length * scale;
  const scaledWidth = width * scale;
  const offsetX = (svgWidth - scaledLength) / 2;
  const offsetY = (svgHeight - scaledWidth) / 2;
  
  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-accent to-primary" />
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-accent" />
          Plano de Distribución Automático
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SVG Diagram */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex justify-center">
          <svg width={svgWidth} height={svgHeight} className="drop-shadow-sm">
            {/* Slab outline */}
            <rect
              x={offsetX}
              y={offsetY}
              width={scaledLength}
              height={scaledWidth}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />
            
            {/* Joists */}
            {layout.joists.map((joist, i) => {
              const joistWidth = 4; // visual width
              if (layout.orientation === 'horizontal') {
                const y = offsetY + joist.y * scale;
                return (
                  <g key={i}>
                    <rect
                      x={offsetX}
                      y={y - joistWidth / 2}
                      width={scaledLength}
                      height={joistWidth}
                      fill="hsl(var(--primary))"
                      className="opacity-80"
                    />
                    {/* Vault visualization between joists */}
                    {i < layout.joists.length - 1 && (
                      <rect
                        x={offsetX + 2}
                        y={y + joistWidth / 2 + 2}
                        width={scaledLength - 4}
                        height={(0.75 * scale) - joistWidth - 4}
                        fill="hsl(var(--accent))"
                        className="opacity-30"
                        rx="2"
                      />
                    )}
                  </g>
                );
              } else {
                const x = offsetX + joist.x * scale;
                return (
                  <g key={i}>
                    <rect
                      x={x - joistWidth / 2}
                      y={offsetY}
                      width={joistWidth}
                      height={scaledWidth}
                      fill="hsl(var(--primary))"
                      className="opacity-80"
                    />
                    {i < layout.joists.length - 1 && (
                      <rect
                        x={x + joistWidth / 2 + 2}
                        y={offsetY + 2}
                        width={(0.75 * scale) - joistWidth - 4}
                        height={scaledWidth - 4}
                        fill="hsl(var(--accent))"
                        className="opacity-30"
                        rx="2"
                      />
                    )}
                  </g>
                );
              }
            })}
            
            {/* Dimension labels */}
            <text x={offsetX + scaledLength / 2} y={offsetY - 10} textAnchor="middle" className="fill-muted-foreground text-xs">
              {length.toFixed(2)}m
            </text>
            <text 
              x={offsetX - 10} 
              y={offsetY + scaledWidth / 2} 
              textAnchor="middle" 
              className="fill-muted-foreground text-xs"
              transform={`rotate(-90 ${offsetX - 10} ${offsetY + scaledWidth / 2})`}
            >
              {width.toFixed(2)}m
            </text>
            
            {/* Orientation arrow */}
            <g transform={`translate(${offsetX + scaledLength + 15}, ${offsetY + scaledWidth / 2})`}>
              <text y={-20} textAnchor="middle" className="fill-accent text-[10px] font-medium">
                VIGUETAS
              </text>
              {layout.orientation === 'horizontal' ? (
                <path d="M-10,0 L10,0 M5,-5 L10,0 L5,5" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" />
              ) : (
                <path d="M0,-10 L0,10 M-5,5 L0,10 L5,5" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" />
              )}
            </g>
          </svg>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-primary rounded-sm opacity-80" />
            <span className="text-muted-foreground">Viguetas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-accent rounded-sm opacity-30" />
            <span className="text-muted-foreground">Bovedillas</span>
          </div>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{layout.joistCount}</p>
            <p className="text-xs text-muted-foreground">Viguetas</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{layout.totalVaults}</p>
            <p className="text-xs text-muted-foreground">Bovedillas</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-accent">{layout.selectedBeamLength}m</p>
            <p className="text-xs text-muted-foreground">Long. Comercial</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${layout.wastePercentage > 15 ? 'text-destructive' : 'text-green-600'}`}>
              {layout.wastePercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Desperdicio</p>
          </div>
        </div>
        
        {/* Recommendations */}
        {layout.recommendations.length > 0 && (
          <div className="space-y-2">
            {layout.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        )}
        
        {layout.wastePercentage <= 10 && (
          <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            <span>Distribución óptima con desperdicio mínimo</span>
          </div>
        )}
        
        {/* Orientation indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Ruler className="h-4 w-4" />
          <span>Orientación recomendada: Viguetas en sentido </span>
          <Badge variant="outline" className="font-medium">
            {layout.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
          </Badge>
          <ArrowRight className="h-4 w-4" />
          <span>Claro: {layout.joistLength.toFixed(2)}m</span>
        </div>
      </CardContent>
    </Card>
  );
}
