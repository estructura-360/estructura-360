import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { useProjects } from "@/hooks/use-projects";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, MapPin, Clock, Plus, Loader2, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface LogEntry {
  id: number;
  projectId: number;
  notes: string | null;
  photoUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  timestamp: string;
}

export default function LogbookPage() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: logs, isLoading: isLoadingLogs } = useQuery<LogEntry[]>({
    queryKey: ['/api/projects', selectedProjectId, 'logs'],
    enabled: !!selectedProjectId,
  });

  const createLog = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/projects/${selectedProjectId}/logs`, {
        method: 'POST',
        body: JSON.stringify({
          projectId: parseInt(selectedProjectId),
          notes,
          photoUrl: photoPreview,
          latitude: location?.lat.toString(),
          longitude: location?.lng.toString(),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProjectId, 'logs'] });
      setNotes("");
      setPhotoPreview(null);
      setLocation(null);
      setDialogOpen(false);
      toast({ title: "Registro guardado", description: "La entrada de bitácora se guardó correctamente." });
    },
  });

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsGettingLocation(false);
          toast({ title: "Ubicación obtenida", description: "Se guardará la geo-etiqueta con la foto." });
        },
        (error) => {
          setIsGettingLocation(false);
          toast({ title: "Error", description: "No se pudo obtener la ubicación.", variant: "destructive" });
        }
      );
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Bitácora Fotográfica</h1>
          <p className="text-muted-foreground mt-2">Registra el avance diario con fotos geo-etiquetadas.</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isLoadingProjects}>
            <SelectTrigger className="w-[250px] bg-white shadow-sm border-primary/20">
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
          
          {selectedProjectId && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Entrada
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuevo Registro de Bitácora</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {/* Photo capture */}
                  <div 
                    className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    ) : (
                      <>
                        <Camera className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">Toca para tomar foto o seleccionar imagen</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handlePhotoCapture}
                    />
                  </div>

                  {/* Location button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={getLocation}
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-2" />
                    )}
                    {location ? `Ubicación: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Obtener Ubicación GPS"}
                  </Button>

                  {/* Notes */}
                  <Textarea
                    placeholder="Notas del avance (opcional)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />

                  <Button 
                    className="w-full" 
                    onClick={() => createLog.mutate()}
                    disabled={!photoPreview || createLog.isPending}
                  >
                    {createLog.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Guardar en Bitácora
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {!selectedProjectId ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-muted/10 rounded-3xl border-2 border-dashed border-muted-foreground/20">
          <Camera className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg text-muted-foreground font-medium">Selecciona un proyecto para ver la bitácora</p>
        </div>
      ) : isLoadingLogs ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logs?.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Image className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>No hay entradas en la bitácora. Agrega la primera foto del avance.</p>
            </div>
          ) : (
            logs?.map((log) => (
              <Card key={log.id} className="overflow-hidden shadow-lg border-0 hover:shadow-xl transition-shadow">
                {log.photoUrl && (
                  <div className="aspect-video bg-muted">
                    <img src={log.photoUrl} alt="Avance" className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(log.timestamp), "d MMM yyyy, HH:mm", { locale: es })}
                    </div>
                    {log.latitude && log.longitude && (
                      <a
                        href={`https://maps.google.com/?q=${log.latitude},${log.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-accent hover:underline"
                      >
                        <MapPin className="h-4 w-4" />
                        Ver Mapa
                      </a>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </Layout>
  );
}
