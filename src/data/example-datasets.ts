interface ExampleDataset {
  name: string;
  data: Record<string, string>[];
  transform: (item: Record<string, string>) => unknown;
}

export const EXAMPLE_DATASETS: ExampleDataset[] = [
  {
    name: 'Products',
    data: [
      { id: "1", product: "Laptop Pro", price: "$1299.99", stock: "15", category: "Electronics" },
      { id: "2", product: "Wireless Mouse", price: "$49.99", stock: "42", category: "Accessories" },
      { id: "3", product: "USB-C Cable", price: "$19.99", stock: "108", category: "Accessories" },
      { id: "4", product: "4K Monitor", price: "$599.99", stock: "23", category: "Electronics" },
      { id: "5", product: "Mechanical Keyboard", price: "$159.99", stock: "67", category: "Electronics" },
      { id: "6", product: "Laptop Stand", price: "$39.99", stock: "91", category: "Accessories" }
    ],
    transform: (item) => ({
      id: parseInt(item.id),
      product: item.product,
      price: parseFloat(item.price.replace('$', '')),
      stock: parseInt(item.stock),
      category: item.category.toLowerCase()
    })
  },
  {
    name: 'Users',
    data: [
      { user_id: "1001", name: "John Smith", email: "john@example.com", role: "Admin", last_login: "2024-03-01" },
      { user_id: "1002", name: "Sarah Johnson", email: "sarah@example.com", role: "Editor", last_login: "2024-02-28" },
      { user_id: "1003", name: "Mike Brown", email: "mike@example.com", role: "Viewer", last_login: "2024-03-02" },
      { user_id: "1004", name: "Emma Wilson", email: "emma@example.com", role: "Editor", last_login: "2024-03-01" },
      { user_id: "1005", name: "David Lee", email: "david@example.com", role: "Admin", last_login: "2024-02-29" },
      { user_id: "1006", name: "Lisa Anderson", email: "lisa@example.com", role: "Viewer", last_login: "2024-03-02" }
    ],
    transform: (item) => ({
      userId: parseInt(item.user_id),
      name: item.name,
      email: item.email,
      role: item.role.toLowerCase(),
      lastLogin: item.last_login
    })
  },
  {
    name: 'Orders',
    data: [
      { order_id: "ORD001", customer: "Alice Cooper", items: "3", total: "$156.99", status: "Shipped" },
      { order_id: "ORD002", customer: "Bob Dylan", items: "1", total: "$89.99", status: "Processing" },
      { order_id: "ORD003", customer: "Charlie Brown", items: "2", total: "$234.50", status: "Delivered" },
      { order_id: "ORD004", customer: "Diana Ross", items: "4", total: "$445.00", status: "Processing" },
      { order_id: "ORD005", customer: "Elvis Presley", items: "2", total: "$178.50", status: "Shipped" },
      { order_id: "ORD006", customer: "Frank Sinatra", items: "1", total: "$99.99", status: "Pending" }
    ],
    transform: (item) => ({
      orderId: item.order_id,
      customer: item.customer,
      itemCount: parseInt(item.items),
      total: parseFloat(item.total.replace('$', '')),
      status: item.status.toLowerCase()
    })
  }
] 