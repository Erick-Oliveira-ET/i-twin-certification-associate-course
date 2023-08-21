import { CommonToolbarItem, ToolbarItemUtilities } from "@itwin/appui-abstract";
import {
  StageUsage,
  ToolbarOrientation,
  ToolbarUsage,
  UiItemsProvider,
} from "@itwin/appui-react";
import { Visualization } from "../Visualization";
import { IModelApp } from "@itwin/core-frontend";

export class SmartDeviceUiItemsProvider implements UiItemsProvider {
  public readonly id = "SmartDeviceUiProvider";
  private _toggleWalls: boolean = false;

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
}
