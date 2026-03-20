
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  recycleWaste,
  type RecycleWasteInput,
  type RecycleWasteOutput,
} from '@/ai/flows/recycle-waste-flow';
import { useToast } from '@/hooks/use-toast';
import { Bot, ImageUp, CheckCircle, XCircle, LoaderCircle, Video, Camera, Leaf } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  wastePhoto: z.any(),
});

// Function to request notification permission and send a notification
const sendNotification = (title: string, options: NotificationOptions) => {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                new Notification(title, options);
            }
        });
    }
};

export default function RecyclePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecycleWasteOutput | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [price, setPrice] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { toast } = useToast();
  const { addReturn } = useAppContext();
  const router = useRouter();


  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    if (activeTab === 'camera') {
      startCamera();
    }

    return () => {
      // Stop video stream when component unmounts or tab changes
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeTab, toast]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
    },
  });

  const fileToDataUri = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  async function onSubmit(values: z.infer<typeof formSchema> | { capturedImage: string }) {
    setIsLoading(true);
    setResult(null);
    setPrice('');

    let wastePhotoDataUri: string | undefined;

    if ('capturedImage' in values) {
      wastePhotoDataUri = values.capturedImage;
      setPreviewImage(wastePhotoDataUri);
    } else if (values.wastePhoto && values.wastePhoto.length > 0) {
      try {
        wastePhotoDataUri = await fileToDataUri(values.wastePhoto[0]);
        setPreviewImage(wastePhotoDataUri);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error reading file',
          description: 'Could not process the uploaded image.',
        });
        setIsLoading(false);
        return;
      }
    }


    if (!wastePhotoDataUri) {
      toast({
        variant: 'destructive',
        title: 'Input required',
        description: 'Please upload a photo or capture an image.',
      });
      setIsLoading(false);
      return;
    }
    
    const input: RecycleWasteInput = {
      wastePhotoDataUri,
    };

    try {
      const validationResult = await recycleWaste(input);
      setResult(validationResult);
      if (validationResult.isRecyclable) {
        toast({
            title: 'Analysis Complete!',
            description: `You've earned ${validationResult.points} points. You can now list this item on the marketplace.`,
        });
      } else {
        toast({
            title: 'Analysis Complete',
            description: validationResult.reason,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/png');
            onSubmit({ capturedImage: dataUri });
        }
    }
  }

  const handleAddItem = () => {
    if (!result || !result.isRecyclable) return;
    const pointsPrice = parseInt(price, 10);
    if (isNaN(pointsPrice) || pointsPrice <= 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid Price',
            description: 'Please enter a valid price in points.',
        });
        return;
    }
    const newReturnItem = {
        id: `RC${Date.now().toString().slice(-4)}`,
        productName: result.material || 'Recycled Item',
        date: new Date().toLocaleDateString('en-US'),
        status: 'Recycled' as const,
        points: result.points,
        type: 'Recycle' as const,
        material: result.material,
        imageUrl: previewImage || undefined,
    };

    addReturn(newReturnItem, pointsPrice);

    toast({
        title: 'Item Added to Marketplace!',
        description: `You've earned ${result.points} points.`,
    });

    sendNotification('New Item on SafaiSetu!', {
      body: `${newReturnItem.productName} is now available on the marketplace for ${pointsPrice} points!`,
      icon: '/favicon.ico'
    });

    router.push('/dashboard/marketplace');
  };
  
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recycle Waste</CardTitle>
          <CardDescription>
            Is it recyclable? Upload a photo and our AI will analyze your waste item, determine if it can be recycled, and award you Green Points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <ImageUp className="mr-2 h-4 w-4"/> Upload
              </TabsTrigger>
              <TabsTrigger value="camera">
                <Video className="mr-2 h-4 w-4"/> Camera
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
               <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <FormField
                      control={form.control}
                      name="wastePhoto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waste Item Photo</FormLabel>
                          <FormControl>
                          <div className="relative">
                              <ImageUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input type="file" accept="image/*" onChange={(e) => {
                                field.onChange(e.target.files);
                                if (e.target.files && e.target.files.length > 0) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                      setPreviewImage(event.target?.result as string);
                                  };
                                  reader.readAsDataURL(e.target.files[0]);
                                }
                              }} className="pl-10"/>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Bot className="mr-2 h-4 w-4" /> Analyze with AI</>}
                    </Button>
                  </form>
               </Form>
            </TabsContent>
            <TabsContent value="camera">
                <div className="space-y-4 pt-4">
                     <div className="rounded-md border bg-card aspect-video w-full overflow-hidden relative">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        <canvas ref={canvasRef} className="hidden" />
                     </div>
                      {hasCameraPermission === false && (
                          <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                              Please allow camera access in your browser settings to use this feature.
                            </AlertDescription>
                          </Alert>
                      )}
                      <Button onClick={captureImage} disabled={isLoading || !hasCameraPermission} className="w-full">
                        {isLoading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Capturing...</> : <><Camera className="mr-2 h-4 w-4" /> Capture & Analyze</>}
                      </Button>
                </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="flex items-center justify-center">
        {isLoading && (
            <div className="text-center space-y-2">
                <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is analyzing your item...</p>
            </div>
        )}
        {result && (
            <Alert variant={result.isRecyclable ? 'default' : 'destructive'} className="bg-card w-full">
                {result.isRecyclable ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>{result.isRecyclable ? 'Recyclable!' : 'Not Recyclable'}</AlertTitle>
                <AlertDescription className="space-y-4">
                    {previewImage && <img src={previewImage} alt="waste item" className="rounded-md my-4 max-h-48 mx-auto" />}
                    <p>{result.reason}</p>
                    <div className="space-y-1">
                      {result.material && <p><strong>Material:</strong> {result.material}</p>}
                      {result.isRecyclable && result.points > 0 && (
                          <p className="font-bold text-primary mt-2 flex items-center gap-1">
                            <Leaf className="w-4 h-4"/> You've earned {result.points} Green Points!
                            </p>
                      )}
                    </div>
                     {result.isRecyclable && (
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="price">Set Marketplace Price (in Points)</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="e.g., 100"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <Button className="w-full" onClick={handleAddItem}>Add to Marketplace</Button>
                        </div>
                    )}
                </AlertDescription>
            </Alert>
        )}
        {!isLoading && !result && (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg w-full">
                {previewImage ? (
                  <img src={previewImage} alt="waste item to be analyzed" className="rounded-md mb-4 max-h-64 mx-auto" />
                ) : (
                  <Bot size={48} className="mx-auto mb-4" />
                )}
                <h3 className="font-semibold">Awaiting Analysis</h3>
                <p>The AI analysis result will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
}
