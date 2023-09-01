/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import "./App.scss";

import type { IModelConnection, ScreenViewport } from "@itwin/core-frontend";
import { FitViewTool, IModelApp, StandardViewId } from "@itwin/core-frontend";
import { FillCentered } from "@itwin/core-react";
import { ProgressLinear } from "@itwin/itwinui-react";
import {
  MeasurementActionToolbar,
  MeasureTools,
  MeasureToolsUiItemsProvider,
} from "@itwin/measure-tools-react";
import {
  AncestorsNavigationControls,
  CopyPropertyTextContextMenuItem,
  PropertyGridManager,
  PropertyGridUiItemsProvider,
  ShowHideNullValuesSettingsMenuItem,
} from "@itwin/property-grid-react";
import {
  TreeWidget,
  TreeWidgetUiItemsProvider,
} from "@itwin/tree-widget-react";
import {
  useAccessToken,
  Viewer,
  ViewerContentToolsProvider,
  ViewerNavigationToolsProvider,
  ViewerPerformance,
  ViewerStatusbarItemsProvider,
} from "@itwin/web-viewer-react";
import { DisplayStyleSettingsProps } from "@itwin/core-common";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Auth } from "./Auth";
import { history } from "./history";
import { Visualization } from "./Visualization";
import { SmartDeviceDecorator } from "./components/decorators/SmartDeciceDecorator";
import { SmartDeviceUiItemsProvider } from "./providers/SmartDeviceUiItemsProviders";
import { ProjectsProvider } from "./providers/ProjectsProvider";
import ValidationLink from "./ValidationLink";

const App: React.FC = () => {
  const [iModelId, setIModelId] = useState<string | undefined>(undefined);
  const [iTwinId, setITwinId] = useState<string | undefined>(undefined);
  const [changesetId, setChangesetId] = useState(
    process.env.IMJS_AUTH_CLIENT_CHANGESET_ID
  );

  const accessToken = useAccessToken();

  const authClient = Auth.getClient();

  const login = useCallback(async () => {
    try {
      await authClient.signInSilent();
    } catch {
      await authClient.signIn();
    }
  }, [authClient]);

  useEffect(() => {
    void login();
  }, [login]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("iTwinId")) {
      setITwinId(urlParams.get("iTwinId") as string);
    }
    if (urlParams.has("iModelId")) {
      setIModelId(urlParams.get("iModelId") as string);
    }
    if (urlParams.has("changesetId")) {
      setChangesetId(urlParams.get("changesetId") as string);
    }
  }, []);

  useEffect(() => {
    let url = `viewer?iTwinId=${process.env.IMJS_ITWIN_ID}`;
    if (iTwinId) url = `viewer?iTwinId=${iTwinId}`;

    if (iModelId) {
      url = `${url}&iModelId=${iModelId}`;
    }

    if (changesetId) {
      url = `${url}&changesetId=${changesetId}`;
    }
    history.push(url);
  }, [iTwinId, iModelId, changesetId]);

  /** NOTE: This function will execute the "Fit View" tool after the iModel is loaded into the Viewer.
   * This will provide an "optimal" view of the model. However, it will override any default views that are
   * stored in the iModel. Delete this function and the prop that it is passed to if you prefer
   * to honor default views when they are present instead (the Viewer will still apply a similar function to iModels that do not have a default view).
   */
  const viewConfiguration = useCallback((viewPort: ScreenViewport) => {
    // default execute the fitview tool and use the iso standard view after tile trees are loaded
    const tileTreesLoaded = () => {
      return new Promise((resolve, reject) => {
        const start = new Date();
        const intvl = setInterval(() => {
          if (viewPort.areAllTileTreesLoaded) {
            ViewerPerformance.addMark("TilesLoaded");
            ViewerPerformance.addMeasure(
              "TileTreesLoaded",
              "ViewerStarting",
              "TilesLoaded"
            );
            clearInterval(intvl);
            resolve(true);
          }
          const now = new Date();
          // after 20 seconds, stop waiting and fit the view
          if (now.getTime() - start.getTime() > 20000) {
            reject();
          }
        }, 100);
      });
    };

    tileTreesLoaded().finally(() => {
      void IModelApp.tools.run(FitViewTool.toolId, viewPort, true, false);
      viewPort.view.setStandardRotation(StandardViewId.Iso);
    });
  }, []);

  const viewCreatorOptions = useMemo(
    () => ({ viewportConfigurer: viewConfiguration }),
    [viewConfiguration]
  );

  const onIModelAppInit = useCallback(async () => {
    // iModel now initialized
    await TreeWidget.initialize();
    await PropertyGridManager.initialize();
    await MeasureTools.startup();
    MeasurementActionToolbar.setDefaultActionProvider();
    console.log(await ValidationLink.getTemplates());
  }, []);

  const onIModelConnected = (_imodel: IModelConnection) => {
    if (iModelId === process.env.IMJS_IMODEL_SMART_HOUSE_ID) {
      IModelApp.viewManager.onViewOpen.addOnce(async (vp: ScreenViewport) => {
        const viewStyle: DisplayStyleSettingsProps = {
          viewflags: {
            visEdges: false,
            shadows: true,
          },
        };

        vp.overrideDisplayStyle(viewStyle);

        Visualization.hideHouseExterior(vp);

        IModelApp.viewManager.addDecorator(new SmartDeviceDecorator(vp));
      });
    }
  };

  const getProviders = () => {
    let providers: any = [
      new ViewerNavigationToolsProvider(),
      new ViewerContentToolsProvider({
        vertical: {
          measureGroup: false,
        },
      }),
      new ViewerStatusbarItemsProvider(),
      new TreeWidgetUiItemsProvider(),
      new PropertyGridUiItemsProvider({
        propertyGridProps: {
          autoExpandChildCategories: true,
          ancestorsNavigationControls: (props) => (
            <AncestorsNavigationControls {...props} />
          ),
          contextMenuItems: [
            (props) => <CopyPropertyTextContextMenuItem {...props} />,
          ],
          settingsMenuItems: [
            (props) => (
              <ShowHideNullValuesSettingsMenuItem {...props} persist={true} />
            ),
          ],
        },
      }),
      new MeasureToolsUiItemsProvider(),
      new ProjectsProvider(),
    ];

    if (iModelId === process.env.IMJS_IMODEL_SMART_HOUSE_ID) {
      providers = providers.concat([new SmartDeviceUiItemsProvider()]);
    }

    return providers;
  };

  return (
    <div className="viewer-container">
      {!accessToken && (
        <FillCentered>
          <div className="signin-content">
            <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
          </div>
        </FillCentered>
      )}
      <Viewer
        iTwinId={iTwinId ?? (process.env.IMJS_ITWIN_ID as string)}
        iModelId={
          iModelId ?? (process.env.IMJS_IMODEL_SMART_HOUSE_ID as string)
        }
        changeSetId={changesetId}
        authClient={authClient}
        viewCreatorOptions={viewCreatorOptions}
        enablePerformanceMonitors={true} // see description in the README (https://www.npmjs.com/package/@itwin/web-viewer-react)
        onIModelAppInit={onIModelAppInit}
        onIModelConnected={onIModelConnected}
        uiProviders={getProviders()}
      />
    </div>
  );
};

export default App;
