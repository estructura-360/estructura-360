import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Ruler, Layers, ShieldCheck, Zap, ThermometerSun, Clock, Weight, CheckCircle2, ArrowDown, Hammer, Truck, HardHat, Wrench, Building, BookOpen, AlertCircle, Lightbulb, Package, Construction, Grid3X3, Leaf } from "lucide-react";
import { EnvironmentalBenefits } from "@/components/EnvironmentalBenefits";

import constructionImage from "@assets/stock_images/modern_construction__77c2c1d4.jpg";
import cimbradoTecnicoImg from "@assets/IMG_6379_1769205801594.jpeg";

const beams = [
  { 
    name: "P-15", 
    maxSpan: "4.00m", 
    use: "Residencial ligero (claro ≤4m)", 
    load: "250 kg/m²",
    height: "15 cm",
    applications: ["Casas unifamiliares", "Garajes techados", "Anexos y cuartos adicionales"],
    idealFor: "Claros pequeños y cargas ligeras"
  },
  { 
    name: "P-20", 
    maxSpan: "5.00m", 
    use: "Residencial medio (claro 4-5m)", 
    load: "350 kg/m²",
    height: "20 cm",
    applications: ["Vivienda de interés medio", "Oficinas pequeñas", "Comercios en planta alta"],
    idealFor: "La opción más versátil y común"
  },
  { 
    name: "P-25", 
    maxSpan: "7.00m", 
    use: "Comercial (claro >5m)", 
    load: "500 kg/m²",
    height: "25 cm",
    applications: ["Bodegas ligeras", "Salones de usos múltiples", "Espacios comerciales amplios"],
    idealFor: "Claros grandes sin apoyos intermedios"
  },
];

const installationSteps = [
  {
    step: 1,
    title: "Preparación de Apoyos",
    description: "Revisar enrase y nivel de muros. Montar viguetas según plano de colocación. Apoyar mínimo 5 cm sobre cadena o trabe.",
    duration: "2-4 horas",
    icon: HardHat,
    tips: ["Verificar nivel con láser o manguera", "Usar calzas para nivelar", "Marcar posición de viguetas en muros"]
  },
  {
    step: 2,
    title: "Colocación de Viguetas",
    description: "Levantar viguetas a los tercios (nunca de extremos ni del centro). Colocar perpendicular a los barrotes. No invertir ni colocar perpendicular.",
    duration: "1-2 horas por 20m²",
    icon: Truck,
    tips: ["Levantar SIEMPRE a los tercios", "Nunca arrastrar las viguetas", "Colocar perpendicular a barrotes"]
  },
  {
    step: 3,
    title: "Instalación de Bovedillas",
    description: "Colocar una bovedilla en extremos como escantillón para dar separación correcta. Montar bovedillas bien asentadas y lo más juntas posible.",
    duration: "30 min por 10m²",
    icon: Package,
    tips: ["Usar bovedilla como escantillón en extremos", "No pisar la bovedilla - caminar sobre vigueta o tablones", "Dejar espacios para instalaciones"]
  },
  {
    step: 4,
    title: "Apuntalamiento (Cimbra)",
    description: "Colocar apuntalamiento aproximadamente a cada 1.22m. Los puntales centrales deben permanecer mínimo 7 días.",
    duration: "1-2 horas",
    icon: Construction,
    tips: ["Separación entre puntales: ~1.22m", "Puntales centrales mínimo 7 días", "NUNCA colocar bovedillas sin antes apuntalar"]
  },
  {
    step: 5,
    title: "Colocación de Malla",
    description: "Colocar malla electrosoldada y fijarla con amarres a las trabes o cadenas. Se traslapa alambre sobre alambre (no cuadros completos).",
    duration: "1 hora por 30m²",
    icon: Grid3X3,
    tips: ["Traslapar alambre sobre alambre", "No hace falta traslapar cuadros completos", "Fijar con amarres a trabes/cadenas"]
  },
  {
    step: 6,
    title: "Colado",
    description: "Colocar tablones de circulación. Comenzar colado en trabes o cadenas, seguido de vigueta y bovedilla. Concreto f'c=200-250 kg/cm².",
    duration: "Depende del área",
    icon: Hammer,
    tips: ["Caminar SIEMPRE sobre tablones", "Iniciar colado en trabes/cadenas", "Evitar acumulaciones de concreto", "Humedecer firme por 5 días"]
  },
];

