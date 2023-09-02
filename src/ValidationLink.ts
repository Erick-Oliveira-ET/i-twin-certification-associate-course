import { IModelApp } from "@itwin/core-frontend";
import {
  ParamsToCreateRule,
  ParamsToCreateTest,
  ParamsToGetResult,
  ParamsToGetRuleList,
  ParamsToGetRun,
  ParamsToGetRunList,
  ParamsToGetTemplateList,
  ParamsToGetTestList,
  ParamsToRunTest,
  PropertyValidationClient,
  ResponseFromGetResult,
  Rule,
  RuleDetails,
  RuleTemplate,
  Run,
  RunDetails,
  Test,
  TestItem,
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
    const ruleDetails = {
      material,
      insulationLow,
      insulationHigh,
      tempLow,
      tempHigh,
    };

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

  public static async getRules(): Promise<RuleDetails[]> {
    const params: ParamsToGetRuleList = {
      urlParams: {
        projectId: process.env.IMJS_ITWIN_ID!,
      },
    };

    const iterator = ValidationLink.client.rules.getRepresentationList(params);

    const rules = [];
    for await (const rule of iterator) rules.push(rule);

    return rules;
  }

  public static async createTest(
    testName: string,
    description: string,
    ruleIds: string[]
  ): Promise<Test> {
    const params: ParamsToCreateTest = {
      projectId: process.env.IMJS_ITWIN_ID!,
      displayName: testName,
      description: description,
      rules: ruleIds,
      stopExecutionOnFailure: false,
    };
    return ValidationLink.client.tests.create(params);
  }

  // Get all tests for a given iTwin.
  public static async getTests(): Promise<TestItem[]> {
    const params: ParamsToGetTestList = {
      urlParams: {
        projectId: process.env.IMJS_ITWIN_ID!,
      },
    };

    const iterator = ValidationLink.client.tests.getList(params);
    const tests = [];
    for await (const test of iterator) tests.push(test);

    return tests;
  }

  public static async runTest(testId: string): Promise<Run | undefined> {
    const params: ParamsToRunTest = {
      testId,
      iModelId: process.env.IMJS_IMODEL_ID!,
    };

    return ValidationLink.client.tests.runTest(params);
  }

  // Get all runs for a given iTwin.
  public static async getRuns(): Promise<RunDetails[]> {
    const params: ParamsToGetRunList = {
      urlParams: {
        projectId: process.env.IMJS_ITWIN_ID!,
      },
    };

    const iterator = await ValidationLink.client.runs.getRepresentationList(
      params
    );
    const runs = [];
    for await (const run of iterator) runs.push(run);

    return runs;
  }

  public static async getRun(runId: string): Promise<RunDetails> {
    const params: ParamsToGetRun = {
      runId,
    };

    return ValidationLink.client.runs.getSingle(params);
  }

  // Get results for a given result id.
  public static async getResult(
    resultId: string
  ): Promise<ResponseFromGetResult> {
    const params: ParamsToGetResult = {
      resultId,
    };

    return ValidationLink.client.results.get(params);
  }
}
