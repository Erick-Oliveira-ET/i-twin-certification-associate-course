import { CommonToolbarItem, ToolbarItemUtilities } from "@itwin/appui-abstract";
import {
  StagePanelLocation,
  StagePanelSection,
  StageUsage,
  ToolbarOrientation,
  ToolbarUsage,
  UiItemsProvider,
  Widget,
} from "@itwin/appui-react";
import { Visualization } from "../Visualization";
import { IModelApp } from "@itwin/core-frontend";
import { SmartDeviceListWidgetComponent } from "../components/widgets/SmartDeviceListWidgetComponent";

export class SmartDeviceUiItemsProvider implements UiItemsProvider {
  public readonly id = "SmartDeviceUiProvider";
  private _toggleWalls: boolean = false;

  public static smartDeviceData: any;

  public provideToolbarItems(
    stageId: string,
    stageUsage: string,
    toolbarUsage: ToolbarUsage,
    toolbarOrientation: ToolbarOrientation
  ): CommonToolbarItem[] {
    const toolbarButtonItems: CommonToolbarItem[] = [];
    if (
      stageUsage === StageUsage.General &&
      toolbarUsage === ToolbarUsage.ContentManipulation &&
      toolbarOrientation === ToolbarOrientation.Vertical
    ) {
      const toggleWallsButton = ToolbarItemUtilities.createActionButton(
        "ToggleWalls",
        1000,
        "icon-element",
        "Toggle walls tool",
        () => {
          this._toggleWalls = !this._toggleWalls;
          Visualization.hideHouseExterior(
            IModelApp.viewManager.selectedView!,
            this._toggleWalls
          );
        }
      );

      toolbarButtonItems.push(toggleWallsButton);
    }
    return toolbarButtonItems;
  }

  public provideWidgets(
    stageId: string,
    stageUsage: string,
    location: StagePanelLocation,
    section?: StagePanelSection | undefined
  ): ReadonlyArray<Widget> {
    const widgets: Widget[] = [];

    if (
      stageId === "iTwinViewer.DefaultFrontstage" &&
      location === StagePanelLocation.Right
    ) {
      const widget: Widget = {
        id: "smartDeviceListWidget",
        label: "Smart Devices",
        content: <SmartDeviceListWidgetComponent />,
      };

      widgets.push(widget);
    }

    return widgets;
  }
}
