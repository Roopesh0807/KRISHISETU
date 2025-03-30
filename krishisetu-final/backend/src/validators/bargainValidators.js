const { body, param } = require('express-validator');

const initiateBargainValidator = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0')
];

const submitOfferValidator = [
  body('offerPrice').isFloat({ gt: 0 }).withMessage('Offer price must be greater than 0')
];

const sessionIdValidator = [
  param('sessionId').notEmpty().withMessage('Session ID is required')
];

const respondToBargainValidator = [
  body('accept').isBoolean().withMessage('Accept must be a boolean value')
];

module.exports = {
  initiateBargainValidator,
  submitOfferValidator,
  sessionIdValidator,
  respondToBargainValidator
};