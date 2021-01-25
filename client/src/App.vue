<template>
  <ag-grid-vue
    style="width: 800px; height: 500px"
    class="ag-theme-alpine"
    :gridOptions="gridOptions"
    @grid-ready="onGridReady"
  >
  </ag-grid-vue>
</template>

<script>
import { AgGridVue } from "ag-grid-vue";
import FileCellRenderer from "./components/FileCellRenderer";

import "ag-grid-enterprise";

import ServerSideDatasource from "./ServerSideDatasource";

export default {
  name: "App",
  data() {
    return {
      serverSideDatasource: null,
      gridApi: null,
      columnApi: null,
      gridOptions: {},
      expandedNodes: {},
    };
  },
  components: {
    AgGridVue,
    FileCellRenderer,
  },
  beforeMount() {
    this.serverSideDatasource = new ServerSideDatasource();

    this.gridOptions = {
      columnDefs: [
        // {
        //   field: "folder",
        //   cellRenderer: "agGroupCellRenderer",
        // },
        {
          field: "dateModified",
          comparator: (d1, d2) => {
            return new Date(d1).getTime() < new Date(d2).getTime() ? -1 : 1;
          },
        },
        {
          field: "size",
          aggFunc: "sum",
          valueFormatter: function (params) {
            return params.value
              ? Math.round(params.value * 10) / 10 + " MB"
              : "0 MB";
          },
        },
      ],
      defaultColDef: {
        width: 240,
        resizable: true,
        sortable: true,
        floatingFilter: true,
      },
      // groupSuppressAutoColumn: true,
      autoGroupColumnDef: {
        cellRendererParams: {
          innerRendererFramework: "FileCellRenderer",
          // innerRenderer: (params) => params.data.folder,
        },
        filter: true,
        filterParams: {
          values: (params) => {
            const { success } = params;
            this.serverSideDatasource
              .getFilterValues("folder")
              .then((values) => {
                console.log("filter values", values);
                success(values);
              });
          },
        },
      },
      animateRows: true,
      rowModelType: "serverSide",
      treeData: true,
      isServerSideGroup: (dataItem) => dataItem.isGroup,
      getServerSideGroupKey: (dataItem) => dataItem._id,
      getRowNodeId: (data) => data._id,
    };
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;

      params.api.sizeColumnsToFit();

      params.api.setServerSideDatasource(this.serverSideDatasource);
    },
    // onRowGroupOpened(params) {
    //   let nodeId = params.node.id;
    //   let nodeUiLevel = params.node.uiLevel;
    //   let expandedNodes = this.expandedNodes;

    //   if (params.node.expanded) {
    //     if (!expandedNodes[nodeUiLevel]) {
    //       expandedNodes[nodeUiLevel] = new Set();
    //     }
    //     expandedNodes[nodeUiLevel].add(nodeId);
    //   } else {
    //     expandedNodes[nodeUiLevel].delete(nodeId);
    //   }
    // },
    // onFilterChanged(params) {
    //   this.restoreExpandedGroups();
    // },
    // restoreExpandedGroups() {
    //   let expandedNodes = this.expandedNodes;
    //   console.log("expanded nodes before", expandedNodes);

    //   // let restoreGroupsInt = setInterval(() => {
    //   //   if (isGroupsRestored()) {
    //   //     clearInterval(restoreGroupsInt);
    //   //   } else {
    //   //     restoreGroups();
    //   //   }
    //   // }, 1000);

    //   Object.entries(expandedNodes).forEach(([uiLevel, nodeSet]) => {
    //     setTimeout(() => {
    //       console.log("uiLevel", uiLevel);
    //       for (const nodeId of nodeSet) {
    //         console.log("nodeId", nodeId);
    //         const rowNode = this.gridApi.getRowNode(nodeId);
    //         if (rowNode) {
    //           console.log(rowNode.data);
    //           rowNode.setExpanded(true);
    //         }
    //       }
    //     }, 2000 + uiLevel * 1000);
    //   });
    // },
  },
};
</script>

<style lang="scss">
@import "../node_modules/ag-grid-community/dist/styles/ag-grid.css";
@import "../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css";
</style>