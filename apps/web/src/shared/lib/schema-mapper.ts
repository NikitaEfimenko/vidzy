import { z } from "zod"

export type Mapping = {
  id: string
  source: string
  target: string
}

/**
 * Transforms data from source schema to target schema using provided mappings
 * 
 * @param sourceData The data that conforms to the source schema
 * @param sourceSchema The Zod schema for the source data
 * @param targetSchema The Zod schema for the target data
 * @param mappings Array of mappings between source and target fields
 * @returns The transformed data that conforms to the target schema
 * @throws Error if validation fails or transformation cannot be completed
 */
export function transformData<
  TSource extends z.ZodTypeAny,
  TTarget extends z.ZodTypeAny & { partial?: () => TTarget }
>(
  sourceData: unknown,
  sourceSchema: TSource,
  targetSchema: TTarget,
  mappings: Mapping[]
): z.infer<TTarget> {
  try {
    // Step 1: Validate source data against source schema
    const validatedSourceData = sourceSchema.parse(sourceData)
    
    // Step 2: Create the target object based on mappings
    const targetData = createTargetObject(validatedSourceData, mappings, targetSchema)
    
    // Step 3: Validate the target object against the target schema
    const partialTargetSchema = targetSchema?.partial?.() ?? targetSchema;
    const validatedTargetData = partialTargetSchema.parse(targetData);
    // const validatedTargetData = targetSchema.parse(targetData)
    
    return validatedTargetData
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Enhance Zod error with context
      const isSourceValidation = error.errors.some(err => 
        err.path.join('.').startsWith('source'))
      
      throw new Error(
        `${isSourceValidation ? 'Source' : 'Target'} schema validation failed: ${error.message}`
      )
    }
    
    // Re-throw other errors
    throw error
  }
}

/**
 * Creates a target object by applying mappings to the source data
 */
