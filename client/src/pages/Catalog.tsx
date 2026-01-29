import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Layers, 
  Grid3X3, 
  PanelTop,
  ArrowLeft,
  Ruler,
  Scale,
  Shield,
  Thermometer,
  Clock,
  CheckCircle2
} from "lucide-react";
import { 
  EPS_DENSITY, 
  PERALTE_HEIGHTS, 
  MALLA_ELECTROSOLDADA, 
  PANEL_ESTRUCTURAL 
} from "@/lib/layoutPlanner";
import { EnvironmentalBenefits } from "@/components/EnvironmentalBenefits";

interface ProductSpec {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function ProductCard({ 
  title, 
  description, 
  specs, 
  features,
  badge
}: { 
  title: string; 
  description: string; 
  specs: ProductSpec[];
  features: string[];
  badge?: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Especificaciones</h4>
          <div className="grid gap-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  {spec.icon}
                  {spec.label}
                </span>
                <span className="font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Características</h4>
          <ul className="space-y-1">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CatalogPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("viguetas");

  const viguetaAlmaAbiertaProducts = [
    {
      title: "Vigueta de Alma Abierta P-15",
      description: "Ligera y fácil de manejar. Para claros hasta 4.00 metros.",
      badge: "Claro ≤ 4m",
      specs: [
        { label: "Peralte", value: "15 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Largo máximo", value: "4.00 m", icon: <Ruler className="h-3 w-3" /> },
        { label: "Separación entre ejes", value: "70 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Peso aproximado", value: "8 kg/m", icon: <Scale className="h-3 w-3" /> },
      ],
      features: [
        "Peso ligero para fácil manejo",
        "Estructura abierta tipo celosía",
        "Compatible con bovedilla P-15",
        "Ideal para autoconstrucción"
      ]
    },
    {
      title: "Vigueta de Alma Abierta P-20",
      description: "Versátil y económica. Para claros hasta 5.00 metros.",
      badge: "Claro ≤ 5m",
      specs: [
        { label: "Peralte", value: "20 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Largo máximo", value: "5.00 m", icon: <Ruler className="h-3 w-3" /> },
        { label: "Separación entre ejes", value: "70 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Peso aproximado", value: "10 kg/m", icon: <Scale className="h-3 w-3" /> },
      ],
      features: [
        "Excelente relación costo-beneficio",
        "Fácil transporte y colocación",
        "Compatible con bovedilla P-20",
        "Uso residencial general"
      ]
    },
    {
      title: "Vigueta de Alma Abierta P-25",
      description: "Para claros amplios hasta 6.00 metros. Mayor versatilidad.",
      badge: "Claro ≤ 6m",
      specs: [
        { label: "Peralte", value: "25 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Largo máximo", value: "6.00 m", icon: <Ruler className="h-3 w-3" /> },
        { label: "Separación entre ejes", value: "70 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Peso aproximado", value: "12 kg/m", icon: <Scale className="h-3 w-3" /> },
      ],
      features: [
        "Estructura tipo celosía reforzada",
        "Capacidad para claros medianos",
        "Compatible con bovedilla P-25",
        "Norma NMX-C-407-ONNCCE"
      ]
    }
  ];

  const viguetaPretensadaProducts = [
    {
      title: "Vigueta Pretensada P-15",
      description: "Más robusta para claros hasta 4.00 metros. Mayor capacidad de carga.",
      badge: "Claro ≤ 4m",
      specs: [
        { label: "Peralte", value: "15 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Largo máximo", value: "4.00 m", icon: <Ruler className="h-3 w-3" /> },
        { label: "Separación entre ejes", value: "70 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Peso aproximado", value: "12 kg/m", icon: <Scale className="h-3 w-3" /> },
      ],
      features: [
        "Alta resistencia a la compresión",
        "Acero pretensado de alta resistencia",
        "Compatible con bovedilla P-15",
        "Norma NMX-C-407-ONNCCE"
      ]
    },
    {
      title: "Vigueta Pretensada P-20",
      description: "Para claros hasta 5.00 metros. Uso general en construcción residencial.",
      badge: "Claro ≤ 5m",
      specs: [
        { label: "Peralte", value: "20 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Largo máximo", value: "5.00 m", icon: <Ruler className="h-3 w-3" /> },
        { label: "Separación entre ejes", value: "70 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Peso aproximado", value: "15 kg/m", icon: <Scale className="h-3 w-3" /> },
      ],
      features: [
        "Mayor capacidad de carga",
        "Ideal para entrepisos",
        "Compatible con bovedilla P-20",
        "Resistencia f'c = 250 kg/cm²"
      ]
    },
    {
      title: "Vigueta Pretensada P-25",
      description: "Para claros hasta 10.00 metros. Uso en espacios amplios y comerciales.",
      badge: "Claro ≤ 10m",
      specs: [
        { label: "Peralte", value: "25 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Largo máximo", value: "10.00 m", icon: <Ruler className="h-3 w-3" /> },
        { label: "Separación entre ejes", value: "70 cm", icon: <Ruler className="h-3 w-3" /> },
        { label: "Peso aproximado", value: "18 kg/m", icon: <Scale className="h-3 w-3" /> },
      ],
      features: [
        "Máxima capacidad estructural",
        "Para grandes claros sin apoyos",
        "Compatible con bovedilla P-25",
        "Certificación estructural"
      ]
    }
  ];

  const bovedillaProducts = [
    {
      title: "Bovedilla EPS P-15",
      description: "Bovedilla de poliestireno expandido para sistema vigueta-bovedilla peralte 15.",
      badge: "Peralte 15 cm",
      specs: [
        { label: "Dimensiones", value: "1.22 × 0.63 × 0.15 m", icon: <Ruler className="h-3 w-3" /> },
        { label: "Densidad EPS", value: `${EPS_DENSITY} kg/m³`, icon: <Scale className="h-3 w-3" /> },
        { label: "Peso por pieza", value: "~0.9 kg", icon: <Scale className="h-3 w-3" /> },
        { label: "Volumen unitario", value: `${(1.22 * 0.63 * 0.15).toFixed(3)} m³`, icon: <Layers className="h-3 w-3" /> },
      ],
      features: [
        "Aislamiento térmico superior",
        "Peso ultraligero",
        "Fácil corte y ajuste en obra",
        "30% ahorro en agua vs losa tradicional"
      ]
    },
    {
      title: "Bovedilla EPS P-20",
      description: "Bovedilla de poliestireno expandido para sistema vigueta-bovedilla peralte 20.",
      badge: "Peralte 20 cm",
      specs: [
        { label: "Dimensiones", value: "1.22 × 0.63 × 0.20 m", icon: <Ruler className="h-3 w-3" /> },
        { label: "Densidad EPS", value: `${EPS_DENSITY} kg/m³`, icon: <Scale className="h-3 w-3" /> },
        { label: "Peso por pieza", value: "~1.2 kg", icon: <Scale className="h-3 w-3" /> },
        { label: "Volumen unitario", value: `${(1.22 * 0.63 * 0.20).toFixed(3)} m³`, icon: <Layers className="h-3 w-3" /> },
      ],
      features: [
        "Mayor aislamiento térmico",
        "Compatible con instalaciones ocultas",
        "Reduce tiempo de colocación 60-70%",
        "85% ahorro en cimbra"
      ]
    },
    {
      title: "Bovedilla EPS P-25",
      description: "Bovedilla de poliestireno expandido para sistema vigueta-bovedilla peralte 25.",
      badge: "Peralte 25 cm",
      specs: [
        { label: "Dimensiones", value: "1.22 × 0.63 × 0.25 m", icon: <Ruler className="h-3 w-3" /> },
        { label: "Densidad EPS", value: `${EPS_DENSITY} kg/m³`, icon: <Scale className="h-3 w-3" /> },
        { label: "Peso por pieza", value: "~1.5 kg", icon: <Scale className="h-3 w-3" /> },
        { label: "Volumen unitario", value: `${(1.22 * 0.63 * 0.25).toFixed(3)} m³`, icon: <Layers className="h-3 w-3" /> },
      ],
      features: [
        "Máximo aislamiento térmico",
        "Ideal para grandes claros",
        "Cámaras para tuberías e instalaciones",
        "Peso estructural reducido 180 kg/m²"
      ]
    }
  ];

  const mallaProduct = {
    title: "Malla Electrosoldada 66-10×10",
    description: "Malla de acero electrosoldada para refuerzo de losas y capas de compresión.",
    badge: "Calibre 10",
    specs: [
      { label: "Tipo", value: MALLA_ELECTROSOLDADA.type, icon: <Grid3X3 className="h-3 w-3" /> },
      { label: "Calibre", value: `${MALLA_ELECTROSOLDADA.caliber}`, icon: <Ruler className="h-3 w-3" /> },
      { label: "Abertura", value: `${MALLA_ELECTROSOLDADA.aperture * 100} × ${MALLA_ELECTROSOLDADA.aperture * 100} cm`, icon: <Grid3X3 className="h-3 w-3" /> },
      { label: "Dimensiones hoja", value: `${MALLA_ELECTROSOLDADA.sheetWidth} × ${MALLA_ELECTROSOLDADA.sheetLength} m`, icon: <Ruler className="h-3 w-3" /> },
      { label: "Traslape recomendado", value: `${MALLA_ELECTROSOLDADA.overlap * 100} cm`, icon: <Ruler className="h-3 w-3" /> },
    ],
    features: [
      "Refuerzo para capa de compresión",
      "Distribución uniforme de cargas",
      "Fácil instalación y amarre",
      "Control de agrietamiento",
      "Cálculo: área de losa + 2% desperdicio"
    ]
  };

  const panelProducts = [
    {
      title: "Panel Estructural 2\"",
      description: "Panel de poliestireno con doble malla electrosoldada para muros.",
      badge: "Espesor 2\"",
      specs: [
        { label: "Dimensiones", value: `${PANEL_ESTRUCTURAL.width} × ${PANEL_ESTRUCTURAL.length} m`, icon: <Ruler className="h-3 w-3" /> },
        { label: "Espesor", value: "2 pulgadas (5 cm)", icon: <Ruler className="h-3 w-3" /> },
        { label: "Densidad EPS", value: "14-16 kg/m³", icon: <Scale className="h-3 w-3" /> },
        { label: "Mallas por panel", value: `${PANEL_ESTRUCTURAL.meshes} (calibre ${PANEL_ESTRUCTURAL.meshCaliber})`, icon: <Grid3X3 className="h-3 w-3" /> },
        { label: "Longitud especial", value: `Hasta ${PANEL_ESTRUCTURAL.maxLength} m`, icon: <Ruler className="h-3 w-3" /> },
      ],
      features: [
        "Sistema constructivo ligero",
        "Alto aislamiento térmico",
        "Rápida instalación",
        "Cálculo: área de muro + 2% desperdicio"
      ]
    },
    {
      title: "Panel Estructural 3\"",
      description: "Panel de poliestireno con doble malla electrosoldada para muros.",
      badge: "Espesor 3\"",
      specs: [
        { label: "Dimensiones", value: `${PANEL_ESTRUCTURAL.width} × ${PANEL_ESTRUCTURAL.length} m`, icon: <Ruler className="h-3 w-3" /> },
        { label: "Espesor", value: "3 pulgadas (7.6 cm)", icon: <Ruler className="h-3 w-3" /> },
        { label: "Densidad EPS", value: "14-16 kg/m³", icon: <Scale className="h-3 w-3" /> },
        { label: "Mallas por panel", value: `${PANEL_ESTRUCTURAL.meshes} (calibre ${PANEL_ESTRUCTURAL.meshCaliber})`, icon: <Grid3X3 className="h-3 w-3" /> },
        { label: "Longitud especial", value: `Hasta ${PANEL_ESTRUCTURAL.maxLength} m`, icon: <Ruler className="h-3 w-3" /> },
      ],
      features: [
        "Mayor aislamiento térmico",
        "Excelente para climas extremos",
        "Fácil paso de instalaciones",
        "Normas aplicables: NMX-C"
      ]
    },
    {
      title: "Panel Estructural 4\"",
      description: "Panel de poliestireno con doble malla electrosoldada para muros.",
      badge: "Espesor 4\"",
      specs: [
        { label: "Dimensiones", value: `${PANEL_ESTRUCTURAL.width} × ${PANEL_ESTRUCTURAL.length} m`, icon: <Ruler className="h-3 w-3" /> },
        { label: "Espesor", value: "4 pulgadas (10 cm)", icon: <Ruler className="h-3 w-3" /> },
        { label: "Densidad EPS", value: "14-16 kg/m³", icon: <Scale className="h-3 w-3" /> },
        { label: "Mallas por panel", value: `${PANEL_ESTRUCTURAL.meshes} (calibre ${PANEL_ESTRUCTURAL.meshCaliber})`, icon: <Grid3X3 className="h-3 w-3" /> },
        { label: "Longitud especial", value: `Hasta ${PANEL_ESTRUCTURAL.maxLength} m`, icon: <Ruler className="h-3 w-3" /> },
      ],
      features: [
        "Óptimo para zonas frías",
        "Reduce costos de climatización",
        "Alta resistencia estructural",
        "Acabado liso para aplicar mortero"
      ]
    },
    {
      title: "Panel Estructural 5\"",
      description: "Panel de poliestireno con doble malla electrosoldada para muros.",
      badge: "Espesor 5\"",
      specs: [
        { label: "Dimensiones", value: `${PANEL_ESTRUCTURAL.width} × ${PANEL_ESTRUCTURAL.length} m`, icon: <Ruler className="h-3 w-3" /> },
        { label: "Espesor", value: "5 pulgadas (12.7 cm)", icon: <Ruler className="h-3 w-3" /> },
        { label: "Densidad EPS", value: "14-16 kg/m³", icon: <Scale className="h-3 w-3" /> },
        { label: "Mallas por panel", value: `${PANEL_ESTRUCTURAL.meshes} (calibre ${PANEL_ESTRUCTURAL.meshCaliber})`, icon: <Grid3X3 className="h-3 w-3" /> },
        { label: "Longitud especial", value: `Hasta ${PANEL_ESTRUCTURAL.maxLength} m`, icon: <Ruler className="h-3 w-3" /> },
      ],
      features: [
        "Máximo aislamiento térmico",
        "Ideal para cuartos fríos",
        "Certificación estructural",
        "Reducción de costos energéticos"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-[#0f172a] text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                className="text-white hover:bg-white/10"
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Catálogo de Productos</h1>
                <p className="text-sm text-white/70">ESTRUCTURA 360</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="viguetas" className="flex items-center gap-2 py-3" data-testid="tab-viguetas">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Viguetas</span>
            </TabsTrigger>
            <TabsTrigger value="bovedillas" className="flex items-center gap-2 py-3" data-testid="tab-bovedillas">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Bovedillas</span>
            </TabsTrigger>
            <TabsTrigger value="malla" className="flex items-center gap-2 py-3" data-testid="tab-malla">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Malla</span>
            </TabsTrigger>
            <TabsTrigger value="paneles" className="flex items-center gap-2 py-3" data-testid="tab-paneles">
              <PanelTop className="h-4 w-4" />
              <span className="hidden sm:inline">Paneles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="viguetas" className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Viguetas para Sistema V&B
              </h3>
              <p className="text-sm text-muted-foreground">
                Dos tipos de viguetas disponibles: <strong>Alma Abierta</strong> (ligera, fácil manejo) y <strong>Pretensada</strong> (mayor capacidad de carga).
                Separación estándar entre ejes: 70 cm. Resistencia f'c = 250 kg/cm².
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-primary">Vigueta de Alma Abierta</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Estructura tipo celosía, peso ligero. Ideal para autoconstrucción y proyectos donde el manejo fácil es prioritario.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {viguetaAlmaAbiertaProducts.map((product, i) => (
                  <ProductCard key={`alma-${i}`} {...product} />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-primary">Vigueta Pretensada</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Mayor capacidad de carga y claros más amplios. Ideal para entrepisos y espacios comerciales.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {viguetaPretensadaProducts.map((product, i) => (
                  <ProductCard key={`pret-${i}`} {...product} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bovedillas" className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Bovedillas de Poliestireno (EPS)
              </h3>
              <p className="text-sm text-muted-foreground">
                Bovedillas de poliestireno expandido con densidad fija de {EPS_DENSITY} kg/m³. 
                Dimensiones estándar: 1.22 m × 0.63 m. Las cámaras entre viguetas y bovedillas facilitan 
                el paso de tuberías eléctricas, hidrosanitarias y servicios sin cortes extensivos.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bovedillaProducts.map((product, i) => (
                <ProductCard key={i} {...product} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="malla" className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-primary" />
                Malla Electrosoldada
              </h3>
              <p className="text-sm text-muted-foreground">
                Refuerzo de acero electrosoldado para capas de compresión en losas vigueta-bovedilla.
                Cálculo basado en área total de losa + 2% de desperdicio. Considerar traslapes y ensambles.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ProductCard {...mallaProduct} />
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    Normas y Certificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">La malla electrosoldada cumple con:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      NMX-B-253-CANACERO
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Resistencia fy = 5,000 kg/cm²
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Soldadura por resistencia eléctrica
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-blue-500" />
                    Cálculo de Cantidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Fórmula:</p>
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2 font-mono text-xs">
                      Área malla = Área losa × 1.02
                    </div>
                    <p className="font-medium mt-3">Hojas requeridas:</p>
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2 font-mono text-xs">
                      Hojas = Área malla ÷ ({MALLA_ELECTROSOLDADA.sheetWidth} × {MALLA_ELECTROSOLDADA.sheetLength})
                    </div>
                    <p className="text-muted-foreground mt-2">
                      Redondear hacia arriba al entero más cercano.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="paneles" className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <PanelTop className="h-5 w-5 text-primary" />
                Panel Estructural
              </h3>
              <p className="text-sm text-muted-foreground">
                Sistema de paneles de poliestireno expandido reforzados con 2 mallas electrosoldadas calibre 14.
                Dimensiones estándar: {PANEL_ESTRUCTURAL.width} m × {PANEL_ESTRUCTURAL.length} m. 
                Longitudes especiales hasta {PANEL_ESTRUCTURAL.maxLength} m. Densidad ajustable: 14-16 kg/m³.
                Cálculo: área de muro + 2% desperdicio.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {panelProducts.map((product, i) => (
                <ProductCard key={i} {...product} />
              ))}
            </div>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Ventajas del Sistema de Paneles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Rapidez</h4>
                    <p className="text-sm text-muted-foreground">
                      Construcción hasta 3 veces más rápida que sistemas tradicionales.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Aislamiento</h4>
                    <p className="text-sm text-muted-foreground">
                      Excelente aislamiento térmico y acústico integrado.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Instalaciones</h4>
                    <p className="text-sm text-muted-foreground">
                      Fácil integración de instalaciones eléctricas e hidrosanitarias.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <EnvironmentalBenefits variant="compact" />
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => setLocation("/")} data-testid="button-calculator">
            Ir a Calculadora
          </Button>
          <Button variant="outline" onClick={() => setLocation("/comparative")} data-testid="button-comparative">
            Ver Comparativa
          </Button>
        </div>
      </main>
    </div>
  );
}
