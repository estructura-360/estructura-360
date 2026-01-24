import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Phone, Factory, Clock, Navigation, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Provider {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  schedule: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

const providers: Provider[] = [
  { 
    id: 1,
    name: "Planta Vigueta Central", 
    city: "Ciudad de México", 
    address: "Av. Insurgentes Sur 1234, Col. Del Valle",
    phone: "+52 55 5123 4567",
    lat: 19.3910,
    lng: -99.1768,
    schedule: { weekdays: "7:00 - 18:00", saturday: "8:00 - 14:00", sunday: "Cerrado" }
  },
  { 
    id: 2,
    name: "Paneles del Norte", 
    city: "Monterrey", 
    address: "Blvd. Díaz Ordaz 5678, Col. Santa María",
    phone: "+52 81 8234 5678",
    lat: 25.6866,
    lng: -100.3161,
    schedule: { weekdays: "6:30 - 17:30", saturday: "7:00 - 13:00", sunday: "Cerrado" }
  },
  { 
    id: 3,
    name: "Sistemas Constructivos GDL", 
    city: "Guadalajara", 
    address: "Calz. Lázaro Cárdenas 910, Zona Industrial",
    phone: "+52 33 3345 6789",
    lat: 20.6597,
    lng: -103.3496,
    schedule: { weekdays: "7:00 - 18:00", saturday: "8:00 - 15:00", sunday: "Cerrado" }
  },
  { 
    id: 4,
    name: "Materiales Ligeros del Sureste", 
    city: "Mérida", 
    address: "Calle 60 No. 456, Centro Histórico",
    phone: "+52 99 9456 7890",
    lat: 20.9674,
    lng: -89.5926,
    schedule: { weekdays: "7:30 - 17:00", saturday: "8:00 - 13:00", sunday: "Cerrado" }
  },
  { 
    id: 5,
    name: "Viguetas y Bovedillas Puebla", 
    city: "Puebla", 
    address: "Blvd. Atlixcáyotl 2345, Reserva Territorial",
    phone: "+52 22 2567 8901",
    lat: 19.0414,
    lng: -98.2063,
    schedule: { weekdays: "7:00 - 18:00", saturday: "8:00 - 14:00", sunday: "Cerrado" }
  },
  { 
    id: 6,
    name: "Estructuras Ligeras Tijuana", 
    city: "Tijuana", 
    address: "Blvd. Agua Caliente 7890, Zona Río",
    phone: "+52 66 4678 9012",
    lat: 32.5149,
    lng: -117.0382,
    schedule: { weekdays: "6:00 - 17:00", saturday: "7:00 - 12:00", sunday: "Cerrado" }
  },
];

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function isOpenNow(schedule: Provider['schedule']): { isOpen: boolean; nextOpen: string } {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  let todaySchedule = "";
  if (day === 0) todaySchedule = schedule.sunday;
  else if (day === 6) todaySchedule = schedule.saturday;
  else todaySchedule = schedule.weekdays;
  
  if (todaySchedule === "Cerrado") {
    return { isOpen: false, nextOpen: "Lunes 7:00" };
  }
  
  const [open, close] = todaySchedule.split(" - ");
  const [openH, openM] = open.split(":").map(Number);
  const [closeH, closeM] = close.split(":").map(Number);
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;
  
  if (currentTime >= openTime && currentTime < closeTime) {
    return { isOpen: true, nextOpen: "" };
  }
  
  if (currentTime < openTime) {
    return { isOpen: false, nextOpen: `Hoy ${open}` };
  }
  
  return { isOpen: false, nextOpen: "Mañana" };
}

export default function MarketplacePage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const requestLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Tu navegador no soporta geolocalización");
      setIsLoadingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Permiso de ubicación denegado");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Ubicación no disponible");
            break;
          case error.TIMEOUT:
            setLocationError("Tiempo de espera agotado");
            break;
          default:
            setLocationError("Error al obtener ubicación");
        }
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const sortedProviders = useMemo(() => {
    let filtered = providers;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = providers.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.city.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query)
      );
    }
    
    if (userLocation) {
      return filtered
        .map(p => ({
          ...p,
          distance: calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
        }))
        .sort((a, b) => a.distance - b.distance);
    }
    
    return filtered.map(p => ({ ...p, distance: null }));
  }, [userLocation, searchQuery]);
  
  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Marketplace Estructura 360</h1>
          <p className="text-muted-foreground mt-2">Encuentra plantas de vigueta y panel estructural autorizadas cerca de tu obra.</p>
        </div>

        <Card className="border-primary/10 shadow-lg bg-primary text-primary-foreground">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-primary-foreground/50" />
                <Input 
                  placeholder="Buscar por ciudad o nombre..." 
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-marketplace-search"
                />
              </div>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-white h-12 px-8"
                onClick={requestLocation}
                disabled={isLoadingLocation}
                data-testid="button-use-location"
              >
                {isLoadingLocation ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-5 w-5" />
                )}
                {userLocation ? "Ubicación activa" : "Usar mi ubicación"}
              </Button>
            </div>
            {locationError && (
              <p className="text-sm text-red-300 mt-2">{locationError}</p>
            )}
            {userLocation && (
              <p className="text-sm text-white/70 mt-2 flex items-center gap-1">
                <Navigation className="h-4 w-4" />
                Ordenando proveedores por distancia desde tu ubicación
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProviders.map((provider) => {
            const openStatus = isOpenNow(provider.schedule);
            return (
              <Card key={provider.id} className="hover-elevate transition-all duration-300 border-primary/10">
                <CardHeader className="flex flex-row items-start gap-4 pb-2">
                  <div className="p-3 bg-primary/5 rounded-xl shrink-0">
                    <Factory className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg leading-tight">{provider.name}</CardTitle>
                    <CardDescription className="mt-1">{provider.city}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{provider.address}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    {openStatus.isOpen ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Abierto ahora
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cerrado
                      </Badge>
                    )}
                    {provider.distance !== null && (
                      <span className="text-sm font-bold text-accent flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {provider.distance < 1 
                          ? `${Math.round(provider.distance * 1000)} m` 
                          : `${provider.distance.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                      <Clock className="h-3 w-3" />
                      Horarios de Atención
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 text-xs">
                      <span className="text-muted-foreground">Lun - Vie:</span>
                      <span className="font-medium">{provider.schedule.weekdays}</span>
                      <span className="text-muted-foreground">Sábado:</span>
                      <span className="font-medium">{provider.schedule.saturday}</span>
                      <span className="text-muted-foreground">Domingo:</span>
                      <span className="font-medium">{provider.schedule.sunday}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full bg-accent hover:bg-accent/90"
                    onClick={() => window.open(`tel:${provider.phone.replace(/\s/g, '')}`, '_self')}
                    data-testid={`button-call-${provider.id}`}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Llamar: {provider.phone}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {sortedProviders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Factory className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No se encontraron proveedores con ese criterio de búsqueda.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
