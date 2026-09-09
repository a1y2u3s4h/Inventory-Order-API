const { z } = require("zod");

const orderSchema = z.object({
  products: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1)
    })
  ).min(1)
});

module.exports = { orderSchema };