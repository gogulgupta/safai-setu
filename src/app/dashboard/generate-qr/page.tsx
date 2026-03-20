
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode.react";

export default function GenerateQrPage() {
    const [binId, setBinId] = useState('SAFAI-BIN-XYZ-123');
    const [qrValue, setQrValue] = useState('SAFAI-BIN-XYZ-123');

    const handleGenerate = () => {
        setQrValue(binId);
    };

    const handleDownload = () => {
        const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${qrValue}-qrcode.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Bin QR Code</CardTitle>
                    <CardDescription>
                        Create a unique QR code for a new smart bin. This code can be printed and attached to the physical bin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="binId">Smart Bin ID</Label>
                        <Input
                            id="binId"
                            placeholder="Enter unique bin identifier"
                            value={binId}
                            onChange={(e) => setBinId(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleGenerate} className="w-full">Generate QR Code</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Generated QR Code</CardTitle>
                    <CardDescription>
                        Download this QR code and affix it to your smart bin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-6">
                    {qrValue ? (
                        <>
                            <div className="p-4 bg-white rounded-lg border">
                                <QRCode
                                    id="qr-code-canvas"
                                    value={qrValue}
                                    size={256}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            </div>
                            <p className="font-mono text-sm text-muted-foreground">{qrValue}</p>
                            <Button onClick={handleDownload} variant="outline" className="w-full">
                                Download PNG
                            </Button>
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg w-full h-full flex items-center justify-center">
                            <p>Enter a Bin ID to generate a QR code.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
