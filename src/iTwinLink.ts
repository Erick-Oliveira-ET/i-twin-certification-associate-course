/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { UiFramework } from "@itwin/appui-react";
import { Id64String } from "@itwin/core-bentley";
import { QueryRowFormat } from "@itwin/core-common";
import { IModelConnection } from "@itwin/core-frontend";

export interface Pipeline {
  id: Id64String;
  pipes: Id64String[];
}

export class ITwinLink {
  private static pipelines: Pipeline[];

  public static getPipelines = async (
    iModel: IModelConnection
  ): Promise<Pipeline[]> => {
    let pipelines = ITwinLink.pipelines;

    if (!pipelines) {
      pipelines = [];

      /* In the Open_Plant_3d schema - The actual pipe geometry of a Pipeline (Piping_Network_System) 
            is stored as Piping_Components. Piping_Components are children of Pipe_Network_Segments, 
            which are children of the Pipeline component.

                (Piping_Network_System (Pipeline) --> Piping_Network_Segments --> Piping_Components)

            So the way to get the geometry of a Pipeline is to traverse down these relationships
            and get all the related Piping_Components. That's what we are doing in the query below.*/

      const query = `SELECT pipeline.SourceECInstanceId, pipeGeometry.TargetECInstanceId
                FROM Bis.ElementOwnsChildElements pipeGeometry
                JOIN Bis.ElementOwnsChildElements pipe
                ON pipe.TargetECInstanceId = pipeGeometry.SourceECinstanceId
                JOIN ProcessPhysical.PIPING_NETWORK_SYSTEM segment 
                ON segment.TargetECInstanceId = pipe.SourceECInstanceId
                JOIN ProcessPhysical.PIPING_NETWORK_SEGMENT pipeline 
                ON pipeline.TargetECInstanceId = segment.SourceECInstanceId`;

      for await (const row of UiFramework.getIModelConnection()!.createQueryReader(
        query,
        undefined,
        {
          rowFormat: QueryRowFormat.UseJsPropertyNames,
        }
      )) {
        if (!pipelines.some((pipeline) => pipeline.id === row[0]))
          pipelines.push({ id: row[0], pipes: [] });
        pipelines
          .find((pipeline) => pipeline.id === row[0])
          ?.pipes.push(row[1]);
      }
    }

    ITwinLink.pipelines = pipelines;

    return pipelines;
  };
}
