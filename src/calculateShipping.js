const Correios = require('node-correios')


module.exports = async function calculateShipping({
    zipCodeOrigin,
    zipCodeDestination,
    weight
}) {
    const correios = new Correios()

    function* createGenerator (list) {
        yield* list
    }

    /**

    '40290'  //SEDEX Hoje Varejo
   
   */
    const shippingMethods = [
        // '04782', // SEDEX12 ( à vista)
        // '04790', // SEDEX 10 (à vista)
        '04014', // SEDEX à vista
        '04510', // PAC à vista
    ]

    const shippingTypes = {
        '4782': 'SEDEX 12',
        '4790': 'SEDEX 10',
        '4014': 'SEDEX',
        '4510': 'PAC'
    }


  const shippingMethodsGenerator = createGenerator(shippingMethods)

  async function recursivelyExecute(shippingMethod, isDone, previousValue) {
    if (isDone) return previousValue

    let args = {
      sCepOrigem: zipCodeOrigin,
      sCepDestino: zipCodeDestination,
      nVlPeso: weight, // peso
      nCdFormato: "3", // caixa/pacote ou "3", //  envelope
      nVlComprimento: "20",
      nVlAltura: "20",
      nVlLargura: "20",
      nCdServico: shippingMethod,
      nVlDiametro: "0",
    };

    try {
      const response = await correios.calcPrecoPrazo(args)

      const { value, done } = shippingMethodsGenerator.next()

      return recursivelyExecute(value, done, [...response, ...previousValue])
    } catch (error) {
      const { value, done } = shippingMethodsGenerator.next()

      return recursivelyExecute(value, done, [...previousValue])
    }
  }

  const { value, done } = shippingMethodsGenerator.next()
  
  const response = await recursivelyExecute(value, done, [])

  const parsedResponse = response
    .filter(({ MsgErro }) => MsgErro === '' )
    .map((item) => {
      return {
        price: item.Valor.split(',').join('.'),
        error: item.MsgErro,
        shipping_period: item.PrazoEntrega,
        shipping_type: item.Codigo,
        shipping_name: shippingTypes[item.Codigo],
      }
    })

    console.log(parsedResponse)

    return {
      data: parsedResponse,
      zipCodeOrigin
    }
}