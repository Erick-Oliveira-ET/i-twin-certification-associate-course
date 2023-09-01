import { IModelApp } from "@itwin/core-frontend";
import {
  ParamsToGetTemplateList,
  PropertyValidationClient,
  RuleTemplate,
} from "@itwin/property-validation-client";

export default class ValidationLink {
  private static client = new PropertyValidationClient();
  // Creating rules
  public static async getTemplates(): Promise<RuleTemplate[]> {
    const params: ParamsToGetTemplateList = {
      accessToken: await IModelApp.authorizationClient?.getAccessToken(),
      urlParams: {
        projectId: process.env.IMJS_ITWIN_ID!,
      },
    };

    const iterator = ValidationLink.client.templates.getList(params);

    const ruleTemplates = [];
    for await (const ruleTemplate of iterator) ruleTemplates.push(ruleTemplate);

    return ruleTemplates;
  }
}
