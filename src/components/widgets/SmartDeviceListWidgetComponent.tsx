import { useEffect, useState } from "react";
import { SmartDeviceDecorator } from "../decorators/SmartDeciceDecorator";
import { IModelApp, StandardViewId } from "@itwin/core-frontend";

export function SmartDeviceListWidgetComponent() {
  const [smartTableList, setSmartTableList] = useState<JSX.Element[]>([]);
  useEffect(() => {
    (async () => {
      const values = await SmartDeviceDecorator.getSmartDeviceData();
      const tableList: JSX.Element[] = [];

      values.forEach((value) => {
        tableList.push(
          <tr
            key={value.id}
            onClick={() => {
              IModelApp.viewManager.selectedView!.zoomToElements(value.id, {
                animateFrustumChange: true,
                standardViewId: StandardViewId.RightIso,
              });
            }}
          >
            <th>{value.smartDeviceType}</th>
            <th>{value.smartDeviceId}</th>
          </tr>
        );
      });
      setSmartTableList(tableList);
    })();
  }, []);

  return (
    <table className="smart-table">
      <tbody>
        <tr>
          <th>SmartDeviceType</th>
          <th>SmartDeviceId</th>
        </tr>
        {smartTableList}
      </tbody>
    </table>
  );
}
