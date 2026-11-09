export function utf8ByteLength(value) {
  return encodeURIComponent(value).replace(/%[A-F\d]{2}/gi, "U").length;
}
