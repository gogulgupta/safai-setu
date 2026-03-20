
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Trash2, Gift } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HeroAnimation from '@/components/three/hero-animation';
import Reviews from '@/components/layout/reviews';
import { AppProvider } from '@/context/app-context';

export default function Home() {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">
          <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center overflow-hidden">
            <HeroAnimation />
            <div className="relative z-10 p-4 space-y-4 bg-black/30 backdrop-blur-sm rounded-xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white font-headline">
                SafaiSetu
              </h1>
              <p className="max-w-[700px] mx-auto text-lg md:text-xl text-white/90">
                Your Clean City, One Return at a Time. The digital bridge for smart waste management.
              </p>
              <Button asChild size="lg">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </section>

          <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline">
                How It Works
              </h2>
              <p className="max-w-[700px] mx-auto mt-4 text-center text-muted-foreground">
                A simple, rewarding, and smart way to manage waste and contribute to a cleaner environment.
              </p>
              <div className="grid gap-8 mt-12 md:grid-cols-3">
                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      <QrCode className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Scan & Return</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Scan barcodes on packaging to easily return items at partner locations. It's quick, simple, and effective.
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      <Trash2 className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Smart Bins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Pair with our smart bins for automatic waste segregation and get notified when they're full.
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      <Gift className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Earn Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Collect Green Points for every responsible disposal and redeem them for exciting discounts and coupons.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 text-sm rounded-lg bg-primary text-primary-foreground">
                  Our Mission
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                  Building a Sustainable Future
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SafaiSetu aims to revolutionize waste management by creating a circular economy. We connect consumers, recyclers, and municipalities through a seamless digital platform, making recycling rewarding and efficient for everyone.
                </p>
              </div>
              <Image
                src="https://picsum.photos/600/400"
                alt="Community Recycling"
                width={600}
                height={400}
                className="mx-auto overflow-hidden rounded-xl object-cover shadow-lg"
                data-ai-hint="community recycling"
              />
            </div>
          </section>
          
          <Reviews />

        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}
