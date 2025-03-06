
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z, ZodTypeAny } from "zod";


const renderFormElement = (
  key: string,
  schema: ZodTypeAny,
  register: any,
  errors: any,
  control: any,
  setValue: any,
  trigger: any
) => {

  if (schema.description === "File") {
    return (
      <div key={key}>
        <label>{key}</label>
        <input type="file" {...register(key)} />
        {errors[key] && <p>{errors[key].message}</p>}
      </div>
    );
  }

  if (schema instanceof z.ZodString) {
    return (
      <div key={key}>
        <label>{key}</label>
        <input type="text" {...register(key)} />
        {errors[key] && <p>{errors[key].message}</p>}
      </div>
    );
  }

  if (schema instanceof z.ZodNumber) {
    return (
      <div key={key}>
        <label>{key}</label>
        <input type="number" {...register(key)} />
        {errors[key] && <p>{errors[key].message}</p>}
      </div>
    );
  }


  // Обработка булевых значений
  if (schema instanceof z.ZodBoolean) {
    return (
      <div key={key}>
        <label>{key}</label>
        <input type="checkbox" {...register(key)} />
        {errors[key] && <p>{errors[key].message}</p>}
      </div>
    );
  }

  if (schema instanceof z.ZodEnum) {
    return (
      <div key={key}>
        <label>{key}</label>
        <select {...register(key)}>
          {schema.options.map((option: string) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
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
      <div key={key}>
        <label>{key} (Array)</label>
        {fields.map((item, index) => (
          <div key={item.id} style={{ marginBottom: "10px" }}>
            {renderFormElement(
              `${key}.${index}`,
              schema.element,
              register,
              errors,
              control,
              setValue,
              trigger
            )}
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => append({})}>
          Add
        </button>
      </div>
    );
  }

  if (schema instanceof z.ZodObject) {
    return (
      <div key={key} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
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
              trigger
            )
          )}
        </fieldset>
      </div>
    );
  }

  return null;
};

export type GeneratorMainProps = {
  schema: z.ZodObject<any>
}
type FormGeneratorProviderProps<T> = {
  children: ReactNode,
  defaultValues: Partial<Record<any, any>>,
  onChange: (values: Partial<Record<any, any>>) => void,
  onResult?: (state: any) => void,
  serverAction: (prevState: T, formData: FormData) => T | Promise<T>;
} & GeneratorMainProps

export const FormGeneratorProvider = ({ onResult, onChange, serverAction, schema, children, defaultValues }: FormGeneratorProviderProps<any>) => {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
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

  const watchedValues = watch();


  useEffect(() => {
    onChange(watchedValues)
  }, [watchedValues])

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
};

export const FormGeneratorBody = ({ schema }: GeneratorMainProps) => {
  const form = useFormContext<z.infer<typeof schema>>()
  const fields = Object.entries(schema.shape).map(([key, subSchema]) =>
    renderFormElement(key, subSchema as ZodTypeAny, form.register, form.formState.errors, form.control, form.setValue, form.trigger)
  );
  return fields
}

export const FormGeneratorControls = ({ schema }: GeneratorMainProps) => {
  const form = useFormContext<z.infer<typeof schema>>()
  const { pending } = useFormStatus()
  const errors = Object.values(form.formState.errors)

  return <div className="mt-3">
    <Button disabled={pending || errors.length > 0} type="submit">Сгенерировать</Button>
  </div>
}

