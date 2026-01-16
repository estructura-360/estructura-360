import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Info, Target, Zap, Shield, Heart, Leaf, ArrowRight, CheckCircle2, TrendingDown, Clock, Weight, Building, Users, Award, Calculator, FileText, BarChart3, Calendar } from "lucide-react";

import heroImage from "@assets/IMG_6247_1768590612991.png";
import blueprintImage from "@assets/stock_images/construction_enginee_10031660.jpg";
import workerImage from "@assets/stock_images/professional_constru_4a783fb5.jpg";
import houseImage from "@assets/stock_images/modern_house_constru_639f58c6.jpg";

const stats = [
  { value: "45%", label: "Menos peso estructural", icon: Weight },
  { value: "50%", label: "Más rápido de construir", icon: Clock },
  { value: "40%", label: "Ahorro en climatización", icon: Zap },
  { value: "35%", label: "Menos concreto", icon: TrendingDown },
];

const features = [
  {
    icon: Calculator,
    title: "Calculadora Inteligente",
    description: "Genera cálculos de materiales precisos para losas y muros. Planos de distribución automáticos que minimizan desperdicio.",
    link: "/",
    color: "bg-blue-500"
  },
  {
    icon: FileText,
    title: "Presupuestos Profesionales",
    description: "Crea cotizaciones formales en PDF con desglose de materiales, mano de obra y márgenes de utilidad configurables.",
    link: "/budget",
    color: "bg-green-500"
  },
  {
    icon: BarChart3,
    title: "Análisis Comparativo",
    description: "Visualiza el ahorro real en concreto, tiempo y peso vs. sistemas tradicionales. Datos que convencen.",
    link: "/comparative",
    color: "bg-purple-500"
  },
  {
    icon: Calendar,
    title: "Programación de Obra",
    description: "Diagrama de Gantt interactivo para planificar fases. Dependencias entre tareas y seguimiento de avance.",
    link: "/schedule",
    color: "bg-orange-500"
  },
];

const benefits = [
  "Cálculos validados por ingenieros estructuristas certificados",
  "Funciona offline en obra - sincroniza automáticamente con WiFi",
  "Bitácora fotográfica con GPS para documentación profesional",
  "Presupuestos en PDF listos para presentar a clientes",
  "Comparativas visuales que facilitan la venta del sistema",
  "Optimización automática de cortes para minimizar desperdicio",
];

