const productsService = require('../services/products.service');

async function getProducts(req, res, next) {
  try {
    const products = await productsService.getAllProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts };
