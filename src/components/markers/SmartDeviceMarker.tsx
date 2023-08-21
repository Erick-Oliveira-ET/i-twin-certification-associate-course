import { Marker } from "@itwin/core-frontend";
import { XAndY, XYAndZ } from "@itwin/core-geometry";

export class SmartDeviceMarker extends Marker {
  private _smartDeviceId: string;
  private _smartDeviceType: string;

  constructor(
    location: XYAndZ,
    size: XAndY,
    smartDeviceId: string,
    smartDeviceType: string,
    cloudData: any
  ) {
    super(location, size);
    this._smartDeviceId = smartDeviceId;
    this._smartDeviceType = smartDeviceType;

    this.setImageUrl(`/${this._smartDeviceType}.png`);
    this.title = this.populateTitle(cloudData);
  }

  private populateTitle(cloudData: any) {
    let smartTable = "";
    Object.entries(cloudData).forEach(([key, value]) => {
      smartTable += `
                <tr>
                    <th>${key}</th>
                    <th>${value}</th>
                </tr>
            `;
    });

    const smartTableDiv = document.createElement("div");
    smartTableDiv.className = " smart-table";

    smartTableDiv.innerHTML = `
            <h3>${this._smartDeviceId}</h3>
            <table>
                ${smartTable}
            </table>
        `;
    return smartTableDiv;
  }
}
