import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProjects, useProject } from "@/hooks/use-projects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/MetricCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Clock, Weight, Box, Zap, TrendingDown } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ComparativePage() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  
  const { data: projectDetails, isLoading: isLoadingDetails } = useProject(selectedProjectId ? parseInt(selectedProjectId) : null);

  // Default aggregate data if no calc exists
  const aggregateData = projectDetails?.calculations?.reduce((acc, curr) => {
    const res = curr.results as any;
    // Check if comparison values exist and are numeric
    const concreteSavedValue = parseFloat(res.comparison?.concreteSaved || 0);
    const weightReducedValue = parseFloat(res.comparison?.weightReduced || 0);
    const timeSavedValue = parseFloat(res.comparison?.timeSaved || 0);
    const energySavedValue = parseFloat(res.comparison?.energyEfficiency || res.comparison?.energySaved || 0);

    return {
      concreteSaved: acc.concreteSaved + concreteSavedValue,
      weightReduced: acc.weightReduced + weightReducedValue,
      timeSaved: acc.timeSaved + timeSavedValue,
      energySaved: acc.energySaved + energySavedValue,
      thermalConfort: acc.thermalConfort + parseFloat(res.comparison?.thermalConfort || 0),
      area: acc.area + parseFloat(curr.area),
    };
  }, { concreteSaved: 0, weightReduced: 0, timeSaved: 0, energySaved: 0, thermalConfort: 0, area: 0 }) || { concreteSaved: 0, weightReduced: 0, timeSaved: 0, energySaved: 0, thermalConfort: 0, area: 0 };

  const averageThermal = projectDetails?.calculations?.length 
    ? (aggregateData.thermalConfort / projectDetails.calculations.length).toFixed(0)
    : "0";

  const chartData = [
    {
      name: "Volumen Concreto (m³)",
      Tradicional: (aggregateData.area * 0.12).toFixed(1), // Assume 0.12m3/m2 for traditional
      Estructura360: (aggregateData.area * 0.12 - aggregateData.concreteSaved).toFixed(1),
    },
    {
      name: "Tiempo Ejecución (Días)",
      Tradicional: (aggregateData.area / 10).toFixed(0), // Assume 10m2/day
      Estructura360: ((aggregateData.area / 10) - aggregateData.timeSaved).toFixed(0),
    },
    {
      name: "Peso Estructural (Ton)",
      Tradicional: ((aggregateData.area * 300) / 1000).toFixed(1), // Assume 300kg/m2 for traditional
      Estructura360: (((aggregateData.area * 300) - aggregateData.weightReduced) / 1000).toFixed(1),
    },
  ];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Análisis de Impacto</h1>
          <p className="text-muted-foreground mt-2">Comparativa técnica y económica vs. sistemas tradicionales.</p>
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
          <BarChart className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg text-muted-foreground font-medium">Selecciona un proyecto para ver el análisis</p>
        </div>
      ) : isLoadingDetails ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Ahorro de Concreto"
              value={aggregateData.concreteSaved.toFixed(1)}
              unit="m³"
              subtitle="Menos carga muerta"
              icon={Box}
              trend="down"
              trendValue="30%"
            />
            <MetricCard
              title="Reducción de Peso"
              value={aggregateData.weightReduced > 0 ? (aggregateData.weightReduced / 1000).toFixed(1) : "0.0"}
              unit="Ton"
              subtitle="Carga sísmica reducida"
              icon={Weight}
              trend="down"
              trendValue="45%"
              highlight
            />
            <MetricCard
              title="Tiempo Ahorrado"
              value={aggregateData.timeSaved.toFixed(0)}
              unit="Días"
              subtitle="Mayor velocidad de obra"
              icon={Clock}
              trend="down"
              trendValue="50%"
            />
            <MetricCard
              title="Eficiencia Energética"
              value={aggregateData.energySaved.toFixed(0)}
              unit="pts"
              subtitle="Aislamiento térmico superior"
              icon={Zap}
              trend="up"
              trendValue="A+"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 shadow-lg border-primary/10">
              <CardHeader>
                <CardTitle>Comparativa de Rendimiento</CardTitle>
                <CardDescription>Análisis directo vs. Losa Maciza de Concreto</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      cursor={{fill: '#f3f4f6'}}
                    />
                    <Legend wrapperStyle={{paddingTop: '20px'}} />
                    <Bar dataKey="Tradicional" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={50} />
                    <Bar dataKey="Estructura360" fill="#f97316" radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-primary/10 bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-white">Impacto Ambiental</CardTitle>
                <CardDescription className="text-primary-foreground/70">Huella de carbono reducida</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-full">
                    <TrendingDown className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">12.5 <span className="text-sm font-normal text-primary-foreground/70">ton CO2</span></p>
                    <p className="text-sm text-primary-foreground/50">Menos emisiones por obra</p>
                  </div>
                </div>
                
                <div className="h-px bg-white/10" />
                
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-primary-foreground/80">
                    El uso de poliestireno de alta densidad reduce drásticamente la transferencia térmica, disminuyendo el consumo de aire acondicionado hasta en un <strong className="text-white">40%</strong>.
                  </p>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Confort Térmico Estimado</span>
                      <span className="text-accent font-bold">{averageThermal}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-accent h-full transition-all duration-1000" style={{ width: `${averageThermal}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}
