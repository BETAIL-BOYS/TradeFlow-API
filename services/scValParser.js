/**
 * services/scValParser.js
 * 
 * Utility to decode Soroban XDR ScVal types into native JavaScript objects/JSON.
 */

const { scValToNative } = require('@stellar/stellar-sdk');

/**
 * Decodes a Soroban ScVal into its native JavaScript representation.
 * Handles BigInt conversions to standard strings for JSON compatibility.
 * 
 * @param {xdr.ScVal} scVal - The Soroban value to decode.
 * @returns {any} - The native JavaScript value.
 */
function parseScVal(scVal) {
  try {
    const native = scValToNative(scVal);
    return stringifyBigInts(native);
  } catch (error) {
    console.error('Error decoding Soroban XDR:', error.message);
    return null;
  }
}

/**
 * Recursively converts BigInt values to strings in an object/array.
 * This is useful for Prisma and JSON serialization.
 * 
 * @param {any} obj - The object to process.
 * @returns {any} - The object with BigInts converted to strings.
 */
function stringifyBigInts(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(stringifyBigInts);
  }
  
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = stringifyBigInts(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
}

module.exports = {
  parseScVal,
  stringifyBigInts
};
