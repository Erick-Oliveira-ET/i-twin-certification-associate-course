import {
  Decorator,
  IModelConnection,
  Marker,
  ScreenViewport,
  DecorateContext,
} from "@itwin/core-frontend";
import { QueryRowFormat } from "@itwin/core-common";
import { SmartDeviceMarker } from "../markers/SmartDeviceMarker";
import { SmartDeviceAPI } from "../../SmartDeviceAPI";

export class SmartDeviceDecorator implements Decorator {
  private _iModel: IModelConnection;
  private _markerSet: Marker[];

  constructor(vp: ScreenViewport) {
    this._iModel = vp.iModel;
    this._markerSet = [];
    this.addMarkers();
  }

  private async getSmartDeviceData() {
    const query = `SELECT  SmartDeviceId, SmartDeviceType, Origin 
                            FROM DgnCustomItemTypes_HouseSchema.SmartDevice 
                            WHERE Origin IS NOT NULL`;

    const result = this._iModel.createQueryReader(query, undefined, {
      rowFormat: QueryRowFormat.UseJsPropertyNames,
    });

    return await result.toArray();
  }

  private async addMarkers() {
    const values = await this.getSmartDeviceData();
    const cloudData = await SmartDeviceAPI.getData();

    values.forEach((value) => {
      const smartDeviceMarker = new SmartDeviceMarker(
        { x: value.origin.x, y: value.origin.y, z: value.origin.z },
        { x: 40, y: 40 },
        value.smartDeviceId,
        value.smartDeviceType,
        cloudData[value.smartDeviceId]
      );

      this._markerSet.push(smartDeviceMarker);
    });
  }

  public decorate(context: DecorateContext): void {
    this._markerSet.forEach((marker) => {
      marker.addDecoration(context);
    });
  }
}
