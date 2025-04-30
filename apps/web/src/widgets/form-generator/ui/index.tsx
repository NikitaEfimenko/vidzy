
'use client'
import { cn, getValueByPath } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Textarea } from "@/shared/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, MinusIcon, PlusIcon } from "lucide-react";
import { FC, memo, ReactElement, ReactNode, useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z, ZodTypeAny } from "zod";
import { FileInput, FileInputUrl } from "./file-input";


// const renderFormElement = (
//   key: string,
//   schema: ZodTypeAny,
//   register: any,
//   errors: any,
//   control: any,
//   setValue: any,
//   trigger: any,
//   defaultValues: Partial<Record<any, any>>
// ) => {

//   if (schema.description === "File") {
//     return (
//       <FileInput
//         key={key}
//         name={key}
//         register={register}
//         errors={errors}
//       />
//     );
//   }

//   if (schema instanceof z.ZodString) {
//     const utils = register(key)
//     return (
//       <div key={key}>
//         <label>{key}</label>
//         <Textarea rows={4} {...utils} />
//         {errors[key] && <p>{errors[key].message}</p>}
//       </div>
//     );
//   }

//   if (schema instanceof z.ZodNumber) {
//     const utils = register(key, {
//       setValueAs: (value: any) => {
//         return value === "" ? undefined : Number(value);
//       },
//     });
//     return (
//       <div key={key}>
//         <label>{key}</label>
//         <Input type="number" {...utils} />
//         {errors[key] && <p className="text-destructive">{errors[key].message}</p>}
//       </div>
//     );
//   }


//   // Обработка булевых значений
//   if (schema instanceof z.ZodBoolean) {
//     return (
//       <div key={key}>
//         <label>{key}</label>
//         <Input type="checkbox" {...register(key)} />
//         {errors[key] && <p>{errors[key].message}</p>}
//       </div>
//     );
//   }

//   if (schema instanceof z.ZodEnum) {
//     const utils = register(key)
//     return (
//       <div key={key}>
//         <label>{key}</label>
//         <Select {...utils} onValueChange={utils?.onChange} defaultValue={defaultValues?.[key]}>
//           <SelectTrigger>
//             <SelectValue placeholder="Select value" />
//           </SelectTrigger>
//           <SelectContent>
//             {schema.options.map((option: string) => (
//               <SelectItem value={option} key={option}>
//                 {option}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {errors[key] && <p>{errors[key].message}</p>}
//       </div>
//     );
//   }

//   // Обработка массивов
//   if (schema instanceof z.ZodArray) {
//     const { fields, append, remove } = useFieldArray({
//       control,
//       name: key,
//     });

//     return (
//       <div key={key} className="py-3 flex flex-col gap-4">
//         <Separator/>
//         <div className="flex items-center gap-2">
//           <label>{key} (Array)</label>
//           <Button size="sm" type="button" onClick={() => append({})}>
//             <PlusIcon></PlusIcon>Add
//           </Button>
//         </div>
//         {fields.map((item, index) => (
//           <div key={item.id} className="mt-2">
//             <div className="flex items-center">
//               <div className="grow"/>
//               <Button size="sm" variant="destructive" type="button" onClick={() => remove(index)}>
//                 <MinusIcon></MinusIcon>
//               </Button>
//             </div>
//             {renderFormElement(
//               `${key}.${index}`,
//               schema.element,
//               register,
//               errors,
//               control,
//               setValue,
//               trigger,
//               defaultValues
//             )}
//           </div>
//         ))}
//         <Separator/>
//       </div>
//     );
//   }

//   if (schema instanceof z.ZodObject) {
//     return (
//       <div key={key}>
//         <fieldset>
//           <legend>{key}</legend>
//           {Object.entries(schema.shape).map(([subKey, subSchema]) =>
//             renderFormElement(
//               `${key}.${subKey}`,
//               subSchema as ZodTypeAny,
//               register,
//               errors,
//               control,
//               setValue,
//               trigger,
//               defaultValues
//             )
//           )}
//         </fieldset>
//       </div>
//     );
//   }

//   return null;
// };