function createTargetObject(
  sourceData: any, 
  mappings: Mapping[], 
  targetSchema: z.ZodTypeAny
): Record<string, any> {
  const result: Record<string, any> = {}
  
  // Ensure each target field has only one source mapping
  const uniqueTargetMappings = mappings.reduce((acc, mapping) => {
    // If there are duplicate target mappings, the last one wins
    acc.set(mapping.target, mapping)
    return acc
  }, new Map<string, Mapping>())
  
  // Apply mappings
  Array.from(uniqueTargetMappings.values()).forEach((mapping) => {
    try {
      // Get the value from source using the path
      const sourceValue = getNestedValue(sourceData, mapping.source);

      // Get expected type for the target field
      const targetType = getTargetFieldType(targetSchema, mapping.target);

      // Apply automatic type conversion if needed
      const convertedValue = convertValueToTargetType(sourceValue, targetType);

      // Set the value in the target using the path
      setNestedValue(result, mapping.target, convertedValue);
    } catch (error) {
      throw new Error(
        `Error mapping field ${mapping.source} to ${mapping.target}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  });
  return result
}

/**
 * Gets the expected type for a target field from the schema
 */
function getTargetFieldType(schema: z.ZodTypeAny, path: string): string {
  try {
    const parts = path.split('.')
    let current = schema
    
    for (const part of parts) {
      // Handle array notation (e.g., items[0])
      const cleanPart = part.replace(/\[\d+\]$/, '')
      
      if (current._def.shape) {
        current = current._def.shape()[cleanPart]
      } else if (current._def.type && current._def.type._def.shape) {
        // Handle array element type
        current = current._def.type._def.shape()[cleanPart]
      } else {
        return 'unknown'
      }
    }
    
    // Determine the type from the Zod definition
    if (current instanceof z.ZodString) return 'string'
    if (current instanceof z.ZodNumber) return 'number'
    if (current instanceof z.ZodBoolean) return 'boolean'
    if (current instanceof z.ZodDate) return 'date'
    if (current instanceof z.ZodArray) return 'array'
    
    return 'unknown'
  } catch (error) {
    // If we can't determine the type, return unknown
    return 'unknown'
  }
}

/**
 * Converts a value to the expected target type
 */
function convertValueToTargetType(value: any, targetType: string): any {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value
  }
  
  try {
    switch (targetType) {
      case 'string':
        // Convert any value to string
        return String(value)
        
      case 'number':
        // Convert string to number if possible
        if (typeof value === 'string') {
          const num = Number(value)
          if (!isNaN(num)) return num
          throw new Error(`Cannot convert string "${value}" to number`)
        }
        // Pass through if already a number
        if (typeof value === 'number') return value
        throw new Error(`Cannot convert ${typeof value} to number`)
        
      case 'boolean':
        // Convert to boolean
        if (typeof value === 'string') {
          if (value.toLowerCase() === 'true') return true
          if (value.toLowerCase() === 'false') return false
          throw new Error(`Cannot convert string "${value}" to boolean`)
        }
        // Convert numbers to boolean
        if (typeof value === 'number') {
          return value !== 0
        }
        // Pass through if already boolean
        if (typeof value === 'boolean') return value
        throw new Error(`Cannot convert ${typeof value} to boolean`)
        
      case 'date':
        // Convert string to date
        if (typeof value === 'string') {
          const date = new Date(value)
          if (!isNaN(date.getTime())) return date
          throw new Error(`Cannot convert string "${value}" to date`)
        }
        // Convert number (timestamp) to date
        if (typeof value === 'number') {
          return new Date(value)
        }
        // Pass through if already a date
        if (value instanceof Date) return value
        throw new Error(`Cannot convert ${typeof value} to date`)
        
      case 'array':
        // Convert to array if not already
        if (!Array.isArray(value)) {
          return [value]
        }
        return value
        
      default:
        // For unknown types, pass through the value
        return value
    }
  } catch (error) {
    // If conversion fails, return the original value and let Zod handle validation
    console.warn(`Type conversion failed: ${error instanceof Error ? error.message : String(error)}`)
    return value
  }
}

/**
 * Gets a nested value from an object using a dot-notation path
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current === undefined || current === null) {
      return undefined
    }
    
    // Handle array access with index
    if (key.includes('[') && key.includes(']')) {
      const [arrayName, indexStr] = key.split('[')
      const index = parseInt(indexStr.replace(']', ''))
      
      if (!Array.isArray(current[arrayName]) || isNaN(index)) {
        throw new Error(`Invalid array access: ${key}`)
      }
      
      current = current[arrayName][index]
    } else {
      current = current[key]
    }
  }
  
  return current
}

/**
 * Sets a nested value in an object using a dot-notation path
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  
  if (!lastKey) {
    throw new Error(`Invalid path: ${path}`)
  }
  
  let current = obj
  
  // Create nested objects if they don't exist
  for (const key of keys) {
    // Handle array access with index
    if (key.includes('[') && key.includes(']')) {
      const [arrayName, indexStr] = key.split('[')
      const index = parseInt(indexStr.replace(']', ''))
      
      if (isNaN(index)) {
        throw new Error(`Invalid array index: ${key}`)
      }
      
      if (!current[arrayName]) {
        current[arrayName] = []
      }
      
      if (!Array.isArray(current[arrayName])) {
        throw new Error(`Expected array at ${arrayName}`)
      }
      
      // Ensure array has enough elements
      while (current[arrayName].length <= index) {
        current[arrayName].push({})
      }
      
      current = current[arrayName][index]
    } else {
      if (!current[key]) {
        // Check if the next key is an array access
        const nextKey = keys[keys.indexOf(key) + 1]
        if (nextKey && nextKey.includes('[') && nextKey.includes(']')) {
          current[key] = []
        } else {
          current[key] = {}
        }
      }
      current = current[key]
    }
  }
  
  // Handle array in the last key
  if (lastKey.includes('[') && lastKey.includes(']')) {
    const [arrayName, indexStr] = lastKey.split('[')
    const index = parseInt(indexStr.replace(']', ''))
    
    if (isNaN(index)) {
      throw new Error(`Invalid array index: ${lastKey}`)
    }
    
    if (!current[arrayName]) {
      current[arrayName] = []
    }
    
    if (!Array.isArray(current[arrayName])) {
      throw new Error(`Expected array at ${arrayName}`)
    }
    
    // Ensure array has enough elements
    while (current[arrayName].length <= index) {
      current[arrayName].push(undefined)
    }
    
    current[arrayName][index] = value
  } else {
    // Handle array value being set to an array field
    if (lastKey.endsWith('[]')) {
      const actualKey = lastKey.slice(0, -2)
      
      // If the target is an array and the value is not, wrap it
      if (!Array.isArray(value)) {
        current[actualKey] = [value]
      } else {
        current[actualKey] = value
      }
    } else {
      // Regular field assignment
      current[lastKey] = value
    }
  }
}

/**
 * Type conversion utilities for common transformations
 */
export const TypeConverters = {
  toString: (value: any): string => String(value),
  toNumber: (value: any): number => Number(value),
  toBoolean: (value: any): boolean => Boolean(value),
  toDate: (value: any): Date => new Date(value),
  toArray: (value: any): any[] => Array.isArray(value) ? value : [value],
  toFirstElement: (value: any): any => Array.isArray(value) ? value[0] : value,
}
