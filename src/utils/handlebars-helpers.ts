import Handlebars from 'handlebars';

// Format date
Handlebars.registerHelper('formatDate', function(date: Date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Format currency
Handlebars.registerHelper('formatCurrency', function(value: number) {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('vi-VN');
});

// Multiply two numbers
Handlebars.registerHelper('multiply', function(a: number, b: number) {
  return a * b;
});

// Current year
Handlebars.registerHelper('currentYear', function() {
  return new Date().getFullYear();
});

// Translate order status
Handlebars.registerHelper('translateStatus', function(status: string) {
  const statusMap: Record<string, string> = {
    'PENDING': 'Chờ xác nhận',
    'PROCESSING': 'Đang xử lý',
    'SHIPPED': 'Đang vận chuyển',
    'DELIVERED': 'Đã giao hàng',
    'CANCELLED': 'Đã hủy'
  };
  
  return statusMap[status] || status;
});
