import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isSale(product) {
  if (!product.sale_price || !product.sale_effective_period) return false;
  const now = Date.now();
  const start = new Date(product.sale_effective_period.start).getTime();
  const end = new Date(product.sale_effective_period.end).getTime();
  return now >= start && now <= end;
}

export function isNew(product) {
  const days = 10;
  const created = new Date(product.createdAt).getTime();
  return Date.now() - created < days * 24 * 60 * 60 * 1000;
}

export function obfuscateEmail(email) {
  const [user, domain] = email.split("@");

  if (user.length <= 4) {
    return user[0] + "*".repeat(user.length - 1) + "@" + domain;
  }

  const first = user.slice(0, 2);
  const last = user.slice(-2);
  const hidden = "*".repeat(user.length - 4);

  return `${first}${hidden}${last}@${domain}`;
}
