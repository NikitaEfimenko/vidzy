"use client"

import type React from "react"

import { useIsMobile as useMobile } from "@/shared/hooks/use-mobile"
import type { Mapping } from "@/shared/lib/schema-mapper"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { AlertCircle, ArrowRight, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"



type SchemaField = {
  path: string
  type: string
  isArray: boolean
}

export function SchemaMapper({
  sourceSchema,
  targetSchema,
  onSave,
  initialMapping
}: {
  sourceSchema: z.ZodObject<any>
  targetSchema: z.ZodObject<any>,
  initialMapping?: Mapping[],
  onSave: (mappings: Mapping[]) => void
}) {
  const [mappings, setMappings] = useState<Mapping[]>(initialMapping ?? [])
  const [draggedField, setDraggedField] = useState<string | null>(null)
  const [touchDragField, setTouchDragField] = useState<string | null>(null)
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null)
  const dragElementRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  const sourceFields = extractSchemaFields(sourceSchema)
  const targetFields = extractSchemaFields(targetSchema)

  // Clean up touch drag state when dialog closes
  useEffect(() => {
    setTouchDragField(null)
    setTouchPosition(null)
  }, [])

  // Handle touch drag element positioning
  useEffect(() => {
    if (touchPosition && dragElementRef.current) {
      dragElementRef.current.style.left = `${touchPosition.x}px`
      dragElementRef.current.style.top = `${touchPosition.y}px`
    }
  }, [touchPosition])

  function extractSchemaFields(schema: z.ZodObject<any>, prefix = ""): SchemaField[] {
    const shape = schema._def.shape()

    return Object.entries(shape).flatMap(([key, def]: [string, any]) => {
      const path = prefix ? `${prefix}.${key}` : key

      if (def instanceof z.ZodObject) {
        return extractSchemaFields(def, path)
      } else if (def instanceof z.ZodArray) {
        return [
          {
            path,
            type: getTypeFromZodDef(def._def.type),
            isArray: true,
          },
        ]
      } else {
        return [
          {
            path,
            type: getTypeFromZodDef(def),
            isArray: false,
          },
        ]
      }
    })
  }

  function getTypeFromZodDef(def: any): string {
    if (def instanceof z.ZodString) {
      if (def._def.checks?.some((check: any) => check.kind === "email")) return "email"
      if (def._def.checks?.some((check: any) => check.kind === "url")) return "url"
      return "string"
    }
    if (def instanceof z.ZodNumber) return "number"
    if (def instanceof z.ZodBoolean) return "boolean"
    if (def instanceof z.ZodDate) return "date"
    return "unknown"
  }

  // Desktop drag and drop handlers
  function handleDragStart(path: string) {
    setDraggedField(path)
  }

  function handleDrop(targetPath: string) {
    if (!draggedField) return

    // Only add the mapping here, don't rely on dataTransfer which might be called multiple times
    handleAddMapping(draggedField, targetPath)
    setDraggedField(null)
  }

  // Mobile touch handlers
  function handleTouchStart(e: React.TouchEvent, path: string) {
    if (isMobile) {
      e.preventDefault()
      const touch = e.touches[0]
      setTouchDragField(path)
      setTouchPosition({ x: touch.clientX, y: touch.clientY })
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (isMobile && touchDragField) {
      e.preventDefault()
      const touch = e.touches[0]
      setTouchPosition({ x: touch.clientX, y: touch.clientY })
    }
  }

  function handleTouchEnd(e: React.TouchEvent, targetPath: string) {
    if (isMobile && touchDragField) {
      e.preventDefault()
      handleAddMapping(touchDragField, targetPath)
      setTouchDragField(null)
      setTouchPosition(null)
    }
  }

  function handleRemoveMapping(id: string) {
    setMappings(mappings.filter((m) => m.id !== id))
  }

  function handleAddMapping(sourcePath: string, targetPath: string) {
    // Check if target already has a mapping
    const existingTargetMapping = mappings.find((m) => m.target === targetPath)

    // Check if this exact mapping already exists
    const exactMappingExists = mappings.some((m) => m.source === sourcePath && m.target === targetPath)

    // If the exact mapping already exists, do nothing
    if (exactMappingExists) {
      return
    }

    // If target is already mapped from a different source, replace that mapping
    if (existingTargetMapping && existingTargetMapping.source !== sourcePath) {
      // toast({
      //   title: "Mapping replaced",
      //   description: `Replaced mapping from ${existingTargetMapping.source} to ${targetPath} with ${sourcePath} to ${targetPath}`,
      //   variant: "default",
      // })

      // Remove the existing mapping
      setMappings((prev) => prev.filter((m) => m.target !== targetPath))
    }

    // Create the new mapping with a more unique ID
    const newMapping: Mapping = {
      id: `${sourcePath}-to-${targetPath}-${Date.now()}`,
      source: sourcePath,
      target: targetPath,
    }

    // Add the new mapping
    setMappings((prev) => [...prev, newMapping])
  }

  // Check if a field is already mapped to a target
  function isFieldMappedTo(sourcePath: string, targetPath: string): boolean {
    return mappings.some((m) => m.source === sourcePath && m.target === targetPath)
  }

  // Get the source field mapped to a target field (if any)
  function getSourceForTarget(targetPath: string): string | null {
    const mapping = mappings.find((m) => m.target === targetPath)
    return mapping ? mapping.source : null
  }

  function handleSave() {
    onSave(mappings)
  }

  // Get the last part of a path (e.g., "emailAddress" from "contactInfo.emailAddress")
  function getFieldName(path: string): string {
    const parts = path.split(".")
    return parts[parts.length - 1]
  }

  return <>
    <div className="flex-1 overflow-hidden p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* Source Schema */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 h-[calc(100%-2rem)]">
            <h3 className="text-lg font-semibold mb-4">Source Schema</h3>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="space-y-2 pr-4 min-h-36 max-h-64">
                {sourceFields.map((field) => (
                  <div
                    key={field.path}
                    draggable={!isMobile}
                    onDragStart={(e) => {
                      if (!isMobile) {
                        e.dataTransfer.setData("text/plain", field.path)
                        handleDragStart(field.path)
                      }
                    }}
                    onTouchStart={(e) => handleTouchStart(e, field.path)}
                    onTouchMove={handleTouchMove}
                    className={cn(
                      "p-2 border rounded-md bg-background transition-colors",
                      isMobile ? "active:bg-accent/70" : "cursor-grab hover:bg-accent/50",
                      touchDragField === field.path && "bg-accent/70",
                    )}
                  >
                    <div>
                      <span className="font-medium">{field.path}</span>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{field.type}</Badge>
                        {field.isArray && <Badge>array</Badge>}
                      </div>
                    </div>

                    {/* Target field mapping options */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs text-muted-foreground mr-1 mt-1">Map to:</span>
                      {targetFields.map((targetField) => {
                        const isMapped = isFieldMappedTo(field.path, targetField.path)
                        const existingSource = getSourceForTarget(targetField.path)
                        const isDisabled = existingSource !== null && existingSource !== field.path

                        return (
                          <Badge
                            key={targetField.path}
                            variant={isMapped ? "default" : "outline"}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isMapped && "bg-primary",
                              isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent",
                            )}
                            onClick={() => {
                              if (!isDisabled) {
                                handleAddMapping(field.path, targetField.path)
                              } else {
                                // toast({
                                //   title: "Target already mapped",
                                //   description: `${targetField.path} is already mapped from ${existingSource}. Remove that mapping first.`,
                                //   variant: "destructive",
                                // })
                              }
                            }}
                          >
                            {getFieldName(targetField.path)}
                            {isDisabled && <AlertCircle className="h-3 w-3 ml-1 inline-block" />}
                          </Badge>
                        )
                      })}
                    </div>

                    {/* Show target fields this source is mapped to */}
                    {mappings.filter((m) => m.source === field.path).length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-xs text-muted-foreground block mb-1">Mapped to:</span>
                        <div className="flex flex-wrap gap-1">
                          {mappings
                            .filter((m) => m.source === field.path)
                            .map((mapping) => {
                              const targetField = targetFields.find((f) => f.path === mapping.target)
                              return (
                                <Badge key={mapping.id} variant="secondary" className="flex items-center gap-1">
                                  {getFieldName(mapping.target)}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveMapping(mapping.id)
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              )
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Target Schema */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 h-[calc(100%-2rem)]">
            <h3 className="text-lg font-semibold mb-4">Target Schema</h3>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="space-y-2 pr-4 min-h-36 max-h-64">
                {targetFields.map((field) => {
                  const sourceField = getSourceForTarget(field.path)
                  const isTargetMapped = sourceField !== null

                  return (
                    <div
                      key={field.path}
                      onDragOver={(e) => {
                        if (!isMobile) {
                          // Only allow drop if not already mapped or mapped from the current dragged field
                          if (!isTargetMapped || sourceField === draggedField) {
                            e.preventDefault()
                            e.currentTarget.classList.add("border-primary")
                          }
                        }
                      }}
                      onDragLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.classList.remove("border-primary")
                        }
                      }}
                      onDragEnter={(e) => !isMobile && e.preventDefault()}
                      onDrop={(e) => {
                        if (!isMobile) {
                          e.preventDefault()
                          e.currentTarget.classList.remove("border-primary")

                          // Only handle the drop if we have a valid draggedField state
                          // Don't use dataTransfer.getData which might be called multiple times
                          if (draggedField) {
                            // Only allow drop if not already mapped or mapped from the current dragged field
                            const sourceField = getSourceForTarget(field.path)
                            const isTargetMapped = sourceField !== null

                            if (!isTargetMapped || sourceField === draggedField) {
                              handleAddMapping(draggedField, field.path)
                            } else if (isTargetMapped && sourceField !== draggedField) {
                              // toast({
                              //   title: "Target already mapped",
                              //   description: `${field.path} is already mapped from ${sourceField}. Remove that mapping first.`,
                              //   variant: "destructive",
                              // })
                            }
                          }

                          // Reset drag state
                          setDraggedField(null)
                        }
                      }}
                      onTouchEnd={(e) => {
                        if (isMobile && touchDragField) {
                          e.preventDefault()

                          // Only allow drop if not already mapped or mapped from the current dragged field
                          if (!isTargetMapped || sourceField === touchDragField) {
                            handleAddMapping(touchDragField, field.path)
                          } else {
                            // toast({
                            //   title: "Target already mapped",
                            //   description: `${field.path} is already mapped from ${sourceField}. Remove that mapping first.`,
                            //   variant: "destructive",
                            // })
                          }

                          setTouchDragField(null)
                          setTouchPosition(null)
                        }
                      }}
                      className={cn(
                        "p-2 border rounded-md bg-background transition-colors",
                        (!isMobile && draggedField && (!isTargetMapped || sourceField === draggedField)) ||
                          (isMobile && touchDragField && (!isTargetMapped || sourceField === touchDragField))
                          ? "border-dashed border-primary"
                          : "",
                        isTargetMapped && "bg-accent/10",
                        touchDragField && "active:bg-accent/30",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{field.path}</span>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{field.type}</Badge>
                            {field.isArray && <Badge>array</Badge>}
                          </div>
                        </div>
                      </div>

                      {/* Show mapped source field */}
                      {isTargetMapped && (
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-xs text-muted-foreground block mb-1">Mapped from:</span>
                          <div className="flex flex-wrap gap-1">
                            {mappings
                              .filter((m) => m.target === field.path)
                              .map((mapping) => {
                                const sourceField = sourceFields.find((f) => f.path === mapping.source)
                                return (
                                  <Badge key={mapping.id} variant="secondary" className="flex items-center gap-1">
                                    {getFieldName(mapping.source)}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemoveMapping(mapping.id)
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                )
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Mappings */}
      <Card className="mt-6 overflow-hidden">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Current Mappings</h3>
          {mappings.length === 0 ? (
            <p className="text-muted-foreground">
              No mappings created yet. {isMobile ? "Tap and hold" : "Drag"} fields or click on field names to create
              mappings.
            </p>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {mappings.map((mapping) => {
                  const sourceField = sourceFields.find((f) => f.path === mapping.source)
                  const targetField = targetFields.find((f) => f.path === mapping.target)

                  return (
                    <div
                      key={mapping.id}
                      className="p-2 border rounded-md bg-background flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1">
                          <span className="font-medium">{mapping.source}</span>
                          <Badge variant="outline" className="ml-2">
                            {sourceField?.type}
                          </Badge>
                          {sourceField?.isArray && <Badge className="ml-1">array</Badge>}
                        </div>

                        <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />

                        <div className="flex-1">
                          <span className="font-medium">{mapping.target}</span>
                          <Badge variant="outline" className="ml-2">
                            {targetField?.type}
                          </Badge>
                          {targetField?.isArray && <Badge className="ml-1">array</Badge>}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMapping(mapping.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>

    <div className="flex justify-end gap-2 mt-4">
      <Button onClick={handleSave}>Save Mappings</Button>
    </div>

    {/* Touch drag visual element */}
    {isMobile && touchDragField && touchPosition && (
      <div
        ref={dragElementRef}
        className="fixed z-50 bg-primary text-primary-foreground rounded-md px-2 py-1 text-sm pointer-events-none opacity-90 shadow-md"
        style={{
          left: touchPosition.x,
          top: touchPosition.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        {touchDragField}
      </div>
    )}
  </>

}

