const reportsService = require('../services/reports.service');

async function getDailyOrders(req, res, next) {
  try {
    const orders = await reportsService.getDailyOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

async function getSalesSummary(req, res, next) {
  try {
    const sales = await reportsService.getSalesSummary();
    res.json({ success: true, data: sales });
  } catch (err) {
    next(err);
  }
}

async function getVendors(req, res, next) {
  try {
    const vendors = await reportsService.getVendors();
    res.json({ success: true, data: vendors });
  } catch (err) {
    next(err);
  }
}

async function getMonthlySalesTrend(req, res, next) {
  try {
    const { companyId } = req.query;
    const trend = await reportsService.getMonthlySalesTrend(
      companyId ? parseInt(companyId) : 1
    );
    res.json({ success: true, data: trend });
  } catch (err) {
    next(err);
  }
}

async function getYearOverYearComparison(req, res, next) {
  try {
    const { companyId } = req.query;
    const comparison = await reportsService.getYearOverYearComparison(
      companyId ? parseInt(companyId) : 1
    );
    res.json({ success: true, data: comparison });
  } catch (err) {
    next(err);
  }
}

async function getMonthOverMonthComparison(req, res, next) {
  try {
    const { companyId } = req.query;
    const comparison = await reportsService.getMonthOverMonthComparison(
      companyId ? parseInt(companyId) : 1
    );
    res.json({ success: true, data: comparison });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDailyOrders, getSalesSummary, getVendors, getMonthlySalesTrend, getYearOverYearComparison, getMonthOverMonthComparison };
