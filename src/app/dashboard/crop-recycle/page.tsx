
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, MapPin, Tractor, Video, Bell, BarChart, Info, Building, IndianRupee, Truck, Phone, User, Pin, Search, Send, MessageCircleQuestion, Satellite, Siren, ImageUp, LocateFixed, Camera, VideoIcon, LoaderCircle, Mic } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppContext } from '@/context/app-context';
import Link from 'next/link';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVideoRecorder } from '@/hooks/use-video-recorder';
import { validateComplaint, type ValidateComplaintInput } from '@/ai/flows/validate-complaint-flow';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { cn } from '@/lib/utils';


type Buyer = {
    id: number;
    name: string;
    lat: number;
    lng: number;
    rate: string; // e.g., '₹155 / quintal'
    type: string;
    contact: string;
};


const realBuyers: Buyer[] = [
    { id: 1, name: 'Punjab Renewable Energy Systems Pvt. Ltd.', lat: 30.8584, lng: 75.8671, rate: '₹155 / quintal', type: 'Bio-Energy', contact: '+919876543210' },
    { id: 2, name: 'Kuantum Papers Ltd.', lat: 31.0613, lng: 76.8373, rate: '₹130 / quintal', type: 'Paper Mill', contact: '+919876543211' },
    { id: 3, name: 'National Agro Industries', lat: 30.8031, lng: 75.8821, rate: '₹120 / quintal', type: 'Compost & Fertilizer', contact: '+919876543212' },
    { id: 4, name: 'Verbio India Pvt. Ltd.', lat: 30.5053, lng: 76.5888, rate: '₹160 / quintal', type: 'Bio-Fuel', contact: '+919876543213' },
];

// Function to calculate distance between two lat/lng points (Haversine formula)
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
}


export default function CropRecyclePage() {
    const { toast } = useToast();
    const { addTransaction, addComplaint } = useAppContext();
    const [pickupRequested, setPickupRequested] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
    const [youtubeSearch, setYoutubeSearch] = useState('');

    const {
      isListening: isBuyerListening,
      startListening: startBuyerListening,
      stopListening: stopBuyerListening,
    } = useSpeechToText({
        onTranscript: (text) => setSearchQuery(text),
        onError: (error) => {
            if (error !== 'aborted') {
                toast({ variant: 'destructive', title: 'Speech Recognition Error', description: error })
            }
        },
    });

    const {
        isListening: isYoutubeListening,
        startListening: startYoutubeListening,
        stopListening: stopYoutubeListening,
    } = useSpeechToText({
        onTranscript: (text) => setYoutubeSearch(text),
        onError: (error) => {
            if (error !== 'aborted') {
                toast({ variant: 'destructive', title: 'Speech Recognition Error', description: error })
            }
        },
    });

    
    // State for Report Burning Dialog
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [reportLocation, setReportLocation] = useState('');
    const [reportLandmark, setReportLandmark] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [activeTab, setActiveTab] = useState('upload');
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const photoVideoInputRef = useRef<HTMLInputElement>(null);
    const cameraVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

     const {
        videoRef: recorderVideoRef,
        isRecording,
        recordedVideoUrl,
        startRecording,
        stopRecording,
        resetRecording,
        hasPermission: hasVideoPermission,
    } = useVideoRecorder({
        onPermissionError: () => toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions to use this feature.',
        })
    });

    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const startCameraForPhoto = async () => {
          if (activeTab !== 'camera' || !reportDialogOpen) return;
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            if (cameraVideoRef.current) {
                cameraVideoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions to use this feature.',
            });
          }
        };
    
        startCameraForPhoto();
    
        return () => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        };
      }, [activeTab, reportDialogOpen, toast]);


    const [farmerData, setFarmerData] = useState({
        name: 'Gurpreet Singh',
        location: 'Ludhiana, Punjab, India',
        farmSizeAcres: 15,
        cropType: 'Rice (Paddy)',
        lat: 30.9010, // Default lat for Ludhiana
        lng: 75.8573, // Default lng for Ludhiana
        estimatedParaliKg: 15 * 1.5 * 1000,
    });
    
    const truckLocation = useMemo(() => ({
        lat: farmerData.lat + 0.1, // Approx 11km away
        lng: farmerData.lng - 0.1,
    }), [farmerData.lat, farmerData.lng]);

    const estimatedETA = useMemo(() => {
        const distance = getDistanceFromLatLonInKm(farmerData.lat, farmerData.lng, truckLocation.lat, truckLocation.lng);
        const averageSpeedKmph = 40; // Assume average speed of 40 km/h
        const timeHours = distance / averageSpeedKmph;
        const timeMinutes = Math.round(timeHours * 60);

        if (timeMinutes < 2) return "Arriving now";
        if (timeMinutes < 60) return `Approx. ${timeMinutes} mins`;
        return `Approx. 1 hour`;

    }, [farmerData.lat, farmerData.lng, truckLocation.lat, truckLocation.lng]);

    const buyers = useMemo(() => {
        return realBuyers.map(buyer => ({
            ...buyer,
            distance: getDistanceFromLatLonInKm(farmerData.lat, farmerData.lng, buyer.lat, buyer.lng).toFixed(1)
        })).sort((a,b) => parseFloat(a.distance) - parseFloat(b.distance));
    }, [farmerData.lat, farmerData.lng]);

    const filteredBuyers = useMemo(() => {
        if (!searchQuery) return buyers;
        return buyers.filter(buyer => 
            buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            buyer.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [buyers, searchQuery]);


    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const location = formData.get('location') as string;
        const farmSize = Number(formData.get('farmSize'));
        const cropType = formData.get('cropType') as string;

        // In a real app, you would geocode the location string to get lat/lng
        setFarmerData({
            name,
            location,
            farmSizeAcres: farmSize,
            cropType,
            estimatedParaliKg: (farmSize || 0) * 1.5 * 1000, // 1.5 tons per acre approx
            lat: farmerData.lat, // Keep old lat/lng for simplicity
            lng: farmerData.lng,
        });
        
        toast({
            title: "Farm Registered!",
            description: "Your farm details have been updated."
        });

        setIsFormOpen(false);
    };

    const handlePickupRequest = () => {
        setPickupRequested(true);
        toast({
            title: "Pickup Request Sent!",
            description: "Nearby collectors have been notified. You will get an update soon."
        })
    }
    
    const handleViewVehicleOnMap = () => {
        if (!navigator.geolocation) {
            toast({
                variant: 'destructive',
                title: "Geolocation Not Supported",
                description: "Your browser does not support location services.",
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Vehicle location (user's current location) is the origin
                // Farmer's location is the destination
                const googleMapsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${farmerData.lat},${farmerData.lng}`;
                window.open(googleMapsUrl, '_blank');
            },
            (error) => {
                toast({
                    variant: 'destructive',
                    title: "Could Not Get Location",
                    description: "Please enable location services to use this feature.",
                });
                console.error("Geolocation error:", error);
            }
        );
    };

    const handleSearchOnMap = () => {
        if (!searchQuery) {
            toast({
                variant: 'destructive',
                title: 'Search is empty',
                description: 'Please enter the name of a mill or buyer to search on the map.',
            });
            return;
        }
        const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
        window.open(googleMapsSearchUrl, '_blank');
    };
    
    const handleSellParali = (buyer: Buyer) => {
        const pointsEarned = Math.round(farmerData.estimatedParaliKg * 0.1); // e.g., 0.1 point per kg
        
        addTransaction({
            id: `T-SELL-${Date.now()}`,
            description: `Sold ${farmerData.estimatedParaliKg.toLocaleString()} kg parali to ${buyer.name}`,
            points: pointsEarned,
            date: new Date().toLocaleDateString('en-US'),
            type: 'credit',
        });

        toast({
            title: 'Sell Request Sent!',
            description: `Your request to sell ${farmerData.estimatedParaliKg.toLocaleString()} kg of parali has been sent to ${buyer.name}. You'veearned ${pointsEarned} Green Points!`,
        });

        setSelectedBuyer(null); // Close the dialog
    };

    const handleYoutubeSearch = () => {
        if (!youtubeSearch) {
            toast({
                variant: 'destructive',
                title: 'Search is empty',
                description: 'Please enter a topic to search for on YouTube.',
            });
            return;
        }
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeSearch)}`;
        window.open(youtubeUrl, '_blank');
    };

    const handleGetCurrentLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                const locString = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
                setReportLocation(locString);
                toast({ title: "Location Captured", description: locString });
            }, error => {
                toast({ variant: 'destructive', title: "Location Error", description: "Could not get your location. Please enable location services." });
            });
        } else {
            toast({ variant: 'destructive', title: "Geolocation Not Supported" });
        }
    };

    const fileToDataUri = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
    });
    
    const captureVideoFrame = (videoUrl: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const videoElement = document.createElement('video');
            videoElement.src = videoUrl;
            videoElement.crossOrigin = "anonymous";

            videoElement.onloadedmetadata = () => {
                videoElement.currentTime = 1; // Capture frame at 1 second
            };
            videoElement.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                const context = canvas.getContext('2d');
                if (context) {
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                } else {
                    reject(new Error('Could not get canvas context'));
                }
            };
            videoElement.onerror = (e) => reject(e);
            videoElement.load();
        });
    };

    const handleReportImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const dataUri = await fileToDataUri(file);
            setReportImagePreview(dataUri);
        }
    };

    const captureLivePhoto = () => {
        if (cameraVideoRef.current && canvasRef.current) {
            const video = cameraVideoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUri = canvas.toDataURL('image/png');
                setReportImagePreview(dataUri);
                 toast({ title: "Photo Captured", description: "You can now submit your report." });
            }
        }
    };

    const handleReportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (!reportImagePreview) {
            toast({
                variant: "destructive",
                title: "Image or Video Required",
                description: "Please upload, capture, or record proof of the incident.",
            });
            return;
        }
        if (!reportLocation) {
            toast({
                variant: "destructive",
                title: "Location Required",
                description: "Please provide the location of the incident.",
            });
            return;
        }

        setIsSubmittingReport(true);
        setSubmissionMessage("AI is validating your submission...");

        try {
            // If it's a video, capture a frame for validation.
            const isVideo = reportImagePreview.startsWith('data:video');
            const validationImageUri = isVideo ? await captureVideoFrame(reportImagePreview) : reportImagePreview;

            const validationInput: ValidateComplaintInput = {
                proofImageUri: validationImageUri,
                complaintDescription: reportDescription
            };
            const validationResult = await validateComplaint(validationInput);

            if (!validationResult.isValid) {
                toast({
                    variant: "destructive",
                    title: "Validation Failed",
                    description: validationResult.reason || "The submitted proof does not seem to match the complaint criteria.",
                });
                setIsSubmittingReport(false);
                return;
            }

            setSubmissionMessage("Validation successful. Submitting report...");

            addComplaint({
                location: reportLocation,
                imageUrl: reportImagePreview, // Submit the original (video or image)
                description: reportDescription,
                landmark: reportLandmark,
            });
            
            setTimeout(() => {
                toast({
                    title: "Report Submitted Successfully",
                    description: "Thank you for helping keep our environment clean. The authorities have been notified.",
                });
                setIsSubmittingReport(false);
                setReportDialogOpen(false);
                // Reset state
                setReportImagePreview(null);
                setReportLocation('');
                setReportDescription('');
                setReportLandmark('');
                resetRecording();
            }, 1000);

        } catch (error) {
            console.error("Validation or submission error:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "An unexpected error occurred during validation.",
            });
            setIsSubmittingReport(false);
        }
    };

    const handleDialogClose = () => {
        setReportImagePreview(null);
        setReportLocation('');
        setReportDescription('');
        setReportLandmark('');
        resetRecording();
        setReportDialogOpen(false);
    }
    
    const toggleBuyerListening = () => {
        if (isBuyerListening) {
            stopBuyerListening();
        } else {
            startBuyerListening();
        }
    };

    const toggleYoutubeListening = () => {
        if (isYoutubeListening) {
            stopYoutubeListening();
        } else {
            startYoutubeListening();
        }
    };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Farmer Dashboard</CardTitle>
                        <CardDescription>Your crop and stubble data.</CardDescription>
                    </div>
                     <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button>Register Farm</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Register Your Farm</DialogTitle>
                                <DialogDescription>
                                    Enter your details to get started.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Farmer Name</Label>
                                    <Input id="name" name="name" defaultValue={farmerData.name} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location (City, State, Country)</Label>
                                    <Input id="location" name="location" defaultValue={farmerData.location} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="farmSize">Farm Size (in Acres)</Label>
                                    <Input id="farmSize" name="farmSize" type="number" defaultValue={farmerData.farmSizeAcres} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cropType">Primary Crop Type</Label>
                                    <Input id="cropType" name="cropType" defaultValue={farmerData.cropType} required />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit">Save Details</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                        <User className="w-8 h-8 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Farmer Name</p>
                            <p className="font-bold text-lg">{farmerData.name}</p>
                        </div>
                    </div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${farmerData.lat},${farmerData.lng}`} target="_blank" rel="noopener noreferrer" className="rounded-lg">
                        <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg hover:bg-muted transition-colors h-full">
                            <Pin className="w-8 h-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Farmer Location</p>
                                <p className="font-bold text-lg">{farmerData.location}</p>
                            </div>
                        </div>
                    </a>
                     <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                        <BarChart className="w-8 h-8 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Estimated Parali</p>
                            <p className="font-bold text-lg">{farmerData.estimatedParaliKg.toLocaleString()} kg</p>
                        </div>
                    </div>
                    <Card className="bg-background flex flex-col justify-between">
                       <CardHeader>
                           <CardTitle>Stubble Collection</CardTitle>
                           <CardDescription>Request a pickup for your crop residue.</CardDescription>
                       </CardHeader>
                       <CardFooter>
                            <Button className="w-full" onClick={handlePickupRequest} disabled={pickupRequested}>
                                <Tractor className="mr-2"/>
                                {pickupRequested ? 'Request Sent' : 'Request Pickup'}
                            </Button>
                       </CardFooter>
                   </Card>
                </CardContent>
            </Card>

            {pickupRequested && (
                <Card>
                    <CardHeader>
                        <CardTitle>Live Pickup Tracking</CardTitle>
                        <CardDescription>Your collection vehicle is on its way.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative aspect-video rounded-lg overflow-hidden border">
                            <Image src="https://picsum.photos/seed/map-route/600/400" alt="Map with vehicle route" layout="fill" objectFit="cover" data-ai-hint="map route" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <Truck className="w-8 h-8 text-blue-500 animate-pulse" />
                            </div>
                             <div className="absolute top-4 right-4 bg-background/80 p-2 rounded-md text-sm font-semibold">
                                ETA: {estimatedETA}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Vehicle Number</p>
                                <p className="font-bold">PB 08 CX 1234</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Driver Name</p>
                                <p className="font-bold">Jaskaran Singh</p>
                            </div>
                             <a href="tel:+918923484333" className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Phone className="mr-2" /> Call Driver
                                </Button>
                             </a>
                            <Button variant="secondary" className="w-full" onClick={handleViewVehicleOnMap}>
                                <MapPin className="mr-2" /> View Vehicle on Map
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Marketplace / Buyer Connect</CardTitle>
                    <CardDescription>Sell your parali to nearby industries to earn money and Green Points.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                type="search"
                                placeholder="Search local buyers or any mill in India..."
                                className="pl-10 pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchOnMap()}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                type="button"
                                className={cn("absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8", isBuyerListening && "text-primary animate-pulse")}
                                onClick={toggleBuyerListening}
                                >
                                <Mic className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={handleSearchOnMap}>
                            Search on Map
                        </Button>
                    </div>

                    <p className='text-sm text-muted-foreground'>Local buyers near you:</p>
                    <div className="space-y-4">
                        {filteredBuyers.map(buyer => (
                            <div key={buyer.id} className="flex flex-col md:flex-row items-start justify-between p-4 rounded-lg border">
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                    <Building className="w-8 h-8 text-primary flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">{buyer.name}</p>
                                        <p className="text-sm text-muted-foreground">{buyer.type} • {buyer.distance} km away</p>
                                    </div>
                                </div>
                                 <div className="flex items-center gap-4 w-full md:w-auto">
                                    <Badge variant="default" className="text-md flex-shrink-0">
                                        <IndianRupee className="w-4 h-4 mr-1"/>{buyer.rate}
                                    </Badge>
                                    <div className="flex gap-2 w-full">
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${buyer.lat},${buyer.lng}`} target="_blank" rel="noopener noreferrer" className="w-full">
                                            <Button variant="outline" size="sm" className="w-full"><MapPin className="mr-2 h-4 w-4"/>Map</Button>
                                        </a>
                                        <Dialog open={selectedBuyer?.id === buyer.id} onOpenChange={(isOpen) => !isOpen && setSelectedBuyer(null)}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedBuyer(buyer)}>Contact</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Contact {selectedBuyer?.name}</DialogTitle>
                                                    <DialogDescription>
                                                        You have an estimated {farmerData.estimatedParaliKg.toLocaleString()} kg of parali to sell. Choose an action below.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid grid-cols-2 gap-4 py-4">
                                                    <a href={`tel:${selectedBuyer?.contact}`} className="w-full">
                                                        <Button variant="outline" className="w-full">
                                                            <Phone className="mr-2 h-4 w-4" /> Call Buyer
                                                        </Button>
                                                    </a>
                                                    <Button onClick={() => selectedBuyer && handleSellParali(selectedBuyer)}>
                                                        <Send className="mr-2 h-4 w-4" /> Sell My Parali
                                                    </Button>
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button type="button" variant="secondary">Close</Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Satellite className="w-6 h-6 text-primary"/> AI-Powered Risk Alerts</CardTitle>
                    <CardDescription>Using satellite imagery, our AI predicts areas at high risk of stubble burning and sends automated alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                        <Image src="https://picsum.photos/seed/satellite-risk-map/600/400" alt="Map of high-risk zones" layout="fill" objectFit="cover" data-ai-hint="satellite risk map" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                            <p className="font-bold text-lg">Ludhiana District</p>
                            <p className="text-sm">Risk Level: High</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-2 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">High-Risk Zones</p>
                            <p className="text-xl font-bold">12</p>
                        </div>
                        <div className="p-2 bg-secondary rounded-lg">
                             <p className="text-sm text-muted-foreground">Alerts Sent</p>
                            <p className="text-xl font-bold">45</p>
                        </div>
                    </div>
                    <Alert variant="destructive">
                        <Siren className="h-4 w-4" />
                        <AlertTitle>Live Alert Simulation</AlertTitle>
                        <AlertDescription>
                            High risk of stubble burning detected near 'Jagraon' village. Authorities and local farmers have been notified.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                       <a href={`https://www.google.com/maps/@${farmerData.lat},${farmerData.lng},10z/data=!5m1!1e4`} target="_blank" rel="noopener noreferrer">
                            <MapPin className="mr-2"/> View Live Risk Map
                        </a>
                    </Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Awareness &amp; Training Hub</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                         <iframe 
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/49vP0CmAv4w" 
                            title="Happy Seeder Machine for Parali Management" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowFullScreen
                        ></iframe>
                    </div>
                     <h3 className="font-semibold pt-2">How to use a Happy Seeder Machine</h3>
                    <p className="text-sm text-muted-foreground">Watch step-by-step guides on using machinery to manage stubble effectively.</p>
                     
                    <div className="space-y-2 pt-2">
                        <Label htmlFor="youtube-search">Search for Training Videos</Label>
                        <div className="flex gap-2">
                             <div className="relative flex-grow">
                                <Input 
                                    id="youtube-search"
                                    type="search"
                                    placeholder="e.g., 'Baler machine guide'"
                                    value={youtubeSearch}
                                    onChange={(e) => setYoutubeSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleYoutubeSearch()}
                                    className="pr-10"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    type="button"
                                    className={cn("absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8", isYoutubeListening && "text-primary animate-pulse")}
                                    onClick={toggleYoutubeListening}
                                    >
                                    <Mic className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button onClick={handleYoutubeSearch} variant="secondary"><Search className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <div className="pt-4">
                        <h3 className="font-semibold mb-2">Frequently Asked Questions</h3>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>What is the best use for my parali (stubble)?</AccordionTrigger>
                                <AccordionContent>
                                    The best use depends on your location. You can sell it to bio-energy plants, paper mills, or use it for animal fodder. This app helps you connect with local buyers.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>What are the benefits of using a Happy Seeder machine?</AccordionTrigger>
                                <AccordionContent>
                                    A Happy Seeder allows you to sow wheat directly into the paddy stubble without burning it. This improves soil health, saves water, and reduces air pollution. Government also provides subsidies for it.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>How many Green Points can I earn?</AccordionTrigger>
                                <AccordionContent>
                                    Points are awarded based on the quantity and type of crop residue you recycle or sell. For example, selling to a bio-fuel plant might earn you more points. Check the Marketplace section for current rates.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Government Schemes</CardTitle>
                    <CardDescription>Latest subsidies and support.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2"><Badge variant="outline">Subsidy</Badge> <span>50% off on Happy Seeders</span></li>
                        <li className="flex items-center gap-2"><Badge variant="outline">Support</Badge> <span>Free training for Baler usage</span></li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="https://pmkisan.gov.in/" target="_blank" rel="noopener noreferrer">
                            Apply or Learn More
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Ask AI Assistant</CardTitle>
                    <CardDescription>Have questions? Chat with our AI expert.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/dashboard/ai-assistant">
                            <MessageCircleQuestion className="mr-2"/> Ask Now
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Report Burning</CardTitle>
                    <CardDescription>Help authorities by reporting illegal stubble burning.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Dialog open={reportDialogOpen} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="w-full" onClick={() => setReportDialogOpen(true)}>
                                <Bell className="mr-2"/>Report an Incident
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Report a Stubble Burning Incident</DialogTitle>
                                <DialogDescription>
                                    Provide as much detail as possible. Your report will be sent to local authorities.
                                </DialogDescription>
                            </DialogHeader>
                             {isSubmittingReport ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-4">
                                    <LoaderCircle className="w-12 h-12 animate-spin text-primary"/>
                                    <p className="text-muted-foreground">{submissionMessage || 'Submitting...'}</p>
                                </div>
                            ) : (
                            <ScrollArea className="max-h-[70vh] pr-4 -mr-4">
                              <form onSubmit={handleReportSubmit} className="space-y-4">
                                
                                  <Tabs defaultValue="upload" className="w-full" onValueChange={setActiveTab}>
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="upload"><ImageUp className="mr-2 h-4 w-4"/> Upload</TabsTrigger>
                                            <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4"/> Camera</TabsTrigger>
                                            <TabsTrigger value="video"><VideoIcon className="mr-2 h-4 w-4"/> Video</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="upload">
                                            <div className="space-y-2 pt-4">
                                                <Label htmlFor="report-photo">Upload Photo or Video</Label>
                                                <Input id="report-photo" type="file" accept="image/*,video/*" ref={photoVideoInputRef} onChange={handleReportImageChange} />
                                                {reportImagePreview && (
                                                    reportImagePreview.startsWith('data:video') ?
                                                    <video src={reportImagePreview} controls className="rounded-md mt-2 object-cover max-h-[200px] w-full" /> :
                                                    <Image src={reportImagePreview} alt="Preview of burning incident" width={400} height={300} className="rounded-md mt-2 object-cover max-h-[200px]" />
                                                )}
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="camera">
                                            <div className="space-y-4 pt-4">
                                                <div className="rounded-md border bg-card aspect-video w-full overflow-hidden relative">
                                                    <video ref={cameraVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                                    <canvas ref={canvasRef} className="hidden" />
                                                </div>
                                                {reportImagePreview && !reportImagePreview.startsWith('data:video') && <Image src={reportImagePreview} alt="Preview of captured photo" width={400} height={300} className="rounded-md mt-2 object-cover max-h-[200px]" />}
                                                {hasCameraPermission === false && (
                                                    <Alert variant="destructive">
                                                        <AlertTitle>Camera Access Required</AlertTitle>
                                                        <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                                                    </Alert>
                                                )}
                                                <Button type="button" onClick={captureLivePhoto} disabled={!hasCameraPermission || isSubmittingReport} className="w-full">
                                                    <Camera className="mr-2 h-4 w-4"/> Capture Photo
                                                </Button>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="video">
                                            <div className="space-y-4 pt-4">
                                                <div className="rounded-md border bg-card aspect-video w-full overflow-hidden relative">
                                                    {recordedVideoUrl ? (
                                                        <video src={recordedVideoUrl} controls className="w-full h-full object-cover" onLoadedData={() => setReportImagePreview(recordedVideoUrl)} />
                                                    ) : (
                                                        <video ref={recorderVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                                    )}
                                                </div>
                                                {!hasVideoPermission && (
                                                    <Alert variant="destructive">
                                                        <AlertTitle>Camera Access Required</AlertTitle>
                                                        <AlertDescription>Please allow camera access to record video.</AlertDescription>
                                                    </Alert>
                                                )}

                                                <div className='grid grid-cols-2 gap-2'>
                                                    {isRecording ? (
                                                        <Button type="button" onClick={stopRecording} variant="destructive">Stop Recording</Button>
                                                    ) : (
                                                        <Button type="button" onClick={startRecording} disabled={!hasVideoPermission}>Start Recording</Button>
                                                    )}
                                                    
                                                    {recordedVideoUrl && !isRecording && (
                                                        <Button type="button" onClick={resetRecording} variant="outline">
                                                            Record Again
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                  <div className="space-y-2">
                                      <Label htmlFor="report-location">Location (Lat, Lng or Address)</Label>
                                      <div className="flex items-center gap-2">
                                          <Input
                                              id="report-location"
                                              placeholder="e.g., 30.9010, 75.8573"
                                              value={reportLocation}
                                              onChange={(e) => setReportLocation(e.target.value)}
                                              required
                                          />
                                          <Button type="button" variant="outline" size="icon" onClick={handleGetCurrentLocation}>
                                              <LocateFixed className="w-4 h-4" />
                                          </Button>
                                      </div>
                                      <p className="text-xs text-muted-foreground">Auto-capture your GPS location or enter it manually.</p>
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="report-landmark">Nearest Landmark (Optional)</Label>
                                      <Input id="report-landmark" placeholder="e.g., Opposite the old mill" value={reportLandmark} onChange={(e) => setReportLandmark(e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="report-description">Short Description (Optional)</Label>
                                      <Textarea id="report-description" placeholder="Describe what you see..." value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} />
                                  </div>
                                  <DialogFooter>
                                      <DialogClose asChild>
                                          <Button type="button" variant="secondary" disabled={isSubmittingReport}>Cancel</Button>
                                      </DialogClose>
                                      <Button type="submit" disabled={isSubmittingReport || !reportImagePreview}>
                                          Submit Report
                                      </Button>
                                  </DialogFooter>
                              </form>
                            </ScrollArea>
                            )}
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </div>
    </div>
  )
}
