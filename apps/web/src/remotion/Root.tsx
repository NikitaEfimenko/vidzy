'use client'
import { Composition } from "remotion";
import * as SimplePreview from "./scenes/simple-preview" 

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={SimplePreview.compositionName}
        component={SimplePreview.SimplePreview}
        {...SimplePreview.config}
        schema={SimplePreview.SimplePreviewSchema}
        defaultProps={{
          "count": "5"
        }}
      />
    </>
  );
};
