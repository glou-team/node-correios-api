const express = require('express')

const calculateShipping = require('./calculateShipping')

const routes = express.Router()

routes.get('/shipping', async (req, res) => {
  try {
    const { zipcode_origin, zipcode_destination, weight } = req.query
  
    const zipCodesOrigin = zipcode_origin.split(',');

    /**
     * Zipcode validation
     */
    zipCodesOrigin.forEach(zipCode => {
      if (typeof zipCode !== 'string') throw new Error('CEP não é string')

      if (!zipCode.match(/^[0-9]{8}$/)) throw new Error('CEP inválido')
    })

    const calculatedShippingResponse = zipCodesOrigin.map((zipCode) => {
      return calculateShipping({ zipCodeOrigin: zipCode, zipCodeDestination: zipcode_destination, weight });
    })

    const response = await Promise.all(calculatedShippingResponse)

    return res.json(response)
  } catch (error) {
    console.log(error.message)

    return res.json([])
  }
})

module.exports = routes