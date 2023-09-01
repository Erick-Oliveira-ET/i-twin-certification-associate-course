import {
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  Widget,
} from "@itwin/appui-react";
import { ProjectsListWidgetComponent } from "../components/widgets/ProjectsListWidgetComponent";

export class ProjectsProvider implements UiItemsProvider {
  public readonly id = "ProjectsProvider";

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
        id: "projectsListWidget",
        label: "Projects",
        content: <ProjectsListWidgetComponent />,
      };

      widgets.push(widget);
    }

    return widgets;
  }
}
