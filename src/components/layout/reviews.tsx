'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const StarRating = ({ rating, setRating }: { rating: number; setRating?: (rating: number) => void }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'w-5 h-5 cursor-pointer transition-colors',
            rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50 hover:text-muted-foreground'
          )}
          onClick={() => setRating && setRating(star)}
        />
      ))}
    </div>
  );
};

export default function Reviews() {
  const { reviews, addReview } = useAppContext();
  const { toast } = useToast();
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewMessage, setNewReviewMessage] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewMessage || newReviewRating === 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields and provide a rating.',
      });
      return;
    }
    
    setIsSubmitting(true);

    addReview({
      id: `REV${Date.now()}`,
      name: newReviewName,
      message: newReviewMessage,
      rating: newReviewRating,
      avatarUrl: `https://picsum.photos/seed/${newReviewName}/100`,
    });

    toast({
      title: 'Review Submitted!',
      description: 'Thank you for your feedback.',
    });
    
    // Reset form
    setNewReviewName('');
    setNewReviewMessage('');
    setNewReviewRating(0);
    setIsSubmitting(false);
  };

  return (
    <section id="reviews" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline">
          What Our Users Say
        </h2>
        <p className="max-w-[700px] mx-auto mt-4 text-center text-muted-foreground">
          Hear from people who are making a difference with SafaiSetu.
        </p>
        <div className="grid gap-8 mt-12 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-background shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={review.avatarUrl} alt={review.name} data-ai-hint="person avatar" />
                  <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-lg">{review.name}</CardTitle>
                    <StarRating rating={review.rating} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">"{review.message}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="max-w-2xl mx-auto mt-16">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" placeholder="John Doe" value={newReviewName} onChange={e => setNewReviewName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label>Your Rating</Label>
                    <StarRating rating={newReviewRating} setRating={setNewReviewRating} />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your experience with SafaiSetu..." value={newReviewMessage} onChange={e => setNewReviewMessage(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}
