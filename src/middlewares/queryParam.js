const { Op } = require('sequelize')

module.exports = {
  async validate(req, res, next) {
    const order = processOrder(req.query)
    const environment = processEnvironment(req.query)
    const filters = processFilter(req.query)

    if (environment.error) {
      res.status(400).json({ errors: environment.errors })
      return
    }

    const where = {}

    if (environment.value !== undefined) {
      where.environment = environment.value
    }

    for (const filter in filters) {
      where[filter] = filters[filter]
    }

    req.where = where
    req.order = order

    next()
  }
}

const processOrder = query => {
  let output = []

  const { order } = query
  if (order !== undefined) {
      output = order.split(',')
  }

  return output  
}  

const processEnvironment = query => {
  const output = {
    error: false,
    errors: [],
    value: undefined,
  }
  
  const { environment } = query
  if (environment !== undefined) {
    const environments = ['prod', 'homolog', 'dev']

    const values = environment.split(',')

    values.forEach(env => {
      if (!environments.includes(env)) {
        output.errors.push(`Value '${env}' is invalid for 'environment' parameter, the valid values are [${environments}]`)
        output.error = true
      }
    })  

    if (!output.error) {
      output.value = { [Op.in]: values }
    }
  }

  return output
}

const processFilter = query => {
  const output = {}
  
  const { filter } = query  
  if (filter !== undefined) {    
    const filters = filter.split(';')

    console.log('filter', filters)

    const operators = {
      '>=': Op.gte,
      '>': Op.gt,
      '<=': Op.lte,
      '<': Op.lt,
      '=': Op.eq,
    }

    filters.forEach(item => {
      for (const oper in operators) {
        if (item.includes(oper)) {
          const values = item.split(oper)
          const field = values[0]
          const value = values[1]

          if (oper === '=') {
            output[field] = processEqualOperator(value)
          } else {                      
            const operator = operators[oper]
            output[field] = { [operator]: value }
          }
          break
        }
      }
    })
  }
  return output
}
  
const processEqualOperator = (value) => {
  if (value.includes('*')) {
      value = value.replace(/\*/g, '%')
      return { [Op.like]: value }
  }

  if (value.includes(',')) {
      value = value.split(',')
      return { [Op.in]: value }
  }

  return { [Op.eq]: value }
}
