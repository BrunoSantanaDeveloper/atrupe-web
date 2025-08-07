# Plan-Based Permissions System

## Overview

The Atrupe Web application implements a comprehensive plan-based permissions system that controls feature access based on subscription plans. This system ensures that users only have access to features included in their current subscription tier.

## Architecture

### Core Components

1. **Authentication & Session Management** (`src/lib/auth.ts`)
2. **Plan Features Hook** (`src/hooks/usePlanFeatures.ts`)
3. **Feature Gate Component** (`src/components/common/FeatureGate.tsx`)
4. **Permissions Constants** (`src/consts/permissions.ts`)
5. **Plan Adapter** (`src/lib/planAdapter.ts`)

## Subscription Plans

The system supports the following subscription plans:

- **TRIAL**: Trial period with limited features
- **START**: Basic plan with essential features
- **LITE**: Intermediate plan with extended functionality
- **PRO**: Advanced plan with more comprehensive features
- **ELITE**: Premium plan with advanced capabilities
- **FULL**: Complete plan with all features

## Permission Structure

### Session Data

User permissions are stored in the NextAuth session:

```typescript
interface Session {
  user: {
    userId: string
    permissions: string[]
    // ... other user properties
  }
  company: {
    plan: {
      name: 'TRIAL' | 'START' | 'LITE' | 'PRO' | 'ELITE' | 'FULL'
      active: boolean
      trialEndsAt: string
      features: string[]
    }
    // ... other company properties
  }
}
```

### Feature Categories

The permissions system covers the following main categories:

#### 1. Values & Pricing
- `values`: Access to pricing and value information

#### 2. Registration/Cadastros
- `client`: Client registration and management
- `supplier`: Supplier registration and management
- `credit_limit`: Credit limit management

#### 3. Sales/Vendas
- `quotation`: Budget/quotation management
- `order`: Service order management
- `quick`: Quick sales functionality
- `client`: Sales client selection
- `seller`: Sales seller assignment
- `other_sellers`: View other sellers' sales

#### 4. Production/Produção
- `delivery_schedule`: Delivery schedule management

#### 5. Financial/Financeiro
- `flow`: Financial flow management
- `flow_payable`: Expense posting
- `flow_receivable`: Revenue posting
- `payable`: Accounts payable
- `receivable`: Accounts receivable
- `fixed_expense`: Fixed expense management
- `payroll`: Payroll management
- `cash_control`: Cash flow control
- `checkout`: Point of sale

#### 6. Sales Settings
- `series`: Sales series configuration
- `seller_profile`: Seller profile management
- `rejection_reasons`: Rejection and cancellation reasons
- `quotation_status`: Budget status management

#### 7. Financial Settings
- `payment_methods`: Payment methods and bank accounts
- `fixed_expenses`: Fixed expenses configuration
- `chart_accounts`: Chart of accounts
- `credit_limits`: Credit limits configuration

#### 8. Product Settings
- `materials_products`: Materials and products management

#### 9. Invoice/Nota Fiscal
- `nfse`: Electronic service invoice (NFS-e)

#### 10. Reports/Relatórios
- `best_clients`: Best clients report
- `clients`: Clients report
- `quotations`: Quotations report
- `sales`: Sales report
- `sales_dashboard`: Sales dashboard
- `results_dashboard`: Results dashboard
- `flow_dashboard`: Flow dashboard
- `sales_receipts`: Sales receipts report
- `payables`: Expenses report
- `receivables`: Revenue report

#### 11. Company Settings
- `company_config`: Company configuration
- `measurement_standards`: Measurement standards
- `users`: Users and employees management
- `roles`: Roles management

## Implementation

### 1. Plan Features Hook

The `usePlanFeatures` hook provides methods to check feature availability:

```typescript
const {
  hasFeature,           // Check single feature
  hasAnyFeature,        // Check if any of multiple features is available
  hasAllFeatures,       // Check if all features are available
  getUserLimit,         // Get user limit based on plan
  canManageSectors,     // Check sector management capability
  getSalesOrdersType,   // Get sales orders functionality level
  // ... other specific feature checks
} = usePlanFeatures()
```

### 2. Feature Gate Component

The `FeatureGate` component conditionally renders content based on feature availability:

```typescript
<FeatureGate 
  features={['client', 'supplier']} 
  requireAll={false}
  showUpgradeMessage={true}
  fallback={<div>Feature not available</div>}
>
  <RestrictedContent />
</FeatureGate>
```

### 3. Navigation Permissions

Navigation items can be restricted using the `permission` property:

```typescript
{
  icon: IconReportMoney,
  title: 'Orçamentos',
  path: '/vendas/orcamentos',
  permission: 'sale:quotation:view',
}
```

### 4. Feature Types

The system supports different feature access levels:

- **Full**: Complete functionality
- **Limited**: Restricted functionality
- **None**: No access

Examples:
- `sales_orders_full` vs `sales_orders_limited`
- `bank_accounts_full` vs `bank_accounts_limited`
- `clients_full` vs `clients_limited`

## Usage Patterns

### Component-Level Feature Checking

```typescript
const { hasFeature, getSalesOrdersType } = usePlanFeatures()

// Simple feature check
if (hasFeature('quotation')) {
  // Show quotation functionality
}

// Feature level check
const salesOrdersType = getSalesOrdersType()
if (salesOrdersType === 'full') {
  // Show full sales orders functionality
} else if (salesOrdersType === 'limited') {
  // Show limited functionality
}
```

### Multiple Feature Requirements

```typescript
const { hasAllFeatures, hasAnyFeature } = usePlanFeatures()

// Require all features
if (hasAllFeatures(['client', 'quotation', 'financial_flow'])) {
  // Show advanced functionality
}

// Require any feature
if (hasAnyFeature(['client', 'supplier'])) {
  // Show basic registration functionality
}
```

### User Limits

```typescript
const { getUserLimit } = usePlanFeatures()

const userLimit = getUserLimit() // Returns 0, 3, or 5 based on plan
```

## Plan-Specific Features

### START Plan Features
- 3 users
- Single CNPJ registration
- Basic measurements
- Employee registration
- User profiles
- Sectors
- Quotations
- Service orders
- Financial flow
- Payment methods
- Fixed expenses
- Simplified payroll
- Chart of accounts
- Products without composition
- Simplified clients and suppliers

### LITE Plan Features
- Enhanced functionality over START
- Additional user limits
- Extended reporting capabilities
- Advanced client and supplier management

### Higher Tier Plans (PRO, ELITE, FULL)
- Progressively more features
- Higher user limits
- Advanced financial modules
- Complete reporting suite
- Multiple company management
- Full production capabilities

## Best Practices

1. **Always use `FeatureGate`** for conditional rendering of features
2. **Check permissions at multiple levels**: navigation, component, and API
3. **Provide meaningful fallback content** when features are unavailable
4. **Use specific feature checks** rather than plan name comparisons
5. **Test feature gates** with different subscription plans
6. **Consider user experience** when restricting features (show upgrade messages)

## Security Considerations

- Feature checks are implemented on both frontend and backend
- User permissions are validated server-side for all API requests
- Session management ensures permission data is kept up-to-date
- Feature restrictions are enforced at the navigation level to prevent unauthorized access

## Future Enhancements

- Dynamic feature configuration without code changes
- A/B testing for feature rollouts
- Granular permission inheritance
- Role-based permissions within plans
- Feature usage analytics and reporting