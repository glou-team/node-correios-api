const { calcularPrecoPrazo } = require('correios-brasil')

module.exports = async function calculateShipping({
    zipCodeOrigin,
    zipCodeDestination,
    weight
}) {
  /**
  '40290'  //SEDEX Hoje Varejo
  '04782', // SEDEX12 (à vista)
  '04790', // SEDEX 10 (à vista)
  */
  const shippingMethods = [
    '04014', // SEDEX à vista
    '04510', // PAC à vista
  ]

  const shippingTypes = {
    '04782': 'SEDEX 12',
    '04790': 'SEDEX 10',
    '04014': 'SEDEX',
    '04510': 'PAC'
  }

  /**
   * Box formats
   * 1 = Formato caixa/pacote
   * 2 = Formato rolo/prisma
   * 3 = Envelope
   */

  try {
    const shippingPromises = shippingMethods.map(async shippingMethod => {
      const args = {
        sCepOrigem: zipCodeOrigin,
        sCepDestino: zipCodeDestination,
        nVlPeso: weight, // Kg
        nCdFormato: "1",
        nVlComprimento: "20",
        nVlAltura: "20",
        nVlLargura: "20",
        nCdServico: shippingMethod,
        nVlDiametro: "0",
      };
  
      return await calcularPrecoPrazo(args)
    })
  
    const response = await Promise.all(shippingPromises)
  
    const parsedResponse = response
      .filter(({ MsgErro }) => !MsgErro)
      .map((item) => {
        return {
          price: item.Valor.split(',').join('.'),
          error: item.MsgErro,
          shipping_period: item.PrazoEntrega,
          shipping_type: item.Codigo,
          shipping_name: shippingTypes[item.Codigo],
        }
      })
  
    return {
      data: parsedResponse,
      zipCodeOrigin
    }
  } catch (err) {
    console.log(err.message)

    return {
      data: [],
      zipCodeOrigin
    }
  }
}