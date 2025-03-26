'use client'

import React, { useEffect, useState } from "react";
import * as UpdateForm from "./update-form"
import { WorkflowModelType } from "@/entities/workflow/dto/model";
import { useWorkflowEditor } from "@/app/processes/render-flow-builder/services";

export const SaveWorkflowCTA = React.memo(({
  workflowId
}: {
  workflowId: WorkflowModelType["id"]
}) => {
  const service = useWorkflowEditor()
  const [flowData, setFlowData] = useState(() => service.flowInstance?.toObject());

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newFlowData = service.flowInstance.toObject();
      setFlowData(newFlowData);
    }, 3000);

    return () => clearInterval(intervalId); // Очистка интервала при размонтировании
  }, [service.flowInstance]);


  return <UpdateForm.UpdateWorkflowFormProvider workflowId={workflowId} defaultValues={{
    flowData
  }}
  >
    <UpdateForm.UpdateWorkflowFormControls />
  </UpdateForm.UpdateWorkflowFormProvider>
})
