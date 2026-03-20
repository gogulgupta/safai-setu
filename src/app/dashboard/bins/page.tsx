
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, X, QrCode, LoaderCircle, MapPin, Phone } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import jsQR from "jsqr";
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

type Bin = {
  id: string;
  type: string;
  status: 'Online' | 'Offline';
  location: { name?: string; lat: number; lng: number };
  fillLevel: number; // 0-100
  contact: string;
};

// Helper to get data from localStorage
function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return fallback;
  }
};

// Helper to save data to localStorage
function saveToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage for key "${key}":`, error);
  }
};

const sampleLocations = [
    { name: "Delhi", lat: 28.6139, lng: 77.2090 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 }
];

const defaultContact = "9876543210";

const initialBins: Bin[] = [
    { 
        id: "HOME-BIN-001", 
        type: "Household", 
        status: "Online", 
        location: { name: "Delhi", lat: 28.6139, lng: 77.2090 },
        fillLevel: 68,
        contact: "9876543210"
    },
    { 
        id: "COMM-BIN-A42", 
        type: "Community", 
        status: "Offline",
        location: { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
        fillLevel: 95,
        contact: "9123456789"
    },
];

function QRScanner({ onScanSuccess }: { onScanSuccess: (data: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestRef = useRef<number>();

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if(context){
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code) {
          onScanSuccess(code.data);
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  }, [onScanSuccess]);

  useEffect(() => {
    let stream: MediaStream;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
              setIsLoading(false);
              requestRef.current = requestAnimationFrame(tick);
          }
        }
      } catch (err) {
        setError("Could not access camera. Please enable camera permissions.");
        setIsLoading(false);
      }
    };
    startCamera();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if(stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [tick]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-secondary">
      {isLoading && <div className="absolute inset-0 flex items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>}
      <video ref={videoRef} className={cn("h-full w-full object-cover", isLoading && "hidden")} playsInline autoPlay muted />
      <canvas ref={canvasRef} className="hidden" />
      {error && <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4 text-center text-white">{error}</div>}
       <div className="absolute inset-0 border-[8px] border-black/30 rounded-lg" />
    </div>
  );
}


export default function BinsPage() {
  const [pairedBins, setPairedBins] = useState<Bin[]>([]);
  const [newBinId, setNewBinId] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedBins = getFromStorage<Bin[]>('pairedBins', initialBins);
    // Data migration/sanitization step
    const sanitizedBins = storedBins.map(bin => ({
        ...bin,
        location: bin.location || sampleLocations[Math.floor(Math.random() * sampleLocations.length)],
        contact: bin.contact || defaultContact,
        fillLevel: bin.fillLevel ?? Math.floor(Math.random() * 100),
        status: bin.status || (Math.random() > 0.3 ? 'Online' : 'Offline'),
    }));
    setPairedBins(sanitizedBins);
  }, []);

  useEffect(() => {
      if (isClient) {
        saveToStorage('pairedBins', pairedBins);
      }
  }, [pairedBins, isClient]);
  
  const pairBin = useCallback((id: string) => {
    if(!isClient) return;

    const trimmedId = id.trim().toUpperCase();
    if (!trimmedId) {
      toast({
        variant: "destructive",
        title: "Invalid ID",
        description: "Please enter a valid Device ID to pair.",
      });
      return;
    }
    if(pairedBins.some(bin => bin.id === trimmedId)) {
      toast({
        variant: "destructive",
        title: "Already Paired",
        description: "This bin is already linked to your account.",
      });
      return;
    }
    
    const createNewBin = (location: { name?: string; lat: number; lng: number }) => {
        const newBin: Bin = {
            id: trimmedId,
            type: trimmedId.includes('HOME') ? 'Household' : trimmedId.includes('COMM') ? 'Community' : 'General',
            status: Math.random() > 0.3 ? 'Online' : 'Offline',
            location: location,
            fillLevel: Math.floor(Math.random() * 30),
            contact: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`
        };

        setPairedBins(prev => [...prev, newBin]);
        setNewBinId('');
        toast({
            title: "Pairing Successful!",
            description: `Smart Bin ${newBin.id} in ${location.name || 'your location'} has been linked.`,
        });
    }

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                createNewBin({ name: "Current Location", lat: latitude, lng: longitude });
            },
            (error) => {
                console.error("Geolocation error:", error.message);
                toast({
                    variant: "destructive",
                    title: "Location Access Denied",
                    description: "Could not get your location. Please enable location services.",
                });
            }
        );
    } else {
        toast({
            variant: "destructive",
            title: "Geolocation Not Supported",
            description: "Your browser does not support geolocation.",
        });
    }
  }, [pairedBins, toast, isClient]);

  const handlePairBinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pairBin(newBinId);
  };
  
  const handleQrScanSuccess = (scannedId: string) => {
    setIsScannerOpen(false);
    pairBin(scannedId);
  };

  const handleUnpairBin = (binId: string) => {
    setPairedBins(prev => prev.filter(bin => bin.id !== binId));
    toast({
      title: "Bin Unpaired",
      description: `Smart Bin ${binId} has been removed from your account.`,
    });
  };

  if (!isClient) {
    return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card><CardHeader><Skeleton className="h-8 w-48" /></CardHeader><CardContent><Skeleton className="h-24 w-full"/></CardContent></Card>
            <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-8 w-48" /></CardHeader><CardContent><Skeleton className="h-48 w-full"/></CardContent></Card>
        </div>
    );
  }


  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Pair a New Smart Bin</CardTitle>
          <CardDescription>
            Enter the ID or scan the QR code on your bin to link it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handlePairBinSubmit}>
            <div className="space-y-2">
              <Label htmlFor="deviceId">Device ID</Label>
              <Input 
                id="deviceId" 
                placeholder="e.g., SAFAI-BIN-XYZ-123" 
                value={newBinId}
                onChange={(e) => setNewBinId(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">Pair Manually</Button>
          </form>
          <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
              <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <QrCode className="mr-2 h-4 w-4"/> Scan QR Code
                  </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Scan Bin QR Code</DialogTitle>
                      <DialogDescription>
                          Position the QR code on your bin within the frame.
                      </DialogDescription>
                  </DialogHeader>
                  <QRScanner onScanSuccess={handleQrScanSuccess} />
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" className="mt-2">Cancel</Button>
                  </DialogClose>
              </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>My Paired Bins</CardTitle>
          <CardDescription>Manage your connected smart bins.</CardDescription>
        </CardHeader>
        <CardContent>
          {pairedBins.length > 0 ? (
            <ul className="space-y-4">
              {pairedBins.map(bin => (
                <li key={bin.id} className="flex flex-col gap-4 p-4 bg-secondary rounded-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-primary mt-1"/>
                      <div>
                        <p className="font-semibold">{bin.id}</p>
                        <p className="text-sm text-muted-foreground">{bin.type} ({bin.location.name || 'Unknown Location'})</p>
                      </div>
                    </div>
                     <div className='flex items-center gap-4'>
                      <div className={`flex items-center gap-2 text-sm ${bin.status === 'Online' ? 'text-green-600' : 'text-red-600'}`}>
                        <span className={`w-2 h-2 rounded-full ${bin.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {bin.status}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-50 group-hover:opacity-100">
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently unpair the bin <span className='font-semibold'>{bin.id}</span> from your account. You can pair it again later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUnpairBin(bin.id)}>Unpair</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Fill Level</Label>
                        <span className="text-sm font-medium">{bin.fillLevel}%</span>
                    </div>
                    <Progress value={bin.fillLevel} className={cn(
                        "h-2",
                        bin.fillLevel > 90 && "[&>div]:bg-destructive",
                        bin.fillLevel > 70 && bin.fillLevel <= 90 && "[&>div]:bg-yellow-500"
                    )} />
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-muted">
                    <a href={`https://www.google.com/maps/search/?api=1&query=${bin.location.lat},${bin.location.lng}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm"><MapPin className="mr-2 h-4 w-4"/>View on Map</Button>
                    </a>
                    {bin.fillLevel > 90 && (
                     <a href={`tel:${bin.contact}`}>
                        <Button variant="destructive" size="sm"><Phone className="mr-2 h-4 w-4"/>Call Municipality</Button>
                     </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
              <p>You have no smart bins paired yet.</p>
              <p className='text-sm'>Use the form to add your first bin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

    