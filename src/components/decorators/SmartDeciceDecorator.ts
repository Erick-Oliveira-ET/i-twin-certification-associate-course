import {
  Decorator,
  IModelConnection,
  Marker,
  ScreenViewport,
  DecorateContext,
} from "@itwin/core-frontend";
import { QueryRowFormat } from "@itwin/core-common";

export class SmartDeviceDecorator implements Decorator {
  private _iModel: IModelConnection;
  private _markerSet: Marker[];

  constructor(vp: ScreenViewport) {
    this._iModel = vp.iModel;
    this._markerSet = [];
    this.addMarkers();
  }

  private async getSmartDeviceData() {
    const query = `SELECT  SmartDeviceId, Origin 
                            FROM DgnCustomItemTypes_HouseSchema.SmartDevice 
                            WHERE Origin IS NOT NULL`;

    const result = this._iModel.createQueryReader(query, undefined, {
      rowFormat: QueryRowFormat.UseJsPropertyNames,
    });

    return await result.toArray();
  }

  private async addMarkers() {
    const values = await this.getSmartDeviceData();

    values.forEach((value) => {
      const smartDeviceMarker = new Marker(
        { x: value.origin.x, y: value.origin.y, z: value.origin.z },
        { x: 50, y: 50 }
      );

      const htmlElement = document.createElement("div");
      htmlElement.innerHTML = `<h3>${value.smartDeviceId}</h3>`;
      smartDeviceMarker.htmlElement = htmlElement;

      this._markerSet.push(smartDeviceMarker);
    });
  }

  public decorate(context: DecorateContext): void {
    this._markerSet.forEach((marker) => {
      marker.addDecoration(context);
    });
  }
}
