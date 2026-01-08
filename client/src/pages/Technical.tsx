import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ruler, Layers, ShieldCheck } from "lucide-react";

const beams = [
  { name: "P-15", maxSpan: "3.50m", use: "Residencial ligero", load: "250 kg/m²" },
  { name: "P-20", maxSpan: "5.50m", use: "Residencial medio / Oficinas", load: "350 kg/m²" },
  { name: "P-25", maxSpan: "7.00m", use: "Comercial / Claros largos", load: "500 kg/m²" },
];

export default function TechnicalPage() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-primary">Catálogo Técnico</h1>
        <p className="text-muted-foreground mt-2">Especificaciones de materiales y capacidades de carga.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Ruler className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold">Viguetas Pretensadas</h2>
          </div>
          
          {beams.map((beam) => (
            <Card key={beam.name} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="flex">
                <div className="w-24 bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-white font-display">{beam.name}</span>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-2">
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
              <CardDescription>Elige la densidad según el aislamiento requerido.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-bold text-primary">Densidad 10-12 kg/m³</p>
                  <p className="text-xs text-muted-foreground">Uso estándar en vivienda económica.</p>
                </div>
                <Badge variant="outline">Económico</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-accent/20 ring-1 ring-accent/10">
                <div>
                  <p className="font-bold text-primary">Densidad 14-16 kg/m³</p>
                  <p className="text-xs text-muted-foreground">Mejor aislamiento térmico y acústico.</p>
                </div>
                <Badge className="bg-accent hover:bg-accent/90">Recomendado</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-bold text-primary">Densidad 20-25 kg/m³</p>
                  <p className="text-xs text-muted-foreground">Alto desempeño estructural y térmico.</p>
                </div>
                <Badge variant="outline">Premium</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
