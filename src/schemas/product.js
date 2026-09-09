const { z } = require("zod");

const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).optional().default(""),
  price: z.number().finite().min(0),
  stockQuantity: z.number().int().min(0),
  category: z.string().trim().min(1).max(100)
});

const productUpdateSchema = productCreateSchema.partial();

module.exports = { productCreateSchema, productUpdateSchema };