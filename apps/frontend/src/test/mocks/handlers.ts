import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const handlers = [
  // Dashboard metrics
  http.get(`${API_URL}/analytics/dashboard`, () => {
    return HttpResponse.json({
      totalWasteCost: 150.5,
      wasteRecordCount: 12,
      expiringItemsAlert: 3,
      lowStockAlert: 5,
      averageWastePerRecord: 12.54,
      categoryBreakdown: [
        { name: 'Produce', value: 45 },
        { name: 'Dairy', value: 35 },
        { name: 'Meat', value: 20 },
      ],
      dailyTrend: [
        { date: '2026-07-27', cost: 20, quantity: 15 },
        { date: '2026-07-28', cost: 22, quantity: 18 },
        { date: '2026-07-29', cost: 18, quantity: 12 },
        { date: '2026-07-30', cost: 25, quantity: 20 },
        { date: '2026-07-31', cost: 23, quantity: 17 },
        { date: '2026-08-01', cost: 21, quantity: 16 },
        { date: '2026-08-02', cost: 21.5, quantity: 16 },
      ],
    });
  }),

  // AI Predictions
  http.get(`${API_URL}/ai/predictions`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 'pred-1',
          predictionType: 'WASTE',
          value: 25.5,
          confidence: 0.85,
          unit: 'kg',
          recommendation: 'Reduce waste in produce by 20%',
          predictedFor: '2026-08-02',
        },
        {
          id: 'pred-2',
          predictionType: 'DEMAND',
          value: 45.0,
          confidence: 0.75,
          unit: 'kg',
          recommendation: 'Increase tomato stock for weekend demand',
          predictedFor: '2026-08-02',
        },
      ],
    });
  }),

  http.post(`${API_URL}/ai/generate`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Notifications
  http.get(`${API_URL}/notifications`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 'notif-1',
          type: 'WASTE_CREATED',
          title: 'New Waste Record',
          message: 'Produce waste recorded: 10 kg, $25.50',
          severity: 'INFO',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'notif-2',
          type: 'INVENTORY_LOW',
          title: 'Low Stock Alert',
          message: 'Tomato is running low: 5 kg remaining',
          severity: 'WARNING',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 2,
      unreadCount: 2,
      limit: 20,
      skip: 0,
    });
  }),

  http.get(`${API_URL}/notifications/unread/count`, () => {
    return HttpResponse.json({ unreadCount: 2 });
  }),

  http.patch(`${API_URL}/notifications/:id/read`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.patch(`${API_URL}/notifications/read-all`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Waste records
  http.get(`${API_URL}/waste`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 'waste-1',
          category: 'Produce',
          quantity: 10,
          unit: 'kg',
          costImpact: 25.5,
          status: 'APPROVED',
        },
      ],
      pagination: {
        total: 1,
        skip: 0,
        take: 20,
        pages: 1,
      },
    });
  }),

  http.post(`${API_URL}/waste`, () => {
    return HttpResponse.json(
      {
        id: 'waste-new',
        category: 'Produce',
        quantity: 5,
        unit: 'kg',
        costImpact: 12.5,
        status: 'PENDING',
      },
      { status: 201 },
    );
  }),
];
