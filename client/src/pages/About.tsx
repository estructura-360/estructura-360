import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Target, Zap, Shield, Heart, Leaf } from "lucide-react";

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-bold text-primary">Acerca de ESTRUCTURA 360</h1>
          <p className="text-xl text-muted-foreground">Innovación Construtech para una edificación sostenible y eficiente.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-primary/10 shadow-md">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Misión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                "Digitalizar y profesionalizar la industria de la construcción ligera, proporcionando herramientas de cálculo precisas que permitan a los constructores, albañiles y familias tomar decisiones informadas, económicas y sostenibles."
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-md">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Visión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                "Ser la plataforma líder en el sector Construtech, impulsando un estándar de edificación que priorice la seguridad estructural, el ahorro energético y la reducción de costos en la vivienda, transformando cada obra en un modelo de eficiencia."
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <Heart className="h-6 w-6 text-accent" />
            Nuestro Impacto (El Corazón del Proyecto)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
              <Zap className="h-8 w-8 text-accent shrink-0" />
              <div>
                <h3 className="font-bold text-primary">Eficiencia Térmica</h3>
                <p className="text-sm text-muted-foreground">La utilización de bovedilla de poliestireno crea una barrera térmica de estructura celular cerrada que reduce el consumo de energía eléctrica de por vida en el hogar.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
              <Shield className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-primary">Seguridad Estructural</h3>
                <p className="text-sm text-muted-foreground">Al reducir el peso propio de la losa y muros hasta en un 40% (utilizando densidades de 10 a 25 kg/m³), disminuimos la carga sísmica del edificio, salvando vidas y protegiendo patrimonios.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
              <Info className="h-8 w-8 text-accent shrink-0" />
              <div>
                <h3 className="font-bold text-primary">Dignificación del Oficio</h3>
                <p className="text-sm text-muted-foreground">Estructura 360 dota al maestro de obra de herramientas digitales de alta ingeniería, permitiéndole presentar presupuestos profesionales y transparentes.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
              <Leaf className="h-8 w-8 text-green-600 shrink-0" />
              <div>
                <h3 className="font-bold text-primary">Sostenibilidad</h3>
                <p className="text-sm text-muted-foreground">Al optimizar el uso de concreto y acero, reducimos directamente la huella hídrica y de carbono en cada metro cuadrado construido.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
