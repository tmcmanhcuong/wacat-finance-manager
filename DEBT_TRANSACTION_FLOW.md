# 🔄 Debt Transaction Flow - WaCat

## Tổng quan
Hệ thống Debt & Installment của WaCat tự động tạo transactions và cập nhật account balances khi user nhận hoặc trả nợ.

---

## 📥 Mark as Received (Nhận tiền từ người mượn)

### Flow:
1. User điền form:
   - Amount: Số tiền nhận
   - Date: Ngày nhận
   - Account: Tài khoản nhận tiền (**Required**)
   - Note: Ghi chú (Optional)

2. Khi click **Confirm**:
   - ✅ Tạo **Income Transaction** mới:
     ```typescript
     {
       type: 'income',
       amount: receiveAmountNum,
       category: 'debt-collection',  // Auto
       date: receiveDate,
       accountId: receiveAccount,
       description: `Received from ${person} - ${description} (${note})`
     }
     ```
   
   - ✅ Cập nhật **Account Balance**:
     ```typescript
     account.balance += receiveAmountNum  // Cộng tiền vào
     ```
   
   - ✅ Cập nhật **Debt Record**:
     ```typescript
     debt.amount += receiveAmountNum  // Tăng số tiền đã nhận
     ```
   
   - ✅ Thêm vào **Payment History**:
     ```typescript
     debt.paymentHistory.push({
       date, amount, note, progressAtTime
     })
     ```

### Categories:
- **Category ID**: `debt-collection`
- **Type**: Income
- **Icon**: DollarSign
- **Color**: #4ECDC4

---

## 💳 Pay Installment (Trả nợ/Trả góp)

### Flow:
1. User điền form:
   - Amount: Số tiền trả
   - Date: Ngày trả
   - Account: Tài khoản trả tiền (**Required**)
   - Note: Ghi chú (Optional)

2. Khi click **Confirm**:
   - ✅ Tạo **Expense Transaction** mới:
     ```typescript
     {
       type: 'expense',
       amount: payAmountNum,
       category: 'debt-payment',  // Auto
       date: payDate,
       accountId: payAccount,
       description: `Payment to ${person} - ${description} (${note})`
     }
     ```
   
   - ✅ Cập nhật **Account Balance**:
     ```typescript
     account.balance -= payAmountNum  // Trừ tiền ra
     ```
   
   - ✅ Cập nhật **Debt Record**:
     ```typescript
     debt.amount += payAmountNum  // Tăng số tiền đã trả
     ```
   
   - ✅ Thêm vào **Payment History**:
     ```typescript
     debt.paymentHistory.push({
       date, amount, note, progressAtTime
     })
     ```

### Categories:
- **Category ID**: `debt-payment`
- **Type**: Expense
- **Icon**: CreditCard
- **Color**: #FF6B6B

---

## 📊 Data Models

### Transaction
```typescript
{
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;  // 'debt-collection' hoặc 'debt-payment'
  date: string;
  accountId: string;
  description: string;
}
```

### Debt
```typescript
{
  id: string;
  type: 'lent' | 'borrowed' | 'installments';
  person: string;
  amount: number;        // Số tiền đã nhận/trả
  totalAmount: number;   // Tổng số tiền
  dueDate?: string;
  description?: string;
  paymentHistory?: PaymentHistory[];
}
```

### PaymentHistory
```typescript
{
  id: string;
  date: string;
  amount: number;
  note?: string;
  progressAtTime: number;  // % hoàn thành tại thời điểm đó
}
```

---

## 🎯 Key Features

### 1. **Auto Transaction Creation**
- Không cần tạo transaction thủ công
- Tự động gán category phù hợp
- Description tự động generate từ debt info

### 2. **Account Balance Sync**
- Received: Cộng balance (+)
- Payment: Trừ balance (-)
- Real-time update

### 3. **Payment History Timeline**
- Track mọi lần nhận/trả
- Hiển thị progress tại từng thời điểm
- Sắp xếp theo date (mới nhất trước)

### 4. **Progress Tracking**
- Live preview: Current vs New progress
- Progress bars với comparison
- "Fully Paid" badge khi hoàn thành

### 5. **Transaction Preview**
- Hiển thị trước transaction sẽ tạo
- Show account, category, amount
- Color-coded: Green (Income) / Red (Expense)

---

## 🚨 Validation Rules

### Account Required
```typescript
if (!receiveAccount || !payAccount) {
  // Show warning: "Please select an account to record this transaction"
  // Transaction will NOT be created
}
```

### Amount Validation
```typescript
if (amount > (totalAmount - amountPaid)) {
  // Show warning: "Amount exceeds outstanding balance"
}
```

### Minimum Amount
```typescript
if (amount <= 0) {
  // Form won't submit
}
```

---

## 📝 Example Scenarios

### Scenario 1: Nhận tiền từ John
```
User Action:
- Debt: John Doe owes 2,000,000₫
- Mark as Received: 500,000₫
- Account: MB Bank
- Note: "First payment"

System Creates:
✅ Transaction:
   - Type: Income
   - Amount: 500,000₫
   - Category: Debt Collection
   - Account: MB Bank
   - Description: "Received from John Doe - Personal loan (First payment)"

✅ Update MB Bank:
   - Old Balance: 8,750,000₫
   - New Balance: 9,250,000₫ (+500,000₫)

✅ Update Debt:
   - Paid: 500,000₫ → 1,000,000₫
   - Outstanding: 1,500,000₫ → 1,000,000₫
   - Progress: 25% → 50%
```

### Scenario 2: Trả góp iPhone
```
User Action:
- Debt: Credit Card - iPhone 15 Pro
- Pay Installment: 500,000₫
- Account: Cash
- Note: "Monthly payment"

System Creates:
✅ Transaction:
   - Type: Expense
   - Amount: 500,000₫
   - Category: Debt Payment
   - Account: Cash
   - Description: "Payment to Credit Card - iPhone 15 Pro (Monthly payment)"

✅ Update Cash:
   - Old Balance: 1,250,000₫
   - New Balance: 750,000₫ (-500,000₫)

✅ Update Debt:
   - Paid: 3,500,000₫ → 4,000,000₫
   - Outstanding: 1,500,000₫ → 1,000,000₫
   - Progress: 70% → 80%
```

---

## 🔍 Where to Find

### Files Modified:
1. `/src/app/store.ts` - Added categories
2. `/src/app/pages/debts.tsx` - Forms logic
3. `/src/app/types.ts` - Type definitions

### Console Logs:
```typescript
console.log('✅ Created Income/Expense Transaction:', newTransaction);
console.log('✅ Updated Account Balance:', account);
console.log('✅ Updated Debt:', debt);
```

---

## ✨ UI/UX Enhancements

### Info Boxes
- Blue box (Income): Mark as Received form
- Red box (Expense): Pay Installment form
- Explains transaction creation flow

### Account Selector
- Shows account name + current balance
- Required field (marked with *)
- Warning if not selected

### Transaction Preview Box
- Shows: Type, Amount, Account, Category
- Color-coded border
- Only visible when account selected

### Progress Comparison
- Current Progress (grey)
- New Progress (green)
- Side-by-side bars

### Payment History Timeline
- Reverse chronological order
- Amount, date, note, progress
- Scrollable if > 280px

---

🎉 **All done!** Hệ thống giờ đã tự động tạo transactions và sync account balances khi nhận/trả nợ.
