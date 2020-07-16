import * as React from 'react';
import { CubejsApi, Query, ResultSet, Filter, PivotConfig } from '@cubejs-client/core';

/**
 * @title @cubejs-client/react
 * @permalink /@cubejs-client-react
 * @menuCategory Cube.js Frontend
 * @subcategory Reference
 * @menuOrder 3
 * @description `@cubejs-client/react` provides React Components for easy Cube.js integration in a React app.
 */

declare module '@cubejs-client/react' {
  type CubeProviderVariables = {
    cubejsApi: CubejsApi;
    children: React.ReactNode;
  };

  /**
   * Cube.js context provider
   * ```js
   * import React from 'react';
   * import cubejs from '@cubejs-client/core';
   * import { CubeProvider } from '@cubejs-client/react';
   *
   * const API_URL = 'https://react-dashboard.cubecloudapp.dev';
   * const CUBEJS_TOKEN =
   *   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.* eyJpYXQiOjE1OTE3MDcxNDgsImV4cCI6MTU5NDI5OTE0OH0.* n5jGLQJ14igg6_Hri_Autx9qOIzVqp4oYxmX27V-4T4';
   *
   * const cubejsApi = cubejs(CUBEJS_TOKEN, {
   *   apiUrl: `${API_URL}/cubejs-api/v1`,
   * });
   *
   * export default function App() {
   *   return (
   *     <CubeProvider cubejsApi={cubejsApi}>
   *       //...
   *     </CubeProvider>
   *   )
   * }
   * ```
   * @stickyTypes
   * @order 10
   */
  export const CubeProvider: React.FC<CubeProviderVariables>;

  type TLoadingState = {
    isLoading: boolean;
  };

  type QueryRendererRenderProps = {
    resultSet: ResultSet | null;
    error: Error | null;
    loadingState: TLoadingState;
  };

  type QueryRendererProps = {
    /**
     * Analytic query. [Learn more about it's format](query-format)
     */
    query: Query;
    queries?: { [key: string]: Query };
    /**
     * Indicates whether the generated by `Cube.js` SQL Code should be requested. See [rest-api#sql](rest-api#api-reference-v-1-sql). When set to `only` then only the request to [/v1/sql](rest-api#api-reference-v-1-sql) will be performed. When set to `true` the sql request will be performed along with the query request. Will not be performed if set to `false`
     */
    loadSql?: 'only' | boolean;
    /**
     * When `true` the **resultSet** will be reset to `null` first on every state change
     */
    resetResultSetOnChange?: boolean;
    updateOnlyOnStateChange?: boolean;
    /**
     * `CubejsApi` instance to use
     */
    cubejsApi: CubejsApi;
    /**
     * Output of this function will be rendered by the `QueryRenderer`
     */
    render: (renderProps: QueryRendererRenderProps) => void;
  };

  /**
   * `<QueryRenderer />` a react component that accepts a query, fetches the given query, and uses the render prop to render the resulting data
   * @stickyTypes QueryRendererProps, QueryRendererRenderProps
   * @noInheritDoc
   */
  export class QueryRenderer extends React.Component<QueryRendererProps> {}

  type ChartType = 'line' | 'bar' | 'table' | 'area';

  type VizState = {
    [key: string]: any;
    pivotConfig?: PivotConfig;
    shouldApplyHeuristicOrder?: boolean;
    chartType?: ChartType;
  };

  type QueryBuilderProps = {
    /**
     * `CubejsApi` instance to use
     */
    cubejsApi: CubejsApi;
    /**
     * Default query
     */
    query?: Query;
    vizState?: VizState;
    /**
     * @default defaultChartType line
     */
    defaultChartType?: ChartType;
    /**
     * Defaults to `false`. This means that the default heuristics will be applied. For example: when the query is empty and you select a measure that has a default time dimension it will be pushed to the query.
     * @default disableHeuristics false
     */
    disableHeuristics?: boolean;
    wrapWithQueryRenderer?: boolean;
    render: (renderProps: QueryBuilderRenderProps) => React.ReactNode;
    /**
     * A function that accepts the `newState` just before it's applied. You can use it to override the **defaultHeuristics** or to tweak the query or the vizState in any way.
     */
    stateChangeHeuristics?: (state: QueryBuilderState) => QueryBuilderState;
    /**
     * Called by the `QueryBuilder` when the query state has changed. Use it when state is maintained outside of the `QueryBuilder` component.
     */
    setQuery?: (query: Query) => void;
    setVizState?: (vizState: VizState) => void;
  };

