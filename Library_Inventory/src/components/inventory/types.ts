export interface Resource {
  id: string;
  title: string;
  type: string;
  category: string;
  quantity: number;
  suggestedTopics: string;
  keywords: string;
  pictureUrl: string;
  status: string;
}

export interface ReservationReceipt {
  reservationId: string;
  resourceTitle: string;
  requestedQuantity: number;
  borrowDate: string;
  dueDate: string;
  status: string;
  submittedAt: string;
}

export interface MultiReservationReceiptItem {
  reservationId: string;
  resourceId: string;
  resourceTitle: string;
  requestedQuantity: number;
  status: string;
}

export interface MultiReservationFailureItem {
  resourceId: string;
  resourceTitle: string;
  requestedQuantity: number;
  reason: string;
}

export interface MultiReservationReceipt {
  borrowDate: string;
  dueDate: string;
  submittedAt: string;
  successfulItems: MultiReservationReceiptItem[];
  failedItems: MultiReservationFailureItem[];
}
