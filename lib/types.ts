// Data models for the library management system

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  publisher: string
  publishYear: number
  category: string
  description: string
  coverImage?: string
  totalCopies: number
  availableCopies: number
  createdAt: Date
  updatedAt: Date
}

export interface BookCopy {
  id: string
  bookId: string
  barcode: string
  status: "available" | "borrowed" | "maintenance" | "lost"
  location: string
  condition: "excellent" | "good" | "fair" | "poor"
  acquiredDate: Date
  notes?: string
}

export interface Member {
  id: string
  memberCode: string
  fullName: string
  email: string
  phone: string
  address: string
  dateOfBirth: Date
  membershipType: "student" | "teacher" | "public"
  membershipStatus: "active" | "suspended" | "expired"
  registrationDate: Date
  expiryDate: Date
  maxBorrowLimit: number
  currentBorrowCount: number
  totalFines: number
  avatar?: string
}

export interface Loan {
  id: string
  memberId: string
  bookCopyId: string
  bookId: string
  borrowDate: Date
  dueDate: Date
  returnDate?: Date
  status: "active" | "returned" | "overdue"
  renewalCount: number
  maxRenewals: number
  fineAmount: number
  notes?: string
}

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: "admin" | "librarian" | "member"
  avatar?: string
  createdAt: Date
}

export interface LoanHistory extends Loan {
  memberName: string
  bookTitle: string
  bookBarcode: string
}

export interface BorrowingStats {
  totalLoans: number
  activeLoans: number
  overdueLoans: number
  returnedLoans: number
  totalFines: number
}

export interface PopularBook {
  bookId: string
  title: string
  author: string
  borrowCount: number
  coverImage?: string
}
