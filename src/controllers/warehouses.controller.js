const warehousesService = require('../services/warehouses.service');

async function getWarehouses(req, res, next) {
  try {
    const warehouses = await warehousesService.getAllWarehouses();
    res.json({ success: true, data: warehouses });
  } catch (err) {
    next(err);
  }
}

async function getSalesByWarehouse(req, res, next) {
  try {
    const { yearMonth, companyId } = req.query;
    const sales = await warehousesService.getSalesByWarehouse(
      yearMonth ? parseInt(yearMonth) : null,
      companyId ? parseInt(companyId) : 1
    );
    res.json({ success: true, data: sales });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWarehouses, getSalesByWarehouse };

