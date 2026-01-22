import type { Order, Customer } from './types';
import { products } from './data';
import { subDays } from 'date-fns';

function createRecentDate(daysAgo: number) {
  return subDays(new Date(), daysAgo).toISOString().split('T')[0];
}

export const kpiData = {
  revenueToday: 15600000,
  newOrders: 25,
  processingOrders: 12,
  lowStockItems: 3,
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

export const topSellingProducts = products.slice(0, 5).map(p => ({
  name: p.name,
  sold: Math.floor(Math.random() * 100) + 20,
}));

export const recentOrders: Order[] = [
  { id: '#VBR1008', customerName: 'Trần Thị B', date: createRecentDate(0), total: 700000, status: 'new', items: 1, customerAvatar: `https://i.pravatar.cc/40?u=a042581f4e29026704d` },
  { id: '#VBR1007', customerName: 'Nguyễn Văn A', date: createRecentDate(0), total: 650000, status: 'processing', items: 1, customerAvatar: `https://i.pravatar.cc/40?u=a042581f4e29026705d` },
  { id: '#VBR1006', customerName: 'Lê Hoàng', date: createRecentDate(1), total: 1280000, status: 'completed', items: 2, customerAvatar: `https://i.pravatar.cc/40?u=a042581f4e29026706d` },
  { id: '#VBR1005', customerName: 'Phạm Thị C', date: createRecentDate(1), total: 380000, status: 'completed', items: 1, customerAvatar: `https://i.pravatar.cc/40?u=a042581f4e29026707d` },
  { id: '#VBR1004', customerName: 'Vũ Đức D', date: createRecentDate(2), total: 620000, status: 'cancelled', items: 1, customerAvatar: `https://i.pravatar.cc/40?u=a042581f4e29026708d` },
];


export const allOrders: Order[] = [
  ...recentOrders,
  { id: '#VBR1003', customerName: 'Đặng Minh E', date: createRecentDate(3), total: 780000, status: 'completed', items: 1, customerAvatar: `https://i.pravatar.cc/40?u=a042581f4e29026709d` },
  { id: '#VBR1002', customerName: 'Hồ Thị F', date: createRecentDate(4), total: 1360000, status: 'completed', items: 2, customerAvatar: `https://i.pravatar.cc/40?u=a042581f4e29026710d` },
  { id: '#VBR1001', customerName: 'Ngô Văn G', date: createRecentDate(5), total: 680000, status: 'completed', items: 1, customerAvatar: `https://i.pravatar.cc/40?u=a042581f4e29026711d` },
];

export const customers: Customer[] = [
    { id: 'cus-001', name: 'Trần Thị B', email: 'b.tran@example.com', phone: '0987654321', totalOrders: 5, totalSpent: 3500000, joinedDate: createRecentDate(30), avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704d' },
    { id: 'cus-002', name: 'Nguyễn Văn A', email: 'a.nguyen@example.com', phone: '0123456789', totalOrders: 10, totalSpent: 8900000, joinedDate: createRecentDate(90), avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026705d' },
    { id: 'cus-003', name: 'Lê Hoàng', email: 'hoang.le@example.com', phone: '0912345678', totalOrders: 2, totalSpent: 1280000, joinedDate: createRecentDate(15), avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026706d' }
]

