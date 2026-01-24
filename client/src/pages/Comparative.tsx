import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProjects, useProject } from "@/hooks/use-projects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from "recharts";
import { Clock, Weight, Box, Zap, TrendingDown, Shield, ThermometerSun, Hammer, DollarSign, Building2, Waves, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Leaf, Timer, Users, Award, ArrowRight, Loader2 } from "lucide-react";

import houseImage from "@assets/stock_images/modern_house_constru_1482b528.jpg";

const COLORS = ['#f97316', '#0f172a', '#10b981', '#3b82f6', '#8b5cf6'];

const technicalSpecs = [
  {
    category: "Uso de Agua",
    vigueta: "30% menos consumo de agua en el proceso constructivo",
    tradicional: "100% consumo base (curado y mezcla intensivo)",
    advantage: "vigueta",
    detail: "Apoyo al medio ambiente: menor huella hídrica gracias a prefabricación en planta"
  },
  {
    category: "Cimbrado",
    vigueta: "Solo 30% de cimbra (apoyos temporales puntuales)",
    tradicional: "100% cimbra completa requerida (madera o metálica)",
    advantage: "vigueta",
    detail: "70% menos cimbrado = ahorro significativo en materiales y mano de obra"
  },
  {
    category: "Peso Propio",
    vigueta: "168 kg/m² (30% más ligero)",
    tradicional: "240 kg/m² (losa maciza de 10cm)",
    advantage: "vigueta",
    detail: "Reducción del 30% en peso muerto significa menores costos en cimentación"
  },
  {
    category: "Resistencia Estructural",
    vigueta: "Peralte efectivo P-15, P-20, P-25 con acero de alta resistencia fy=6000 kg/cm²",
    tradicional: "Peralte limitado por espesor de losa (10cm típico)",
    advantage: "vigueta",
    detail: "Las viguetas pretensadas alcanzan claros de hasta 7m sin apoyos intermedios"
  },
  {
    category: "Tiempo de Instalación",
    vigueta: "50 m²/día por cuadrilla",
    tradicional: "5 m²/día incluyendo armado y colado",
    advantage: "vigueta",
    detail: "Hasta 10 veces más rápido que sistemas tradicionales"
  },
  {
    category: "Aislamiento Térmico",
    vigueta: "R-value 2.8-3.5 con poliestireno de alta densidad",
    tradicional: "R-value 0.8-1.2 (concreto sólido)",
    advantage: "vigueta",
    detail: "Ahorro de 35-45% en climatización anual"
  },
];

const costBreakdown = [
  { name: "Mano de Obra", tradicional: 35, vigueta: 20 },
  { name: "Materiales", tradicional: 45, vigueta: 55 },
  { name: "Cimbra/Equipos", tradicional: 15, vigueta: 5 },
  { name: "Otros", tradicional: 5, vigueta: 20 },
];

const timelineComparison = [
  { fase: "Prep. Cimbra", tradicional: 3, vigueta: 0.5 },
  { fase: "Colocación", tradicional: 5, vigueta: 2 },
  { fase: "Armado", tradicional: 4, vigueta: 1 },
  { fase: "Colado", tradicional: 2, vigueta: 1 },
  { fase: "Curado", tradicional: 7, vigueta: 3 },
  { fase: "Descimbrado", tradicional: 2, vigueta: 0.5 },
];

const performanceRadar = [
  { subject: 'Velocidad', vigueta: 95, tradicional: 40, fullMark: 100 },
  { subject: 'Aislamiento', vigueta: 90, tradicional: 35, fullMark: 100 },
  { subject: 'Peso', vigueta: 85, tradicional: 40, fullMark: 100 },
  { subject: 'Costo', vigueta: 75, tradicional: 60, fullMark: 100 },
  { subject: 'Durabilidad', vigueta: 90, tradicional: 85, fullMark: 100 },
  { subject: 'Sostenibilidad', vigueta: 88, tradicional: 45, fullMark: 100 },
];

