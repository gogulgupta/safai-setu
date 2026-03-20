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
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Leaf } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAppContext } from "@/context/app-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardWallet() {
  const { greenPoints, transactions, isInitialized } = useAppContext();
  const nextReward = 1500;
  const progress = isInitialized ? (greenPoints / nextReward) * 100 : 0;

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="sm:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Your Green Points Wallet</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">
              Track your earnings and redeem rewards. Keep up the great work!
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild><Link href="/dashboard/scan">Start a New Return</Link></Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Balance</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-2">
              <Leaf className="text-primary" />
              {isInitialized ? greenPoints.toLocaleString() : <Skeleton className="h-8 w-24" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isInitialized ? (
              <div className="text-xs text-muted-foreground">
                +25% from last month
              </div>
            ) : <Skeleton className="h-4 w-32" />}
          </CardContent>
          <CardFooter>
            {isInitialized ? <Progress value={progress} aria-label={`${progress}% to next reward`} /> : <Skeleton className="h-4 w-full" />}
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next Reward Tier</CardDescription>
            <CardTitle className="text-4xl">
              {nextReward.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isInitialized ? (
              <div className="text-xs text-muted-foreground">
                {nextReward - greenPoints} points to go!
              </div>
            ) : <Skeleton className="h-4 w-24" />}
          </CardContent>
           <CardFooter>
            <Button variant="outline" asChild><Link href="/dashboard/rewards">View Rewards</Link></Button>
          </CardFooter>
        </Card>
      </div>
        <Card>
          <CardHeader className="px-7">
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              A log of your recent points activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Type
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isInitialized ? transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.description}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                       <Badge className="text-xs" variant={transaction.type === 'credit' ? 'default' : 'destructive'}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {transaction.date}
                    </TableCell>
                    <TableCell className={cn("text-right", transaction.type === 'credit' ? 'text-primary' : 'text-destructive')}>
                      {transaction.type === 'credit' ? '+' : '-'}{transaction.points}
                    </TableCell>
                  </TableRow>
                )) : (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  )
}
