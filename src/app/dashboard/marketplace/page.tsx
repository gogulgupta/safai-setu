

'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Leaf, Trash2 } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";
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
} from "@/components/ui/alert-dialog"
import type { Product } from "@/lib/types";

export default function MarketplacePage() {
  const { greenPoints, addTransaction, isInitialized, products, deleteProduct } = useAppContext();
  const { toast } = useToast();

  const handlePurchase = (productPrice: number) => {
    if (greenPoints >= productPrice) {
      addTransaction({
        id: `T${Date.now()}`,
        description: 'Marketplace Purchase',
        points: productPrice,
        date: new Date().toLocaleDateString('en-US'),
        type: 'debit',
      });
      toast({
        title: "Purchase Successful!",
        description: `You have redeemed ${productPrice} points.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Insufficient Points",
        description: "You do not have enough Green Points to purchase this item.",
      });
    }
  };
  
  const handleDelete = (product: Product) => {
    deleteProduct(product);
    toast({
      title: "Item Removed",
      description: `${product.name} has been removed from the marketplace.`,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and purchase eco-friendly products using your Green Points.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col overflow-hidden group">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                data-ai-hint={product.aiHint}
              />
            </div>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow"></CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
              <div className="font-bold text-lg flex items-center gap-1">
                <Leaf className="w-5 h-5 text-primary" />
                {product.pointsPrice}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePurchase(product.pointsPrice)}
                  disabled={!isInitialized || greenPoints < product.pointsPrice}
                >
                  Buy Now
                </Button>
                {product.returnId && (
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-10 w-10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{product.name}" from the marketplace. 
                        The {product.originalPoints} points you earned will be deducted. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(product)}>Delete Item</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
