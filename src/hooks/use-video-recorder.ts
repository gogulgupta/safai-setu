
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVideoRecorderParams {
    onPermissionError?: () => void;
}

export const useVideoRecorder = ({ onPermissionError }: UseVideoRecorderParams = {}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const getCameraPermission = useCallback(async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Media Devices API not supported.');
            setHasPermission(false);
            onPermissionError?.();
            return null;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
            setHasPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            return stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasPermission(false);
            onPermissionError?.();
            return null;
        }
    }, [onPermissionError]);

    useEffect(() => {
        getCameraPermission();
    }, [getCameraPermission]);


    const startRecording = useCallback(async () => {
        const stream = await getCameraPermission();
        if (!stream) return;

        setRecordedVideoUrl(null);
        recordedChunksRef.current = [];
        
        try {
            const options = { mimeType: 'video/webm; codecs=vp8' };
            const recorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    setRecordedVideoUrl(base64data);
                };

                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error starting recording:", error)
        }

    }, [getCameraPermission]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const resetRecording = useCallback(async () => {
        setIsRecording(false);
        setRecordedVideoUrl(null);
        mediaRecorderRef.current = null;
        recordedChunksRef.current = [];
        await getCameraPermission();
    }, [getCameraPermission]);

    return {
        videoRef,
        isRecording,
        recordedVideoUrl,
        startRecording,
        stopRecording,
        resetRecording,
        hasPermission
    };
};