const faqs = [
  {
    question: "¿Qué pasa si tengo claros de más de 7 metros?",
    answer: "Para claros mayores a 7m se recomienda usar trabes intermedias de concreto armado o viguetas especiales de peralte mayor (P-30 o P-35). También se puede dividir el claro con columnas intermedias. Consulta siempre a un ingeniero estructurista para estos casos."
  },
  {
    question: "¿Puedo hacer perforaciones para instalaciones después del colado?",
    answer: "Es preferible dejar los pasos de instalaciones antes de colar. Si es necesario perforar después, nunca dañe las viguetas - solo perfore la capa de compresión y las bovedillas. Para ductos de A/C mayores a 15cm, planéelo desde el diseño."
  },
  {
    question: "¿Cuánto tiempo debo esperar antes de descimbrar?",
    answer: "El descimbrado puede hacerse a los 7 días con curado húmedo continuo. En climas fríos o claros mayores a 5m, se recomienda esperar 14 días. Los apoyos en el tercio medio son los últimos en retirarse."
  },
  {
    question: "¿Cómo se manejan las entregas o uniones con muros?",
    answer: "Las viguetas deben apoyar mínimo 5cm sobre los muros. Se recomienda un chaflán o media caña en las esquinas para evitar fisuras. En muros divisorios livianos, se coloca bastón de refuerzo adicional."
  },
  {
    question: "¿Qué capacidad de carga soporta la losa terminada?",
    answer: "Además de la carga muerta (acabados ~100 kg/m²), la carga viva típica es: Vivienda 170-200 kg/m², Oficinas 250 kg/m², Azoteas accesibles 100 kg/m². Las viguetas están diseñadas para cumplir con estas cargas según su peralte."
  },
  {
    question: "¿Se puede usar en zonas sísmicas?",
    answer: "Sí, el sistema cumple con las NTC para sismo. Su menor peso (45% menos que losa maciza) reduce la demanda sísmica. Se requiere refuerzo perimetral (dalas de cerramiento) y en algunos casos bastones adicionales en las esquinas."
  },
];

const components = [
  {
    name: "Vigueta de Alma Abierta",
    description: "Vigueta tipo celosía, ligera y fácil de manejar. Ideal para autoconstrucción y proyectos donde la facilidad de manejo es prioritaria.",
    specs: [
      { label: "Material", value: "Acero estructural" },
      { label: "Estructura", value: "Celosía triangular" },
      { label: "Peso", value: "8-12 kg/m (ligera)" },
      { label: "Longitudes", value: "2.0m a 6.0m" },
    ],
  },
  {
    name: "Vigueta Pretensada",
    description: "Elemento lineal de concreto con acero de presfuerzo que trabaja a flexión. Mayor capacidad de carga para claros amplios.",
    specs: [
      { label: "Material", value: "Concreto f'c ≥ 350 kg/cm²" },
      { label: "Acero", value: "Alambre de presfuerzo fy = 17,000 kg/cm²" },
      { label: "Ancho típico", value: "10-12 cm" },
      { label: "Longitudes", value: "2.0m a 10.0m" },
    ],
  },
  {
    name: "Bovedilla de Poliestireno",
    description: "Elemento aligerante y aislante que reduce el peso muerto y mejora el confort térmico. No es estructural.",
    specs: [
      { label: "Material", value: "Poliestireno expandido (EPS)" },
      { label: "Densidad", value: "10 a 25 kg/m³" },
      { label: "Valor R", value: "2.5 a 4.0 (aislamiento térmico)" },
      { label: "Dimensiones", value: "60 x 25 x 15-25 cm" },
    ],
  },
  {
    name: "Malla Electrosoldada",
    description: "Refuerzo de la capa de compresión que controla fisuras por temperatura y distribuye cargas puntuales.",
    specs: [
      { label: "Tipo común", value: "6x6-10/10" },
      { label: "Acero", value: "fy = 5,000 kg/cm²" },
      { label: "Traslape", value: "Mínimo 20cm (1 cuadro)" },
      { label: "Separación", value: "2cm sobre bovedilla" },
    ],
  },
  {
    name: "Capa de Compresión",
    description: "Firme de concreto que une todos los elementos y forma el diafragma rígido de la losa.",
    specs: [
      { label: "Concreto", value: "f'c = 250 kg/cm² (recomendado)" },
      { label: "Espesor mínimo", value: "4 cm sobre bovedilla" },
      { label: "Revenimiento", value: "12-14 cm" },
      { label: "Curado", value: "7 días húmedo mínimo" },
    ],
  },
];

