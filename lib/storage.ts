// Local storage utilities for persisting data
import type { Book, BookCopy, Member, Loan } from "./types"
import { mockBooks, mockBookCopies, mockMembers, mockLoans } from "./mock-data"

const BOOKS_KEY = "library_books"
const BOOK_COPIES_KEY = "library_book_copies"
const MEMBERS_KEY = "library_members"
const LOANS_KEY = "library_loans"

// Initialize storage with mock data if empty
export function initializeStorage() {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(BOOKS_KEY)) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(mockBooks))
  }
  if (!localStorage.getItem(BOOK_COPIES_KEY)) {
    localStorage.setItem(BOOK_COPIES_KEY, JSON.stringify(mockBookCopies))
  }
  if (!localStorage.getItem(MEMBERS_KEY)) {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(mockMembers))
  }
  if (!localStorage.getItem(LOANS_KEY)) {
    localStorage.setItem(LOANS_KEY, JSON.stringify(mockLoans))
  }
}

// Books
export function getBooks(): Book[] {
  if (typeof window === "undefined") return mockBooks
  const data = localStorage.getItem(BOOKS_KEY)
  return data ? JSON.parse(data) : mockBooks
}

export function saveBooks(books: Book[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books))
}

// Book Copies
export function getBookCopies(): BookCopy[] {
  if (typeof window === "undefined") return mockBookCopies
  const data = localStorage.getItem(BOOK_COPIES_KEY)
  return data ? JSON.parse(data) : mockBookCopies
}

export function saveBookCopies(copies: BookCopy[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(BOOK_COPIES_KEY, JSON.stringify(copies))
}

// Members
export function getMembers(): Member[] {
  if (typeof window === "undefined") return mockMembers
  const data = localStorage.getItem(MEMBERS_KEY)
  return data ? JSON.parse(data) : mockMembers
}

export function saveMembers(members: Member[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
}

// Loans
export function getLoans(): Loan[] {
  if (typeof window === "undefined") return mockLoans
  const data = localStorage.getItem(LOANS_KEY)
  return data ? JSON.parse(data) : mockLoans
}

export function saveLoans(loans: Loan[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOANS_KEY, JSON.stringify(loans))
}

export function renewLoan(loanId: string): boolean {
  if (typeof window === "undefined") return false

  const loans = getLoans()
  const loanIndex = loans.findIndex((l) => l.id === loanId)

  if (loanIndex === -1) return false

  const loan = loans[loanIndex]

  // Check if loan can be renewed (max 2 renewals, not overdue)
  if (loan.renewalCount >= 2) return false
  if (new Date(loan.dueDate) < new Date()) return false

  // Extend due date by 14 days
  const newDueDate = new Date(loan.dueDate)
  newDueDate.setDate(newDueDate.getDate() + 14)

  loans[loanIndex] = {
    ...loan,
    dueDate: newDueDate.toISOString(),
    renewalCount: loan.renewalCount + 1,
  }

  saveLoans(loans)
  return true
}
