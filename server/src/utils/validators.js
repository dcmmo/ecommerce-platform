const ORDER_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'];

export function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

export function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

export function isNonNegativeInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) >= 0;
}

export function isValidImageUrl(value = '') {
  if (!value) return false;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function validateRegisterInput({ name, email, password }) {
  if (!name?.trim()) return 'Name is required.';
  if (!email?.trim()) return 'Email is required.';
  if (!password || password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function validateLoginInput({ email, password }) {
  if (!email?.trim() || !password) return 'Email and password are required.';
  return null;
}

export function validateProductInput({ name, description, price, stock, imageUrl }) {
  if (!name?.trim()) return 'Product name is required.';
  if (!description?.trim() || description.trim().length < 12) {
    return 'Description must be at least 12 characters.';
  }
  if (!isPositiveInteger(price)) return 'Price must be a positive whole number in cents.';
  if (!isNonNegativeInteger(stock)) return 'Stock must be 0 or greater.';
  if (!imageUrl?.trim() || !isValidImageUrl(imageUrl)) {
    return 'A valid image URL is required.';
  }
  return null;
}

export function validateCartInput({ productId, quantity }) {
  if (!isPositiveInteger(productId)) return 'A valid product is required.';
  if (!isPositiveInteger(quantity)) return 'Quantity must be at least 1.';
  return null;
}

export function validateCheckoutInput({ paymentIntentId, shippingAddress }) {
  if (!paymentIntentId?.trim()) return 'Payment intent is required.';
  if (!shippingAddress?.trim() || shippingAddress.trim().length < 10) {
    return 'Shipping address must be at least 10 characters.';
  }
  return null;
}

export function validateOrderStatus(status) {
  return ORDER_STATUSES.includes(status) ? null : 'Invalid order status.';
}
