import { clsx } from "clsx";
import _ from "lodash";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function encrypt(number) {
  // Convert to string and pad with random chars
  const text = number.toString();
  const buffer = Buffer.from(text, "utf-8");
  return buffer.toString("base64");
}

export function decrypt(encryptedString) {
  // Decode Base64 and convert back to number
  const buffer = Buffer.from(encryptedString, "base64");
  const text = buffer.toString("utf-8");
  return parseInt(text);
}

export function slug(value) {
  return _.kebabCase(value || "");
}

export function clean(text) {
  return text
    .replaceAll("Close today", "")
    .replaceAll("Close soon", "")
    .replace(/[\t\n•]+/g, "")
    .trim();
}
export function cleanDate(date) {
  return new Date(date).toLocaleString();
}

export function parseCustomDate(dateString) {
  const months = {
    Jan: 0,
    Fév: 1,
    Mar: 2,
    Avr: 3,
    Mai: 4,
    Juin: 5,
    Juil: 6,
    Août: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Déc: 11,
  };

  const [day, month, year] = dateString.split(" ");
  return new Date(2000 + parseInt(year), months[month], parseInt(day))
    .toISOString()
    .split("T")[0];
}
