import { Product } from '../types';

/**
 * Calculates the dynamic available stock of a product.
 * If it's a standard product, returns product.stock.
 * If it's a combo, calculates the bottleneck based on component stock: Math.min(component.stock / quantity).
 */
export const getEffectiveStock = (product: Product, allProducts: Product[]): number => {
  if (product.type === 'combo' && product.comboItems && product.comboItems.length > 0) {
    let minPossible = Infinity;
    for (const item of product.comboItems) {
      const comp = allProducts.find((p) => p.id === item.productId);
      if (!comp || item.quantity <= 0) return 0;
      const possible = Math.floor(comp.stock / item.quantity);
      if (possible < minPossible) {
        minPossible = possible;
      }
    }
    return minPossible === Infinity ? 0 : Math.max(0, minPossible);
  }
  return product.stock;
};

/**
 * Calculates pricing details for a combo:
 * - Regular sum of individual items
 * - Cost of purchase sum
 * - Net customer savings
 * - Full component item details
 */
export const getComboDetails = (product: Product, allProducts: Product[]) => {
  if (product.type !== 'combo' || !product.comboItems || product.comboItems.length === 0) {
    return {
      regularTotal: product.salePrice,
      costTotal: product.purchasePrice,
      savings: 0,
      components: [],
      hasStock: product.stock > 0,
    };
  }

  let regularTotal = 0;
  let costTotal = 0;
  const components: {
    product: Product;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    stock: number;
  }[] = [];

  product.comboItems.forEach((ci) => {
    const comp = allProducts.find((p) => p.id === ci.productId);
    if (comp) {
      const sub = comp.salePrice * ci.quantity;
      regularTotal += sub;
      costTotal += comp.purchasePrice * ci.quantity;
      components.push({
        product: comp,
        quantity: ci.quantity,
        unitPrice: comp.salePrice,
        subtotal: sub,
        stock: comp.stock,
      });
    }
  });

  const savings = Math.max(0, regularTotal - product.salePrice);
  const effectiveStock = getEffectiveStock(product, allProducts);

  return {
    regularTotal,
    costTotal,
    savings,
    components,
    hasStock: effectiveStock > 0,
    effectiveStock,
  };
};
