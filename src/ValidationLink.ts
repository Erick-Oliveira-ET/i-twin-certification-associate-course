import { IModelApp } from "@itwin/core-frontend";
import {
  ParamsToCreateRule,
  ParamsToGetTemplateList,
  PropertyValidationClient,
  Rule,
  RuleTemplate,
} from "@itwin/property-validation-client";

export default class ValidationLink {
  private static client = new PropertyValidationClient(undefined, () =>
    ValidationLink.getAccessToken()
  );

  private static async getAccessToken(): Promise<string> {
    if (!IModelApp.authorizationClient)
      throw new Error(
        "Auth client is not defined. Most likely the iModelApp.startup was not called."
      );

    return IModelApp.authorizationClient.getAccessToken();
  }

  // Creating rules
  // Tmplates are used to create rules (use the template id)
  public static async getTemplates(): Promise<RuleTemplate[]> {
    const params: ParamsToGetTemplateList = {
      accessToken: await ValidationLink.getAccessToken(),
      urlParams: {
        projectId: process.env.IMJS_ITWIN_ID!,
      },
    };

    const iterator = ValidationLink.client.templates.getList(params);

    const ruleTemplates = [];
    for await (const ruleTemplate of iterator) ruleTemplates.push(ruleTemplate);

    return ruleTemplates;
  }

  public static async createPipeValidationRule(
    insulationLow: number,
    insulationHigh: number,
    tempLow: number,
    tempHigh: number,
    material: { label: string; value: string }
  ): Promise<Rule> {
    const templates = await ValidationLink.getTemplates();
    const template = templates.filter(
      (template) => template.displayName === "PropertyValueRange"
    )[0];

    const ruleName = `${material.label} | Temperature: ${tempLow} - ${tempHigh} | Insulation: ${insulationLow} | ${insulationLow}`;
    const ruleDetails = { insulationLow, insulationHigh, tempLow, tempHigh };

    const params: ParamsToCreateRule = {
      displayName: ruleName,
      description: JSON.stringify(ruleDetails),
      templateId: template.id,
      severity: "high",
      ecSchema: "OpenPlant_3D",
      ecClass: "PIPING_NETWORK_SYSTEM",
      whereClause: `NORMAL_OPERATING_TEMPERATURE < ${tempHigh} AND NORMAL_OPERATING_TEMPERATURE>${tempLow}`,
      dataType: "property",
      functionParameters: {
        lowerBound: `${insulationHigh}`,
        upperBound: `${insulationLow}`,
        propertyName: "INSULATION_THICKNESS",
      },
    };

    return ValidationLink.client.rules.create(params);
  }
}
