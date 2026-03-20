
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownLeft, ArrowUpRight, Gift, Leaf, Recycle, ShoppingBag } from "lucide-react";

export default function ActivityHistoryPage() {
  const { transactions, isInitialized } = useAppContext();

  const renderIcon = (description: string) => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('recycle')) return <Recycle className="w-4 h-4 text-blue-500" />;
    if (lowerDesc.includes('redeemed') || lowerDesc.includes('purchase')) return <Gift className="w-4 h-4 text-red-500" />;
    if (lowerDesc.includes('sold') || lowerDesc.includes('parali')) return <Leaf className="w-4 h-4 text-green-600" />;
    return <ShoppingBag className="w-4 h-4 text-gray-500" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Activity History</CardTitle>
        <CardDescription>A complete log of all your points-related activities.</CardDescription>
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
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isInitialized ? transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-full">
                      {renderIcon(transaction.description)}
                    </div>
                    <span className="font-medium">{transaction.description}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                   <Badge className="text-xs gap-1" variant={transaction.type === 'credit' ? 'default' : 'destructive'}>
                    {transaction.type === 'credit' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {transaction.date}
                </TableCell>
                <TableCell className={cn("text-right font-semibold", transaction.type === 'credit' ? 'text-primary' : 'text-destructive')}>
                  {transaction.type === 'credit' ? '+' : '-'}{transaction.points}
                </TableCell>
              </TableRow>
            )) : (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
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
  )
}
