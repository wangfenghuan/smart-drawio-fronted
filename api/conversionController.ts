// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 分页查询某个图表的对话历史 GET /conversion/diagram/${param0} */
export async function listDiagramChatHistory(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listDiagramChatHistoryParams,
  options?: { [key: string]: any }
) {
  const { diagramId: param0, ...queryParams } = params;
  return request<API.BaseResponsePageConversion>(
    `/conversion/diagram/${param0}`,
    {
      method: "GET",
      params: {
        // pageSize has a default value: 10
        pageSize: "10",
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}
