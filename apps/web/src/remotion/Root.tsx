'use client'
import { CalculateMetadataFunction, Composition } from "remotion";
import { scenes } from "./scenes";
import { z } from "zod";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {scenes.map((scenas) => <Composition<typeof scenas.schema, z.infer<typeof scenas.schema>>
        {...scenas.config}
        id={scenas.compositionName}
        component={scenas.composition as (props: z.infer<typeof scenas.schema>) => JSX.Element}
        schema={scenas.schema}
        defaultProps={scenas.initInputProps}
        calculateMetadata={scenas.calculateMetadata as CalculateMetadataFunction<z.infer<typeof scenas.schema>>}
      />)}
    </>
  );
};
