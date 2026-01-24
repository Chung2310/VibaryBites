import type { Order, Customer } from './types';
import { subDays } from 'date-fns';

function createRecentDate(daysAgo: number) {
  return subDays(new Date(), daysAgo).toISOString().split('T')[0];
}

// NOTE: This file contains static data for demonstration purposes.
// Live data for orders, customers, and inventory is fetched directly from Firestore.

export const kpiData = {
  revenueToday: 15600000,
  newOrders: 25, // This is now dynamic in the dashboard
  processingOrders: 12, // This is now dynamic in the dashboard
  lowStockItems: 3, // This is now dynamic in the dashboard
};

export const revenueData = [
  { date: '2024-07-01', revenue: 12000000 },
  { date: '2024-07-02', revenue: 13500000 },
  { date: '2024-07-03', revenue: 11000000 },
  { date: '2024-07-04', revenue: 14800000 },
  { date: '2024-07-05', revenue: 15600000 },
  { date: '2024-07-06', revenue: 17200000 },
  { date: '2024-07-07', revenue: 19500000 },
];

export const productProportions = [
  { name: 'Bánh Entremet', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Bánh Sinh Nhật', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Bánh theo yêu cầu', value: 200, fill: 'hsl(var(--chart-3))' },
  { name: 'Phụ kiện', value: 100, fill: 'hsl(var(--chart-4))' },
];

// This is static for now as calculating this requires more complex logic
export const topSellingProducts = [
  { name: 'BE IN BLOSSOM', sold: 120 },
  { name: 'BELOVED DARLING', sold: 98 },
  { name: 'A LITTLE GRACE', sold: 75 },
  { name: 'SUMMER CALLING', sold: 60 },
  { name: 'A GENTLE BLEND', sold: 45 },
];
