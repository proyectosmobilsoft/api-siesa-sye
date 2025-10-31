const productsService = require('../services/products.service');

async function getProducts(req, res, next) {
  try {
    const products = await productsService.getAllProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

async function getSalesByProduct(req, res, next) {
  try {
    const { yearMonth, companyId } = req.query;
    const sales = await productsService.getSalesByProduct(
      yearMonth ? parseInt(yearMonth) : null,
      companyId ? parseInt(companyId) : 1
    );
    res.json({ success: true, data: sales });
  } catch (err) {
    next(err);
  }
}

async function getTop10BestSellingProducts(req, res, next) {
  try {
    const { yearMonth, companyId } = req.query;
    const products = await productsService.getTop10BestSellingProducts(
      yearMonth ? parseInt(yearMonth) : null,
      companyId ? parseInt(companyId) : 1
    );
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

async function getTop10LeastSellingProducts(req, res, next) {
  try {
    const { yearMonth, companyId } = req.query;
    const products = await productsService.getTop10LeastSellingProducts(
      yearMonth ? parseInt(yearMonth) : null,
      companyId ? parseInt(companyId) : 1
    );
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts, getSalesByProduct, getTop10BestSellingProducts, getTop10LeastSellingProducts };
