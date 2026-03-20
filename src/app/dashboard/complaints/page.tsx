
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/context/app-context"
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Search, X, Camera, LoaderCircle, ShieldCheck, Eye, Pin, Printer, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Complaint } from "@/lib/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useSpeechToText } from "@/hooks/use-speech-to-text";

const PrintResolutionDetails = ({ complaint }: { complaint: Complaint }) => {
    const printContentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printContentRef.current;
        if (!printContent) return;

        const printContents = `
            <html>
                <head>
                    <title>Complaint Details - ${complaint.id}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
                        body { font-family: 'PT Sans', sans-serif; -webkit-print-color-adjust: exact; color: #333; }
                        .printable-content { max-width: 800px; margin: 0 auto; padding: 2rem; }
                        h1 { text-align: center; font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; }
                        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                        .details-section { line-height: 1.6; }
                        .details-section h3 { font-weight: 700; margin-bottom: 0.75rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; font-size: 1rem;}
                        .details-section div { margin-bottom: 0.5rem; }
                        .image-container { width: 100%; height: 250px; position: relative; border-radius: 0.5rem; border: 1px solid #ddd; overflow: hidden; background-color: #f9f9f9; display: flex; align-items: center; justify-content: center; }
                        img { width: 100%; height: 100%; object-fit: contain; }
                        .footer { margin-top: 2rem; text-align: center; font-size: 0.75rem; color: #888; }
                        strong { font-weight: 700; }
                        .badge { display: inline-block; border-radius: 9999px; border: 1px solid; padding: 0.125rem 0.625rem; font-size: 0.75rem; font-weight: 600; }
                        .badge-resolved { background-color: rgba(34, 197, 94, 0.1); color: #166534; border-color: rgba(34, 197, 94, 0.2); }
                    </style>
                </head>
                <body>
                    <div class="printable-content">
                        <h1>Stubble Burning Complaint Resolution</h1>
                        <div class="details-grid">
                            <div class="details-section">
                                <h3>Resolution Details</h3>
                                <div><strong>Status:</strong> <span class="badge badge-resolved">${complaint.status}</span></div>
                                <div><strong>Officer:</strong> ${complaint.resolutionDetails?.policeName || 'N/A'}</div>
                                <div><strong>Resolved At:</strong> ${complaint.resolutionDetails?.resolvedAt || 'N/A'}</div>
                                <div><strong>Submission Location:</strong> ${complaint.resolutionDetails?.submittedFrom || 'N/A'}</div>
                                <div><strong>Digital Signature:</strong> ${complaint.resolutionDetails?.digitalSignature || 'N/A'}</div>
                            </div>
                            <div class="details-section">
                                <h3>Officer Verification</h3>
                                <div class="image-container">
                                    ${complaint.resolutionDetails?.verificationImageUrl ? `<img src="${complaint.resolutionDetails.verificationImageUrl}" alt="Officer Verification" />` : '<span>No Image</span>'}
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This report was generated by SafaiSetu on ${new Date().toLocaleString()}.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContents);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { // Timeout to ensure styles are loaded
                printWindow.print();
            }, 500);
        } else {
            alert('Please allow popups to print the details.');
        }
    };

    if (!complaint.resolutionDetails) return null;

    return (
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>Print Complaint Resolution: {complaint.id}</DialogTitle>
                <DialogDescription>
                    Review the details below. Click the print button to get a physical copy or save as PDF.
                </DialogDescription>
            </DialogHeader>
            <div ref={printContentRef} className="printable-content hidden">
                {/* This content is only for the print function */}
            </div>
             <div className="space-y-4 py-4">
                <h2 className="text-center text-xl font-bold">Stubble Burning Complaint Resolution</h2>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h3 className="font-bold border-b pb-2">Resolution Details</h3>
                        <div><strong>Status:</strong> <Badge className={cn("text-xs", getStatusClass(complaint.status))}>{complaint.status}</Badge></div>
                        <p><strong>Officer:</strong> {complaint.resolutionDetails.policeName}</p>
                        <p><strong>Resolved At:</strong> {complaint.resolutionDetails.resolvedAt}</p>
                        <p><strong>Submission Location:</strong> {complaint.resolutionDetails.submittedFrom}</p>
                        <p><strong>Digital Signature:</strong> {complaint.resolutionDetails.digitalSignature}</p>
                    </div>
                     <div className="space-y-3">
                        <h3 className="font-bold border-b pb-2">Officer Verification</h3>
                        <div className="relative aspect-[4/3] w-full rounded-md border bg-secondary overflow-hidden">
                            {complaint.resolutionDetails.verificationImageUrl && (
                                <img src={complaint.resolutionDetails.verificationImageUrl} alt="Officer Verification" className="w-full h-full object-contain" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Save as PDF
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

const getStatusClass = (status: 'Pending' | 'In Review' | 'Resolved') => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50';
      case 'In Review':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/50';
      case 'Resolved':
        return 'bg-green-500/20 text-green-700 border-green-500/50';
    }
}

export default function ComplaintsPage() {
  const { complaints, isInitialized, updateComplaintStatus, deleteComplaint } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
  } = useSpeechToText({
    onTranscript: (text) => setSearchQuery(text),
    onError: (error) => {
        if (error !== 'aborted') {
            toast({ variant: 'destructive', title: 'Speech Recognition Error', description: error })
        }
    },
  });

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isPersonVerified, setIsPersonVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationImage, setVerificationImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoCaptureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dialogCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = useCallback(async () => {
    if(!selectedComplaint || selectedComplaint.status === 'Resolved') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); // Use front camera
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            // Start auto-capture simulation
            setIsDetecting(true);
            autoCaptureTimeoutRef.current = setTimeout(() => {
                handleCaptureAndVerify(true); // Call verification after delay
            }, 3000); // Simulate 3 seconds of detection

            // Start 20-second timeout to close dialog
            dialogCloseTimeoutRef.current = setTimeout(() => {
              toast({
                  variant: 'destructive',
                  title: 'Verification Timed Out',
                  description: 'Could not verify officer presence within 20 seconds. Please try again.',
              });
              handleDialogClose();
            }, 20000); // 20 seconds
        };
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
  }, [selectedComplaint, toast]);


  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    if (autoCaptureTimeoutRef.current) {
        clearTimeout(autoCaptureTimeoutRef.current);
    }
    if (dialogCloseTimeoutRef.current) {
        clearTimeout(dialogCloseTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (selectedComplaint && selectedComplaint.status !== 'Resolved') {
        startCamera();
    } else {
        stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [selectedComplaint, startCamera, stopCamera]);

  const filteredComplaints = useMemo(() => {
    let baseComplaints: Complaint[] = [];
    if (statusFilter === 'All') {
      baseComplaints = complaints.filter(c => c.status !== 'Resolved');
    } else {
      baseComplaints = complaints.filter(c => c.status === statusFilter);
    }

    return baseComplaints.filter(complaint => {
        const searchString = (complaint.location + (complaint.description || '')).toLowerCase();
        return searchString.includes(searchQuery.toLowerCase());
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}, [complaints, searchQuery, statusFilter]);
  
  const handleDialogClose = () => {
    setSelectedComplaint(null);
    setIsPersonVerified(false);
    setVerificationImage(null);
    setIsDetecting(false);
  }

  const handleCaptureAndVerify = (isAuto: boolean = false) => {
    if (!videoRef.current || !canvasRef.current || verificationLoading) return;
    
    if (autoCaptureTimeoutRef.current) {
        clearTimeout(autoCaptureTimeoutRef.current);
    }

    setVerificationLoading(true);
    setIsDetecting(false);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/png');

        if (!dataUri || dataUri.length < 10000) { 
             toast({ variant: 'destructive', title: "Capture Failed", description: "Could not capture a valid image. The camera might be covered. Please try again." });
             setVerificationLoading(false);
             return;
        }
        
        const capturedImage = dataUri;

        setTimeout(() => {
            const isOfficerDetected = Math.random() > 0.3; // 70% chance of success for better demo
            
            if (isOfficerDetected) {
                setVerificationImage(capturedImage);
                setIsPersonVerified(true);
                toast({ title: "Verification Successful", description: "Officer presence verified." });
                stopCamera();
                if (dialogCloseTimeoutRef.current) {
                  clearTimeout(dialogCloseTimeoutRef.current);
                }
            } else {
                setVerificationImage(null); 
                toast({ variant: 'destructive', title: "Verification Failed", description: "Officer presence could not be verified. Please ensure the officer is clearly visible in good lighting and try again." });
                if(!isAuto) { // Restart detection if manual capture failed
                    setIsDetecting(true);
                    autoCaptureTimeoutRef.current = setTimeout(() => handleCaptureAndVerify(true), 3000);
                }
            }
            setVerificationLoading(false);
        }, 1500);
    } else {
        setVerificationLoading(false);
        toast({ variant: 'destructive', title: 'Capture Error', description: 'Could not access the canvas to capture image.' });
    }
  };


  const handleResolveSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedComplaint || !isPersonVerified || !verificationImage) {
        toast({ variant: 'destructive', title: 'Verification Required', description: 'Please verify the officer\'s live photo.' });
        return;
    };

    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const policeName = formData.get('policeName') as string;
    const firDocumentInput = form.elements.namedItem('firDocument') as HTMLInputElement;
    const digitalSignature = formData.get('digitalSignature') as string;

    if(!policeName || !digitalSignature || !firDocumentInput.files?.length) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill in all required fields, including the FIR document.' });
        setIsSubmitting(false);
        return;
    }
    
    const submitWithLocation = (locationString: string) => {
      const resolutionDetails = {
          policeName,
          firDocumentUrl: 'fir_doc_placeholder.pdf', 
          digitalSignature,
          resolvedAt: new Date().toLocaleString('en-IN'),
          verificationImageUrl: verificationImage,
          submittedFrom: locationString,
      };
      
      setTimeout(() => {
          updateComplaintStatus(selectedComplaint.id, 'Resolved', resolutionDetails);
          toast({ title: 'Complaint Resolved', description: `Complaint ID ${selectedComplaint.id} has been marked as resolved.` });
          setIsSubmitting(false);
          handleDialogClose();
      }, 1000);
    }
    
    // Get geolocation
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const locString = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
                submitWithLocation(locString);
            },
            (error) => {
                console.error('Geolocation error:', error.message);
                toast({ variant: 'destructive', title: 'Could not get location', description: 'Please enable location services and try again.' });
                setIsSubmitting(false);
            }
        );
    } else {
        toast({ variant: 'destructive', title: 'Geolocation Not Supported', description: 'Cannot get your location.' });
        setIsSubmitting(false);
    }
  }

  const handleDeleteComplaint = (complaintId: string) => {
    deleteComplaint(complaintId);
    toast({
        title: 'Complaint Deleted',
        description: `Complaint ID ${complaintId} has been removed.`,
    });
  }

  const canBeMapped = (locationString?: string) => {
    if (!locationString) return false;
    const parts = locationString.split(',').map(s => s.trim());
    return parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]));
  }
  
  const getMapLink = (locationString?: string) => {
    if (!locationString) return '#';
    const cleanLocation = locationString.replace(/Lat:|Lng:| /g, '');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanLocation)}`;
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleLocationClick = (complaint: Complaint) => {
    if (complaint.status === 'Pending') {
      updateComplaintStatus(complaint.id, 'In Review');
      toast({
        title: "Complaint In Review",
        description: `Complaint ID ${complaint.id} is now being reviewed.`,
      });
    }
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
          <CardDescription>A log of all anonymously submitted stubble burning reports.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder="Search by location or description..."
                        className="pl-10 pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8",
                        isListening && "text-primary animate-pulse"
                      )}
                      onClick={toggleListening}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">Active Complaints</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Review">In Review</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                </Select>
            </div>


          {isInitialized ? (
            filteredComplaints.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredComplaints.map((complaint) => (
                        <Card key={complaint.id} className="overflow-hidden flex flex-col group relative">
                            {complaint.status === 'Resolved' && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-background/60 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action will permanently delete the complaint for "{complaint.location}". This cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteComplaint(complaint.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            <CardHeader className="p-0">
                               <div className="relative w-full aspect-video">
                                 <img
                                    src={complaint.imageUrl || 'https://picsum.photos/400/300'}
                                    alt="Incident image"
                                    className="object-cover w-full h-full"
                                    data-ai-hint="fire smoke"
                                />
                               </div>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4 flex-grow">
                                <a 
                                    href={getMapLink(complaint.location)} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="group"
                                    onClick={(e) => {
                                        handleLocationClick(complaint);
                                    }}
                                >
                                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                        <MapPin className="w-4 h-4" />
                                        <p className="font-semibold text-foreground group-hover:underline truncate">{complaint.location}</p>
                                    </div>
                                </a>
                                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{complaint.timestamp}</span>
                                </div>
                                {complaint.description && <p className="text-sm text-muted-foreground italic">"{complaint.description}"</p>}
                                
                                {complaint.status === 'Resolved' && complaint.resolutionDetails && (
                                    <div className="text-xs bg-green-500/10 p-3 rounded-lg border border-green-500/20 mt-2 space-y-3">
                                        <p className="font-bold text-green-700">Resolution Details:</p>
                                        <div className="relative aspect-[4/3] w-full rounded-md border bg-secondary overflow-hidden">
                                            {complaint.resolutionDetails.verificationImageUrl && (
                                                <img src={complaint.resolutionDetails.verificationImageUrl} alt="Verification" className="w-full h-full object-contain" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p><strong>Officer:</strong> {complaint.resolutionDetails.policeName}</p>
                                            <p><strong>Signed by:</strong> {complaint.resolutionDetails.digitalSignature}</p>
                                            <p><strong>Date:</strong> {complaint.resolutionDetails.resolvedAt}</p>
                                            {canBeMapped(complaint.resolutionDetails.submittedFrom) ? (
                                                <a href={getMapLink(complaint.resolutionDetails.submittedFrom)} target="_blank" rel="noopener noreferrer" className="group">
                                                    <div className="flex items-center gap-1 text-foreground group-hover:text-primary transition-colors">
                                                        <Pin className="w-3 h-3" />
                                                        <p className="group-hover:underline"><strong>From:</strong> {complaint.resolutionDetails.submittedFrom}</p>
                                                    </div>
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <Pin className="w-3 h-3" />
                                                    <p><strong>From:</strong> {complaint.resolutionDetails.submittedFrom}</p>
                                                </div>
                                            )}
                                        </div>
                                         <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline" className="w-full mt-2">
                                                    <Printer className="mr-2 h-4 w-4"/> Print Details
                                                </Button>
                                            </DialogTrigger>
                                            <PrintResolutionDetails complaint={complaint} />
                                        </Dialog>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Dialog open={selectedComplaint?.id === complaint.id} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
                                    <DialogTrigger asChild>
                                        <Badge 
                                            className={cn("text-xs cursor-pointer", getStatusClass(complaint.status))}
                                            onClick={() => complaint.status !== 'Resolved' && setSelectedComplaint(complaint)}
                                        >
                                            {complaint.status}
                                        </Badge>
                                    </DialogTrigger>
                                     {complaint.status !== 'Resolved' && (
                                        <DialogContent className="sm:max-w-md max-h-[90vh]">
                                          <ScrollArea className="max-h-[80vh] pr-6 -mr-6">
                                            <DialogHeader>
                                                <DialogTitle>Resolve Complaint: {complaint.id}</DialogTitle>
                                                <DialogDescription>
                                                    Verify the police officer's presence with a live photo, then fill in the details below to mark this complaint as resolved.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleResolveSubmit} className="space-y-4 pt-4">
                                                <div className="space-y-2 p-4 border rounded-lg bg-secondary">
                                                    <Label className='font-semibold'>Verify Officer Presence</Label>
                                                    <p className='text-sm text-muted-foreground'>The camera will auto-capture when eyes are detected.</p>
                                                    <div className="rounded-md border bg-card aspect-video w-full overflow-hidden relative mt-2">
                                                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                                        <canvas ref={canvasRef} className="hidden" />
                                                        {isDetecting && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                                <div className="text-center text-white space-y-2">
                                                                    <Eye className="w-10 h-10 mx-auto animate-pulse" />
                                                                    <p>Detecting eyes for auto-capture...</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {hasCameraPermission === false && (
                                                        <Alert variant="destructive" className="mt-2">
                                                            <AlertTitle>Camera Access Required</AlertTitle>
                                                            <AlertDescription>Please allow camera access.</AlertDescription>
                                                        </Alert>
                                                    )}
                                                     {isPersonVerified && verificationImage ? (
                                                        <Alert variant="default" className="mt-2 bg-green-500/10 border-green-500/20">
                                                          <div className="flex items-start gap-4">
                                                             <div className="relative w-20 aspect-video flex-shrink-0">
                                                                <img src={verificationImage} alt="Verification" className="rounded-md border object-contain w-full h-full" />
                                                             </div>
                                                            <div className="flex-1">
                                                              <AlertTitle className="text-green-700 flex items-center gap-2"><ShieldCheck/> Officer Verified</AlertTitle>
                                                              <AlertDescription className="text-green-800">You can now fill the resolution details.</AlertDescription>
                                                            </div>
                                                          </div>
                                                        </Alert>
                                                    ) : (
                                                        <Button 
                                                            type="button" 
                                                            onClick={() => handleCaptureAndVerify(false)} 
                                                            disabled={!hasCameraPermission || verificationLoading || isDetecting} 
                                                            className="w-full mt-2"
                                                            variant="outline"
                                                        >
                                                            {verificationLoading ? <LoaderCircle className="animate-spin" /> : <Camera className="mr-2" />}
                                                            Manual Capture
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="policeName">Police Officer Name</Label>
                                                    <Input id="policeName" name="policeName" required disabled={!isPersonVerified} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="firDocument">FIR Document</Label>
                                                    <Input id="firDocument" name="firDocument" type="file" required disabled={!isPersonVerified} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="digitalSignature">Digital Signature (Officer's Full Name)</Label>
                                                    <Input id="digitalSignature" name="digitalSignature" placeholder="Type full name to sign" required disabled={!isPersonVerified} />
                                                </div>
                                                <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-1 -mx-6 px-6">
                                                    <DialogClose asChild>
                                                        <Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button>
                                                    </DialogClose>
                                                    <Button type="submit" disabled={isSubmitting || !isPersonVerified}>
                                                        {isSubmitting ? 'Submitting...' : 'Resolve Complaint'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                           </ScrollArea>
                                        </DialogContent>
                                     )}
                                </Dialog>
                            </CardFooter>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg col-span-full">
                    <p>No complaints found matching your criteria.</p>
                </div>
            )
          ) : (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader><Skeleton className="h-40 w-full" /></CardHeader>
                        <CardContent className="space-y-2 pt-4">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                        <CardFooter>
                             <Skeleton className="h-6 w-20" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

    