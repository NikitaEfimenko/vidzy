"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"
import { Trash2, GripVertical, Plus, Code } from "lucide-react"
import { Badge } from "@/shared/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion"
import { DnDWrapper } from "@/shared/ui/dnd/wrapper"
import { DnDItem } from "@/shared/ui/dnd/item"
import { Textarea } from "@/shared/ui/textarea"
import { Checkbox } from "@/shared/ui/checkbox"
import { z } from "zod"

// Field types
type FieldType = "string" | "number" | "boolean" | "date" | "object" | "array" | "enum" | "custom"

type FieldValidators = {
  min?: number
  max?: number
  int?: boolean
  url?: boolean
  email?: boolean
}

// Field configuration
interface FieldConfig {
  id: string
  name: string
  type: FieldType
  required: boolean
  description?: string
  valueDescription?: string
  children?: FieldConfig[]
  arrayType?: FieldConfig
  validators?: FieldValidators
  enumValues?: string[]
  customType?: string
}

interface CustomZodType {
  name: string
  generateSchema: () => z.ZodTypeAny
}

// Field item component
const FieldItem = ({
  field,
  removeField,
  updateField,
  addField,
  moveField,
  customTypes,
  path = [],
}: {
  field: FieldConfig
  removeField: (id: string, path: string[]) => void
  updateField: (id: string, field: FieldConfig, path: string[]) => void
  addField: (type: FieldType, path: string[], isArrayItem?: boolean) => void
  moveField: (sourceId: string, targetId: string, path: string[]) => void
  customTypes: CustomZodType[]
  path?: string[]
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField(field.id, { ...field, name: e.target.value }, path)
  }

  const handleTypeChange = (value: string) => {
    const newType = value as FieldType
    const updatedField: FieldConfig = {
      ...field,
      type: newType,
      validators:
        newType === "number"
          ? { min: undefined, max: undefined, int: false }
          : newType === "string"
            ? { url: false, email: false }
            : undefined,
      enumValues: newType === "enum" ? ["option1", "option2"] : undefined,
      customType: newType === "custom" ? customTypes[0]?.name : undefined,
    }

    // Reset children when changing type
    if (newType === "object") {
      updatedField.children = []
    } else if (newType === "array") {
      updatedField.arrayType = {
        id: crypto.randomUUID(),
        name: "item",
        type: "string",
        required: true,
      }
    } else {
      delete updatedField.children
      delete updatedField.arrayType
    }

    updateField(field.id, updatedField, path)
  }

  const handleRequiredChange = (checked: boolean) => {
    updateField(field.id, { ...field, required: checked }, path)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField(field.id, { ...field, description: e.target.value }, path)
  }

  const handleValueDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField(field.id, { ...field, valueDescription: e.target.value }, path)
  }

  const handleValidatorChange = (
    validatorName: keyof FieldValidators,
    value: number | boolean | string | undefined
  ) => {
    const updatedValidators: FieldValidators = {
      ...(field.validators || {
        min: undefined,
        max: undefined,
        int: undefined,
        url: undefined,
        email: undefined
      })
    }

    if (typeof value === "boolean") {
      updatedValidators[validatorName] = value as any
    } else if (value === "" || value === undefined) {
      updatedValidators[validatorName] = undefined
    } else if (!isNaN(Number(value))) {
      updatedValidators[validatorName] = Number(value) as any
    }

    updateField(field.id, { ...field, validators: updatedValidators }, path)
  }

  const handleEnumValuesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const values = e.target.value
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v)
    updateField(field.id, { ...field, enumValues: values }, path)
  }

  const handleCustomTypeChange = (value: string) => {
    updateField(field.id, { ...field, customType: value }, path)
  }

  return (
    <DnDItem
      index={field.id}
      onMove={(sourceId, targetId) => moveField(sourceId, targetId, path)}
      renderItem={(dragRef) => (
        <Card className="mb-4">
          <CardHeader className="p-4 pb-2 flex flex-row items-center gap-2">
            <div ref={dragRef} className="cursor-move">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-base flex-1 flex items-center gap-2">
              {field.name || "Unnamed Field"}
              <Badge variant="outline" className="font-normal">
                {field.type}
              </Badge>
              {field.required && (
                <Badge variant="secondary" className="font-normal">
                  Required
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => removeField(field.id, path)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`field-${field.id}-name`}>Field Name</Label>
                  <Input
                    id={`field-${field.id}-name`}
                    value={field.name}
                    onChange={handleNameChange}
                    placeholder="Enter field name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`field-${field.id}-type`}>Field Type</Label>
                  <Select value={field.type} onValueChange={handleTypeChange}>
                    <SelectTrigger id={`field-${field.id}-type`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                      <SelectItem value="array">Array</SelectItem>
                      <SelectItem value="enum">Enum</SelectItem>
                      {customTypes.length > 0 && <SelectItem value="custom">Custom Type</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`field-${field.id}-description`}>Description</Label>
                  <Input
                    id={`field-${field.id}-description`}
                    value={field.description || ""}
                    onChange={handleDescriptionChange}
                    placeholder="Field description"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id={`field-${field.id}-required`}
                    checked={field.required}
                    onCheckedChange={handleRequiredChange}
                  />
                  <Label htmlFor={`field-${field.id}-required`}>Required</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`field-${field.id}-value-description`}>Value Description</Label>
                <Input
                  id={`field-${field.id}-value-description`}
                  value={field.valueDescription || ""}
                  onChange={handleValueDescriptionChange}
                  placeholder="Description of what this value represents"
                />
              </div>

              {/* Validators for number type */}
              {field.type === "number" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`field-${field.id}-min`}>Min Value</Label>
                    <Input
                      id={`field-${field.id}-min`}
                      type="number"
                      value={field.validators?.min ?? ""}
                      onChange={(e) => handleValidatorChange("min", e.target.value)}
                      placeholder="Minimum value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`field-${field.id}-max`}>Max Value</Label>
                    <Input
                      id={`field-${field.id}-max`}
                      type="number"
                      value={field.validators?.max ?? ""}
                      onChange={(e) => handleValidatorChange("max", e.target.value)}
                      placeholder="Maximum value"
                    />
                  </div>
                  <div className="flex items-center space-x-2 col-span-2">
                    <Checkbox
                      id={`field-${field.id}-int`}
                      checked={field.validators?.int || false}
                      onCheckedChange={(checked) => handleValidatorChange("int", checked === true)}
                    />
                    <Label htmlFor={`field-${field.id}-int`}>Integer</Label>
                  </div>
                </div>
              )}

              {/* Validators for string type */}
              {field.type === "string" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.id}-url`}
                      checked={field.validators?.url || false}
                      onCheckedChange={(checked) => handleValidatorChange("url", checked === true)}
                    />
                    <Label htmlFor={`field-${field.id}-url`}>URL</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.id}-email`}
                      checked={field.validators?.email || false}
                      onCheckedChange={(checked) => handleValidatorChange("email", checked === true)}
                    />
                    <Label htmlFor={`field-${field.id}-email`}>Email</Label>
                  </div>
                </div>
              )}

              {/* Enum values */}
              {field.type === "enum" && (
                <div className="space-y-2">
                  <Label htmlFor={`field-${field.id}-enum-values`}>Enum Values (one per line)</Label>
                  <Textarea
                    id={`field-${field.id}-enum-values`}
                    value={(field.enumValues || []).join("\n")}
                    onChange={handleEnumValuesChange}
                    placeholder="Enter enum values (one per line)"
                    rows={4}
                  />
                </div>
              )}

              {/* Custom type selector */}
              {field.type === "custom" && customTypes.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor={`field-${field.id}-custom-type`}>Custom Type</Label>
                  <Select value={field.customType || customTypes[0].name} onValueChange={handleCustomTypeChange}>
                    <SelectTrigger id={`field-${field.id}-custom-type`}>
                      <SelectValue placeholder="Select custom type" />
                    </SelectTrigger>
                    <SelectContent>
                      {customTypes.map((type) => (
                        <SelectItem key={type.name} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {field.type === "object" && field.children && (
                <div className="mt-2">
                  <Accordion type="single" collapsible defaultValue="nested-fields">
                    <AccordionItem value="nested-fields">
                      <AccordionTrigger>Nested Fields</AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-4 border-l-2 border-muted mt-2">
                          {field.children.map((childField) => (
                            <FieldItem
                              key={childField.id}
                              field={childField}
                              moveField={moveField}
                              removeField={removeField}
                              updateField={updateField}
                              addField={addField}
                              customTypes={customTypes}
                              path={[...path, field.id]}
                            />
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => addField("string", [...path, field.id])}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {field.type === "array" && field.arrayType && (
                <div className="mt-2">
                  <Accordion type="single" collapsible defaultValue="array-type">
                    <AccordionItem value="array-type">
                      <AccordionTrigger>Array Item Type</AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-4 border-l-2 border-muted mt-2">
                          <FieldItem
                            field={field.arrayType}
                            moveField={() => { }}
                            removeField={() => { }}
                            updateField={(_, updatedField) => {
                              updateField(field.id, { ...field, arrayType: updatedField }, path)
                            }}
                            addField={(type, _, isArrayItem) => {
                              if (isArrayItem && field.arrayType?.type === "object" && field.arrayType.children) {
                                const updatedArrayType = {
                                  ...field.arrayType,
                                  children: [
                                    ...field.arrayType.children,
                                    {
                                      id: crypto.randomUUID(),
                                      name: "newField",
                                      type,
                                      required: true,
                                    },
                                  ],
                                }
                                updateField(field.id, { ...field, arrayType: updatedArrayType }, path)
                              }
                            }}
                            customTypes={customTypes}
                            path={[...path, field.id, "arrayType"]}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    />
  )
}

// Default custom types
const defaultCustomTypes: CustomZodType[] = [
  {
    name: "zColor",
    generateSchema: () => z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
  },
]

interface ZodFormBuilderProps {
  inputSchema?: z.ZodObject<any>
  customTypes?: CustomZodType[]
  onSchemaDone?: (schema: z.ZodObject<any>) => void
  onSchemaDescriptionDone?: (schemaDescription: any) => void
}

// Form builder component
export function ZodFormBuilder({
  inputSchema,
  customTypes = defaultCustomTypes,
  onSchemaDone,
  onSchemaDescriptionDone,
}: ZodFormBuilderProps) {
  const [fields, setFields] = useState<FieldConfig[]>([])

  // Initialize from schema if provided
  useEffect(() => {
    if (inputSchema) {
      try {
        parseSchemaToFields(inputSchema)
      } catch (error) {
        console.error("Failed to parse input schema:", error)
      }
    }
  }, [inputSchema])

  // Generate schema whenever fields change
  useEffect(() => {
    if (fields.length > 0) {
      const schema = generateZodSchema()
      if (onSchemaDone) {
        onSchemaDone(schema)
      }

      if (onSchemaDescriptionDone) {
        const schemaDescription = generateSchemaDescription(fields)
        onSchemaDescriptionDone(schemaDescription)
      }
    }
  }, [fields])

  // Parse Zod schema to fields
  const parseSchemaToFields = (schema: z.ZodObject<any>) => {
    const parsedFields: FieldConfig[] = []

    const shape = schema.shape
    for (const [name, fieldSchema] of Object.entries(shape)) {
      const field = parseZodType(name, fieldSchema as z.ZodTypeAny)
      if (field) {
        parsedFields.push(field)
      }
    }

    setFields(parsedFields)
  }

  // Helper to parse a Zod type to FieldConfig
  const parseZodType = (name: string, zodType: z.ZodTypeAny): FieldConfig | null => {
    let type: FieldType = "string"
    const required = !zodType.isOptional()
    const validators: FieldValidators = {}
    let enumValues: string[] | undefined
    let children: FieldConfig[] | undefined
    let arrayType: FieldConfig | undefined
    let customType: string | undefined

    // Unwrap optional/nullable types
    let innerType = zodType
    if (innerType instanceof z.ZodOptional || innerType instanceof z.ZodNullable) {
      innerType = innerType._def.innerType
    }

    if (innerType instanceof z.ZodString) {
      type = "string"
      if (innerType._def.checks) {
        for (const check of innerType._def.checks) {
          if (check.kind === "email") validators.email = true
          if (check.kind === "url") validators.url = true
        }
      }
    }
    else if (innerType instanceof z.ZodNumber) {
      type = "number"
      if (innerType._def.checks) {
        for (const check of innerType._def.checks) {
          if (check.kind === "int") validators.int = true
          if (check.kind === "min") validators.min = check.value
          if (check.kind === "max") validators.max = check.value
        }
      }
    }
    else if (innerType instanceof z.ZodBoolean) {
      type = "boolean"
    }
    else if (innerType instanceof z.ZodDate) {
      type = "date"
    }
    else if (innerType instanceof z.ZodEnum) {
      type = "enum"
      enumValues = innerType._def.values
    }
    else if (innerType instanceof z.ZodObject) {
      type = "object"
      children = []
      for (const [childName, childSchema] of Object.entries(innerType.shape)) {
        const childField = parseZodType(childName, childSchema as z.ZodTypeAny)
        if (childField) {
          children.push(childField)
        }
      }
    }
    else if (innerType instanceof z.ZodArray) {
      type = "array"
      const itemType = innerType._def.type
      arrayType = parseZodType("item", itemType) || {
        id: crypto.randomUUID(),
        name: "item",
        type: "string",
        required: true,
      }
    }
    else {
      // Check if it matches any custom type
      for (const custom of customTypes) {
        try {
          const customSchema = custom.generateSchema()
          if (customSchema._def.typeName === innerType._def.typeName) {
            type = "custom"
            customType = custom.name
            break
          }
        } catch {
          continue
        }
      }
    }

    return {
      id: crypto.randomUUID(),
      name,
      type,
      required,
      validators: Object.keys(validators).length > 0 ? validators : undefined,
      enumValues,
      children,
      arrayType,
      customType
    }
  }

  // Generate Zod schema object
  const generateZodSchema = useCallback(() => {
    const buildSchema = (fields: FieldConfig[]): Record<string, z.ZodTypeAny> => {
      const schema: Record<string, z.ZodTypeAny> = {}

      for (const field of fields) {
        let fieldSchema: any

        switch (field.type) {
          case "string":
            fieldSchema = z.string()
            if (field.validators?.url) fieldSchema = fieldSchema.url()
            if (field.validators?.email) fieldSchema = fieldSchema.email()
            break

          case "number":
            fieldSchema = z.number()
            if (field.validators?.int) fieldSchema = fieldSchema.int()
            if (field.validators?.min !== undefined) fieldSchema = fieldSchema.min(field.validators.min)
            if (field.validators?.max !== undefined) fieldSchema = fieldSchema.max(field.validators.max)
            break

          case "boolean":
            fieldSchema = z.boolean()
            break

          case "date":
            fieldSchema = z.date()
            break

          case "enum":
            if (field.enumValues && field.enumValues.length > 0) {
              fieldSchema = z.enum(field.enumValues as [string, ...string[]])
            } else {
              fieldSchema = z.enum(["option1", "option2"])
            }
            break

          case "object":
            if (field.children && field.children.length > 0) {
              fieldSchema = z.object(buildSchema(field.children))
            } else {
              fieldSchema = z.object({})
            }
            break

          case "array":
            if (field.arrayType) {
              if (field.arrayType.type === "object" && field.arrayType.children && field.arrayType.children.length > 0) {
                fieldSchema = z.array(z.object(buildSchema(field.arrayType.children)))
              } else if (field.arrayType.type === "enum" && field.arrayType.enumValues) {
                fieldSchema = z.array(z.enum(field.arrayType.enumValues as [string, ...string[]]))
              } else if (field.arrayType.type === "custom" && field.arrayType.customType) {
                const customType = customTypes.find((t) => t.name === field.arrayType?.customType)
                fieldSchema = customType ? z.array(customType.generateSchema()) : z.array(z.any())
              } else {
                let itemSchema: any
                switch (field.arrayType.type) {
                  case "string":
                    itemSchema = z.string()
                    if (field.arrayType.validators?.url) itemSchema = itemSchema.url()
                    if (field.arrayType.validators?.email) itemSchema = itemSchema.email()
                    break
                  case "number":
                    itemSchema = z.number()
                    if (field.arrayType.validators?.int) itemSchema = itemSchema.int()
                    if (field.arrayType.validators?.min !== undefined) itemSchema = itemSchema.min(field.arrayType.validators.min)
                    if (field.arrayType.validators?.max !== undefined) itemSchema = itemSchema.max(field.arrayType.validators.max)
                    break
                  case "boolean":
                    itemSchema = z.boolean()
                    break
                  case "date":
                    itemSchema = z.date()
                    break
                  default:
                    itemSchema = z.any()
                }
                fieldSchema = z.array(itemSchema)
              }
            } else {
              fieldSchema = z.array(z.any())
            }
            break

          case "custom":
            if (field.customType) {
              const customType = customTypes.find((t) => t.name === field.customType)
              fieldSchema = customType ? customType.generateSchema() : z.any()
            } else {
              fieldSchema = z.any()
            }
            break

          default:
            fieldSchema = z.any()
        }

        if (!field.required) {
          fieldSchema = fieldSchema.optional()
        }

        if (field.description) {
          fieldSchema = fieldSchema.describe(field.description)
        }

        schema[field.name] = fieldSchema
      }

      return schema
    }

    return z.object(buildSchema(fields))
  }, [fields, customTypes])

  // Helper to split top-level fields in an object definition
  const splitTopLevelFields = (objectDef: string): string[] => {
    const fields: string[] = []
    let currentField = ""
    let braceCount = 0
    let bracketCount = 0

    for (let i = 0; i < objectDef.length; i++) {
      const char = objectDef[i]

      if (char === "{") braceCount++
      else if (char === "}") braceCount--
      else if (char === "[") bracketCount++
      else if (char === "]") bracketCount--

      if (char === "," && braceCount === 0 && bracketCount === 0) {
        fields.push(currentField.trim())
        currentField = ""
      } else {
        currentField += char
      }
    }

    if (currentField.trim()) {
      fields.push(currentField.trim())
    }

    return fields
  }

  // Helper to parse a field type definition
  const parseFieldType = (name: string, typeDef: string): FieldConfig => {
    const field: FieldConfig = {
      id: crypto.randomUUID(),
      name,
      type: "string", // Default
      required: !typeDef.includes(".optional()"),
      validators: {},
    }

    // Check for description
    const describeMatch = typeDef.match(/\.describe$$["']([^"']*)["']$$/)
    if (describeMatch) {
      field.description = describeMatch[1]
    }

    // Determine type
    if (typeDef.startsWith("z.string()")) {
      field.type = "string"

      if (typeDef.includes(".url()")) {
        field.validators = { ...field.validators, url: true }
      }
      if (typeDef.includes(".email()")) {
        field.validators = { ...field.validators, email: true }
      }
    } else if (typeDef.startsWith("z.number()")) {
      field.type = "number"

      const minMatch = typeDef.match(/\.min$$(\d+(?:\.\d+)?)$$/)
      if (minMatch) {
        field.validators = { ...field.validators, min: Number.parseFloat(minMatch[1]) }
      }

      const maxMatch = typeDef.match(/\.max$$(\d+(?:\.\d+)?)$$/)
      if (maxMatch) {
        field.validators = { ...field.validators, max: Number.parseFloat(maxMatch[1]) }
      }

      if (typeDef.includes(".int()")) {
        field.validators = { ...field.validators, int: true }
      }
    } else if (typeDef.startsWith("z.boolean()")) {
      field.type = "boolean"
    } else if (typeDef.startsWith("z.date()")) {
      field.type = "date"
    } else if (typeDef.startsWith("z.enum(")) {
      field.type = "enum"

      // Extract enum values
      const enumMatch = typeDef.match(/z\.enum$$\[(.*?)\]$$/)
      if (enumMatch) {
        const enumValuesStr = enumMatch[1]
        const enumValues = enumValuesStr.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""))

        field.enumValues = enumValues
      }
    } else if (typeDef.startsWith("z.array(")) {
      field.type = "array"

      // Extract array item type
      const arrayItemMatch = typeDef.match(/z\.array$$(.*)$$/)
      if (arrayItemMatch) {
        const itemTypeDef = arrayItemMatch[1].trim()

        // Simplified parsing for array items
        if (itemTypeDef.startsWith("z.string()")) {
          field.arrayType = {
            id: crypto.randomUUID(),
            name: "item",
            type: "string",
            required: true,
          }
        } else if (itemTypeDef.startsWith("z.number()")) {
          field.arrayType = {
            id: crypto.randomUUID(),
            name: "item",
            type: "number",
            required: true,
          }
        } else if (itemTypeDef.startsWith("z.boolean()")) {
          field.arrayType = {
            id: crypto.randomUUID(),
            name: "item",
            type: "boolean",
            required: true,
          }
        }
        // Handle object arrays (simplified)
        else if (itemTypeDef.startsWith("z.object(")) {
          field.arrayType = {
            id: crypto.randomUUID(),
            name: "item",
            type: "object",
            required: true,
            children: [],
          }
        }
      }
    } else if (typeDef.startsWith("z.object(")) {
      field.type = "object"
      field.children = []

      // For nested objects, we'd need recursive parsing
      // This is simplified and won't handle all cases
    } else if (typeDef.startsWith("zColor()")) {
      field.type = "custom"
      field.customType = "zColor"
    }

    return field
  }

  // Add a new field
  const addField = useCallback(
    (type: FieldType = "string", path: string[] = [], isArrayItem = false) => {
      const newField: FieldConfig = {
        id: crypto.randomUUID(),
        name: "newField",
        type,
        required: true,
        validators:
          type === "number"
            ? { min: undefined, max: undefined, int: false }
            : type === "string"
              ? { url: false, email: false }
              : undefined,
        enumValues: type === "enum" ? ["option1", "option2"] : undefined,
        customType: type === "custom" ? customTypes[0]?.name : undefined,
      }

      if (type === "object") {
        newField.children = []
      } else if (type === "array") {
        newField.arrayType = {
          id: crypto.randomUUID(),
          name: "item",
          type: "string",
          required: true,
        }
      }

      if (path.length === 0) {
        setFields([...fields, newField])
        return
      }

      // Add to nested path
      const updatedFields = [...fields]

      const addToNestedPath = (items: FieldConfig[], pathSegments: string[], currentIndex: number): FieldConfig[] => {
        if (currentIndex >= pathSegments.length) return items

        const targetId = pathSegments[currentIndex]
        const targetIndex = items.findIndex((item) => item.id === targetId)

        if (targetIndex === -1) return items

        if (currentIndex === pathSegments.length - 1) {
          // We're at the parent level
          if (items[targetIndex].type === "object" && items[targetIndex].children) {
            items[targetIndex].children = [...items[targetIndex].children, newField]
          }
        } else {
          // Navigate deeper
          if (items[targetIndex].type === "object" && items[targetIndex].children) {
            items[targetIndex].children = addToNestedPath(items[targetIndex].children, pathSegments, currentIndex + 1)
          } else if (
            items[targetIndex].type === "array" &&
            items[targetIndex].arrayType &&
            items[targetIndex].arrayType.type === "object" &&
            items[targetIndex].arrayType.children &&
            pathSegments[currentIndex + 1] === "arrayType"
          ) {
            items[targetIndex].arrayType.children = [...items[targetIndex].arrayType.children, newField]
          }
        }

        return items
      }

      setFields(addToNestedPath(updatedFields, path, 0))
    },
    [fields, customTypes],
  )

  // Remove a field
  const removeField = useCallback(
    (id: string, path: string[] = []) => {
      if (path.length === 0) {
        setFields(fields.filter((field) => field.id !== id))
        return
      }

      // Remove from nested path
      const updatedFields = [...fields]

      const removeFromNestedPath = (
        items: FieldConfig[],
        pathSegments: string[],
        currentIndex: number,
      ): FieldConfig[] => {
        if (currentIndex >= pathSegments.length) return items

        const targetId = pathSegments[currentIndex]
        const targetIndex = items.findIndex((item) => item.id === targetId)

        if (targetIndex === -1) return items

        if (currentIndex === pathSegments.length - 1) {
          // We're at the parent level
          if (items[targetIndex].type === "object" && items[targetIndex].children) {
            items[targetIndex].children = items[targetIndex].children.filter((child) => child.id !== id)
          }
        } else {
          // Navigate deeper
          if (items[targetIndex].type === "object" && items[targetIndex].children) {
            items[targetIndex].children = removeFromNestedPath(
              items[targetIndex].children,
              pathSegments,
              currentIndex + 1,
            )
          }
        }

        return items
      }

      setFields(removeFromNestedPath(updatedFields, path, 0))
    },
    [fields],
  )

  // Update a field
  const updateField = useCallback(
    (id: string, updatedField: FieldConfig, path: string[] = []) => {
      if (path.length === 0) {
        setFields(fields.map((field) => (field.id === id ? updatedField : field)))
        return
      }

      // Update in nested path
      const updatedFields = [...fields]

      const updateInNestedPath = (
        items: FieldConfig[],
        pathSegments: string[],
        currentIndex: number,
      ): FieldConfig[] => {
        if (currentIndex >= pathSegments.length) return items

        const targetId = pathSegments[currentIndex]
        const targetIndex = items.findIndex((item) => item.id === targetId)

        if (targetIndex === -1) return items

        if (currentIndex === pathSegments.length - 1) {
          // We're at the parent level
          if (items[targetIndex].type === "object" && items[targetIndex].children) {
            items[targetIndex].children = items[targetIndex].children.map((child) =>
              child.id === id ? updatedField : child,
            )
          } else if (pathSegments[currentIndex + 1] === "arrayType") {
            items[targetIndex].arrayType = updatedField
          }
        } else {
          // Navigate deeper
          if (items[targetIndex].type === "object" && items[targetIndex].children) {
            items[targetIndex].children = updateInNestedPath(
              items[targetIndex].children,
              pathSegments,
              currentIndex + 1,
            )
          }
        }

        return items
      }

      setFields(updateInNestedPath(updatedFields, path, 0))
    },
    [fields],
  )

  // Move a field (drag and drop)
  const moveField = useCallback(
    (sourceId: string, targetId: string, path: string[] = []) => {
      if (path.length === 0) {
        const sourceIndex = fields.findIndex((field) => field.id === sourceId)
        const targetIndex = fields.findIndex((field) => field.id === targetId)

        if (sourceIndex === -1 || targetIndex === -1) return

        const updatedFields = [...fields]
        const [movedField] = updatedFields.splice(sourceIndex, 1)
        updatedFields.splice(targetIndex, 0, movedField)

        setFields(updatedFields)
        return
      }

      // Move in nested path
      const updatedFields = [...fields]

      const moveInNestedPath = (items: FieldConfig[], pathSegments: string[], currentIndex: number): FieldConfig[] => {
        if (currentIndex >= pathSegments.length) return items

        const targetId = pathSegments[currentIndex]
        const targetIndex = items.findIndex((item) => item.id === targetId)

        if (targetIndex === -1) return items

        if (currentIndex === pathSegments.length - 1) {
          // We're at the parent level
          if (items[targetIndex].type === "object" && items[targetIndex].children) {
            const sourceIndex = items[targetIndex].children.findIndex((child) => child.id === sourceId)
            const destIndex = items[targetIndex].children.findIndex((child) => child.id === targetId)

            if (sourceIndex === -1 || destIndex === -1) return items

            const updatedChildren = [...items[targetIndex].children]
            const [movedField] = updatedChildren.splice(sourceIndex, 1)
            updatedChildren.splice(destIndex, 0, movedField)

            items[targetIndex].children = updatedChildren
          }
        } else {
          // Navigate deeper
          if (items[targetIndex].type === "object" && items[targetIndex].children) {
            items[targetIndex].children = moveInNestedPath(items[targetIndex].children, pathSegments, currentIndex + 1)
          }
        }

        return items
      }

      setFields(moveInNestedPath(updatedFields, path, 0))
    },
    [fields],
  )

  // Generate schema description
  const generateSchemaDescription = useCallback((fields: FieldConfig[]): any => {
    const result: Record<string, any> = {}

    const processField = (field: FieldConfig, path = ""): void => {
      const currentPath = path ? `${path}.${field.name}` : field.name

      if (field.type === "object" && field.children) {
        // For objects, create a nested object
        result[field.name] = {}
        field.children.forEach((child) => {
          processField(child, currentPath)
        })
      } else if (field.type === "array" && field.arrayType) {
        // For arrays, create an array with descriptions
        if (!result[field.name]) {
          result[field.name] = []
        }

        if (field.arrayType.type === "object" && field.arrayType.children) {
          // For array of objects, create array of nested descriptions
          const nestedDesc = {} as any
          field.arrayType.children.forEach((child) => {
            if (child.valueDescription) {
              nestedDesc[child.name] = child.valueDescription.replace(/{number}/g, `{${currentPath}}`)
            }
          })
          result[field.name].push(nestedDesc)
        } else if (field.arrayType.valueDescription) {
          // For array of primitives, add the description
          result[field.name].push(field.arrayType.valueDescription.replace(/{number}/g, `{${currentPath}}`))
        }
      } else {
        // For primitive types, add the description if available
        if (field.valueDescription) {
          if (!result[field.name]) {
            result[field.name] = field.valueDescription.replace(/{number}/g, `{${currentPath}}`)
          }
        }
      }
    }

    fields.forEach((field) => {
      processField(field)
    })

    return result
  }, [])

  return (
    <DnDWrapper>
      <div className="container mx-auto py-6">
        <span className="text-2xl font-bold mb-6">Form Builder</span>
        <Accordion type="single" collapsible className="w-full">

          <AccordionItem value="item-1">
            <AccordionTrigger>Builder</AccordionTrigger>
            <AccordionContent>
              <>

                <div className="space-y-4">
                  {fields.map((field) => (
                    <FieldItem
                      key={field.id}
                      field={field}
                      moveField={moveField}
                      removeField={removeField}
                      updateField={updateField}
                      addField={addField}
                      customTypes={customTypes}
                    />
                  ))}

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => addField()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>

                    <Button
                      onClick={() => {
                        const schema = generateZodSchema()
                        if (onSchemaDone) {
                          onSchemaDone(schema)
                        }

                        if (onSchemaDescriptionDone) {
                          const schemaDescription = generateSchemaDescription(fields)
                          onSchemaDescriptionDone(schemaDescription)
                        }
                      }}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Generate Schema
                    </Button>
                  </div>
                </div>
              </>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DnDWrapper>
  )
}

