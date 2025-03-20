
import { generateDataUrl, getFileTypeByExtension } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { FilePreview } from "@/shared/ui/file-preview";
import { Form } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { memo, ReactElement, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z, ZodTypeAny } from "zod";
import FileInput from "./file-input";
import { Loader, MinusIcon, PlusIcon } from "lucide-react";
import { Separator } from "@/shared/ui/separator";


const renderFormElement = (
  key: string,
  schema: ZodTypeAny,
  register: any,
  errors: any,
  control: any,
  setValue: any,
  trigger: any,
  defaultValues: Partial<Record<any, any>>
) => {

  if (schema.description === "File") {
    return (
      <FileInput
        key={key}
        name={key}
        register={register}
        errors={errors}
      />
    );
  }

  if (schema instanceof z.ZodString) {
    const utils = register(key)
    return (
      <div key={key}>
        <label>{key}</label>
        <Textarea rows={4} {...utils} />
        {errors[key] && <p>{errors[key].message}</p>}
      </div>
    );
  }

  if (schema instanceof z.ZodNumber) {
    const utils = register(key, {
      setValueAs: (value: any) => {
        return value === "" ? undefined : Number(value);
      },
    });
    return (
      <div key={key}>
        <label>{key}</label>
        <Input type="number" {...utils} />
        {errors[key] && <p className="text-destructive">{errors[key].message}</p>}
      </div>
    );
  }


  // Обработка булевых значений
  if (schema instanceof z.ZodBoolean) {
    return (
      <div key={key}>
        <label>{key}</label>
        <Input type="checkbox" {...register(key)} />
        {errors[key] && <p>{errors[key].message}</p>}
      </div>
    );
  }

  if (schema instanceof z.ZodEnum) {
    const utils = register(key)
    return (
      <div key={key}>
        <label>{key}</label>
        <Select {...utils} onValueChange={utils?.onChange} defaultValue={defaultValues?.[key]}>
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
        {errors[key] && <p>{errors[key].message}</p>}
      </div>
    );
  }

  // Обработка массивов
  if (schema instanceof z.ZodArray) {
    const { fields, append, remove } = useFieldArray({
      control,
      name: key,
    });

    return (
      <div key={key} className="py-3 flex flex-col gap-4">
        <Separator/>
        <div className="flex items-center gap-2">
          <label>{key} (Array)</label>
          <Button size="sm" type="button" onClick={() => append({})}>
            <PlusIcon></PlusIcon>Add
          </Button>
        </div>
        {fields.map((item, index) => (
          <div key={item.id} className="mt-2">
            <div className="flex items-center">
              <div className="grow"/>
              <Button size="sm" variant="destructive" type="button" onClick={() => remove(index)}>
                <MinusIcon></MinusIcon>
              </Button>
            </div>
            {renderFormElement(
              `${key}.${index}`,
              schema.element,
              register,
              errors,
              control,
              setValue,
              trigger,
              defaultValues
            )}
          </div>
        ))}
        <Separator/>
      </div>
    );
  }

  if (schema instanceof z.ZodObject) {
    return (
      <div key={key}>
        <fieldset>
          <legend>{key}</legend>
          {Object.entries(schema.shape).map(([subKey, subSchema]) =>
            renderFormElement(
              `${key}.${subKey}`,
              subSchema as ZodTypeAny,
              register,
              errors,
              control,
              setValue,
              trigger,
              defaultValues
            )
          )}
        </fieldset>
      </div>
    );
  }

  return null;
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
  const methods = useForm({
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

export const FormGeneratorBody = ({ schema }: GeneratorMainProps) => {
  const form = useFormContext<z.infer<typeof schema>>()
  const fields = Object.entries(schema.shape).map(([key, subSchema]) =>
    renderFormElement(
      key,
      subSchema as ZodTypeAny,
      form.register,
      form.formState.errors,
      form.control,
      form.setValue,
      form.trigger,
      form.formState.defaultValues ?? {}
    )
  );
  return <div className="flex flex-col gap-3">
    {fields}
  </div>
}

export const FormGeneratorControls = ({
  schema,
  onChange,
  pendingSlot
}: GeneratorMainProps) => {
  const form = useFormContext<z.infer<typeof schema>>()
  const { pending } = useFormStatus()
  const errors = Object.values(form.formState.errors)
  const watchedValues = form.watch();


  return <div className="flex items-center gap-2 mt-3">
    {pending && <div className="flex items-center gap-2"><div>{pendingSlot}</div><Loader className="animate-spin"/></div>}
    <Button onClick={() => onChange?.(watchedValues)} variant="secondary" disabled={pending || errors.length > 0} type="button">Update</Button>
    <Button disabled={pending || errors.length > 0} type="submit">Do action</Button>
  </div>
}