const FormElement: FC<{
  keyName: string;
  schema: ZodTypeAny;
  register: any;
  errors: any;
  control: any;
  setValue: any;
  trigger: any;
  defaultValues: Partial<Record<any, any>>;
  mode?: 'row' | 'column'
}> = ({ keyName, schema, register, errors, control, setValue, trigger, defaultValues, mode = 'column' }) => {
  if (schema.description === "File") {
    return <FileInput key={keyName} name={keyName} register={register} errors={errors} />;
  }
  if (schema.description === "url") {
    // Bug defaultValues?.[keyName] must be full path selector
    return <FileInputUrl defaultValue={getValueByPath(defaultValues, keyName)} key={keyName} name={keyName} register={register} errors={errors} />;
  }

  if (schema instanceof z.ZodString) {
    const utils = register(keyName);
    return (
      <div key={keyName}>
        <label>{keyName}</label>
        <Textarea rows={4} {...utils} />
        {errors[keyName] && <p>{errors[keyName].message}</p>}
      </div>
    );
  }

  if (schema instanceof z.ZodNumber) {
    const utils = register(keyName, {
      setValueAs: (value: any) => (value === "" ? undefined : Number(value)),
    });

    return (
      <div key={keyName}>
        <label>{keyName}</label>
        <Input type="number" {...utils} />
        {errors[keyName] && <p className="text-destructive">{errors[keyName].message}</p>}
      </div>
    );
  }

  if (schema instanceof z.ZodBoolean || schema.description === "show") {
    return (
      <div key={keyName}>
        <label>{keyName}</label>
        <Input type="checkbox" {...register(keyName)} />
        {errors[keyName] && <p>{errors[keyName].message}</p>}
      </div>
    );
  }

  if (schema instanceof z.ZodEnum) {
    const utils = register(keyName);
    return (
      <div key={keyName}>
        <label>{keyName}</label>
        <Select {...utils} onValueChange={v => {
          const fakeEvent = {
            target: {
              value: v,
              name: utils?.name,
            },
          };
          utils?.onChange(fakeEvent)
        }} defaultValue={getValueByPath(defaultValues, keyName)}>
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {schema.options.map((option: string) => (
              <SelectItem value={option} key={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors[keyName] && <p>{errors[keyName].message}</p>}
      </div>
    );
  }

  if (schema instanceof z.ZodArray) {
    return <ArrayField mode={mode} keyName={keyName} schema={schema} control={control} register={register} errors={errors} setValue={setValue} trigger={trigger} defaultValues={defaultValues} />;
  }

  if (schema instanceof z.ZodObject) {
    return (
      // <Accordion type="single" collapsible defaultChecked={false} className="w-full">
        // {/* <AccordionItem value={keyName}> */}
          <div key={keyName}>
            <fieldset>
              <legend>{keyName}</legend>
              {/* <AccordionContent> */}
                {Object.entries(schema.shape ?? {}).map(([subKey, subSchema]) => (
                  <FormElement
                    key={subKey}
                    keyName={`${keyName}.${subKey}`}
                    schema={subSchema as ZodTypeAny}
                    register={register}
                    errors={errors}
                    control={control}
                    setValue={setValue}
                    trigger={trigger}
                    defaultValues={defaultValues}
                    mode={mode}
                  />
                ))}
              {/* </AccordionContent> */}
            </fieldset>
            {/* <div className="flex items-center justify-center">
              <Button type="button" className="w-fit" variant="outline">
                <AccordionTrigger className="flex items-stretch w-full h-full">
                </AccordionTrigger>
              </Button>
            </div> */}
          </div>
        // {/* </AccordionItem> */}
      // {/* </Accordion> */}
    );
  }

  return null;
};

const ArrayField: FC<{
  keyName: string;
  schema: z.ZodArray<any>;
  control: any;
  register: any;
  errors: any;
  setValue: any;
  trigger: any;
  defaultValues: Partial<Record<any, any>>;
  mode?: 'row' | 'column'
}> = ({ keyName, schema, control, register, errors, setValue, trigger, defaultValues, mode='column' }) => {
  const { fields, append, remove } = useFieldArray({ control, name: keyName });

  return (

    <div key={keyName} className={cn("py-3 flex gap-4 flex-col")}>
      <Separator/>
      <div className="flex items-center gap-3">
        <label>{keyName} (Array)</label>
        <Button size="sm" type="button" onClick={() => append({})}>
          <PlusIcon /> Add
        </Button>
      </div>
      <div className={cn("py-3 flex gap-3", mode === "column" ? "flex-col" : "flex-row")}>
      {fields.map((item, index) => (
        <div key={item.id} className="mt-2">
          <div className="flex items-center">
            <div className="grow" />
            <Button size="sm" variant="destructive" type="button" onClick={() => remove(index)}>
              <MinusIcon />
            </Button>
          </div>
          <FormElement
            keyName={`${keyName}.${index}`}
            schema={schema.element}
            register={register}
            errors={errors}
            control={control}
            setValue={setValue}
            trigger={trigger}
            defaultValues={defaultValues}
            mode={mode}
          />
        </div>
      ))}
          </div>
      <Separator />
    </div>
  );
};


export type GeneratorMainProps = {
  schema: z.ZodObject<any>,
  onChange?: (values: Partial<Record<any, any>>) => void,
  pendingSlot?: ReactElement
}
type FormGeneratorProviderProps<T> = {
  children: ReactNode,
  defaultValues: Partial<Record<any, any>>,
  onResult?: (state: any) => void,
  serverAction: (prevState: T, formData: FormData) => T | Promise<T>;
} & GeneratorMainProps

export const FormGeneratorProvider = memo(({ onResult, onChange, serverAction, schema, children, defaultValues }: FormGeneratorProviderProps<any>) => {
  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
    mode: "all"
  });
  const { register, trigger, reset, handleSubmit, formState: { errors, isValid }, control, getValues, watch } = methods;
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action] = useFormState(serverAction, null)
  useEffect(() => {
    state?.issues && toast("Result:", {
      description: state?.issues
    })
  }, [state?.issues])

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

  useEffect(() => {
    onResult?.(state)
  }, [state])

  return (<Form {...methods}>
    <form
      action={action}
      onSubmit={async (e) => {
        await trigger()
        if (isValid) {
          formRef.current?.requestSubmit()
        } else {
          e.preventDefault()
        }
      }}
    >
      {children}
    </form>
  </Form>
  );
});