  type QueryBuilderState = VizState & {
    query?: Query;
  };

  type QueryBuilderRenderProps = {
    /**
     * Indicates whether the query is ready to be displayed or not
     */
    isQueryPresent: boolean;
    measures: string[];
    dimensions: string[];
    segments: string[];
    timeDimensions: Filter[];

    /**
     * An array of available measures to select. They are loaded via the API from Cube.js Backend.
     */
    availableMeasures: TAvailableMeasure[];
    /**
     * An array of available dimensions to select. They are loaded via the API from Cube.js Backend.
     */
    availableDimensions: TAvailableDimension[];
    /**
     * An array of available time dimensions to select. They are loaded via the API from Cube.js Backend.
     */
    availableTimeDimensions: TAvailableDimension[];
    /**
     * An array of available segments to select. They are loaded via the API from Cube.js Backend.
     */
    availableSegments: TMember[];

    updateMeasures: MemberUpdater;
    updateDimensions: MemberUpdater;
    updateSegments: MemberUpdater;
    updateTimeDimensions: MemberUpdater;
    /**
     * Used for partial of full query update
     */
    updateQuery: (query: Query) => void;
  };

  /**
   * `<QueryBuilder />` is used to build interactive analytics query builders. It abstracts state management and API calls to Cube.js Backend. It uses render prop technique and doesn’t render anything itself, but calls the render function instead.
   *
   * **Example**
   *
   * [Open in CodeSandbox](https://codesandbox.io/s/z6r7qj8wm)
   * ```js
   * import React from 'react';
   * import ReactDOM from 'react-dom';
   * import { Layout, Divider, Empty, Select } from 'antd';
   * import { QueryBuilder } from '@cubejs-client/react';
   * import cubejs from '@cubejs-client/core';
   * import 'antd/dist/antd.css';
   *
   * import ChartRenderer from './ChartRenderer';
   *
   * const cubejsApi = cubejs('YOUR-CUBEJS-API-TOKEN', {
   *   apiUrl: 'http://localhost:4000/cubejs-api/v1',
   * });
   *
   * const App = () => (
   *   <QueryBuilder
   *     query={{
   *       timeDimensions: [
   *         {
   *           dimension: 'LineItems.createdAt',
   *           granularity: 'month',
   *         },
   *       ],
   *     }}
   *     cubejsApi={cubejsApi}
   *     render={({ resultSet, measures, availableMeasures, updateMeasures }) => (
   *       <Layout.Content style={{ padding: '20px' }}>
   *         <Select
   *           mode="multiple"
   *           style={{ width: '100%' }}
   *           placeholder="Please select"
   *           onSelect={(measure) => updateMeasures.add(measure)}
   *           onDeselect={(measure) => updateMeasures.remove(measure)}
   *         >
   *           {availableMeasures.map((measure) => (
   *             <Select.Option key={measure.name} value={measure}>
   *               {measure.title}
   *             </Select.Option>
   *           ))}
   *         </Select>
   *         <Divider />
   *         {measures.length > 0 ? (
   *           <ChartRenderer resultSet={resultSet} />
   *         ) : (
   *           <Empty description="Select measure or dimension to get started" />
   *         )}
   *       </Layout.Content>
   *     )}
   *   />
   * );
   *
   * const rootElement = document.getElementById("root");
   * ReactDOM.render(<App />, rootElement);
   * ```
   * @stickyTypes QueryBuilderProps, QueryBuilderRenderProps, QueryBuilderState
   * @noInheritDoc
   * @order 2
   */
  export class QueryBuilder extends React.Component<QueryBuilderProps, QueryBuilderState> {}

