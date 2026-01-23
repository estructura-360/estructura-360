import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Ruler, Layers, ShieldCheck, Zap, ThermometerSun, Clock, Weight, CheckCircle2, ArrowDown, Hammer, Truck, HardHat, Wrench, Building, BookOpen, AlertCircle, Lightbulb, Package, Construction, Grid3X3 } from "lucide-react";

import constructionImage from "@assets/stock_images/modern_construction__77c2c1d4.jpg";
import cimbradoTecnicoImg from "@assets/IMG_6379_1769205801594.jpeg";

const beams = [
  { 
    name: "P-15", 
    maxSpan: "3.50m", 
    use: "Residencial ligero", 
    load: "250 kg/m²",
    height: "15 cm",
    applications: ["Casas unifamiliares", "Garajes techados", "Anexos y cuartos adicionales"],
    idealFor: "Claros pequeños y cargas ligeras"
  },
  { 
    name: "P-20", 
    maxSpan: "5.50m", 
    use: "Residencial medio / Oficinas", 
    load: "350 kg/m²",
    height: "20 cm",
    applications: ["Vivienda de interés medio", "Oficinas pequeñas", "Comercios en planta alta"],
    idealFor: "La opción más versátil y común"
  },
  { 
    name: "P-25", 
    maxSpan: "7.00m", 
    use: "Comercial / Claros largos", 
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
    description: "Verificar nivel y alineación de muros o trabes de apoyo. Colocar apoyos temporales (polines) a cada 2-2.5m en claros mayores a 3m.",
    duration: "2-4 horas",
    icon: HardHat,
    tips: ["Verificar nivel con láser o manguera", "Usar calzas para nivelar polines", "Marcar posición de viguetas en muros"]
  },
  {
    step: 2,
    title: "Colocación de Viguetas",
    description: "Distribuir viguetas a 75cm entre ejes. Respetar apoyo mínimo de 5cm en extremos. En claros >6m usar traslape de 30cm.",
    duration: "1-2 horas por 20m²",
    icon: Truck,
    tips: ["No arrastrar las viguetas", "Colocar primero las de los extremos", "Verificar alineación con hilo"]
  },
  {
    step: 3,
    title: "Instalación de Bovedillas",
    description: "Colocar bovedillas de poliestireno entre viguetas. Iniciar desde un extremo. Cortar con cutter para ajustes en bordes.",
    duration: "30 min por 10m²",
    icon: Package,
    tips: ["No pisar directamente las bovedillas", "Usar tablas para circular", "Dejar espacios para instalaciones"]
  },
  {
    step: 4,
    title: "Armado de Capa de Compresión",
    description: "Colocar malla electrosoldada 6x6-10/10 sobre bovedillas. Traslapar mallas mínimo 20cm. Colocar silletas separadoras.",
    duration: "1 hora por 30m²",
    icon: Grid3X3,
    tips: ["Usar separadores plásticos", "Verificar traslapes", "Revisar que la malla cubra toda el área"]
  },
  {
    step: 5,
    title: "Colado",
    description: "Usar concreto f'c=250 kg/cm² (recomendado para Losa Vigueta Bovedilla) con revenimiento 12-14 cm. Espesor mínimo de capa de compresión: 4cm sobre bovedilla.",
    duration: "Depende del área",
    icon: Construction,
    tips: ["No concentrar concreto en un punto", "Vibrar ligeramente", "Curar por mínimo 7 días"]
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
    name: "Vigueta Pretensada",
    description: "Elemento lineal de concreto con acero de presfuerzo que trabaja a flexión. Fabricada en planta con control de calidad riguroso.",
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
                <strong className="text-primary"> viguetas pretensadas</strong> (elementos estructurales) con 
                <strong className="text-primary"> bovedillas aligerantes</strong> (elementos de relleno), unidos por una 
                <strong className="text-primary"> capa de compresión</strong> de concreto armado.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 bg-white rounded-xl border shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold mb-2">Estructuralmente Superior</h3>
                  <p className="text-sm text-muted-foreground">
                    Las viguetas pretensadas tienen mayor capacidad de carga que el concreto armado convencional, 
                    permitiendo claros más largos sin apoyos intermedios.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-xl border shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Weight className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold mb-2">45% Más Ligero</h3>
                  <p className="text-sm text-muted-foreground">
                    Las bovedillas de poliestireno reducen drásticamente el peso de la losa, 
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
                  <h3 className="text-xl font-bold text-primary mb-2">¿Sabías que...?</h3>
                  <p className="text-muted-foreground">
                    El sistema vigueta y bovedilla se utiliza en más del <strong className="text-accent">70% de las construcciones residenciales</strong> en 
                    México y Latinoamérica. Es el método preferido por su balance entre costo, velocidad y desempeño estructural.
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
                <h2 className="text-2xl font-bold">Viguetas Pretensadas</h2>
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
            <h2 className="text-2xl font-bold text-primary mb-2">Guía de Instalación Paso a Paso</h2>
            <p className="text-muted-foreground">
              Sigue estos pasos para una instalación correcta del sistema. Tiempo estimado para 100m²: 2-3 días con cuadrilla de 4 personas.
            </p>
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
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 bg-gradient-to-br from-primary to-primary/80 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </div>
                    <step.icon className="h-8 w-8 text-white/80 mb-2" />
                    <p className="text-xs text-white/60 uppercase tracking-wider">Duración</p>
                    <p className="text-sm text-white font-medium">{step.duration}</p>
                  </div>
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
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
    </Layout>
  );
}
