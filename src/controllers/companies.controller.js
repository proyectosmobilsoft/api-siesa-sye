const companiesService = require('../services/companies.service');

async function getCompanies(req, res, next) {
  try {
    const companies = await companiesService.getAllCompanies();
    res.json({ success: true, data: companies });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCompanies };
