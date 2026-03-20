
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Leaf, Trophy, Shield, Star, Zap, LoaderCircle, ImageUp, Video, Camera, Clapperboard, VideoIcon } from "lucide-react";
import { AppProvider, useAppContext } from "@/context/app-context";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { validateChallenge, type ValidateChallengeInput } from '@/ai/flows/validate-challenge-flow';
import { validateTreePlanting, type ValidateTreePlantingInput } from '@/ai/flows/validate-tree-planting-flow';
import { useVideoRecorder } from '@/hooks/use-video-recorder';


const leaderboardData = [
  { rank: 1, name: "Anjali Sharma", points: 4580, avatar: "https://picsum.photos/seed/Anjali/100" },
  { rank: 2, name: "Rajesh Kumar", points: 4210, avatar: "https://picsum.photos/seed/Rajesh/100" },
  { rank: 3, name: "You", points: 1250, avatar: "https://picsum.photos/seed/You/100" },
  { rank: 4, name: "Priya Mehta", points: 3980, avatar: "https://picsum.photos/seed/Priya/100" },
  { rank: 5, name: "Amit Singh", points: 3550, avatar: "https://picsum.photos/seed/Amit/100" },
].sort((a,b) => b.points - a.points).map((user, index) => ({...user, rank: index + 1}));


const initialChallenges = [
  { id: 1, title: "Recycle 15 Plastic Items", reward: 50, progress: 60, icon: Zap },
  { id: 2, title: "Community Cleanup Event", reward: 200, progress: 0, icon: Shield },
  { id: 3, title: "Try a No-Plastic Day", reward: 100, progress: 100, icon: Star },
];