export default function AboutPage() {
  return (
    <Layout>
      <div className="space-y-16 pb-12">
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl text-white">
          <div className="absolute inset-0">
            <img src={heroImage} alt="Equipo de construcción ESTRUCTURA 360" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40" />
          </div>
          
          <div className="relative max-w-4xl mx-auto text-center space-y-6 p-4 sm:p-6 md:p-8 lg:p-12 pt-32 sm:pt-40 md:pt-48">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
              Tecnología Construtech
            </Badge>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight">
              Construye Mejor, Más Rápido<br className="hidden sm:block" /> y Más Eficiente
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              ESTRUCTURA 360 es la plataforma profesional que digitaliza la construcción con sistemas 
              de vigueta y bovedilla. Herramientas de ingeniería al alcance de todos.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-xl shadow-lg" data-testid="button-start-calculating">
                  Comenzar a Calcular
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/technical">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl" data-testid="button-learn-more">
                  Conocer el Sistema
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg bg-gradient-to-br from-white to-muted/20">
              <CardContent className="pt-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-accent/10 rounded-xl flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-3">
              ¿Por qué Vigueta y Bovedilla?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              El sistema constructivo más utilizado en Latinoamérica ofrece ventajas incomparables 
              frente a la losa maciza tradicional de concreto.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="h-2 bg-gradient-to-r from-red-400 to-red-600" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Building className="h-5 w-5" />
                  Losa Maciza Tradicional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "350-450 kg/m² de peso muerto",
                  "Requiere cimbra completa costosa",
                  "8-12 m²/día de avance típico",
                  "Nulo aislamiento térmico (R-value ~1)",
                  "Mayor demanda sísmica en la estructura",
                  "Alto consumo de concreto y acero",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-red-600 text-xs font-bold">-</span>
                    </div>
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-xl ring-2 ring-green-200">
              <div className="h-2 bg-gradient-to-r from-green-400 to-green-600" />
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Shield className="h-5 w-5" />
                    Vigueta y Bovedilla
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-700">Recomendado</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "180-220 kg/m² - 45% más ligero",
                  "Mínimo cimbrado - ahorro del 80%",
                  "25-35 m²/día - 3x más rápido",
                  "Excelente aislamiento térmico (R-value 3+)",
                  "Menor demanda sísmica = más seguro",
                  "Optimiza materiales y reduce costos",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    </div>
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img src={blueprintImage} alt="Planos de ingeniería" className="w-full h-64 md:h-80 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-bold text-lg">Precisión en Cada Cálculo</h3>
              <p className="text-sm text-white/80">Herramientas validadas por ingenieros estructuristas</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img src={workerImage} alt="Profesional de construcción" className="w-full h-64 md:h-80 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-accent/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-bold text-lg">Para Profesionales</h3>
              <p className="text-sm text-white/80">Diseñado para constructores, ingenieros y arquitectos</p>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 rounded-2xl sm:rounded-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-3">
              Herramientas Profesionales
            </h2>
            <p className="text-muted-foreground text-lg">
              Todo lo que necesitas para calcular, presupuestar y ejecutar proyectos de construcción
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Link key={index} href={feature.link}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Nuestra Misión</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Digitalizar y profesionalizar la industria de la construcción ligera, proporcionando 
                  herramientas de cálculo precisas que permitan a constructores, maestros de obra y familias 
                  tomar decisiones informadas, económicas y sostenibles.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/10 shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Nuestra Visión</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Ser la plataforma líder en el sector Construtech, impulsando un estándar de edificación 
                  que priorice la seguridad estructural, el ahorro energético y la reducción de costos 
                  en vivienda para toda Latinoamérica.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-6 w-6 text-accent" />
            <h2 className="text-xl sm:text-2xl font-display font-bold text-primary">
              El Corazón del Proyecto
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
              <Zap className="h-8 w-8 text-blue-600 shrink-0" />
              <div>
                <h3 className="font-bold text-primary mb-1">Eficiencia Térmica de por Vida</h3>
                <p className="text-sm text-muted-foreground">
                  La bovedilla de poliestireno crea una barrera térmica permanente que reduce el consumo 
                  de energía en climatización hasta un 40%. Una inversión que se paga sola.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
              <Shield className="h-8 w-8 text-purple-600 shrink-0" />
              <div>
                <h3 className="font-bold text-primary mb-1">Seguridad Sísmica Superior</h3>
                <p className="text-sm text-muted-foreground">
                  Al reducir el peso de la estructura hasta 45%, disminuimos la demanda sísmica del edificio. 
                  En zonas de alto riesgo, esto puede significar la diferencia entre la vida y la pérdida.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200">
              <Users className="h-8 w-8 text-orange-600 shrink-0" />
              <div>
                <h3 className="font-bold text-primary mb-1">Dignificación del Oficio</h3>
                <p className="text-sm text-muted-foreground">
                  ESTRUCTURA 360 dota al maestro de obra de herramientas digitales de alta ingeniería, 
                  permitiéndole presentar presupuestos profesionales y transparentes a sus clientes.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200">
              <Leaf className="h-8 w-8 text-green-600 shrink-0" />
              <div>
                <h3 className="font-bold text-primary mb-1">Construcción Sostenible</h3>
                <p className="text-sm text-muted-foreground">
                  Al optimizar el uso de concreto y acero, reducimos directamente la huella hídrica 
                  y de carbono. Cada metro cuadrado con vigueta y bovedilla es un paso hacia la sostenibilidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold">
              ¿Listo para Modernizar tu Construcción?
            </h2>
            <p className="text-white/80 text-lg">
              Comienza ahora a calcular materiales, generar presupuestos profesionales 
              y convencer a tus clientes con datos reales.
            </p>
            
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Link href="/">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-xl shadow-lg mt-4" data-testid="button-cta-calculate">
                Hacer Mi Primer Cálculo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
