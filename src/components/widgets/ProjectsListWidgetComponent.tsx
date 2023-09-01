import { useCallback, useEffect, useState } from "react";
import { useAccessToken } from "@itwin/web-viewer-react";

export function ProjectsListWidgetComponent() {
  const [projects, setProjectData] = useState<any[] | undefined>([]);

  const accessToken = useAccessToken();

  const getProjects = useCallback(async () => {
    if (accessToken && process.env.IMJS_ITWIN_ID) {
      const resp = await fetch(
        `https://api.bentley.com/imodels/?iTwinId=${process.env.IMJS_ITWIN_ID}`,
        {
          method: "Get",
          headers: {
            Authorization: accessToken,
            Accept: "application/vnd.bentley.itwin-platform.v2+json",
            return: "return=minimal",
          },
        }
      );
      if (resp.ok) {
        setProjectData((await resp.json())?.iModels);
      }
    }
  }, [accessToken]);

  useEffect(() => {
    void getProjects();
  }, [accessToken]);

  return (
    <>
      <h1>iTwins</h1>
      <table className="smart-table">
        <tbody>
          <tr>
            <th>Name</th>
            <th>Id</th>
          </tr>
          {projects?.map((item) => {
            return (
              <tr key={item.id}>
                <a
                  href={`/viewer?iTwinId=${process.env.IMJS_ITWIN_ID}&iModelId=${item.id}`}
                >
                  <th>{item.displayName} </th>
                  <th>{item.id} </th>
                </a>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}