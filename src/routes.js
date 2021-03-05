const express = require('express')

const Correios = require('node-correios')
const { rastrearEncomendas } = require('correios-brasil')

const calculateShipping = require('./calculateShipping')

const routes = express.Router()

routes.get('/tracking', (req, res) => {

})


routes.get('/shipping', async (req, res) => {
  const correios = new Correios()

  const { zipcode_origin, zipcode_destination, weight } = req.query

  const zipCodesOrigin = zipcode_origin.split(',');

  try {
    const calculatedShippingResponse = zipCodesOrigin.map(
      async (zipCode) => {
        return calculateShipping({ zipCodeOrigin: zipCode, zipCodeDestination: zipcode_destination, weight });
      }
    )

    const response = await Promise.all(calculatedShippingResponse)

    console.log({response})

    return res.json(response)

  } catch (error) {
    console.log(error)
  }
})

module.exports = routes