function CommunityPageContent() {
    const { greenPoints, isInitialized, addTransaction } = useAppContext();
    const userRank = leaderboardData.find(u => u.name === 'You')?.rank || 0;
    
    // Page states
    const [communityGoal, setCommunityGoal] = useState({
        title: "Plant 100 Trees This Month!",
        current: 42,
        target: 100,
    });

    // Challenge states
    const [challenges, setChallenges] = useState(initialChallenges);
    const [selectedChallenge, setSelectedChallenge] = useState<(typeof initialChallenges)[0] | null>(null);
    const [isChallengeDialogOpen, setIsChallengeDialogOpen] = useState(false);
    
    // Community goal dialog state
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

    // AI & Camera states
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Video Recording Hook
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

    // Video Recording Hook for Challenges
    const {
        videoRef: challengeVideoRef,
        isRecording: isChallengeRecording,
        recordedVideoUrl: challengeRecordedVideoUrl,
        startRecording: startChallengeRecording,
        stopRecording: stopChallengeRecording,
        resetRecording: resetChallengeRecording,
        hasPermission: hasChallengeVideoPermission,
    } = useVideoRecorder({
        onPermissionError: () => toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions to use this feature.',
        })
    });


    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const startCamera = async () => {
          if (activeTab !== 'camera' || !isChallengeDialogOpen) return;
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
              description: 'Please enable camera permissions to use this feature.',
            });
          }
        };
    
        startCamera();
    
        return () => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        };
      }, [activeTab, isChallengeDialogOpen, toast]);

    const fileToDataUri = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleChallengeSubmit = async (proof: { imageUri?: string, videoUri?: string }) => {
        if (!selectedChallenge) return;
        setIsLoading(true);

        const { imageUri, videoUri } = proof;

        // For video, we'll use a frame for AI validation like the tree planting feature
        const challengeImageUri = imageUri || (videoUri ? await captureVideoFrame(videoUri) : '');

        if (!challengeImageUri) {
            toast({ variant: 'destructive', title: 'Invalid Submission', description: 'No valid proof was provided.' });
            setIsLoading(false);
            return;
        }

        const input: ValidateChallengeInput = {
            challengeImageUri,
            challengeTitle: selectedChallenge.title,
        };

        try {
            const result = await validateChallenge(input);
            if (result.isValid) {
                toast({
                    title: "Challenge Validated!",
                    description: `Progress updated for "${selectedChallenge.title}".`,
                });
                setChallenges(prev => 
                    prev.map(c => c.id === selectedChallenge.id ? {...c, progress: 100} : c)
                );
                addTransaction({
                    id: `CH${selectedChallenge.id}-${Date.now()}`,
                    description: `Challenge: ${selectedChallenge.title}`,
                    points: selectedChallenge.reward,
                    date: new Date().toLocaleDateString('en-US'),
                    type: 'credit'
                });
                setIsChallengeDialogOpen(false);
                resetChallengeRecording();
            } else {
                toast({
                    variant: "destructive",
                    title: "Validation Failed",
                    description: result.reason || "The submitted proof does not seem to match the challenge criteria.",
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
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const dataUri = await fileToDataUri(file);
            handleChallengeSubmit({ imageUri: dataUri });
        }
    };

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
                handleChallengeSubmit({ imageUri: dataUri });
            }
        }
    };
    
    const captureVideoFrame = (videoUrl: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const videoElement = document.createElement('video');
            videoElement.src = videoUrl;
            videoElement.crossOrigin = "anonymous";

            videoElement.onloadedmetadata = () => {
                videoElement.currentTime = videoElement.duration / 2; // Seek to middle
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
    
    const handleGoalSubmit = async (videoUrl: string) => {
        setIsLoading(true);
        try {
            const frameDataUri = await captureVideoFrame(videoUrl);
            const input: ValidateTreePlantingInput = { videoDataUri: frameDataUri };
            const result = await validateTreePlanting(input);
            
            if(result.isValid) {
                toast({
                    title: 'Contribution Validated!',
                    description: `Amazing! You've earned ${result.points} points for planting a tree!`
                });
                addTransaction({
                    id: `T${Date.now()}`,
                    description: 'Community Goal: Plant a Tree',
                    points: result.points,
                    date: new Date().toLocaleDateString('en-US'),
                    type: 'credit'
                });
                setCommunityGoal(prev => ({...prev, current: prev.current + 1}));
                setIsGoalDialogOpen(false);
                resetRecording();
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Validation Failed',
                    description: result.reason || 'AI could not confirm a tree was planted. Please try again.',
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Video Analysis Failed',
                description: 'An unexpected error occurred while analyzing your video.',
            });
        } finally {
            setIsLoading(false);
        }
    }


  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
        <Header />
        <main className="flex-1 py-8 px-4 md:px-8">
           <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight">Community Hub</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Join the movement for a cleaner planet. See your impact and challenge others!</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500"/> Leaderboard</CardTitle>
                            <CardDescription>See who's leading the charge in our community.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead className="w-[80px]">Rank</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Points</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaderboardData.map(user => (
                                    <TableRow key={user.rank} className={user.name === 'You' ? 'bg-primary/10' : ''}>
                                        <TableCell className="font-bold text-lg">{user.rank}</TableCell>
                                        <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold flex items-center justify-end gap-1">
                                            <Leaf className="w-4 h-4 text-primary" /> {user.points.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card>
                             <CardHeader>
                                <CardTitle>Your Eco-Stats</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                {isInitialized ? (
                                    <>
                                        <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                                            <span className="font-medium">Your Rank</span>
                                            <span className="font-bold text-lg">#{userRank}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                                            <span className="font-medium">Your Points</span>
                                            <span className="font-bold text-lg flex items-center gap-1">
                                                <Leaf className="w-4 h-4 text-primary"/> {greenPoints.toLocaleString()}
                                            </span>
                                        </div>
                                         <div className="space-y-2">
                                            <p className="font-medium">Badges</p>
                                            <div className="flex gap-2">
                                                <Badge variant="default" className="gap-1"><Star className="w-3 h-3"/> Eco-Warrior</Badge>
                                                <Badge variant="secondary" className="gap-1"><Shield className="w-3 h-3"/> Community Helper</Badge>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                                )}
                             </CardContent>
                        </Card>
                        
                         <Card>
                            <CardHeader>
                                <CardTitle>Community Goal</CardTitle>
                                <CardDescription>{communityGoal.title}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Progress value={(communityGoal.current / communityGoal.target) * 100} className="mb-2" />
                                <p className="text-sm text-center text-muted-foreground">
                                    {communityGoal.current} / {communityGoal.target.toLocaleString()} Trees Planted
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full">Contribute by Planting</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Prove You Planted a Tree!</DialogTitle>
                                            <DialogDescription>
                                                Record a short video of you planting a tree. Our AI will verify it to add to our community goal.
                                            </DialogDescription>
                                        </DialogHeader>
                                        {isLoading ? (
                                            <div className="flex flex-col items-center justify-center h-48 gap-4">
                                                <LoaderCircle className="w-12 h-12 animate-spin text-primary"/>
                                                <p className="text-muted-foreground">AI is validating your contribution...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 pt-4">
                                                <div className="rounded-md border bg-card aspect-video w-full overflow-hidden relative">
                                                    {recordedVideoUrl ? (
                                                        <video src={recordedVideoUrl} controls className="w-full h-full object-cover" />
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
                                                        <Button onClick={stopRecording} variant="destructive">Stop Recording</Button>
                                                    ) : (
                                                        <Button onClick={startRecording} disabled={!hasVideoPermission}>Start Recording</Button>
                                                    )}
                                                    
                                                    {recordedVideoUrl && (
                                                        <Button onClick={() => handleGoalSubmit(recordedVideoUrl)}>
                                                            Submit Video
                                                        </Button>
                                                    )}
                                                </div>
                                                 {recordedVideoUrl && !isRecording && (
                                                    <Button onClick={resetRecording} variant="outline" className="w-full">
                                                        Record Again
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        <DialogClose asChild>
                                            <Button type="button" variant="secondary" className="mt-2">Cancel</Button>
                                        </DialogClose>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Weekly Eco-Challenges</CardTitle>
                        <CardDescription>Complete challenges to earn bonus points and climb the leaderboard!</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {challenges.map(challenge => (
                        <Card key={challenge.id} className="flex flex-col">
                            <CardHeader className="flex-row items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <challenge.icon className="w-6 h-6 text-primary"/>
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                                    <CardDescription>Reward: {challenge.reward} points</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <Progress value={challenge.progress} />
                            </CardContent>
                            <CardFooter>
                                <Dialog open={isChallengeDialogOpen && selectedChallenge?.id === challenge.id} onOpenChange={(isOpen) => {
                                    if(!isOpen) setSelectedChallenge(null);
                                    setIsChallengeDialogOpen(isOpen);
                                    if(!isOpen) resetChallengeRecording();
                                }}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            className="w-full" 
                                            disabled={challenge.progress === 100 || isLoading}
                                            onClick={() => setSelectedChallenge(challenge)}
                                        >
                                            {challenge.progress === 100 ? <> <Check className="w-4 h-4 mr-2"/> Completed</> : 'Join Challenge'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Submit for: {selectedChallenge?.title}</DialogTitle>
                                            <DialogDescription>
                                                Provide proof by uploading a photo, using your camera, or recording a video.
                                            </DialogDescription>
                                        </DialogHeader>
                                        {isLoading ? (
                                            <div className="flex flex-col items-center justify-center h-48 gap-4">
                                                <LoaderCircle className="w-12 h-12 animate-spin text-primary"/>
                                                <p className="text-muted-foreground">AI is validating your submission...</p>
                                            </div>
                                        ) : (
                                            <Tabs defaultValue="upload" className="w-full" onValueChange={setActiveTab}>
                                                <TabsList className="grid w-full grid-cols-3">
                                                    <TabsTrigger value="upload"><ImageUp className="mr-2 h-4 w-4"/> Upload</TabsTrigger>
                                                    <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4"/> Camera</TabsTrigger>
                                                    <TabsTrigger value="video"><VideoIcon className="mr-2 h-4 w-4"/> Video</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="upload">
                                                    <div className="pt-4">
                                                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                                                        <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                                                            <ImageUp className="mr-2 h-4 w-4"/> Select Image
                                                        </Button>
                                                    </div>
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
                                                                <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                                                            </Alert>
                                                        )}
                                                        <Button onClick={captureImage} disabled={!hasCameraPermission} className="w-full">
                                                            <Camera className="mr-2 h-4 w-4"/> Capture & Submit
                                                        </Button>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="video">
                                                    <div className="space-y-4 pt-4">
                                                         <div className="rounded-md border bg-card aspect-video w-full overflow-hidden relative">
                                                            {challengeRecordedVideoUrl ? (
                                                                <video src={challengeRecordedVideoUrl} controls className="w-full h-full object-cover" />
                                                            ) : (
                                                                <video ref={challengeVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                                            )}
                                                        </div>
                                                        {!hasChallengeVideoPermission && (
                                                            <Alert variant="destructive">
                                                                <AlertTitle>Camera Access Required</AlertTitle>
                                                                <AlertDescription>Please allow camera access to record video.</AlertDescription>
                                                            </Alert>
                                                        )}
                                                         <div className='grid grid-cols-2 gap-2'>
                                                            {isChallengeRecording ? (
                                                                <Button onClick={stopChallengeRecording} variant="destructive">Stop Recording</Button>
                                                            ) : (
                                                                <Button onClick={startChallengeRecording} disabled={!hasChallengeVideoPermission}>Start Recording</Button>
                                                            )}
                                                            
                                                            {challengeRecordedVideoUrl && (
                                                                <Button onClick={() => handleChallengeSubmit({ videoUri: challengeRecordedVideoUrl })}>
                                                                    Submit Video
                                                                </Button>
                                                            )}
                                                        </div>
                                                        {challengeRecordedVideoUrl && !isChallengeRecording && (
                                                            <Button onClick={resetChallengeRecording} variant="outline" className="w-full">
                                                                Record Again
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        )}
                                        <DialogClose asChild>
                                            <Button type="button" variant="secondary" className="mt-2">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                        ))}
                    </CardContent>
                </Card>
           </div>
        </main>
        <Footer />
    </div>
  )
}

export default function CommunityPage() {
    return (
        <AppProvider>
            <CommunityPageContent />
        </AppProvider>
    )
}

    