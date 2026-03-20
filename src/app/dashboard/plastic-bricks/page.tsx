
'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HouseAnimation from '@/components/three/house-animation';
import { Droplets, IndianRupee, Home, Box, Scaling, ToyBrick } from 'lucide-react';
import BrickAnimation from '@/components/three/brick-animation';

const PLASTIC_PER_BRICK_KG = 1.5; // Each brick requires 1.5kg of plastic
const COST_PER_BRICK = 10; // Cost is ₹10 per brick
const BRICKS_PER_SQFT = 8; // Approximation for wall area

export default function PlasticBricksPage() {
  const [quantity, setQuantity] = useState(100);
  const [houseSqFt, setHouseSqFt] = useState(1000);
  const [houseDims, setHouseDims] = useState({ length: 20, breadth: 15, height: 10 });

  const { requiredPlastic, totalCost } = useMemo(() => {
    const numQuantity = Number(quantity) || 0;
    return {
      requiredPlastic: numQuantity * PLASTIC_PER_BRICK_KG,
      totalCost: numQuantity * COST_PER_BRICK,
    };
  }, [quantity]);
  
  const { bricksForHouseBySqFt, bricksForHouseByDims } = useMemo(() => {
    const sqFt = Number(houseSqFt) || 0;
    const { length, breadth, height } = houseDims;
    const wallArea = 2 * (length * height) + 2 * (breadth * height);
    return {
        bricksForHouseBySqFt: sqFt * BRICKS_PER_SQFT,
        bricksForHouseByDims: wallArea * BRICKS_PER_SQFT
    }
  }, [houseSqFt, houseDims]);


  const handleDimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setHouseDims(prev => ({ ...prev, [id]: Number(value) }));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <div className="flex flex-col gap-8 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Plastic Brick Calculator</CardTitle>
            <CardDescription>
              Calculate the plastic and cost for manufacturing plastic bricks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Enter Quantity of Bricks</Label>
                <Input 
                  id="quantity" 
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="e.g., 100" 
                />
              </div>
               <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className='flex items-center gap-3'>
                        <Droplets className="w-6 h-6 text-primary"/>
                        <p className="font-semibold">Required Plastic</p>
                    </div>
                    <p className="text-lg font-bold">{requiredPlastic.toLocaleString()} kg</p>
                </div>
                 <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className='flex items-center gap-3'>
                        <IndianRupee className="w-6 h-6 text-primary"/>
                        <p className="font-semibold">Estimated Cost</p>
                    </div>
                    <p className="text-lg font-bold">₹{totalCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>House Brick Estimator</CardTitle>
                <CardDescription>
                  Estimate bricks needed based on total square footage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                    <Label htmlFor="sqft">Enter House Area (sq. ft.)</Label>
                    <Input 
                      id="sqft" 
                      type="number"
                      value={houseSqFt}
                      onChange={(e) => setHouseSqFt(Number(e.target.value))}
                      placeholder="e.g., 1000" 
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg mt-4">
                    <div className='flex items-center gap-3'>
                        <Home className="w-6 h-6 text-primary"/>
                        <p className="font-semibold">Approx. Bricks</p>
                    </div>
                    <p className="text-lg font-bold">{bricksForHouseBySqFt.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ToyBrick className="w-6 h-6"/>3D Brick Model</CardTitle>
                </CardHeader>
                <CardContent className="h-[150px] p-0">
                    <BrickAnimation />
                </CardContent>
            </Card>
        </div>
      </div>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>House 3D Visualizer</CardTitle>
          <CardDescription>
            Enter dimensions to see a 3D model and estimate required materials.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="length">Length (ft)</Label>
                    <Input id="length" type="number" value={houseDims.length} onChange={handleDimChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="breadth">Breadth (ft)</Label>
                    <Input id="breadth" type="number" value={houseDims.breadth} onChange={handleDimChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="height">Height (ft)</Label>
                    <Input id="height" type="number" value={houseDims.height} onChange={handleDimChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <Card className="bg-secondary/50">
                    <CardHeader className='p-4'>
                      <CardDescription>Est. Bricks for Walls</CardDescription>
                      <CardTitle className='flex items-center gap-2'><Box className="w-5 h-5 text-primary"/>{bricksForHouseByDims.toLocaleString()}</CardTitle>
                    </CardHeader>
                  </Card>
                   <Card className="bg-secondary/50">
                    <CardHeader className='p-4'>
                      <CardDescription>Est. Plastic for Walls</CardDescription>
                      <CardTitle className='flex items-center gap-2'><Droplets className="w-5 h-5 text-primary"/>{(bricksForHouseByDims * PLASTIC_PER_BRICK_KG).toLocaleString()} kg</CardTitle>
                    </CardHeader>
                  </Card>
              </div>
            </div>
            <div className="h-[300px] md:h-full w-full p-0 rounded-lg bg-secondary overflow-hidden">
                <HouseAnimation {...houseDims} />
            </div>
        </CardContent>
         <CardFooter className="flex-col items-start gap-2 text-sm text-muted-foreground pt-6">
             <div className='flex items-center gap-2'>
                <Scaling className="w-4 h-4" />
                <p><strong>Note:</strong> The 3D model is a simplified representation. The brick estimate is for the four main walls only.</p>
             </div>
        </CardFooter>
      </Card>
    </div>
  )
}