  /**
   * A React hook for executing Cube.js queries
   * ```js
   * import React from 'react';
   * import { Table } from 'antd';
   * import { useCubeQuery }  from '@cubejs-client/react';
   *
   * export default function App() {
   *   const { resultSet, isLoading, error } = useCubeQuery({
   *     measures: ['Orders.count'],
   *     dimensions: ['Orders.createdAt.month'],
   *   });
   *
   *   if (isLoading) {
   *     return <div>Loading...</div>;
   *   }
   *
   *   if (error) {
   *     return <div>{error.toString()}</div>;
   *   }
   *
   *   if (!resultSet) {
   *     return null;
   *   }
   *
   *   const dataSource = resultSet.tablePivot();
   *   const columns = resultSet.tableColumns();
   *
   *   return <Table columns={columns} dataSource={dataSource} />;
   * }
   *
   * ```
   * @order 1
   * @stickyTypes
   */
  export function useCubeQuery<TData>(query: Query, options?: UseCubeQueryOptions): UseCubeQueryResult<TData>;

  type UseCubeQueryOptions = {
    /**
     * A `CubejsApi` instance to use. Taken from the context if the param is not passed
     */
    cubejsApi?: CubejsApi;
    /**
     * Query execution will be skipped when `skip` is set to `true`. You can use this flag to avoid sending incomplete queries.
     */
    skip?: boolean;
    /**
     * When `true` the resultSet will be reset to `null` first
     */
    subscribe?: boolean;
    resetResultSetOnChange?: boolean;
  };

  type UseCubeQueryResult<TData> = {
    error: Error | null;
    isLoading: boolean;
    resultSet: ResultSet<TData> | null;
  };

  /**
   * Checks whether the query is ready
   */
  export function isQueryPresent(query: Query): boolean;

  type TMember = {
    name: string;
    title: string;
    shortTitle: string;
  };

  type TMemberType = 'time' | 'number' | 'string' | 'boolean';

  type TAvailableMeasure = TMember & {
    type: TMemberType;
    drillMembers: string[];
    drillMembersGrouped: {
      measures: TMember[];
      dimensions: TMember[];
    };
  };

  type TAvailableDimension = TMember & {
    type: TMemberType;
    suggestFilterValues: boolean;
  };

  /**
   * You can use the following methods for member manipulaltion
   * ```js
   * <QueryBuilder
   *   // ...
   *   cubejsApi={cubejsApi}
   *   render={({
   *     // ...
   *     availableMeasures,
   *     updateMeasures,
   *   }) => {
   *     return (
   *       // ...
   *       <Select
   *         mode="multiple"
   *         placeholder="Please select"
   *         onSelect={(measure) => updateMeasures.add(measure)}
   *         onDeselect={(measure) => updateMeasures.remove(measure)}
   *       >
   *         {availableMeasures.map((measure) => (
   *           <Select.Option key={measure.name} value={measure}>
   *             {measure.title}
   *           </Select.Option>
   *         ))}
   *       </Select>
   *     );
   *   }}
   * />
   * ```
   *
   * NOTE: if you need to add or remove more than one member at a time you should use `updateQuery` prop of {@see QueryBuilderRenderProps}
   * ```js
   * <QueryBuilder
   *   // ...
   *   cubejsApi={cubejsApi}
   *   render={({
   *     // ...
   *     measures,
   *     updateMeasures,
   *     updateQuery,
   *   }) => {
   *     // ...
   *     return (
   *       <>
   *         // WRONG: This code will not work properly
   *         <button
   *           onClick={() =>
   *             measures.forEach((measure) => updateMeasures.remove(measure))
   *           }
   *         >
   *           Remove all
   *         </button>
   *
   *         // CORRECT: Using `updateQuery` for removing all measures
   *         <button
   *           onClick={() =>
   *             updateQuery({
   *               measures: [],
   *             })
   *           }
   *         >
   *           Remove all
   *         </button>
   *       </>
   *     );
   *   }}
   * />
   * ```
   */
  type MemberUpdater = {
    add: (member: TMember) => void;
    remove: (member: TMember) => void;
    update: (member: TMember, updateWith: TMember) => void;
  };
}
