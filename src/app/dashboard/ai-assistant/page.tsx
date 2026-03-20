
'use client';

import { useState } from 'react';
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
  askAiAssistant,
  type AiAssistantInput,
  type AiAssistantOutput,
} from '@/ai/flows/ai-assistant-flow';
import { useToast } from '@/hooks/use-toast';
import { Bot, LoaderCircle, Sparkles, Mic } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  query: z.string().min(2, {
    message: "Query must be at least 2 characters.",
  }),
});

export default function AiAssistantPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiAssistantOutput | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const {
    isListening,
    startListening,
    stopListening,
  } = useSpeechToText({
    onTranscript: (text) => {
      form.setValue('query', form.getValues('query') + text);
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Speech Recognition Error', description: error }),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setCurrentQuery(values.query);

    const input: AiAssistantInput = {
      query: values.query,
    };

    try {
      const response = await askAiAssistant(input);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'The AI assistant could not be reached. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };


  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
          <CardDescription>
            Have a question about recycling, government schemes, or how to use the app? Ask our AI assistant for help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Question</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g., How do I recycle e-waste?" {...field} className="pr-10" />
                         <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            className={cn(
                              "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8",
                              isListening && "text-primary animate-pulse"
                            )}
                            onClick={toggleListening}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Get Answer
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="flex items-center justify-center">
        {isLoading && (
          <div className="text-center space-y-2">
            <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">The AI is generating an answer...</p>
          </div>
        )}
        {result && (
          <Card className="w-full">
            <CardHeader>
                <CardTitle>AI Response</CardTitle>
                <CardDescription>For your query: "{currentQuery}"</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm whitespace-pre-wrap">{result.answer}</p>
            </CardContent>
          </Card>
        )}
        {!isLoading && !result && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg w-full">
            <Bot size={48} className="mx-auto mb-4" />
            <h3 className="font-semibold">Awaiting Your Question</h3>
            <p>The AI's answer will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
