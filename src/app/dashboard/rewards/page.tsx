'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { mockRewards } from "@/lib/mock-data"
import { Leaf } from 'lucide-react'
import { useAppContext } from "@/context/app-context"
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function RewardsPage() {
  const { greenPoints, isInitialized, addTransaction } = useAppContext();
  const { toast } = useToast();

  const handleRedeem = (reward: (typeof mockRewards)[0]) => {
    if (greenPoints >= reward.points) {
      addTransaction({
        id: `T${Date.now()}`,
        description: `Redeemed: ${reward.title}`,
        points: reward.points,
        date: new Date().toLocaleDateString('en-US'),
        type: 'debit',
      });
      toast({
        title: "Reward Redeemed!",
        description: `You have spent ${reward.points} points.`,
      });
      window.open(reward.url, '_blank');
    } else {
      toast({
        variant: "destructive",
        title: "Insufficient Points",
        description: "You do not have enough Green Points for this reward.",
      });
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rewards & Coupons</h1>
        <p className="text-muted-foreground">
          Use your Green Points to redeem exclusive rewards from our partners.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockRewards.map((reward) => (
          <Card key={reward.id} className="flex flex-col">
            <CardHeader className="flex-row items-start gap-4 space-y-0">
               <div className="p-3 rounded-full bg-primary/10">
                 <reward.icon className="w-6 h-6 text-primary"/>
               </div>
               <div className="flex-1">
                <CardTitle>{reward.title}</CardTitle>
                <CardDescription>{reward.description}</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="flex-grow">
               <p className="text-sm text-muted-foreground">From our partner: <strong>{reward.partner}</strong></p>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
              <div className="font-bold text-lg flex items-center gap-1">
                <Leaf className="w-5 h-5 text-primary"/>
                {reward.points}
              </div>
              {isInitialized ? (
                 <Button 
                    onClick={() => handleRedeem(reward)} 
                    disabled={greenPoints < reward.points}
                  >
                    Redeem
                  </Button>
              ) : (
                <Skeleton className="h-10 w-24" />
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