export const FormNoActionGeneratorProvider = memo(({ onResult, onChange, schema, children, defaultValues }: Omit<FormGeneratorProviderProps<any>, "serverAction">) => {
  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
    mode: "all"
  });

  useEffect(() => {
    methods.reset(defaultValues)
  }, [methods.reset, JSON.stringify(defaultValues)])

  const { register, trigger, reset, handleSubmit, formState: { errors, isValid }, control, getValues, watch } = methods;
  const formRef = useRef<HTMLFormElement>(null)

  return (<Form {...methods}>
    <form
      onSubmit={async (e) => {
        await trigger()
        if (isValid) {
          formRef.current?.requestSubmit()
        } else {
          e.preventDefault()
        }
      }}
    >
      {children}
    </form>
  </Form>
  );
});

export const FormGeneratorBody = ({ schema, mode = 'column' }: GeneratorMainProps & {mode?: 'row' | 'column'}) => {
  const form = useFormContext<z.infer<typeof schema>>();
  return (
    <div className={cn("flex gap-3 flex-col")}>
      {Object.entries(schema.shape ?? {}).map(([key, subSchema]) => (
        <FormElement
          keyName={key}
          schema={subSchema as ZodTypeAny}
          register={form.register}
          errors={form.formState.errors}
          control={form.control}
          setValue={form.setValue}
          trigger={form.trigger}
          mode={mode}
          defaultValues={form.formState.defaultValues ?? {}}
        />
      ))}
    </div>
  );
};


// export const FormGeneratorBody = ({ schema }: GeneratorMainProps) => {
//   const form = useFormContext<z.infer<typeof schema>>()
//   const fields = Object.entries(schema.shape).map(([key, subSchema]) =>
//     renderFormElement(
//       key,
//       subSchema as ZodTypeAny,
//       form.register,
//       form.formState.errors,
//       form.control,
//       form.setValue,
//       form.trigger,
//       form.formState.defaultValues ?? {}
//     )
//   );
//   return <div className="flex flex-col gap-3">
//     {fields}
//   </div>
// }

export const FormGeneratorControls = ({
  schema,
  onChange,
  pendingSlot,
  noAction = false,
  noUpdater = false
}: GeneratorMainProps & { noAction?: boolean, noUpdater?: boolean }) => {
  const form = useFormContext<z.infer<typeof schema>>()
  const { pending } = useFormStatus()
  const errors = Object.values(form.formState.errors)
  const watchedValues = form.watch();
  // console.log(watchedValues, "values from controls")

  return <div className="flex items-center gap-2 mt-3">
    {pending && <div className="flex items-center gap-2"><div>{pendingSlot}</div><Loader className="animate-spin" /></div>}
    {!noUpdater && <Button onClick={() => onChange?.(watchedValues)} variant={noAction ? "default" : "secondary"} disabled={pending || errors.length > 0} type="button">Update</Button>}
    {!noAction && <Button disabled={pending || errors.length > 0} type="submit">Do action</Button>}
  </div>
}

