const { Op } = require('sequelize')

const queryParams = (query) => {
  const where = processFilter(query)
  const order = processOrder(query)

  const environment = processEnvironment(query)
  if (environment.value !== undefined) {
    where.environment = environment.value
  }
    
  const output = {
    where,
    order,
    error: environment.error,
    errors: environment.errors,
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
            output[field] = { operator: value }
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

const processOrder = query => {
  let output = []

  const { order } = query
  if (order !== undefined) {
    output = order.split(',')
  }

  return output  
}

module.exports = queryParams