const myths = [
  {
    myth: "Las losas de vigueta y bovedilla son menos resistentes",
    reality: "Las viguetas pretensadas superan la capacidad de carga de una losa maciza equivalente. El acero pretensado trabaja de manera más eficiente bajo cargas.",
    icon: Shield,
  },
  {
    myth: "Son más caras que las losas tradicionales",
    reality: "El costo total V&B es 30% menor (70% del costo tradicional). Ahorro de 70% en cimbra, 30% menos agua, y ejecución 10x más rápida.",
    icon: DollarSign,
  },
  {
    myth: "No son adecuadas para zonas sísmicas",
    reality: "Cumplen con NMX y NTC vigentes. Su menor peso (30% más ligero) reduce la demanda sísmica, mejorando el comportamiento estructural.",
    icon: Building2,
  },
  {
    myth: "Contamina el medio ambiente igual que lo tradicional",
    reality: "30% menos uso de agua, 70% menos cimbrado. Cálculos validados por ingenieros y arquitectos. Empresas socialmente responsables.",
    icon: Leaf,
  },
];

const benefits = [
  {
    title: "Apoyo al Medio Ambiente",
    description: "30% menos uso de agua y 70% menos cimbrado. Empresas socialmente responsables",
    icon: Leaf,
    stat: "-30%",
    color: "text-green-500",
  },
  {
    title: "Ejecución 10x Más Rápida",
    description: "50 m²/día vs 5 m²/día tradicional. Entregas anticipadas y menores costos financieros",
    icon: Timer,
    stat: "10x",
    color: "text-blue-500",
  },
  {
    title: "Menor Mano de Obra",
    description: "Requiere cuadrillas más pequeñas y personal menos especializado para instalación",
    icon: Users,
    stat: "-35%",
    color: "text-purple-500",
  },
  {
    title: "Cálculos Validados",
    description: "Cálculos validados por ingenieros y arquitectos. Empresas socialmente responsables",
    icon: Award,
    stat: "Validado",
    color: "text-orange-500",
  },
];