const densityOptions = [
  {
    range: "10-12 kg/m³",
    label: "Estándar",
    rValue: "2.0-2.5",
    use: "Vivienda económica, climas templados",
    savings: "Base",
    badge: "outline" as const,
    highlight: false
  },
  {
    range: "14-16 kg/m³",
    label: "Recomendado",
    rValue: "2.8-3.2",
    use: "Vivienda media, mejor relación costo-beneficio",
    savings: "25% menos en climatización",
    badge: "default" as const,
    highlight: true
  },
  {
    range: "20-25 kg/m³",
    label: "Premium",
    rValue: "3.5-4.0",
    use: "Climas extremos, máximo confort térmico",
    savings: "40% menos en climatización",
    badge: "secondary" as const,
    highlight: false
  },
];

export default function TechnicalPage() {
  const [selectedBeam, setSelectedBeam] = useState<typeof beams[0] | null>(null);

  return (
    <Layout>
      <div className="relative overflow-hidden rounded-2xl mb-8">
        <div className="absolute inset-0">
          <img src={constructionImage} alt="Construcción" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        </div>
        <div className="relative p-6 sm:p-8 text-white">
          <h1 className="text-2xl sm:text-3xl font-display font-bold" data-testid="text-page-title">Centro de Conocimiento</h1>
          <p className="text-white/80 mt-2">Todo lo que necesitas saber sobre el sistema Vigueta y Bovedilla</p>
        </div>
      </div>

      <Tabs defaultValue="system" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl gap-1">
          <TabsTrigger value="system" className="rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm" data-testid="tab-system">
            <Layers className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">El Sistema</span>
            <span className="sm:hidden">Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="catalog" className="rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm" data-testid="tab-catalog">
            <Ruler className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Catálogo</span>
            <span className="sm:hidden">Catálogo</span>
          </TabsTrigger>
          <TabsTrigger value="installation" className="rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm" data-testid="tab-installation">
            <Hammer className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Instalación</span>
            <span className="sm:hidden">Instalar</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm" data-testid="tab-faq">
            <BookOpen className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Preguntas</span>
            <span className="sm:hidden">FAQ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-8">
          <Card className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                ¿Qué es el Sistema Vigueta y Bovedilla?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Es un sistema constructivo prefabricado para losas de entrepiso y azotea que combina 
                <strong className="text-primary"> viguetas</strong> (elementos estructurales: <em>Alma Abierta</em> o <em>Pretensada</em>) con 
                <strong className="text-primary"> bovedillas aligerantes</strong> (elementos de relleno), unidos por una 
                <strong className="text-primary"> capa de compresión</strong> de concreto armado.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold mb-2">Dos Tipos de Viguetas</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Alma Abierta:</strong> Ligera, fácil manejo. <strong>Pretensada:</strong> Mayor capacidad de carga para claros amplios.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-xl border shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Weight className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold mb-2">30% Más Ligero</h3>
                  <p className="text-sm text-muted-foreground">
                    Las bovedillas de poliestireno reducen el peso a 168 kg/m² vs 240 kg/m² tradicional, 
                    disminuyendo costos en cimentación y mejorando el comportamiento sísmico.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-xl border shadow-sm">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <ThermometerSun className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold mb-2">Aislamiento Térmico</h3>
                  <p className="text-sm text-muted-foreground">
                    El poliestireno actúa como aislante, manteniendo temperaturas interiores estables 
                    y reduciendo hasta 40% el gasto en climatización.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {components.map((comp, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                <CardHeader>
                  <CardTitle className="text-lg">{comp.name}</CardTitle>
                  <CardDescription>{comp.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {comp.specs.map((spec, i) => (
                      <div key={i} className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{spec.label}</p>
                        <p className="text-sm font-medium">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-accent/10 rounded-2xl shrink-0">
                  <Lightbulb className="h-10 w-10 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2">Apoyo al Medio Ambiente</h3>
                  <p className="text-muted-foreground">
                    El sistema V&B utiliza <strong className="text-accent">30% menos agua</strong> y <strong className="text-accent">70% menos cimbrado</strong> que la losa tradicional. 
                    <strong className="text-primary">Cálculos validados por ingenieros y arquitectos.</strong> Empresas socialmente responsables. 
                    Es el método preferido por su balance entre costo, velocidad y sostenibilidad.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Ruler className="h-6 w-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">Viguetas (Alma Abierta y Pretensada)</h2>
              </div>
              
              {beams.map((beam) => (
                <Card 
                  key={beam.name} 
                  className={`overflow-hidden cursor-pointer transition-all duration-300 ${selectedBeam?.name === beam.name ? 'ring-2 ring-accent shadow-lg' : 'hover:shadow-lg'}`}
                  onClick={() => setSelectedBeam(selectedBeam?.name === beam.name ? null : beam)}
                  data-testid={`card-beam-${beam.name}`}
                >
                  <div className="flex">
                    <div className="w-24 bg-primary flex items-center justify-center">
                      <span className="text-2xl font-bold text-white font-display">{beam.name}</span>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{beam.use}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                          Claro Máx: {beam.maxSpan}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Capacidad de carga: <span className="text-primary font-medium">{beam.load}</span>
                      </p>
                    </div>
                  </div>
                  
                  {selectedBeam?.name === beam.name && (
                    <div className="p-4 bg-muted/30 border-t animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase mb-1">Peralte</p>
                          <p className="font-semibold">{beam.height}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase mb-1">Ideal para</p>
                          <p className="font-semibold text-accent">{beam.idealFor}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground uppercase mb-2">Aplicaciones típicas:</p>
                      <div className="flex flex-wrap gap-2">
                        {beam.applications.map((app, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{app}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Layers className="h-6 w-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">Bovedilla de Poliestireno</h2>
              </div>

              <Card className="bg-slate-50 border-dashed border-2">
                <CardHeader>
                  <CardTitle>Densidades Disponibles</CardTitle>
                  <CardDescription>A mayor densidad, mejor aislamiento térmico y resistencia mecánica.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {densityOptions.map((option, i) => (
                    <div 
                      key={i} 
                      className={`p-4 bg-white rounded-lg border ${option.highlight ? 'border-accent/30 ring-2 ring-accent/10' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-primary">Densidad {option.range}</p>
                            <Badge variant={option.badge} className={option.highlight ? 'bg-accent hover:bg-accent/90' : ''}>
                              {option.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{option.use}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ThermometerSun className="h-4 w-4 text-orange-500" />
                          <span>Valor R: <strong>{option.rValue}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-500" />
                          <span>{option.savings}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Nota Importante
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-primary-foreground/80">
                    La densidad de la bovedilla NO afecta la capacidad estructural de la losa - eso depende únicamente de las viguetas.
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    Elige la densidad según el <strong className="text-white">confort térmico</strong> deseado y el <strong className="text-white">clima</strong> de tu región.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="installation" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">Manual del Sistema Vigueta y Bovedilla</h2>
            <p className="text-muted-foreground">
              Guía completa de instalación. Tiempo estimado para 100m²: 2-3 días con cuadrilla de 4 personas.
            </p>
          </div>

          {/* Notas Importantes - Critical Warnings */}
          <Card className="border-2 border-red-300 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Notas Importantes - Leer Antes de Iniciar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-red-600 font-bold text-lg">✕</span>
                  </div>
                  <div>
                    <p className="font-semibold text-red-700">NUNCA cortar el acero de las viguetas</p>
                    <p className="text-sm text-red-600">El acero de presfuerzo es estructural</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-red-600 font-bold text-lg">✕</span>
                  </div>
                  <div>
                    <p className="font-semibold text-red-700">NUNCA colocar bovedillas sin apuntalar</p>
                    <p className="text-sm text-red-600">Primero cimbra, luego bovedillas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-amber-600 font-bold text-lg">!</span>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-700">Evitar acumulaciones de concreto</p>
                    <p className="text-sm text-amber-600">Distribuir uniformemente durante colado</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-lg">i</span>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-700">Puntales mínimo 7 días</p>
                    <p className="text-sm text-blue-600">Humedecer firme por 5 días</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manejo de Viguetas - Visual Do/Don't */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                1. Manejo y Transporte de Viguetas
              </CardTitle>
              <CardDescription className="text-primary-foreground/70">
                La forma correcta de levantar y transportar las viguetas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Correcto */}
                <div className="space-y-4">
                  <h4 className="font-bold text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Forma Correcta
                  </h4>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-center mb-4">
                      {/* SVG Diagram - Correct lifting at thirds */}
                      <svg viewBox="0 0 200 80" className="w-full max-w-[200px] h-auto">
                        <rect x="10" y="35" width="180" height="12" rx="2" fill="#0f172a" stroke="#22c55e" strokeWidth="2"/>
                        <circle cx="70" cy="25" r="8" fill="#22c55e"/>
                        <line x1="70" y1="33" x2="70" y2="35" stroke="#22c55e" strokeWidth="2"/>
                        <circle cx="130" cy="25" r="8" fill="#22c55e"/>
                        <line x1="130" y1="33" x2="130" y2="35" stroke="#22c55e" strokeWidth="2"/>
                        <text x="70" y="60" textAnchor="middle" fontSize="8" fill="#22c55e">⅓</text>
                        <text x="130" y="60" textAnchor="middle" fontSize="8" fill="#22c55e">⅓</text>
                        <path d="M 65 20 L 70 10 L 75 20" fill="none" stroke="#22c55e" strokeWidth="2"/>
                        <path d="M 125 20 L 130 10 L 135 20" fill="none" stroke="#22c55e" strokeWidth="2"/>
                      </svg>
                    </div>
                    <p className="text-sm text-green-700 text-center font-medium">Levantar la vigueta a los tercios</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-center mb-4">
                      <svg viewBox="0 0 200 80" className="w-full max-w-[200px] h-auto">
                        <rect x="30" y="20" width="140" height="40" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1"/>
                        <rect x="40" y="35" width="120" height="12" rx="2" fill="#0f172a"/>
                        <line x1="30" y1="5" x2="30" y2="60" stroke="#22c55e" strokeWidth="1" strokeDasharray="4"/>
                        <line x1="170" y1="5" x2="170" y2="60" stroke="#22c55e" strokeWidth="1" strokeDasharray="4"/>
                        <text x="100" y="75" textAnchor="middle" fontSize="7" fill="#64748b">Perpendicular a barrotes</text>
                      </svg>
                    </div>
                    <p className="text-sm text-green-700 text-center font-medium">Colocar perpendicular a los barrotes</p>
                  </div>
                </div>

                {/* Incorrecto */}
                <div className="space-y-4">
                  <h4 className="font-bold text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Forma Incorrecta
                  </h4>
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center justify-center mb-4">
                      <svg viewBox="0 0 200 80" className="w-full max-w-[200px] h-auto">
                        <rect x="10" y="35" width="180" height="12" rx="2" fill="#0f172a" stroke="#ef4444" strokeWidth="2"/>
                        <circle cx="20" cy="25" r="8" fill="#ef4444"/>
                        <line x1="20" y1="33" x2="20" y2="35" stroke="#ef4444" strokeWidth="2"/>
                        <circle cx="180" cy="25" r="8" fill="#ef4444"/>
                        <line x1="180" y1="33" x2="180" y2="35" stroke="#ef4444" strokeWidth="2"/>
                        <line x1="15" y1="15" x2="25" y2="25" stroke="#ef4444" strokeWidth="2"/>
                        <line x1="25" y1="15" x2="15" y2="25" stroke="#ef4444" strokeWidth="2"/>
                        <line x1="175" y1="15" x2="185" y2="25" stroke="#ef4444" strokeWidth="2"/>
                        <line x1="185" y1="15" x2="175" y2="25" stroke="#ef4444" strokeWidth="2"/>
                      </svg>
                    </div>
                    <p className="text-sm text-red-700 text-center font-medium">NO levantar de los extremos</p>
                  </div>
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center justify-center mb-4">
                      <svg viewBox="0 0 200 80" className="w-full max-w-[200px] h-auto">
                        <rect x="10" y="35" width="180" height="12" rx="2" fill="#0f172a" stroke="#ef4444" strokeWidth="2"/>
                        <circle cx="100" cy="25" r="8" fill="#ef4444"/>
                        <line x1="100" y1="33" x2="100" y2="35" stroke="#ef4444" strokeWidth="2"/>
                        <path d="M 10 47 Q 100 65 190 47" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3"/>
                        <line x1="95" y1="15" x2="105" y2="25" stroke="#ef4444" strokeWidth="2"/>
                        <line x1="105" y1="15" x2="95" y2="25" stroke="#ef4444" strokeWidth="2"/>
                      </svg>
                    </div>
                    <p className="text-sm text-red-700 text-center font-medium">NO levantar del centro (se flexiona)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geometría de Bovedilla */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-accent/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                Geometría de Bovedilla de Poliestireno
              </CardTitle>
              <CardDescription>
                Dimensiones estándar según peralte de vigueta
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Peralte (h)</th>
                      <th className="px-4 py-3 text-center font-semibold">Ancho (b)</th>
                      <th className="px-4 py-3 text-center font-semibold">Profundidad</th>
                      <th className="px-4 py-3 text-center font-semibold">Ancho</th>
                      <th className="px-4 py-3 text-center font-semibold">Altura bovedilla (hb)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t bg-cyan-50">
                      <td className="px-4 py-3 font-bold text-cyan-700">P-15</td>
                      <td className="px-4 py-3 text-center">58 cm</td>
                      <td className="px-4 py-3 text-center">122 cm</td>
                      <td className="px-4 py-3 text-center">63 cm</td>
                      <td className="px-4 py-3 text-center font-medium">7.5 cm</td>
                    </tr>
                    <tr className="border-t bg-violet-50">
                      <td className="px-4 py-3 font-bold text-violet-700">P-20</td>
                      <td className="px-4 py-3 text-center">58 cm</td>
                      <td className="px-4 py-3 text-center">122 cm</td>
                      <td className="px-4 py-3 text-center">63 cm</td>
                      <td className="px-4 py-3 text-center font-medium">12.5 cm</td>
                    </tr>
                    <tr className="border-t bg-rose-50">
                      <td className="px-4 py-3 font-bold text-rose-700">P-25</td>
                      <td className="px-4 py-3 text-center">58 cm</td>
                      <td className="px-4 py-3 text-center">122 cm</td>
                      <td className="px-4 py-3 text-center">63 cm</td>
                      <td className="px-4 py-3 text-center font-medium">17.5 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Contraflecha y Espesor de Firme */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-primary" />
                  Contraflecha Recomendada
                </CardTitle>
                <CardDescription>Elevación al centro para compensar deflexión</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Claro (m)</th>
                      <th className="px-3 py-2 text-right font-medium">Contraflecha (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2">hasta 3.0 m</td>
                      <td className="px-3 py-2 text-right font-medium text-primary">0 cm</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2">3.0 - 4.0 m</td>
                      <td className="px-3 py-2 text-right font-medium text-primary">0.5 cm</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2">4.0 - 5.0 m</td>
                      <td className="px-3 py-2 text-right font-medium text-primary">1.5 cm</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2">arriba de 5.0 m</td>
                      <td className="px-3 py-2 text-right font-medium text-primary">2.0 cm</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent" />
                  Espesor del Firme de Concreto
                </CardTitle>
                <CardDescription>Capa de compresión mínima según claro</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Claro (m)</th>
                      <th className="px-3 py-2 text-right font-medium">Espesor mín (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2">hasta 5.0 m</td>
                      <td className="px-3 py-2 text-right font-medium text-accent">5 cm</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2">arriba de 6.0 m</td>
                      <td className="px-3 py-2 text-right font-medium text-accent">6 cm</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Resistencia mínima del concreto:</strong> f'c = 200 kg/cm² (recomendado 250 kg/cm²)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-2 border-dashed border-muted-foreground/20">
            <CardHeader className="bg-slate-100 dark:bg-slate-900 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                Diagrama Técnico de Cimbrado
              </CardTitle>
              <CardDescription>
                Referencia visual con dimensiones y nomenclatura de elementos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-white flex justify-center">
                <img 
                  src={cimbradoTecnicoImg} 
                  alt="Diagrama técnico de cimbrado para losa vigueta bovedilla" 
                  className="max-w-full h-auto max-h-[500px] object-contain grayscale"
                />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-600 rounded"></div>
                    <span><strong>Puntal:</strong> Soporte vertical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded"></div>
                    <span><strong>Madrina:</strong> Viga horizontal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-400 rounded"></div>
                    <span><strong>Contramadrina:</strong> Apoyo secundario</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-300 rounded"></div>
                    <span><strong>Barrote:</strong> Unión con vigueta</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Separación máxima entre puntales: 1.50 m | Bovedilla: 1.22 m × 0.63 m
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {installationSteps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">{step.step}</span>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Duración</p>
                        <p className="text-sm font-semibold text-primary">{step.duration}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <step.icon className="h-5 w-5 text-accent" />
                        </div>
                        <h3 className="text-xl font-bold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          Consejos del experto
                        </p>
                        <ul className="space-y-1">
                          {step.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                {index < installationSteps.length - 1 && (
                  <div className="flex justify-center py-2 bg-muted/20">
                    <ArrowDown className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800 mb-1">Listo para recibir acabados</h3>
                  <p className="text-green-700 text-sm">
                    Después del curado de 7 días, la losa está lista para recibir instalaciones eléctricas, hidráulicas, 
                    y acabados finales como firmes, losetas o pisos laminados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl shrink-0">
                  <Leaf className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Apoyo al Medio Ambiente</h3>
                  <p className="text-primary-foreground/80 text-sm">
                    El sistema V&B utiliza <strong className="text-accent">30% menos agua</strong> y <strong className="text-accent">70% menos cimbrado</strong> que la losa tradicional. 
                    <strong className="text-white">Cálculos validados por ingenieros y arquitectos.</strong> Empresas socialmente responsables.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground">
              Resolvemos las dudas más comunes sobre el sistema Vigueta y Bovedilla
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline" data-testid={`faq-trigger-${index}`}>
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Normatividad Aplicable
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "NMX-C-406-ONNCCE - Viguetas de concreto",
                  "NTC-2017 - Normas Técnicas Complementarias",
                  "NOM-020-ENER - Eficiencia energética",
                  "RCDF-2017 - Reglamento de Construcciones"
                ].map((norm, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    {norm}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Herramientas Necesarias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Nivel láser o manguera de nivel",
                  "Hilo y plomada",
                  "Cutter para cortar bovedillas",
                  "Silletas separadoras",
                  "Vibrador de concreto (opcional)"
                ].map((tool, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-purple-700">
                    <CheckCircle2 className="h-4 w-4 text-purple-500" />
                    {tool}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <EnvironmentalBenefits variant="full" showTitle={true} />
      </div>
    </Layout>
  );
}