export default function ComparativePage() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  
  const { data: projectDetails, isLoading: isLoadingDetails } = useProject(selectedProjectId ? parseInt(selectedProjectId) : null);

  const aggregateData = projectDetails?.calculations?.reduce((acc, curr) => {
    const res = curr.results as any;
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
      Tradicional: (aggregateData.area * 0.12).toFixed(1),
      Estructura360: (aggregateData.area * 0.12 - aggregateData.concreteSaved).toFixed(1),
    },
    {
      name: "Tiempo Ejecución (Días)",
      Tradicional: (aggregateData.area / 10).toFixed(0),
      Estructura360: ((aggregateData.area / 10) - aggregateData.timeSaved).toFixed(0),
    },
    {
      name: "Peso Estructural (Ton)",
      Tradicional: ((aggregateData.area * 300) / 1000).toFixed(1),
      Estructura360: (((aggregateData.area * 300) - aggregateData.weightReduced) / 1000).toFixed(1),
    },
  ];

  const savingsData = [
    { name: 'Concreto', value: 35 },
    { name: 'Mano de Obra', value: 30 },
    { name: 'Tiempo', value: 20 },
    { name: 'Cimbra', value: 15 },
  ];

  return (
    <Layout>
      <div className="relative overflow-hidden rounded-2xl mb-8">
          <div className="absolute inset-0">
            <img src={houseImage} alt="Casa moderna" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
          </div>
          <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-white">
              <h1 className="text-2xl sm:text-3xl font-display font-bold" data-testid="text-page-title">Análisis Comparativo</h1>
              <p className="text-white/80 mt-2">Por qué Vigueta y Bovedilla es la mejor elección para tu proyecto</p>
            </div>
            <div className="w-full sm:w-[300px]">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isLoadingProjects}>
            <SelectTrigger className="w-full bg-white shadow-sm border-primary/20" data-testid="select-project">
              <SelectValue placeholder={isLoadingProjects ? "Cargando..." : "Seleccionar Proyecto"} />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()} data-testid={`select-project-${p.id}`}>
                  {p.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            </div>
          </div>
        </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl gap-1">
          <TabsTrigger value="overview" className="rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm" data-testid="tab-overview">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="technical" className="rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm" data-testid="tab-technical">
            Técnico
          </TabsTrigger>
          <TabsTrigger value="myths" className="rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm" data-testid="tab-myths">
            <span className="hidden sm:inline">Mitos vs Realidad</span>
            <span className="sm:hidden">Mitos</span>
          </TabsTrigger>
          <TabsTrigger value="benefits" className="rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm" data-testid="tab-benefits">
            Beneficios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {!selectedProjectId ? (
            <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Lightbulb className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Selecciona un proyecto para análisis personalizado</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  O explora las pestañas para conocer las ventajas del sistema Vigueta y Bovedilla
                </p>
              </CardContent>
            </Card>
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
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} cursor={{fill: '#f3f4f6'}} />
                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                        <Bar dataKey="Tradicional" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={50} />
                        <Bar dataKey="Estructura360" fill="#f97316" radius={[4, 4, 0, 0]} barSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-primary/10 bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle className="text-white">Apoyo al Medio Ambiente</CardTitle>
                    <CardDescription className="text-primary-foreground/70">Construcción sostenible</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-full">
                        <Waves className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">30% <span className="text-sm font-normal text-primary-foreground/70">menos agua</span></p>
                        <p className="text-sm text-primary-foreground/50">Ahorro hídrico significativo</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-full">
                        <TrendingDown className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">70% <span className="text-sm font-normal text-primary-foreground/70">menos cimbra</span></p>
                        <p className="text-sm text-primary-foreground/50">Reducción de materiales</p>
                      </div>
                    </div>
                    
                    <div className="h-px bg-white/10" />
                    
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm leading-relaxed text-primary-foreground/80">
                        <strong className="text-accent">Cálculos validados por ingenieros y arquitectos.</strong> Empresas socialmente responsables. 
                        Construcción que cuida el planeta.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hammer className="h-5 w-5 text-accent" />
                  Distribución de Costos
                </CardTitle>
                <CardDescription>Comparativa de inversión por categoría</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costBreakdown} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} unit="%" />
                    <YAxis dataKey="name" type="category" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    <Legend />
                    <Bar dataKey="tradicional" name="Tradicional" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="vigueta" name="Vigueta-Bovedilla" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-accent" />
                  Línea de Tiempo (100m²)
                </CardTitle>
                <CardDescription>Días por fase de construcción</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="fase" tick={{fill: '#6b7280', fontSize: 11}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} unit=" días" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="tradicional" name="Tradicional" stroke="#94a3b8" strokeWidth={3} dot={{ fill: '#94a3b8', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="vigueta" name="Vigueta-Bovedilla" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-8">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Especificaciones Técnicas Detalladas
              </CardTitle>
              <CardDescription>Comparativa punto por punto entre sistemas constructivos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technicalSpecs.map((spec, index) => (
                  <div key={index} className="p-4 bg-white rounded-xl border border-border/50 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="font-semibold text-primary">{spec.category}</h4>
                      <Badge variant={spec.advantage === 'vigueta' ? 'default' : 'secondary'} className={spec.advantage === 'vigueta' ? 'bg-green-500' : ''}>
                        {spec.advantage === 'vigueta' ? 'Ventaja V&B' : 'Tradicional'}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="p-3 bg-accent/5 rounded-lg border-l-4 border-accent">
                        <p className="text-xs font-medium text-accent mb-1">VIGUETA Y BOVEDILLA</p>
                        <p className="text-sm text-foreground">{spec.vigueta}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-muted-foreground/30">
                        <p className="text-xs font-medium text-muted-foreground mb-1">TRADICIONAL</p>
                        <p className="text-sm text-muted-foreground">{spec.tradicional}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                      {spec.detail}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Perfil de Rendimiento</CardTitle>
                <CardDescription>Evaluación multidimensional de sistemas</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={performanceRadar}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#6b7280', fontSize: 12}} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fill: '#6b7280'}} />
                    <Radar name="Vigueta-Bovedilla" dataKey="vigueta" stroke="#f97316" fill="#f97316" fillOpacity={0.5} />
                    <Radar name="Tradicional" dataKey="tradicional" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-white">Normatividad Cumplida</CardTitle>
                <CardDescription className="text-primary-foreground/70">Certificaciones y estándares</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { code: "NMX-C-406", desc: "Viguetas de concreto presforzado" },
                  { code: "NTC-2017", desc: "Normas técnicas complementarias" },
                  { code: "ASTM C90", desc: "Unidades de mampostería hueca" },
                  { code: "CFE-2015", desc: "Manual de diseño por sismo" },
                  { code: "NOM-020-ENER", desc: "Eficiencia energética en edificaciones" },
                ].map((norm, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                    <div>
                      <p className="font-mono text-sm font-semibold">{norm.code}</p>
                      <p className="text-xs text-primary-foreground/60">{norm.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="myths" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">Derribando Mitos</h2>
            <p className="text-muted-foreground">
              Información técnica verificada para tomar decisiones informadas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {myths.map((item, index) => (
              <Card key={index} className="overflow-hidden shadow-lg border-0">
                <div className="h-1 bg-gradient-to-r from-red-500 to-green-500" />
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg shrink-0">
                      <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Mito</p>
                      <p className="font-medium text-foreground">"{item.myth}"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="p-2 bg-green-100 rounded-lg shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Realidad</p>
                      <p className="text-sm text-green-800">{item.reality}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-accent/10 rounded-2xl">
                    <Award className="h-10 w-10 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">¿Aún tienes dudas?</h3>
                    <p className="text-muted-foreground">Nuestros ingenieros pueden resolver todas tus preguntas técnicas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-accent font-semibold">
                  <span>Solicitar Asesoría Técnica</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center`}>
                    <benefit.icon className={`h-8 w-8 ${benefit.color}`} />
                  </div>
                  <div className={`text-3xl font-bold ${benefit.color} mb-2`}>{benefit.stat}</div>
                  <h3 className="font-semibold text-primary mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden">
            <CardContent className="py-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-5xl font-bold mb-2">+500</p>
                  <p className="text-primary-foreground/70">Proyectos Realizados</p>
                </div>
                <div>
                  <p className="text-5xl font-bold mb-2">50K+</p>
                  <p className="text-primary-foreground/70">m² Construidos</p>
                </div>
                <div>
                  <p className="text-5xl font-bold mb-2">98%</p>
                  <p className="text-primary-foreground/70">Clientes Satisfechos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThermometerSun className="h-5 w-5 text-accent" />
                  Ahorro en Climatización
                </CardTitle>
                <CardDescription>Proyección anual para 100m² de losa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-red-600">$24,000</p>
                    <p className="text-sm text-red-600/70">Losa Tradicional</p>
                    <p className="text-xs text-muted-foreground mt-1">Gasto anual estimado</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-600">$14,400</p>
                    <p className="text-sm text-green-600/70">Vigueta y Bovedilla</p>
                    <p className="text-xs text-muted-foreground mt-1">Gasto anual estimado</p>
                  </div>
                </div>
                <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Ahorro Anual</span>
                    <span className="text-2xl font-bold text-accent">$9,600</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Recuperación del diferencial de inversión en ~2 años
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-accent" />
                  Comportamiento Sísmico
                </CardTitle>
                <CardDescription>Ventajas en zonas de alta sismicidad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: "Demanda Sísmica", tradicional: 100, vigueta: 55 },
                    { label: "Período Fundamental", tradicional: 100, vigueta: 75 },
                    { label: "Desplazamiento", tradicional: 100, vigueta: 60 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span className="text-accent font-medium">-{100 - item.vigueta}%</span>
                      </div>
                      <div className="flex gap-1 h-3">
                        <div className="bg-muted-foreground/30 rounded-l" style={{ width: `${item.tradicional}%` }} />
                      </div>
                      <div className="flex gap-1 h-3 -mt-3">
                        <div className="bg-accent rounded-l" style={{ width: `${item.vigueta}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  El menor peso de la losa reduce significativamente las fuerzas sísmicas, permitiendo diseños de cimentación más económicos.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
